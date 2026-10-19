// upload-r2 — admin-only image upload to Cloudflare R2 (S3 API), replacing
// the Express /admin/apps/upload endpoint. Returns { url } pointing at the
// R2_PUBLIC_URL so all existing icon URLs stay consistent.
// Secrets: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
//          R2_BUCKET_NAME, R2_PUBLIC_URL
import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3@3';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const R2_ENDPOINT = Deno.env.get('R2_ENDPOINT')!;
const R2_ACCESS_KEY_ID = Deno.env.get('R2_ACCESS_KEY_ID')!;
const R2_SECRET_ACCESS_KEY = Deno.env.get('R2_SECRET_ACCESS_KEY')!;
const R2_BUCKET = Deno.env.get('R2_BUCKET_NAME')!;
const R2_PUBLIC_URL = Deno.env.get('R2_PUBLIC_URL')!;

const s3 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const ALLOWED_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MAX_BYTES = 2 * 1024 * 1024; // matches the Express multer 2mb limit

function cors() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

Deno.serve(async (req) => {
  const headers = cors();
  if (req.method === 'OPTIONS') return new Response('ok', { headers });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const jwt = authHeader.replace('Bearer ', '').trim();
    if (!jwt) return new Response(JSON.stringify({ error: 'No credentials' }), { status: 401, headers });

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

    // verify caller is an active admin (decode JWT payload; exp checked too)
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers });
    }
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((parts[1].length + 3) % 4)),
    );
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return new Response(JSON.stringify({ error: 'Token expired' }), { status: 401, headers });
    }
    const { data: profile } = await admin
      .from('admin_profiles')
      .select('is_active')
      .eq('user_id', payload.sub)
      .maybeSingle();
    if (!profile?.is_active) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers });
    }

    // accept multipart (browser) or JSON {bytes base64, contentType} (sdk fallback)
    let bytes: Uint8Array;
    let contentType: string;
    const form = await req.formData();
    const file = form.get('image') ?? form.get('file');
    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ error: "Expected multipart field 'image'" }), { status: 400, headers });
    }
    const buf = await (file as File).arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      return new Response(JSON.stringify({ error: 'File too large' }), { status: 413, headers });
    }
    bytes = new Uint8Array(buf);
    contentType = (file as File).type || '';
    const ext = ALLOWED_TYPES[contentType];
    if (!ext) {
      return new Response(JSON.stringify({ error: 'Unsupported image type' }), { status: 415, headers });
    }

    const key = `icons/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: bytes,
        ContentType: contentType,
      }),
    );

    const url = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
    return new Response(JSON.stringify({ url, key }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers });
  }
});
