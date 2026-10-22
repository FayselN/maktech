import 'dart:async';
import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

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

/// Backend client backed by Supabase (Auth + Data API). Keeps the exact
/// request/response surface of the legacy Express API so providers, screens
/// and models are unchanged.
class ApiService {
  SupabaseClient? _client;
  String? _deviceUuid;
  final Completer<void> _clientReady = Completer<void>();

  /// Hard cap per request: without it a request to a reachable-but-broken
  /// network (captive portal, dead wifi) can hang for minutes.
  static const _requestTimeout = Duration(seconds: 15);

  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  SupabaseClient get _supabase {
    final c = _client;
    if (c == null) {
      throw ApiException(ApiErrorType.unknown, 'API service not initialized');
    }
    return c;
  }

  /// Never blocks the first frame. `Supabase.initialize` restores the
  /// persisted GoTrue session, and with an expired session offline that
  /// restore hangs on the token refresh — which used to freeze the app on
  /// the splash screen because runApp awaited this. Now: first attempt gets
  /// a short timeout, then a background loop retries until it lands. The
  /// client itself is created synchronously inside initialize (before the
  /// session restore), so the retry attaches it within ~2s even while the
  /// original attempt is still stuck on the network.
  Future<void> init() async {
    try {
      await _initialize().timeout(const Duration(seconds: 3));
    } catch (e) {
      debugPrint('[api] init timed out/failed, retrying in background: $e');
      unawaited(_retryInitUntilReady());
    }
  }

  Future<void> _initialize() async {
    // Anon sign-in + device register are intentionally NOT done here: they
    // need network and each request already lazily calls _ensureDevice().
    await Supabase.initialize(
      url: ApiConfig.supabaseUrl,
      anonKey: ApiConfig.supabaseAnonKey,
      authOptions: const FlutterAuthClientOptions(autoRefreshToken: true),
    );
    _attachClient();
  }

  Future<void> _retryInitUntilReady() async {
    while (_client == null) {
      await Future<void>.delayed(const Duration(seconds: 2));
      try {
        // No-op if the timed-out first attempt already finished initialize();
        // otherwise a second initialize returns the same singleton client.
        await _initialize().timeout(const Duration(seconds: 5));
        debugPrint('[api] Supabase client ready after retry');
      } catch (e) {
        debugPrint('[api] init retry failed: $e');
      }
    }
  }

  void _attachClient() {
    _client = Supabase.instance.client;
    if (!_clientReady.isCompleted) _clientReady.complete();
  }

  Future<void> _ensureClient() async {
    if (_client != null) return;
    await _clientReady.future.timeout(const Duration(seconds: 5));
  }

  Future<void> _ensureDevice() async {
    if (_deviceUuid != null) return;
    if (_supabase.auth.currentSession == null) {
      await _supabase.auth.signInAnonymously();
    }
    await _registerDevice();
  }

  Future<void> _registerDevice() async {
    final legacy = await DeviceUtils.getDeviceId();
    final platform = kIsWeb
        ? 'web'
        : (Platform.isAndroid ? 'android' : 'ios');
    final registered = await _supabase.rpc(
      'register_device',
      params: {'p_legacy_device_id': legacy, 'p_platform': platform},
    );
    _deviceUuid = registered is String ? registered : null;
  }

  Future<void> _checkConnectivity() async {
    final connectivityResults = await Connectivity().checkConnectivity();
    if (connectivityResults.contains(ConnectivityResult.none)) {
      throw ApiException(ApiErrorType.noInternet, 'No internet connection');
    }
  }

  ApiException _mapError(Object e) {
    if (e is ApiException) return e;
    if (e is AuthException) {
      return ApiException(ApiErrorType.unknown, e.message);
    }
    final msg = e.toString();
    if (msg.contains('No internet') || msg.contains('SocketException')) {
      return ApiException(ApiErrorType.serverUnreachable, 'Server unreachable');
    }
    if (msg.contains('Timeout') || e is TimeoutException) {
      return ApiException(ApiErrorType.timeout, 'Request timed out');
    }
    return ApiException(ApiErrorType.unknown, 'Something went wrong: $e');
  }

