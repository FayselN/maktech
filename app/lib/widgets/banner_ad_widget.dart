import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

import '../services/ad_service.dart';

/// Drop-in anchored adaptive banner for the bottom of a screen.
///
/// Screens just place `const BannerAdWidget()` in their layout — they never
/// touch AdMob APIs, IDs, consent, or loading themselves.
///
/// Loads are retried: first loads commonly fail on cold app start (no-fill,
/// slow networks, consent still resolving). Backoff: 5s → 2× capped at 60s.
class BannerAdWidget extends StatefulWidget {
  const BannerAdWidget({super.key});

  @override
  State<BannerAdWidget> createState() => _BannerAdWidgetState();
}

class _BannerAdWidgetState extends State<BannerAdWidget> {
  BannerAd? _ad;
  bool _loaded = false;
  bool _started = false;
  bool _disposed = false;
  Completer<bool>? _loadAttempt;

  /// Widget tests would otherwise leave retry timers pending.
  static bool get _inTests => AdService.isTestEnv;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    if (_inTests) return;
    Future<void>.delayed(Duration.zero, _loadWithRetry);
  }

  Future<void> _loadWithRetry() async {
    final allowed = await AdService.instance
        .waitForConsent(const Duration(seconds: 45));
    if (!allowed || !mounted || _disposed) return;

    const maxAttempts = 6;
    var backoff = 5000;

    for (var attempt = 1; attempt <= maxAttempts; attempt++) {
      if (!mounted) return;
      _loadAttempt = Completer<bool>();
      final result = await _loadOnce(outcome: _loadAttempt!);
      if (result) return;
      if (attempt == maxAttempts) break;
      // jittered exponential backoff to spread retry load
      final wait = Duration(milliseconds: backoff + Random().nextInt(1000));
      await Future<bool>.delayed(wait);
      backoff = min(backoff * 2, 60000);
    }
  }

  Future<bool> _loadOnce({required Completer<bool> outcome}) async {
    // to parent drag; sizes can change between retries (rotation etc.)
    final width = MediaQuery.sizeOf(context).width.truncate();
    final size = await AdSize.getLargeAnchoredAdaptiveBannerAdSize(width);

    final ad = BannerAd(
      adUnitId: AdService.instance.bannerAdUnitId,
      size: size ?? AdSize.banner,
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (loaded) {
          if (mounted) {
            setState(() {
              _loaded = true;
              _ad = loaded as BannerAd;
            });
          }
          if (!outcome.isCompleted) outcome.complete(true);
        },
        onAdFailedToLoad: (failed, error) {
          debugPrint('BannerAd failed to load: $error');
          failed.dispose();
          if (!outcome.isCompleted) outcome.complete(false);
        },
      ),
    );
    _ad = ad;
    try {
      await ad.load();
    } catch (e) {
      debugPrint('BannerAd load threw: $e');
      ad.dispose();
      _ad = null;
      if (!outcome.isCompleted) outcome.complete(false);
      return false;
    }
    return await _loadAttempt?.future ?? false;
  }

  @override
  void dispose() {
    _disposed = true;
    _loadAttempt?.complete(false);
    _ad?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_loaded || _ad == null) return const SizedBox.shrink();

    return SafeArea(
      top: false,
      child: Center(
        child: SizedBox(
          width: _ad!.size.width.toDouble(),
          height: _ad!.size.height.toDouble(),
          child: AdWidget(ad: _ad!),
        ),
      ),
    );
  }
}
