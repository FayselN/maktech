import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

/// Central AdMob entry point.
///
/// Screens never talk to AdMob directly — they go through this service and the
/// ad widgets in lib/widgets/. Keep all ad unit IDs here.
class AdService {
  AdService._();
  static final AdService instance = AdService._();

  /// Set to false to disable simulated regions (always false for release
  /// behaviour — debug guards below keep it out of release builds anyway).
  static const bool _consentDebugEnabled = true;

  /// Simulated region for UMP consent testing. Change this to test different
  /// areas (debugGeographyEea, debugGeographyRegulatedUsState,
  /// debugGeographyOther). Only applied in debug builds — ignored in release.
  static const DebugGeography _debugGeography = DebugGeography.debugGeographyEea;

  bool _canRequestAds = false;

  /// True inside `flutter test` (timers must not be scheduled there).
  static bool get isTestEnv =>
      !kIsWeb && Platform.environment.containsKey('FLUTTER_TEST');

  /// True once consent flow is done and ads are allowed to be requested.
  bool get canRequestAds => _canRequestAds;

  /// Polls consent state until ads can be requested (UMP completion can lag
  /// behind widget construction) or the timeout elapses. This is the single
  /// reason a widget shouldn't give up: consent arriving late is normal.
  Future<bool> waitForConsent(Duration timeout) async {
    final deadline = DateTime.now().add(timeout);
    while (true) {
      if (_canRequestAds) return true;
      try {
        _canRequestAds = await ConsentInformation.instance.canRequestAds();
      } catch (_) {
        return false;
      }
      if (_canRequestAds) return true;
      if (DateTime.now().isBefore(deadline)) {
        await Future<void>.delayed(const Duration(seconds: 2));
      } else {
        return false;
      }
    }
  }

  /// Same as waitForConsent, but re-runs the full UMP flow first if consent
  /// is still missing — covers offline launches where the consent info update
  /// failed and would otherwise leave ads dead for the whole session.
  Future<bool> waitForConsentWithRetry(Duration timeout) async {
    if (await waitForConsent(timeout)) return true;
    await requestConsent();
    return waitForConsent(timeout);
  }

  /// Phase 7: false = real production ad unit IDs are active.
  static const bool _useTestAds = false;

  /// Google's official test ad unit IDs — never bill, never policy-flag.
  static const String _testBannerAndroid =
      'ca-app-pub-3940256099942544/6300978111';
  static const String _testBannerIos = 'ca-app-pub-3940256099942544/2934735716';
  static const String _testNativeAndroid =
      'ca-app-pub-3940256099942544/2247696110';
  static const String _testNativeIos = 'ca-app-pub-3940256099942544/3986624511';
  static const String _testInterstitialAndroid =
      'ca-app-pub-3940256099942544/1033173712';
  static const String _testInterstitialIos =
      'ca-app-pub-3940256099942544/4434898707';

  /// MakTech production ad unit IDs.
  static const String _prodBanner = 'ca-app-pub-8377801269353159/6238987088';
  static const String _prodNative = 'ca-app-pub-8377801269353159/3014057947';

  /// MakTech production interstitial ad unit ID (single ID for Android+iOS).
  static const String _prodInterstitialAndroid =
      'ca-app-pub-8377801269353159/6229129242';
  static const String _prodInterstitialIos =
      'ca-app-pub-8377801269353159/6229129242';

  String get bannerAdUnitId {
    if (_useTestAds) {
      return Platform.isIOS ? _testBannerIos : _testBannerAndroid;
    }
    return _prodBanner;
  }

  String get interstitialAdUnitId {
    if (_useTestAds) {
      return Platform.isIOS ? _testInterstitialIos : _testInterstitialAndroid;
    }
    return Platform.isIOS ? _prodInterstitialIos : _prodInterstitialAndroid;
  }

  String get nativeAdUnitId {
    if (_useTestAds) {
      return Platform.isIOS ? _testNativeIos : _testNativeAndroid;
    }
    return _prodNative;
  }

  /// Runs the UMP flow at app launch:
  /// request consent info update → show form if required → canRequestAds().
  Future<void> requestConsent() async {
    try {
      await _requestConsentInfoUpdate().timeout(const Duration(seconds: 15));
      await _showConsentFormIfRequired();
    } catch (e) {
      debugPrint('UMP consent flow failed: $e');
    }
    _canRequestAds = await ConsentInformation.instance.canRequestAds();
    debugPrint('UMP canRequestAds: $_canRequestAds');
  }

  Future<void> _requestConsentInfoUpdate() {
    final completer = Completer<void>();
    ConsentInformation.instance.requestConsentInfoUpdate(
      ConsentRequestParameters(consentDebugSettings: _debugSettings()),
      () {
        if (!completer.isCompleted) completer.complete();
      },
      (FormError error) {
        if (!completer.isCompleted) {
          completer.completeError(
            Exception('Consent info update failed: ${error.message}'),
          );
        }
      },
    );
    return completer.future;
  }

