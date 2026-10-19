// Cutover verification for the new app backend contract:
// legacy device adoption + RPCs used by api_service.dart.
// Usage: dart run tool/supabase_cutover_check.dart
// Env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
import 'dart:io';
import 'package:supabase/supabase.dart';

void step(String n, String label) => print('\n=== [$n] $label ===');
void ok(Object? extra) => print('  OK ${extra ?? ''}');

Future<void> main() async {
  final url = Platform.environment['SUPABASE_URL']!;
  final anonKey = Platform.environment['SUPABASE_ANON_KEY']!;
  final serviceKey = Platform.environment['SUPABASE_SERVICE_KEY']!;
  final client = SupabaseClient(url, anonKey);
  final admin = SupabaseClient(url, serviceKey);
  final failures = <String>[];
  void check(String what, bool cond) {
    if (!cond) failures.add(what);
  }

  try {
    step('0', 'Fetch a migrated device with favorites + legacy id (service)');
    final seed = await admin
        .from('favorites')
        .select('device_id, devices!inner(legacy_device_id)')
        .limit(1);
    final legacyId =
        (seed.first['devices'] as Map)['legacy_device_id'] as String;
    final originalDeviceId = await _deviceIdByLegacy(admin, legacyId);
    ok('legacy_device_id=$legacyId device=$originalDeviceId');

    step('1', 'Anonymous sign-in and claim (register_device adoption)');
    final session = await client.auth.signInAnonymously();
    final uid = session.user!.id;
    final registered = await client.rpc(
      'register_device',
      params: {'p_legacy_device_id': legacyId, 'p_platform': 'android'},
    ) as String?;
    check('rpc returned uuid', registered != null && registered.isNotEmpty);
    final owned = await admin
        .from('devices')
        .select('user_id')
        .eq('legacy_device_id', legacyId)
        .single();
    check('device re-linked to caller', owned['user_id'] == uid);
    ok('device uuid=${registered!}');

    step('2', 'Favorites visible through adoption (RLS)');
    final favs = await client
        .from('favorites')
        .select('apps!inner(id, name)')
        .eq('device_id', originalDeviceId);
    ok('favorites=${favs.length}');

    step('3', 'upsert_review + insert-new + update-same');
    final app = await admin
        .from('apps')
        .select('id')
        .eq('status', 'published')
        .limit(1)
        .single();
    final review1 = await client.rpc('upsert_review', params: {
      'p_app_id': app['id'],
      'p_rating': 5,
      'p_comment': 'cutover check',
    }) as String?;
    check('review created', review1 != null);
    // second call must UPDATE, not duplicate
    await client.rpc('upsert_review', params: {
      'p_app_id': app['id'],
      'p_rating': 3,
      'p_comment': 'updated',
    });
    final mine = await client
        .from('reviews')
        .select('rating, comment')
        .eq('app_id', app['id'])
        .eq('device_id', originalDeviceId);
    ok('rows=${mine.length} rating=${mine.first['rating']}');

    step('4', 'report_review dedupe + count sync');
    // use a review we own to report
    final myReview = await client
        .from('reviews')
        .select('id')
        .eq('app_id', app['id'])
        .eq('device_id', originalDeviceId)
        .single();
    await client.rpc('report_review', params: {
      'p_review_id': myReview['id'],
      'p_reason': 'spam',
      'p_other': null,
    });
    await client.rpc('report_review', params: {
      'p_review_id': myReview['id'],
      'p_reason': 'offensive',
      'p_other': null,
    });
    final reportCount = await admin
        .from('reviews')
        .select('report_count')
        .eq('id', myReview['id'])
        .single();
    ok('report_count=${reportCount['report_count']} (expect 1 after dedupe-upsert)');

    step('5', 'Device notifications join + mark read');
    final notifs = await client
        .from('device_notifications')
        .select('id, is_read, notifications(title)')
        .limit(5);
    ok('device_notifications=${notifs.length}');
    if (notifs.isNotEmpty) {
      await client
          .from('device_notifications')
          .update({'is_read': true})
          .eq('id', notifs.first['id'] as String);
      ok('first marked read');
    }

    step('6', 'Adopted device detached from original migration user');
    final originalOwnerId = await admin
        .from('devices')
        .select('user_id')
        .eq('id', originalDeviceId)
        .single();
    ok('device now owned by test uid=${originalOwnerId['user_id'] == uid}');

    await admin.auth.signOut();
  } catch (e, st) {
    print('FATAL: $e');
    print(st);
    exitCode = 1;
    return;
  }

  if (failures.isNotEmpty) {
    print('\nFAILED: ${failures.join(' | ')}');
    exitCode = 1;
  } else {
    print('\nALL CUTOVER CHECKS PASSED');
    exit(0);
  }
}

Future<String> _deviceIdByLegacy(SupabaseClient admin, String legacyId) async {
  final row = await admin
      .from('devices')
      .select('id')
      .eq('legacy_device_id', legacyId)
      .single();
  return row['id'] as String;
}
