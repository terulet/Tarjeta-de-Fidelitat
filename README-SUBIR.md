# Tarjeta de Fidelidad · Staff Turbo Final

Paquete final para subir al root del repo `terulet/Tarjeta-de-Fidelitat` en GitHub Pages.

## Archivos incluidos

- `index.html` — app del cliente.
- `staff.html` — app del personal para iPad.
- `privacidad.html` — privacidad básica.
- `firebase-config.js` — pegar aquí la configuración real de Firebase.
- `manifest.json` — PWA cliente.
- `manifest-staff.json` — PWA staff.
- `sw.js` — service worker con caché nueva.
- `firestore.rules` — reglas para pegar en Firebase Console.
- `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — iconos generados.

## Cambios principales

### Staff rápido

- Al abrir Staff, entra directo en cámara después del login.
- Barra inferior con 4 botones grandes: Cámara, Lupa, Historial y QR.
- Sin panel admin dentro de Staff para evitar líos.
- Botón QR gigante para que el cliente cree su tarjeta desde el iPad.
- Lupa con texto grande.
- Historial de hoy más vistoso y legible.

### Ficha del cliente

- Nombre y móvil grandes.
- Estado enorme: `PREMIO DISPONIBLE` o `FALTAN X SELLOS`.
- 10 sellos visuales grandes.
- Botones grandes para sumar/restar cantidad de sellos.
- Botón `SELLAR +N` muy visible.
- Botón `Premio usado` para canjear rápido.

### Cálculo correcto de premios con sobrantes

Ejemplo: cliente tiene 8/10 y compra 5 helados.

- 8 + 5 = 13.
- Gana 1 premio.
- La nueva tarjeta queda en 3/10.
- No se pierden sellos.

Ejemplo: cliente tiene 9/10 y compra 22 helados.

- 9 + 22 = 31.
- Gana 3 premios.
- La nueva tarjeta queda en 1/10.

La fórmula interna es:

```js
const total = sellosAntes + sellosCompra;
const premios = Math.floor(total / 10);
const sellosRestantes = total % 10;
```

### Cliente

- QR siempre visible.
- Sellos visuales.
- Premios pendientes visibles.
- Botón `Compartir / guardar tarjeta`.
- Instrucciones para iPhone: Compartir → Añadir a pantalla de inicio.
- Instrucciones para Android: menú ⋮ → Añadir a pantalla de inicio / Instalar app.

## Subida

1. Descomprime el ZIP.
2. Edita `firebase-config.js` y pega tu configuración real.
3. Sube todos los archivos al root del repo GitHub Pages.
4. En Firebase Console, pega `firestore.rules` en Firestore → Reglas → Publicar.
5. Abre:
   - Cliente: `https://terulet.github.io/Tarjeta-de-Fidelitat/`
   - Staff: `https://terulet.github.io/Tarjeta-de-Fidelitat/staff.html`

## Prueba rápida

1. Crear tarjeta desde el móvil.
2. Abrir Staff en iPad.
3. Escanear QR del cliente.
4. Poner cliente en 8/10.
5. Sellar +5.
6. Confirmar que sale 1 premio y queda 3/10.
7. Pulsar `Premio usado` y confirmar que baja el monedero.


## FIREBASE

Este ZIP ya lleva `firebase-config.js` configurado para el proyecto `gelateria-fidelizacion` y las reglas en `firestore.rules`.


## STAFF iPAD MINI

Esta versión incluye ajuste visual específico para iPad mini: cámara grande al abrir, navegación inferior grande, textos más grandes en lupa/historial y layout sin amontonarse.


## STAFF SIN LOGIN

Esta versión elimina la pantalla de usuario/contraseña del Staff. Al abrir `staff.html` entra directo a cámara. Las reglas incluidas en `firestore.rules` dejan `esStaff()` abierto para que el iPad pueda sellar sin login.


## CAMBIOS CLIENTE + STAFF QR DIRECTO

- Modo cliente: al crear tarjeta ahora genera `clientes/{telefono_token}` y `telefonos/{telefono}`.
- Guarda `cardId` en el móvil y el QR del cliente usa ese `cardId`.
- Staff: tocar el icono QR abre directamente el QR gigante, sin pasar por botón intermedio.


## CORRECCIÓN CREAR TARJETA CLIENTE

Esta versión reescribe el flujo cliente para:
- crear `clientes/{telefono_token}`;
- crear `telefonos/{telefono}`;
- guardar `gelateria_cardId` en el móvil;
- mostrar error real si Firebase rechaza la escritura.

## PRIVACIDAD / GITHUB PAGES

GitHub Pages no hace la web privada. La URL publicada es pública.
El `firebase-config.js` también es visible en cualquier web Firebase; no es una contraseña.
La seguridad real está en `firestore.rules`.

Importante: como pediste Staff sin login, `esStaff()` está abierto en las rules incluidas.
Esto es cómodo para el iPad, pero no es máxima seguridad si `staff.html` queda en una URL pública.
Recomendación práctica: no enlazar `staff.html` desde la web cliente y usar una URL difícil/no publicada para el staff.


## CLIENTE RÁPIDO FINAL

Cambio importante:
- Al pulsar "Crear mi tarjeta", la tarjeta aparece al momento.
- Ya no se queda clavado en "Creando…".
- Después sincroniza con Firebase en segundo plano.
- Si Firebase tarda o falla, muestra aviso claro.
- Service Worker/cache actualizado para evitar que GitHub Pages enseñe una versión vieja.

Prueba recomendada después de subir:
1. Abrir la URL del cliente en modo incógnito o borrar caché.
2. Nombre → móvil → aceptar privacidad → Crear.
3. Debe aparecer inmediatamente: "¡Tarjeta creada!" y el QR del cliente.
4. En Staff, escanear ese QR.
