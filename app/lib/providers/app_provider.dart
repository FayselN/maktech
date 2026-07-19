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
    _loading = true;
    _apiError = null;
    _isOfflineMode = false;
    notifyListeners();
    
    try {
      final results = await Future.wait([
        _cache.fetchWithCache<List<AppModel>>(
          cacheKey: 'trending_apps',
          fetchFunction: () => _api.get('/apps/trending'),
          fromJson: (json) => (json as List).map((a) => AppModel.fromJson(a)).toList(),
          forceRefresh: forceRefresh,
        ),
        _cache.fetchWithCache<List<AppModel>>(
          cacheKey: 'new_apps',
          fetchFunction: () => _api.get('/apps/new'),
          fromJson: (json) => (json as List).map((a) => AppModel.fromJson(a)).toList(),
          forceRefresh: forceRefresh,
        ),
        _cache.fetchWithCache<AppModel?>(
          cacheKey: 'daily_featured',
          fetchFunction: () => _api.get('/apps/daily-featured'),
          fromJson: (json) => json != null ? AppModel.fromJson(json) : null,
          forceRefresh: forceRefresh,
        ),
      ]);
      
      _trending = results[0] as List<AppModel>;
      _newApps = results[1] as List<AppModel>;
      _dailyFeatured = results[2] as AppModel?;
      
    } catch (e) {
      if (e is ApiException) {
        _apiError = e;
        if (e.type == ApiErrorType.noInternet || e.type == ApiErrorType.serverUnreachable || e.type == ApiErrorType.timeout) {
          // If we have data, we are in offline mode. If not, it's a hard error.
          if (_trending.isNotEmpty || _newApps.isNotEmpty) {
             _isOfflineMode = true;
             _apiError = null; // Clear error to avoid blocking UI if we have cache
          }
        }
      } else {
        _apiError = ApiException(ApiErrorType.unknown, e.toString());
      }
    }
    
    _loading = false;
    notifyListeners();
  }

  Future<void> loadAppDetail(String id) async {
    _loading = true;
    try {
      // Not caching individual app details for now to keep it simple, 
      // but we could use _cache.fetchWithCache here as well if needed.
      final res = await _api.get('/apps/$id');
      _selectedApp = AppModel.fromJson(res);
      await _api.post('/apps/$id/view');
    } catch (_) {}
    _loading = false;
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
    try {
      final res = await _api.get('/apps', queryParams: {'category': slug});
      _categoryApps = (res['apps'] as List)
          .map((a) => AppModel.fromJson(a))
          .toList();
    } catch (_) {}
    _loading = false;
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
