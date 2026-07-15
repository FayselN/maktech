import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  UserModel? _user;
  bool _loading = true;

  UserModel? get user => _user;
  bool get isLoggedIn => _user != null;
  bool get loading => _loading;
  bool get isAdmin => _user?.role == 'admin';

  Future<void> init() async {
    await _api.loadToken();
    if (_api.token != null) {
      try {
        final res = await _api.get('/auth/me');
        _user = UserModel.fromJson(res['user']);
      } catch (_) {
        await _api.setToken(null);
      }
    }
    _loading = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final res = await _api.post('/auth/login', body: {
      'email': email,
      'password': password,
    });
    await _api.setToken(res['token'] as String);
    _user = UserModel.fromJson(res['user']);
    notifyListeners();
  }

  Future<void> register(String name, String email, String password) async {
    final res = await _api.post('/auth/register', body: {
      'name': name,
      'email': email,
      'password': password,
    });
    await _api.setToken(res['token'] as String);
    _user = UserModel.fromJson(res['user']);
    notifyListeners();
  }

  Future<void> logout() async {
    await _api.setToken(null);
    _user = null;
    notifyListeners();
  }
}
