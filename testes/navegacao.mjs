/* A navegação das páginas principais: o trilho de projetos do início, as
   fotos (com e sem o arquivo), a troca de página por View Transition (o
   pôster do cartão que vira o palco), a rolagem de volta onde se estava,
   o que aparece de uma vez ao abrir, os motivos do contato e o celular.
   Servir o site na 8766 (ver testes/LEIAME.md). */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const stub = readFileSync(new URL('./stub-site.js', import.meta.url), 'utf8');
const ANIM = `<!doctype html><meta charset="utf-8"><body style="margin:0;height:333px;background:#050807">
<script>parent.postMessage({ nd:'anim', h:333 }, location.origin);</script>`;
/* um JPEG de 1 px, para o caso "a foto existe" */
const JPG = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k=', 'base64');
const nav = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
let falhas = 0, checks = 0;
function confere(nome, ok, detalhe){
  checks++; console.log(`${ok ? '  ok ' : 'FALHA'}  ${nome}${ok || detalhe === undefined ? '' : ' → ' + JSON.stringify(detalhe)}`);
  if (!ok) falhas++;
}
async function abrir(hash, { lang = 'pt', viewport = { width:1280, height:900 }, fotos = false, reduzido = false } = {}){
  const ctx = await nav.newContext({ viewport, reducedMotion: reduzido ? 'reduce' : 'no-preference' });
  ctx.setDefaultTimeout(8000);
  const p = await ctx.newPage(), erros = []; p.on('pageerror', e => erros.push(e.message));
  await p.route('**/*supabase*.js', r => r.fulfill({ contentType:'application/javascript', body:stub }));
  await p.route('**/anim/*.html*', r => r.fulfill({ contentType:'text/html', body:ANIM }));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.route('**/assets/fotos/**', r => fotos ? r.fulfill({ contentType:'image/jpeg', body:JPG }) : r.fulfill({ status:404, body:'' }));
  await p.addInitScript(lang => {
    localStorage.setItem('nd-lang', lang);
    /* anota cada View Transition e quem levava o nome do pôster quando ela começou */
    window.__vt = [];
    const orig = document.startViewTransition?.bind(document);
    if (orig) document.startViewTransition = cb => {
      window.__vt.push({ pjMidia: [...document.querySelectorAll('*')].filter(e => getComputedStyle(e).viewTransitionName === 'pj-midia').map(e => e.className) });
      return orig(cb);
    };
  }, lang);
  await p.goto('http://127.0.0.1:8766/index.html' + hash, { waitUntil:'domcontentloaded' });
  return { ctx, p, erros };
}
async function fechar({ ctx, erros }){ confere('sem erro de página', erros.length === 0, erros); await ctx.close(); }
const texto = (p, sel) => p.locator(sel).first().innerText();

