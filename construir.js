/* Build do site da PT Academy.

   Lê o conteúdo de conteudo/*.json, passa-o pelos moldes de moldes/ e
   escreve o site pronto em dist/, junto com o CSS, o JS e o assets/.
   Sem dependências: só o Node (18 ou mais recente).

     node construir.js

   É o comando de build da Cloudflare Pages (pasta de saída: dist).
   Se o conteúdo partir uma regra da estrutura (ver verificar()), o build
   pára com uma mensagem a dizer o quê e onde, e nada é publicado.

   O formato do conteúdo está em conteudo/LEIAME.md. */

var fs = require('fs');
var path = require('path');

var RAIZ = __dirname;
var CONTEUDO = path.join(RAIZ, 'conteudo');
var SAIDA = path.join(RAIZ, 'dist');

/* Páginas fixas. A da campanha só entra com campanha.ativa, e a 404
   entra sempre (a Cloudflare serve-a em qualquer endereço que não exista). */
var MOLDES = ['inicio', 'sobre', 'modalidades', 'instalacoes', 'equipa', 'contactos']
  .map(function (nome) { return require('./moldes/' + nome); });
var CAMPANHA = require('./moldes/campanha');
var ERRO = require('./moldes/erro404');

function paginas(d) {
  return MOLDES
    .concat(d.campanha.ativa ? [CAMPANHA] : [])
    .concat([ERRO]);
}

function saida(molde, d) {
  return typeof molde.saida === 'function' ? molde.saida(d) : molde.saida;
}

/* Ficheiros da raiz que não vão para o site. */
var FORA = ['construir.js', 'servidor.js'];

/* O que se copia do assets/: só media e dados que o browser pede. */
var MEDIA = /\.(webp|jpe?g|png|svg|mp4|webm|json|woff2?)$/i;

/* ---------- Ler ---------- */

function ler() {
  var d = {};
  fs.readdirSync(CONTEUDO).forEach(function (f) {
    if (!f.endsWith('.json')) return;
    var nome = f.slice(0, -5);
    try {
      /* Sem o BOM que alguns editores de Windows põem no início. */
      d[nome] = JSON.parse(fs.readFileSync(path.join(CONTEUDO, f), 'utf8').replace(/^﻿/, ''));
    } catch (erro) {
      throw new Error(`conteudo/${f} não é JSON válido: ${erro.message}`);
    }
  });
  return d;
}

/* ---------- Derivar ---------- */

/* Anos completos desde "AAAA", "AAAA-MM" ou "AAAA-MM-DD". O sobre.js faz
   a mesma conta no browser, para o número não envelhecer entre builds. */
function anosDesde(texto, hoje) {
  var p = texto.split('-').map(Number);
  var anos = hoje.getFullYear() - p[0];
  var mes = (p[1] || 1) - 1;
  var dia = p[2] || 1;
  if (hoje.getMonth() < mes || (hoje.getMonth() === mes && hoje.getDate() < dia)) anos--;
  return anos;
}

function derivar(d) {
  var hoje = new Date();
  d.ano = hoje.getFullYear();
  d.anos = anosDesde(d.geral.fundacao, hoje);
  d.tel = 'tel:+351' + d.contactos.telefone.replace(/\D/g, '');

  /* "07h — 22h", "09h — 13h · 15h — 19h", "Encerrado". */
  d.contactos.horario.forEach(function (h) {
    h.horas = h.intervalos.length
      ? h.intervalos.map(function (i) { return i[0] + ' — ' + i[1]; }).join(' · ')
      : 'Encerrado';
  });

  /* "segunda a sexta das 07h às 22h, sábado das 09h às 13h e das 15h às 19h" */
  d.aberturaFrase = d.contactos.horario
    .filter(function (h) { return h.intervalos.length; })
    .map(function (h) {
      return h.dias.toLowerCase() + ' ' + h.intervalos.map(function (i) {
        return 'das ' + i[0] + ' às ' + i[1];
      }).join(' e ');
    })
    .join(', ');
  return d;
}

/* ---------- Verificar ---------- */

/* O gestor valida o conteúdo contra os esquemas antes de publicar. Aqui
   ficam só as regras que partiriam a página se falhassem: contagens
   fixas, referências cruzadas e ficheiros em falta. */
