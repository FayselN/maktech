import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'api_service.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();

  factory NotificationService() {
    return _instance;
  }

  NotificationService._internal();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;

  Future<void> init() async {
    try {
      // 1. Request permission for iOS/Web (Android doesn't strictly need this for basic functionality, but good practice)
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

      // 2. Get the FCM Token
      String? token = await _fcm.getToken();
      if (token != null) {
        await _registerTokenWithBackend(token);
      }

      // 3. Listen for token refreshes
      _fcm.onTokenRefresh.listen((newToken) {
        _registerTokenWithBackend(newToken);
      }).onError((err) {
        if (kDebugMode) print('Token refresh failed: $err');
      });

      // 4. Setup foreground message handler (background handler must be top-level function in main.dart)
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        if (kDebugMode) {
          print('Got a message whilst in the foreground!');
          print('Message data: ${message.data}');
          if (message.notification != null) {
            print('Message also contained a notification: ${message.notification?.title}');
          }
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
