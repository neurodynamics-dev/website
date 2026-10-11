/* F2: notícias, matéria, inscrição e confirmação da newsletter, sem banco.
   Servir o site na 8766 (ver testes/LEIAME.md). */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const stub = readFileSync(new URL('./stub-site.js', import.meta.url), 'utf8');
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
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
  await p.route('**/storage/v1/object/public/**', r => r.fulfill({ contentType:'image/png', body:PNG }));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(([lang, teste]) => { localStorage.setItem('nd-lang', lang); window.__teste = teste; }, [lang, teste]);
  await p.goto('http://localhost:8766/index.html' + hash, { waitUntil:'domcontentloaded' });
  return { ctx, p, erros };
}
async function fechar({ ctx, erros }){ confere('sem erro de página', erros.length === 0, erros); await ctx.close(); }
const chamadas = (p, nome) => p.evaluate(n => (window.__rpcs || []).filter(x => x.nome === n), nome);

try{
  console.log('Lista');
  {
    const t = await abrir('#/news'), { p } = t;
    await p.waitForSelector('.news-it');
    confere('dois itens', await p.locator('.news-it').count() === 2);
    const not = p.locator('.news-it').nth(0), top = p.locator('.news-it').nth(1);
    confere('a notícia leva à matéria', await not.locator('h2 a').getAttribute('href') === '#/news/ortese-passa-no-teste');
    confere('a imagem vem do bucket público', (await not.locator('img.img').getAttribute('src')).endsWith('/storage/v1/object/public/noticias/f1/1.jpg'));
    confere('o tópico mostra o texto', (await top.innerText()).includes('Aberto a todos'));
    confere('o tópico não tem "Ler a matéria completa" nem reações', !(await top.innerText()).includes('Ler a matéria completa') && await top.locator('.reacoes').count() === 0);
    const reac = await not.locator('span.reacao').allInnerTexts();
    confere('contagens só para ler', reac.some(x => x.includes('👏') && x.includes('3')) && reac.some(x => x.includes('❤️') && x.includes('1'))
      && await p.locator('button.reacao').count() === 0, reac);
    confere('"Reagir" vai para o SOMA', await not.locator('a.reacao').getAttribute('href') === 'https://membro.neurodynamics.dev/noticia.html?n=ortese-passa-no-teste');
    confere('o menu acende Notícias', await p.locator('[data-r="news"].on, a.on[href="#/news"], [aria-current="page"][href="#/news"]').count() >= 1
      || (await p.evaluate(() => [...document.querySelectorAll('a[href="#/news"]')].some(a => a.className.includes('on') || a.getAttribute('aria-current')))));
    confere('sem "Carregar mais" com menos de 12', await p.locator('#news-mais').isHidden());

    console.log('Inscrição');
    await p.click('#nl-btn');
    confere('sem a caixa: mensagem e nenhuma chamada', (await p.locator('#nl-e-aceite').innerText()).includes('Marque a caixa')
      && (await chamadas(p, 'comunidade_inscrever')).length === 0);
    await p.fill('#nl-nome', 'Leitora'); await p.fill('#nl-email', 'x@'); await p.check('#nl-aceite'); await p.click('#nl-btn');
    await p.waitForFunction(() => !document.querySelector('#nl-e-email').hidden);
    confere('e-mail inválido: mensagem no campo', (await p.locator('#nl-e-email').innerText()) === 'Confira o e-mail.');
    await p.fill('#nl-email', 'limite@exemplo.test'); await p.click('#nl-btn');
    await p.waitForFunction(() => !document.querySelector('#nl-e-geral').hidden);
    confere('limite: mensagem embaixo do botão', (await p.locator('#nl-e-geral').innerText()).includes('Muitos pedidos'));
    await p.fill('#nl-email', 'leitora@exemplo.test'); await p.click('#nl-btn');
    await p.waitForSelector('#nl .ok');
    const ult = (await chamadas(p, 'comunidade_inscrever')).at(-1).p;
    confere('chamada com e-mail, nome e consentimento', ult.p_email === 'leitora@exemplo.test' && ult.p_nome === 'Leitora' && ult.p_consentimento === true, ult);
    confere('a resposta não diz se já existia', (await p.locator('#nl .ok').innerText()).startsWith('Se o endereço estiver certo'));
    await fechar(t);
  }

  console.log('Matéria');
  {
    const t = await abrir('#/news/ortese-passa-no-teste'), { p } = t;
    await p.waitForSelector('#news-art h1');
    confere('título', (await p.locator('#news-art h1').innerText()) === 'Órtese passa no teste de bancada');
    confere('duas figuras e a legenda', await p.locator('#news-art figure').count() === 2
      && (await p.locator('#news-art figcaption').first().innerText()) === 'O protótipo na bancada');
    confere('imagem sem legenda usa o título no alt', await p.locator('#news-art figure img').nth(1).getAttribute('alt') === 'Órtese passa no teste de bancada');
    confere('negrito', (await p.locator('#news-art .news-txt strong').first().innerText()) === 'ajustou o firmware');
    confere('link https abre em outra aba', await p.locator('#news-art .news-txt a[href="https://neurodynamics.dev/relatorio"]').getAttribute('target') === '_blank');
    confere('javascript: não vira link', await p.locator('#news-art a[href^="javascript"]').count() === 0);
    confere('<script> aparece escrito e não roda', (await p.locator('#news-art .news-txt').innerText()).includes('<script>alert(1)</script>')
      && await p.locator('#news-art script').count() === 0);
    confere('lista com dois itens', await p.locator('#news-art .news-txt li').count() === 2);
    confere('autoria', (await p.locator('#news-art .news-meta').innerText()).includes('Texto: Equipe de Comunicação'));
    confere('título da aba', (await p.title()) === 'Órtese passa no teste de bancada | NeuroDynamics');
    await fechar(t);
  }
  {
    const t = await abrir('#/news/nome-antigo'), { p } = t;
    await p.waitForSelector('#news-art h1');
    confere('slug antigo: o endereço vira o novo', await p.evaluate(() => location.hash) === '#/news/ortese-passa-no-teste');
    confere('sem recarregar nem chamar de novo', (await chamadas(p, 'noticia_publica')).length === 1);
    await fechar(t);
  }
  {
    const t = await abrir('#/news/nao-existe'), { p } = t;
    await p.waitForSelector('#news-art .news-msg:not(:empty)');
    await p.waitForFunction(() => document.querySelector('#news-art').innerText.includes('Não encontramos'));
    confere('não encontrada, com o link de volta', await p.locator('#news-art a.voltar[href="#/news"]').count() === 1);
    await fechar(t);
  }

  console.log('Confirmação');
  {
    const t = await abrir('#/newsletter/confirmar?t=11111111-1111-1111-1111-111111111111'), { p } = t;
    await p.waitForFunction(() => document.querySelector('#nl-conf').innerText.includes('Inscrição confirmada'));
    confere('token certo confirma', true);
    await p.evaluate(() => { location.hash = '#/newsletter/confirmar?t=22222222-2222-2222-2222-222222222222'; });
    await p.waitForFunction(() => document.querySelector('#nl-conf')?.innerText.includes('inválido'));
    confere('outro token: inválido', true);
    const antes = (await chamadas(p, 'comunidade_confirmar')).length;
    await p.evaluate(() => { location.hash = '#/newsletter/confirmar?t=abc'; });
    await p.waitForFunction(() => document.querySelector('#nl-conf')?.innerText.includes('inválido'));
    confere('token malformado: inválido sem chamar o banco', (await chamadas(p, 'comunidade_confirmar')).length === antes);
    await fechar(t);
  }

  console.log('Idioma, vazio, erro, início, celular');
  {
    const t = await abrir('#/news', { lang:'en' }), { p } = t;
    await p.waitForSelector('.news-it');
    confere('menu em inglês com News', await p.locator('a[href="#/news"]').filter({ hasText:'News' }).count() >= 1);
    confere('etiqueta "In Portuguese"', (await p.locator('.news-it').first().innerText()).toLowerCase().includes('in portuguese'));
    await fechar(t);
  }
  {
    const t = await abrir('#/news', { teste:{ semNoticias:true } }), { p } = t;
    await p.waitForFunction(() => document.querySelector('#news-lista').innerText.includes('Nenhuma notícia'));
    confere('vazio', true);
    await p.evaluate(() => { location.hash = '#/'; });
    await p.waitForTimeout(300);
    confere('o início não mostra a seção de notícias', await p.locator('#home-news').isHidden());
    await fechar(t);
  }
  {
    const t = await abrir('#/news', { teste:{ erro:'noticias' } }), { p } = t;
    await p.waitForFunction(() => document.querySelector('#news-lista').innerText.includes('Não foi possível'));
    confere('erro com "Tentar de novo"', await p.locator('#news-lista button', { hasText:'Tentar de novo' }).count() === 1);
    await fechar(t);
  }
  {
    const t = await abrir('#/'), { p } = t;
    await p.waitForSelector('#home-news:not([hidden]) .home-news a');
    confere('início: as notícias recentes', await p.locator('#home-news .home-news a').count() === 2
      && await p.locator('#home-news a[href="#/news"]').count() >= 1);
    await fechar(t);
  }
  for (const h of ['#/news', '#/news/ortese-passa-no-teste']){
    const t = await abrir(h, { viewport:{ width:390, height:844 } }), { p } = t;
    await p.waitForSelector(h === '#/news' ? '.news-it' : '#news-art h1');
    const w = await p.evaluate(() => document.scrollingElement.scrollWidth);
    confere(`celular sem rolagem horizontal em ${h}`, w <= 390, w);
    await fechar(t);
  }
}catch(e){ console.error(e); falhas++; }
await nav.close();
if (falhas){ console.log(`\n${falhas} falha(s) em ${checks} verificações.`); process.exit(1); }
console.log(`\nTudo certo. ${checks} verificações passaram.`);
