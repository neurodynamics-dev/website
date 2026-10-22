// Baixa as fotos das páginas principais do Unsplash, já recortadas na
// proporção de cada quadro: assets/fotos/<chave>.jpg (1600 px de largura) e
// <chave>-800.jpg. Escreve também assets/fotos/CREDITOS.md.
//
//   node scripts/fotos.mjs              todas
//   node scripts/fotos.mjs proposito    só as indicadas
//
// Sem dependência: só o fetch do Node (18 ou mais novo). Precisa de rede para
// unsplash.com e images.unsplash.com.
//
// Cada foto é escolhida pelo id do Unsplash, o fim do endereço da página dela
// (unsplash.com/photos/<descrição>-<id>). O script pede o arquivo pelo link
// de download da página (é assim que o Unsplash conta o download para quem
// fotografou), lê o endereço da imagem para onde ele aponta e pede o recorte
// ao próprio servidor de imagens do Unsplash (w, ar, fit=crop, crop, q).
//
// Licença Unsplash: uso livre, inclusive comercial, sem pedir permissão; o
// crédito é cortesia e fica no CREDITOS.md. Só servem as fotos marcadas como
// gratuitas: as do Unsplash+ (com cadeado) têm outra licença.
//
// Para trocar uma foto: troque o id (e o autor) aqui, rode o script e confira
// o recorte no site. "crop" escolhe o que fica quando a proporção corta a
// foto: entropy (o trecho com mais detalhe, o padrão), faces, center, top,
// bottom, left, right, ou focalpoint com fpx/fpy entre 0 e 1.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pasta = path.join(raiz, 'assets', 'fotos');

/* as chaves são as do index.html (foto('<chave>', ...)); ar é a proporção do quadro */
const FOTOS = {
  'construir-software': { id:'n3ba57RKVNs', ar:'4:5',  autor:'Jakub Żerdzicki',   tema:'código na tela' },
  'construir-firmware': { id:'8hcIIZ8SoyU', ar:'4:5',  autor:'Ludovico Ceroseis', tema:'placa de circuito de perto' },
  'construir-ia':       { id:'Wl3hAbxMF80', ar:'4:5',  autor:'Vitaly Gariev',     tema:'ressonância do cérebro num tablet' },
  'construir-sinais':   { id:'ZSo4axN3ZXI', ar:'4:5',  autor:'Joshua Chehov',     tema:'traçado de ECG na tela' },
  'construir-hardware': { id:'NEoDZ8jCedQ', ar:'4:5',  autor:'',                  tema:'bancada com impressora 3D' },
  'proposito':          { id:'S50MwpIaKoQ', ar:'4:3',  autor:'Annie Spratt',      tema:'quarto de hospital com monitor' },
  'quem-somos':         { id:'9XJIClfKyAc', ar:'21:9', autor:'Jakub Żerdzicki',   tema:'protótipo saindo da impressora 3D' },
  'como-ponta':         { id:'bTPDkYQ9-xk', ar:'4:3',  autor:'Kenneth Li',        tema:'impressora 3D em ação' },
  'como-pesquisa':      { id:'X_tBkG0U9yM', ar:'4:3',  autor:'Vitaly Gariev',     tema:'médico mostra exame ao paciente' },
  'como-membros':       { id:'rgKX4o2xSqI', ar:'4:3',  autor:'Vitaly Gariev',     tema:'equipe no quadro branco' },
  'como-ritmo':         { id:'OBOoohXBrD8', ar:'4:3',  autor:'Akinyemi Gbadamosi', tema:'quadro de tarefas' },
  'contato':            { id:'eNC3PChXTmk', ar:'4:5',  autor:'Luiz Felipe S. C.', tema:'Pampulha, Belo Horizonte, de cima' }
};
const LARGURAS = [[1600, ''], [800, '-800']];

const nomes = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(FOTOS);
fs.mkdirSync(pasta, { recursive: true });

async function enderecoDaImagem(id){
  const r = await fetch(`https://unsplash.com/photos/${id}/download?force=true`, { redirect: 'manual' });
  const destino = r.headers.get('location');
  if (!destino || !/^https:\/\/images\.unsplash\.com\//.test(destino))
    throw new Error(`o download não levou a images.unsplash.com (HTTP ${r.status}); a foto é gratuita?`);
  return destino.split('?')[0];
}

let falhas = 0;
for (const chave of nomes){
  const f = FOTOS[chave];
  if (!f){ console.log(`FALHA ${chave}: não está na lista`); falhas++; continue; }
  try{
    const base = await enderecoDaImagem(f.id);
    for (const [w, suf] of LARGURAS){
      const q = new URLSearchParams({ w:String(w), ar:f.ar, fit:'crop', crop:f.crop || 'entropy', q:'72', fm:'jpg' });
      if (f.fpx != null) q.set('fp-x', String(f.fpx));
      if (f.fpy != null) q.set('fp-y', String(f.fpy));
      const r = await fetch(`${base}?${q}`);
      if (!r.ok) throw new Error(`HTTP ${r.status} ao baixar ${w} px`);
      fs.writeFileSync(path.join(pasta, `${chave}${suf}.jpg`), Buffer.from(await r.arrayBuffer()));
    }
    const kb = Math.round(fs.statSync(path.join(pasta, chave + '.jpg')).size / 1024);
    console.log(`  ok  ${chave} (${kb} KB)`);
  }catch(e){ console.log(`FALHA ${chave}: ${e.message}`); falhas++; }
}

/* os créditos só quando tudo baixou: a lista tem de bater com os arquivos */
if (falhas) process.exit(1);
const linhas = Object.entries(FOTOS).map(([k, f]) =>
  `| \`${k}\` | ${f.tema} | ${f.autor || '(ver a página)'} | https://unsplash.com/photos/${f.id} |`);
fs.writeFileSync(path.join(pasta, 'CREDITOS.md'), `# Fotos do site

Do [Unsplash](https://unsplash.com), pela licença Unsplash (uso livre, sem
pedir permissão; o crédito é cortesia). Geradas por \`scripts/fotos.mjs\`;
para trocar uma, troque o id lá e rode de novo.

| Quadro | O que mostra | Foto de | Página |
|---|---|---|---|
${linhas.join('\n')}
`);
