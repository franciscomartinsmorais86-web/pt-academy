/* Modalidades: capítulos pregados, horário de aulas e extras. */
var c = require('./comum');

function capitulo(m, i, botao) {
  var invertido = i % 2 === 1;
  return `  <!-- ${c.dois(i + 1)} · ${c.esc(m.nome)} -->
  <section class="capitulo${invertido ? ' capitulo--invertido' : ''}" id="${m.id}" data-scroll="capitulo" aria-labelledby="titulo-${m.id}">
    <div class="capitulo__palco">

      <figure class="capitulo__foto">
        <div class="capitulo__foto-camada">
          <img src="${c.src(m.foto.ficheiro)}" alt="${c.esc(m.foto.alt)}">
        </div>
      </figure>

      <span class="capitulo__marca" aria-hidden="true">${c.dois(i + 1)}</span>

      <div class="capitulo__texto">
        <p class="eyebrow">${c.esc(m.eyebrow)}</p>
        <h2 class="capitulo__titulo" id="titulo-${m.id}">${c.esc(m.nome)}</h2>
        <p class="capitulo__lead">${c.esc(m.lead)}</p>
        <ul class="capitulo__lista">
${m.pontos.map(function (t) { return `          <li>${c.esc(t)}</li>`; }).join('\n')}
        </ul>
        <ul class="etiquetas" aria-label="${c.esc(m.etiquetasRotulo)}">
${m.etiquetas.map(function (t) { return `          <li>${c.esc(t)}</li>`; }).join('\n')}
        </ul>
        <p class="capitulo__plano">${c.marcas(m.plano)}</p>
        <div class="capitulo__acoes">
          ${botao}
        </div>
      </div>

      <figure class="capitulo__detalhe">
        <img src="${c.src(m.detalhe.ficheiro)}" alt="${c.esc(m.detalhe.alt)}">
      </figure>

    </div>
  </section>`;
}
/* Uma tabela por aba. Linhas = horas de início (por ordem), colunas =
   dias. Aulas no mesmo dia e hora empilham-se na célula, pela ordem do
   horario.json. */
function tabela(aba, dias) {
  var horas = Array.from(new Set(aba.aulas.map(function (a) { return a.hora; }))).sort();
  var linhas = horas.map(function (hora) {
    var celulas = dias.map(function (dia) {
      var aulas = aba.aulas.filter(function (a) { return a.hora === hora && a.dia === dia.id; });
      if (!aulas.length) return '          <td></td>';
      if (aulas.length === 1) return `          <td><span class="agenda__aula">${c.esc(aulas[0].nome)}</span></td>`;
      return `          <td>
${aulas.map(function (a) { return `            <span class="agenda__aula">${c.esc(a.nome)}</span>`; }).join('\n')}
          </td>`;
    }).join('\n');
    return `        <tr>
          <th scope="row">${c.esc(hora)}</th>
${celulas}
        </tr>`;
  }).join('\n');

  return `  <!-- ${c.esc(aba.nome)} -->
  <div class="agenda__scroll agenda__scroll--${aba.id}">
    <table class="agenda">
      <caption class="visually-hidden">Horário semanal: ${c.esc(aba.nome)}</caption>
      <thead>
        <tr>
          <th scope="col" class="agenda__cab-hora">Horário</th>
${dias.map(function (dia) { return `          <th scope="col">${c.esc(dia.nome)}</th>`; }).join('\n')}
        </tr>
      </thead>
      <tbody>
${linhas}
      </tbody>
    </table>
  </div>`;
}

