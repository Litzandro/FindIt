# FindIt — Web y móvil

## ¿Qué es FindIt?

**FindIt** es una aplicación para publicar y buscar objetos perdidos o encontrados. Su propósito es facilitar que las personas identifiquen un objeto, consulten su información y puedan iniciar el proceso para recuperarlo.

Está desarrollada con **Expo, React Native, Expo Router y TypeScript**, y utiliza **Supabase** para la autenticación y los perfiles de usuario.

## ¿Cómo funciona?

- **Buscar:** permite explorar publicaciones y filtrarlas para encontrar objetos.
- **Publicar:** ofrece un formulario para registrar información sobre un objeto perdido o encontrado. *El guardado de publicaciones en Supabase aún está en desarrollo.*
- **Mi cuenta:** permite registrarse, iniciar sesión, editar el nombre del perfil y cerrar sesión mediante Supabase.
- **Web y móvil:** funcionan dentro del mismo proyecto, pero pueden mostrar diseños diferentes según la plataforma.

> Las publicaciones actuales son de demostración y pueden perderse al reiniciar la aplicación. Para usar el registro e inicio de sesión se necesita una conexión válida a Supabase.

## Cómo ejecutar FindIt

**Requisitos:** Node.js y npm, y un navegador o un teléfono con Expo Go compatible con la versión de Expo del proyecto.

1. Abre una terminal en `FindIt/frontend` e instala las dependencias:

   ```bash
   npm ci
   ```

2. Inicia la aplicación:

   ```bash
   npx expo start
   ```

3. Para **web**, presiona `w` en la terminal. Para **Android**, escanea el código QR con Expo Go y usa la misma red Wi-Fi que tu computadora.

**Para probar el inicio de sesión con Supabase local:** abre Docker Desktop y ejecuta, en otra terminal:

```bash
cd FindIt/backend
npm ci
npm run db:start
```

En `FindIt/frontend/.env`, configura la URL y la clave pública que muestra `npm run db:status` desde `backend`:

```env
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICA
```

En un teléfono físico, reemplaza `127.0.0.1` por la dirección IP local de tu computadora. No utilices claves secretas de Supabase en el frontend. Reinicia Expo después de modificar `.env`.

Para detener el servidor, presiona **Ctrl + C**.
