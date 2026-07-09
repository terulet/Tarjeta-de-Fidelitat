'use strict';

const test = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');

const {
  createSaveUrl,
  normalizeCard,
  objectSuffixFromCardId,
  buildLoyaltyObject,
  loadConfig,
  WalletNotConfiguredError,
  WalletInputError,
} = require('../googleWallet.js');

// Generamos un par de claves RSA de PRUEBA en memoria (NO son credenciales reales).
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const TEST_ENV = {
  GOOGLE_WALLET_ISSUER_ID: '3388000000012345678',
  GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL: 'wallet@test.iam.gserviceaccount.com',
  // Emula el formato de env var: saltos como \n literales.
  GOOGLE_WALLET_PRIVATE_KEY: privateKey.replace(/\n/g, '\\n'),
  GOOGLE_WALLET_CLASS_SUFFIX: 'gelateria_loyalty_v1',
  GOOGLE_WALLET_ORIGINS: 'https://terulet.github.io, https://lagelateriaderoses.com',
};

test('objectSuffixFromCardId elimina el "+" y símbolos no válidos', () => {
  assert.strictEqual(objectSuffixFromCardId('+34647319686_7SB4MU'), '34647319686_7SB4MU');
});

test('normalizeCard exige cardId', () => {
  assert.throws(() => normalizeCard({}), WalletInputError);
});

test('normalizeCard rechaza cardId con caracteres raros', () => {
  assert.throws(() => normalizeCard({ cardId: 'drop; table' }), WalletInputError);
});

test('normalizeCard limita sellos a 0..10 y deriva teléfono del cardId', () => {
  const c = normalizeCard({ cardId: '+34647319686_7SB4MU', sellos: 99, monedero: -3 });
  assert.strictEqual(c.sellos, 10);
  assert.strictEqual(c.monedero, 0);
  assert.strictEqual(c.telefono, '+34647319686');
});

test('buildLoyaltyObject usa el cardId original en el código de barras', () => {
  const cfg = loadConfig(TEST_ENV);
  const obj = buildLoyaltyObject(normalizeCard({ cardId: '+34647319686_7SB4MU', sellos: 3 }), cfg);
  assert.strictEqual(obj.id, '3388000000012345678.34647319686_7SB4MU');
  assert.strictEqual(obj.classId, '3388000000012345678.gelateria_loyalty_v1');
  assert.strictEqual(obj.barcode.value, '+34647319686_7SB4MU');
  assert.strictEqual(obj.loyaltyPoints.balance.string, '3/10');
});

test('loadConfig lanza WalletNotConfiguredError sin credenciales', () => {
  assert.throws(() => loadConfig({}), WalletNotConfiguredError);
});

test('createSaveUrl genera un JWT firmado y verificable con la clave pública', () => {
  const { saveUrl, jwt: token, objectId } = createSaveUrl(
    { cardId: '+34647319686_7SB4MU', nombre: 'Marta', sellos: 5, monedero: 1 },
    TEST_ENV
  );

  assert.ok(saveUrl.startsWith('https://pay.google.com/gp/v/save/'));
  assert.strictEqual(objectId, '3388000000012345678.34647319686_7SB4MU');

  // La firma debe validar con la clave pública correspondiente (RS256).
  const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
  assert.strictEqual(decoded.iss, TEST_ENV.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL);
  assert.strictEqual(decoded.aud, 'google');
  assert.strictEqual(decoded.typ, 'savetowallet');
  assert.deepStrictEqual(decoded.origins, [
    'https://terulet.github.io',
    'https://lagelateriaderoses.com',
  ]);

  const loyalty = decoded.payload.loyaltyObjects[0];
  assert.strictEqual(loyalty.accountName, 'Marta');
  assert.strictEqual(loyalty.barcode.value, '+34647319686_7SB4MU');
  assert.strictEqual(loyalty.secondaryLoyaltyPoints.balance.int, 1);
});
