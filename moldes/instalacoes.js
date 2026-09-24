/* Instalações: passeio virtual e quadro de espaços. */
var c = require('./comum');

/* A rua é a primeira coisa que se vê (fundo do hero e primeira cena do
   passeio), mas vive num background-image: sem isto o browser só a
   descobre depois de ler o CSS todo. */
var PRELOAD = `<!-- A rua é a primeira coisa que se vê (fundo do hero e primeira cena do
     passeio), mas vive num background-image: sem isto o browser só a
     descobre depois de ler o CSS todo. -->
<link rel="preload" as="image" href="/assets/walkthrough/rua.webp" fetchpriority="high">`;

function espaco(e, i) {
  var comFotos = e.fotos.length > 0;
  var fotos = comFotos
    ? ` data-fotos="${e.fotos.map(function (f) { return c.esc(c.src(f)); }).join('\n          ')}"`
    : '';
  return `    <li class="quadro__espaco reveal reveal--slide"${fotos}>
      <span class="quadro__numero">${c.dois(i + 1)}</span>
      <h3 class="quadro__nome">${c.esc(e.nome)}</h3>
      <p class="quadro__nota">${c.esc(e.nota)}</p>
${comFotos ? '      <div class="quadro__foto" aria-hidden="true"><div class="quadro__foto-moldura"></div></div>\n' : ''}    </li>`;
}

module.exports = {
  saida: 'instalacoes.html',
  pagina: '/instalacoes.html',
  gerar: function (d) {
    var p = d.paginas.instalacoes;
    var t = d.instalacoes;

    var corpo = `
${c.nav('/instalacoes.html', d)}

<!-- Hero curto de propósito: a página começa à porta da rua e entrega o
     ecrã ao passeio virtual logo a seguir. A foto é a primeira cena do
     passeio, por isso fica no instalacoes.css e não no conteúdo. -->
<header class="hero hero--instalacoes">
  <div class="hero__photo hero__photo--rua"></div>
  <div class="hero__scrim"></div>

  <div class="hero__content">
    <p class="hero__eyebrow">${c.esc(p.hero.eyebrow)}</p>
    <h1 class="hero__title">${c.marcas(p.hero.titulo)}</h1>
  </div>
</header>

<!-- O elemento principal da página: o passeio virtual em 4:3.
     O componente vive no walkthrough.js + walkthrough.css e as cenas no
     assets/walkthrough/walkthrough.json. Monta-se no fim da página. -->
<section class="passeio" aria-labelledby="passeio-titulo">
  <div class="passeio__cabeca" data-reveal-group>
    <p class="eyebrow reveal reveal--slide">${c.esc(t.passeio.eyebrow)}</p>
    <h2 class="passeio__titulo reveal reveal--slide" id="passeio-titulo">${c.marcas(t.passeio.titulo)}</h2>
  </div>

  <figure class="passeio__moldura reveal reveal--rise">
    <!-- A tela é só a moldura (borda, risca e cantos). O 4:3 é do
         .passeio__palco, que não tem borda: o componente mede-o e as
         coordenadas dos pontos dependem de ele ser exatamente 4:3. -->
    <div class="passeio__tela">
      <div class="passeio__palco" id="passeio" aria-label="Passeio virtual pelas instalações">
        <noscript>
          <img class="passeio__sem-js" src="/assets/walkthrough/rua.webp"
               alt="Entrada da PT Academy vista da rua">
        </noscript>
      </div>
      <span class="passeio__canto passeio__canto--ne" aria-hidden="true"></span>
      <span class="passeio__canto passeio__canto--no" aria-hidden="true"></span>
      <span class="passeio__canto passeio__canto--se" aria-hidden="true"></span>
      <span class="passeio__canto passeio__canto--so" aria-hidden="true"></span>
    </div>
  </figure>
</section>

<!-- Quadro de espaços, como o letreiro de entrada de um edifício:
     linhas corridas de ponta a ponta, número à esquerda, nome grande e
     a nota à direita. No hover a linha abre para baixo e mostra as fotos
     do espaço (data-fotos), em sequência se houver mais de uma. Cada foto
     só é pedida quando é precisa (instalacoes.js). Um espaço sem fotos
     fica só com a linha. -->
<section class="espacos" aria-labelledby="espacos-titulo">
  <div class="espacos__cabeca" data-reveal-group>
    <p class="eyebrow reveal reveal--slide">${c.esc(t.espacos.eyebrow)}</p>
    <h2 class="espacos__titulo reveal reveal--slide" id="espacos-titulo">${c.marcas(t.espacos.titulo)}</h2>
  </div>

  <ol class="quadro" data-reveal-group>
${t.espacos.lista.map(espaco).join('\n')}
  </ol>
</section>

${c.fecho(p.fecho, d)}
`;

    var passeio = `<!-- Passeio virtual. O wt fica em window para se poder saltar entre cenas
     a partir da consola: wt.ir("sala_roxa"). -->
<script type="module">
import { montarWalkthrough } from '/walkthrough.js';

const palco = document.getElementById('passeio');
try {
  const resposta = await fetch('/assets/walkthrough/walkthrough.json');
  if (!resposta.ok) throw new Error(resposta.status);
  window.wt = montarWalkthrough(palco, await resposta.json(), {
    base: '/assets/walkthrough/'
  });
} catch (erro) {
  palco.innerHTML = '<p class="passeio__erro">O passeio não abriu. Recarrega a página para tentar outra vez.</p>';
  console.error('Passeio virtual:', erro);
}
</script>`;

    return `${c.cabeca({ seo: p.seo, css: ['walkthrough.css', 'instalacoes.css'], extraCabeca: PRELOAD }, d)}
<body>
${corpo}
${c.fim('/instalacoes.html', corpo, ['reveal.js', 'instalacoes.js'], d)}
${passeio}

</body>
</html>
`;
  }
};
