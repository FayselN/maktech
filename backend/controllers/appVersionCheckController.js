/**
 * Version-check endpoint for old (pre-Supabase) app builds.
 *
 * Old builds still talk to this legacy backend. Once a release must become
 * the minimum (e.g. after the Supabase cutover), raise MIN_VERSION_CODE so
 * those builds are forced to update instead of writing to the retired
 * MongoDB.
 *
 * versionCode = buildNumber in app/pubspec.yaml (the part after "+").
 */
const LATEST_VERSION_CODE = 8;
const MIN_VERSION_CODE = 8;

const APP_VERSION = {
  latestVersionCode: LATEST_VERSION_CODE,
  minVersionCode: MIN_VERSION_CODE,
  latestVersionName: '1.3.0',
  releaseNotes: 'Backend and database upgrade for faster, more reliable updates.',
  downloadUrl: 'https://play.google.com/store/apps/details?id=com.maktech.maktech',
};

const versionCheck = async (req, res) => {
  res.json({
    minVersion: APP_VERSION.minVersionCode,
    latestVersion: APP_VERSION.latestVersionCode,
    latestVersionName: APP_VERSION.latestVersionName,
    releaseNotes: APP_VERSION.releaseNotes,
    downloadUrl: APP_VERSION.downloadUrl,
  });
};

module.exports = { versionCheck, APP_VERSION };
