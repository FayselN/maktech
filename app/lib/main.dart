import 'dart:async';

import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'firebase_options.dart';
import 'package:provider/provider.dart';
import 'providers/app_provider.dart';
import 'providers/favorite_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/notification_provider.dart';
import 'services/api_service.dart';
import 'services/cache_service.dart';
import 'services/ad_service.dart';
import 'screens/splash_screen.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  debugPrint("Handling a background message: ${message.messageId}");
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Critical path: Hive only — it's local and required to paint cached UI
  // on the very first frame (offline cold start must not block here).
  await CacheService().init();

  // Deferred: none of these may gate the first frame.
  // - Supabase: initialize restores the persisted GoTrue session, which
  //   hangs offline when the token is expired; ApiService.init now times
  //   out and retries in the background, and requests wait for it lazily.
  // - Firebase: messaging/remote config, slowest of the bunch
  // - MobileAds + consent: only needed before the first ad, not the first frame
  // - Preloading the interstitial: kicks off its own consent-wait loop
  unawaited(ApiService().init());
  unawaited(_deferredFirebaseAndAds());

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppProvider()),
        ChangeNotifierProvider(create: (_) => FavoriteProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
      ],
      child: const MakTechApp(),
    ),
  );
}

/// Set up Firebase + AdMob after the first frame so they don't add to startup
/// latency. Consent is still required before the first ad request, but the
/// interstitial's own load callback handles that — it polls
/// [AdService.preloadInterstitial] until consent is available.
Future<void> _deferredFirebaseAndAds() async {
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    await MobileAds.instance.initialize();
  } catch (e) {
    debugPrint('[startup] deferred init failed: $e');
  }
  unawaited(AdService.instance.preloadInterstitial());
}

class MakTechApp extends StatelessWidget {
  const MakTechApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProv = context.watch<ThemeProvider>();
    return MaterialApp(
      title: 'Mak Tech',
      debugShowCheckedModeBanner: false,
      theme: themeProv.lightTheme,
      darkTheme: themeProv.darkTheme,
      themeMode: themeProv.themeMode,
      home: const SplashScreen(),
    );
  }
}
