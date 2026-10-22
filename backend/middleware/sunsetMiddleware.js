const { APP_VERSION } = require('../controllers/appVersionCheckController');

/**
 * Sunset middleware for the legacy Render backend.
 *
 * Old Flutter builds (v1.2.0+7 and below) still make requests to this Express backend.
 * Once the Supabase migration is live, this middleware intercepts content requests
 * from legacy clients and returns HTTP 426 (Upgrade Required) with a clear message
 * and the Google Play download URL.
 *
 * The old Flutter app's error handler extracts `body['message']` and displays it
 * directly to the user on the home screen error state.
 *
 * Exemptions:
 * - /apps/version-check (always allowed so clients can query version info)
 * - /health, /api/v1/health (monitoring & uptime checks)
 * - /privacy-policy (Google Play Store compliance)
 * - Any request sending X-App-Build or X-App-Version >= MIN_VERSION_CODE
 * - When process.env.SUNSET_ENABLED === 'false' (allows disabling sunset if needed)
 */
const sunsetMiddleware = (req, res, next) => {
  // Can be temporarily disabled via environment variable if needed
  if (process.env.SUNSET_ENABLED === 'false') {
    return next();
  }

  // Allow newer clients if they pass a version header >= minVersionCode
  const clientBuild = parseInt(
    req.headers['x-app-build'] || req.headers['x-app-version'] || '0',
    10,
  );
  if (clientBuild >= APP_VERSION.minVersionCode) {
    return next();
  }

  return res.status(426).json({
    status: 'upgrade_required',
    message: 'A required update is available. Please update Mak Tech from the Google Play Store to continue.',
    minVersion: APP_VERSION.minVersionCode,
    latestVersion: APP_VERSION.latestVersionCode,
    latestVersionName: APP_VERSION.latestVersionName,
    releaseNotes: APP_VERSION.releaseNotes,
    downloadUrl: APP_VERSION.downloadUrl,
  });
};

module.exports = sunsetMiddleware;
