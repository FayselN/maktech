import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiConfig {
  // 🚀 Production URL — update this with your actual Render URL
  static const String _productionUrl = 'https://maktech.onrender.com/api';

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
}