  // ---------------------------------------------------------------------------
  // public surface (path-based, legacy-compatible)
  // ---------------------------------------------------------------------------

  Future<dynamic> get(String path, {Map<String, String>? queryParams}) async {
    try {
      await _checkConnectivity();
      await _ensureClient();
      return await _routeGet(path, queryParams ?? const {})
          .timeout(_requestTimeout);
    } on ApiException {
      rethrow;
    } catch (e) {
      throw _mapError(e);
    }
  }

  Future<dynamic> post(String path, {Map<String, dynamic>? body}) async {
    try {
      await _checkConnectivity();
      await _ensureClient();
      return await _routePost(path, body ?? const {}).timeout(_requestTimeout);
    } on ApiException {
      rethrow;
    } catch (e) {
      throw _mapError(e);
    }
  }

  Future<dynamic> put(String path, {Map<String, dynamic>? body}) async {
    try {
      await _checkConnectivity();
      await _ensureClient();
      return await _routePut(path, body ?? const {}).timeout(_requestTimeout);
    } on ApiException {
      rethrow;
    } catch (e) {
      throw _mapError(e);
    }
  }

  Future<dynamic> delete(String path) async {
    try {
      await _checkConnectivity();
      await _ensureClient();
      return await _routeDelete(path).timeout(_requestTimeout);
    } on ApiException {
      rethrow;
    } catch (e) {
      throw _mapError(e);
    }
  }

  // ---------------------------------------------------------------------------
  // GET routing
  // ---------------------------------------------------------------------------

  static const String _appSelect =
      '*, app_categories(categories(slug)), app_screenshots(id, url, sort_order)';

  Map<String, dynamic> _appToLegacy(Map<String, dynamic> row) {
    final cats = (row['app_categories'] as List? ?? [])
        .whereType<Map<String, dynamic>>()
        .map((ac) => ((ac['categories'] ?? const {}) as Map)['slug'])
        .where((s) => s != null)
        .cast<String>()
        .toList();
    final shots = (row['app_screenshots'] as List? ?? [])
        .whereType<Map<String, dynamic>>()
        .map((s) => {
              '_id': s['id'],
              'url': s['url'],
              'order': s['sort_order'],
            })
        .toList();
    final ratingCount = (row['rating_count'] as num? ?? 0).toInt();
    return {
      '_id': row['id'],
      'id': row['id'],
      'name': row['name'],
      'slug': row['slug'],
      'searchCode': row['search_code'],
      'curiosityTitle': row['curiosity_title'],
      'shortDescription': row['short_description'],
      'longDescription': row['long_description'],
      'developerName': row['developer_name'],
      'packageName': row['package_name'],
      'playStoreUrl': row['play_store_url'],
      'appStoreUrl': row['app_store_url'],
      'iconUrl': row['icon_url'],
      'priceType': row['price_type'],
      'playStoreRating': row['play_store_rating'],
      'categories': cats,
      'screenshots': shots,
      'features': row['features'] ?? [],
      'pros': row['pros'] ?? [],
      'cons': row['cons'] ?? [],
      'ratingStats': {
        'average': row['rating_average'],
        'count': ratingCount,
      },
      'status': row['status'],
      'isNewApp': row['is_new_app'],
      'viewCount': row['view_count'],
      'favoriteCount': row['favorite_count'],
      'createdAt': row['created_at'],
      'updatedAt': row['updated_at'],
    };
  }

  Future<List<dynamic>> _listApps(Future<List<Map<String, dynamic>>> Function() fetch) async {
    final rows = await fetch();
    return rows.map((r) => _appToLegacy(r)).toList();
  }

