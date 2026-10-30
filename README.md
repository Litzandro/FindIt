# FindIt — Frontend (web y móvil)

FindIt es una aplicación para publicar y buscar objetos perdidos y encontrados. El **mismo frontend** se ejecuta en navegador (web) y en teléfonos Android/iOS mediante **Expo + React Native + Expo Router + TypeScript**.

> **Alcance de este README:** desarrollo local del frontend. No hace falta iniciar Supabase ni Docker para probar las pantallas y los datos de ejemplo actuales. Cuando conectemos el backend, actualizaremos esta guía.

## 1. Ubicación del proyecto

Todos los comandos de esta guía se ejecutan desde la carpeta **`FindIt/frontend`**, donde están `package.json`, `app.json` y `src/`.

```text
FindIt/
└── frontend/
    ├── README.md          ← este documento
    ├── package.json
    ├── app.json
    ├── assets/
    └── src/
        ├── app/
        │   ├── _layout.tsx
        │   ├── index.tsx   ← landing web y móvil
        │   └── ...
        ├── components/
        └── features/
```

En **VS Code**, abre la carpeta `frontend` (Archivo → Abrir carpeta). Después abre **Terminal → Nueva terminal**. Si abriste la raíz `FindIt`, entra en `frontend` antes de ejecutar los comandos:

```powershell
cd frontend
```

Confirma que la terminal termina en `...\FindIt\frontend>`.

## 2. Requisitos

- Windows, macOS o Linux y **VS Code**.
- **Node.js** y **npm** instalados (usar una versión LTS compatible con las dependencias del proyecto).
- Un navegador moderno para la versión web.
- Para Android físico: teléfono con **Expo Go compatible con SDK 57**.
- Conexión de red entre la computadora y el teléfono para modo LAN; Internet para el modo túnel.

Verifica Node.js y npm:

```powershell
node --version
npm --version
```

**Versión del proyecto:** el `package.json` utiliza `expo: ~57.0.31`, es decir, **Expo SDK 57**. No cambies a SDK 58 solo porque el Expo Go de la tienda use esa versión: actualizar el proyecto es un proceso independiente.

## 3. Instalación inicial (solo la primera vez)

Desde `frontend`:

```powershell
npm ci
```

Esto instala exactamente las dependencias del `package-lock.json`. Si estás realizando cambios deliberados en dependencias, usa `npm install` y conserva actualizados `package.json` y `package-lock.json`.

**No necesitas instalar Expo globalmente:** `npx expo` utiliza la versión instalada en el proyecto.

## 4. Ejecutar la versión web

Desde `frontend`:

```powershell
npm run web
```

O, de forma equivalente:

```powershell
npx expo start --web
```

Abre la dirección indicada en la terminal, normalmente **http://localhost:8081** (el puerto puede variar si está ocupado). El landing se abre en `/`.

Para probar la **vista de teléfono dentro del navegador**:

1. Abre la web en Chrome o Edge.
2. Presiona **F12** para abrir las herramientas de desarrollo.
3. Activa la barra de dispositivos (**Ctrl + Shift + M** en Chrome/Edge).
4. Elige un tamaño de teléfono o ajusta manualmente el ancho.

Esto sirve para probar el diseño *responsivo*, pero **no reemplaza la prueba en Android real**.

## 5. Ejecutar la versión móvil (Android físico)

### Paso A. Instalar Expo Go para SDK 57

La aplicación del teléfono **debe ser compatible con el SDK del proyecto**.

Si Expo Go muestra:

```text
The installed version of Expo Go is for SDK 58.
The project you opened uses SDK 57.
```

No es un error del código. En Android, entra a **https://expo.dev/go**, selecciona **SDK 57 → Android → dispositivo físico** y descarga/instala la versión compatible. Si Android lo solicita, autoriza temporalmente la instalación del APK descargado del sitio oficial. También puedes tocar el enlace **“Learn how to install Expo Go for SDK 57”** que aparece en la pantalla del error.

### Paso B. Iniciar el servidor por Wi-Fi (recomendado)

Con la computadora y el teléfono conectados a la **misma red Wi-Fi**, ejecuta en `frontend`:

```powershell
npx expo start --lan
```

Se mostrará un **código QR**. Abre Expo Go en el teléfono Android, toca **Scan QR Code** y escanéalo. Mantén abierta la terminal mientras usas la app.

### Paso C. Usar un túnel si LAN no conecta

Por ejemplo, si la red del centro educativo bloquea la conexión entre dispositivos:

```powershell
npx expo start --tunnel
```

El túnel puede ser más lento que LAN y requiere conexión a Internet.

Si Expo pide `@expo/ngrok`, acepta la instalación. Si sigue mostrando un error de instalación/detección, puedes intentar instalarlo en `frontend`:

```powershell
npm install --save-dev @expo/ngrok@^4.1.0
npx expo start --tunnel --clear
```

Si el túnel falla aun así, prueba primero **`npx expo start --lan`**; revisa las restricciones de Wi-Fi, VPN y firewall. La instalación de `ngrok` no garantiza que una red permita el túnel.

