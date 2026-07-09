# Google Wallet · Guía de configuración

**Tarjeta de Fidelidad · La Gelateria de Roses**

Esta guía explica, paso a paso y desde cero, cómo activar el botón
**“Añadir a Google Wallet”** que ya aparece en la tarjeta del cliente.

> **Idea clave.** La web del cliente sigue siendo estática en GitHub Pages y **no
> cambia de URL** (el póster QR sigue valiendo). Lo único nuevo es un pequeño
> **backend** que firma de forma segura el pase de Google Wallet. La clave privada
> **nunca** viaja al navegador.

```
Cliente (GitHub Pages)  ──POST cardId──▶  Backend /api/wallet/google  ──firma JWT──▶  URL "Save to Google Wallet"
     index.html                              (Vercel u otro)            (service account)        pay.google.com
```

---

## 0. Qué necesitas

- La cuenta de Google que ya usas para Firebase (`gelateria-fidelizacion`).
- ~30 minutos la primera vez.
- **Coste: 0 €.** El backend cabe de sobra en el plan gratuito de Vercel.

Piezas que vas a crear:

| Pieza | Dónde | Para qué |
|---|---|---|
| **Issuer ID** | Google Pay & Wallet Console | Identifica tu negocio como emisor de pases |
| **Service Account + clave** | Google Cloud Console | Firma los pases desde el backend |
| **Clase Loyalty** | Se crea con un script (1 vez) | Plantilla del programa (logo, colores) |
| **Backend desplegado** | Vercel | Expone `/api/wallet/google` |
| **`wallet-config.js`** | Este repo | Le dice al cliente dónde está el backend |

---

## 1. Activar la Google Wallet API

1. Entra en **https://console.cloud.google.com** con tu cuenta de Google.
2. Arriba, selecciona el proyecto **`gelateria-fidelizacion`** (el mismo de Firebase).
3. Busca **“Google Wallet API”** en la barra de búsqueda → **Habilitar**.

## 2. Crear la cuenta de emisor (Issuer)

1. Entra en **https://pay.google.com/business/console**.
2. Menú **Google Wallet API** → completa el alta del emisor (nombre del negocio:
   `La Gelateria de Roses`).
3. Copia el **Issuer ID** (un número largo). → será `GOOGLE_WALLET_ISSUER_ID`.

## 3. Crear la Service Account y su clave

1. En **Google Cloud Console** → **IAM y administración → Cuentas de servicio → Crear cuenta de servicio**.
   - Nombre: `wallet`.
2. Créala (no hace falta darle roles del proyecto).
3. Ábrela → pestaña **Claves → Agregar clave → Crear clave nueva → JSON → Crear**.
   Se descarga un archivo `*.json`. **Guárdalo bien y no lo subas nunca al repo.**
4. Vuelve a la **Google Pay & Wallet Console** → **Users / Cuentas vinculadas** y
   autoriza el email de esa service account como emisor (rol de acceso a la API).

Del JSON descargado necesitarás dos campos:

- `client_email` → `GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL`
- `private_key`  → `GOOGLE_WALLET_PRIVATE_KEY`

## 4. Preparar las variables de entorno

Copia `.env.example` como `.env` y rellénalo:

```bash
cp .env.example .env
```

```env
GOOGLE_WALLET_ISSUER_ID=3388000000022345678
GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL=wallet@gelateria-fidelizacion.iam.gserviceaccount.com
GOOGLE_WALLET_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
GOOGLE_WALLET_CLASS_SUFFIX=gelateria_loyalty_v1
GOOGLE_WALLET_ORIGINS=https://terulet.github.io
```

> **La clave privada en una sola línea.** En el JSON los saltos de línea aparecen
> como `\n`. Déjalos tal cual (literales) y rodea todo con comillas dobles.

## 5. Crear la clase Loyalty (una sola vez)

La *clase* es la plantilla del programa (logo, colores, nombre). Se crea una vez:

```bash
npm install
npm run create-wallet-class
```

Debe imprimir `✅ Clase creada: <issuer>.gelateria_loyalty_v1`.
(Si ya existía, la actualiza.) Alternativa manual: crear la clase Loyalty a mano
en la Google Pay & Wallet Console con el mismo ID.

## 6. Desplegar el backend en Vercel (gratis)