module.exports = {
  saida: 'modalidades.html',
  pagina: '/modalidades.html',
  gerar: function (d) {
    var p = d.paginas.modalidades;
    var mod = d.modalidades;
    var hor = mod.horario;
    var abas = d.horario.abas;
    var botao = c.botao(mod.botao, 'outline', d);

    var lead = [hor.lead, `${hor.leadAbertura} ${d.aberturaFrase}.`, hor.leadFim]
      .map(c.esc).join(' ');

    var corpo = `
${c.nav('/modalidades.html')}

<!-- Hero curto, como nas Instalações: apresenta a página e entrega o ecrã
     ao primeiro capítulo. O índice salta para cada modalidade. -->
<header class="hero hero--modalidades" data-scroll="saida">
  <div class="hero__photo hero__photo--box"><img src="${c.src(p.hero.foto)}" alt="" fetchpriority="high"></div>
  <div class="hero__scrim"></div>

  <div class="hero__content">
    <p class="hero__eyebrow">${c.esc(p.hero.eyebrow)}</p>
    <h1 class="hero__title">${c.marcas(p.hero.titulo)}</h1>

    <ul class="indice" aria-label="As quatro modalidades">
${mod.modalidades.map(function (m) {
  return `      <li class="indice__item"><a class="indice__link" href="#${m.id}">${c.esc(m.nome)}</a></li>`;
}).join('\n')}
    </ul>
  </div>
</header>

<!-- Quatro capítulos pregados. Cada um ocupa o ecrã inteiro e fica preso
     enquanto o texto entra da margem mais próxima; o seguinte sobe por
     cima como cortina. O modalidades.js escreve --p (entrada) e --q
     (avanço no capítulo) em cada secção; o CSS faz o resto.

     A foto alterna de lado: capítulo ímpar = foto à esquerda, texto à
     direita (entra da direita); par = .capitulo--invertido. -->
<main class="capitulos">

${mod.modalidades.map(function (m, i) { return capitulo(m, i, botao); }).join('\n\n')}

</main>

<!-- Horário de Aulas semanal. Sobe por cima do último capítulo como os
     outros. As aulas vêm do horario.json.

     Duas tabelas reais (uma por aba), trocadas por dois radios escondidos,
     sem JS. O modalidades.css está preso aos ids das abas (cross, grupo). -->
<section class="mapa" id="mapa" aria-labelledby="mapa-titulo">
${abas.map(function (a, i) {
  return `  <input class="mapa__radio" type="radio" name="mapa" id="mapa-${a.id}"${i === 0 ? ' checked' : ''}>`;
}).join('\n')}

  <div class="mapa__cabeca" data-reveal-group>
    <p class="eyebrow reveal reveal--slide">${c.esc(hor.eyebrow)}</p>
    <h2 class="mapa__titulo reveal reveal--slide" id="mapa-titulo">${c.marcas(hor.titulo)}</h2>
    <p class="mapa__lead reveal reveal--slide">${lead}</p>
  </div>

  <div class="mapa__escolha" role="group" aria-label="Escolher a agenda">
${abas.map(function (a) {
  return `    <label class="mapa__aba" for="mapa-${a.id}">${c.esc(a.nome)}</label>`;
}).join('\n')}
  </div>

${abas.map(function (a) { return tabela(a, d.horario.dias); }).join('\n\n')}

  <p class="mapa__nota">${c.marcas(hor.nota, d)}</p>
</section>

<!-- Também na PT Academy: extras em linhas corridas, como o quadro de
     espaços das Instalações. -->
<section class="extras" aria-labelledby="extras-titulo">
  <div class="extras__cabeca" data-reveal-group>
    <p class="eyebrow reveal reveal--slide">${c.esc(mod.extras.eyebrow)}</p>
    <h2 class="extras__titulo reveal reveal--slide" id="extras-titulo">${c.marcas(mod.extras.titulo)}</h2>
  </div>

  <ul class="extras__lista" data-reveal-group>
${mod.extras.lista.map(function (e) {
  return `    <li class="extra reveal reveal--slide">
      <h3 class="extra__nome">${c.esc(e.nome)}</h3>
      <p class="extra__texto">${c.esc(e.texto)}</p>
      <a class="extra__link" href="${c.esc(c.destino(e.botao.acao, d))}">${c.esc(e.botao.texto)}</a>
    </li>`;
}).join('\n')}
  </ul>
</section>
`;

    return `${c.cabeca({ seo: p.seo, css: ['modalidades.css'] }, d)}
<body>
${corpo}
${c.fim('/modalidades.html', corpo, ['reveal.js', 'modalidades.js'], d)}
</body>
</html>
`;
  }
};
