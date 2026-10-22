import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/cache_service.dart';
import '../services/notification_service.dart';
import 'main_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    // Notifications must not gate the splash: init is fire-and-forget so the
    // FCM permission prompt + backend register happen in the background while
    // the user already sees the app.
    NotificationService().init();

    final cache = CacheService();
    // Branding delay only on the very first launch. A cold restart after
    // Android killed the process should land on the (already cached) home
    // screen immediately, not replay the splash.
    if (!cache.hasLaunchedBefore) {
      await Future.delayed(const Duration(milliseconds: 800));
      await cache.markLaunched();
    }
    // Never navigate synchronously from initState: with no delay above,
    // pushReplacement would run inside the navigator's build lock and trip
    // the '_debugLocked is not true' assertion. endOfFrame defers past it.
    await WidgetsBinding.instance.endOfFrame;
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const MainScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Image.asset(
                'assets/images/logo.png',
                width: 80,
                height: 80,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: 16),
            const Text('Mak Tech', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppTheme.text)),
            const SizedBox(height: 8),
            const Text('Discover great apps', style: TextStyle(fontSize: 15, color: AppTheme.textSecondary)),
            const SizedBox(height: 32),
            const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2)),
          ],
        ),
      ),
    );
  }
}
