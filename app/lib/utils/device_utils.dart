import 'dart:math';
import 'package:shared_preferences/shared_preferences.dart';

class DeviceUtils {
  static const _key = 'device_id';
  static String? _cachedId;

  static Future<String> getDeviceId() async {
    if (_cachedId != null) return _cachedId!;

    final prefs = await SharedPreferences.getInstance();
    String? id = prefs.getString(_key);

    if (id == null) {
      final random = Random();
      id = '${DateTime.now().millisecondsSinceEpoch}-${random.nextInt(999999)}-${random.nextInt(999999)}';
      await prefs.setString(_key, id);
    }

    _cachedId = id;
    return id;
  }
}
