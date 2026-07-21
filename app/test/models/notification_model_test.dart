import 'package:flutter_test/flutter_test.dart';
import 'package:maktech/models/notification_model.dart';

void main() {
  group('NotificationModel.fromJson', () {
    test('parses complete JSON with deviceNotificationId', () {
      final json = {
        'deviceNotificationId': 'dn-001',
        '_id': 'n-001',
        'title': 'New App Available',
        'body': 'Check out this amazing new app!',
        'appId': 'app-123',
        'type': 'new_app',
        'isRead': true,
        'sentAt': '2025-07-20T10:00:00.000Z',
      };

      final notification = NotificationModel.fromJson(json);

      expect(notification.id, 'dn-001'); // prefers deviceNotificationId
      expect(notification.title, 'New App Available');
      expect(notification.body, 'Check out this amazing new app!');
      expect(notification.appId, 'app-123');
      expect(notification.type, 'new_app');
      expect(notification.isRead, true);
      expect(notification.sentAt, '2025-07-20T10:00:00.000Z');
    });

    test('falls back to _id when deviceNotificationId is absent', () {
      final json = {
        '_id': 'n-002',
        'title': 'Update',
        'body': 'App updated',
      };

      final notification = NotificationModel.fromJson(json);

      expect(notification.id, 'n-002');
    });

    test('uses default values for missing optional fields', () {
      final json = {
        '_id': 'n-003',
        'title': 'Alert',
        'body': 'Something happened',
      };

      final notification = NotificationModel.fromJson(json);

      expect(notification.appId, isNull);
      expect(notification.type, 'general');
      expect(notification.isRead, false);
      expect(notification.sentAt, '');
    });

    test('handles all types correctly', () {
      for (final type in ['general', 'new_app', 'update', 'promo']) {
        final json = {
          '_id': 'n-type-$type',
          'title': 'Test',
          'body': 'Body',
          'type': type,
        };
        final notification = NotificationModel.fromJson(json);
        expect(notification.type, type);
      }
    });
  });
}
