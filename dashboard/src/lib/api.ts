import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Compatibility layer: same `api.get/post/put/delete/upload` surface the pages
// already use, backed by Supabase (Data API + edge functions + Supabase Auth).
// ---------------------------------------------------------------------------

type Path = string;

function parsePath(path: string) {
  const [cleanPath, query] = path.split('?');
  const params = new URLSearchParams(query || '');
  return <{
    path: string;
    params: URLSearchParams;
  }>{ path: cleanPath, params };
}

function snake(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()] = v;
  }
  return out;
}

function err(_status: number, message: string): never {
  throw new Error(message);
}

// ---------------------------------------------------------------------------
// App row <-> legacy shape normalization
// ---------------------------------------------------------------------------

function normalizeApp(row: Record<string, unknown>): Record<string, unknown> {
  const appCategories = (row.app_categories ?? []) as Array<{ categories?: { slug?: string } }>;
  const screenshots = (row.app_screenshots ?? []) as Array<{ id: string; url: string; sort_order: number }>;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    slug: row.slug,
    searchCode: row.search_code,
    curiosityTitle: row.curiosity_title,
    shortDescription: row.short_description,
    longDescription: row.long_description,
    developerName: row.developer_name,
    packageName: row.package_name,
    playStoreUrl: row.play_store_url,
    iconUrl: row.icon_url,
    priceType: row.price_type,
    playStoreRating: Number(row.play_store_rating ?? 0),
    categories: appCategories
      .map((c) => c.categories?.slug)
      .filter((s): s is string => !!s),
    features: row.features ?? [],
    pros: row.pros ?? [],
    cons: row.cons ?? [],
    ratingStats: {
      average: Number(row.rating_average ?? 0),
      count: Number(row.rating_count ?? 0),
    },
    iconColor: '#4f46e5',
    rating: 0,
    ratingCount: String(row.rating_count ?? 0),
    downloadCount: 0,
    status: row.status,
    viewCount: Number(row.view_count ?? 0),
    favoriteCount: Number(row.favorite_count ?? 0),
    isNew: row.is_new_app,
    screenshots: screenshots
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s) => ({ _id: s.id, url: s.url, order: s.sort_order })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function appWriteBody(body: Record<string, unknown>): Record<string, unknown> {
  const b = snake(body) as Record<string, unknown>;
  const dynamicCat = b.categories;
  const categorySlugs = Array.isArray(dynamicCat) ? dynamicCat : [];
const payload: Record<string, unknown> = {
    name: b.name,
    slug: b.slug,
    search_code: b.search_code,
    curiosity_title: b.curiosity_title,
    short_description: b.short_description,
    long_description: b.long_description,
    developer_name: b.developer_name || null,
    package_name: b.package_name,
    play_store_url: b.play_store_url,
    icon_url: b.icon_url,
    price_type: b.price_type ?? 'free',
    play_store_rating: b.play_store_rating ?? 0,
    features: b.features ?? [],
    pros: b.pros ?? [],
    cons: b.cons ?? [],
    status: b.status ?? 'draft',
  };
  return { ...payload, _categorySlugs: categorySlugs };
}

async function setAppCategories(appId: string, slugs: string[]): Promise<void> {
  if (slugs.length === 0) {
    await supabase.from('app_categories').delete().eq('app_id', appId);
    return;
  }
  const { data: cats, error } = await supabase
    .from('categories')
    .select('id, slug')
    .in('slug', slugs);
  if (error) throw error;
  const rows = slugs
    .map((slug) => cats.find((c) => c.slug === slug)?.id)
    .filter((id): id is string => !!id)
    .map((categoryId) => ({ app_id: appId, category_id: categoryId }));
  await supabase.from('app_categories').delete().eq('app_id', appId);
  if (rows.length > 0) {
    const { error: linkErr } = await supabase.from('app_categories').insert(rows);
    if (linkErr) throw linkErr;
  }
}

