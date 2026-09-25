/* Página da campanha: /<endereco>, só existe com campanha.ativa.

   O cliente monta-a no gestor com secções de um catálogo fixo (esquema em
   conteudo/esquemas/campanha.json). Cada tipo tem aqui a sua função; a
   página é a abertura, o meio pela ordem do conteúdo, e o fecho. O
   aspeto está todo no campanha.css e no styles.css. */
var c = require('./comum');
var plano = require('./inicio').plano;

function cabeca(s) {
  return `    <p class="eyebrow reveal reveal--slide">${c.esc(s.eyebrow)}</p>
    <h2 class="seccao__titulo reveal reveal--slide">${c.marcas(s.titulo)}</h2>`;
}

function paragrafos(lista) {
  return lista.map(function (t) {
    return `    <p class="seccao__corpo reveal reveal--slide">${c.esc(t)}</p>`;
  }).join('\n');
}

function acao(s, d) {
  return s.botao
    ? `\n    <div class="seccao__acoes reveal reveal--slide">${c.botao(s.botao, 'red', d)}</div>`
    : '';
}

var SECCOES = {

  abertura: function (s, d) {
    return `<!-- Abertura -->
<header class="hero hero--campanha">
  <div class="hero__photo"><img src="${c.src(s.foto.ficheiro)}" alt="${c.esc(s.foto.alt)}" fetchpriority="high"></div>
  <div class="hero__scrim"></div>

  <div class="hero__content">
    <p class="hero__eyebrow">${c.esc(s.eyebrow)}</p>
    <h1 class="hero__title">${c.marcas(s.titulo)}</h1>
${s.lead ? `    <p class="hero__lead">${c.esc(s.lead)}</p>\n` : ''}    ${c.botao(s.botao, 'red', d)}
  </div>
</header>`;
  },

  texto: function (s, d) {
    return `<section class="seccao">
  <div class="seccao__texto" data-reveal-group>
${cabeca(s)}
${paragrafos(s.paragrafos)}${acao(s, d)}
  </div>
</section>`;
  },

  'texto-foto': function (s, d) {
    return `<section class="seccao seccao--foto seccao--foto-${s.lado}">
  <div class="seccao__texto" data-reveal-group>
${cabeca(s)}
${paragrafos(s.paragrafos)}${acao(s, d)}
  </div>
  <figure class="seccao__foto">
    <div class="seccao__foto-camada reveal"><img src="${c.src(s.foto.ficheiro)}" alt="${c.esc(s.foto.alt)}" loading="lazy" decoding="async"></div>
  </figure>
</section>`;
  },

  lista: function (s) {
    return `<section class="seccao">
  <div class="seccao__texto" data-reveal-group>
${cabeca(s)}
  </div>
  <ul class="seccao__lista" data-reveal-group>
${s.pontos.map(function (t) { return `    <li class="reveal reveal--slide">${c.esc(t)}</li>`; }).join('\n')}
  </ul>
</section>`;
  },

  passos: function (s) {
    return `<section class="seccao">
  <div class="seccao__texto" data-reveal-group>
${cabeca(s)}
  </div>
  <ol class="passos passos--${s.passos.length}" data-reveal-group>
${s.passos.map(function (p, i) {
  return `    <li class="passo reveal reveal--rise">
      <p class="passo__numero">${c.dois(i + 1)}</p>
      <h3 class="passo__nome">${c.esc(p.nome)}</h3>
      <p class="passo__texto">${c.esc(p.texto)}</p>
    </li>`;
}).join('\n')}
  </ol>
</section>`;
  },

  numeros: function (s) {
    return `<section class="contagem contagem--${s.numeros.length}" data-reveal-group>
${s.numeros.map(function (n) {
  return `  <div class="contagem__item reveal reveal--rise">
    <p class="contagem__valor">${c.esc(n.valor)}</p>
    <p class="contagem__legenda">${c.esc(n.legenda)}</p>
  </div>`;
}).join('\n')}
</section>`;
  },

  planos: function (s, d) {
    var escolhidos = s.planos.map(function (nome) {
      return d.planos.planos.filter(function (p) { return p.nome === nome; })[0];
    });
    return `<section class="plans">
  <div class="plans__head" data-reveal-group>
    <p class="plans__eyebrow reveal reveal--slide">${c.esc(s.eyebrow)}</p>
    <h2 class="plans__title reveal reveal--slide">${c.marcas(s.titulo)}</h2>
${s.lead ? `    <p class="plans__lead reveal reveal--slide">${c.esc(s.lead)}</p>\n` : ''}  </div>

  <div class="plans__grid" data-reveal-group>
${escolhidos.map(function (p) { return plano(p, d); }).join('\n\n')}
  </div>
</section>`;
  },

  fotos: function (s) {
    return `<section class="fotos fotos--${s.fotos.length}" data-reveal-group>
${s.fotos.map(function (f) {
  return `  <figure class="fotos__peca">
    <div class="fotos__camada reveal"><img src="${c.src(f.ficheiro)}" alt="${c.esc(f.alt)}" loading="lazy" decoding="async"></div>
  </figure>`;
}).join('\n')}
</section>`;
  },

  /* <details> nativo: abre e fecha sem JS e o teclado já funciona. */
  perguntas: function (s) {
    return `<section class="seccao">
  <div class="seccao__texto" data-reveal-group>
${s.eyebrow ? `    <p class="eyebrow reveal reveal--slide">${c.esc(s.eyebrow)}</p>\n` : ''}    <h2 class="seccao__titulo reveal reveal--slide">${c.marcas(s.titulo)}</h2>
  </div>
  <div class="perguntas" data-reveal-group>
${s.perguntas.map(function (p) {
  return `    <details class="pergunta reveal reveal--slide">
      <summary class="pergunta__pergunta">${c.esc(p.pergunta)}<span class="pergunta__sinal" aria-hidden="true"></span></summary>
      <p class="pergunta__resposta">${c.esc(p.resposta)}</p>
    </details>`;
}).join('\n')}
  </div>
</section>`;
  },

  condicoes: function (s) {
    return `<section class="condicoes">
  <h2 class="condicoes__titulo">${c.esc(s.titulo)}</h2>
${s.paragrafos.map(function (t) { return `  <p class="condicoes__texto">${c.esc(t)}</p>`; }).join('\n')}
</section>`;
  },

  fecho: function (s, d) {
    return c.fecho(s, d);
  }
};

module.exports = {
  saida: function (d) { return d.campanha.endereco + '.html'; },
  pagina: function (d) { return c.enderecoCampanha(d); },
  SECCOES: SECCOES,
  gerar: function (d) {
    var pg = d.campanha.pagina;
    var pagina = c.enderecoCampanha(d);

    var corpo = `
${c.nav(pagina, d)}

${pg.seccoes.map(function (s) { return SECCOES[s.tipo](s, d); }).join('\n\n')}
`;

    return `${c.cabeca({ seo: pg.seo, css: ['campanha.css'] }, d)}
<body>
${corpo}
${c.fim(pagina, corpo, ['reveal.js'], d)}
</body>
</html>
`;
  }
};
