import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:package_info_plus/package_info_plus.dart';

import '../config/api_config.dart';

/// Result of the legacy-backend version check.
class VersionCheckResult {
  const VersionCheckResult({
    required this.minVersionCode,
    required this.latestVersionCode,
    required this.latestVersionName,
    required this.releaseNotes,
    required this.downloadUrl,
  });

  final int minVersionCode;
  final int latestVersionCode;
  final String latestVersionName;
  final String releaseNotes;
  final String downloadUrl;

  bool isOutdated(int localBuildNumber) => localBuildNumber < latestVersionCode;
  bool isBelowMin(int localBuildNumber) => localBuildNumber < minVersionCode;

  factory VersionCheckResult.fromJson(Map<String, dynamic> json) {
    return VersionCheckResult(
      minVersionCode: (json['minVersion'] as num?)?.toInt() ?? 0,
      latestVersionCode: (json['latestVersion'] as num?)?.toInt() ?? 0,
      latestVersionName: json['latestVersionName'] as String? ?? '',
      releaseNotes: json['releaseNotes'] as String? ?? '',
      downloadUrl: json['downloadUrl'] as String? ?? '',
    );
  }
}

/// Asks the legacy Express backend which app versions are allowed/available.
///
/// This deliberately hits [ApiConfig.baseUrl] (the old Render service), NOT
/// Supabase: builds older than the Supabase cutover only know the legacy URL,
/// so the force-update check must live there to ever reach them.
class VersionCheckService {
  VersionCheckService._();
  static final VersionCheckService instance = VersionCheckService._();

  static const Duration _timeout = Duration(seconds: 5);

  /// Returns null on any failure (offline, server down, bad payload) — the
  /// version check must never block app startup.
  Future<VersionCheckResult?> check() async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/apps/version-check');
      final response = await http
          .get(uri, headers: {'Accept': 'application/json'})
          .timeout(_timeout);
      if (response.statusCode != 200) return null;
      final json = jsonDecode(response.body);
      if (json is! Map<String, dynamic>) return null;
      return VersionCheckResult.fromJson(json);
    } catch (_) {
      return null;
    }
  }

  /// Convenience: current install's build number via [PackageInfo].
  static Future<int> localBuildNumber() async {
    final info = await PackageInfo.fromPlatform();
    return int.tryParse(info.buildNumber) ?? 0;
  }
}