async function logActivity(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string | null,
  changes: Record<string, unknown>,
): Promise<void> {
  await supabase.from('admin_activity_logs').insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    changes,
  });
}

async function requireAdminId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const uid = session?.user?.id;
  if (!uid) err(401, 'Not authenticated');
  return uid;
}

// ---------------------------------------------------------------------------
// Endpoint implementations
// ---------------------------------------------------------------------------

async function listAdminApps(params: URLSearchParams): Promise<Record<string, unknown>> {
  const page = Number(params.get('page') ?? 1);
  const limit = Number(params.get('limit') ?? 20);
  const status = params.get('status');
  const search = params.get('search');
  const from = (page - 1) * limit;

  let q = supabase
    .from('apps')
    .select('*, app_categories(categories(slug)), app_screenshots(*)', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(from, from + limit - 1);
  if (status) q = q.eq('status', status);
  if (search) q = q.ilike('name', `%${search}%`);

  const { data, count, error } = await q;
  if (error) throw error;
  const total = count ?? 0;
  return {
    apps: (data ?? []).map(normalizeApp),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

async function getApp(id: string): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from('apps')
    .select('*, app_categories(categories(slug)), app_screenshots(*)')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) err(404, 'App not found');
  return normalizeApp(data as Record<string, unknown>);
}

async function createApp(input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const adminId = await requireAdminId();
  const prepared = appWriteBody(input) as Record<string, unknown> & { _categorySlugs: string[] };
  let slug = prepared.slug as string;

  const { data: existing, error: slugErr } = await supabase
    .from('apps')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (slugErr) throw slugErr;
  if (existing) slug = `${slug}-${Date.now()}`;

  const { _categorySlugs: _ignored, ...payload } = prepared;
  void _ignored;
  const { data: row, error } = await supabase
    .from('apps')
    .insert({ ...payload, slug, created_by: adminId })
    .select()
    .single();
  if (error) throw error;
  await setAppCategories(row.id as string, prepared._categorySlugs);
  await logActivity(adminId, 'app_created', 'app', row.id as string, {
    name: prepared.name,
    packageName: prepared.package_name,
  });
  return getApp(row.id as string);
}

async function updateApp(id: string, input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const adminId = await requireAdminId();
  const prepared = appWriteBody(input) as Record<string, unknown> & { _categorySlugs: string[] };
  const { _categorySlugs, ...payload } = prepared;
  void payload.slug; // slug stays fixed after creation
  const { error } = await supabase
    .from('apps')
    .update({
      ...payload,
      updated_by: adminId,
    })
    .eq('id', id);
  if (error) throw error;
  await setAppCategories(id, _categorySlugs);
  await logActivity(
    adminId,
    payload.status === 'published' ? 'app_published' : 'app_updated',
    'app',
    id,
    input,
  );
  return getApp(id);
}

async function deleteApp(id: string): Promise<Record<string, unknown>> {
  const adminId = await requireAdminId();
  const app = await getApp(id);
  const { error } = await supabase.from('apps').delete().eq('id', id);
  if (error) throw error;
  await logActivity(adminId, 'app_deleted', 'app', id, { name: (app as { name: string }).name });
  return { message: 'App deleted' };
}

function normalizeCategory(row: Record<string, unknown>): Record<string, unknown> {
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    slug: row.slug,
    iconUrl: row.icon_url ?? null,
    sortOrder: Number(row.sort_order ?? 0),
  };
}

async function listCategories(): Promise<Array<Record<string, unknown>>> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(normalizeCategory);
}

async function createCategory(input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const adminId = await requireAdminId();
  const b = snake(input);
  const { data: row, error } = await supabase
    .from('categories')
    .insert({
      name: b.name as string,
      slug: b.slug as string,
      icon_url: (b.icon_url as string) || null,
      sort_order: b.sort_order as number,
    })
    .select()
    .single();
  if (error) throw error;
  await logActivity(adminId, 'category_created', 'category', row.id as string, { name: b.name });
  return normalizeCategory(row as Record<string, unknown>);
}

