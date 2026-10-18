// send-push — admin edge function that mirrors the Express notification flow:
//   1. validate caller is an active admin (JWT + admin_profiles row)
//   2. insert the notification row (sent_by = admin)
//   3. fan out device_notifications rows for every registered device
//   4. push through Firebase FCM HTTP v1 (service account OAuth2, cached)
//   5. null out invalid FCM tokens
//   6. write admin_activity_log
// Secrets: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID')!;
const FIREBASE_CLIENT_EMAIL = Deno.env.get('FIREBASE_CLIENT_EMAIL')!;
const FIREBASE_PRIVATE_KEY_RAW = Deno.env.get('FIREBASE_PRIVATE_KEY')!;

// keep rest of the code simple
const FCM_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const FCM_SEND_URL = `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`;
const FCM_BATCH_SIZE = 20;

interface FcmTokenCache {
  accessToken: string | null;
  expiresAt: number;
}
const tokenCache: FcmTokenCache = { accessToken: null, expiresAt: 0 };

function getCorsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

function b64urlDecodeToString(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

function b64urlEncodeBytes(data: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i]);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function importPrivateKey(): Promise<CryptoKey> {
  const pem = FIREBASE_PRIVATE_KEY_RAW.replace(/\\n/g, '\n').trim();
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const raw = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'pkcs8',
    raw,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function getFcmAccessToken(): Promise<string> {
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken!;
  }
  const now = Math.floor(Date.now() / 1000);
  const header = b64urlEncodeBytes(new TextEncoder().encode(JSON.stringify({
    alg: 'RS256',
    typ: 'JWT',
  })));
  const claims = b64urlEncodeBytes(new TextEncoder().encode(JSON.stringify({
    iss: FIREBASE_CLIENT_EMAIL,
    scope: FCM_SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })));
  const signingInput = `${header}.${claims}`;
  const key = await importPrivateKey();
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signingInput),
  );
  const jwt = `${signingInput}.${b64urlEncodeBytes(new Uint8Array(signature))}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FCM OAuth failed (${res.status}): ${text}`);
  }
  const json = await res.json();
  tokenCache.accessToken = json.access_token;
  tokenCache.expiresAt = Date.now() + (json.expires_in as number) * 1000;
  return json.access_token!;
}

interface FcmSendResult {
  token: string;
  ok: boolean;
  invalid: boolean;
  error?: string;
}

async function sendToDevice(
  accessToken: string,
  token: string,
  title: string,
  body: string,
  data: Record<string, string>,
): Promise<FcmSendResult> {
  const payload = {
    message: {
      token,
      notification: { title, body },
      data,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channel_id: 'maktech_notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            'content-available': 1,
          },
        },
      },
    },
  };
  try {
    const res = await fetch(FCM_SEND_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { token, ok: true, invalid: false };
    const text = await res.text();
    const invalidStatuses = ['UNREGISTERED', 'INVALID_ARGUMENT', 'THIRD_PARTY_AUTH_ERROR'];
    const invalidRes = invalidStatuses.some((s) => text.includes(s));
    return { token, ok: false, invalid: invalidRes, error: text.slice(0, 200) };
  } catch (e) {
    return { token, ok: false, invalid: false, error: String(e) };
  }
}

