/* 2.21.0: o índice de projetos e a página de cada projeto, sem banco.
   Servir o site na 8766 (ver testes/LEIAME.md). As animações são trocadas
   por uma página mínima que só diz a altura, como a de verdade. */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const stub = readFileSync(new URL('./stub-site.js', import.meta.url), 'utf8');
const ANIM = `<!doctype html><meta charset="utf-8"><body style="margin:0;height:333px;background:#050807">
<script>parent.postMessage({ nd:'anim', h:333 }, location.origin);</script>`;
const nav = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
let falhas = 0, checks = 0;
function confere(nome, ok, detalhe){
  checks++; console.log(`${ok ? '  ok ' : 'FALHA'}  ${nome}${ok || detalhe === undefined ? '' : ' → ' + JSON.stringify(detalhe)}`);
  if (!ok) falhas++;
}
async function abrir(hash, { lang = 'pt', teste = {}, viewport = { width:1280, height:900 } } = {}){
  const ctx = await nav.newContext({ viewport }); ctx.setDefaultTimeout(8000);
  const p = await ctx.newPage(), erros = []; p.on('pageerror', e => erros.push(e.message));
  await p.route('**/*supabase*.js', r => r.fulfill({ contentType:'application/javascript', body:stub }));
  await p.route('**/anim/*.html*', r => r.fulfill({ contentType:'text/html', body:ANIM }));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(([lang, teste]) => { localStorage.setItem('nd-lang', lang); window.__teste = teste; }, [lang, teste]);
  await p.goto('http://127.0.0.1:8766/index.html' + hash, { waitUntil:'domcontentloaded' });
  return { ctx, p, erros };
}
async function fechar({ ctx, erros }){ confere('sem erro de página', erros.length === 0, erros); await ctx.close(); }
const texto = (p, sel) => p.locator(sel).first().innerText();

