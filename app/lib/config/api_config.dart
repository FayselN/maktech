import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiConfig {
  // 🚀 Production URL — update this with your actual Render URL
  static const String _productionUrl = 'https://maktech.onrender.com/api/v1';

  static String get baseUrl {
    const envBaseUrl = String.fromEnvironment('BASE_URL');
    if (envBaseUrl.isNotEmpty) {
      return envBaseUrl;
    }

    if (kIsWeb) {
      return _productionUrl;
    }
    if (Platform.isAndroid) {
      // Use 10.0.2.2 for emulator, production URL for real device
      return _productionUrl;
    }
    return _productionUrl;
  }

  static const Duration timeout = Duration(seconds: 30);

  // Supabase backend (Data API + Auth). Keys are public anon keys.
  static const String _supabaseUrl = 'https://skazmwbfhtennqhszemm.supabase.co';
  static const String _supabaseAnonKey =
      String.fromEnvironment('SUPABASE_ANON_KEY',
          defaultValue:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYXptd2JmaHRlbm5xaHN6ZW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNDM0NDksImV4cCI6MjEwNzgxOTQ0OX0.ssYoOkF69RGU_qlc3CcXgV05V7p7mVKQ2TaeYtkmJwg');

  static String get supabaseUrl {
    const envUrl = String.fromEnvironment('SUPABASE_URL');
    if (envUrl.isNotEmpty) return envUrl;
    return _supabaseUrl;
  }

  static String get supabaseAnonKey {
    const envKey = String.fromEnvironment('SUPABASE_ANON_KEY');
    if (envKey.isNotEmpty) return envKey;
    return _supabaseAnonKey;
  }
}