async function sendBulk(
  title: string,
  body: string,
  data: Record<string, string>,
  tokens: string[],
): Promise<{ ok: number; failed: number; invalidTokens: string[] }> {
  const invalidTokens: string[] = [];
  let okCount = 0;
  let failedCount = 0;
  for (let i = 0; i < tokens.length; i += FCM_BATCH_SIZE) {
    const batch = tokens.slice(i, i + FCM_BATCH_SIZE);
    const accessToken = await getFcmAccessToken();
    const results = await Promise.all(
      batch.map((t) => sendToDevice(accessToken, t, title, body, data)),
    );
    for (const r of results) {
      if (r.ok) okCount++;
      else {
        failedCount++;
        if (r.invalid) invalidTokens.push(r.token);
      }
    }
  }
  return { ok: okCount, failed: failedCount, invalidTokens };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders();
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: cors,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const jwt = authHeader.replace('Bearer ', '');
    if (!jwt) return new Response(JSON.stringify({ error: 'No credentials' }), { status: 401, headers: cors });

    // decode JWT payload to identify the caller
    const parts = jwt.split('.');
    if (parts.length !== 3) return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: cors });
    const payload = JSON.parse(b64urlDecodeToString(parts[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return new Response(JSON.stringify({ error: 'Token expired' }), { status: 401, headers: cors });
    }
    const role = payload.role ?? '';
    if (role === 'anon') {
      return new Response(JSON.stringify({ error: 'Admin required' }), { status: 403, headers: cors });
    }
    // also accept platform service key invocations (scheduler/tests)
    const isServiceKey = jwt === SERVICE_ROLE_KEY;

    // service client (bypasses RLS)
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // must be an active admin
    if (!isServiceKey) {
      const { data: adminProfile } = await admin
        .from('admin_profiles')
        .select('user_id, is_active')
        .eq('user_id', payload.sub)
        .maybeSingle();
      if (!adminProfile || !adminProfile.is_active) {
        return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: cors });
      }
    }

    const body = await req.json();
    const { title, bodyContent, appId, type, sentBy } = body as {
      title?: string;
      bodyContent?: string;
      appId?: string;
      type?: string;
      sentBy?: string;
    };
    if (!title || !bodyContent) {
      return new Response(JSON.stringify({ error: 'title and bodyContent are required' }), { status: 400, headers: cors });
    }
    const normalizedType = type && ['new_app', 'trending', 'general'].includes(type) ? type : 'general';

    // 1. notification row
    const { data: notification, error: notifErr } = await admin
      .from('notifications')
      .insert({
        title,
        body: bodyContent,
        app_id: appId ?? null,
        type: normalizedType,
        sent_by: isServiceKey ? (sentBy ?? null) : payload.sub,
      })
      .select('id, title')
      .single();
    if (notifErr) throw notifErr;

    // 2. fan out device_notifications for ALL registered devices
    let fannedOut = 0;
    const devicePage = 1000;
    let done = false;
    while (!done) {
      const { data: devices, error: devErr } = await admin
        .from('devices')
        .select('id')
        .range(fannedOut, fannedOut + devicePage - 1);
      if (devErr) throw devErr;
      if (!devices || devices.length === 0) break;
      const rows = devices.map((d) => ({
        device_id: d.id as string,
        notification_id: notification.id as string,
      }));
      const { error: fanErr } = await admin.from('device_notifications').insert(rows);
      if (fanErr) throw fanErr;
      fannedOut += rows.length;
      if (devices.length < devicePage) done = true;
    }

    // 3. FCM push to all devices holding tokens
    const { data: tokenDevices, error: tokenErr } = await admin
      .from('devices')
      .select('fcm_token')
      .neq('fcm_token', null);
    if (tokenErr) throw tokenErr;
    const tokens = (tokenDevices ?? []).map((d) => d.fcm_token as string);
    const push = await sendBulk(title, bodyContent, {
      notificationId: notification.id as string,
      type: normalizedType,
      appId: appId ?? '',
    }, tokens);

    // 4. null out invalid tokens
    if (push.invalidTokens.length > 0) {
      await admin
        .from('devices')
        .update({ fcm_token: null })
        .in('fcm_token', push.invalidTokens);
    }

    // 5. activity log
    if (!isServiceKey) {
      await admin.from('admin_activity_logs').insert({
        admin_id: payload.sub,
        action: 'notification_sent',
        target_type: 'notification',
        target_id: notification.id,
        changes: { title, type: normalizedType },
      });
    }

    return new Response(JSON.stringify({
      notificationId: notification.id,
      fannedOut,
      sent: push.ok,
      failed: push.failed,
      invalidTokensCleared: push.invalidTokens.length,
    }), { headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: cors });
  }
});
