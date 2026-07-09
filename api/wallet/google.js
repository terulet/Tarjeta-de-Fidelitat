/**
 * Endpoint: /api/wallet/google
 * Genera la URL "Añadir a Google Wallet" para una tarjeta de fidelidad.
 *
 * Pensado para Vercel / cualquier runtime con firma (req, res) estilo Node HTTP.
 * (Adaptadores para Cloud Run / Firebase Functions en GOOGLE_WALLET_SETUP.md.)
 *
 * Método: GET o POST
 *   Parámetros (query o body JSON): cardId (obligatorio), nombre, telefono, sellos, monedero
 *
 * Respuestas:
 *   200 { saveUrl, objectId }
 *   400 { error:'wallet_bad_input', message }
 *   405 { error:'method_not_allowed' }
 *   503 { error:'wallet_not_configured', message }   ← sin credenciales, el frontend lo maneja
 */

'use strict';

const {
  createSaveUrl,
  WalletNotConfiguredError,
  WalletInputError,
} = require('../../googleWallet.js');

/** CORS: permite el origen del cliente (GitHub Pages u otros configurados en env). */
function applyCors(req, res) {
  const allowed = (process.env.GOOGLE_WALLET_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const origin = req.headers.origin;

  if (origin && (allowed.length === 0 || allowed.includes(origin))) {
    // Origen permitido (o lista sin configurar → se refleja el origen concreto,
    // nunca un comodín "*").
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (allowed.length) {
    res.setHeader('Access-Control-Allow-Origin', allowed[0]);
  }
  // Sin cabecera ACAO si no hay origen y no hay lista: el navegador bloquea por defecto.
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function readInput(req) {
  // Query params (GET) + body (POST). El body puede llegar ya parseado (Vercel) o como string.
  const q = req.query || {};
  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {
      body = {};
    }
  }
  return {
    cardId: body.cardId ?? q.cardId,
    nombre: body.nombre ?? q.nombre,
    telefono: body.telefono ?? q.telefono,
    sellos: body.sellos ?? q.sellos,
    monedero: body.monedero ?? q.monedero,
  };
}

module.exports = function handler(req, res) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'method_not_allowed' }));
  }

  res.setHeader('Content-Type', 'application/json');

  try {
    const input = readInput(req);
    const { saveUrl, objectId } = createSaveUrl(input);
    res.statusCode = 200;
    return res.end(JSON.stringify({ saveUrl, objectId }));
  } catch (err) {
    if (err instanceof WalletInputError) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: err.code, message: err.message }));
    }
    if (err instanceof WalletNotConfiguredError) {
      // 503 controlado: el frontend muestra "disponible pronto" sin romper la app.
      res.statusCode = 503;
      return res.end(JSON.stringify({ error: err.code, message: err.message }));
    }
    // eslint-disable-next-line no-console
    console.error('wallet/google error', err);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'internal_error' }));
  }
};

// Exporta también la lógica auxiliar para tests.
module.exports.applyCors = applyCors;
module.exports.readInput = readInput;
