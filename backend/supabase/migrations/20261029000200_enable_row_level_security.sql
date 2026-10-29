-- Permisos de la API: RLS y privilegios SQL trabajan juntos.
-- Los catálogos y publicaciones abiertas son visibles sin iniciar sesión.
-- Los perfiles son privados y solo el autor puede cambiar una publicación.

revoke all on schema private from public, anon, authenticated;
revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.handle_new_user() from public, anon, authenticated;

revoke all on table
  public.profiles, public.categories, public.places, public.zones, public.posts
from public, anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.places, public.zones to anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select on public.posts to anon, authenticated;

-- id, owner_id, estado inicial y fechas se asignan en el servidor.
grant insert (
  type, category_id, place_id, zone_id, zone_description,
  title, description, occurred_on
) on public.posts to authenticated;

-- El cliente no puede transferir la autoría ni falsificar created_at/updated_at.
grant update (
  type, status, category_id, place_id, zone_id, zone_description,
  title, description, occurred_on
) on public.posts to authenticated;
grant delete on public.posts to authenticated;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.places enable row level security;
alter table public.zones enable row level security;
alter table public.posts enable row level security;

create policy profiles_select_own
on public.profiles for select to authenticated
using (id = (select auth.uid()));

create policy profiles_update_own
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy categories_read
on public.categories for select to anon, authenticated
using (true);

create policy places_read
on public.places for select to anon, authenticated
using (true);

create policy zones_read
on public.zones for select to anon, authenticated
using (true);

create policy posts_select_open_or_own
on public.posts for select to anon, authenticated
using (status = 'open' or owner_id = (select auth.uid()));

create policy posts_insert_own
on public.posts for insert to authenticated
with check (owner_id = (select auth.uid()));

create policy posts_update_own
on public.posts for update to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy posts_delete_own
on public.posts for delete to authenticated
using (owner_id = (select auth.uid()));
