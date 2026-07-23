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

  FirebaseMessaging? _fcmInstance;
  FirebaseMessaging get _fcm => _fcmInstance ??= FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();
  VoidCallback? onForegroundMessageReceived;

  Future<void> init() async {
    try {
      const androidSettings = AndroidInitializationSettings(
        '@mipmap/ic_launcher',
      );
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
          .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin
          >()
          ?.createNotificationChannel(androidChannel);

      NotificationSettings settings = await _fcm.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        // Permission granted
      } else {
        // Permission declined
      }

      String? token = await _fcm.getToken();

      if (token != null) {
        await _registerTokenWithBackend(token);
      }

      _fcm.onTokenRefresh
          .listen((newToken) {
            _registerTokenWithBackend(newToken);
          })
          .onError((err) {});

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
        onForegroundMessageReceived?.call();
      });
    } catch (e) {
      // Error initializing NotificationService
    }
  }

  Future<void> _registerTokenWithBackend(String token) async {
    try {
      String platformStr = kIsWeb
          ? 'web'
          : (Platform.isAndroid ? 'android' : 'ios');

      await ApiService().post(
        '/devices',
        body: {'fcmToken': token, 'platform': platformStr},
      );
    } catch (e) {
      // Failed to register token
    }
  }
}