try{
  console.log('O início');
  {
    const t = await abrir(''), { p } = t;
    await p.waitForSelector('.trilho-pista .tr-card');
    confere('o trilho tem os oito projetos e o cartão de todos no fim', await p.locator('.tr-card[data-slug]').count() === 8
      && await p.locator('.trilho-pista > :last-child').getAttribute('href') === '#/projects');
    confere('o título conta as frentes', /^Oito frentes/.test(await texto(p, '.trilho-topo h2')));
    confere('o que está na tela abre já visível', await p.locator('#hero ~ .sec-trilho .trilho-topo').evaluate(e => e.classList.contains('viu') && e.classList.contains('ja')));
    confere('as três primeiras imagens do trilho carregam já, as outras depois',
      (await p.locator('.tr-card .pj-img img').evaluateAll(xs => xs.map(x => x.loading))).join() === 'eager,eager,eager,lazy,lazy,lazy,lazy,lazy');
    const ant = p.locator('.trilho-ctl button').first(), prox = p.locator('.trilho-ctl button').last();
    confere('no começo, o botão de voltar fica desligado', await ant.isDisabled() && !(await prox.isDisabled()));
    await prox.click();
    await p.waitForFunction(() => document.querySelector('.trilho-pista').scrollLeft > 100);
    await p.waitForFunction(() => !document.querySelector('.trilho-ctl button').disabled);
    confere('o botão de avançar anda um cartão e liga o de voltar', true);
    const primeiro = await p.locator('.tr-card').first().evaluate(e => Math.round(e.getBoundingClientRect().left));
    const coluna = await p.locator('#hero h1').evaluate(e => Math.round(e.getBoundingClientRect().left));
    await ant.click();
    await p.waitForFunction(() => document.querySelector('.trilho-pista').scrollLeft < 2);
    const alinhado = await p.locator('.tr-card').first().evaluate(e => Math.round(e.getBoundingClientRect().left));
    confere('o primeiro cartão alinha com o texto', Math.abs(alinhado - coluna) <= 2, { alinhado, coluna, depois: primeiro });
    confere('o mosaico: cinco quadros, cada um com a legenda', await p.locator('.mosaico .tile').count() === 5
      && (await p.locator('.mosaico .cap').allInnerTexts()).map(x => x.replace(/^\d+\s*/, '')).join() === 'Software,Firmware e embarcados,IA para a saúde,Sinais e dados,Hardware integrado');
    await p.waitForFunction(() => !document.querySelector('.foto img'));
    confere('sem o arquivo da foto, fica o quadro da marca, sem imagem quebrada', await p.locator('.foto').count() === 6 && await p.locator('.foto img').count() === 0);
    /* a versão anterior do início tinha 495 palavras; o grosso agora são os nomes e as frases dos projetos */
    const palavras = (await p.locator('#main').innerText()).split(/\s+/).filter(Boolean).length;
    confere('pouco texto no início', palavras < 260, palavras);
    await fechar(t);
  }
  {
    const t = await abrir('#/about', { fotos:true }), { p } = t;
    await p.waitForSelector('.foto img.ok');
    await p.waitForFunction(() => [...document.querySelectorAll('.foto img')].every(i => i.classList.contains('ok')));
    confere('com o arquivo, a foto entra, sem texto alternativo (é ambiente)', await p.locator('.foto img').count() === 5
      && (await p.locator('.foto img').evaluateAll(xs => xs.every(x => x.alt === ''))));
    confere('cada foto pede a de 800 ou a de 1600 px', /fotos\/quem-somos-800\.jpg 800w, .*fotos\/quem-somos\.jpg 1600w/.test(await p.locator('.foto img').first().getAttribute('srcset')));
    await fechar(t);
  }

  console.log('Trocar de página');
  {
    const t = await abrir(''), { p } = t;
    await p.waitForSelector('.tr-card[data-slug="orion"]');
    await p.locator('.tr-card[data-slug="orion"]').click();
    await p.waitForFunction(() => document.querySelector('.pj-hero h1')?.textContent === 'Órion');
    const vt = await p.evaluate(() => window.__vt);
    confere('a troca é uma View Transition, e o pôster do cartão clicado leva o nome do palco', vt.length === 1
      && vt[0].pjMidia.length === 1 && /pj-img/.test(vt[0].pjMidia[0]), vt);
    await p.waitForFunction(() => !document.querySelector('.pj-img[style*="view-transition-name"]'));
    confere('o palco do projeto tem o mesmo nome', await p.locator('.pj-tela').evaluate(e => getComputedStyle(e).viewTransitionName) === 'pj-midia');
    await p.goBack();
    await p.waitForSelector('.trilho-pista');
    const volta = await p.evaluate(() => window.__vt.at(-1));
    confere('na volta, também por transição, do palco para o cartão', (await p.evaluate(() => window.__vt.length)) === 2
      && volta.pjMidia.some(c => /pj-tela/.test(c)), volta);
    await fechar(t);
  }
  {
    const t = await abrir('#/projects'), { p } = t;
    await p.waitForSelector('.pj-card');
    await p.evaluate(() => window.scrollTo({ top:1100, behavior:'instant' }));
    await p.waitForFunction(() => history.state?.y === 1100);
    const card = p.locator('.pj-card').nth(4);
    const slug = (await card.getAttribute('href')).split('/').pop();
    await card.click();
    await p.waitForFunction(s => location.hash === '#/projects/' + s, slug);
    await p.waitForSelector('.pj-hero h1');
    confere('um link novo abre no topo', await p.evaluate(() => scrollY) === 0);
    confere('do índice, o pôster do cartão também vira o palco', (await p.evaluate(() => window.__vt.at(-1).pjMidia)).some(c => /pj-img/.test(c)));
    await p.goBack();
    await p.waitForSelector('.pj-card');
    await p.waitForFunction(() => Math.abs(scrollY - 1100) <= 2);
    confere('voltar abre onde se estava', true);
    await p.waitForFunction(() => !document.querySelector('.pj-img[style*="view-transition-name"]'));
    confere('e o nome da transição sai do cartão quando ela acaba', true);
    await p.goForward();
    await p.waitForSelector('.pj-hero h1');
    confere('avançar de novo abre a página no topo, como estava', await p.evaluate(() => scrollY) === 0);
    await fechar(t);
  }
  {
    const t = await abrir('', { reduzido:true }), { p } = t;
    await p.waitForSelector('.tr-card');
    await p.locator('.nd-cab-nav a[href="#/about"]').click();
    await p.waitForSelector('.ledger.fatos');
    confere('com movimento reduzido, a página só troca', (await p.evaluate(() => window.__vt.length)) === 0);
    await fechar(t);
  }

  console.log('Quem somos e contato');
  {
    const t = await abrir('#/about', { lang:'en' }), { p } = t;
    await p.waitForSelector('.como-it');
    confere('três fatos, quatro jeitos de trabalhar, cada um com foto', await p.locator('.fatos .cell').count() === 3
      && await p.locator('.como-it .foto').count() === 4);
    confere('em inglês', /Real projects, real deadlines\./.test(await texto(p, '.sec-head h2')));
    await fechar(t);
  }
  {
    const t = await abrir('#/contact'), { p } = t;
    await p.waitForSelector('.motivo');
    const hrefs = await p.locator('.motivo').evaluateAll(xs => xs.map(x => x.getAttribute('href')));
    confere('cada motivo já abre o e-mail com o assunto', hrefs.length === 5
      && hrefs[0] === 'mailto:hello@neurodynamics.dev?subject=Colabora%C3%A7%C3%A3o%20em%20pesquisa', hrefs[0]);
    confere('o último vai ao site da seleção, em outra aba', hrefs[4] === 'https://selecao.neurodynamics.dev'
      && await p.locator('.motivo').last().getAttribute('target') === '_blank');
    await fechar(t);
  }

  console.log('Celular');
  for (const h of ['', '#/about', '#/contact']){
    const t = await abrir(h, { viewport:{ width:390, height:844 } }), { p } = t;
    await p.waitForSelector('#main section');
    const vaza = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    confere(`${h || 'início'}: nada vaza para o lado`, vaza <= 1, vaza);
    if (!h){
      const m = await p.locator('.mosaico').evaluate(e => ({ rola: e.scrollWidth > e.clientWidth, x: getComputedStyle(e).overflowX }));
      confere('o mosaico vira um trilho de deslizar', m.rola && m.x === 'auto', m);
    }
    if (h === '#/about') confere('os jeitos de trabalhar também deslizam', await p.locator('.como').evaluate(e => e.scrollWidth > e.clientWidth));
    await fechar(t);
  }
}catch(e){ falhas++; console.error('FALHA  exceção:', e.message); }
await nav.close();
console.log(falhas ? `${falhas} de ${checks} verificações falharam.` : `Tudo certo. ${checks} verificações passaram.`);
process.exit(falhas ? 1 : 0);
