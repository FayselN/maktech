-- Device registration/re-linking + review upsert/report RPCs for the Flutter
-- app's Supabase cutover.

-- Register this install: claim an existing legacy device id (data migrated from
-- Mongo or created by an older app version) and attach it to the caller's
-- anon auth user; otherwise create a fresh device row.
create or replace function public.register_device(
  p_legacy_device_id text,
  p_platform         text default null,
  p_fcm_token        text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  select d.id into v_id
  from public.devices d
  where d.legacy_device_id = p_legacy_device_id
  limit 1;

  if v_id is null then
    insert into public.devices (user_id, legacy_device_id, platform, fcm_token)
    values (
      auth.uid(),
      p_legacy_device_id,
      coalesce(p_platform, 'android')::public.device_platform,
      nullif(p_fcm_token, '')
    )
    returning id into v_id;
  else
    update public.devices
    set user_id        = auth.uid(),
        platform       = coalesce(p_platform, platform::text)::public.device_platform,
        fcm_token      = coalesce(nullif(p_fcm_token, ''), fcm_token),
        last_active_at = now()
    where id = v_id;
  end if;

  return v_id;
end $$;

-- Insert or replace the caller's review for an app (one review per app+device).
create or replace function public.upsert_review(
  p_app_id  uuid,
  p_rating  int,
  p_comment text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_device uuid;
  v_review uuid;
begin
  select d.id into v_device from public.devices d where d.user_id = auth.uid() limit 1;
  if v_device is null then
    raise exception 'No device registered';
  end if;
  if p_rating < 1 or p_rating > 5 then
    raise exception 'Rating must be between 1 and 5';
  end if;

  insert into public.reviews (app_id, device_id, rating, comment)
  values (
    p_app_id,
    v_device,
    p_rating,
    nullif(trim(p_comment), '')
  )
  on conflict (app_id, device_id) do update
    set rating     = excluded.rating,
        comment    = excluded.comment,
        updated_at = now()
  returning id into v_review;

  return v_review;
end $$;

-- Report a review (deduped per review+device); keeps Mongo's report_count bump.
create or replace function public.report_review(
  p_review_id uuid,
  p_reason    text,
  p_other     text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_device uuid;
begin
  select d.id into v_device from public.devices d where d.user_id = auth.uid() limit 1;
  if v_device is null then
    raise exception 'No device registered';
  end if;

  insert into public.review_reports (review_id, device_id, reason, other_reason)
  values (
    p_review_id,
    v_device,
    coalesce(p_reason, 'other')::public.review_report_reason,
    nullif(p_other, '')
  )
  on conflict (review_id, device_id) do update
    set reason       = excluded.reason,
        other_reason = excluded.other_reason,
        created_at   = now();

  -- keep the denormalized count in sync with the reports table (upsert-safe)
  update public.reviews
  set report_count = (
    select count(*) from public.review_reports
    where review_id = p_review_id
  )
  where id = p_review_id;
end $$;

grant execute on function public.register_device(text, text, text)  to anon, authenticated;
grant execute on function public.upsert_review(uuid, int, text)     to anon, authenticated;
grant execute on function public.report_review(uuid, text, text)    to anon, authenticated;
revoke execute on function public.register_device(text, text, text)  from public;
revoke execute on function public.upsert_review(uuid, int, text)     from public;
revoke execute on function public.report_review(uuid, text, text)    from public;
