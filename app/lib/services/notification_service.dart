import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'api_service.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();

  factory NotificationService() {
    return _instance;
  }

  NotificationService._internal();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

  Future<void> init() async {
    try {
      const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
      const iosSettings = DarwinInitializationSettings(
        requestAlertPermission: false,
        requestBadgePermission: false,
        requestSoundPermission: false,
      );
      const initSettings = InitializationSettings(
        android: androidSettings,
        iOS: iosSettings,
      );
      await _localNotifications.initialize(initSettings);

      const androidChannel = AndroidNotificationChannel(
        'maktech_notifications',
        'MakTech Notifications',
        description: 'Notifications from Mak Tech',
        importance: Importance.high,
      );
      await _localNotifications
          .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(androidChannel);

      NotificationSettings settings = await _fcm.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        if (kDebugMode) {
          print('User granted notification permission');
        }
      } else {
        if (kDebugMode) {
          print('User declined or has not accepted notification permission');
        }
      }

      String? token = await _fcm.getToken();
      if (token != null) {
        await _registerTokenWithBackend(token);
      }

      _fcm.onTokenRefresh.listen((newToken) {
        _registerTokenWithBackend(newToken);
      }).onError((err) {
        if (kDebugMode) print('Token refresh failed: $err');
      });

      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        final notification = message.notification;
        if (notification != null) {
          _localNotifications.show(
            notification.hashCode,
            notification.title,
            notification.body,
            NotificationDetails(
              android: AndroidNotificationDetails(
                'maktech_notifications',
                'MakTech Notifications',
                channelDescription: 'Notifications from Mak Tech',
                importance: Importance.high,
                priority: Priority.high,
                icon: '@mipmap/ic_launcher',
              ),
              iOS: const DarwinNotificationDetails(),
            ),
            payload: message.data.isNotEmpty ? message.data.toString() : null,
          );
        }
      });
    } catch (e) {
      if (kDebugMode) {
        print('Error initializing NotificationService: $e');
      }
    }
  }

  Future<void> _registerTokenWithBackend(String token) async {
    try {
      String platformStr = kIsWeb ? 'web' : (Platform.isAndroid ? 'android' : 'ios');

      await ApiService().post(
        '/devices',
        body: {
          'fcmToken': token,
          'platform': platformStr,
        },
      );
      if (kDebugMode) {
        print('Successfully registered FCM token with backend: $token');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Failed to register FCM token with backend: $e');
      }
    }
  }
}
