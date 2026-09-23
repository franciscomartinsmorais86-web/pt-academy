/* Nav e menu em ecrã inteiro: o comportamento.

   O markup é gerado pelo construir.js (moldes/comum.js, nav()), com a
   página atual já marcada. Este script só lhe dá vida.

   O fundo preto, o padding e a troca do hamburger pela lista são todos
   interpolados ao longo do scroll, não disparados num ponto. A transição
   corre entre estas duas frações da altura do ecrã, ou seja termina
   mesmo à saída do hero. */
var NAV_START = 0.55;
var NAV_END = 1.05;

document.addEventListener('DOMContentLoaded', function () {
  /* O ano do rodapé é escrito no build. Se o site não for reconstruído
     depois da passagem de ano, o browser corrige-o. */
  document.querySelectorAll('[data-ano]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

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
