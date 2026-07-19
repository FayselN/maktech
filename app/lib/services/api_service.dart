import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:connectivity_plus/connectivity_plus.dart';
import '../config/api_config.dart';
import '../utils/device_utils.dart';

enum ApiErrorType { noInternet, serverUnreachable, timeout, unknown }

class ApiException implements Exception {
  final ApiErrorType type;
  final String message;
  ApiException(this.type, this.message);

  @override
  String toString() => message;
}

class ApiService {
  final http.Client _client = http.Client();
  String? _deviceId;

  static final ApiService _instance = ApiService._();
  factory ApiService() => _instance;
  ApiService._();

  Future<void> init() async {
    _deviceId = await DeviceUtils.getDeviceId();
  }

  Map<String, String> get _headers {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (_deviceId != null) headers['X-Device-Id'] = _deviceId!;
    return headers;
  }

  Future<void> _checkConnectivity() async {
    final connectivityResults = await Connectivity().checkConnectivity();
    if (connectivityResults.contains(ConnectivityResult.none)) {
      throw ApiException(ApiErrorType.noInternet, 'No internet connection');
    }
  }

  Future<dynamic> _executeRequest(Future<http.Response> Function() requestFunc) async {
    await _checkConnectivity();
    try {
      final response = await requestFunc();
      return _handleResponse(response);
    } on SocketException {
      throw ApiException(ApiErrorType.serverUnreachable, 'Server unreachable');
    } on TimeoutException {
      throw ApiException(ApiErrorType.timeout, 'Request timed out');
    } on ApiException {
      rethrow;
    } catch (e) {
      throw ApiException(ApiErrorType.unknown, 'Something went wrong: $e');
    }
  }

  Future<dynamic> get(String path, {Map<String, String>? queryParams}) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}$path')
        .replace(queryParameters: queryParams);
    return _executeRequest(
      () => _client.get(uri, headers: _headers).timeout(ApiConfig.timeout),
    );
  }

  Future<dynamic> post(String path, {Map<String, dynamic>? body}) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}$path');
    return _executeRequest(
      () => _client.post(
        uri,
        headers: _headers,
        body: body != null ? jsonEncode(body) : null,
      ).timeout(ApiConfig.timeout),
    );
  }

  Future<dynamic> put(String path, {Map<String, dynamic>? body}) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}$path');
    return _executeRequest(
      () => _client.put(
        uri,
        headers: _headers,
        body: body != null ? jsonEncode(body) : null,
      ).timeout(ApiConfig.timeout),
    );
  }

  Future<dynamic> delete(String path) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}$path');
    return _executeRequest(
      () => _client.delete(uri, headers: _headers).timeout(ApiConfig.timeout),
    );
  }

  dynamic _handleResponse(http.Response response) {
    // Try parsing as JSON; catch HTML or other non-JSON responses gracefully
    dynamic body;
    try {
      body = jsonDecode(response.body);
    } on FormatException {
      throw ApiException(
        ApiErrorType.serverUnreachable,
        'Server returned an unexpected response (status ${response.statusCode}). '
        'The server may be starting up — please try again in a moment.',
      );
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }
    
    final errorMessage = (body is Map ? body['message'] ?? body['error'] : null) as String? ??
          'Request failed (${response.statusCode})';
          
    throw ApiException(
      ApiErrorType.unknown,
      errorMessage,
    );
  }
}
