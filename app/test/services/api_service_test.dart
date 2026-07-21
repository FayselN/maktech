import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:maktech/services/api_service.dart';
import 'package:maktech/config/api_config.dart';

void main() {
  group('ApiService error handling', () {
    late ApiService apiService;

    setUp(() {
      apiService = ApiService();
    });

    test('uses correct base URL', () {
      expect(ApiConfig.baseUrl, 'https://maktech.onrender.com/api');
      expect(ApiConfig.timeout, const Duration(seconds: 30));
    });
  });
}
