# FindIt

Aplicación web y móvil para registrar objetos perdidos y encontrados. El frontend utiliza Expo SDK 57, React Native y TypeScript. El backend utiliza Supabase local con Docker, con migraciones SQL, semillas y pruebas de permisos.

## Estado actual

- Inicio con búsqueda y filtros, y formulario de publicación con validación y vista previa de una imagen.
- Publicaciones de demostración en memoria: los cambios se pierden al recargar o cerrar la aplicación.
- Base con `profiles`, `categories`, `places`, `zones` y `posts`, relaciones y políticas RLS.
- Semillas con 4 categorías, 2 lugares y 7 zonas; 16 pruebas de permisos.
- Las bibliotecas de Supabase están instaladas en el frontend. Aún faltan el cliente de conexión, las pantallas de autenticación, la persistencia de publicaciones, Storage y las solicitudes de recuperación.

## Requisitos

Git, Node.js, npm y Docker Desktop con el motor funcionando. Se recomienda Node.js 24.18.0 para mantener la misma versión en el equipo; 24.16.0 también cumple los requisitos de las dependencias actuales.

Comprueba en una terminal nueva:

```powershell
node --version
npm --version
git --version
docker version
```

Docker debe mostrar `Client` y `Server`. En Windows utiliza WSL 2. Si el instalador indica que falta Virtual Machine Platform, ejecuta `wsl --install --no-distribution` en PowerShell como administrador, reinicia y vuelve a instalar Docker.

## Primera ejecución

Clona el repositorio y abre la carpeta principal en VS Code:

```powershell
git clone https://github.com/Litzandro/FindIt.git
cd FindIt
code .
```

Con Docker Desktop abierto, en una terminal que comienza en la raíz:

```powershell
cd backend
npm ci
npm run db:start
npm run db:lint
npm run db:test
```

Ejecuta cada comando después de que el anterior termine sin errores. El primer arranque descarga los servicios, aplica las migraciones y carga las semillas. No repitas `db:init`: `supabase/config.toml` ya está versionado. Las pruebas actuales deben finalizar con `Result: PASS`.

En otra terminal que comienza en la raíz:

```powershell
cd frontend
npm ci
npm run web
```

Abre la URL que muestre Expo, normalmente `http://localhost:8081`. La raíz no tiene `package.json`; los comandos npm se ejecutan en la carpeta correspondiente. En el estado actual no hace falta `.env`, porque el catálogo todavía funciona en memoria.

## Uso diario

Abre Docker Desktop. En `backend`, ejecuta `npm run db:start`; en otra terminal situada en `frontend`, ejecuta `npm run web`. Repite `npm ci` en la carpeta afectada cuando cambie su lockfile, después del primer clonado o si eliminaste `node_modules`.

Al terminar, detén Expo con Ctrl+C y ejecuta `npm run db:stop` desde `backend`. El apagado conserva la base local.

## Comandos del backend

Todos se ejecutan en `backend`.

| Comando | Uso |
| --- | --- |
| `npm run db:start` | Arrancar Supabase local. |
| `npm run db:stop` | Detenerlo conservando sus datos. |
| `npm run db:status` | Consultar direcciones y estado local. |
| `npm run migration:new -- nombre_del_cambio` | Crear un archivo SQL para un cambio nuevo. |
| `npm run db:migrate` | Aplicar migraciones locales pendientes. |
| `npm run db:lint` | Comprobar errores de esquema y funciones. |
| `npm run db:test` | Ejecutar las pruebas de base de datos. |
| `npm run db:reset` | Borrar y reconstruir la base local con migraciones y semillas. |

**`db:reset` elimina los datos locales**, incluidas las cuentas y publicaciones de desarrollo. Reserva este comando para reconstrucciones deliberadas.

Para modificar la estructura, crea una migración nueva, escribe el SQL, ejecuta `db:migrate` y comprueba con `db:lint` y `db:test`. Conserva las migraciones que el equipo ya aplicó. Los datos iniciales se editan en `backend/supabase/seed.sql`; `db:migrate` no vuelve a ejecutar todas las semillas.

Cada integrante tiene su propia base Docker. Git comparte los archivos SQL y el código, no los registros creados en una computadora. Comparte las migraciones junto con las semillas y pruebas que correspondan.

## Consultar los datos

- Studio: `http://127.0.0.1:54323`.
- API: `http://127.0.0.1:54321`.
- PostgreSQL para pgAdmin: host `127.0.0.1`, puerto `54322`, base `postgres`, usuario `postgres` y contraseña local predeterminada `postgres`. Comprueba los valores con `db:status`.

En Studio, el esquema `public` contiene las cinco tablas iniciales. Las semillas cargan catálogos, no cuentas ni publicaciones.

## Comprobaciones del frontend

En `frontend`:

```powershell
npm run typecheck
```

ESLint todavía no forma parte de las dependencias de esta entrega. El comando `npx expo lint` puede instalarlo y generar la configuración, con conexión a Internet. Si el equipo decide activarlo, debe compartir la configuración, `package.json` y `package-lock.json` resultantes. No confundas la revisión de tipos con una ejecución de ESLint.

## Trabajo en equipo

Guarda el trabajo antes de actualizar tu rama. Usa ramas por módulo y comparte los cambios mediante GitHub. Después de recibir cambios, instala las dependencias si cambió su lockfile y aplica las migraciones pendientes antes de comprobar la base.

Se versionan los dos lockfiles, los archivos de configuración, las migraciones, las semillas y las pruebas. Se excluyen `.git` de los ZIP de entrega, `node_modules`, `.expo`, los temporales de Supabase y los archivos `.env` reales. Las plantillas `.env.example` pueden compartirse sin secretos.

## Siguiente módulo

Registro e inicio de sesión con Supabase Auth. Antes de implementar confirmaciones o recuperación de contraseña, ajusta las URL de Auth del `config.toml` a la web y los enlaces de la aplicación; todavía mantienen los valores de la plantilla para el puerto 3000.

Cuando se conecte un teléfono físico al backend local, utiliza la IP de la computadora en el puerto 54321. En el teléfono, `localhost` apunta al teléfono. Esta configuración se incorporará al implementar la conexión.

## Documentación oficial

- [Expo](https://docs.expo.dev/)
- [Supabase local](https://supabase.com/docs/guides/local-development/cli/getting-started)
- [Migraciones](https://supabase.com/docs/guides/local-development/database-migrations)
- [Semillas](https://supabase.com/docs/guides/local-development/seeding-your-database)
