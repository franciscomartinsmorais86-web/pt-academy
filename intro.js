/* Tela de entrada.
   Ecrã todo preto. Meio segundo de atraso, o logo aparece grande e
   centrado. Ao fim de mais um segundo, a tela toda (fundo + logo)
   sobe e sai do ecrã, revelando a página. */
var INTRO_ATRASO = 500;          /* atraso antes do logo aparecer */
var INTRO_LOGO_VISIVEL = 1000;   /* quanto tempo o logo fica visível */
var INTRO_FUNDO = 550;           /* duração da subida do preto */

document.documentElement.classList.add('is-intro');

document.addEventListener('DOMContentLoaded', function () {
  var root = document.documentElement;
  var intro = document.getElementById('intro');
  var logo = document.getElementById('intro-logo');

  function terminar() {
    root.classList.remove('is-intro');
    if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
  }

  if (!intro || !logo) { terminar(); return; }

  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var jaFoi = false;

  function arrancar() {
    if (jaFoi) return;
    jaFoi = true;

    if (calmo) {
      /* sem animação: o preto apenas se apaga */
      intro.style.setProperty('--intro-fundo', '300ms');
      intro.classList.add('is-out');
      setTimeout(terminar, 320);
      return;
    }

    intro.style.setProperty('--intro-fundo', INTRO_FUNDO + 'ms');

    setTimeout(function () {
      logo.classList.add('is-visible');

      setTimeout(function () {
        intro.classList.add('is-out');
        setTimeout(terminar, INTRO_FUNDO + 40);
      }, INTRO_LOGO_VISIVEL);
    }, INTRO_ATRASO);
  }

  /* As fontes têm de estar carregadas antes de mostrar o logo, senão
     este pisca com a fonte de fallback antes da definitiva. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(arrancar);
    setTimeout(arrancar, 2000);   /* rede lenta: não deixa a tela presa */
  } else {
    arrancar();
  }
});
