# Mi Economía

**[Abrir Mi Economía](https://controlesmineras.github.io/Mi-Economia/)**

Aplicación independiente: ingresos, gastos, efectivo, cuentas e inversiones. No usa SK-Web, Plaza Blending, el Drive de SK ni el inicio de sesión de ChatGPT. Los registros se guardan en el dispositivo y, cuando el usuario conecta su cuenta, en su propio Google Drive.

## Google Drive

En Configurar Drive ingresa manualmente el ID público de cliente OAuth de Google (no un secreto). Habilita Google Drive API y autoriza el origen `https://controlesmineras.github.io`. Cada usuario elige su cuenta al conectar. El permiso utilizado es `drive.appdata`; la copia queda en el espacio privado de esta app dentro de esa cuenta. La sincronización ocurre cada cinco minutos mientras la app esté abierta y el acceso siga vigente.

## Desarrollo

El código está en `source/`. Instala con pnpm, compila con `pnpm build` y copia el contenido de `source/dist/` a la raíz, conservando `source/`. GitHub Pages publica main, raíz.

## Traslado de registros

La nueva dirección tiene almacenamiento independiente. Descarga una copia JSON desde la versión anterior e impórtala aquí antes de continuar. No publiques tus registros en GitHub. La versión anterior se conserva para recuperar datos.
