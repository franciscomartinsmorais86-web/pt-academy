/* Tela de entrada.
   Ecrã preto com o logo grande ao centro. Ao fim de meio segundo o
   fundo desvanece e o logo viaja — a transladar e a encolher — até à
   posição exata que o logo do nav ocupa. No fim, o logo do nav aparece
   no lugar deste e a tela sai do caminho.

   A medição é feita com FLIP: mede-se onde está e onde tem de ficar, e
   anima-se a diferença com um transform (nada de reflows por frame). */
var INTRO_ESPERA = 1000;         /* quanto tempo o logo fica parado ao centro */
var INTRO_VIAGEM = 1200;         /* duração da viagem até ao nav */
var INTRO_FUNDO = 900;          /* duração da subida do preto */
var INTRO_FUNDO_ATRASO = 300;   /* atraso da subida do preto, contado do arranque */
/* Quase linear, com um ease-in-out muito ténue só para tirar o arranque
   e a paragem secos — a viagem deve ler-se a velocidade constante. */
var INTRO_CURVA = 'cubic-bezier(.4,.15,.6,.85)';
/* Desvio do caminho em relação à linha reta, em frações da distância
   percorrida. Positivo curva por baixo (o logo sai em arco e sobe para
   o nav no fim), negativo curva por cima. 0 = linha reta. */
var INTRO_ARCO = 0.16;
var INTRO_PASSOS = 30;     /* amostras da curva; mais = mais suave */

document.documentElement.classList.add('is-intro');

document.addEventListener('DOMContentLoaded', function () {
  var root = document.documentElement;
  var intro = document.getElementById('intro');
  var logo = document.getElementById('intro-logo');
  var destino = document.querySelector('.nav__logo');

  function terminar() {
    root.classList.remove('is-intro');
    if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
  }

  if (!intro || !logo || !destino) { terminar(); return; }

  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var jaFoi = false;

  function arrancar() {
    if (jaFoi) return;
    jaFoi = true;

    if (calmo) {
      /* sem viagem: o preto apenas se apaga */
      intro.style.setProperty('--intro-fundo', '300ms');
      intro.style.setProperty('--intro-fundo-atraso', '0ms');
      intro.classList.add('is-out');
      setTimeout(terminar, 320);
      return;
    }

    var de = logo.getBoundingClientRect();
    var para = destino.getBoundingClientRect();
    var escala = para.width / de.width;
    var dx = para.left - de.left;
    var dy = para.top - de.top;
    var fim = 'translate(' + dx + 'px,' + dy + 'px) scale(' + escala + ')';

    intro.style.setProperty('--intro-fundo', INTRO_FUNDO + 'ms');
    intro.style.setProperty('--intro-fundo-atraso', INTRO_FUNDO_ATRASO + 'ms');

    /* Ponto de controlo da Bézier: a meio do trajeto, empurrado na
       perpendicular. É isto que tira o logo da linha reta. */
    var dist = Math.hypot(dx, dy) || 1;
    var cx = dx / 2 + (dy / dist) * dist * INTRO_ARCO;
    var cy = dy / 2 + (-dx / dist) * dist * INTRO_ARCO;

    var quadros = [];
    for (var i = 0; i <= INTRO_PASSOS; i++) {
      var t = i / INTRO_PASSOS;
      var u = 1 - t;
      /* B(t) = u²·(0,0) + 2ut·C + t²·(dx,dy) */
      var x = 2 * u * t * cx + t * t * dx;
      var y = 2 * u * t * cy + t * t * dy;
      quadros.push({
        offset: t,
        transform: 'translate(' + x + 'px,' + y + 'px) scale(' + (1 + (escala - 1) * t) + ')',
        easing: 'linear'
      });
    }

    requestAnimationFrame(function () {
      intro.classList.add('is-out');

      /* O easing global reparte o tempo pelos quadros; a forma do
         caminho fica só a cargo das amostras. */
      if (logo.animate) {
        logo.animate(quadros, {
          duration: INTRO_VIAGEM,
          easing: INTRO_CURVA,
          fill: 'forwards'
        });
      } else {
        logo.style.transition = 'transform ' + INTRO_VIAGEM + 'ms ' + INTRO_CURVA;
        logo.style.transform = fim;   /* sem WAAPI: em linha reta */
      }
    });

    /* Só sai quando as duas coisas acabaram — com o atraso, o fundo
       termina depois da viagem, e tirar a tela a meio do fade dava um
       salto no preto. */
    var espera = Math.max(INTRO_VIAGEM, INTRO_FUNDO_ATRASO + INTRO_FUNDO);
    setTimeout(terminar, espera + 40);
  }

  function esperar() { setTimeout(arrancar, INTRO_ESPERA); }

  /* As fontes têm de estar carregadas antes de medir, senão o logo é
     medido em fallback e a chegada fica ao lado. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(esperar);
    setTimeout(esperar, 2000);   /* rede lenta: não deixa a tela presa */
  } else {
    esperar();
  }
});
