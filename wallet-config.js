/**
 * wallet-config.js — Configuración PÚBLICA del frontend para Google Wallet.
 *
 * Aquí NO van claves privadas. Solo la URL base del backend que firma el JWT.
 * (La firma y las credenciales viven en el backend — ver googleWallet.js / .env.example.)
 *
 * Cómo activarlo:
 *   1) Despliega el backend (carpeta api/) en Vercel u otro proveedor.
 *   2) Pon aquí su URL en `apiBase`, p. ej. "https://gelateria-wallet.vercel.app".
 *   3) Sube este archivo. GitHub Pages sirve la versión nueva en 1-2 min.
 *
 * Mientras `apiBase` esté vacío, el botón "Añadir a Google Wallet" se muestra
 * pero avisa amablemente de que estará disponible pronto (la app NO se rompe).
 */
window.WALLET_CONFIG = {
  // Vacío = aún no configurado. Rellena con la URL del backend desplegado.
  apiBase: "",

  // Muestra u oculta el botón de Google Wallet en la tarjeta del cliente.
  googleWalletEnabled: true,

  // Apple Wallet: pendiente de aprobación de la cuenta Apple Developer.
  appleWalletEnabled: false,
};