  Future<dynamic> _routeGet(String path, Map<String, String> query) async {
    final sb = _supabase;

    if (path == '/categories') {
      final rows = await sb
          .from('categories')
          .select('id, name, slug, icon_url, sort_order')
          .order('sort_order');
      return (rows as List)
          .map((r) => {
                '_id': r['id'],
                'name': r['name'],
                'slug': r['slug'],
                'iconUrl': r['icon_url'],
                'sortOrder': (r['sort_order'] as num?)?.toInt() ?? 0,
              })
          .toList();
    }

    if (path == '/apps/trending') {
      return _listApps(() async {
        final rows = await sb
            .from('apps')
            .select(_appSelect)
            .eq('status', 'published')
            .order('view_count', ascending: false)
            .limit(10);
        return List<Map<String, dynamic>>.from(rows);
      });
    }

    if (path == '/apps/new') {
      return _listApps(() async {
        final rows = await sb
            .from('apps')
            .select(_appSelect)
            .eq('status', 'published')
            .order('created_at', ascending: false)
            .limit(10);
        return List<Map<String, dynamic>>.from(rows);
      });
    }

    if (path == '/apps/daily-featured') {
      final today = DateTime.now().toUtc().toIso8601String().substring(0, 10);
      var rows = await sb
          .from('daily_featured')
          .select('apps!inner($_appSelect)')
          .eq('featured_date', today)
          .limit(1);
      if (rows.isEmpty) {
        rows = await sb
            .from('daily_featured')
            .select('apps!inner($_appSelect)')
            .order('featured_date', ascending: false)
            .limit(1);
      }
      if (rows.isEmpty) return null;
      final app = rows.first['apps'] as Map<String, dynamic>;
      return _appToLegacy(app);
    }

    if (path == '/apps/recently-viewed') {
      return _listApps(() async {
        final rows = await sb
            .from('recently_viewed')
            .select('apps!inner($_appSelect), viewed_at')
            .order('viewed_at', ascending: false)
            .limit(20);
        return List<Map<String, dynamic>>.from(rows);
      });
    }

    if (path.startsWith('/apps/') && path.endsWith('/reviews')) {
      final appId = _segment(path, 1);
      final limit = int.tryParse(query['limit'] ?? '') ?? 50;
      final rows = await sb
          .from('reviews')
          .select('id, rating, comment, created_at, device_id')
          .eq('app_id', appId)
          .order('created_at', ascending: false)
          .limit(limit);
      return {
        'reviews': rows.map((r) => {
              '_id': r['id'],
              'rating': r['rating'],
              'comment': r['comment'] ?? '',
              'createdAt': r['created_at'],
              'deviceId': r['device_id'],
            }).toList(),
      };
    }

    if (path == '/favorites') {
      return _listApps(() async {
        final rows = await sb
            .from('favorites')
            .select('apps!inner($_appSelect), created_at')
            .order('created_at', ascending: false);
        return List<Map<String, dynamic>>.from(rows);
      });
    }

    if (path == '/notifications') {
      await _ensureDevice();
      final rows = await sb
          .from('device_notifications')
          .select('id, is_read, received_at, notifications(id, title, body, app_id, type, sent_at)')
          .order('received_at', ascending: false)
          .limit(100);
      return {
        'notifications': rows.map((n) {
          final n0 = (n['notifications'] ?? const {}) as Map;
          return {
            '_id': n['id'],
            'deviceNotificationId': n['id'],
            'title': n0['title'],
            'body': n0['body'],
            'appId': n0['app_id'],
            'type': n0['type'],
            'isRead': n['is_read'],
            'sentAt': n0['sent_at'],
            'receivedAt': n['received_at'],
          };
        }).toList(),
      };
    }

    if (path == '/apps') {
      final base = () {
        PostgrestFilterBuilder q =
            sb.from('apps').select(_appSelect).eq('status', 'published');
        final search = query['search'];
        final category = query['category'];
        if (search != null && search.isNotEmpty) {
          final term = _escapeIlike(search);
          q = q.or('name.ilike.%$term%,short_description.ilike.%$term%');
        }
        if (category != null && category.isNotEmpty) {
          q = q.eq('app_categories.categories.slug', category);
        }
        return q;
      }();
      final rows = await base;
      return {
        'apps': (rows as List).map((r) => _appToLegacy(r)).toList(),
        'pagination': {'page': 1, 'limit': 20, 'total': rows.length, 'pages': 1},
      };
    }

    if (path.startsWith('/apps/')) {
      final appId = _segment(path, 1);
      final row = await sb
          .from('apps')
          .select(_appSelect)
          .eq('id', appId)
          .eq('status', 'published')
          .maybeSingle();
      if (row == null) {
        throw ApiException(ApiErrorType.unknown, 'App not found');
      }
      return _appToLegacy(row);
    }

    throw ApiException(ApiErrorType.unknown, 'Unsupported GET $path');
  }