function verificar(d) {
  var erros = [];
  function exige(condicao, mensagem) { if (!condicao) erros.push(mensagem); }
  function existe(ficheiro, onde) {
    exige(fs.existsSync(path.join(RAIZ, 'assets', ficheiro)),
      `${onde}: o ficheiro assets/${ficheiro} não existe.`);
  }
  function titulo(t, onde) {
    exige((String(t).match(/(^|[^*])\*[^*]+\*(?!\*)/g) || []).length <= 1,
      `${onde}: só pode haver uma palavra em *destaque* por título.`);
  }

  var p = d.paginas;
  var mod = d.modalidades.modalidades;

  exige(mod.length === 4, `modalidades.json: tem de haver exatamente 4 modalidades (há ${mod.length}).`);
  exige(new Set(mod.map(function (m) { return m.id; })).size === mod.length, 'modalidades.json: há ids repetidos.');
  mod.forEach(function (m) {
    existe(m.foto.ficheiro, `modalidades.json (${m.nome}, foto)`);
    existe(m.detalhe.ficheiro, `modalidades.json (${m.nome}, detalhe)`);
    existe(m.tile, `modalidades.json (${m.nome}, tile)`);
  });

  exige(p.inicio.galeria.fotos.length === 8, 'paginas.json: a galeria tem de ter exatamente 8 fotos.');
  exige(p.inicio.galeria.textos.length === 2, 'paginas.json: a galeria tem de ter exatamente 2 textos.');
  exige(p.inicio.sobre.fotos.length === 3, 'paginas.json: o bloco "Sobre" da homepage tem de ter exatamente 3 fotos.');
  exige(p.sobre.valores.lista.length === 3, 'paginas.json: os valores do Sobre têm de ser exatamente 3.');
  exige(p.sobre.historia.fotos.length === 2, 'paginas.json: a história do Sobre tem de ter exatamente 2 fotos.');
  p.inicio.galeria.fotos.forEach(function (f) { existe(f.ficheiro, 'paginas.json (galeria)'); });
  p.inicio.sobre.fotos.forEach(function (f) { existe(f, 'paginas.json (sobre da homepage)'); });
  p.sobre.historia.fotos.forEach(function (f) { existe(f.ficheiro, 'paginas.json (história)'); });
  existe(p.inicio.hero.foto, 'paginas.json (hero da homepage)');
  existe(p.sobre.hero.foto.ficheiro, 'paginas.json (hero do Sobre)');
  existe(p.modalidades.hero.foto, 'paginas.json (hero das Modalidades)');

  var abas = d.horario.abas.map(function (a) { return a.id; }).join(',');
  exige(abas === 'cross,grupo', `horario.json: as abas têm de ser "cross" e "grupo", por esta ordem (o modalidades.css está preso a elas). Há: ${abas}.`);
  var dias = d.horario.dias.map(function (x) { return x.id; });
  d.horario.abas.forEach(function (a) {
    a.aulas.forEach(function (aula) {
      exige(dias.indexOf(aula.dia) !== -1, `horario.json (${a.nome}): "${aula.nome}" tem um dia que não existe: "${aula.dia}".`);
      exige(/^\d{2}h\d{2}$/.test(aula.hora), `horario.json (${a.nome}): "${aula.nome}" tem uma hora mal escrita: "${aula.hora}" (tem de ser como 18h30).`);
    });
  });

  var planos = d.planos.planos;
  exige(planos.filter(function (x) { return x.destaque; }).length <= 1, 'planos.json: só um plano pode estar em destaque.');
  exige(new Set(planos.map(function (x) { return x.nome; })).size === planos.length, 'planos.json: há planos com o mesmo nome.');

  d.equipa.grupos.forEach(function (g) {
    g.pessoas.forEach(function (pe) {
      existe(pe.foto, `equipa.json (${pe.nome}, foto)`);
      if (pe.video) existe(pe.video, `equipa.json (${pe.nome}, vídeo)`);
    });
  });
  d.instalacoes.espacos.lista.forEach(function (e) {
    e.fotos.forEach(function (f) { existe(f, `instalacoes.json (${e.nome})`); });
  });

  var reservados = MOLDES.map(function (m) { return m.saida.replace(/\.html$/, ''); })
    .concat(['index', '404', 'assets', 'conteudo', 'functions', 'api', 'dist']);
  exige(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.campanha.endereco), 'campanha.json: o endereço só pode ter minúsculas, números e hífenes.');
  exige(reservados.indexOf(d.campanha.endereco) === -1, `campanha.json: o endereço "${d.campanha.endereco}" já pertence ao site.`);

  verificarCampanha(d, exige, existe, titulo);

  [
    [d.planos.titulo, 'planos.json (título)'],
    [d.equipa.titulo, 'equipa.json (título)'],
    [d.campanha.faixa.titulo, 'campanha.json (faixa)'],
    [p.inicio.hero.titulo, 'paginas.json (hero da homepage)'],
    [p.sobre.hero.titulo, 'paginas.json (hero do Sobre)'],
    [p.modalidades.hero.titulo, 'paginas.json (hero das Modalidades)'],
    [p.instalacoes.hero.titulo, 'paginas.json (hero das Instalações)'],
    [p.contactos.titulo, 'paginas.json (Contactos)']
  ].forEach(function (x) { titulo(x[0], x[1]); });

  if (erros.length) {
    throw new Error('O conteúdo tem problemas:\n  - ' + erros.join('\n  - '));
  }
}

