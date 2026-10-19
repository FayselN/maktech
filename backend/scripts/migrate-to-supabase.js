/* MongoDB -> Supabase (Postgres/PostgREST) one-shot data migration.
 *
 * Usage (from repo root):
 *   node backend/scripts/migrate-to-supabase.js [--limit-devices N] [--dry-run]
 *
 * Requires: linked supabase project (supabase/.temp), supabase CLI logged in,
 * MONGODB_URI present in backend/.env.
 *
 * Behavior:
 *  - deterministic UUIDs (uuidv5 from Mongo _id) so re-runs are idempotent
 *  - public tables written via PostgREST (service_role): merge-duplicates
 *  - auth.users rows via `supabase db query --linked --file` (SQL),
 *    admins keep their existing bcrypt passwords, devices become anonymous users
 *  - apps/devices rating & favorite stats recomputed by existing DB triggers
 *  - does NOT delete rows that were deleted in Mongo (upsert-only migration)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SQL_DIR = path.join('/tmp', 'opencode', 'sql');

// ---------------------------------------------------------------------------
// env + supabase project discovery
// ---------------------------------------------------------------------------

function loadEnvFile(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return env;
}

const backendEnv = loadEnvFile(path.join(REPO_ROOT, 'backend', '.env'));
const tempRef = fs
  .readFileSync(path.join(REPO_ROOT, 'supabase', '.temp', 'project-ref'), 'utf8')
  .trim();

const SUPABASE_URL = process.env.SUPABASE_URL || `https://${tempRef}.supabase.co`;

function supabaseKeys() {
  const out = execFileSync('supabase', ['projects', 'api-keys', '--project-ref', tempRef, '-o', 'json'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  const keys = JSON.parse(out);
  return {
    anon: keys.find((k) => k.name === 'anon').api_key,
    service: keys.find((k) => k.name === 'service_role').api_key,
  };
}

// ---------------------------------------------------------------------------
// deterministic uuidv5
// ---------------------------------------------------------------------------

const NS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // DNS-style fixed namespace
function uuid5(seed) {
  const hash = crypto.createHash('sha1').update(NS).update(seed).digest();
  const hex = hash.slice(0, 16);
  hex[6] = (hex[6] & 0x0f) | 0x50; // version 5
  hex[8] = (hex[8] & 0x3f) | 0x80; // RFC 4122 variant
  const s = hex.toString('hex');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

// ---------------------------------------------------------------------------
// supabase writes
// ---------------------------------------------------------------------------

const { anon: _anonKey, service } = supabaseKeys();
void _anonKey;

function sqlFile(name, statements) {
  fs.mkdirSync(SQL_DIR, { recursive: true });
  const file = path.join(SQL_DIR, `${name}.sql`);
  fs.writeFileSync(file, statements.join(';\n') + '\n');
  let stdout = '';
  try {
    stdout = execFileSync('supabase', ['db', 'query', '--linked', '--file', file], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    });
  } catch (e) {
    throw new Error(`sql ${name}: ${e.status}: ${e.stdout?.slice(0, 600) || 'see supabase output'}`);
  }
  return stdout;
}

function dbQueryRows(sql) {
  fs.mkdirSync(SQL_DIR, { recursive: true });
  const file = path.join(SQL_DIR, 'query.sql');
  fs.writeFileSync(file, sql);
  const out = execFileSync('supabase', ['db', 'query', '--linked', '-o', 'json', '--file', file], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  const start = out.indexOf('[');
  return JSON.parse(out.slice(start));
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function upsert(table, rows, onConflict) {
  if (rows.length === 0) return 0;
  let written = 0;
  for (const part of chunk(rows, 500)) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
      method: 'POST',
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(part),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`upsert ${table}: ${res.status} ${text.slice(0, 400)}`);
    }
    written += part.length;
  }
  return written;
}

// ---------------------------------------------------------------------------
// SQL builders for auth.users
// ---------------------------------------------------------------------------

function q(str) {
  return `'${String(str).replace(/'/g, "''")}'`;
}

function qd(date) {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
}

// GoTrue requires instance_id = 00000000-... and non-NULL token columns;
// SQL-inserted rows missing them are invisible to / unusable by the auth API.
const AUTH_USER_HYGIENE = `
update auth.users set instance_id = '00000000-0000-0000-0000-000000000000' where instance_id is null;
update auth.users set
  confirmation_token = '', recovery_token = '', email_change_token_new = '',
  email_change = '', email_change_token_current = coalesce(email_change_token_current, ''),
  reauthentication_token = coalesce(reauthentication_token, ''),
  phone_change_token = coalesce(phone_change_token, '')
where instance_id = '00000000-0000-0000-0000-000000000000';`;

// anonymous auth users for every mongo device (one per device)
function anonUserValues(users) {  return users
    .map(
      (u) => `(${q(u.id)}, 'authenticated', 'authenticated', true, ${q(u.created)}, ${q(u.created)})`,
    )
    .join(',\n');
}
function adminInsert(authorId, email, passwordHash, created) {
  return `insert into auth.users (id, aud, role, is_anonymous, is_sso_user, email, email_confirmed_at, encrypted_password, created_at, updated_at, raw_app_meta_data, raw_user_meta_data) values
    (${q(authorId)}, 'authenticated', 'authenticated', false, false, ${q(email)}, ${q(created)}, ${q(passwordHash)}, ${q(created)}, ${q(created)}, '{}', '{}')
    on conflict (id) do update set
      email = excluded.email,
      encrypted_password = excluded.encrypted_password;`;
}

async function insertAuthRows(anonUsers, admins) {
  fs.mkdirSync(SQL_DIR, { recursive: true });
  const stmts = [];
  if (admins.length > 0) {
    // emails are unique in auth.users; skip admins whose login already exists
    const emailList = admins.map((a) => q(a.email)).join(',');
    const existing = new Set(
      dbQueryRows(`select email from auth.users where email in (${emailList})`).map((r) => r.email),
    );
    const toInsert = admins.filter((a) => {
      if (existing.has(a.email)) {
        console.log(`[auth] admin ${a.email} already exists, skipping (existing password kept)`);
        return false;
      }
      return true;
    });
    // admins: keep the dashboard password as-is by importing bcrypt hash
    for (const a of toInsert) {
      stmts.push(adminInsert(a.id, a.email, a.passwordHash, qd(a.created)));
    }
  }
  // anonymous device users (batched VALUES)
  for (const part of chunk(anonUsers, 400)) {
    stmts.push(
      `insert into auth.users (id, aud, role, is_anonymous, created_at, updated_at) values\n${anonUserValues(
        part,
      )}\non conflict (id) do nothing;`,
    );
  }
  stmts.push(AUTH_USER_HYGIENE);
  sqlFile('auth_users', stmts);
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function waitForMongo(mongoose, uri, tries = 30) {
  const client = mongoose.connection.getClient();
  let attempt = 0;
  while (true) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
      return;
    } catch (e) {
      attempt += 1;
      if (attempt >= tries) throw e;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitIdx = args.indexOf('--limit-devices');
  const deviceLimit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : null;

  const uri = process.env.MONGODB_URI || backendEnv.MONGODB_URI;
  if (!uri || uri.includes('PASTE')) throw new Error('MONGODB_URI missing in backend/.env');

  const mongoose = require('mongoose');
  for (const f of fs.readdirSync(path.join(__dirname, '..', 'models'))) {
    if (f.endsWith('.js')) require(path.join('..', 'models', f));
  }
  console.log('[mongo] connecting...');
  await waitForMongo(mongoose, uri);
  const App = mongoose.model('App');
  const Category = mongoose.model('Category');
  const Review = mongoose.model('Review');
  const Favorite = mongoose.model('Favorite');
  const RecentlyViewed = mongoose.model('RecentlyViewed');
  const Device = mongoose.model('Device');
  const DeviceNotification = mongoose.model('DeviceNotification');
  const Notification = mongoose.model('Notification');
  const Admin = mongoose.model('Admin');
  const DailyFeatured = mongoose.model('DailyFeatured');
  const ReviewReport = mongoose.model('ReviewReport');
  const AdminActivityLog = mongoose.model('AdminActivityLog');

  const [categories, apps, admins, devices] = await Promise.all([
    Category.find({}).lean(),
    App.find({}).lean(),
    Admin.find({}).lean(),
    (async () => {
      const q = Device.find({}).lean();
      if (deviceLimit) q.limit(deviceLimit);
      return q;
    })(),
  ]);
  console.log(
    `[mongo] apps=${apps.length} categories=${categories.length} admins=${admins.length} devices=${devices.length}`,
  );

  // category slugs (case-sensitive map; skip unknown at call sites)
  const categoryBySlug = new Map(categories.map((c) => [c.slug, uuid5('category:' + c._id)]));
  const categoryByMongoId = new Map(categories.map((c) => [c._id.toString(), uuid5('category:' + c._id)]));

  // ---- categories ---------------------------------------------------------
  const categoriesRows = categories.map((c) => ({
    id: uuid5('category:' + c._id),
    name: c.name,
    slug: c.slug,
    icon_url: c.iconUrl ?? null,
    sort_order: Number(c.sortOrder ?? 0),
    created_at: qd(c.createdAt),
    updated_at: qd(c.updatedAt),
  }));

  // ---- admins: id mapping + profile rows -----------------------------------
  const adminByMongoId = new Map(admins.map((a) => [a._id.toString(), uuid5('admin:' + a._id)]));
  const adminsRows = admins.map((a) => ({
    id: uuid5('admin:' + a._id),
    email: a.email,
    passwordHash: a.passwordHash,
    created: a.createdAt || a.updatedAt || null,
  }));
  const adminProfilesRows = admins.map((a) => ({
    user_id: uuid5('admin:' + a._id),
    name: a.name,
    is_active: a.isActive !== false,
    created_at: qd(a.createdAt),
    updated_at: qd(a.updatedAt),
  }));

  // ---- apps + screenshots + app/categories ---------------------------------
  const appByMongoId = new Map(apps.map((a) => [a._id.toString(), uuid5('app:' + a._id)]));
  const appsRows = apps.map((a) => ({
    id: uuid5('app:' + a._id),
    name: a.name,
    slug: a.slug || `app-${a._id}`,
    search_code: a.searchCode || `app-${Date.now()}-${Math.floor(Math.random() * 1e6)}` /* fallback for legacy rows */,
    curiosity_title: a.curiosityTitle || a.name,
    short_description: a.shortDescription || '',
    long_description: a.longDescription || a.shortDescription || '',
    developer_name: a.developerName ?? null,
    package_name: a.packageName || `legacy.${a.slug || a._id}`,
    play_store_url: a.playStoreUrl || '',
    app_store_url: a.appStoreUrl ?? null,
    icon_url: a.iconUrl || '',
    price_type: a.priceType ?? 'free',
    play_store_rating: Number(a.playStoreRating ?? 0),
    features: a.features ?? [],
    pros: a.pros ?? [],
    cons: a.cons ?? [],
    // copied from Mongo; review triggers will recompute from review rows below
    rating_average: Number(a.ratingStats?.average ?? 0),
    rating_count: Number(a.ratingStats?.count ?? 0),
    status: a.status === 'published' ? 'published' : 'draft',
    is_new_app: a.isNewApp !== false,
    view_count: Number(a.viewCount ?? 0),
    favorite_count: Number(a.favoriteCount ?? 0),
    created_by: a.createdBy ? adminByMongoId.get(a.createdBy.toString()) ?? null : null,
    updated_by: a.updatedBy ? adminByMongoId.get(a.updatedBy.toString()) ?? null : null,
    created_at: qd(a.createdAt),
    updated_at: qd(a.updatedAt),
  }));

  const appCategoryRows = [];
  let skippedCategoryRefs = 0;
  for (const a of apps) {
    for (const slug of a.categories ?? []) {
      const cid = categoryBySlug.get(slug);
      if (!cid) {
        skippedCategoryRefs += 1;
        continue;
      }
      appCategoryRows.push({ app_id: uuid5('app:' + a._id), category_id: cid });
    }
  }

  const screenshotRows = apps.flatMap((a) =>
    (a.screenshots ?? []).map((s, i) => ({
      id: uuid5(`screenshot:${a._id}:${i}:${s.url}`),
      app_id: uuid5('app:' + a._id),
      url: s.url,
      sort_order: Number(s.order ?? 0),
    })),
  );

  // ---- notifications -------------------------------------------------------
  const notifications = await Notification.find({}).lean();
  const notificationsRows = notifications.map((n) => ({
    id: uuid5('notification:' + n._id),
    title: n.title,
    body: n.body,
    app_id: n.appId ? appByMongoId.get(n.appId.toString()) ?? null : null,
    type: n.type ?? 'general',
    sent_by: n.sentBy ? adminByMongoId.get(n.sentBy.toString()) ?? null : null,
    sent_at: qd(n.sentAt),
    created_at: qd(n.createdAt),
  }));

  // ---- devices (auth.users anonymous + devices rows) ------------------------
  const deviceIdByMongoDevice = new Map(devices.map((d) => [d.deviceId, uuid5('device:' + d._id)]));
  const anonAuthUsers = devices.map((d) => ({ id: uuid5('device:' + d._id), created: qd(d.createdAt) }));
  const devicesRows = devices.map((d) => ({
    id: uuid5('device:' + d._id),
    user_id: uuid5('device:' + d._id),
    legacy_device_id: d.deviceId,
    fcm_token: d.fcmToken ?? null,
    platform: (d.platform || 'android').toLowerCase(),
    last_active_at: qd(d.lastActiveAt),
    created_at: qd(d.createdAt),
    updated_at: qd(d.updatedAt),
  }));

  // ---- reviews / favorites / recently viewed / device notifications --------
  const reviews = await Review.find({}).lean();
  const reviewByMongoId = new Map(reviews.map((r) => [r._id.toString(), uuid5('review:' + r._id)]));
  const reviewsRows = reviews
    .filter((r) => deviceIdByMongoDevice.has(r.deviceId) && appByMongoId.has(r.appId.toString()))
    .map((r) => ({
      id: uuid5('review:' + r._id),
      app_id: appByMongoId.get(r.appId.toString()),
      device_id: deviceIdByMongoDevice.get(r.deviceId),
      rating: Number(r.rating),
      comment: r.comment ?? null,
      status: r.status ?? 'published',
      report_count: Number(r.reportCount ?? 0),
      created_at: qd(r.createdAt),
      updated_at: qd(r.updatedAt),
    }));

  const favorites = await Favorite.find({}).lean();
  const favoritesRows = favorites
    .filter((f) => deviceIdByMongoDevice.has(f.deviceId) && appByMongoId.has(f.appId.toString()))
    .map((f) => ({
      id: uuid5('favorite:' + f._id),
      device_id: deviceIdByMongoDevice.get(f.deviceId),
      app_id: appByMongoId.get(f.appId.toString()),
      created_at: qd(f.createdAt),
    }));

  const recentlyViewed = await RecentlyViewed.find({}).lean();
  const recentlyViewedRows = recentlyViewed
    .filter((r) => deviceIdByMongoDevice.has(r.deviceId) && appByMongoId.has(r.appId.toString()))
    .map((r) => ({
      id: uuid5('recentlyviewed:' + r._id),
      device_id: deviceIdByMongoDevice.get(r.deviceId),
      app_id: appByMongoId.get(r.appId.toString()),
      viewed_at: qd(r.viewedAt),
    }));

  const deviceNotifications = await DeviceNotification.find({}).lean();
  // dedupe (same device_id+notification_id pair would violate the unique index)
  const seenDn = new Set();
  const deviceNotificationsRows = deviceNotifications
    .filter((dn) => {
      const key = `${dn.deviceId}|${dn.notificationId}`;
      if (seenDn.has(key)) return false;
      seenDn.add(key);
      return (
        deviceIdByMongoDevice.has(dn.deviceId) &&
        notifications.some((n) => n._id.toString() === dn.notificationId.toString())
      );
    })
    .map((dn) => ({
      id: uuid5('devicenotification:' + dn._id),
      device_id: deviceIdByMongoDevice.get(dn.deviceId),
      notification_id: uuid5('notification:' + dn.notificationId),
      is_read: !!dn.isRead,
      received_at: qd(dn.receivedAt),
    }));

  // ---- daily featured -------------------------------------------------------
  const dailyFeatured = await DailyFeatured.find({}).lean();
  const dailyFeaturedRows = dailyFeatured
    .filter((d) => appByMongoId.has(d.appId.toString()))
    .map((d) => ({
      id: uuid5('dailyfeatured:' + d._id),
      app_id: appByMongoId.get(d.appId.toString()),
      featured_date: new Date(d.featuredDate).toISOString().slice(0, 10),
      created_by: d.createdBy ? adminByMongoId.get(d.createdBy.toString()) ?? null : null,
      created_at: qd(d.createdAt),
      updated_at: qd(d.updatedAt),
    }));

  // ---- review reports --------------------------------------------------------
  const reviewReports = await ReviewReport.find({}).lean();
  const mappedReviewIds = new Set(reviewsRows.map((r) => r.id));
  const reviewReportsRows = reviewReports
    .filter(
      (r) =>
        reviewByMongoId.has(r.reviewId.toString()) &&
        mappedReviewIds.has(reviewByMongoId.get(r.reviewId.toString())) &&
        deviceIdByMongoDevice.has(r.deviceId),
    )
    .map((r) => ({
      id: uuid5('reviewreport:' + r._id),
      review_id: reviewByMongoId.get(r.reviewId.toString()),
      device_id: deviceIdByMongoDevice.get(r.deviceId),
      reason: r.reason ?? 'other',
      other_reason: r.otherReason ?? null,
      created_at: qd(r.createdAt),
    }));

  // ---- admin activity logs ---------------------------------------------------
  const activityLogs = await AdminActivityLog.find({}).lean();
  const activityLogsRows = activityLogs
    .filter((l) => adminByMongoId.has(l.adminId.toString()))
    .map((l) => {
      const tid = l.targetId?.toString();
      return {
        id: uuid5('activitylog:' + l._id),
        admin_id: adminByMongoId.get(l.adminId.toString()),
        action: l.action,
        target_type: l.targetType,
        target_id:
          !tid
            ? null
            : l.targetType === 'app'
              ? appByMongoId.get(tid) ?? null
              : l.targetType === 'category'
                ? categoryByMongoId.get(tid) ?? null
                : l.targetType === 'notification'
                  ? uuid5('notification:' + tid)
                  : null,
        changes: l.changes ?? null,
        created_at: qd(l.createdAt),
      };
    });

  // ---------------------------------------------------------------------------
  // apply
  // ---------------------------------------------------------------------------
  if (dryRun) {
    console.log('[dry-run] row counts to write:', JSON.stringify({
      categories: categoriesRows.length,
      admins: adminsRows.length,
      apps: appsRows.length,
      appCategories: appCategoryRows.length,
      screenshots: screenshotRows.length,
      notifications: notificationsRows.length,
      devices: devicesRows.length,
      anonAuthUsers: anonAuthUsers.length,
      reviews: reviews.length,
      reviewsMapped: reviewsRows.length,
      favorites: favorites.length,
      favoritesMapped: favoritesRows.length,
      recentlyViewed: recentlyViewed.length,
      recentlyViewedMapped: recentlyViewedRows.length,
      deviceNotificationsMapped: deviceNotificationsRows.length,
      dailyFeaturedMapped: dailyFeaturedRows.length,
      reviewReportsMapped: reviewReportsRows.length,
      activityLogsMapped: activityLogsRows.length,
      skippedCategoryRefs,
    }, null, 2));
    await mongoose.disconnect();
    return;
  }

  console.log('[supabase] writing auth.users (admins + anon devices)...');
  await insertAuthRows(anonAuthUsers, adminsRows);

  console.log('[supabase] categories...', await upsert('categories', categoriesRows, 'id'));
  console.log('[supabase] admin_profiles...', await upsert('admin_profiles', adminProfilesRows, 'user_id'));
  console.log('[supabase] apps...', await upsert('apps', appsRows, 'id'));
  console.log('[supabase] app_categories...', await upsert('app_categories', appCategoryRows, 'app_id,category_id'));
  console.log('[supabase] app_screenshots...', await upsert('app_screenshots', screenshotRows, 'id'));
  console.log('[supabase] notifications...', await upsert('notifications', notificationsRows, 'id'));
  console.log('[supabase] devices...', await upsert('devices', devicesRows, 'id'));
  console.log('[supabase] reviews...', await upsert('reviews', reviewsRows, 'id'));
  console.log('[supabase] favorites...', await upsert('favorites', favoritesRows, 'id'));
  console.log('[supabase] recently_viewed...', await upsert('recently_viewed', recentlyViewedRows, 'id'));
  console.log('[supabase] device_notifications...', await upsert('device_notifications', deviceNotificationsRows, 'id'));
  console.log('[supabase] daily_featured...', await upsert('daily_featured', dailyFeaturedRows, 'id'));
  console.log('[supabase] review_reports...', await upsert('review_reports', reviewReportsRows, 'id'));
  console.log('[supabase] admin_activity_logs...', await upsert('admin_activity_logs', activityLogsRows, 'id'));

  console.log('\n[done] migration finished.');
  if (skippedCategoryRefs) console.log(`[warn] ${skippedCategoryRefs} app.category slugs had no category match`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('\n[migration failed]', e.message || e);
  process.exit(1);
});
