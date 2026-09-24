/* Contactos: dados à esquerda, formulário à direita. */
var c = require('./comum');

module.exports = {
  saida: 'contactos.html',
  pagina: '/contactos.html',
  gerar: function (d) {
    var p = d.paginas.contactos;
    var k = d.contactos;
    var s = d.paginas.sucesso;

    var horario = k.horario.map(function (h) {
      var fechado = !h.intervalos.length;
      return `        <div class="horario__linha${fechado ? ' horario__linha--fechado' : ''}">
          <dt>${c.esc(h.dias)}</dt>
          <dd>${c.esc(h.horas)}</dd>
        </div>`;
    }).join('\n');

    var corpo = `
${c.nav('/contactos.html', d)}

<!-- Uma secção só: cabeçalho, dados à esquerda, formulário à direita.
     Página curta de propósito — quem vem aqui quer o número de telefone,
     não uma viagem pelo scroll. -->
<main class="contactos">

  <header class="contactos__cabeca">
    <p class="eyebrow">${c.esc(p.eyebrow)}</p>
    <h1 class="contactos__titulo">${c.marcas(p.titulo)}</h1>
    <p class="contactos__lead">${c.esc(p.lead)}</p>
  </header>

  <div class="contactos__grelha">

    <div class="contactos__info">

      <dl class="dados">
        <div class="dados__linha">
          <dt class="dados__rotulo">Telefone</dt>
          <dd class="dados__valor"><a href="${d.tel}">${c.esc(k.telefone)}</a></dd>
        </div>
        <div class="dados__linha">
          <dt class="dados__rotulo">Email</dt>
          <dd class="dados__valor"><a href="mailto:${c.esc(k.email)}">${c.esc(k.email)}</a></dd>
        </div>
        <div class="dados__linha">
          <dt class="dados__rotulo">Morada</dt>
          <dd class="dados__valor dados__valor--morada">
            <a href="${c.esc(k.mapa)}"
               target="_blank" rel="noopener">${k.morada.map(c.esc).join('<br>')}</a>
          </dd>
        </div>
      </dl>

      <dl class="horario">
${horario}
      </dl>

    </div>

    <!-- O formulário é o mesmo do modal da homepage; a lógica vem toda
         do formulario.js. -->
    <div class="contactos__caixa">
      <p class="contactos__caixa-titulo">${c.esc(p.formulario)}</p>

      ${c.formulario(3, '      ')}

      <div class="sucesso" data-sucesso hidden>
        <div class="sucesso__visto" aria-hidden="true">
          ${c.VISTO}
        </div>
        <h2 class="sucesso__titulo">${c.esc(s.titulo)}</h2>
        <p class="sucesso__lead">${c.esc(s.lead)}</p>
        <a class="button button--outline" href="/">Voltar ao início</a>
      </div>
    </div>

  </div>
</main>
`;

    return `${c.cabeca({ seo: p.seo, css: ['contactos.css'] }, d)}
<body>
${corpo}
${c.fim('/contactos.html', corpo, ['formulario.js', 'contactos.js'], d)}
</body>
</html>
`;
  }
};
