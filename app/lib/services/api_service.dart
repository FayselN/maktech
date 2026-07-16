import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../utils/device_utils.dart';

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

  Future<dynamic> get(String path, {Map<String, String>? queryParams}) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}$path')
        .replace(queryParameters: queryParams);
    final response = await _client.get(uri, headers: _headers)
        .timeout(ApiConfig.timeout);
    return _handleResponse(response);
  }

  Future<dynamic> post(String path, {Map<String, dynamic>? body}) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}$path');
    final response = await _client.post(uri, headers: _headers, body: jsonEncode(body))
        .timeout(ApiConfig.timeout);
    return _handleResponse(response);
  }

  Future<dynamic> put(String path, {Map<String, dynamic>? body}) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}$path');
    final response = await _client.put(uri, headers: _headers, body: jsonEncode(body))
        .timeout(ApiConfig.timeout);
    return _handleResponse(response);
  }

  Future<dynamic> delete(String path) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}$path');
    final response = await _client.delete(uri, headers: _headers)
        .timeout(ApiConfig.timeout);
    return _handleResponse(response);
  }

  dynamic _handleResponse(http.Response response) {
    // Try parsing as JSON; catch HTML or other non-JSON responses gracefully
    dynamic body;
    try {
      body = jsonDecode(response.body);
    } on FormatException {
      throw ApiException(
        'Server returned an unexpected response (status ${response.statusCode}). '
        'The server may be starting up — please try again in a moment.',
      );
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }
    throw ApiException(
      (body is Map ? body['message'] ?? body['error'] : null) as String? ??
          'Request failed (${response.statusCode})',
    );
  }
}

class ApiException implements Exception {
  final String message;
  ApiException(this.message);
  @override
  String toString() => message;
}
