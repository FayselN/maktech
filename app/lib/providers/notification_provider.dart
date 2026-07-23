import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../models/notification_model.dart';

class NotificationProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  int _unreadCount = 0;
  List<NotificationModel> _notifications = [];
  bool _loading = false;

  int get unreadCount => _unreadCount;
  bool get hasUnread => _unreadCount > 0;
  List<NotificationModel> get notifications => _notifications;
  bool get loading => _loading;

  Future<void> fetchUnreadCount() async {
    try {
      final res = await _api.get('/notifications');
      if (res != null && res['notifications'] is List) {
        final list = (res['notifications'] as List)
            .map((n) => NotificationModel.fromJson(n))
            .toList();
        _notifications = list;
        _unreadCount = list.where((n) => !n.isRead).length;
        notifyListeners();
      }
    } catch (_) {
      // Quiet fail if offline or server loading
    }
  }

  Future<void> markAsRead(String id) async {
    try {
      await _api.put('/notifications/$id/read');
      await fetchUnreadCount();
    } catch (_) {}
  }

  Future<void> markAllAsRead() async {
    try {
      await _api.put('/notifications/read-all');
      await fetchUnreadCount();
    } catch (_) {}
  }

  Future<void> clearAll() async {
    try {
      await _api.delete('/notifications');
      _notifications = [];
      _unreadCount = 0;
      notifyListeners();
    } catch (_) {}
  }
}
