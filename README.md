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
- **Vídeos de imprensa (aba *Who we are*):** bloco `PRESS_VIDEOS` no topo do
  `<script>` de `index.html`. Ver [Vídeos de imprensa](#vídeos-de-imprensa)
  abaixo — inclusive onde hospedar os arquivos.
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

## Vídeos de imprensa

A seção **In the press**, na aba *Who we are*, é um carrossel: toca um clipe
por vez, começa **mudo** (única forma de autoplay que os navegadores
permitem), passa sozinho para o próximo quando o vídeo acaba e volta ao
primeiro no fim da lista. Ele pausa quando sai da tela — para não gastar
banda de quem não está olhando — e não toca sozinho para quem usa
`prefers-reduced-motion`; nesse caso aparece um botão de play. O botão de
som liga o áudio (a partir daí ele continua ligado nos próximos clipes),
e as setas e a régua de baixo escolhem o clipe na mão.

Tudo sai da lista `PRESS_VIDEOS`, no topo do `<script>` de `index.html`,
no mesmo lugar de `PARTNERS`. **Enquanto a lista estiver vazia, a seção
inteira não aparece no site** — nada de "em breve" no ar.

Cada item é um arquivo que nós mesmos hospedamos…

```js
{ title:'Reportagem sobre a Calima',      // aparece no site
  outlet:'TV UFMG', date:'2025',          // opcionais
  src:'https://media.neurodynamics.dev/press/tv-ufmg-2025.mp4',
  poster:'https://media.neurodynamics.dev/press/tv-ufmg-2025.jpg',
  href:'https://ufmg.br/...' }            // opcional: vira o botão "Source"
```

…ou um vídeo que já está no YouTube (o id é o que vem depois de `watch?v=`
ou de `youtu.be/`):

```js
{ title:'…', outlet:'…', date:'2024', youtube:'dQw4w9WgXcQ' }
```

Os dois tipos podem conviver na mesma lista. A ordem da lista é a ordem do
carrossel. Um clipe que não carregar é pulado automaticamente.

### Onde hospedar

O repositório **não** é lugar para os vídeos: incha o histórico do git para
sempre e o GitHub Pages não serve arquivos em Git LFS (entrega o ponteiro,
não o vídeo). As opções que fazem sentido:

| Opção | Limite prático | Quando faz sentido |
|-------|----------------|--------------------|
| **Cloudflare R2** + domínio próprio (ex.: `media.neurodynamics.dev`) | 10 GB grátis, **egress zero** | Melhor opção para hospedar por conta própria: o DNS já está no Cloudflare, é só criar o bucket, ligar o domínio customizado e subir os arquivos. Não tem conta de banda para tomar susto. |
| **Supabase Storage**, bucket público | 1 GB de arquivos e 5 GB de tráfego/mês no plano free | O caminho mais rápido — o projeto já existe. Mas um clipe de 30 MB dá ~170 exibições por mês antes de estourar a cota; serve para começar, não para um site que bombou. |
| **YouTube** (nosso, ou o do próprio veículo) | sem limite, sem custo | Para reportagem de TV que **não é nossa**, é o caminho mais seguro: embute o vídeo que o veículo já publicou. O player do site já entende `youtube:`. Traz a marca e o player do YouTube junto. |

**Recomendação:** vídeo nosso (institucional, bruto, bastidor) no **R2**, com
`media.neurodynamics.dev` apontando para o bucket; reportagem de TV que já
está no ar no canal do veículo, **embutida do YouTube** pelo campo
`youtube:`. Se quiser ver a seção no ar hoje mesmo sem montar nada, o
Supabase Storage resolve — e a migração depois é só trocar as URLs em
`PRESS_VIDEOS`.

### Preparando os arquivos

MP4 com H.264 + AAC toca em qualquer navegador. O `+faststart` é o que
deixa o vídeo começar antes de baixar inteiro — sem ele o autoplay demora:

```sh
ffmpeg -i original.mov -vf "scale='min(1280,iw)':-2" \
       -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k \
       -movflags +faststart tv-ufmg-2025.mp4

ffmpeg -i tv-ufmg-2025.mp4 -ss 2 -frames:v 1 tv-ufmg-2025.jpg   # poster
```

720p é suficiente para o tamanho em que o vídeo aparece na página. Vale
manter cada clipe abaixo de ~30 MB e cortar a reportagem no trecho que
interessa — quem entra na página não vai ver oito minutos de telejornal.

### Direitos

Uma reportagem é obra do veículo que a produziu. Republicar o arquivo em
servidor nosso é o caminho que pede autorização; embutir o vídeo que o
próprio veículo publicou (campo `youtube:`, com o `href:` apontando para a
matéria) é o que não pede.

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
