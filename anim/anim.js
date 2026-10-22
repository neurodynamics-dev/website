/* ============================================================
   Comum às animações dos projetos: o idioma (?lang=en|pt|fr), o
   botão de pausar e a altura, que a página do projeto usa para
   dimensionar o iframe (no celular a legenda fica embaixo do palco).
   ============================================================ */
(function(){
  const q = new URLSearchParams(location.search);
  const lang = ['en','pt','fr'].includes(q.get('lang')) ? q.get('lang') : 'pt';
  const ROT = {
    pt:{ html:'pt-BR', carregando:'Carregando', falhou:'Não foi possível carregar a animação.' },
    en:{ html:'en',    carregando:'Loading',    falhou:'The animation could not be loaded.' },
    fr:{ html:'fr',    carregando:'Chargement', falhou:'L\'animation n\'a pas pu être chargée.' }
  }[lang];
  const SVG = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const PAUSA = SVG('<path d="M8.5 5v14M15.5 5v14"/>'), TOCA = SVG('<path d="M7.5 4.8 19 12 7.5 19.2V4.8Z"/>');

  /* a página que embute ouve {nd:'anim', h}; aberta sozinha, ninguém ouve */
  let ultima = 0;
  function altura(){
    const h = Math.ceil(document.documentElement.scrollHeight);
    if (h === ultima || window.parent === window) return;
    ultima = h;
    try{ window.parent.postMessage({ nd:'anim', h }, location.origin === 'null' ? '*' : location.origin); }catch(_){}
  }

  document.documentElement.lang = ROT.html;
  /* ?poster=1: só a cena, para o pôster dos cartões (scripts/posteres.mjs) */
  if (q.has('poster')) document.documentElement.classList.add('poster');
  document.addEventListener('DOMContentLoaded', () => {
    const st = document.getElementById('status');
    if (st && !st.textContent.trim()) st.textContent = ROT.carregando;
    new ResizeObserver(altura).observe(document.body);
    altura();
  });

  window.NDAnim = {
    lang, rot:ROT, altura,
    botao(el, tocando, T){
      if (!el) return;
      el.innerHTML = tocando ? PAUSA : TOCA;
      el.setAttribute('aria-label', tocando ? T.pause : T.play);
      el.title = tocando ? T.pause : T.play;
    },
    falhou(){ const st = document.getElementById('status'); if (st) st.textContent = ROT.falhou; }
  };
})();
