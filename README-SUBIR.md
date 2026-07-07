# Tarjeta de Fidelidad · La Gelateria de Roses

Paquete final listo para subir al repo `terulet/Tarjeta-de-Fidelitat` en GitHub Pages.

## Qué subir al root del repo

Sube estos archivos tal cual al root de la rama `main`:

- `index.html` — app del cliente
- `staff.html` — app del personal
- `privacidad.html` — política de privacidad
- `firebase-config.js` — configuración Firebase
- `manifest.json` — PWA cliente
- `manifest-staff.json` — PWA staff
- `sw.js` — service worker
- `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — iconos

`firestore.rules` no hace falta subirlo al repo: se pega en Firebase Console → Firestore Database → Reglas → Publicar.

## URLs

Cliente / póster QR:
`https://terulet.github.io/Tarjeta-de-Fidelitat/`

Staff:
`https://terulet.github.io/Tarjeta-de-Fidelitat/staff.html`

## Cambios de esta versión

- `index.html` montado desde la versión buena con Firebase.
- `manifest.json` final con `scope: ./`.
- `sw.js` con caché subida a `gelateria-v2-2` para forzar actualización en móviles.
- Texto del cliente ajustado: “Mi Tarjeta de fidelidad”.
- Póster QR rehecho con QR más grande y texto más natural.

## Checklist de prueba rápida

1. Abrir la URL cliente desde el móvil.
2. Crear una tarjeta con un teléfono de prueba.
3. Abrir `staff.html`, entrar con el usuario de staff y escanear el QR.
4. Añadir 1 sello.
5. Confirmar que el móvil del cliente actualiza los sellos.
6. Probar “Añadir a pantalla de inicio” en el móvil y en el iPad.
