-- Move extensions out of the public schema
alter extension pg_trgm set schema extensions;
alter extension moddatetime set schema extensions;

-- Fix mutable search_path on the timestamp trigger function
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Helper functions are internal; only RPC used by clients stays executable
revoke execute on function public.is_admin() from anon, authenticated, public;
revoke execute on function public.owns_device(uuid) from anon, authenticated, public;
revoke execute on function public.current_admin_id() from anon, authenticated, public;
revoke execute on function public.recalculate_review_stats() from anon, authenticated, public;
revoke execute on function public.recalculate_favorite_count() from anon, authenticated, public;
revoke execute on function public.prune_recently_viewed() from anon, authenticated, public;
