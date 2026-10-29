-- Catálogos iniciales de desarrollo. Solo datos; la estructura va en migraciones.
-- Los códigos estables permiten repetir la semilla sin duplicar registros.
-- No se crean cuentas ni contraseñas dentro del esquema interno de Auth.

insert into public.categories (id, code, name)
values
  ('10000000-0000-4000-8000-000000000001', 'keys', 'Llaves'),
  ('10000000-0000-4000-8000-000000000002', 'bags', 'Bolsos y mochilas'),
  ('10000000-0000-4000-8000-000000000003', 'electronics', 'Electrónicos'),
  ('10000000-0000-4000-8000-000000000004', 'other', 'Otros')
on conflict (code) do update set name = excluded.name;

insert into public.places (id, code, name)
values
  ('20000000-0000-4000-8000-000000000001', 'university', 'Universidad'),
  ('20000000-0000-4000-8000-000000000002', 'mall-megaplaza', 'Mall Megaplaza')
on conflict (code) do update set name = excluded.name;

-- Resolver el lugar por código también funciona si ya tenía otro UUID.
insert into public.zones (id, place_id, code, name)
select data.id::uuid, places.id, data.code, data.name
from (values
  ('30000000-0000-4000-8000-000000000001', 'university', 'library', 'Biblioteca'),
  ('30000000-0000-4000-8000-000000000002', 'university', 'cafeteria', 'Cafetería'),
  ('30000000-0000-4000-8000-000000000003', 'university', 'building-b', 'Edificio B'),
  ('30000000-0000-4000-8000-000000000004', 'university', 'parking', 'Parqueo'),
  ('30000000-0000-4000-8000-000000000005', 'mall-megaplaza', 'banks', 'Zona de bancos'),
  ('30000000-0000-4000-8000-000000000006', 'mall-megaplaza', 'food-court', 'Zona de comida'),
  ('30000000-0000-4000-8000-000000000007', 'mall-megaplaza', 'parking', 'Parqueo')
) as data(id, place_code, code, name)
join public.places as places on places.code = data.place_code
on conflict (place_id, code) do update set name = excluded.name;