async function updateCategory(id: string, input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const adminId = await requireAdminId();
  const b = snake(input);
  const { data: row, error } = await supabase
    .from('categories')
    .update({
      name: b.name as string,
      slug: b.slug as string,
      icon_url: (b.icon_url as string) || null,
      sort_order: b.sort_order as number,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  await logActivity(adminId, 'category_updated', 'category', id, { name: b.name });
  return normalizeCategory(row as Record<string, unknown>);
}

async function deleteCategory(id: string): Promise<Record<string, unknown>> {
  const adminId = await requireAdminId();
  const { data } = await supabase.from('categories').select('name').eq('id', id).single();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
  await logActivity(adminId, 'category_deleted', 'category', id, { name: data?.name ?? null });
  return { message: 'Category deleted' };
}

// ---------------------------------------------------------------------------
// Featured
// ---------------------------------------------------------------------------

function normalizeFeatured(row: Record<string, unknown>): Record<string, unknown> {
  const app = row.apps as Record<string, unknown> | null;
  return {
    _id: row.id,
    featuredDate: row.featured_date,
    appId: app
      ? { _id: app.id, name: app.name, iconUrl: app.icon_url }
      : null,
  };
}

async function listFeatured(params: URLSearchParams): Promise<Array<Record<string, unknown>>> {
  const limit = Number(params.get('limit') ?? 10);
  const { data, error } = await supabase
    .from('daily_featured')
    .select('*, apps(id, name, icon_url)')
    .order('featured_date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(normalizeFeatured);
}

async function getFeaturedByDate(rawDate: string): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from('daily_featured')
    .select('*, apps(id, name, icon_url)')
    .eq('featured_date', rawDate)
    .maybeSingle();
  if (error || !data) err(404, 'No featured app for this date');
  return normalizeFeatured(data as Record<string, unknown>) as unknown as { appId: { name: string } };
}

async function setFeatured(input: { appId: string; date: string }): Promise<Record<string, unknown>> {
  const adminId = await requireAdminId();
  const date = input.date ?? new Date().toISOString().split('T')[0];
  const { data: row, error } = await supabase
    .from('daily_featured')
    .upsert(
      { app_id: input.appId, featured_date: date, created_by: adminId },
      { onConflict: 'featured_date' },
    )
    .select()
    .single();
  if (error) throw error;
  await logActivity(adminId, 'featured_set', 'app', input.appId, { featuredDate: date });
  return normalizeFeatured({
    ...row,
    apps: null,
  } as Record<string, unknown>);
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

async function listNotifications(params: URLSearchParams): Promise<Record<string, unknown>> {
  const limit = Number(params.get('limit') ?? 20);
  const { data, error } = await supabase
    .from('notifications')
    .select('*, apps(id, name, icon_url)')
    .order('sent_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return {
    notifications: (data ?? []).map((n) => ({
      _id: n.id,
      title: n.title,
      body: n.body,
      type: n.type,
      sentAt: n.sent_at,
      appId: n.app_id,
    })),
  };
}

async function sendNotification(input: {
  title: string;
  body: string;
  appId?: string | null;
  type?: string;
}): Promise<Record<string, unknown>> {
  const { error, data } = await supabase.functions.invoke('send-push', {
    body: {
      title: input.title,
      bodyContent: input.body,
      appId: input.appId ?? null,
      type: input.type ?? 'general',
    },
  });
  if (error || data?.error) throw new Error(data?.error ?? error.message);
  return { _id: data.notificationId, ...(data as Record<string, unknown>) };
}

async function deleteNotification(id: string): Promise<Record<string, unknown>> {
  const adminId = await requireAdminId();
  const { data: n } = await supabase.from('notifications').select('title').eq('id', id).single();
  const { error } = await supabase.from('notifications').delete().eq('id', id);
  if (error) throw error;
  await logActivity(adminId, 'notification_deleted', 'notification', id, { title: n?.title ?? null });
  return { message: 'Notification deleted successfully' };
}

// ---------------------------------------------------------------------------
// Reviews moderation
// ---------------------------------------------------------------------------

async function listFlagged(): Promise<Array<Record<string, unknown>>> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, app_id(id, name), review_reports(reason, other_reason)')
    .eq('status', 'flagged')
    .order('report_count', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    _id: r.id,
    appId: r.app_id ? { _id: r.app_id.id, name: r.app_id.name } : null,
    deviceId: r.device_id,
    rating: r.rating,
    comment: r.comment,
    status: r.status,
    reportCount: r.report_count,
    reports: (r.review_reports ?? []).map((rep: { reason: string; other_reason?: string }) =>
      rep.reason === 'other' && rep.other_reason ? `Other: ${rep.other_reason}` : rep.reason,
    ),
    createdAt: r.created_at,
  }));
}