## 6. ¿Cómo ejecutar web y móvil durante el mismo desarrollo?

**Opción recomendada: un solo servidor Expo.**

1. Desde `frontend` ejecuta `npx expo start --lan` (o `--tunnel` si lo necesitas).
2. Escanea el QR en **Expo Go Android** para abrir la versión móvil.
3. Con esa misma terminal activa, pulsa **`w`** para abrir la versión web en el navegador.
4. Edita y guarda `src/app/index.tsx` u otro archivo. Expo normalmente actualiza ambas vistas mediante Fast Refresh.

Así puedes comparar los cambios en el navegador y en el teléfono **sin crear dos proyectos ni duplicar componentes**.

> Si prefieres iniciar solo la web, usa `npm run web`. Si vas a trabajar principalmente en el teléfono, usa `npx expo start --lan` o `npx expo start --tunnel`.

## 7. Rutas y comportamiento de demostración

Estas rutas corresponden al landing y a los archivos que se están incorporando al frontend. **Si aún no has creado una pantalla, su ruta todavía no funcionará**.

| Ruta | Vista prevista |
| --- | --- |
| `/` | Landing responsivo (web y móvil) |
| `/objetos` | Catálogo de objetos y filtros |
| `/publicar` | Formulario de publicación |
| `/registro` | Registro de demostración |
| `/iniciar-sesion` | Inicio de sesión de demostración |

**Estado de los datos:** las publicaciones y formularios de ejemplo aún no están conectados a Supabase. Las publicaciones hechas en memoria se pierden al recargar o reiniciar. Lo que se vea en web y teléfono puede depender de la sesión de cada dispositivo: todavía no hay sincronización real mediante backend.

## 8. Comandos rápidos

Ejecutar **dentro de `frontend`**:

| Comando | Para qué sirve |
| --- | --- |
| `npm ci` | Instalar las dependencias desde el lockfile |
| `npm run web` | Abrir el frontend en un navegador |
| `npm start` | Iniciar Expo y mostrar el QR/opciones de desarrollo |
| `npx expo start --lan` | Abrir Expo para un teléfono en la misma red |
| `npx expo start --tunnel` | Abrir Expo por túnel cuando LAN no funciona |
| `npx expo start --clear` | Reiniciar el servidor borrando la caché de Metro |
| `npm run typecheck` | Revisar errores de TypeScript sin compilar |
| `npx expo-doctor@latest` | Diagnosticar compatibilidad del proyecto |

Para detener el servidor, presiona **Ctrl + C** en la terminal.

## 9. Solución de problemas frecuentes

### Expo Go muestra “Project is incompatible”

El SDK de Expo Go no coincide con el del proyecto. Este frontend usa **SDK 57**. Instala la versión correspondiente desde **https://expo.dev/go** para Android. No actualices todas las dependencias sin planificar una migración.

### Se abre el QR pero el teléfono no se conecta

Verifica que el teléfono y la PC estén en la misma red Wi-Fi; desactiva temporalmente VPN si interfiere y revisa el firewall de Windows. Prueba `npx expo start --tunnel` si LAN está bloqueado.

### El túnel muestra un error relacionado con `@expo/ngrok`

Prueba la instalación indicada en el **paso 5C**. Si no funciona, usa LAN o revisa la conectividad de la red.

### La pantalla no refleja los cambios

Guarda el archivo. En la terminal de Expo pulsa **`r`** para recargar. Si sigue igual, detén Expo con **Ctrl + C** y reinicia:

```powershell
npx expo start --clear
```

### Sale “Unable to resolve module” o hay dependencias faltantes

Desde `frontend`:

```powershell
npm ci
npx expo install --check
npm run typecheck
```

Corrige primero el archivo o dependencia señalada por el error. El comando `--check` verifica compatibilidad, pero no modifica automáticamente las dependencias.

### El puerto web está ocupado

Utiliza la dirección que Expo muestre en la terminal; puede elegir otro puerto. También puedes detener con **Ctrl + C** cualquier servidor Expo anterior que esté usando el puerto.

### ¿Y para iPhone?

En un **iPhone físico**, la disponibilidad de Expo Go depende de las restricciones actuales de iOS/Expo: para SDK 57 no es tan sencillo instalar una versión anterior desde App Store. Se puede evaluar una **development build** para iOS (con los requisitos de Apple) o el simulador de iOS en macOS. Para este proyecto, **Android físico es el camino más directo** para probar la versión móvil.

## 10. Documentación oficial

- [Iniciar el servidor de Expo y abrir en dispositivos](https://docs.expo.dev/get-started/start-developing/)
- [Instalar una versión compatible de Expo Go](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/)
- [Descargas de Expo Go por SDK](https://expo.dev/go)
- [Desarrollo web con Expo](https://docs.expo.dev/workflow/web/)

---

**Recordatorio:** todos los archivos que estamos programando para el landing se crean o modifican **dentro de `frontend/`**. Las vistas web y móvil comparten código; la presentación se adapta al tamaño de pantalla.
