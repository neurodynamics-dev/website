/* Supabase falso do site (testes com Playwright). O teste serve este
   arquivo no lugar do supabase-js do CDN. Anota cada chamada em
   window.__rpcs. Opções em window.__teste (antes de carregar a página):
     { semNoticias:true }   noticias_publicas devolve []
     { erro:'noticias' }    noticias_publicas e noticia_publica dão erro
     { projetos:'banco' }   site_projetos_publico e site_projeto_publico
                            respondem como o banco da 2.21.0 (dois projetos)
   Sem { projetos:'banco' }, site_projeto_publico dá erro e a página do
   projeto fica com a reserva do index.html, como num banco fora do ar.
   As notícias seguem o contrato de membro/fichas/CONTRATO-FEED.md. */
(function(){
  const longo = 'O protótipo da órtese passou por dez mil ciclos na bancada do LABBIO sem folga nas articulações.\n\n'
    + 'Na segunda fase, o time **ajustou o firmware** e repetiu o ensaio. Veja o [relatório](https://neurodynamics.dev/relatorio).\n\n'
    + '- dez mil ciclos\n- sem folga\n\n'
    + 'Um link que não pode virar link: [clique](javascript:alert(1)). E um <script>alert(1)</script> que tem de aparecer como texto.';
  const NOTICIAS = [
    { tipo:'noticia', slug:'ortese-passa-no-teste', titulo:'Órtese passa no teste de bancada', resumo:'Dez mil ciclos sem folga',
      texto:null, autor:'Equipe de Comunicação', publicado_em:'2026-10-09T15:00:00Z', imagem:'noticias/f1/1.jpg',
      reacoes:{ '👏':3, '❤️':1 }, ref:'f1' },
    { tipo:'topico', slug:null, titulo:'Seminário aberto na sexta', resumo:'Às 14h no auditório do bloco E',
      texto:'Aberto a todos. Inscrição na porta.', autor:'Ana Figueiredo', publicado_em:'2026-10-08T12:00:00Z', imagem:null,
      reacoes:null, ref:'f2' }
  ];
  const DETALHE = { 'ortese-passa-no-teste': { status:'ok', slug:'ortese-passa-no-teste', redirecionar:false, tipo:'noticia',
    titulo:'Órtese passa no teste de bancada', subtitulo:'Dez mil ciclos sem folga', texto:longo, autor:'Equipe de Comunicação',
    publicado_em:'2026-10-09T15:00:00Z', publico:true,
    imagens:[{ url:'noticias/f1/1.jpg', legenda:'O protótipo na bancada' }, { url:'noticias/f1/2.jpg', legenda:null }],
    reacoes:{ '👏':3, '❤️':1 }, minha_reacao:null, ref:'f1' } };
  /* o banco da 2.21.0: a Opalina com o texto mudado no painel, e um
     projeto que a reserva não conhece, sem animação */
  const PROJ = [
    { slug:'opalina', nome:'Opalina', status:'In progress', familia:'ion', animacao:'opalina', tags:['Critical care'],
      tagline:'Text from the database.', tagline_pt:'Texto do banco.', resumo:'R.', resumo_pt:'Resumo do banco.',
      descricao:'D.', descricao_pt:'Primeiro parágrafo do banco.\n\nSegundo parágrafo.', imagem_url:null },
    { slug:'novo-db', nome:'Novo', status:'Concept', familia:'iris', animacao:'arabella', tags:[],
      tagline:'Only in the database.', tagline_pt:'Só no banco.', resumo:null, descricao:null, imagem_url:null }
  ];
  const PAGINAS = {
    opalina: { numeros:[{ valor:57, unidade:'%', origem:'literatura', rotulo_pt:'menor área das fibras', fonte:'Levine et al., NEJM, 2008',
        fonte_url:'https://www.nejm.org/doi/full/10.1056/NEJMoa070447' }],
      saidas:[
        { tipo:'artigo', titulo:'Phrenic stimulation <img src=x onerror="window.__xss=1">', veiculo:'Crit Care', situacao:'submetido',
          data:'2026-09-15', url:'https://doi.org/10.1/x', nota_pt:'Artigo da bancada.' },
        { tipo:'apresentacao', titulo:'Pôster no CBEB', veiculo:'CBEB 2026', situacao:'apresentado' },
        { tipo:'parceria', titulo:'Visuri', situacao:'em_andamento', imagem_url:'assets/visuri.png', nota_pt:'Plataformas.' }] },
    'novo-db': { numeros:[], saidas:[] }
  };
  const r = d => Promise.resolve({ data:d, error:null });
  const falha = m => Promise.resolve({ data:null, error:{ message:m } });
  window.supabase = { createClient(){ return {
    rpc(nome, args = {}){
      (window.__rpcs ||= []).push({ nome, p:args });
      const T = window.__teste || {};
      if (nome === 'site_projetos_publico') return r(T.projetos === 'banco' ? PROJ : []);
      if (nome === 'site_projeto_publico'){
        if (T.projetos !== 'banco') return falha('banco fora');
        const p = PROJ.find(x => x.slug === args.p_slug);
        return r(p ? { status:'ok', projeto:p, ...PAGINAS[p.slug] } : { status:'nao_encontrado' });
      }
      if (nome === 'site_imprensa_publico') return r([]);
      if (nome === 'noticias_publicas'){
        if (T.erro === 'noticias') return falha('falhou');
        if (T.semNoticias) return r([]);
        return r(NOTICIAS.filter(n => !args.p_antes || n.publicado_em < args.p_antes).slice(0, args.p_limite || 12));
      }
      if (nome === 'noticia_publica'){
        if (T.erro === 'noticias') return falha('falhou');
        if (args.p_slug === 'nome-antigo') return r({ ...DETALHE['ortese-passa-no-teste'], redirecionar:true });
        return r(DETALHE[args.p_slug] || { status:'nao_encontrada' });
      }
      if (nome === 'comunidade_inscrever'){
        const e = String(args.p_email || '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return r({ status:'email_invalido' });
        if (!String(args.p_nome || '').trim()) return r({ status:'nome_invalido' });
        if (args.p_consentimento !== true) return r({ status:'consentimento' });
        if (e === 'limite@exemplo.test') return r({ status:'limite' });
        return r({ status:'ok' });
      }
      if (nome === 'comunidade_confirmar')
        return r({ status: args.p_token === '11111111-1111-1111-1111-111111111111' ? 'ok' : 'invalido' });
      return falha('rpc desconhecida no stub: ' + nome);
    }
  }; } };
})();
