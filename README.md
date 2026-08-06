# Site institucional — neurodynamics.dev

Site principal da NeuroDynamics, em inglês: home, **Who we are**, **Projects**
e **Contact**. Apresenta a equipe como uma iniciativa de pesquisa e
desenvolvimento em health-tech, nascida na Escola de Engenharia da UFMG e
sediada no LABBIO. Arquivo único (`index.html`), no mesmo padrão dos demais
apps do SOMA, com a base visual do site do processo seletivo (paleta, vidro,
fundo animado) em versão mais sóbria.

## Conteúdo

| Arquivo        | O que é |
|----------------|---------|
| `index.html`   | O site (rotas por hash: `#/`, `#/about`, `#/projects`, `#/contact`) |
| `admin.html`   | Painel para editar os projetos exibidos no site |
| `assets/`      | Logos locais usadas no letreiro de parceiros |
| `CNAME`        | Domínio do GitHub Pages (`neurodynamics.dev`) |

## Pré-requisitos

Aplicar a migração **`soma_v9.sql`** (na raiz deste repositório) no SQL
Editor do Supabase. Sem ela o site continua no ar com o conteúdo de reserva
(bloco `FALLBACK_PROJECTS` no topo do `<script>`), mas a edição pelo painel
fica indisponível.

## Como editar

- **Projetos (Calima, Opalina, Órion, Deriva, Nebula…):** em
  `https://<domínio>/admin.html`, com conta do SOMA de papel `admin` ou
  `pessoal`. Nome, tagline, resumo, descrição, status, tags, ordem, imagem
  e publicação. Os textos vão ao ar em inglês — preencha já em inglês.
  Enquanto `imagem_url` estiver vazia o site mostra o placeholder técnico;
  ao subir as imagens definitivas, basta colar a URL.
- **Imprensa (aba *Who we are*):** blocos `PRESS_VIDEOS` (o carrossel) e
  `PRESS_ARTICLES` (as matérias escritas) no topo do `<script>` de
  `index.html`. Ver [Imprensa](#imprensa) abaixo.
- **Parceiros do letreiro:** bloco `PARTNERS` no topo do `<script>` de
  `index.html`. Itens com `img` usam o arquivo (coloque em `assets/`);
  sem `img`, o site desenha uma marca tipográfica monocromática — troque
  pela logo real quando o arquivo existir (UFMG e Escola de Engenharia
  estão tipográficas por enquanto).
- **E-mail de contato:** constante `CONTACT_EMAIL` no mesmo bloco.
  **Confirme que a caixa `contato@neurodynamics.dev` existe** (ou troque
  pelo endereço certo) antes de divulgar o site.
- **Textos das páginas:** funções `pageHome/pageAbout/pageProjects/pageContact`
  no `<script>` de `index.html`.

## Imprensa

A seção **In the press**, na aba *Who we are*, tem duas partes: o carrossel
de vídeos (`PRESS_VIDEOS`) e, embaixo dele, as matérias escritas em cartões
menores (`PRESS_ARTICLES`). Cada lista funciona sozinha — se uma estiver
vazia, só a outra aparece; vazias as duas, a seção inteira some da página.

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

O GitHub Pages atende **um domínio por repositório** — e este repositório
já usa `pessoal.neurodynamics.dev`. Duas opções (mesmo esquema do site do
processo seletivo):

1. **Repositório próprio (recomendado):** crie `neurodynamics-dev/nro-site`,
   copie o conteúdo desta pasta para a raiz, ative o Pages (branch `main`)
   e aponte o apex `neurodynamics.dev` → GitHub Pages no Cloudflare
   (registros `A`/`AAAA` do Pages, ou `CNAME` achatado para
   `neurodynamics-dev.github.io`).
2. **Cloudflare Pages:** aponte um projeto para este repositório com
   "build output directory" = `site/` e o domínio customizado
   `neurodynamics.dev`.

## Segurança

O site usa apenas a chave `anon` do Supabase e lê o banco exclusivamente
pela função `security definer` da migração (`site_projetos_publico`), que
devolve só projetos publicados. A tabela `site_projetos` não tem política
para `anon`; a escrita exige login (contas do SOMA) e papel `admin` ou
`pessoal` — o `admin.html` é só interface, a regra mora no banco.