/* A página da campanha: a ordem das secções, os tipos que existem, os
   planos e as fotos que referem. Com a campanha desligada, nenhum botão
   do site pode apontar para ela. */
function verificarCampanha(d, exige, existe, titulo) {
  var camp = d.campanha;
  var seccoes = camp.pagina.seccoes;
  var tipos = Object.keys(CAMPANHA.SECCOES);
  var nomes = d.planos.planos.map(function (p) { return p.nome; });

  exige(seccoes.length >= 2 && seccoes.length <= 8, `campanha.json: a página tem de ter entre 2 e 8 secções (há ${seccoes.length}).`);
  exige(seccoes.length && seccoes[0].tipo === 'abertura', 'campanha.json: a primeira secção da página tem de ser a abertura.');
  exige(seccoes.length && seccoes[seccoes.length - 1].tipo === 'fecho', 'campanha.json: a última secção da página tem de ser o fecho.');

  seccoes.forEach(function (s, i) {
    var onde = `campanha.json (secção ${i + 1}, ${s.tipo})`;
    exige(tipos.indexOf(s.tipo) !== -1, `${onde}: tipo de secção desconhecido.`);
    exige(s.tipo !== 'abertura' || i === 0, `${onde}: só pode haver uma abertura, no início.`);
    exige(s.tipo !== 'fecho' || i === seccoes.length - 1, `${onde}: só pode haver um fecho, no fim.`);
    if (s.titulo) titulo(s.titulo, onde);
    if (s.foto) existe(s.foto.ficheiro, onde);
    (s.fotos || []).forEach(function (f) { existe(f.ficheiro, onde); });
    (s.tipo === 'planos' ? s.planos : []).forEach(function (nome) {
      exige(nomes.indexOf(nome) !== -1, `${onde}: o plano "${nome}" não existe no planos.json.`);
    });
  });

  if (!camp.ativa) {
    var ficheiros = ['paginas', 'planos', 'modalidades'];
    ficheiros.forEach(function (f) {
      exige(JSON.stringify(d[f]).indexOf('"acao":"campanha"') === -1,
        `${f}.json: há um botão que leva à campanha, mas a campanha está desligada.`);
    });
  }
}

/* ---------- Escrever ---------- */

function copiar(origem, destino, filtro) {
  fs.mkdirSync(destino, { recursive: true });
  fs.readdirSync(origem, { withFileTypes: true }).forEach(function (e) {
    var de = path.join(origem, e.name);
    var para = path.join(destino, e.name);
    if (e.isDirectory()) copiar(de, para, filtro);
    else if (filtro(e.name)) fs.copyFileSync(de, para);
  });
}

function construir() {
  var inicio = Date.now();
  var d = derivar(ler());
  verificar(d);

  fs.rmSync(SAIDA, { recursive: true, force: true });
  fs.mkdirSync(SAIDA);

  var lista = paginas(d);
  lista.forEach(function (molde) {
    fs.writeFileSync(path.join(SAIDA, saida(molde, d)), molde.gerar(d));
  });

  fs.readdirSync(RAIZ).forEach(function (f) {
    if (/\.(css|js)$/.test(f) && FORA.indexOf(f) === -1) {
      fs.copyFileSync(path.join(RAIZ, f), path.join(SAIDA, f));
    }
  });
  copiar(path.join(RAIZ, 'assets'), path.join(SAIDA, 'assets'), function (nome) { return MEDIA.test(nome); });

  console.log(`Site gerado em dist/ (${lista.length} páginas, ${Date.now() - inicio} ms).`);
  console.log(lista.map(function (m) { return '  ' + saida(m, d); }).join('\n'));
}

try {
  construir();
} catch (erro) {
  console.error('\n' + erro.message + '\n');
  process.exit(1);
}
