import 'package:flutter/foundation.dart';
import '../models/app_model.dart';
import '../services/api_service.dart';
import '../services/cache_service.dart';

class FavoriteProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  final CacheService _cache = CacheService();
  
  List<AppModel> _favorites = [];
  Set<String> _favoriteIds = {};
  bool _loading = false;
  ApiException? _error;

  List<AppModel> get favorites => _favorites;
  bool get loading => _loading;
  String? get error => _error?.message;

  Future<void> loadFavorites({bool forceRefresh = false}) async {
    _loading = true;
    _error = null;
    notifyListeners();
    
    try {
      _favorites = await _cache.fetchWithCache<List<AppModel>>(
        cacheKey: 'favorites_data',
        fetchFunction: () => _api.get('/favorites'),
        fromJson: (json) => (json as List).map((a) => AppModel.fromJson(a)).toList(),
        forceRefresh: forceRefresh,
      );
      _favoriteIds = _favorites.map((a) => a.id).toSet();
    } catch (e) {
      if (e is ApiException) _error = e;
    }
    
    _loading = false;
    notifyListeners();
  }

  bool isFavorited(String appId) => _favoriteIds.contains(appId);

  Future<void> toggle(String appId) async {
    final wasFavorited = isFavorited(appId);
    
    // 1. Optimistic Update (Immediate UI response)
    if (wasFavorited) {
      _favoriteIds.remove(appId);
      _favorites.removeWhere((a) => a.id == appId);
    } else {
      _favoriteIds.add(appId);
      // Note: We don't have the full AppModel yet to add to _favorites list immediately, 
      // but the heart icon relies on _favoriteIds so it will instantly toggle.
    }
    notifyListeners();

    try {
      // 2. Perform API Call
      if (wasFavorited) {
        await _api.delete('/favorites/$appId');
      } else {
        await _api.post('/favorites/$appId');
      }
      
      // 3. Sync full list with backend
      await loadFavorites(forceRefresh: true);
    } catch (e) {
      // 4. Revert on failure
      if (wasFavorited) {
        _favoriteIds.add(appId);
      } else {
        _favoriteIds.remove(appId);
      }
      
      // Attempt to load from cache/backend to restore true state
      await loadFavorites();
      
      if (e is ApiException) {
         _error = e;
         notifyListeners();
      }
    }
  }
}
