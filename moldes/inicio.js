/* Homepage. */
var c = require('./comum');

/* A galeria pregada identifica cada peça pelo data-peca: a coreografia
   no galeria.js e as posições no styles.css são feitas para estas oito
   fotos e dois textos, por esta ordem. */
var PECAS = ['turma', 'peso-morto', 'discos-azafit', 'disco-10',
             'sala-cardio', 'cross-academy', 'sala-fitness', 'estudio'];

/* As três fotos do bloco "Sobre": a primeira é a alta. */
var FOTOS_SOBRE = [
  'about__photo about__photo--tall',
  'about__photo',
  'about__photo'
];

module.exports = {
  saida: 'index.html',
  pagina: '/',
  gerar: function (d) {
    var p = d.paginas.inicio;
    var camp = d.campanha;

    var campanha = camp.ativa ? `
<!-- Campanha: só existe com campanha.ativa -->
<section class="campaign">
  <p class="campaign__eyebrow">${c.esc(camp.faixa.eyebrow)}</p>
  <h2 class="campaign__title">${c.marcas(camp.faixa.titulo)}</h2>
  ${c.botao(camp.faixa.botao, 'dark', d)}
</section>
` : '';

    var tiles = d.modalidades.modalidades.map(function (m) {
      return `  <a class="modality modality--${m.id}" href="/modalidades.html#${m.id}">
    <div class="modality__photo"><img src="${c.src(m.tile)}" alt="" decoding="async"></div>
    <div class="modality__scrim"></div>
    <p class="modality__title">${c.esc(m.nome)}</p>
  </a>`;
    }).join('\n');

    var fotosSobre = p.sobre.fotos.map(function (f, i) {
      return `    <div class="${FOTOS_SOBRE[i]}">
      <div class="about__photo-img reveal"><img src="${c.src(f)}" alt="" decoding="async"></div>
    </div>`;
    }).join('\n');

    var galeria = p.galeria.fotos.map(function (f, i) {
      return `    <figure class="galeria__peca" data-peca="${PECAS[i]}">
      <img src="${c.src(f.ficheiro)}" alt="${c.esc(f.alt)}">
    </figure>`;
    }).join('\n');

    var t1 = p.galeria.textos[0];
    var t2 = p.galeria.textos[1];

    var planos = d.planos.planos.map(function (pl) { return plano(pl, d); }).join('\n\n');

    var corpo = `
<!-- Tela de entrada: preta com o logo grande, que depois viaja para o nav -->
<div class="intro" id="intro" aria-hidden="true">
  <span class="intro__logo" id="intro-logo">PT<span class="nav__logo-dot">·</span>ACADEMY</span>
</div>

${c.nav('/', d)}

<!-- Hero -->
<header class="hero">
  <div class="hero__photo"><img src="${c.src(p.hero.foto)}" alt="" fetchpriority="high"></div>
  <div class="hero__scrim"></div>

  <div class="hero__content">
    <p class="hero__eyebrow">${c.esc(p.hero.eyebrow)}</p>
    <h1 class="hero__title">${c.marcas(p.hero.titulo)}</h1>
    ${c.botao(p.hero.botao, 'red', d)}
  </div>
</header>
${campanha}
<!-- About ("Sobre nós") -->
<section class="about">
  <div class="about__text" data-reveal-group>
    <p class="about__eyebrow reveal reveal--slide">${c.esc(p.sobre.eyebrow)}</p>
    <h2 class="about__title reveal reveal--slide">${c.marcas(p.sobre.titulo)}</h2>
    <p class="about__body reveal reveal--slide">${c.esc(p.sobre.texto)}</p>
    <div class="about__actions reveal reveal--slide">
      ${c.botoes(p.sobre.botoes, d, '      ')}
    </div>
  </div>
  <div class="about__gallery" data-reveal-group>
${fotosSobre}
  </div>
</section>

<!-- Modalities: cada tile abre o capítulo dessa modalidade na página
     das modalidades. -->
<section class="modalities" id="modalidades">
${tiles}
</section>

<!-- Galeria pregada ("Instalações") -->
<section class="galeria" id="instalacoes">
  <div class="galeria__palco">
   <div class="galeria__mosaico">

${galeria}

    <div class="galeria__peca galeria__peca--texto" data-peca="texto-1">
      <h2 class="galeria__titulo">${c.marcas(t1.titulo)}</h2>
      <p class="galeria__corpo margin-bottom">${c.esc(t1.texto)}</p>
    </div>

    <div class="galeria__peca galeria__peca--texto galeria__peca--cta" data-peca="texto-2">
      <h2 class="galeria__titulo">${c.marcas(t2.titulo)}</h2>
      <p class="galeria__corpo">${c.esc(t2.texto)}</p>
    </div>

   </div>
  </div>
</section>

<!-- Planos -->
<section class="plans" id="planos">
  <div class="plans__head" data-reveal-group>
    <p class="plans__eyebrow reveal reveal--slide">${c.esc(d.planos.eyebrow)}</p>
    <h2 class="plans__title reveal reveal--slide">${c.marcas(d.planos.titulo)}</h2>
    <p class="plans__lead reveal reveal--slide">${c.esc(d.planos.lead)}</p>
  </div>

  <div class="plans__grid" data-reveal-group>
${planos}
  </div>
</section>

${c.fecho(p.fecho, d)}
`;

    return `${c.cabeca({ seo: p.seo }, d)}
<body>
${corpo}
${c.fim('/', corpo, ['intro.js', 'reveal.js', 'galeria.js'], d)}
</body>
</html>
`;
  }
};

/* Um cartão de plano. Também serve a secção 'planos' da campanha. */
function plano(pl, d) {
  var destaque = !!pl.destaque;
  return `  <article class="plan${destaque ? ' plan--featured' : ''} reveal reveal--rise">
${destaque ? `    <p class="plan__flag">${c.esc(pl.destaque)}</p>\n` : ''}    <p class="plan__name">${c.esc(pl.nome)}</p>
    <p class="plan__price"><span class="plan__currency">€</span>${c.esc(pl.preco)}<span class="plan__period">${c.esc(pl.periodo)}</span></p>
${pl.pitch ? `    <p class="plan__pitch">${c.esc(pl.pitch)}</p>\n` : ''}    <ul class="plan__features">
${pl.inclui.map(function (i) { return `      <li>${c.esc(i)}</li>`; }).join('\n')}
    </ul>
    ${c.botao(pl.botao, destaque ? 'red' : 'outline', d, 'plan__cta')}
  </article>`;
}

module.exports.plano = plano;
