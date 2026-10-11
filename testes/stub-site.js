/* Supabase falso do site (testes com Playwright). O teste serve este
   arquivo no lugar do supabase-js do CDN. Anota cada chamada em
   window.__rpcs. Opções em window.__teste (antes de carregar a página):
     { semNoticias:true }   noticias_publicas devolve []
     { erro:'noticias' }    noticias_publicas e noticia_publica dão erro
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
  const r = d => Promise.resolve({ data:d, error:null });
  const falha = m => Promise.resolve({ data:null, error:{ message:m } });
  window.supabase = { createClient(){ return {
    rpc(nome, args = {}){
      (window.__rpcs ||= []).push({ nome, p:args });
      const T = window.__teste || {};
      if (nome === 'site_projetos_publico' || nome === 'site_imprensa_publico') return r([]);
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
