import 'package:flutter_test/flutter_test.dart';
import 'package:maktech/config/api_config.dart';
import 'package:maktech/services/api_service.dart';

void main() {
  group('ApiService', () {
    test('reports uninitialized access cleanly', () {
      final api = ApiService();
      expect(api.get('/apps'), throwsA(isA<ApiException>()));
    });

    test('config exposes supabase endpoint', () {
      expect(ApiConfig.supabaseUrl, startsWith('https://'));
      expect(ApiConfig.supabaseAnonKey, isNotEmpty);
      expect(ApiConfig.timeout, const Duration(seconds: 30));
    });
  });
}
