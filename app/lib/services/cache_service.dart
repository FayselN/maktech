import 'dart:convert';
import 'package:hive_flutter/hive_flutter.dart';
import 'api_service.dart';

class CacheService {
  static const String _boxName = 'appCache';
  
  static final CacheService _instance = CacheService._internal();
  factory CacheService() => _instance;
  CacheService._internal();

  late Box _cacheBox;

  Future<void> init() async {
    if (Hive.isBoxOpen(_boxName)) return;
    try {
      await Hive.initFlutter();
    } catch (_) {
      // Already initialized externally (e.g. in tests)
    }
    _cacheBox = await Hive.openBox(_boxName);
  }

  /// Instant synchronous cache read — returns null if nothing cached
  T? getCached<T>(String cacheKey, T Function(dynamic json) fromJson) {
    final cachedJsonStr = _cacheBox.get(cacheKey);
    if (cachedJsonStr == null) return null;
    try {
      final decoded = jsonDecode(cachedJsonStr);
      return fromJson(decoded);
    } catch (_) {
      return null;
    }
  }

  /// Background fetch: try to get fresh data, on success update cache, on failure do nothing.
  /// Returns true if the fetch succeeded, false otherwise.
  Future<bool> tryFetchAndCache<T>({
    required String cacheKey,
    required Future<dynamic> Function() fetchFunction,
    required T Function(dynamic json) fromJson,
  }) async {
    try {
      final responseData = await fetchFunction();
      await _cacheBox.put(cacheKey, jsonEncode(responseData));
      await _cacheBox.put('${cacheKey}_updated_at', DateTime.now().toIso8601String());
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Generic fetch with caching strategy:
  /// 1. Check cache for instant UI
  /// 2. Try fetching fresh data
  /// 3. If fresh data succeeds, update cache and return it
  /// 4. If fetch fails, return cache if available, otherwise throw
  Future<T> fetchWithCache<T>({
    required String cacheKey,
    required Future<dynamic> Function() fetchFunction,
    required T Function(dynamic json) fromJson,
    bool forceRefresh = false,
  }) async {
    T? cachedData;
    
    // 1. Try cache first
    if (!forceRefresh) {
      final cachedJsonStr = _cacheBox.get(cacheKey);
      if (cachedJsonStr != null) {
        try {
          final decoded = jsonDecode(cachedJsonStr);
          cachedData = fromJson(decoded);
        } catch (e) {
          // Cache might be malformed, ignore
        }
      }
    }

    try {
      // 2. Fetch fresh data
      final responseData = await fetchFunction();
      
      // 3. Success - update cache
      await _cacheBox.put(cacheKey, jsonEncode(responseData));
      await _cacheBox.put('${cacheKey}_updated_at', DateTime.now().toIso8601String());
      
      return fromJson(responseData);
    } catch (e) {
      // 4. Failed - fall back to cache if we have it
      if (cachedData != null) {
        return cachedData;
      }
      
      // If no cache and fetch failed, rethrow
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(ApiErrorType.unknown, e.toString());
    }
  }
  
  void clearCache() {
    _cacheBox.clear();
  }
}
