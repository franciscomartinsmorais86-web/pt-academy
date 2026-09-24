/* Página 404. A Cloudflare Pages serve-a sozinha em qualquer endereço
   que não exista: campanhas que acabaram, links partidos, erros de
   escrita.

   Texto fixo, escrito pela NK: é estrutura, não está no conteudo/
   (decisão C do inventário em docs/). Todos os caminhos são absolutos
   porque a página pode aparecer em /a/b/c. */
var c = require('./comum');

var FOTO = 'galeria/galeria-sala-cardio.webp';

module.exports = {
  saida: '404.html',
  pagina: '/404',
  gerar: function (d) {
    var corpo = `
${c.nav('/404', d)}

<header class="hero hero--erro">
  <div class="hero__photo"><img src="${c.src(FOTO)}" alt="" fetchpriority="high"></div>
  <div class="hero__scrim"></div>

  <div class="hero__content">
    <p class="hero__eyebrow">Erro 404</p>
    <h1 class="hero__title">Esta página <em>saiu</em> do treino</h1>
    <p class="hero__lead">A página que tentaste abrir foi removida ou já não existe.</p>
    <div class="hero__acoes">
      <a class="button button--red" href="/">Início</a>
      <!-- Volta à página anterior (erro.js). Sem histórico, segue o href. -->
      <a class="button button--outline" href="/" data-voltar>Voltar</a>
    </div>
  </div>
</header>
`;

    return `${c.cabeca({
      seo: { titulo: 'Página não encontrada', descricao: 'Esta página da PT Academy foi removida ou já não existe.' },
      extraCabeca: '<meta name="robots" content="noindex">'
    }, d)}
<body>
${corpo}
${c.fim('/404', corpo, ['erro.js'], d)}
</body>
</html>
`;
  }
};