  // ---------------------------------------------------------------------------
  // POST routing
  // ---------------------------------------------------------------------------

  Future<dynamic> _routePost(String path, Map<String, dynamic> body) async {
    final sb = _supabase;

    if (path == '/devices') {
      await _ensureDevice();
      final platform = (body['platform'] as String?) ??
          (kIsWeb ? 'web' : (Platform.isAndroid ? 'android' : 'ios'));
      final legacy = await DeviceUtils.getDeviceId();
      await _supabase.rpc('register_device', params: {
        'p_legacy_device_id': legacy,
        'p_platform': platform,
        'p_fcm_token': body['fcmToken'] as String?,
      });
      return {'ok': true};
    }

    if (path.startsWith('/favorites/')) {
      await _ensureDevice();
      final appId = _segment(path, 1);
      await sb.from('favorites').upsert(
            {'app_id': appId, 'device_id': _deviceUuid},
            onConflict: 'device_id,app_id',
            ignoreDuplicates: true,
          );
      return {'ok': true};
    }

    if (path.startsWith('/apps/') && path.endsWith('/view')) {
      await sb.rpc('bump_view', params: {'p_app_id': _segment(path, 1)});
      return {'ok': true};
    }

    if (path.startsWith('/apps/') && path.endsWith('/reviews')) {
      await _ensureDevice();
      final appId = _segment(path, 1);
      await sb.rpc('upsert_review', params: {
        'p_app_id': appId,
        'p_rating': (body['rating'] as num).toInt(),
        'p_comment': (body['comment'] as String?) ?? '',
      });
      return {'ok': true};
    }

    if (path.startsWith('/apps/') && path.contains('/reviews/') && path.endsWith('/report')) {
      await _ensureDevice();
      // /apps/<app>/reviews/<review>/report
      final parts = path.split('/');
      final reviewId = parts[parts.length - 2];
      await sb.rpc('report_review', params: {
        'p_review_id': reviewId,
        'p_reason': body['reason'] ?? 'other',
        'p_other': body['otherReason'],
      });
      return {'ok': true};
    }

    throw ApiException(ApiErrorType.unknown, 'Unsupported POST $path');
  }

  // ---------------------------------------------------------------------------
  // PUT routing
  // ---------------------------------------------------------------------------

  Future<dynamic> _routePut(String path, Map<String, dynamic> body) async {
    final sb = _supabase;

    if (path == '/notifications/read-all') {
      await _ensureDevice();
      await sb
          .from('device_notifications')
          .update({'is_read': true})
          .eq('device_id', _deviceUuid!);
      return {'ok': true};
    }
    if (path.startsWith('/notifications/') && path.endsWith('/read')) {
      await _ensureDevice();
      await sb
          .from('device_notifications')
          .update({'is_read': true})
          .eq('id', _segment(path, 1));
      return {'ok': true};
    }

    throw ApiException(ApiErrorType.unknown, 'Unsupported PUT $path');
  }

  // ---------------------------------------------------------------------------
  // DELETE routing
  // ---------------------------------------------------------------------------

  Future<dynamic> _routeDelete(String path) async {
    final sb = _supabase;

    if (path == '/notifications') {
      await _ensureDevice();
      await sb
          .from('device_notifications')
          .delete()
          .eq('device_id', _deviceUuid!);
      return {'ok': true};
    }
    if (path.startsWith('/favorites/')) {
      await _ensureDevice();
      await sb.from('favorites').delete().eq('app_id', _segment(path, 1));
      return {'ok': true};
    }

    throw ApiException(ApiErrorType.unknown, 'Unsupported DELETE $path');
  }

  // ---------------------------------------------------------------------------
  // helpers
  // ---------------------------------------------------------------------------

  static String _segment(String path, int index) {
    final parts = path.split('/').where((p) => p.isNotEmpty).toList();
    return parts[index];
  }

  static String _escapeIlike(String term) =>
      term.replaceAll(RegExp(r'[^A-Za-z0-9\u0400-\u04FF ]'), '').trim();
}