  Future<void> _showConsentFormIfRequired() async {
    if (!await ConsentInformation.instance.isConsentFormAvailable()) return;
    await ConsentForm.loadAndShowConsentFormIfRequired((FormError? error) {
      if (error != null) {
        debugPrint('UMP consent form error: ${error.message}');
      }
    });
  }

  ConsentDebugSettings? _debugSettings() {
    if (!kDebugMode || !_consentDebugEnabled) return null;
    return ConsentDebugSettings(debugGeography: _debugGeography);
  }

  /// Shows the GDPR/CCPA privacy options form (for a "Privacy" entry point
  /// in Settings). Safe to call anywhere; no-op if not required.
  Future<void> showPrivacyOptionsForm() async {
    await ConsentForm.showPrivacyOptionsForm((FormError? error) {
      if (error != null) {
        debugPrint('UMP privacy options form error: ${error.message}');
      }
    });
  }

  /// Whether the privacy options entry point must be shown to the user.
  Future<PrivacyOptionsRequirementStatus>
      getPrivacyOptionsRequirementStatus() {
    return ConsentInformation.instance.getPrivacyOptionsRequirementStatus();
  }

  // ---------------------------------------------------------------------------
  // Interstitial
  // ---------------------------------------------------------------------------

  InterstitialAd? _interstitial;
  bool _interstitialReloading = false;
  Completer<void>? _showCompleter;

  /// Eagerly load the interstitial right after the consent flow. No-op in
  /// widget tests (timers would keep tests pending).
  ///
  /// Keeps polling until consent is obtainable: an offline launch used to
  /// kill this session's ads permanently (nothing ever re-ran the consent
  /// flow). The load itself self-retries every 60s via its failure callback.
  Future<void> preloadInterstitial() async {
    if (isTestEnv) return;
    var reshuffles = 0;
    while (true) {
      if (await waitForConsent(const Duration(seconds: 30))) {
        if (_interstitial == null && !_interstitialReloading) {
          await _loadInterstitial();
          // Considered done either way: on failure the load callback keeps
          // its own 60s retry chain alive for the rest of the session.
        }
        return;
      }
      reshuffles++;
      // Re-run the UMP flow every ~2.5 min (rate-limited, form only re-shows
      // when required) — not every cycle, to avoid spamming the form.
      if (reshuffles.isEven) {
        await requestConsent();
      }
      await Future<void>.delayed(const Duration(seconds: 30));
    }
  }

  Future<void> _loadInterstitial() {
    if (isTestEnv || _interstitialReloading) return Future.value();
    _interstitialReloading = true;
    final done = Completer<void>();
    InterstitialAd.load(
      adUnitId: interstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitial?.dispose();
          _interstitial = ad;
          _interstitialReloading = false;
          if (!done.isCompleted) done.complete();
          debugPrint('Interstitial ready');
        },
        onAdFailedToLoad: (error) {
          _interstitial?.dispose();
          _interstitial = null;
          _interstitialReloading = false;
          if (!done.isCompleted) done.complete();
          debugPrint('Interstitial failed to load: $error');
          Future<void>.delayed(const Duration(seconds: 60), _loadInterstitial);
        },
      ),
    );
    return done.future;
  }

  /// Shows the interstitial on Download, awaiting it fully before returning,
  /// so the caller can safely resume (e.g. launch the Play Store URL) only
  /// after the ad has closed.
  ///
  /// Your users are single-purpose: they arrive from TikTok, look at one app,
  /// tap Download once, and leave. So this fires on every Download tap — no
  /// grace period, no interval cap. The ad is the reward for the user
  /// finishing their task; showing it on the way out is the natural moment.
  ///
  /// No-op if the ad isn't loaded yet (a failed load keeps its own 60s retry
  /// chain alive), so we never block the user on a slow re-request.
  Future<void> showInterstitial() async {
    final ad = _interstitial;
    if (isTestEnv || ad == null) return;

    _interstitial = null;
    final completer = Completer<void>();
    _showCompleter = completer;

    ad.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (shown) {
        shown.dispose();
        _loadInterstitial();
        _completeShow();
      },
      onAdFailedToShowFullScreenContent: (shown, error) {
        debugPrint('Interstitial failed to show: $error');
        shown.dispose();
        _loadInterstitial();
        _completeShow();
      },
    );
    ad.show();

    // Safety net: if the callbacks above never fire (SDK quirk), don't leave
    // the caller stranded — resume after 30s so the Play Store link still opens.
    await Future.any([
      completer.future,
      Future<void>.delayed(const Duration(seconds: 30)),
    ]);
  }

  void _completeShow() {
    final c = _showCompleter;
    _showCompleter = null;
    if (c != null && !c.isCompleted) c.complete();
  }
}
