/* ============================================================
   Cena 2D das animações (Gaia, Zéfiro...): o mesmo palco, os mesmos
   rótulos e o mesmo ritmo das cenas 3D (anim/calima.html), num
   canvas. Cada animação passa:
     TEXT    { pt, en, fr }: note, pause, play, tags { chave:[título, texto] }
     TAGS    [{ key, wide:[fx, fy, 'left'|'right'], narrow:[...] }]
     desenhar(ctx, t, W, H, { narrow }) -> { chave:[x, y] }  (as âncoras)
     periodo, quadroParado (o instante mostrado a quem pede menos movimento)
   Depende de anim.js (NDAnim).
   ============================================================ */
(function(){
  const COR = { void:'#050807', clay:'#c6cdcb', nevoa:'#9aa5a1', grafite:'#616c68', painel:'#0b1210',
                escuro:'#161c1a', synapse:'#cedc00', linha:'rgba(232,237,235,.12)', linha2:'rgba(232,237,235,.22)' };
  const SYN = a => `rgba(206,220,0,${a})`;
  const TINTA = a => `rgba(232,237,235,${a})`;
  const lerp = (a, b, k) => a + (b - a) * k;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const suave = v => { v = clamp(v); return v * v * (3 - 2 * v); };
  /* 0 antes de a, 1 depois de b, suave no meio */
  const entre = (t, a, b) => suave((t - a) / (b - a));
  /* números pseudoaleatórios estáveis: a cena é a mesma a cada volta */
  function semente(s){ return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  function NDCena(cfg){
    const lang = NDAnim.lang;
    const TEXT = cfg.TEXT[lang] || cfg.TEXT.pt;
    const $ = id => document.getElementById(id);
    const stage = $('stage');
    const canvas = document.createElement('canvas');
    stage.prepend(canvas);
    const ctx = canvas.getContext('2d');
    const params = new URLSearchParams(location.search);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const periodo = cfg.periodo || 10;
    let playing = !reduced, clock = 0, last = null, raf = 0, visible = true, revealStart = null;
    const frozen = params.has('t');
    if (frozen) clock = +params.get('t') || 0;
    else if (reduced && cfg.quadroParado != null) clock = cfg.quadroParado;

    let W = 0, H = 0, dpr = 1;
    function resize(){
      W = stage.clientWidth; H = stage.clientHeight;
      dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    }
    new ResizeObserver(resize).observe(stage);
    resize();

    /* ---------- rótulos: escritos uma vez, depois parados ---------- */
    const svg = $('leaders'), NS = 'http://www.w3.org/2000/svg';
    const TAGS = cfg.TAGS.map((tg, i) => {
      const el = document.createElement('div');
      el.className = 'tag'; el.innerHTML = '<b></b><span></span>';
      $('tags').appendChild(el);
      const line = document.createElementNS(NS, 'polyline'); line.setAttribute('class', 'leader'); svg.appendChild(line);
      const dot = document.createElementNS(NS, 'circle'); dot.setAttribute('r', 2.5); dot.setAttribute('class', 'anchor'); svg.appendChild(dot);
      return { ...tg, el, line, dot, num:String(i + 1).padStart(2, '0'), shown:-1 };
    });
    const CHARS_PER_SEC = 34, GAP = 0.9;
    function drawTags(anch){
      const narrow = W < 760;
      const since = revealStart === null ? -1 : (performance.now() - revealStart) / 1000;
      let offset = 0;
      TAGS.forEach(tg => {
        const [title, sub] = TEXT.tags[tg.key];
        const n = reduced ? title.length : Math.max(0, Math.min(title.length, Math.floor((since - offset) * CHARS_PER_SEC)));
        offset += title.length / CHARS_PER_SEC + GAP;
        if (n !== tg.shown){
          tg.el.firstChild.innerHTML = n > 0 ? `<i>${tg.num}</i>` : '';
          tg.el.firstChild.append(title.slice(0, n));
          tg.el.querySelector('span').textContent = sub;
          tg.el.classList.toggle('is-done', n === title.length);
          tg.shown = n;
        }
        const a = anch[tg.key];
        const on = n > 0 && a ? 1 : 0;
        tg.line.style.opacity = on; tg.dot.style.opacity = on;
        if (!a) return;
        const [x, y] = a;
        const [fx, fy, edge] = narrow ? tg.narrow : tg.wide;
        const tw = Math.max(tg.el.offsetWidth, 1), th = tg.el.offsetHeight;
        const left = edge === 'left' ? fx * W : fx * W - tw, top = fy * H;
        tg.el.style.transform = `translate(${left}px, ${top}px)`;
        const above = y < top;
        const baseY = above ? top - 6 : top + th + 6;
        const nearX = Math.abs(x - left) < Math.abs(x - (left + tw)) ? left : left + tw;
        const farX = nearX === left ? left + tw : left;
        tg.line.setAttribute('points', `${x},${y} ${nearX},${baseY} ${farX},${baseY}`);
        tg.dot.setAttribute('cx', x); tg.dot.setAttribute('cy', y);
      });
    }

    function applyLanguage(){
      document.querySelectorAll('[data-t]').forEach(el => { el.textContent = TEXT[el.dataset.t]; });
      NDAnim.botao($('toggle'), playing, TEXT);
      $('legend').innerHTML = TAGS.map(tg => TEXT.tags[tg.key]).map(([title, body], i) =>
        `<li><b><i>${String(i + 1).padStart(2, '0')}</i>${title}</b><p>${body}</p></li>`).join('');
    }
    applyLanguage();

    function frame(now){
      if (last !== null && playing && !frozen) clock += Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = COR.void; ctx.fillRect(0, 0, W, H);
      const anch = cfg.desenhar(ctx, clock % periodo, W, H, { narrow: W < 760, clock, TEXT }) || {};
      drawTags(anch);
      raf = visible ? requestAnimationFrame(frame) : 0;
    }
    function start(){ if (!raf){ last = null; raf = requestAnimationFrame(frame); } }

    $('status')?.remove();
    const fontes = document.fonts ? document.fonts.ready : Promise.resolve();
    fontes.then(start);
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && revealStart === null) revealStart = performance.now() + 500;
      if (visible) start();
    }, { threshold:0.3 }).observe(stage);
    $('toggle').addEventListener('click', () => { playing = !playing; applyLanguage(); });
  }

  /* ---------- pincéis comuns ---------- */
  const P = {
    COR, SYN, TINTA, lerp, clamp, suave, entre, semente,
    /* a malha discreta do fundo, como o chão das cenas 3D */
    grade(ctx, W, H, passo = 44){
      ctx.save(); ctx.strokeStyle = 'rgba(154,165,161,.05)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let x = (W % passo) / 2; x < W; x += passo){ ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); }
      for (let y = (H % passo) / 2; y < H; y += passo){ ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); }
      ctx.stroke();
      const g = ctx.createRadialGradient(W * .5, H * .45, 0, W * .5, H * .45, Math.max(W, H) * .7);
      g.addColorStop(0, 'rgba(5,8,7,0)'); g.addColorStop(1, 'rgba(5,8,7,.9)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    },
    /* rótulo pequeno: Archivo 600, caixa alta */
    rotulo(ctx, txt, x, y, { cor = COR.nevoa, tam = 10.5, alinha = 'left', base = 'alphabetic' } = {}){
      ctx.save(); ctx.font = `600 ${tam}px Archivo, sans-serif`; ctx.fillStyle = cor; ctx.textAlign = alinha; ctx.textBaseline = base;
      if ('letterSpacing' in ctx) ctx.letterSpacing = '1.4px';
      ctx.fillText(String(txt).toUpperCase(), x, y); ctx.restore();
    },
    mono(ctx, txt, x, y, { cor = COR.nevoa, tam = 11, alinha = 'left', base = 'alphabetic' } = {}){
      ctx.save(); ctx.font = `500 ${tam}px "IBM Plex Mono", monospace`; ctx.fillStyle = cor; ctx.textAlign = alinha; ctx.textBaseline = base;
      ctx.fillText(txt, x, y); ctx.restore();
    },
    caixa(ctx, x, y, w, h, r){ ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); },
    brilho(ctx, cor, raio){ ctx.shadowColor = cor; ctx.shadowBlur = raio; }
  };
  window.NDCena = NDCena;
  window.NDPincel = P;
})();
