# Site institucional — neurodynamics.dev

Site principal da NeuroDynamics em **três idiomas** (inglês, português e
francês, com seletor no cabeçalho): home, **Quem somos**, **Projetos** (com
uma página para cada projeto) e **Contato**. Apresenta a equipe como uma **organização sem fins lucrativos**
de pesquisa e desenvolvimento em health-tech, nascida na Escola de Engenharia
da UFMG e sediada no LABBIO. Arquivo único (`index.html`), no mesmo padrão dos
demais apps do SOMA, com a base visual do site do processo seletivo (paleta,
vidro, fundo animado) em versão mais sóbria.

## Conteúdo

| Arquivo        | O que é |
|----------------|---------|
| `index.html`   | O site (rotas por hash: `#/`, `#/about`, `#/projects`, `#/projects/<slug>`, `#/news`, `#/contact`) |
| `anim/`        | As animações das páginas de projeto, uma por arquivo, e os pôsteres (ver [Animações](#animações)) |
| `admin.html`   | Aviso de que a edição mudou para o portal; redireciona para `#/admin/site` do SOMA |
| `assets/`      | Logos locais usadas no letreiro de parceiros e, em `assets/fotos/`, as fotos das páginas principais (ver [Fotos](#fotos)) |
| `ds/`          | Tokens e casca do design system, copiados do repositório `brand` |
| `scripts/`     | `posteres.mjs`, que gera os pôsteres das animações, e `fotos.mjs`, que baixa e recorta as fotos |
| `testes/`      | Testes no navegador, sem banco (ver `testes/LEIAME.md`) |
| `CNAME`        | Domínio do GitHub Pages (`neurodynamics.dev`) |

## Pré-requisitos

Aplicar as migrações **`soma_v9.sql`** (tabela dos projetos),
**`soma_v13.sql`** (colunas de tradução) e **`2.21.0_site_projetos.sql`**
(família, animação, números e produção de cada projeto) no SQL Editor do
Supabase. Todas moram no repositório do SOMA (`neurodynamics-dev/membro`, pasta
`db/`). Sem elas o site continua no ar com o conteúdo de reserva (bloco
`FALLBACK_PROJECTS` no `<script>`), mas a edição pelo portal fica
indisponível.

> Ao colar SQL no Supabase, atenção ao travessão (—): em alguns caminhos de
> cópia ele vira `--`, comenta o resto da linha e quebra a migração. Foi o
> que aconteceu na primeira tentativa da `soma_v9.sql`. As migrações novas
> evitam travessão dentro de strings; acentos são seguros.

## Os três idiomas

O site é publicado em inglês, português e francês. O seletor fica no canto
superior direito do cabeçalho flutuante; a escolha é lembrada no navegador
(`localStorage`) e pode ser forçada por link com `?lang=pt` ou `?lang=fr`.
Sem escolha prévia, o site segue o idioma do navegador e cai no inglês.

- **Textos das páginas:** bloco `L` no topo do `<script>` de `index.html`,
  com um objeto por idioma (`en`, `pt`, `fr`). É o único lugar a editar.
- **Textos dos projetos:** no banco, em colunas por idioma: o inglês nas
  colunas originais (`tagline`, `resumo`, `descricao`; o mesmo vale para o
  rótulo dos números e a nota da produção) e as traduções com sufixo
  (`_pt`, `_fr`). O que ficar vazio cai no inglês e, sem inglês, no
  português.
- **Status e tags:** guardados uma única vez, em inglês, e traduzidos pelo
  site por dicionário (`status` e `tags` dentro de cada idioma no bloco `L`).
  Ao criar um status ou tag novo, acrescente a tradução lá.
- **Números por extenso:** o título "Cinco frentes, uma direção" conta os
  projetos publicados; a lista `nums` de cada idioma tem as formas usadas
  (em português, no feminino: "uma", "duas"…). O índice de projetos conta
  no masculino ("Oito projetos"), pela lista `numsM` do português.
- **Números das seções:** contados na hora de desenhar a página, então
  acrescentar ou remover uma seção (a de imprensa, por exemplo) nunca deixa
  buraco na numeração.
- **Títulos de vídeos e matérias** ficam na língua em que foram publicados,
  como deve ser: são nomes próprios, não texto nosso.

## Como editar

- **Projetos:** no portal do membro, em **Administração › Site
  institucional** (`membro.neurodynamics.dev/#/admin/site`), com papel `admin`
  ou `pessoal`. Ver [Páginas de projeto](#páginas-de-projeto). O supervisor de
  um projeto do SOMA também propõe números e produção pela página do projeto
  no portal; a gestão revisa e põe no ar.
- **Imprensa (aba *Who we are*):** no portal do membro, em **Studio ›
  Configurações › Imprensa do site** (`membro.neurodynamics.dev/#/studio/config/imprensa`).
  O site lê a lista do banco na hora; os blocos `PRESS_VIDEOS` e
  `PRESS_ARTICLES` do `index.html` são só a reserva. Ver [Imprensa](#imprensa).
- **Parceiros do letreiro:** bloco `PARTNERS` no topo do `<script>` de
  `index.html`. Itens com `img` usam o arquivo (coloque em `assets/`);
  sem `img`, o site desenha uma marca tipográfica monocromática — troque
  pela logo real quando o arquivo existir (UFMG e Escola de Engenharia
  estão tipográficas por enquanto).
- **E-mail de contato:** constante `CONTACT_EMAIL` no mesmo bloco
  (hoje `hello@neurodynamics.dev`).
- **Estrutura das páginas:** funções `pageHome/pageAbout/pageProjects/pageContact`
  no `<script>` de `index.html` (elas só montam o HTML; o texto vem do bloco `L`).
  O trilho de projetos do início é `trilhoProjetos`; cada quadro de foto,
  `foto('<chave>', ...)`.
  A página de cada projeto é montada por `pageProjeto` e suas partes
  (`projetoTopo`, `projetoPalco`, `projetoCorpo`).

## Navegação

As páginas principais mostram pouco texto e mais imagem: o início abre com
o título e, logo abaixo, o **trilho de projetos** (um cartão por projeto, com
o pôster da animação, que desliza para o lado; o último cartão leva ao
índice). Depois vêm o mosaico do que construímos (uma foto e uma palavra
por frente), o propósito numa frase ao lado de uma foto, os parceiros e as
notícias. *Quem somos* e *Contato* seguem o mesmo jeito: uma foto grande,
três fatos, cartões curtos. Cada motivo do contato já abre o e-mail com o
assunto preenchido.

- **Troca de página:** é uma View Transition. O cabeçalho fica parado; a
  tela como estava esmaece e a nova sobe um pouco, em 0,15 a 0,25 s, como
  manda o guia da marca. Do cartão de um projeto (no início ou no índice) para a página
  dele, o pôster cresce até virar o palco da animação, e na volta encolhe
  para o cartão de onde saiu (o nome da transição é `pj-midia`).
- **Rolagem:** voltar abre a página onde se estava (a posição fica no
  `history.state` de cada entrada); um link novo abre no topo.
- **Ao abrir:** o que já está na tela aparece de uma vez (a transição da
  página cuida disso); o resto entra ao rolar, em 0,25 s.
- **Trilhos:** no celular, o mosaico e os cartões de *Quem somos* também
  deslizam. No computador, os botões de seta andam um cartão; a pista
  recebe foco e anda pelas setas do teclado.
- **Movimento reduzido** (`prefers-reduced-motion`): sem transição nem
  animação; a página só troca. Navegador sem View Transitions também.

## Fotos

As fotos das páginas principais (12 quadros: o mosaico do início, o
propósito, *Quem somos* e o contato) vêm do [Unsplash](https://unsplash.com)
e moram em `assets/fotos/<chave>.jpg` (1600 px de largura) e
`<chave>-800.jpg`. São ambiente, não informação: o texto alternativo fica
vazio, e a legenda, quando há, fica fora da foto. Sem o arquivo, o quadro
mostra a grade da marca e nada quebra.

- **Escolher ou trocar:** a lista fica em `scripts/fotos.mjs`, com o id de
  cada foto no Unsplash (o fim do endereço da página dela), a proporção do
  quadro e o recorte. `node scripts/fotos.mjs` baixa todas (ou só as que
  forem nomeadas), já recortadas pelo próprio servidor de imagens do
  Unsplash, e escreve `assets/fotos/CREDITOS.md`. Precisa de rede para
  `unsplash.com` e `images.unsplash.com`.
- **Licença:** a do Unsplash permite uso livre, sem pedir permissão; o
  crédito é cortesia e fica no `CREDITOS.md`. Só servem as fotos
  gratuitas: as do **Unsplash+** (com cadeado) têm outra licença.
- **Marca:** retangulares ou com raio de 18 px, sem filtro, sem duotone,
  sem texto por cima.
- **Gente:** foto de banco com pessoas não pode parecer a equipe. Em *Quem
  somos*, a primeira escolha é foto nossa; enquanto não houver, ficam
  fotos de processo (bancada, impressora 3D, quadro de tarefas).

## Páginas de projeto

`#/projects` é o índice: um cartão de vidro por projeto publicado, na ordem
do banco, com o pôster da animação e um filtro por fase. O primeiro ocupa a
largura maior. Cada cartão abre `#/projects/<slug>`, uma página única, curta,
feita para ver mais do que para ler:

1. **Topo:** nome, a frase (`tagline`), fase, área e parceiros.
2. **Palco:** a animação do projeto, em tela cheia na largura.
3. **Por que existe:** um parágrafo (`descricao`). O resto do texto da
   planilha fica fora de propósito; o público quer ver o impacto.
4. **Em números:** poucos números grandes; três é a medida. Cada um diz se vem da
   **literatura** (com fonte e link obrigatórios) ou do **projeto** (dado
   nosso). A seção some quando não há número publicado.
5. **Produção:** artigos, apresentações, estudos, parcerias, prêmios,
   patentes e software, com situação e data. Quando há mais de um tipo,
   aparece o filtro.
6. **Próximo projeto** e a banda de contato na cor da família, com e-mail
   já endereçado ("Projeto Órion").

O site lê a lista por `site_projetos_publico()` e a página por
`site_projeto_publico(slug)`, que devolve projeto, números e produção
**publicados**. Se o banco não responder, a página vem da reserva.

### Cores

Cada projeto tem uma **família** das cores secundárias da marca (`ion`,
`neuron`, `glia`, `retina`, `nexo`, `dendrito`, `lumen`, `ritmo`, `impulso`,
`plexo`, `iris`), escolhida no portal. Ela pinta o cartão no hover, a borda
dos números, a banda e o botão de contato da página; o vidro, o brilho e o
desfoque continuam nas cores principais (Cortex, Axon, Synapse), como manda
o guia da marca. Uma família por superfície.

### O que se preenche no portal

Em **Administração › Site institucional**, três abas:

- **Páginas:** nome, slug, fase, ordem, família, animação, vínculo com o
  projeto do SOMA, os textos (PT, EN, FR), áreas, imagem e publicação.
- **Números:** valor (ou faixa, "13 a 30"), casas decimais, unidade, prefixo
  ("mais de", "até", "cerca de"), rótulo nos três idiomas, origem e fonte.
  Ver a prévia antes de salvar: é como o site escreve.
- **Produção:** tipo, título (como foi publicado), veículo, situação, data,
  link, logo (parcerias) e nota.

O supervisor do projeto, na página do projeto no portal, vê o cartão **No
site** e acrescenta números e produção como rascunho; só a gestão publica.
Item no ar não se edita pelo supervisor (o banco recusa com `no_ar`).

Regra para números: **nenhum sem fonte verificável.** Da literatura, o link
para o artigo; do projeto, só o que a equipe mede ou especifica. Na dúvida,
o projeto fica sem número, como Gaia, Zéfiro e Aurora hoje.

## Animações

Cada animação é uma página em `anim/<nome>.html` que o site embute num
`iframe` (`anim/<nome>.html?lang=pt`). Hoje: `opalina`, `orion`, `calima`,
`nebula`, `equio`, `aurora`, `gaia` e `zefiro`. A escolha é feita no portal;
um projeto sem animação mostra o placeholder técnico.

- **3D** (Opalina, Órion, Calima, Nebula, Équio, Aurora): three.js 0.185.1 do
  jsDelivr e o modelo humano `anim/modelo/humano.glb`. Eletrodos, correntes e
  EEG são pintados no próprio modelo; os rótulos usam Archivo, como o site.
- **2D** (Gaia, Zéfiro): `anim/cena2d.js`, canvas puro, no mesmo traço.
- `anim/anim.js` é comum a todas: lê `?lang` (pt, en, fr), traz os rótulos
  traduzidos, o botão de pausa (que respeita `prefers-reduced-motion`) e avisa
  a altura à página (`postMessage({ nd:'anim', h })`), que ajusta o palco.
- `?poster=1&t=<segundos>` congela a cena sem rótulos: é o que gera os
  pôsteres de `anim/posters/`, usados no cartão do índice e no fundo do palco
  enquanto a animação carrega. Ao mudar uma animação, gere de novo:

```sh
python3 -m http.server 8766 -d . &
node scripts/posteres.mjs nebula        # sem nome: todas
```

Animação nova segue o mesmo caminho: copiar a mais próxima, trocar a cena,
acrescentar o nome em `ANIMACOES` (`index.html`), em `SITE_ANIMACOES`
(`membro/mod-site.js`), na lista da restrição de `site_projetos.animacao`
(migração nova no SOMA) e em `QUADROS` (`scripts/posteres.mjs`).

## Imprensa

A seção **In the press**, na aba *Who we are*, tem duas partes: o carrossel
de vídeos (`PRESS_VIDEOS`) e, embaixo dele, as matérias escritas em cartões
menores (`PRESS_ARTICLES`). Cada lista funciona sozinha — se uma estiver
vazia, só a outra aparece; vazias as duas, a seção inteira some da página.

### Onde se edita: no portal, não aqui

Desde a migração **23.0** (`membro/db/v23_studio.sql`), a lista que vale mora
no banco, na tabela `site_imprensa`, e é editada no portal do membro, em
**Studio › Configurações › Imprensa do site**: acrescentar um vídeo é colar o
link do YouTube (o portal tira o id), pôr o veículo e o ano; a ordem de lá é a
ordem do carrossel; o olho tira do site sem apagar. Editam a gestão do Studio
(admin e o grupo aprovador) e, como no painel do site, `admin` e `pessoal`.

O site lê a lista por `site_imprensa_publico()`, com a chave anon, depois de
desenhar a página. Se o banco não responder (ou a 23.0 ainda não tiver sido
aplicada), ficam os blocos `PRESS_VIDEOS` e `PRESS_ARTICLES` do `index.html` —
que agora são só a **reserva**. A página *A NeuroDynamics* do site do processo
seletivo lê a mesma lista: acabou o "ao acrescentar um, atualize os dois".

O que está abaixo continua valendo para os campos — a diferença é onde se
preenche.

### O carrossel

O carrossel toca um clipe
por vez, começa **mudo** (única forma de autoplay que os navegadores
permitem), passa sozinho para o próximo quando o vídeo acaba e volta ao
primeiro no fim da lista. Ele pausa quando sai da tela — para não gastar
banda de quem não está olhando — e não toca sozinho para quem usa
`prefers-reduced-motion`; nesse caso aparece um botão de play. O botão de
som liga o áudio (a partir daí ele continua ligado nos próximos clipes),
e as setas e a régua de baixo escolhem o clipe na mão.

A lista fica no topo do `<script>` de `index.html`, no mesmo lugar de
`PARTNERS`, e a ordem dela é a ordem do carrossel.

O `title` é opcional: **sem ele, o veículo vira o rótulo do clipe** e o ano
fica na linha de baixo — que é como as reportagens de TV estão hoje ("Jornal
Nacional · 2026"). Quando o clipe é nosso ou tem nome próprio, aí sim vale
preencher o `title` e deixar o veículo no `outlet`.

### Hospedagem: YouTube

Ficou decidido que os vídeos ficam no **YouTube** — sem custo, sem limite de
banda, com qualidade adaptativa, e é o caminho que não depende de nós
mantermos servidor de mídia no ar. Cada item da lista é assim:

```js
{ title:'Reportagem sobre a Calima',   // aparece no site
  outlet:'TV UFMG', date:'2025',       // opcionais
  youtube:'dQw4w9WgXcQ',               // só o id, não a URL inteira
  href:'https://ufmg.br/...' }         // opcional: vira o botão "Source"
```

Para achar o id, abra o vídeo no YouTube e pegue o que vem depois de
`watch?v=` (ou depois de `youtu.be/`), jogando fora tudo a partir do `&`:

```
https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s   ->  dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ                        ->  dQw4w9WgXcQ
```

Ao subir cada vídeo, duas coisas importam:

- **Visibilidade "não listado" funciona** — o vídeo não aparece na busca do
  YouTube, mas embute normalmente no site. Visibilidade "privado" **não**
  embute; o player mostra erro e o carrossel pula o clipe.
- **Deixe a incorporação permitida** (é o padrão). Em *Conteúdo → Editar →
  Mostrar mais → Licença*, a opção "Permitir incorporação" precisa estar
  marcada, senão o vídeo só toca dentro do YouTube.

O player usa `youtube-nocookie.com`, carrega a API do YouTube só quando
existe algum vídeo na lista, monta **um único** player para o carrossel
inteiro (trocar de clipe não remonta o iframe) e pula sozinho o clipe que
não carregar. A ordem da lista é a ordem do carrossel.

Se um dia algum vídeo tiver de ser hospedado por nós — corte bruto, algo que
não pode ir para o YouTube — o mesmo carrossel aceita arquivo direto no
lugar do `youtube:`, e os dois tipos convivem na mesma lista:

```js
{ title:'…', outlet:'…', date:'2024',
  src:'https://media.neurodynamics.dev/press/clip.mp4',
  poster:'https://media.neurodynamics.dev/press/clip.jpg' }
```

Nesse caso o arquivo **não** vai neste repositório (incha o histórico do git
para sempre, e o GitHub Pages não serve Git LFS — entrega o ponteiro, não o
vídeo). As opções são **Cloudflare R2** com domínio próprio, tipo
`media.neurodynamics.dev` — 10 GB grátis, egress zero, e o DNS já está no
Cloudflare — ou o **Supabase Storage** em bucket público, mais rápido de
montar porque o projeto já existe, mas com 1 GB de arquivos e 5 GB de
tráfego por mês no plano free. Prepare o MP4 com H.264 + AAC e
`+faststart`, que é o que deixa o vídeo começar antes de baixar inteiro:

```sh
ffmpeg -i original.mov -vf "scale='min(1280,iw)':-2" \
       -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k \
       -movflags +faststart tv-ufmg-2025.mp4

ffmpeg -i tv-ufmg-2025.mp4 -ss 2 -frames:v 1 tv-ufmg-2025.jpg   # poster
```

720p é suficiente para o tamanho em que o vídeo aparece na página, e vale
cortar a reportagem no trecho que interessa — quem entra na página não vai
ver oito minutos de telejornal. Isso vale para o YouTube também.

### As matérias escritas

Embaixo do carrossel, sob o rótulo *Also written about*, entram os cartões
de `PRESS_ARTICLES` — um por matéria publicada em texto:

```js
{ title:'Tecnologia desenvolvida pela UFMG leva atleta paraplégico…',
  outlet:'Globo Esporte', date:'2024',
  href:'https://ge.globo.com/mg/noticia/2024/10/21/…' }
```

O título vai **na língua em que a matéria foi publicada** — é o título dela,
não texto nosso; por isso os que estão lá hoje estão em português, no meio
de uma página em inglês. O cartão inteiro é o link, que abre em outra aba.

### Direitos

Uma reportagem é obra do veículo que a produziu. Se o próprio veículo já
publicou a matéria no canal dele, o caminho limpo é apontar o `youtube:`
para **esse** vídeo, com o `href:` levando à matéria — assim ninguém
republica nada. Subir a reportagem em canal nosso é republicação, e essa
pede autorização do veículo.

## Como publicar

Este repositório é o do site: o GitHub Pages publica a branch `main` a
partir da raiz, e o `CNAME` fixa o domínio `neurodynamics.dev`. No
Cloudflare, o apex e o `www` apontam para o GitHub Pages (CNAME para
`neurodynamics-dev.github.io`, achatado pelo Cloudflare, ou os registros
`A`/`AAAA` do Pages).

## Segurança

O site usa apenas a chave `anon` do Supabase e lê o banco exclusivamente
pelas funções `security definer` (`site_projetos_publico` e
`site_projeto_publico`), que devolvem só o que está publicado. As tabelas
`site_projetos`, `site_projeto_numeros` e `site_projeto_saidas` não têm
política para `anon`; a escrita exige login no SOMA e papel `admin` ou
`pessoal` (ou ser supervisor do projeto vinculado, só em rascunho). A regra
mora no banco, não na interface. Os textos vindos do banco entram na página
sempre escapados; links só `https://`.