async function moderateReview(id: string, action: 'delete' | 'dismiss'): Promise<Record<string, unknown>> {
  const adminId = await requireAdminId();
  if (action !== 'delete' && action !== 'dismiss') err(400, 'Invalid action');
  const { data: review, error } = await supabase
    .from('reviews')
    .update({ status: action === 'delete' ? 'removed' : 'published', report_count: 0 })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  if (action === 'dismiss') {
    await supabase.from('review_reports').delete().eq('review_id', id);
  }
  await logActivity(adminId, action === 'delete' ? 'app_deleted' : 'app_updated', 'app', id, {
    reviewModeration: action,
  });
  return { success: true, review };
}

// ---------------------------------------------------------------------------
// Activity log
// ---------------------------------------------------------------------------

async function listActivityLogs(params: URLSearchParams): Promise<Record<string, unknown>> {
  const page = Number(params.get('page') ?? 1);
  const limit = Number(params.get('limit') ?? 50);
  const from = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from('admin_activity_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);
  if (error) throw error;

  const adminIds = [...new Set((data ?? []).map((l) => l.admin_id as string).filter(Boolean))];
  let names: Record<string, string> = {};
  if (adminIds.length > 0) {
    const { data: profiles } = await supabase
      .from('admin_profiles')
      .select('user_id, name')
      .in('user_id', adminIds);
    names = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.name]));
  }

  const total = count ?? 0;
  return {
    logs: (data ?? []).map((l) => ({
      _id: l.id,
      action: l.action,
      adminId: { name: names[l.admin_id as string] ?? 'Unknown' },
      targetType: l.target_type,
      targetId: l.target_id,
      changes: l.changes,
      createdAt: l.created_at,
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

async function get(path: Path): Promise<unknown> {
  const { path: clean, params } = parsePath(path);
  if (clean === '/admin/apps') return listAdminApps(params);
  if (/^\/admin\/apps\/[\w-]+$/.test(clean)) return getApp(clean.split('/').pop() as string);
  if (clean === '/admin/categories' || clean === '/categories') return listCategories();
  if (clean === '/admin/featured') return listFeatured(params);
  if (/^\/admin\/featured\/[\d-]+$/.test(clean)) {
    return getFeaturedByDate(clean.split('/').pop() as string);
  }
  if (clean === '/admin/notifications') return listNotifications(params);
  if (clean === '/admin/reviews/flagged') return listFlagged();
  if (clean === '/admin/activity-log') return listActivityLogs(params);
  if (clean === '/admin/auth/me') return me();
  err(404, `Unknown GET route: ${clean}`);
}

async function post(path: Path, body?: unknown): Promise<unknown> {
  const { path: clean } = parsePath(path);
  const input = (body ?? {}) as Record<string, unknown>;
  if (clean === '/admin/apps') return createApp(input);
  if (clean === '/admin/categories') return createCategory(input);
  if (clean === '/admin/featured') return setFeatured(input as { appId: string; date: string });
  if (clean === '/admin/notifications') {
    return sendNotification(input as never);
  }
  if (clean === '/admin/auth/login') {
    const { email, password } = input as { email: string; password: string };
    return login(email, password);
  }
  if (clean === '/admin/auth/change-password') {
    const { currentPassword, newPassword } = input as { currentPassword: string; newPassword: string };
    return changePassword(currentPassword, newPassword);
  }
  err(404, `Unknown POST route: ${clean}`);
}

async function put(path: Path, body?: unknown): Promise<unknown> {
  const { path: clean } = parsePath(path);
  const input = (body ?? {}) as Record<string, unknown>;
  if (/^\/admin\/apps\/[\w-]+$/.test(clean)) return updateApp(clean.split('/').pop() as string, input);
  if (/^\/admin\/categories\/[\w-]+$/.test(clean)) {
    return updateCategory(clean.split('/').pop() as string, input);
  }
  if (/^\/admin\/reviews\/[\w-]+\/moderate$/.test(clean)) {
    const id = clean.split('/')[3]!;
    return moderateReview(id, input.action as 'delete' | 'dismiss');
  }
  return err(404, `Unknown PUT route: ${clean}`);
}

async function del(path: Path): Promise<unknown> {
  const { path: clean } = parsePath(path);
  if (/^\/admin\/apps\/[\w-]+$/.test(clean)) return deleteApp(clean.split('/').pop() as string);
  if (/^\/admin\/categories\/[\w-]+$/.test(clean)) {
    return deleteCategory(clean.split('/').pop() as string);
  }
  if (/^\/admin\/notifications\/[\w-]+$/.test(clean)) {
    return deleteNotification(clean.split('/').pop() as string);
  }
  err(404, `Unknown DELETE route: ${clean}`);
}

// ---------------------------------------------------------------------------
// Auth passthroughs (kept for parity with the old client)
// ---------------------------------------------------------------------------

export interface AdminLoginResult {
  token: string;
  user: { id: string; name: string; email: string };
  admin: { id: string; name: string; email: string; role: 'admin' };
}

async function login(email: string, password: string): Promise<AdminLoginResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  const uid = data.user.id;

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('name, is_active')
    .eq('user_id', uid)
    .maybeSingle();
  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    err(403, 'Admin access required');
  }

  return {
    token: data.session?.access_token ?? '',
    admin: { id: uid, name: profile?.name ?? '', email: email, role: 'admin' },
    user: { id: uid, name: profile?.name ?? '', email: email },
  };
}

async function me(): Promise<{ admin: { id: string; name: string; email: string; role: 'admin' } }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) err(401, 'No session');
  const uid = session!.user.id;
  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('name, is_active')
    .eq('user_id', uid)
    .maybeSingle();
  if (!profile || !profile.is_active) err(403, 'Admin access required');
  return {
    admin: {
      id: uid,
      name: profile?.name ?? '',
      email: session!.user.email ?? '',
      role: 'admin',
    },
  };
}

async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.email) err(401, 'Not authenticated');
  // verify current credentials first (parity with the Express flow)
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: session!.user.email,
    password: currentPassword,
  });
  if (verifyError) throw new Error('Current password is incorrect');
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
  return { message: 'Password changed successfully!' };
}

async function upload(_path: Path, formData: FormData): Promise<{ url: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) err(401, 'Not authenticated');
  const { data, error } = await supabase.functions.invoke('upload-r2', {
    body: formData,
  });
  if (error || data?.error) throw new Error(data?.error ?? error?.message ?? 'Upload failed');
  return data as { url: string };
}

// ---------------------------------------------------------------------------
// Exported client with the same surface as before
// ---------------------------------------------------------------------------

export const api = {
  get: <T>(path: string): Promise<T> => get(path) as Promise<T>,
  post: <T>(path: string, body?: unknown): Promise<T> => post(path, body) as Promise<T>,
  put: <T>(path: string, body?: unknown): Promise<T> => put(path, body) as Promise<T>,
  delete: <T>(path: string): Promise<T> => del(path) as Promise<T>,
  upload: <T>(path: string, formData: FormData): Promise<T> => upload(path, formData) as Promise<T>,
};

export default api;
