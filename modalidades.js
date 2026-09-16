/* Página "Modalidades": tudo o que mexe com o scroll.

   O mesmo mecanismo do sobre.js: cada elemento com [data-scroll] recebe
   custom properties escritas a cada frame e o modalidades.css decide o
   que fazer com elas. Nada dispara num ponto — é tudo interpolado.

   Modos:
   - saida     o hero a sair pelo topo: --p de 0 a 1 (smoothstep).
   - capitulo  um capítulo pregado. Escreve duas:
               --p  a entrada do texto. Arranca com o topo da secção a
                    MOD_ENTRADA_INICIO da altura do ecrã (o capítulo ainda
                    está a subir como cortina) e acaba MOD_ENTRADA_FIM da
                    folga depois de o palco ficar preso. Com smoothstep.
               --q  o avanço na secção inteira, de 0 (topo a bater no topo
                    do ecrã) a 1 (fundo a bater no fundo). Linear, para a
                    paralaxe da foto se ler colada ao dedo.

   A folga (o tempo a sós antes da cortina seguinte) não se lê do CSS:
   deduz-se da altura da secção, que é 200dvh + folga. */
var MOD_ENTRADA_INICIO = 0.6;
var MOD_ENTRADA_FIM = 0.4;

document.addEventListener('DOMContentLoaded', function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var alvos = Array.prototype.map.call(
    document.querySelectorAll('[data-scroll]'),
    function (el) {
      return { el: el, modo: el.getAttribute('data-scroll') };
    }
  );
  if (!alvos.length) return;

  var ticking = false;

  function update() {
    var vh = window.innerHeight;

    alvos.forEach(function (alvo) {
      var r = alvo.el.getBoundingClientRect();

      if (alvo.modo === 'saida') {
        alvo.el.style.setProperty('--p', suavizar(limitar(-r.top / r.height)).toFixed(4));
        return;
      }

      var folga = Math.max(1, r.height - 2 * vh);
      var inicio = MOD_ENTRADA_INICIO * vh;
      var fim = MOD_ENTRADA_FIM * folga;
      var p = suavizar(limitar((inicio - r.top) / (inicio + fim)));
      var q = limitar(-r.top / Math.max(1, r.height - vh));

      alvo.el.style.setProperty('--p', p.toFixed(4));
      alvo.el.style.setProperty('--q', q.toFixed(4));
    });
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
});

function limitar(valor) {
  return Math.min(1, Math.max(0, valor));
}

/* Smoothstep: tira o arranque e a chegada secos das pontas. */
function suavizar(p) {
  return p * p * (3 - 2 * p);
}
