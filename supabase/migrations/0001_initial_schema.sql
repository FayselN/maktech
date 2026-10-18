-- ============================================================================
-- MakTech v2 — initial PostgreSQL schema (mirrors backend/models/*.js)
-- Identity model: Supabase anonymous auth. Each install = one auth.users row.
-- devices.user_id links that row to the device record; device-scoped tables
-- reference devices.id and RLS resolves ownership through devices.user_id.
-- ============================================================================

create extension if not exists pg_trgm;
create extension if not exists moddatetime;

-- ============================================================================
-- Enums
-- ============================================================================

create type public.app_status as enum ('draft', 'published');
create type public.price_type as enum ('free', 'paid', 'freemium');
create type public.review_status as enum ('published', 'flagged', 'removed');
create type public.review_report_reason as enum ('spam', 'offensive', 'irrelevant', 'other');
create type public.notification_type as enum ('new_app', 'trending', 'general');
create type public.device_platform as enum ('android', 'ios');
create type public.admin_action as enum (
  'app_created', 'app_updated', 'app_deleted', 'category_created',
  'category_updated', 'category_deleted', 'app_published',
  'featured_set', 'notification_sent', 'notification_deleted'
);
create type public.admin_target_type as enum ('app', 'category', 'notification');

-- ============================================================================
-- Tables
-- ============================================================================

-- Admin profiles (backed by Supabase Auth; role enforced via RLS + JWT)
create table public.admin_profiles (
  user_id   uuid primary key references auth.users (id) on delete cascade,
  name      text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Devices (one row per install; user_id = anon auth uid, never null)
create table public.devices (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references auth.users (id) on delete cascade,
  -- legacy client-generated id from the Express API, used to re-link old data
  legacy_device_id text unique,
  fcm_token     text,
  platform      public.device_platform not null,
  last_active_at timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index devices_fcm_token_idx on public.devices (fcm_token) where fcm_token is not null;

-- Apps (core catalog)
create table public.apps (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text not null unique,
  search_code       text not null unique,
  curiosity_title   text not null,
  short_description text not null check (length(short_description) <= 200),
  long_description  text not null,
  developer_name    text,
  package_name      text not null unique,
  play_store_url    text not null,
  icon_url          text not null,
  price_type        public.price_type not null default 'free',
  play_store_rating numeric(3,2) not null default 0 check (play_store_rating >= 0 and play_store_rating <= 5),
  features          text[] not null default '{}',
  pros              text[] not null default '{}',
  cons              text[] not null default '{}',
  rating_average    numeric(3,2) not null default 0,
  rating_count      integer not null default 0,
  status            public.app_status not null default 'draft',
  is_new_app        boolean not null default true,
  view_count        bigint not null default 0,
  favorite_count    integer not null default 0,
  created_by        uuid references auth.users (id),
  updated_by        uuid references auth.users (id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index apps_status_new_idx       on public.apps (status, is_new_app);
create index apps_status_views_idx     on public.apps (status, view_count desc);
create index apps_status_created_idx   on public.apps (status, created_at desc);
create index apps_name_search_idx      on public.apps using gin (name gin_trgm_ops);
create index apps_desc_search_idx      on public.apps using gin (short_description gin_trgm_ops);
create index apps_package_name_idx     on public.apps (package_name);

-- Categories
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  icon_url   text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index categories_sort_idx on public.categories (sort_order);

-- App <-> Category (relational: needed for filtering and joins)
create table public.app_categories (
  app_id      uuid not null references public.apps (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (app_id, category_id)
);
create index app_categories_category_idx on public.app_categories (category_id, app_id);

-- App screenshots (ordered list)
create table public.app_screenshots (
  id         uuid primary key default gen_random_uuid(),
  app_id     uuid not null references public.apps (id) on delete cascade,
  url        text not null,
  sort_order integer not null default 0
);
create index app_screenshots_app_idx on public.app_screenshots (app_id, sort_order);

-- Favorites (one per device per app)
create table public.favorites (
  id          uuid primary key default gen_random_uuid(),
  device_id   uuid not null references public.devices (id) on delete cascade,
  app_id      uuid not null references public.apps (id) on delete cascade,
  created_at  timestamptz not null default now()
);
create unique index favorites_device_app_uq on public.favorites (device_id, app_id);
create index favorites_app_idx on public.favorites (app_id);

-- Reviews
create table public.reviews (
  id           uuid primary key default gen_random_uuid(),
  app_id       uuid not null references public.apps (id) on delete cascade,
  device_id    uuid not null references public.devices (id) on delete cascade,
  rating       integer not null check (rating >= 1 and rating <= 5),
  comment      text check (comment is null or length(comment) <= 1000),
  status       public.review_status not null default 'published',
  report_count integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create unique index reviews_app_device_uq on public.reviews (app_id, device_id);
create index reviews_app_created_idx on public.reviews (app_id, created_at desc);

-- Review reports (one per device per review)
create table public.review_reports (
  id           uuid primary key default gen_random_uuid(),
  review_id    uuid not null references public.reviews (id) on delete cascade,
  device_id    uuid not null references public.devices (id) on delete cascade,
  reason       public.review_report_reason not null default 'other',
  other_reason text check (other_reason is null or length(other_reason) <= 500),
  created_at   timestamptz not null default now()
);
create unique index review_reports_review_device_uq on public.review_reports (review_id, device_id);
create index review_reports_device_idx on public.review_reports (device_id);

-- Notifications
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text not null,
  app_id     uuid references public.apps (id) on delete set null,
  type       public.notification_type not null default 'general',
  sent_by    uuid references auth.users (id),
  sent_at    timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index notifications_sent_at_idx on public.notifications (sent_at desc);

-- Per-device notification state (read/unread, dedupe)
create table public.device_notifications (
  id              uuid primary key default gen_random_uuid(),
  device_id       uuid not null references public.devices (id) on delete cascade,
  notification_id uuid not null references public.notifications (id) on delete cascade,
  is_read         boolean not null default false,
  received_at     timestamptz not null default now(),
  unique (device_id, notification_id)
);
create index device_notifications_unread_idx on public.device_notifications (device_id, is_read);

-- Daily featured (one row per date)
create table public.daily_featured (
  id            uuid primary key default gen_random_uuid(),
  app_id        uuid not null references public.apps (id) on delete cascade,
  featured_date date not null unique,
  created_by    uuid references auth.users (id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Recently viewed (pruned to 20 rows per device by trigger)
create table public.recently_viewed (
  id         uuid primary key default gen_random_uuid(),
  device_id  uuid not null references public.devices (id) on delete cascade,
  app_id     uuid not null references public.apps (id) on delete cascade,
  viewed_at  timestamptz not null default now()
);
create unique index recently_viewed_device_app_uq on public.recently_viewed (device_id, app_id);
create index recently_viewed_device_time_idx on public.recently_viewed (device_id, viewed_at desc);

-- Admin activity log
create table public.admin_activity_logs (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid not null references auth.users (id),
  action      public.admin_action not null,
  target_type public.admin_target_type not null,
  target_id   uuid,
  changes     jsonb,
  created_at  timestamptz not null default now()
);
create index admin_activity_logs_admin_idx on public.admin_activity_logs (admin_id, created_at desc);

-- ============================================================================
-- Helper functions
-- ============================================================================

-- Is the caller an active admin? (JWT uid must have an admin_profiles row)
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = (select auth.uid()) and is_active
  );
$$;

-- Does the caller own the given device row?
create or replace function public.owns_device(p_device_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.devices d
    where d.id = p_device_id and d.user_id = (select auth.uid())
  );
$$;

-- Current admin's auth uid (for inserts)
create or replace function public.current_admin_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select (select auth.uid());
$$;

-- ============================================================================
-- Triggers
-- ============================================================================

-- updated_at maintenance
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger touch_updated_at before update on public.admin_profiles
  for each row execute function public.touch_updated_at();
create trigger touch_updated_at before update on public.devices
  for each row execute function public.touch_updated_at();
create trigger touch_updated_at before update on public.apps
  for each row execute function public.touch_updated_at();
create trigger touch_updated_at before update on public.categories
  for each row execute function public.touch_updated_at();
create trigger touch_updated_at before update on public.daily_featured
  for each row execute function public.touch_updated_at();
create trigger touch_updated_at before update on public.reviews
  for each row execute function public.touch_updated_at();

-- Recompute apps.rating_stats from published reviews (was: Review.aggregate -> App.findByIdAndUpdate)
create or replace function public.recalculate_review_stats()
returns trigger language plpgsql security definer
set search_path = public
as $$
declare
  r_avg numeric(3,2);
  r_count integer;
  v_app uuid;
begin
  v_app := coalesce(new.app_id, old.app_id);
  select coalesce(avg(rating), 0)::numeric(3,2), count(*)
    into r_avg, r_count
    from public.reviews
    where app_id = v_app and status = 'published';
  update public.apps
     set rating_average = r_avg, rating_count = r_count
     where id = v_app;
  return coalesce(new, old);
end $$;

create trigger review_stats after insert or update or delete on public.reviews
  for each row execute function public.recalculate_review_stats();

-- Keep apps.favorite_count in sync
create or replace function public.recalculate_favorite_count()
returns trigger language plpgsql security definer
set search_path = public
as $$
declare
  v_app uuid;
begin
  v_app := coalesce(new.app_id, old.app_id);
  update public.apps
     set favorite_count = (select count(*) from public.favorites where app_id = v_app)
     where id = v_app;
  return coalesce(new, old);
end $$;

create trigger favorites_count after insert or delete on public.favorites
  for each row execute function public.recalculate_favorite_count();

-- Recently viewed: dedupe is handled by the unique index + upsert from callers;
-- prune to the 20 newest rows per device (matches Express clamp)
create or replace function public.prune_recently_viewed()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  delete from public.recently_viewed
    where device_id = new.device_id
      and id not in (
        select id from public.recently_viewed
        where device_id = new.device_id
        order by viewed_at desc
        limit 20
      );
  return new;
end $$;

create trigger recently_viewed_prune after insert on public.recently_viewed
  for each row execute function public.prune_recently_viewed();

-- ============================================================================
-- RPCs
-- ============================================================================

-- Public: count a view on a published app (used by the new Flutter app)
create or replace function public.bump_view(p_app_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  update public.apps set view_count = view_count + 1
  where id = p_app_id and status = 'published';
end $$;

grant execute on function public.bump_view(uuid) to anon, authenticated;

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.admin_profiles       enable row level security;
alter table public.devices              enable row level security;
alter table public.apps                 enable row level security;
alter table public.categories           enable row level security;
alter table public.app_categories       enable row level security;
alter table public.app_screenshots      enable row level security;
alter table public.favorites            enable row level security;
alter table public.reviews              enable row level security;
alter table public.review_reports       enable row level security;
alter table public.notifications        enable row level security;
alter table public.device_notifications enable row level security;
alter table public.daily_featured       enable row level security;
alter table public.recently_viewed      enable row level security;
alter table public.admin_activity_logs  enable row level security;

-- admin_profiles ----------------------------------------------------------------
create policy "admins read profiles" on public.admin_profiles
  for select using (public.is_admin() or user_id = (select auth.uid()));
create policy "profile self update" on public.admin_profiles
  for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
-- insert/management via service role / edge functions only

-- apps --------------------------------------------------------------------------
create policy "public read published apps" on public.apps
  for select using (status = 'published' or public.is_admin());
create policy "admins write apps" on public.apps
  for all using (public.is_admin()) with check (public.is_admin());

-- categories --------------------------------------------------------------------
create policy "public read categories" on public.categories
  for select using (true);
create policy "admins write categories" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- app_categories ------------------------------------------------------------------
create policy "public read app_categories" on public.app_categories
  for select using (
    exists (select 1 from public.apps a where a.id = app_id and a.status = 'published')
    or public.is_admin()
  );
create policy "admins write app_categories" on public.app_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- app_screenshots ------------------------------------------------------------------
create policy "public read screenshots" on public.app_screenshots
  for select using (
    exists (select 1 from public.apps a where a.id = app_id and a.status = 'published')
    or public.is_admin()
  );
create policy "admins write screenshots" on public.app_screenshots
  for all using (public.is_admin()) with check (public.is_admin());

-- devices ------------------------------------------------------------------------
create policy "device owner select" on public.devices
  for select using (user_id = (select auth.uid()));
create policy "device owner insert" on public.devices
  for insert with check (user_id = (select auth.uid()));
create policy "device owner update" on public.devices
  for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- favorites ----------------------------------------------------------------------
create policy "device owner select favorites" on public.favorites
  for select using (public.owns_device(device_id));
create policy "device owner insert favorites" on public.favorites
  for insert with check (public.owns_device(device_id));
create policy "device owner delete favorites" on public.favorites
  for delete using (public.owns_device(device_id));

-- reviews ------------------------------------------------------------------------
create policy "read published or own reviews" on public.reviews
  for select using (status = 'published' or public.owns_device(device_id) or public.is_admin());
create policy "device owner insert reviews" on public.reviews
  for insert with check (public.owns_device(device_id));
create policy "admins update reviews" on public.reviews
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admins delete reviews" on public.reviews
  for delete using (public.is_admin());

-- review_reports -------------------------------------------------------------------
create policy "device owner select reports" on public.review_reports
  for select using (public.owns_device(device_id) or public.is_admin());
create policy "device owner insert reports" on public.review_reports
  for insert with check (public.owns_device(device_id));

-- notifications --------------------------------------------------------------------
create policy "public read notifications" on public.notifications
  for select using (true);
create policy "admins write notifications" on public.notifications
  for all using (public.is_admin()) with check (public.is_admin());

-- device_notifications ---------------------------------------------------------------
create policy "device owner select notifications" on public.device_notifications
  for select using (public.owns_device(device_id));
create policy "device owner update notifications" on public.device_notifications
  for update using (public.owns_device(device_id)) with check (public.owns_device(device_id));
create policy "device owner insert notifications" on public.device_notifications
  for insert with check (public.owns_device(device_id));

-- daily_featured ---------------------------------------------------------------------
create policy "public read daily featured" on public.daily_featured
  for select using (true);
create policy "admins write daily featured" on public.daily_featured
  for all using (public.is_admin()) with check (public.is_admin());

-- recently_viewed --------------------------------------------------------------------
create policy "device owner select recently viewed" on public.recently_viewed
  for select using (public.owns_device(device_id));
create policy "device owner insert recently viewed" on public.recently_viewed
  for insert with check (public.owns_device(device_id));
create policy "device owner delete recently viewed" on public.recently_viewed
  for delete using (public.owns_device(device_id));

-- admin_activity_logs ------------------------------------------------------------------
create policy "admins read activity logs" on public.admin_activity_logs
  for select using (public.is_admin());
-- inserts happen from edge functions with the service role key

-- ============================================================================
-- Privileges
-- ============================================================================

grant select on public.apps, public.categories, public.app_categories,
  public.app_screenshots, public.notifications, public.daily_featured
  to anon;
grant usage on schema public to anon, authenticated;
