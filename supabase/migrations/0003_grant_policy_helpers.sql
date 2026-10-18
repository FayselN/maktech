-- RLS policies evaluate is_admin() / owns_device() as the querying role,
-- so anon and authenticated need EXECUTE on these policy helpers.
-- They are security definer + fixed search_path and only return booleans
-- derived from auth.uid(), so exposure is safe and intentional.

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.owns_device(uuid) to anon, authenticated;
