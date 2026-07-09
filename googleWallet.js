/**
 * googleWallet.js — Núcleo de generación de pases Google Wallet (Loyalty Card).
 * La Gelateria de Roses · Tarjeta de Fidelidad.
 *
 * Framework-agnóstico: no depende de Express/Vercel/Firebase.
 * Se usa desde `api/wallet/google.js` (endpoint) y desde `scripts/create-wallet-class.js`.
 *
 * SEGURIDAD:
 *  - La clave privada NUNCA se expone al frontend.
 *  - El JWT "Save to Google Wallet" se firma SOLO en backend con la service account.
 *  - Las credenciales se leen de variables de entorno (ver .env.example).
 *
 * Referencia: https://developers.google.com/wallet/generic/web / .../wallet/retail/loyalty-cards
 */

'use strict';

const jwt = require('jsonwebtoken');

/** Error controlado: faltan credenciales/config. El endpoint lo traduce a un 503 amable. */
class WalletNotConfiguredError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WalletNotConfiguredError';
    this.code = 'wallet_not_configured';
  }
}

/** Error controlado: datos de tarjeta inválidos (400). */
class WalletInputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WalletInputError';
    this.code = 'wallet_bad_input';
  }
}

/**
 * Lee y valida la configuración desde variables de entorno (o un objeto equivalente).
 * @param {NodeJS.ProcessEnv|Object} [env=process.env]
 * @returns {{issuerId:string, serviceAccountEmail:string, privateKey:string, classSuffix:string, origins:string[]}}
 */
