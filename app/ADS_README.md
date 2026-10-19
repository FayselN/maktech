# ADS-README — App-Open & Interstitial implementation plan (for later)

Plan for adding full-screen ad formats (app-open + interstitial) on top of the
existing banner + native setup. Written so it can be picked up without context.

## Current state (what already exists)

- `app/lib/services/ad_service.dart` — owns UMP consent (`requestConsent`),
  ad unit IDs, and `waitForConsent()` (widget-safe polling of `canRequestAds`).
- `app/lib/widgets/banner_ad_widget.dart` / `native_ad_widget.dart` — retry
  with backoff + consent wait (`AdService.isTestEnv` guard for widget tests).
- `main.dart` —awaited `Firebase`, cache, `ApiService().init()`,
  `MobileAds.instance.initialize()`, then `AdService.instance.requestConsent()`
  before `runApp`. AppOpenAd needs this same sequential moment.
- Splash screen: `app/lib/screens/splash_screen.dart`.
- Test ad unit IDs live in `AdService` (`_useTestAds` toggle flips all).

## Step 0 — create ad units in AdMob console

1. App-open: `Application` settings → **App open** ad unit → copy ID.
2. Interstitial: **Interstitial** ad unit → copy ID.
3. Replace the new constants below (keep the `_useTestAds` toggle pattern):

```dart
static const String _testAppOpenAndroid = 'ca-app-pub-3940256099942544/3419835254'; // official test id
static const String _testAppOpenIos = 'ca-app-pub-3940256099942544/5662895249'; // add the ios test id
static const String _testInterstitialAndroid = 'ca-app-pub-3940256099942544/1033173712';
static const String _testInterstitialIos = 'ca-app-pub-3940256099942544/4434898707';

static const String _prodAppOpenAndroid = 'ca-app-pub-8377801269353159/XXXXXXXXXX';
static const String _prodAppOpenIos = 'ca-app-pub-8377801269353159/XXXXXXXXXX';
static const String _prodInterstitialAndroid = 'ca-app-pub-8377801269353159/XXXXXXXXXX';
static const String _prodInterstitialIos = 'ca-app-pub-8377801269353159/XXXXXXXXXX';
```

## Step 1 — extend AdService (app/lib/services/ad_service.dart)

Add loading + show logic, always consent-gated, always eager-loaded:

```dart
AppOpenAd? _appOpenAd;
InterstitialAd? _interstitial;
DateTime _lastInterstitialShown = DateTime.fromMillisecondsSinceEpoch(0);
bool _showAppOpenPending = false;

static const _appOpenInterval = Duration(hours: 1); // don't show on every foreground
static const _interstitialInterval = Duration(minutes: 2);
static const _interstitialGrace = 1; // skip full-screen ads in the first N detail screens of a session

/// Eagerly load both: no-op while !canRequestAds, retried via existing
/// waitForConsent timer, reloads after each show (so the NEXT one is ready).
Future<void> preloadFullAds() async {
  if (!await waitForConsent(const Duration(seconds: 45))) return;
  await _loadAppOpen();
  await _loadInterstitial();
}

Future<void> _loadAppOpen() {
  // Orientation default. Use AppOpenAdListener onAdFailedToLoad: dispose +
  // schedule reload in 60s. Cache the ad with timeout `DateTime.now()`.
}

Future<void> _loadInterstitial() { /* same pattern with InterstitialAd */ }

/// Called after the splash screen finish (see Step 2). Shows if loaded and
/// enough time passed since last show.
Future<void> maybeShowAppOpen({required VoidCallback onDone});

/// Call from app-detail → back-to-list transition. NEVER when leaving the
/// download area (see Policy rules).
Future<void> maybeShowInterstitial();
```

Notes:

- **Always create a FRESH show callback per call** (the GoogleAd listener
  object is single-use — native/banner hidden in this codebase already
  demonstrate reuse problems).
- Both ads must be loaded **before** the moment they're shown, otherwise you
  lose the impression (that's why preload goes into `main.dart`).
- Respect `isTestEnv` (skip loading/showing inside widget tests to avoid
  pending-timer test failures).

## Step 2 — wire app-open ad (app/lib/main.dart + splash_screen.dart)

1. In `main.dart` after `AdService.instance.requestConsent()` call
   `await AdService.instance.preloadFullAds();`
2. In `splash_screen.dart`, at the moment the splash finishes, call
   `maybeShowAppOpen(...)` — pass a callback that continues the normal
   navigation regardless of whether the ad showed or failed (always continue;
   a failed ad must not block the app).
3. Guard inside the service: only show once per `_appOpenInterval`.
   (App lifecycle: also reload on `WidgetsBindingObserver.resume()`.)

## Step 3 — wire the interstitial (app_detail_screen.dart)

- Trigger point: the moment the user returns from app detail to the list —
  **exactly after** the back button, never on the Download tap.
- In the detail screen dispose/pop path:
  `AdService.instance.maybeShowInterstitial();` — service internally checks
  `_interstitialInterval` and the `_interstitialGrace` per-session counter
  (increment a counter when a detail screen is opened; skip if under grace).
- After show completes or is dismissed → dispose + `_loadInterstitial()`.
- Load must be in-flight already (preload + reload-after-show).

## Step 4 — testing checklist

- `_useTestAds = true` in debug on a real device.
- Verify: app open ad shows on cold open once per hour, not on every resume.
- Verify: interstitial shows on detail→back transition after the 2nd session
  visit, never on first-visit screens, never twice within 2 minutes.
- UMP consent: in EEA debug geography, check that ads don't show before
  `canRequestAds` is true.
- Ad Inspector (AdMob debug gesture) — no wall of red.
- Release run-through with `_useTestAds = false` before publishing.

## Step 5 — release

- Switch `_useTestIds` to production IDs only in release profile.
- Watch for unplanned eCPM behavior in the first week; if CTR tanks, the
  frequency caps may be too tight — leave intervals generous at first.

---

## Policy rules — READ BEFORE SHIPPING

DO:
- Show full-screen ads at natural breakpoints (launch / returning to list).
- Frequency cap: AppOpen ≥ 1/hour, Interstitial ≥ 2 minutes apart.
- Never mix formats in one moment (app open OR interstitial, never both).

DO NOT (these are the rules that get ad serving suspended):
- ❌ Ads between the tap on "Download" and the store opening.
- ❌ Interstitials immediately after a download button press.
- ❌ Ads covering an install button or the close (X) button overlap.
- ❌ Full-screen ads while a user's finger is already heading to the action.
- ❌ Ad shown before the app has visibly rendered (loading screen alone is a
  policy minefield: only AppOpenAd format is allowed on launch — it must NOT
  replace a real splash screen; show it on the splash→home transition).

---

## Implementation scope

| File | Change size |
|---|---|
| `ad_service.dart` | ~150 lines (load/show/cap logic) |
| `main.dart` | ~2 lines (preload call) |
| `splash_screen.dart` | ~8 lines (show + continue callback) |
| `app_detail_screen.dart` | ~6 lines (pop → interstitial) |

Estimated half-day of platform work including testing.
