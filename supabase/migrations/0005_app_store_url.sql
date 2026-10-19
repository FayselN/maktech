-- Additional download link (e.g. Apple App Store). Nullable; the Flutter
-- detail screen shows a second install button only when it is present.
alter table public.apps add column app_store_url text;

-- same embeds/policy as before; published and admin paths already covered
