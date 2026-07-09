# Tarjeta de Fidelidad v2 — La Gelateria de Roses
## Guía de puesta en marcha

**Tiempo total: ~20 minutos.** La URL pública no cambia, así que el póster QR ya impreso sigue siendo válido.

---

## Los archivos del paquete

| Archivo | Qué es | ¿Sustituye al actual? |
|---|---|---|
| `index.html` | App del cliente (tarjeta viva) | Sí |
| `staff.html` | App del iPad para el personal | Nuevo |
| `privacidad.html` | Política de privacidad (6 idiomas) | Nuevo |
| `firebase-config.js` | Configuración de Firebase (se pega 1 vez) | Nuevo |
| `firestore.rules` | Reglas de seguridad (se pegan en la consola, NO se sube al repo — aunque no pasa nada si se sube) | Nuevo |
| `manifest.json` | Manifest PWA del cliente | Sí |
| `manifest-staff.json` | Manifest PWA del staff | Nuevo |
| `sw.js` | Service worker (offline + instalación Android) | Nuevo |

Los iconos (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`) y el póster ya están en el repo: **no hay que tocarlos**.

---

## Paso 1 — Crear el proyecto Firebase (~10 min, gratis)

1. Ve a **console.firebase.google.com** e inicia sesión con tu Google.
2. **Crear proyecto** → nombre: `gelateria-fidelizacion` → desactiva Google Analytics (no hace falta) → Crear.
3. Menú izquierdo → **Compilación → Firestore Database** → **Crear base de datos**:
   - Ubicación: **eur3 (europe-west)** ← importante, servidores UE (RGPD)
   - Modo: **producción**
4. Pestaña **Reglas** → borra lo que haya → pega el contenido completo de `firestore.rules` → **Publicar**.
5. Menú izquierdo → **Compilación → Authentication** → **Comenzar** → pestaña **Sign-in method** → habilita **Correo electrónico/contraseña** (solo la primera opción, sin "vínculo").
6. Pestaña **Users** → **Agregar usuario**:
   - Email: `staff@lagelateria.app` (o el que quieras — no hace falta que exista de verdad)
   - Contraseña: una buena, la usará el personal para entrar en el iPad
7. Rueda dentada ⚙️ (arriba izquierda) → **Configuración del proyecto** → baja hasta **Tus apps** → icono **`</>`** (web) → nombre `tarjeta` → Registrar (sin Hosting) → te muestra el bloque `firebaseConfig` → **cópialo**.

## Paso 2 — Pegar la configuración

Abre `firebase-config.js` y sustituye los valores `PEGAR_AQUI` por los de tu bloque `firebaseConfig`. Es el único archivo que hay que editar, y vale para las dos apps a la vez.

## Paso 3 — Subir al repo

Sube al **root** de `terulet/Tarjeta-de-Fidelitat` (rama main):
`index.html` · `staff.html` · `privacidad.html` · `firebase-config.js` · `manifest.json` · `manifest-staff.json` · `sw.js`

En 1-2 minutos GitHub Pages sirve la nueva versión:
- Cliente: `https://terulet.github.io/Tarjeta-de-Fidelitat/` (la del póster)
- Staff: `https://terulet.github.io/Tarjeta-de-Fidelitat/staff.html`

## Paso 4 — Primer arranque del staff

1. Abre `staff.html` en cualquier navegador → entra con el email y contraseña del Paso 1.6.
2. Te sale el **asistente de configuración inicial** (solo la primera vez): nombre del local, sellos para premio (10), premio, tope diario, minutos anti doble-escaneo y **PIN de encargado** (protege canjes, ajustes y borrados).
3. Listo — ya estás en la pantalla de Validar.

## Paso 5 — Preparar el iPad mini

1. Abre `staff.html` en Safari → inicia sesión → Compartir → **Añadir a pantalla de inicio** → queda como app "Gelateria Staff".
2. Ábrela desde el icono y **permite el acceso a la cámara** cuando lo pida.
3. **Ajustes iOS → Pantalla y brillo → Bloqueo automático → Nunca** (el iPad estará siempre enchufado).
4. Modo kiosco (opcional pero recomendado): **Ajustes → Accesibilidad → Acceso Guiado → activar** y ponle código. Dentro de la app, triple clic al botón lateral → Iniciar. Así nadie sale de la app.
5. **Escáner USB (NETUM M5S o similar):** conéctalo al USB-C. Funciona como un teclado: dispara al QR del cliente y valida al instante, sin tocar la pantalla. Cámara y escáner conviven — usa el que vaya mejor en cada momento. (El escáner viene de fábrica con sufijo Enter, que es lo que la app espera; no hay que configurar nada.)

## Paso 6 — Prueba completa (5 min, con 2 móviles)

1. **Móvil A**: escanea el póster (o abre la URL) → nombre + móvil + consentimiento → tarjeta creada con su QR.
2. **iPad**: escanea el QR del móvil A → ficha del cliente → SELLAR +2 → 🔥 mira el móvil A: **los sellos caen animados en su pantalla en directo**.
3. Vuelve a escanear enseguida → aviso naranja de doble escaneo → pide confirmación. ✓
4. Séllale hasta 10 → celebración en ambas pantallas → el premio queda en el **monedero** (sellos vuelven a 0 y sigue acumulando).
5. **Canjear premio** → pide el PIN → monedero baja a 0 premios pendientes... o quédatelo para otro día: no caduca.
6. Pestaña **Hoy** → verás todos los movimientos con hora, local y usuario.
7. **Móvil B**: intenta registrar el MISMO número → "este móvil ya tiene tarjeta" → en el iPad: Buscar → Transferir a móvil nuevo (PIN) → móvil B escanea el QR del iPad con su cámara → la tarjeta se abre en B con todo; el QR de A queda anulado.
8. En el móvil: botón pequeño "Eliminar mi tarjeta" → borra todo (derecho de supresión RGPD).

---

## Cosas a revisar

- **Email de contacto en `privacidad.html`**: he puesto `info@lagelateriaderoses.com` (aparece 6 veces, una por idioma). Si el email real es otro, cámbialo con buscar-y-sustituir antes de subir.
- **Enlace de reseñas de Google**: en el iPad → Ajustes → pega tu enlace `https://g.page/r/...`. En cuanto lo guardes, a todos los clientes les aparece el botón "⭐ ¿Nos dejas una reseña?" en su tarjeta. (El aviso de la 3ª visita es solo un recordatorio para el personal — nunca se condiciona el premio a la reseña, que va contra las políticas de Google.)

## Coste

**0 €/mes.** Plan gratuito de Firebase (Spark): 50.000 lecturas y 20.000 escrituras al día. Un día fortísimo de agosto (300 clientes sellados) son ~1.500 operaciones: al 3% del límite. GitHub Pages, gratis como siempre.

## Preguntas rápidas

**¿Y los QR de la versión antigua?** Si algún cliente enseña un QR viejo (solo número), el iPad lo detecta, avisa y te lleva a Buscar con el número ya puesto para transferirle la tarjeta nueva. (La v1 no guardaba nada en la nube, así que empezará de 0 sellos — puedes regalarle los que tuviera con "Ajustar sellos".)

**¿Segundo local / segundo iPad?** Abre `staff.html`, inicia sesión con el mismo usuario, y solo te preguntará el nombre del local. Todos los dispositivos comparten la misma base de datos al instante.

**¿Cambiar el premio o el nº de sellos?** iPad → Ajustes → se aplica a todos los locales y a todas las tarjetas al momento.

**¿Un cliente pide que borréis sus datos?** Búscalo por teléfono → Gestionar → Eliminar tarjeta (PIN). O él mismo desde su app.

**¿Se corta el WiFi?** El iPad sigue funcionando con la caché local y sincroniza cuando vuelve la conexión.

---

## Google Wallet (nuevo)

La tarjeta del cliente ya incluye el botón **“Añadir a Google Wallet”** para que
los clientes guarden la tarjeta en su móvil sin líos. Mientras no lo configures,
el botón avisa amablemente de que estará disponible pronto (la app no se rompe).

Para activarlo hay que desplegar un pequeño backend gratuito que firma el pase.
Todo el paso a paso está en **`GOOGLE_WALLET_SETUP.md`**.

El botón de **Apple Wallet** aparece deshabilitado (*Próximamente*): queda a la
espera de la aprobación de la cuenta Apple Developer.
