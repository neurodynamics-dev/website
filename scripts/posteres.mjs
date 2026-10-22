// Gera os pôsteres dos cartões (anim/posters/<nome>.jpg): um quadro de cada
// animação, sem rótulos, a 1280 × 720. Os cartões e o fundo do palco usam
// o pôster enquanto a animação não carrega.
//
//   python3 -m http.server 8766 -d . &      (na raiz do site)
//   node scripts/posteres.mjs [nome...]
//
// Usa o Playwright de ../membro/testes/node_modules (como testes/). Sem rede
// para o jsDelivr, aponte THREE_DIR para uma cópia local do pacote three
// (npm install three@0.185.1) e o script serve o three.js de lá.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(raiz, 'testes', 'package.json'));
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = createRequire(path.join(raiz, '..', 'membro', 'testes', 'package.json'))('playwright')); }

// o quadro de cada uma: ?t congela a cena (q = pico do quadríceps, i = meio do estímulo)
const QUADROS = { opalina:'t=i', orion:'t=q', calima:'t=q', nebula:'t=17.2', equio:'t=4.2', aurora:'t=2.6',
                   gaia:'t=10', zefiro:'t=10.8' };
const nomes = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(QUADROS);
const BASE = process.env.BASE || 'http://127.0.0.1:8766/';
const THREE_DIR = process.env.THREE_DIR;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
fs.mkdirSync(path.join(raiz, 'anim', 'posters'), { recursive: true });
for (const nome of nomes){
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  if (THREE_DIR) await page.route('https://cdn.jsdelivr.net/npm/three@0.185.1/**', r =>
    r.fulfill({ path: path.join(THREE_DIR, r.request().url().split('three@0.185.1/')[1]), contentType: 'text/javascript' }));
  await page.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  const erros = [];
  page.on('pageerror', e => erros.push(e.message));
  await page.goto(`${BASE}anim/${nome}.html?poster=1&${QUADROS[nome] || ''}`, { waitUntil: 'load' });
  await page.waitForTimeout(+(process.env.ESPERA || 7000));
  const saida = path.join(raiz, 'anim', 'posters', nome + '.jpg');
  await page.locator('#stage').screenshot({ path: saida, type: 'jpeg', quality: 82 });
  console.log(erros.length ? `FALHA ${nome}: ${erros.join('; ')}` : `  ok  ${nome} (${Math.round(fs.statSync(saida).size / 1024)} KB)`);
  await page.close();
}
await browser.close();
