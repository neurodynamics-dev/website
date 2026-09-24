# Site institucional — neurodynamics.dev

Site principal da NeuroDynamics em **três idiomas** (inglês, português e
francês, com seletor no cabeçalho): home, **Quem somos**, **Projetos** e
**Contato**. Apresenta a equipe como uma **organização sem fins lucrativos**
de pesquisa e desenvolvimento em health-tech, nascida na Escola de Engenharia
da UFMG e sediada no LABBIO. Arquivo único (`index.html`), no mesmo padrão dos
demais apps do SOMA, com a base visual do site do processo seletivo (paleta,
vidro, fundo animado) em versão mais sóbria.

## Conteúdo

| Arquivo        | O que é |
|----------------|---------|
| `index.html`   | O site (rotas por hash: `#/`, `#/about`, `#/projects`, `#/contact`) |
| `admin.html`   | Painel para editar os projetos exibidos no site |
| `assets/`      | Logos locais usadas no letreiro de parceiros |
| `CNAME`        | Domínio do GitHub Pages (`neurodynamics.dev`) |

## Pré-requisitos

Aplicar as migrações **`soma_v9.sql`** (tabela dos projetos) e
**`soma_v13.sql`** (colunas de tradução) no SQL Editor do Supabase. As duas
moram no repositório do SOMA (`neurodynamics-dev/nro-pessoal`), junto das
demais migrações. Sem elas o site continua no ar com o conteúdo de reserva
(bloco `FALLBACK_PROJECTS` no topo do `<script>`), mas a edição pelo painel
fica indisponível.

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
- **Textos dos projetos:** no banco, em colunas por idioma — o inglês nas
  colunas originais (`tagline`, `resumo`, `descricao`) e as traduções com
  sufixo (`_pt`, `_fr`). O que ficar vazio em PT/FR cai no inglês.
- **Status e tags:** guardados uma única vez, em inglês, e traduzidos pelo
  site por dicionário (`status` e `tags` dentro de cada idioma no bloco `L`).
  Ao criar um status ou tag novo, acrescente a tradução lá.
- **Números por extenso:** o título "Cinco frentes, uma direção" conta os
  projetos publicados; a lista `nums` de cada idioma tem as formas usadas
  (em português, no feminino: "uma", "duas"…).
- **Números das seções:** contados na hora de desenhar a página, então
  acrescentar ou remover uma seção (a de imprensa, por exemplo) nunca deixa
  buraco na numeração.
- **Títulos de vídeos e matérias** ficam na língua em que foram publicados,
  como deve ser: são nomes próprios, não texto nosso.

## Como editar

- **Projetos (Calima, Opalina, Órion, Deriva, Nebula…):** em
  `https://<domínio>/admin.html`, com conta do SOMA de papel `admin` ou
  `pessoal`. Nome, tagline, resumo, descrição, status, tags, ordem, imagem
  e publicação. Os campos de texto têm **abas EN / PT / FR**; o que ficar
  vazio em português ou francês cai no texto em inglês.
  Enquanto `imagem_url` estiver vazia o site mostra o placeholder técnico;
  ao subir as imagens definitivas, basta colar a URL.
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
pela função `security definer` da migração (`site_projetos_publico`), que
devolve só projetos publicados. A tabela `site_projetos` não tem política
para `anon`; a escrita exige login (contas do SOMA) e papel `admin` ou
`pessoal` — o `admin.html` é só interface, a regra mora no banco.
