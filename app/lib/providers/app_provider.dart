import 'package:flutter/foundation.dart';
import '../models/app_model.dart';
import '../services/api_service.dart';

class AppProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  List<AppModel> _trending = [];
  List<AppModel> _newApps = [];
  List<AppModel> _recentlyViewed = [];
  List<AppModel> _searchResults = [];
  List<AppModel> _categoryApps = [];
  AppModel? _dailyFeatured;
  AppModel? _selectedApp;
  bool _loading = false;
  String _searchQuery = '';
  String? _error;

  List<AppModel> get trending => _trending;
  List<AppModel> get newApps => _newApps;
  List<AppModel> get recentlyViewed => _recentlyViewed;
  List<AppModel> get searchResults => _searchResults;
  List<AppModel> get categoryApps => _categoryApps;
  AppModel? get dailyFeatured => _dailyFeatured;
  AppModel? get selectedApp => _selectedApp;
  bool get loading => _loading;
  String get searchQuery => _searchQuery;
  String? get error => _error;

  Future<void> loadHomeData() async {
    _loading = true;
    _error = null;
    try {
      final results = await Future.wait([
        _api.get('/apps/trending'),
        _api.get('/apps/new'),
        _api.get('/apps/daily-featured'),
      ]);
      _trending = (results[0] as List)
          .map((a) => AppModel.fromJson(a))
          .toList();
      _newApps = (results[1] as List).map((a) => AppModel.fromJson(a)).toList();
      if (results[2] != null) _dailyFeatured = AppModel.fromJson(results[2]);
    } catch (error) {
      _error = 'Could not load apps: $error';
    }
    _loading = false;
    notifyListeners();
  }

  Future<void> loadAppDetail(String id) async {
    _loading = true;
    try {
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
      final res = await _api.get('/apps/recently-viewed');
      _recentlyViewed = (res as List).map((a) => AppModel.fromJson(a)).toList();
    } catch (_) {}
    _loading = false;
    notifyListeners();
  }
}