1. Crea una cuenta en **https://vercel.com** (puedes entrar con GitHub).
2. **Add New → Project** → importa el repo `terulet/Tarjeta-de-Fidelitat`.
3. En **Settings → Environment Variables**, añade las 5 variables del paso 4
   (mismos nombres y valores que tu `.env`).
4. **Deploy.** Vercel te dará una URL, p. ej. `https://tarjeta-de-fidelitat.vercel.app`.
5. Comprueba el endpoint (debe responder JSON):

   ```bash
   curl -X POST https://TU-APP.vercel.app/api/wallet/google \
     -H "Content-Type: application/json" \
     -d '{"cardId":"+34647319686_ABC123","nombre":"Test","sellos":3,"monedero":0}'
   ```

   Respuesta esperada: `{"saveUrl":"https://pay.google.com/gp/v/save/...","objectId":"..."}`.

> El backend y el frontend viven en dominios distintos, por eso el endpoint ya
> incluye **CORS** limitado a los orígenes de `GOOGLE_WALLET_ORIGINS`.

## 7. Conectar el cliente al backend

Edita **`wallet-config.js`** y pon la URL de Vercel:

```js
window.WALLET_CONFIG = {
  apiBase: "https://TU-APP.vercel.app",
  googleWalletEnabled: true,
  appleWalletEnabled: false,
};
```

Sube `wallet-config.js` al repo. En 1-2 minutos GitHub Pages sirve la versión nueva.
Abre la tarjeta del cliente, pulsa **“Añadir a Google Wallet”** y debería abrir el
pase en tu Google Wallet. **Listo.**

---

## Probar en local (sin desplegar)

```bash
npm install
npm test                 # ejecuta los tests del generador de JWT (no necesita credenciales)
```

Para probar el endpoint en local puedes usar la Vercel CLI:

```bash
npm i -g vercel
vercel dev               # levanta http://localhost:3000/api/wallet/google
```

Y en `wallet-config.js` apunta temporalmente `apiBase` a `http://localhost:3000`.

---

## Qué falta para producción (checklist)

- [ ] Issuer ID de producción aprobado en Google Pay & Wallet Console.
- [ ] Las 5 variables de entorno configuradas en Vercel (no en el repo).
- [ ] Clase Loyalty creada (`npm run create-wallet-class`).
- [ ] `GOOGLE_WALLET_ORIGINS` incluye el dominio real del cliente
      (`https://terulet.github.io` y/o el dominio propio si lo hubiera).
- [ ] `wallet-config.js` con el `apiBase` correcto y subido a GitHub Pages.
- [ ] Solicitar a Google el paso de la clase de `UNDER_REVIEW` a `APPROVED`
      (los pases funcionan en revisión para tus cuentas de prueba; para todos los
      clientes conviene la aprobación).

## Seguridad (resumen)

- La **clave privada** solo existe en las variables de entorno del backend. Nunca
  en el frontend ni en el repo (`.env` está en `.gitignore`).
- El **JWT se firma en el servidor**, nunca en el navegador.
- El endpoint **valida** el `cardId` y limita los campos (`sellos` 0-10, etc.).
- Sin credenciales, el endpoint responde **503 controlado** y el botón del cliente
  muestra “disponible pronto”: la app **no se rompe**.

---

## Apple Wallet (pendiente)

El botón **“Añadir a Apple Wallet”** ya está en la tarjeta, **deshabilitado** y
marcado como *Próximamente*. Queda a la espera de la **aprobación de la cuenta
Apple Developer**.

Cuando la cuenta esté aprobada, la integración será casi inmediata porque la
arquitectura ya está preparada:

1. Obtener de Apple: **Pass Type ID**, certificado de firma y el **WWDR**.
2. Crear un módulo `appleWallet.js` análogo a `googleWallet.js` que construya el
   `.pkpass` (JSON + imágenes + firma PKCS#7) usando las mismas variables de
   entorno (`APPLE_PASS_TYPE_ID`, `APPLE_TEAM_ID`, `APPLE_CERT`, `APPLE_CERT_KEY`, `APPLE_WWDR`).
3. Añadir el endpoint `api/wallet/apple.js` que devuelva el `.pkpass` firmado.
4. Poner `appleWalletEnabled: true` en `wallet-config.js` y apuntar el botón al
   nuevo endpoint. El botón, los textos y el layout ya existen.

Los datos de la tarjeta (`cardId`, sellos, monedero) son los mismos, así que el
mismo `currentWalletPayload()` del cliente sirve para ambos.
