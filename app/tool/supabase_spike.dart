// Supabase Data API spike — runs the full anonymous-device flow from Dart
// against a Supabase project. Not part of the app (lives outside lib/).
// Usage: dart run tool/supabase_spike.dart
// Env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY (all required)
import 'dart:io';
import 'package:supabase/supabase.dart';

void step(String n, String label) =>
    print('\n=== [$n] $label ===');

void ok(Object? extra) => print('  OK ${extra ?? ''}');

Future<void> main() async {
  final url = Platform.environment['SUPABASE_URL']!;
  final anonKey = Platform.environment['SUPABASE_ANON_KEY']!;
  final serviceKey = Platform.environment['SUPABASE_SERVICE_KEY']!;

  final client = SupabaseClient(url, anonKey);
  final admin = SupabaseClient(url, serviceKey);

  final failures = <String>[];
  final uidTmp = <String>{};

  try {
    // ------------------------------------------------------------------
    step('1', 'Anonymous sign-in (device identity)');
    final session = await client.auth.signInAnonymously();
    final uid = session.user!.id;
    uidTmp.add(uid);
    ok('uid=$uid isAnonymous=${session.user!.isAnonymous}');

    // ------------------------------------------------------------------
    step('2', 'Register device (idempotent)');
    var deviceRow = await client
        .from('devices')
        .select('id')
        .eq('user_id', uid)
        .maybeSingle();
    if (deviceRow == null) {
      deviceRow =
          await client.from('devices').insert({
            'user_id': uid,
            'platform': 'android',
            'fcm_token': 'spike-fcm-${DateTime.now().millisecondsSinceEpoch}',
          }).select().single();
      ok('inserted device=${deviceRow['id']}');
    } else {
      ok('existing device=${deviceRow['id']}');
    }
    final deviceId = deviceRow['id'] as String;
    uidTmp.addAll([]);

    // ------------------------------------------------------------------
    step('3', 'Seed one published app (admin, service role)');
    final suffix = DateTime.now().millisecondsSinceEpoch;
    final appRow = await admin.from('apps').insert({
      'name': 'Spike App',
      'slug': 'spike-app-$suffix',
      'search_code': 'spike$suffix',
      'curiosity_title': 'Spike curiosity',
      'short_description': 'Short spike description',
      'long_description': 'Long spike description',
      'package_name': 'com.spike.app$suffix',
      'play_store_url': 'https://junk/u$suffix',
      'icon_url': 'https://junk/i$suffix',
      'status': 'published',
    }).select().single();
    final appId = appRow['id'] as String;
    ok('app=${appRow['slug']}');

    // ------------------------------------------------------------------
    step('4', 'Read catalog as anon (published filter works)');
    final catalog = await client.from('apps').select('name,slug').limit(10);
    ok('visible apps: ${catalog.map((r) => r['slug']).join(', ')}');

    // ------------------------------------------------------------------
    step('5', 'Favorites: add + list with app embed');
    try {
      await client.from('favorites').insert({'device_id': deviceId, 'app_id': appId});
      ok('insert #1');
    } catch (e) {
      ok('insert returned error (already exists) $e');
    }
    final favs = await client
        .from('favorites')
        .select('id, app_id(name, slug)')
        .eq('device_id', deviceId);
    ok('favorites: ${favs.map((f) => f['app_id'] is Map ? f['app_id']['name'] : f['app_id'])}');
    final count = await admin.from('apps').select('favorite_count').eq('id', appId).single();
    ok('favorite_count trigger = ${count['favorite_count']}');

    // ------------------------------------------------------------------
    step('6', 'Review: insert + trigger recomputes rating stats');
    await client.from('reviews').insert(
      {'app_id': appId, 'device_id': deviceId, 'rating': 4, 'comment': 'spike test review'},
    );
    final stats = await admin
        .from('apps')
        .select('rating_average, rating_count')
        .eq('id', appId)
        .single();
    ok('stats now: avg=${stats['rating_average']} count=${stats['rating_count']}');
    // duplicate protection
    var dupBlocked = false;
    try {
      await client.from('reviews').insert(
        {'app_id': appId, 'device_id': deviceId, 'rating': 1},
      );
    } on PostgrestException {
      dupBlocked = true;
    }
    ok('dup review blocked=$dupBlocked');

    // ------------------------------------------------------------------
    step('7', 'RPC bump_view');
    await client.rpc('bump_view', params: {'p_app_id': appId});
    final views = await admin.from('apps').select('view_count').eq('id', appId).single();
    ok('view_count = ${views['view_count']}');

    // ------------------------------------------------------------------
    step('8', 'Recently viewed write');
    try {
      await client.from('recently_viewed').insert({'device_id': deviceId, 'app_id': appId});
      ok('inserted recently_viewed');
    } catch (e) {
      ok('recently_viewed insert exception: $e');
    }
    final rv = await client
        .from('recently_viewed')
        .select('id, app_id: apps(slug)')
        .eq('device_id', deviceId);
    ok('recently_viewed rows=${rv.length}');

    // ------------------------------------------------------------------
    step('9', 'Device notifications: create notification, mark read');
    final notif = await admin.from('notifications').insert({
      'title': 'Spike notification',
      'body': 'body',
      'app_id': appId,
      'type': 'general',
    }).select().single();
    final notifId = notif['id'] as String;
    await client.from('device_notifications').insert({
      'device_id': deviceId,
      'notification_id': notifId,
    });
    final dn = await client
        .from('device_notifications')
        .select('id, is_read, notification_id(title)')
        .eq('device_id', deviceId);
    ok('rows=${dn.length} read=${dn[0]['is_read']} via=${(dn[0]['notification_id'] as Map)['title']}');
    await client
        .from('device_notifications')
        .update({'is_read': true}).eq('id', dn[0]['id'] as String);
    final dn2 = await client
        .from('device_notifications')
        .select('is_read')
        .eq('id', dn[0]['id'] as String)
        .single();
    ok('after update is_read=${dn2['is_read']}');

    // ------------------------------------------------------------------
    step('10', 'Cross-device isolation (second anonymous session)');
    final client2 = SupabaseClient(url, anonKey);    final session2 = await client2.auth.signInAnonymously();
    uidTmp.add(session2.user!.id);
    final uid2 = session2.user!.id;
    final dev2 =
        await client2.from('devices').insert({
          'user_id': uid2,
          'platform': 'ios',
        }).select().single();
    final deviceId2 = dev2['id'] as String;
    final theirFavs = await client2.from('favorites').select().eq('device_id', deviceId);
    ok('sees other device favorites: ${theirFavs.length} (expect 0)');
    final theirRv = await client2
        .from('recently_viewed')
        .select()
        .eq('device_id', deviceId);
    ok('sees other recently_viewed: ${theirRv.length} (expect 0)');
    // spoofing: try to insert a review pointing to device1
    var spoofBlocked = false;
    try {
      await client2.from('reviews').insert(
        {'app_id': appId, 'device_id': deviceId, 'rating': 2},
      );
    } on PostgrestException {
      spoofBlocked = true;
    }
    ok('insert review as other device blocked=$spoofBlocked');
    client2.dispose();

    // ------------------------------------------------------------------
    step('done', 'Summary');
    print('Device A: $deviceId');
    print('Device B: $deviceId2');
  } catch (e, st) {
    failures.add(e.toString());
    print('\n!!! FAILED: $e');
    print(st);
  } finally {
    // ------------------------------------------------------------------
    step('cleanup', 'Removing test rows');
    final appIds = await admin.from('apps').select('id').like('slug', 'spike-app-%');
    for (final row in appIds) {
      await admin.from('apps').delete().eq('id', row['id'] as String);
    }
    for (final uid in uidTmp) {
      try {
        await admin.auth.admin.deleteUser(uid);
      } catch (e) {
        print('  auth user $uid delete: $e');
      }
    }
    print('  cleaned');
  }

  if (failures.isNotEmpty) {
    print('\nFAILURES: ${failures.length}');
    // ignore: avoid_print
    exitCode = 1;
  }
  await client.dispose();
  await admin.dispose();
  exit(exitCode);
}
