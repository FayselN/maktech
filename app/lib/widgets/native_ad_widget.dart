import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

import '../services/ad_service.dart';
import '../theme/app_theme.dart';

/// Native ad styled as a "Sponsored" app-list row, built with Google's native
/// template (no platform-side NativeAdFactory registration needed).
///
/// Screens only insert `const NativeAdWidget()` into a list — they never know
/// how AdMob works. Failed first loads are retried with backoff (5s → 60s).
class NativeAdWidget extends StatefulWidget {
  const NativeAdWidget({super.key});

  @override
  State<NativeAdWidget> createState() => _NativeAdWidgetState();
}

class _NativeAdWidgetState extends State<NativeAdWidget> {
  NativeAd? _ad;
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
      if (_disposed) return;
      final wait = Duration(milliseconds: backoff + Random().nextInt(1000));
      await Future<bool>.delayed(wait);
      backoff = min(backoff * 2, 60000);
    }
  }

  Future<bool> _loadOnce({required Completer<bool> outcome}) async {
    final theme = Theme.of(context);
    final isLight = theme.brightness == Brightness.light;
    final textColor = isLight ? AppTheme.textLight : AppTheme.text;
    final secondaryColor =
        isLight ? AppTheme.textSecondaryLight : AppTheme.textSecondary;
    final cardColor = isLight ? AppTheme.cardLight : AppTheme.card;

    final ad = NativeAd(
      adUnitId: AdService.instance.nativeAdUnitId,
      request: const AdRequest(),
      listener: NativeAdListener(
        onAdLoaded: (loaded) {
          if (mounted) {
            setState(() {
              _loaded = true;
              _ad = loaded as NativeAd;
            });
          }
          if (!outcome.isCompleted) outcome.complete(true);
        },
        onAdFailedToLoad: (failed, error) {
          debugPrint('NativeAd failed to load: $error');
          failed.dispose();
          if (!outcome.isCompleted) outcome.complete(false);
        },
      ),
      nativeTemplateStyle: NativeTemplateStyle(
        templateType: TemplateType.small,
        mainBackgroundColor: cardColor,
        cornerRadius: 12,
        primaryTextStyle: NativeTemplateTextStyle(
          textColor: textColor,
          size: 15,
        ),
        secondaryTextStyle: NativeTemplateTextStyle(
          textColor: secondaryColor,
          size: 13,
        ),
        tertiaryTextStyle: NativeTemplateTextStyle(
          textColor: secondaryColor,
          size: 12,
        ),
        callToActionTextStyle: NativeTemplateTextStyle(
          textColor: Colors.white,
          backgroundColor: AppTheme.primary,
          size: 13,
        ),
      ),
    );
    _ad = ad;
    try {
      await ad.load();
    } catch (e) {
      debugPrint('NativeAd load threw: $e');
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

    return Container(
      decoration: BoxDecoration(
        color: context.appCard,
        border: Border.all(color: context.appBorder),
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.accent.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text(
                  'Sponsored',
                  style: TextStyle(
                    fontSize: 10,
                    color: AppTheme.accent,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          ConstrainedBox(
            constraints: const BoxConstraints(
              minWidth: 280,
              minHeight: 90,
              maxHeight: 160,
            ),
            child: AdWidget(ad: _ad!),
          ),
        ],
      ),
    );
  }
}
