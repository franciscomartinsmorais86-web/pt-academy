/* Sobre nós. */
var c = require('./comum');

/* O letreiro repete cada linha três vezes para a faixa nunca acabar. */
function linhaLetreiro(palavras, classe) {
  var texto = palavras.map(c.esc).join(' · ') + ' ·&nbsp;';
  return `  <p class="${classe}">
    <span>${texto}</span>
    <span>${texto}</span>
    <span>${texto}</span>
  </p>`;
}

module.exports = {
  saida: 'sobre.html',
  pagina: '/sobre.html',
  gerar: function (d) {
    var p = d.paginas.sobre;
    var h = p.historia;
    var FOTOS = ['foto foto--retrato foto--lenta', 'foto foto--paisagem foto--rapida'];

    var corpo = `
${c.nav('/sobre.html')}

<!-- Hero: a foto aproxima e o título sobe e apaga-se à saída -->
<header class="hero hero--sobre" data-scroll="saida">
  <figure class="foto foto--ecra">
    <div class="foto__camada">
      <img src="${c.src(p.hero.foto.ficheiro)}" alt="${c.esc(p.hero.foto.alt)}">
    </div>
  </figure>
  <div class="hero__scrim"></div>

  <div class="hero__content">
    <p class="hero__eyebrow">${c.esc(p.hero.eyebrow)}</p>
    <h1 class="hero__title">${c.marcas(p.hero.titulo)}</h1>
  </div>
</header>

<!-- Manifesto: pregado ao ecrã, acende palavra a palavra com o scroll -->
<section class="manifesto" data-scroll="pregado">
  <div class="manifesto__palco">
    <p class="eyebrow">${c.esc(p.manifesto.eyebrow)}</p>
    <p class="manifesto__texto" data-palavras>${c.marcas(p.manifesto.texto)}</p>
  </div>
</section>

<!-- História: texto com risca que cresce, fotos em paralaxe -->
<section class="historia" data-scroll="entrada">
  <div class="historia__texto" data-reveal-group>
    <p class="eyebrow reveal reveal--slide">${c.esc(h.eyebrow)}</p>
    <h2 class="historia__titulo reveal reveal--slide">${c.marcas(h.titulo)}</h2>
${h.paragrafos.map(function (t) { return `    <p class="historia__corpo reveal reveal--slide">${c.esc(t)}</p>`; }).join('\n')}
  </div>

  <div class="historia__fotos">
${h.fotos.map(function (f, i) {
  return `    <figure class="${FOTOS[i]}" data-scroll="atravessar">
      <div class="foto__camada">
        <img src="${c.src(f.ficheiro)}" alt="${c.esc(f.alt)}">
      </div>
    </figure>`;
}).join('\n')}
  </div>
</section>

<!-- Números: contam ao ritmo do scroll. O primeiro conta os anos desde
     a fundação (geral.json) no próprio browser; o segundo é quantas
     modalidades há. -->
<section class="numeros" data-scroll="entrada" aria-label="A PT Academy em números">
  <div class="numero">
    <p class="numero__valor"><span data-contar data-desde="${c.esc(d.geral.fundacao)}">${d.anos}</span></p>
    <p class="numero__legenda">${c.esc(p.numeros.anos)}</p>
  </div>
  <div class="numero">
    <p class="numero__valor"><span data-contar="${d.modalidades.modalidades.length}">${d.modalidades.modalidades.length}</span></p>
    <p class="numero__legenda">${c.esc(p.numeros.modalidades)}</p>
  </div>
</section>

<!-- Letreiro: as modalidades em contorno, a deslizar em sentidos opostos -->
<div class="letreiro" data-scroll="atravessar" aria-hidden="true">
${linhaLetreiro(d.modalidades.modalidades.map(function (m) { return m.nome; }), 'letreiro__linha')}
${linhaLetreiro(p.letreiro, 'letreiro__linha letreiro__linha--inversa')}
</div>

<!-- Valores -->
<section class="valores">
  <div class="valores__cabeca" data-reveal-group>
    <p class="eyebrow reveal reveal--slide">${c.esc(p.valores.eyebrow)}</p>
    <h2 class="valores__titulo reveal reveal--slide">${c.marcas(p.valores.titulo)}</h2>
  </div>

  <div class="valores__grelha" data-reveal-group>
${p.valores.lista.map(function (v, i) {
  return `    <article class="valor reveal reveal--rise">
      <p class="valor__numero">${c.dois(i + 1)}</p>
      <h3 class="valor__nome">${c.esc(v.nome)}</h3>
      <p class="valor__texto">${c.esc(v.texto)}</p>
    </article>`;
}).join('\n')}
  </div>
</section>

${c.fecho(p.fecho, d)}
`;

    return `${c.cabeca({ seo: p.seo, css: ['sobre.css'] }, d)}
<body>
${corpo}
${c.fim('/sobre.html', corpo, ['reveal.js', 'sobre.js'], d)}
</body>
</html>
`;
  }
};
