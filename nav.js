/* Nav e menu em ecrã inteiro, partilhados por todas as páginas.

   Markup: a página põe um <div data-nav></div> no início do <body> e
   carrega este script LOGO A SEGUIR (não no fim, como os outros). O
   script troca o marcador pelo nav + menu assim que é lido, portanto a
   página nunca chega a pintar sem nav.

   Comportamento: o fundo preto, o padding e a troca do hamburger pela
   lista são todos interpolados ao longo do scroll, não disparados num
   ponto. A transição corre entre estas duas frações da altura do ecrã,
   ou seja termina mesmo à saída do hero. */
var NAV_START = 0.55;
var NAV_END = 1.05;

/* Nas outras páginas as âncoras têm de apontar para a homepage. */
var NAV_NA_HOMEPAGE = /\/(index\.html)?$/.test(location.pathname);
var NAV_BASE = NAV_NA_HOMEPAGE ? '' : '/';

var NAV_ITENS = [
  { texto: 'Início',      href: NAV_BASE + '#inicio' },
  { texto: 'Sobre nós',   href: '/sobre.html' },
  { texto: 'Modalidades', href: NAV_BASE + '#modalidades' },
  { texto: 'Instalações', href: NAV_BASE + '#instalacoes' },
  { texto: 'Equipa',      href: NAV_BASE + '#equipa' },
  { texto: 'Contactos',   href: '/contactos.html' }
];

/* aria-current só nos links para páginas — as âncoras nunca são "a
   página em que se está". */
function navItens(classeItem, classeLink) {
  return NAV_ITENS.map(function (item) {
    var atual = item.href === location.pathname ? ' aria-current="page"' : '';
    return `<li${classeItem ? ` class="${classeItem}"` : ''}><a class="${classeLink}" href="${item.href}"${atual}>${item.texto}</a></li>`;
  }).join('\n    ');
}

var NAV_HTML = `
<nav class="nav">
  <a href="/" class="nav__logo">PT<span class="nav__logo-dot">·</span>ACADEMY</a>

  <ul class="nav__links">
    ${navItens('', 'nav__link')}
  </ul>

  <button type="button" class="nav__toggle" id="nav-toggle"
          aria-label="Abrir menu" aria-expanded="false" aria-controls="menu">
    <span class="nav__toggle-bar"></span>
    <span class="nav__toggle-bar"></span>
    <span class="nav__toggle-bar"></span>
  </button>
</nav>

<!-- Menu em ecrã inteiro -->
<div class="menu" id="menu">
  <ul class="menu__list">
    ${navItens('menu__item', 'menu__link')}
  </ul>
</div>`;

document.querySelectorAll('[data-nav]').forEach(function (lugar) {
  lugar.outerHTML = NAV_HTML;
});

document.addEventListener('DOMContentLoaded', function () {
  var root = document.documentElement;
  var nav = document.querySelector('.nav');
  var toggle = document.getElementById('nav-toggle');
  var menu = document.getElementById('menu');
  var ticking = false;

  function update() {
    var height = window.innerHeight;
    var start = height * NAV_START;
    var end = height * NAV_END;
    var progress = (window.scrollY - start) / (end - start);

    progress = Math.min(1, Math.max(0, progress));
    /* Smoothstep: tira o arranque e a chegada secos das pontas. */
    progress = progress * progress * (3 - 2 * progress);

    nav.style.setProperty('--nav-progress', progress.toFixed(4));
    nav.classList.toggle('nav--links-on', progress >= 0.6);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      update();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  function setMenu(open) {
    root.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  toggle.addEventListener('click', function () {
    setMenu(!root.classList.contains('is-menu-open'));
  });

  menu.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setMenu(false);
  });
});
