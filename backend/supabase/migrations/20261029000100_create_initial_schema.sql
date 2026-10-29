-- Base inicial de FindIt. Los permisos y las políticas se añaden en otra migración.
create schema if not exists private;

comment on schema private is
  'Funciones internas de FindIt; no debe exponerse mediante la API de datos.';

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (char_length(display_name) <= 80)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  constraint categories_code_format check (code ~ '^[a-z0-9_-]{1,60}$'),
  constraint categories_name_length check (
    char_length(btrim(name)) >= 1 and char_length(name) <= 80
  )
);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  constraint places_code_format check (code ~ '^[a-z0-9_-]{1,60}$'),
  constraint places_name_length check (
    char_length(btrim(name)) >= 1 and char_length(name) <= 120
  )
);

create table public.zones (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete restrict,
  code text not null,
  name text not null,
  constraint zones_code_format check (code ~ '^[a-z0-9_-]{1,60}$'),
  constraint zones_name_length check (
    char_length(btrim(name)) >= 1 and char_length(name) <= 100
  ),
  constraint zones_place_code_unique unique (place_id, code),
  -- Permite que publicaciones compruebe la pertenencia de una zona a un lugar.
  constraint zones_id_place_unique unique (id, place_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  type text not null,
  status text not null default 'open',
  category_id uuid not null references public.categories (id) on delete restrict,
  place_id uuid not null references public.places (id) on delete restrict,
  zone_id uuid,
  zone_description text,
  title text not null,
  description text not null default '',
  occurred_on date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_type_valid check (type in ('lost', 'found')),
  constraint posts_status_valid check (status in ('open', 'resolved', 'archived')),
  constraint posts_title_length check (
    char_length(btrim(title)) >= 3 and char_length(title) <= 80
  ),
  constraint posts_description_length check (char_length(description) <= 1000),
  constraint posts_zone_description_length check (
    zone_description is null
    or (
      char_length(btrim(zone_description)) >= 2
      and char_length(zone_description) <= 100
    )
  ),
  -- Se puede elegir una zona del catálogo o describir una zona aproximada.
  constraint posts_zone_required check (
    zone_id is not null or zone_description is not null
  ),
  constraint posts_zone_belongs_to_place
    foreign key (zone_id, place_id)
    references public.zones (id, place_id) on delete restrict,
  constraint posts_occurred_on_not_future check (occurred_on <= current_date)
);

comment on column public.posts.occurred_on is
  'Fecha de pérdida o hallazgo; no es la fecha de creación de la publicación.';
comment on column public.posts.zone_description is
  'Ubicación aproximada escrita por el usuario, sin datos de contacto.';

-- Las restricciones UNIQUE de los catálogos ya crean sus propios índices.
-- En zones, el índice (place_id, code) también cubre las búsquedas por lugar.
create index posts_owner_id_idx on public.posts (owner_id);
create index posts_category_id_idx on public.posts (category_id);
create index posts_place_id_idx on public.posts (place_id);
create index posts_zone_place_idx on public.posts (zone_id, place_id);
create index posts_created_at_idx on public.posts (created_at desc);
create index posts_catalog_idx on public.posts (status, type, created_at desc);

-- El servidor mantiene updated_at en cada modificación.
create function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create trigger findit_profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

create trigger findit_posts_set_updated_at
  before update on public.posts
  for each row execute function private.set_updated_at();

-- Solo este trigger necesita permisos elevados para crear el perfil al registrarse.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    pg_catalog.left(
      pg_catalog.btrim(coalesce(new.raw_user_meta_data ->> 'display_name', '')),
      80
    )
  );
  return new;
end;
$$;

create trigger findit_on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- También crea los perfiles de usuarios registrados antes de esta migración.
insert into public.profiles (id, display_name)
select
  users.id,
  pg_catalog.left(
    pg_catalog.btrim(coalesce(users.raw_user_meta_data ->> 'display_name', '')),
    80
  )
from auth.users as users
on conflict (id) do nothing;
