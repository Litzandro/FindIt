-- Ejecutar solo contra la base local: npx supabase test db
-- Los usuarios y las publicaciones de prueba se eliminan con el ROLLBACK final.
begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;

-- Permite emitir resultados TAP al cambiar de rol dentro de esta transacción.
grant usage on schema extensions to anon, authenticated;
grant execute on all functions in schema extensions to anon, authenticated;

select plan(16);

-- Fixtures de autenticación únicamente para pruebas: no forman parte de seed.sql.
-- El trigger de FindIt debe crear automáticamente los dos perfiles.
insert into auth.users (id, email) values
  ('90000000-0000-4000-8000-000000000001', 'findit-user-a@example.invalid'),
  ('90000000-0000-4000-8000-000000000002', 'findit-user-b@example.invalid');

insert into public.posts (
  id, owner_id, type, status, category_id, place_id, zone_id, title, occurred_on
) values
  (
    '80000000-0000-4000-8000-000000000001',
    '90000000-0000-4000-8000-000000000001',
    'found', 'open',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'Llaves abiertas del usuario A', current_date
  ),
  (
    '80000000-0000-4000-8000-000000000002',
    '90000000-0000-4000-8000-000000000001',
    'lost', 'resolved',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'Llaves resueltas del usuario A', current_date
  ),
  (
    '80000000-0000-4000-8000-000000000003',
    '90000000-0000-4000-8000-000000000002',
    'found', 'open',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'Llaves abiertas del usuario B', current_date
  );

-- Visitante sin sesión.
set local role anon;
set local "request.jwt.claim.sub" = '';
set local "request.jwt.claims" = '{}';

-- 1. El catálogo abierto puede consultarse sin autenticar.
select is(
  (select count(*) from public.posts where id in (
    '80000000-0000-4000-8000-000000000001',
    '80000000-0000-4000-8000-000000000003'
  )),
  2::bigint,
  'anon puede leer las publicaciones abiertas'
);

-- 2. Un caso cerrado ya no forma parte del catálogo público.
select is(
  (select count(*) from public.posts where id = '80000000-0000-4000-8000-000000000002'),
  0::bigint,
  'anon no puede leer una publicación resuelta'
);

-- 3. Tener acceso de lectura no permite publicar de forma anónima.
select throws_ok(
  $$insert into public.posts (type, category_id, place_id, zone_id, title, occurred_on)
    values ('found', '10000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000001',
      '30000000-0000-4000-8000-000000000001', 'Alta anónima bloqueada', current_date)$$,
  '42501', null,
  'anon no puede crear publicaciones'
);

-- Usuario A autenticado. Estas variables reproducen los claims que enviaría Auth.
reset role;
set local role authenticated;
set local "request.jwt.claim.sub" = '90000000-0000-4000-8000-000000000001';
set local "request.jwt.claims" = '{"sub":"90000000-0000-4000-8000-000000000001","role":"authenticated"}';

-- 4. El acceso a perfiles no descubre el perfil de otra persona.
select results_eq(
  $$select id::text from public.profiles
    where id in ('90000000-0000-4000-8000-000000000001', '90000000-0000-4000-8000-000000000002')
    order by id$$,
  array['90000000-0000-4000-8000-000000000001']::text[],
  'cada usuario solo puede consultar su propio perfil'
);

-- 5. El propietario conserva acceso a sus casos resueltos.
select is(
  (select count(*) from public.posts where id = '80000000-0000-4000-8000-000000000002'),
  1::bigint,
  'el propietario puede consultar su publicación resuelta'
);

-- 6. La alta ordinaria no necesita que el cliente elija propietario ni UUID.
select lives_ok(
  $$insert into public.posts (type, category_id, place_id, zone_id, title, occurred_on)
    values ('found', '10000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000001',
      '30000000-0000-4000-8000-000000000001',
      'Alta pgTAP con propietario automático', current_date)$$,
  'authenticated puede crear una publicación válida'
);

-- 7. El servidor asigna el usuario del token, no un propietario arbitrario.
select is(
  (select owner_id from public.posts
    where title = 'Alta pgTAP con propietario automático'
    order by created_at desc, id limit 1),
  '90000000-0000-4000-8000-000000000001'::uuid,
  'el propietario por defecto coincide con auth.uid()'
);

-- 8. Ni siquiera el propietario puede transferir la autoría desde la API.
select throws_ok(
  $$update public.posts set owner_id = '90000000-0000-4000-8000-000000000002'
    where id = '80000000-0000-4000-8000-000000000001'$$,
  '42501', null,
  'owner_id no se puede modificar con permisos ordinarios'
);

-- Usuario B: puede leer el anuncio abierto de A, pero no administrarlo.
set local "request.jwt.claim.sub" = '90000000-0000-4000-8000-000000000002';
set local "request.jwt.claims" = '{"sub":"90000000-0000-4000-8000-000000000002","role":"authenticated"}';

-- 9. RLS debe dejar cero filas modificadas al editar un anuncio ajeno.
with changed as (
  update public.posts set title = 'Edición ajena bloqueada'
  where id = '80000000-0000-4000-8000-000000000001'
  returning id
)
select is(count(*), 0::bigint, 'un usuario no puede editar una publicación ajena')
from changed;

-- 10. El borrado también se restringe al propietario.
with deleted as (
  delete from public.posts where id = '80000000-0000-4000-8000-000000000001'
  returning id
)
select is(count(*), 0::bigint, 'un usuario no puede borrar una publicación ajena')
from deleted;

-- 11. Autenticarse no revela los casos cerrados de los demás.
select is(
  (select count(*) from public.posts where id = '80000000-0000-4000-8000-000000000002'),
  0::bigint,
  'un usuario no puede leer una publicación resuelta ajena'
);

-- 12. La restricción anterior no debe bloquear las ediciones legítimas.
with changed as (
  update public.posts set title = 'Edición propia permitida'
  where id = '80000000-0000-4000-8000-000000000003'
  returning id
)
select is(count(*), 1::bigint, 'el propietario puede editar su publicación')
from changed;

-- 13. Los catálogos se administran mediante migraciones y semillas.
select throws_ok(
  $$insert into public.categories (code, name) values ('categoria_pgtap', 'Categoría no autorizada')$$,
  '42501', null,
  'authenticated no puede escribir en los catálogos'
);

-- 14. Dos UUID existentes no bastan: la zona debe pertenecer al lugar indicado.
select throws_ok(
  $$insert into public.posts (type, category_id, place_id, zone_id, title, occurred_on)
    values ('found', '10000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000001',
      '30000000-0000-4000-8000-000000000005', 'Zona de otro lugar', current_date)$$,
  '23503', null,
  'no se puede asociar una zona de Mall Megaplaza a Universidad'
);

-- 15. La fecha se valida también en Postgres, aunque se omita la interfaz.
select throws_ok(
  $$insert into public.posts (type, category_id, place_id, zone_id, title, occurred_on)
    values ('lost', '10000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000001',
      '30000000-0000-4000-8000-000000000001', 'Fecha futura bloqueada', current_date + 1)$$,
  '23514', null,
  'no se puede registrar una pérdida o hallazgo en el futuro'
);

-- 16. Una edición de perfil permitida también debe funcionar con sus triggers.
with changed as (
  update public.profiles set display_name = 'Usuario B actualizado'
  where id = '90000000-0000-4000-8000-000000000002'
  returning id
)
select is(count(*), 1::bigint, 'un usuario puede actualizar su nombre visible')
from changed;

reset role;
select * from finish();
rollback;