function loadConfig(env = process.env) {
  const issuerId = (env.GOOGLE_WALLET_ISSUER_ID || '').trim();
  const serviceAccountEmail = (env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL || '').trim();
  // En las variables de entorno los saltos de línea del PEM suelen venir como "\n" literales.
  const privateKey = (env.GOOGLE_WALLET_PRIVATE_KEY || '').replace(/\\n/g, '\n').trim();
  const classSuffix = (env.GOOGLE_WALLET_CLASS_SUFFIX || 'gelateria_loyalty_v1').trim();
  const origins = (env.GOOGLE_WALLET_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const missing = [];
  if (!issuerId) missing.push('GOOGLE_WALLET_ISSUER_ID');
  if (!serviceAccountEmail) missing.push('GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL');
  if (!privateKey || privateKey.includes('PEGAR')) missing.push('GOOGLE_WALLET_PRIVATE_KEY');

  if (missing.length) {
    throw new WalletNotConfiguredError(
      'Faltan variables de entorno de Google Wallet: ' + missing.join(', ')
    );
  }

  return { issuerId, serviceAccountEmail, privateKey, classSuffix, origins };
}

/**
 * Convierte un cardId (`+34647319686_7SB4MU`) en un sufijo de objeto válido para Google Wallet.
 * Google exige que el id case con [a-zA-Z0-9._-]. El "+" y otros símbolos se eliminan.
 * El cardId original SÍ se conserva intacto dentro del código de barras (lo que escanea el staff).
 */
function objectSuffixFromCardId(cardId) {
  return String(cardId).replace(/[^\w.-]/g, '');
}

/**
 * Valida los datos mínimos de una tarjeta que llegan al endpoint.
 * @returns {{cardId:string, nombre:string, telefono:string, sellos:number, monedero:number}}
 */
function normalizeCard(input = {}) {
  const cardId = String(input.cardId || '').trim();
  if (!cardId) {
    throw new WalletInputError('Falta el identificador de la tarjeta (cardId).');
  }
  if (cardId.length > 64 || !/^[\w+.-]+$/.test(cardId)) {
    throw new WalletInputError('El identificador de la tarjeta no es válido.');
  }

  const telefono = String(input.telefono || cardId.split('_')[0] || '').trim().slice(0, 20);
  const nombre = String(input.nombre || '').trim().slice(0, 60);

  let sellos = Number(input.sellos);
  if (!Number.isFinite(sellos) || sellos < 0) sellos = 0;
  sellos = Math.min(Math.floor(sellos), 10);

  let monedero = Number(input.monedero);
  if (!Number.isFinite(monedero) || monedero < 0) monedero = 0;
  // Tope defensivo: evita incrustar enteros absurdos en el pase.
  monedero = Math.min(Math.floor(monedero), 999);

  return { cardId, nombre, telefono, sellos, monedero };
}

/**
 * Construye el objeto Loyalty de Google Wallet para una tarjeta concreta.
 * @param {Object} card  Resultado de normalizeCard()
 * @param {Object} cfg   Resultado de loadConfig()
 */
function buildLoyaltyObject(card, cfg) {
  const objectId = `${cfg.issuerId}.${objectSuffixFromCardId(card.cardId)}`;
  const classId = `${cfg.issuerId}.${cfg.classSuffix}`;

  return {
    id: objectId,
    classId: classId,
    state: 'ACTIVE',
    accountId: card.telefono || card.cardId,
    accountName: card.nombre || 'Cliente',
    barcode: {
      type: 'QR_CODE',
      value: card.cardId,
      alternateText: card.cardId,
    },
    loyaltyPoints: {
      label: 'Sellos',
      balance: { string: `${card.sellos}/10` },
    },
    secondaryLoyaltyPoints: {
      label: 'Premios',
      balance: { int: card.monedero },
    },
    textModulesData: [
      {
        id: 'como_usar',
        header: 'Cómo usarla',
        body: 'Enseña este código en el mostrador cada vez que compres. La tarjeta no caduca.',
      },
    ],
  };
}

/**
 * Genera la URL "Save to Google Wallet" firmando un JWT con la clave privada.
 * El objeto Loyalty va embebido en el JWT; Google lo crea al guardar si la clase ya existe.
 *
 * @param {Object} input  { cardId, nombre, telefono, sellos, monedero }
 * @param {Object} [env=process.env]
 * @returns {{ saveUrl:string, objectId:string, jwt:string }}
 */
function createSaveUrl(input, env = process.env) {
  const cfg = loadConfig(env);
  const card = normalizeCard(input);
  const loyaltyObject = buildLoyaltyObject(card, cfg);

  const claims = {
    iss: cfg.serviceAccountEmail,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    origins: cfg.origins,
    payload: {
      loyaltyObjects: [loyaltyObject],
    },
  };

  const token = jwt.sign(claims, cfg.privateKey, { algorithm: 'RS256' });

  return {
    saveUrl: `https://pay.google.com/gp/v/save/${token}`,
    objectId: loyaltyObject.id,
    jwt: token,
  };
}

/**
 * Definición de la CLASE Loyalty (se crea una sola vez vía API o consola).
 * La usa scripts/create-wallet-class.js. Es plantilla; ajusta logo/colores si quieres.
 */
function buildLoyaltyClass(cfg) {
  const classId = `${cfg.issuerId}.${cfg.classSuffix}`;
  return {
    id: classId,
    issuerName: 'La Gelateria de Roses',
    programName: 'Tarjeta de Fidelidad',
    programLogo: {
      sourceUri: {
        uri: 'https://terulet.github.io/Tarjeta-de-Fidelitat/icon-512.png',
      },
      contentDescription: {
        defaultValue: { language: 'es', value: 'La Gelateria de Roses' },
      },
    },
    reviewStatus: 'UNDER_REVIEW',
    hexBackgroundColor: '#033E3C',
    countryCode: 'ES',
    localizedIssuerName: {
      defaultValue: { language: 'es', value: 'La Gelateria de Roses' },
    },
    localizedProgramName: {
      defaultValue: { language: 'es', value: 'Tarjeta de Fidelidad' },
    },
  };
}

module.exports = {
  WalletNotConfiguredError,
  WalletInputError,
  loadConfig,
  normalizeCard,
  objectSuffixFromCardId,
  buildLoyaltyObject,
  buildLoyaltyClass,
  createSaveUrl,
};
