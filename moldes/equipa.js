/* Equipa: grupos de cartões com vídeo. */
var c = require('./comum');

/* Os dois primeiros grupos estão acima da dobra: as fotos carregam logo.
   Daí para baixo, lazy. */
var GRUPOS_SEM_LAZY = 2;

function pessoa(pe, lazy) {
  var nome = c.esc(pe.nome);
  var video = pe.video
    ? `\n          <video class="pessoa__video" src="${c.src(pe.video)}" muted playsinline preload="none" disablepictureinpicture disableremoteplayback tabindex="-1" aria-hidden="true"></video>`
    : '';
  var foto = `<img class="pessoa__foto" src="${c.src(pe.foto)}" width="1200" height="1600" alt="${nome}"${lazy ? ' loading="lazy"' : ''} decoding="async">`;
  /* Sem vídeo, a moldura não é um botão: não há nada para ligar. */
  var media = pe.video
    ? `<button type="button" class="pessoa__media" aria-pressed="false" aria-label="Ver ${nome} em movimento">
          ${foto}${video}
        </button>`
    : `<div class="pessoa__media">
          ${foto}
        </div>`;
  return `      <li class="pessoa${pe.destaque ? ' pessoa--destaque' : ''} reveal reveal--rise">
        ${media}
        <div class="pessoa__legenda">
          <h3 class="pessoa__nome">${nome}</h3>
          <p class="pessoa__funcao">${c.esc(pe.funcao)}</p>
        </div>
      </li>`;
}

module.exports = {
  saida: 'equipa.html',
  pagina: '/equipa.html',
  gerar: function (d) {
    var p = d.paginas.equipa;
    var e = d.equipa;

    var grupos = e.grupos.map(function (g, i) {
      var n = g.pessoas.length;
      return `  <section class="grupo" aria-labelledby="grupo-${g.id}">
    <div class="grupo__cabeca">
      <h2 class="grupo__titulo" id="grupo-${g.id}">${c.esc(g.nome)}</h2>
      <p class="grupo__conta">${n} ${n === 1 ? 'pessoa' : 'pessoas'}</p>
    </div>
    <ul class="grupo__grelha" role="list" data-reveal-group>
${g.pessoas.map(function (pe) { return pessoa(pe, i >= GRUPOS_SEM_LAZY); }).join('\n')}
    </ul>
  </section>`;
    }).join('\n\n');

    var corpo = `
${c.nav('/equipa.html', d)}

<!-- Sem hero: o título sozinho dá entrada à página, por baixo do nav, e
     a seguir vêm os grupos de cartões 3:4, pela ordem do equipa.json.

     Cada cartão tem a foto e, por cima, um vídeo curto invisível. A
     moldura é um <button>: com rato é o hover que liga o vídeo (equipa.js),
     sem rato é o toque; o teclado usa Enter. O vídeo toca uma vez e a foto
     volta. Sem faixa de fecho nem CTA — a página acaba aqui e no rodapé. -->
<main class="equipa">

  <header class="equipa__cabeca">
    <h1 class="equipa__titulo">${c.marcas(e.titulo)}</h1>
  </header>

${grupos}

</main>
`;

    return `${c.cabeca({ seo: p.seo, css: ['equipa.css'] }, d)}
<body>
${corpo}
${c.fim('/equipa.html', corpo, ['reveal.js', 'equipa.js'], d)}
</body>
</html>
`;
  }
};
