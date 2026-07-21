import 'package:flutter/foundation.dart';
import '../models/app_model.dart';
import '../services/api_service.dart';
import '../services/cache_service.dart';

class AppProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  final CacheService _cache = CacheService();

  List<AppModel> _trending = [];
  List<AppModel> _newApps = [];
  List<AppModel> _recentlyViewed = [];
  List<AppModel> _searchResults = [];
  List<AppModel> _categoryApps = [];
  AppModel? _dailyFeatured;
  AppModel? _selectedApp;
  
  bool _loading = false;
  String _searchQuery = '';
  
  ApiException? _apiError;
  bool _isOfflineMode = false;

  List<AppModel> get trending => _trending;
  List<AppModel> get newApps => _newApps;
  List<AppModel> get recentlyViewed => _recentlyViewed;
  List<AppModel> get searchResults => _searchResults;
  List<AppModel> get categoryApps => _categoryApps;
  AppModel? get dailyFeatured => _dailyFeatured;
  AppModel? get selectedApp => _selectedApp;
  
  bool get loading => _loading;
  String get searchQuery => _searchQuery;
  
  String? get error => _apiError?.message;
  ApiException? get apiError => _apiError;
  bool get isOfflineMode => _isOfflineMode;

  Future<void> loadHomeData({bool forceRefresh = false}) async {
    _apiError = null;
    _isOfflineMode = false;
    _loading = true;
    notifyListeners();
    bool hadCachedData = false;

    // 1. Show cached data instantly (no spinner)
    final cachedTrending = _cache.getCached<List<AppModel>>(
      'trending_apps',
      (json) => (json as List).map((a) => AppModel.fromJson(a)).toList(),
    );
    final cachedNew = _cache.getCached<List<AppModel>>(
      'new_apps',
      (json) => (json as List).map((a) => AppModel.fromJson(a)).toList(),
    );
    final cachedFeatured = _cache.getCached<AppModel?>(
      'daily_featured',
      (json) => json != null ? AppModel.fromJson(json) : null,
    );
    if (cachedTrending != null || cachedNew != null) {
      hadCachedData = true;
      _trending = cachedTrending ?? [];
      _newApps = cachedNew ?? [];
      _dailyFeatured = cachedFeatured;
      _loading = false;
      notifyListeners();
    }

    // 2. Fire background refresh
    final results = await Future.wait([
      _cache.tryFetchAndCache<List<AppModel>>(
        cacheKey: 'trending_apps',
        fetchFunction: () => _api.get('/apps/trending'),
        fromJson: (json) => (json as List).map((a) => AppModel.fromJson(a)).toList(),
      ),
      _cache.tryFetchAndCache<List<AppModel>>(
        cacheKey: 'new_apps',
        fetchFunction: () => _api.get('/apps/new'),
        fromJson: (json) => (json as List).map((a) => AppModel.fromJson(a)).toList(),
      ),
      _cache.tryFetchAndCache<AppModel?>(
        cacheKey: 'daily_featured',
        fetchFunction: () => _api.get('/apps/daily-featured'),
        fromJson: (json) => json != null ? AppModel.fromJson(json) : null,
      ),
    ]);

    final allSucceeded = results.every((r) => r);

    if (allSucceeded) {
      // Fresh data landed — update UI with the cache we just wrote
      final freshTrending = _cache.getCached<List<AppModel>>(
        'trending_apps',
        (json) => (json as List).map((a) => AppModel.fromJson(a)).toList(),
      );
      final freshNew = _cache.getCached<List<AppModel>>(
        'new_apps',
        (json) => (json as List).map((a) => AppModel.fromJson(a)).toList(),
      );
      final freshFeatured = _cache.getCached<AppModel?>(
        'daily_featured',
        (json) => json != null ? AppModel.fromJson(json) : null,
      );
      _trending = freshTrending ?? _trending;
      _newApps = freshNew ?? _newApps;
      _dailyFeatured = freshFeatured ?? _dailyFeatured;
      _isOfflineMode = false;
    } else if (hadCachedData) {
      _isOfflineMode = true;
    } else {
      _apiError = ApiException(ApiErrorType.noInternet, 'No internet connection');
    }

    _loading = false;
    notifyListeners();
  }

  Future<void> loadAppDetail(String id) async {
    _loading = true;
    final cacheKey = 'app_detail_$id';

    // 1. Show cached detail instantly
    final cached = _cache.getCached<AppModel>(
      cacheKey,
      (json) => AppModel.fromJson(json),
    );
    if (cached != null) {
      _selectedApp = cached;
      _loading = false;
      notifyListeners();
    }

    // 2. Background refresh
    final ok = await _cache.tryFetchAndCache<AppModel>(
      cacheKey: cacheKey,
      fetchFunction: () => _api.get('/apps/$id'),
      fromJson: (json) => AppModel.fromJson(json),
    );
    if (ok) {
      final fresh = _cache.getCached<AppModel>(
        cacheKey,
        (json) => AppModel.fromJson(json),
      );
      _selectedApp = fresh ?? _selectedApp;
    }
    // Silently stay on cached data if fetch fails

    try { await _api.post('/apps/$id/view'); } catch (_) {}
    if (cached == null) _loading = false;
    notifyListeners();
  }

  Future<void> search(String query) async {
    _searchQuery = query;
    if (query.isEmpty) {
      _searchResults = [];
      notifyListeners();
      return;
    }
    _loading = true;
    notifyListeners();
    try {
      final res = await _api.get('/apps', queryParams: {'search': query});
      _searchResults = (res['apps'] as List)
          .map((a) => AppModel.fromJson(a))
          .toList();
    } catch (_) {}
    _loading = false;
    notifyListeners();
  }

  Future<void> loadCategoryApps(String slug) async {
    _loading = true;
    final cacheKey = 'category_apps_$slug';

    final cached = _cache.getCached<List<AppModel>>(
      cacheKey,
      (json) => (json as List).map((a) => AppModel.fromJson(a)).toList(),
    );
    if (cached != null) {
      _categoryApps = cached;
      _loading = false;
      notifyListeners();
    }

    final ok = await _cache.tryFetchAndCache<List<AppModel>>(
      cacheKey: cacheKey,
      fetchFunction: () async {
        final res = await _api.get('/apps', queryParams: {'category': slug});
        return res['apps'] as List;
      },
      fromJson: (json) => (json as List).map((a) => AppModel.fromJson(a)).toList(),
    );
    if (ok) {
      final fresh = _cache.getCached<List<AppModel>>(
        cacheKey,
        (json) => (json as List).map((a) => AppModel.fromJson(a)).toList(),
      );
      _categoryApps = fresh ?? _categoryApps;
    }
    if (cached == null) _loading = false;
    notifyListeners();
  }

  Future<void> loadRecentlyViewed() async {
    _loading = true;
    try {
      // Assuming recently viewed is tied to backend, but usually local.
      // We wrap it in cache just in case.
      _recentlyViewed = await _cache.fetchWithCache<List<AppModel>>(
        cacheKey: 'recently_viewed_apps',
        fetchFunction: () => _api.get('/apps/recently-viewed'),
        fromJson: (json) => (json as List).map((a) => AppModel.fromJson(a)).toList(),
      );
    } catch (_) {}
    _loading = false;
    notifyListeners();
  }
}