try{
  console.log('O índice, com a reserva');
  {
    const t = await abrir('#/projects'), { p } = t;
    await p.waitForSelector('.pj-card');
    confere('os oito projetos publicados, a Opalina primeiro e maior', await p.locator('.pj-card').count() === 8
      && /Opalina/.test(await texto(p, '.pj-card')) && await p.locator('.pj-card').first().evaluate(e => e.classList.contains('g8')));
    confere('o lead conta no masculino', /^Oito projetos/.test(await texto(p, '.pg-head .lead')));
    const c = p.locator('.pj-card').first();
    confere('o cartão leva à página e usa o pôster da animação', await c.getAttribute('href') === '#/projects/opalina'
      && await c.locator('img').getAttribute('src') === 'anim/posters/opalina.jpg');
    confere('cada cartão tem a família do projeto', await c.evaluate(e => e.classList.contains('f-ion'))
      && await p.locator('.pj-card.f-retina').count() === 1);
    await p.getByRole('button', { name:'Concluídos' }).click();
    confere('o filtro Concluídos deixa só o Órion', await p.locator('.pj-card').count() === 1 && /Órion/.test(await texto(p, '.pj-card')));
    await p.getByRole('button', { name:'Conceito' }).click();
    confere('Conceito: Zéfiro e Aurora', (await p.locator('.pj-card h3').allInnerTexts()).join() === 'Zéfiro,Aurora');
    await p.getByRole('button', { name:'Todos' }).click();
    confere('Todos volta aos oito', await p.locator('.pj-card').count() === 8);
    confere('o botão escolhido fica marcado', await p.getByRole('button', { name:'Todos' }).getAttribute('aria-pressed') === 'true');
    await fechar(t);
  }

  console.log('A página do Órion, com a reserva (banco fora)');
  {
    const t = await abrir('#/projects/orion'), { p } = t;
    await p.waitForSelector('.pj-hero h1');
    confere('o nome, a frase e a fase', (await texto(p, '.pj-hero h1')) === 'Órion' && /Exercício para quem está sedado/.test(await texto(p, '.pj-hero .tl'))
      && /Concluído/.test(await texto(p, '.pj-ficha')));
    confere('o título da aba', await p.title() === 'Órion | NeuroDynamics');
    confere('a página tem a família Retina', await p.locator('#pj-pg.f-retina').count() === 1);
    const alts = await p.locator('.pj-parc img').evaluateAll(xs => xs.map(x => x.alt));
    confere('os parceiros: logos com nome, e texto sem logo', alts.includes('Visuri') && alts.some(a => /IMREA/.test(a))
      && /Hospital São Luiz Jabaquara/.test(await texto(p, '.pj-parc')), alts);
    const f = p.locator('.pj-palco iframe');
    confere('a animação no idioma da página', (await f.getAttribute('src')) === 'anim/orion.html?lang=pt' && (await f.getAttribute('title')) === 'Animação: Órion');
    await p.waitForSelector('.pj-tela.medida');
    confere('a altura vem da animação', await p.locator('.pj-tela').evaluate(e => getComputedStyle(e).getPropertyValue('--alt').trim()) === '333px');
    const nums = await p.locator('.pj-num .n').allInnerTexts();
    confere('três números, como o site escreve', nums.length === 3 && nums[0].replace(/\s/g, '') === '40%' && /−1,78\s*dia$/.test(nums[1].trim()), nums);
    confere('o número da literatura tem a fonte com link', await p.locator('.pj-num').first().locator('a').getAttribute('href') === 'https://doi.org/10.1177/1751143714563016'
      && await p.locator('.pj-num').first().locator('a').getAttribute('target') === '_blank');
    confere('a origem marcada em cada número', (await p.locator('.pj-num .src .st').allInnerTexts()).every(x => /literatura/i.test(x)));
    confere('a produção: três parcerias, encerradas, sem filtro de tipo', await p.locator('.pj-item').count() === 3
      && await p.locator('.pj-chips').count() === 0 && /Encerrada/i.test(await texto(p, '.pj-item .fim')));
    confere('o próximo projeto é a Calima', await p.locator('.pj-prox').getAttribute('href') === '#/projects/calima');
    confere('a banda com o botão da família escreve para a equipe', /^mailto:hello@neurodynamics\.dev\?subject=Projeto%20%C3%93rion$/.test(await p.locator('.band.fam .btn.fam').getAttribute('href')));
    await p.click('.pj-prox');
    await p.waitForFunction(() => document.querySelector('.pj-hero h1')?.textContent === 'Calima');
    confere('o próximo abre a outra página, no topo', await p.evaluate(() => scrollY) < 50 && (await p.locator('.pj-palco iframe').getAttribute('src')).startsWith('anim/calima.html'));
    await fechar(t);
  }
  {
    const t = await abrir('#/projects/nebula', { lang:'en' }), { p } = t;
    await p.waitForSelector('.pj-num');
    const pre = await texto(p, '.pj-num .pre'), n = await texto(p, '.pj-num .n');
    confere('em inglês: Over 15 million', /over/i.test(pre) && /^15\s*million$/.test(n.trim()), [pre, n]);
    confere('a faixa em inglês', /13 to 30\s*Hz/.test(await p.locator('.pj-num .n').nth(1).innerText()));
    confere('o rascunho do banco não aparece: produção vazia com o convite', /Nothing published yet/.test(await texto(p, '.pj-semnada'))
      && await p.locator('.pj-semnada a').getAttribute('href') === '#/news');
    await fechar(t);
  }
  {
    const t = await abrir('#/projects/gaia', { lang:'fr' }), { p } = t;
    await p.waitForSelector('.pj-hero h1');
    confere('sem número, a seção some', await p.locator('.pj-nums').count() === 0);
    confere('em francês, a frase da Gaia', /Ce que disent les données/.test(await texto(p, '.pj-hero .tl')));
    await fechar(t);
  }
  {
    const t = await abrir('#/projects/nao-existe'), { p } = t;
    await p.waitForFunction(() => /Não encontramos/.test(document.querySelector('#pj-msg')?.textContent || ''));
    confere('slug que não existe: o recado e o caminho de volta', await p.locator('.pj-voltar').getAttribute('href') === '#/projects');
    await fechar(t);
  }
  {
    const t = await abrir('#/projects/%3Cscript%3E'), { p } = t;
    await p.waitForSelector('#pj-msg');
    confere('slug inválido nem consulta o banco', /Não encontramos/.test(await texto(p, '#pj-msg'))
      && (await p.evaluate(() => (window.__rpcs || []).filter(x => x.nome === 'site_projeto_publico').length)) === 0);
    await fechar(t);
  }

  console.log('Com o banco');
  {
    const t = await abrir('#/projects/opalina', { teste:{ projetos:'banco' } }), { p } = t;
    await p.waitForFunction(() => document.querySelector('.pj-hero .tl')?.textContent === 'Texto do banco.');
    confere('o texto do banco substitui a reserva', /Primeiro parágrafo do banco/.test(await texto(p, '.pj-porque .big')));
    confere('a numeração segue a lista do banco', /01 \/ 02/.test(await texto(p, '.pj-hero .no')));
    confere('o filtro da produção tem só os tipos que existem', (await p.locator('.pj-chips button').allInnerTexts()).map(x => x.replace(/\d+/g, '').trim()).join() === 'Tudo,Artigos,Apresentações,Parcerias');
    confere('o título vem como texto, nunca como HTML', await p.evaluate(() => !window.__xss) && /<img src=x/.test(await texto(p, '.pj-item h3')));
    confere('a data do artigo e o link para abrir', /set\.?\s*de 2026|set\.? 2026/i.test(await texto(p, '.pj-item .dt'))
      && await p.locator('.pj-item .lk').first().getAttribute('href') === 'https://doi.org/10.1/x');
    await p.getByRole('button', { name:/^Artigos/ }).click();
    confere('Artigos filtra a lista', await p.locator('.pj-item').count() === 1);
    confere('a animação não recarregou com o banco', await p.locator('.pj-palco iframe').count() === 1
      && await p.evaluate(() => document.querySelectorAll('.pj-tela').length) === 1);
    await p.evaluate(() => { location.hash = '#/projects/novo-db'; });
    await p.waitForFunction(() => document.querySelector('.pj-hero h1')?.textContent === 'Novo');
    confere('projeto sem animação conhecida: placeholder, sem iframe', await p.locator('.pj-palco iframe').count() === 0 && await p.locator('.pj-palco .ph').count() === 1);
    await p.evaluate(() => { location.hash = '#/'; });
    await p.waitForSelector('.pcard');
    confere('o início mostra os dois do banco, com o link de cada página', await p.locator('.pcard').count() === 2
      && await p.locator('.pcard').nth(1).getAttribute('href') === '#/projects/novo-db');
    await fechar(t);
  }

  console.log('Celular');
  {
    const t = await abrir('#/projects/orion', { viewport:{ width:390, height:844 } }), { p } = t;
    await p.waitForSelector('.pj-num');
    const vaza = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    confere('nada vaza para o lado', vaza <= 1, vaza);
    confere('os números em uma coluna', await p.locator('.pj-nums').evaluate(e => getComputedStyle(e).gridTemplateColumns.split(' ').length) === 1);
    await fechar(t);
  }
}catch(e){ falhas++; console.error('FALHA  exceção:', e.message); }
await nav.close();
console.log(falhas ? `${falhas} de ${checks} verificações falharam.` : `Tudo certo. ${checks} verificações passaram.`);
process.exit(falhas ? 1 : 0);
