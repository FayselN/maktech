import 'package:flutter/foundation.dart';
import '../models/app_model.dart';
import '../services/api_service.dart';

class FavoriteProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<AppModel> _favorites = [];
  Set<String> _favoriteIds = {};
  bool _loading = false;

  List<AppModel> get favorites => _favorites;
  bool get loading => _loading;

  Future<void> loadFavorites() async {
    _loading = true;
    try {
      final res = await _api.get('/favorites');
      _favorites = (res as List).map((a) => AppModel.fromJson(a)).toList();
      _favoriteIds = _favorites.map((a) => a.id).toSet();
    } catch (_) {}
    _loading = false;
    notifyListeners();
  }

  bool isFavorited(String appId) => _favoriteIds.contains(appId);

  Future<void> toggle(String appId) async {
    try {
      if (isFavorited(appId)) {
        await _api.delete('/favorites/$appId');
        _favoriteIds.remove(appId);
        _favorites.removeWhere((a) => a.id == appId);
      } else {
        await _api.post('/favorites/$appId');
        _favoriteIds.add(appId);
      }
      notifyListeners();
    } catch (_) {}
  }
}
