/**
 * scripts/create-wallet-class.js
 * Crea (o actualiza) UNA sola vez la CLASE Loyalty en Google Wallet.
 *
 * La clase define el "programa" (logo, colores, nombre). Los objetos (tarjetas
 * de cada cliente) se crean solos al pulsar "Añadir a Google Wallet", pero la
 * clase debe existir antes. Alternativa manual: Google Pay & Wallet Console.
 *
 * Uso (con las variables de entorno cargadas — ver .env.example):
 *   npm install
 *   node scripts/create-wallet-class.js
 *
 * Requiere las mismas credenciales que el endpoint. No expone nada al frontend.
 */

'use strict';

const { GoogleAuth } = require('google-auth-library');
const { loadConfig, buildLoyaltyClass } = require('../googleWallet.js');

const BASE_URL = 'https://walletobjects.googleapis.com/walletobjects/v1';

async function main() {
  const cfg = loadConfig(process.env);
  const loyaltyClass = buildLoyaltyClass(cfg);

  const auth = new GoogleAuth({
    credentials: {
      client_email: cfg.serviceAccountEmail,
      private_key: cfg.privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
  });
  const client = await auth.getClient();

  // ¿Existe ya la clase?
  try {
    await client.request({ url: `${BASE_URL}/loyaltyClass/${loyaltyClass.id}` });
    console.log('La clase ya existe. Actualizando…', loyaltyClass.id);
    await client.request({
      url: `${BASE_URL}/loyaltyClass/${loyaltyClass.id}`,
      method: 'PUT',
      data: loyaltyClass,
    });
    console.log('✅ Clase actualizada:', loyaltyClass.id);
    return;
  } catch (err) {
    if (!err.response || err.response.status !== 404) {
      throw err;
    }
  }

  // No existe → crear.
  await client.request({
    url: `${BASE_URL}/loyaltyClass`,
    method: 'POST',
    data: loyaltyClass,
  });
  console.log('✅ Clase creada:', loyaltyClass.id);
}

main().catch((err) => {
  const detail = err.response && err.response.data ? JSON.stringify(err.response.data, null, 2) : err.message;
  console.error('❌ Error creando la clase Loyalty:\n', detail);
  process.exit(1);
});
