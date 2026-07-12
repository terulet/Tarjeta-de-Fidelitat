// Comprobación de la apertura por ?card= en index.html.
// Extrae la REGEX real de validación de index.html (readCardIdFromURL) y prueba
// el mismo flujo (URLSearchParams decodifica; validación mínima) contra varios
// casos. Ejecuta:  node tests/open-by-cardid.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const m = html.match(/if\(!(\/.+?\/)\.test\(card\)\)/);
assert.ok(m, 'No se encontró la regex de validación de readCardIdFromURL en index.html');
const RE = eval(m[1]); // regex literal de nuestro propio fichero

function readCardIdFromURL(search) {
  const raw = new URLSearchParams(search).get('card');
  if (raw == null) return null;
  const card = raw.trim();
  if (!RE.test(card)) return null;
  return card;
}

const cases = [
  ['?card=%2B34600111222_ABC234', '+34600111222_ABC234', 'cardId con "+" (codificado %2B)'],
  ['?card=%20%20', null, 'espacios codificados -> rechazado'],
  ['', null, 'sin parámetro -> comportamiento actual'],
  ['?card=', null, 'parámetro vacío -> rechazado'],
  ['?card=%2B34%20600', null, 'cardId con espacio interior -> rechazado'],
  ['?card=DEMO-0001', 'DEMO-0001', 'cardId alterno válido'],
];

let ok = 0;
for (const [q, exp, desc] of cases) {
  const got = readCardIdFromURL(q);
  assert.strictEqual(got, exp, `FALLO [${desc}] ${q}: esperado ${JSON.stringify(exp)}, obtenido ${JSON.stringify(got)}`);
  console.log(`OK  ${desc}: ${JSON.stringify(q)} -> ${JSON.stringify(got)}`);
  ok++;
}
console.log(`\n✅ ${ok}/${cases.length} comprobaciones de ?card= pasan`);
