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

  /// Replace the X placeholders with the real interstitial IDs from the AdMob
  /// console; until then the official test IDs are used as a safe fallback.
  static const String _prodInterstitialAndroid =
      'ca-app-pub-8377801269353159/XXXXXXXXXX';
  static const String _prodInterstitialIos =
      'ca-app-pub-8377801269353159/XXXXXXXXXX';

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
    final prod = Platform.isIOS ? _prodInterstitialIos : _prodInterstitialAndroid;
    return prod.contains('XXXXXXXXXX')
        ? (Platform.isIOS ? _testInterstitialIos : _testInterstitialAndroid)
        : prod;
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
  DateTime _lastInterstitialShown = DateTime.fromMillisecondsSinceEpoch(0);
  int _detailVisits = 0;
  bool _interstitialReloading = false;

  /// Minimum spacing between two interstitials (policy-friendly).
  static const Duration _interstitialInterval = Duration(minutes: 2);

  /// Skip the first N app-detail screens of a session (grace period).
  static const int _interstitialMinDetailVisits = 2;

  /// Eagerly load the interstitial right after the consent flow. No-op in
  /// widget tests (timers would keep tests pending).
  Future<void> preloadInterstitial() async {
    if (isTestEnv) return;
    if (!await waitForConsent(const Duration(seconds: 45))) return;
    await _loadInterstitial();
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

  /// Detail screens report themselves on open; the grace counter keys off it.
  void recordDetailVisit() => _detailVisits++;

  /// Shows the interstitial if: loaded + outside the grace period + interval
  /// elapsed. Otherwise a silent no-op. Reloads a fresh ad after showing.
  void maybeShowInterstitial() {
    if (isTestEnv) return;
    if (_detailVisits < _interstitialMinDetailVisits) return;
    if (DateTime.now().difference(_lastInterstitialShown) <
        _interstitialInterval) {
      return;
    }
    final ad = _interstitial;
    if (ad == null) return;

    _lastInterstitialShown = DateTime.now();
    _interstitial = null;
    ad.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (shown) {
        shown.dispose();
        _loadInterstitial();
      },
      onAdFailedToShowFullScreenContent: (shown, error) {
        debugPrint('Interstitial failed to show: $error');
        shown.dispose();
        _loadInterstitial();
      },
    );
    ad.show();
  }
}
