# Testes do site

Sem build e sem dependência própria: os testes usam o Playwright já
instalado em `../membro/testes/node_modules` e o Chromium do ambiente
(`/opt/pw-browsers/chromium`).

```sh
# uma vez (o link não vai para o git: está no .gitignore)
ln -s ../../membro/testes/node_modules testes/node_modules

# servir o site na porta 8766 (o SOMA usa a 8765)
python3 -m http.server 8766 -d . >/dev/null 2>&1 &

# rodar
node testes/noticias.mjs
node testes/projetos.mjs
```

| Teste           | O que cobre |
|-----------------|-------------|
| `noticias.mjs`  | A seção de notícias e o feed |
| `projetos.mjs`  | O índice de projetos (filtro, cartões, família) e a página de cada projeto: reserva, banco, idiomas, números com fonte, produção, slug inexistente ou inválido, celular. As animações são trocadas por uma página mínima que só avisa a altura. Com `window.__teste = { projetos:'banco' }` o stub responde com os projetos do banco |

- `stub-site.js` substitui o supabase-js do CDN (`page.route('**/*supabase*.js', ...)`).
  Anota as chamadas em `window.__rpcs`; opções em `window.__teste`
  (ver o cabeçalho do arquivo). As notícias seguem
  `membro/fichas/CONTRATO-FEED.md`.
- As imagens do bucket público (`/storage/v1/object/public/noticias/...`)
  não existem no teste: responda com um PNG de 1 px em `page.route`.
- Fontes do Google: `page.route('**/fonts.googleapis.com/**', r => r.abort())`.
- Cada verificação imprime `  ok ` ou `FALHA`; o teste sai com código 1
  se houver falha. Termine com "Tudo certo. N verificações passaram."
