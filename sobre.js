/* Página "Sobre nós": tudo o que mexe com o scroll.

   Cada elemento com [data-scroll] recebe uma custom property --p (0 → 1),
   escrita a cada frame; o sobre.css decide o que fazer com ela. Nada
   dispara num ponto — é tudo interpolado, como o nav.

   Modos:
   - saida       o elemento a sair pelo topo do ecrã (hero).
   - pregado     o avanço dentro de uma secção alta com palco sticky.
   - entrada     do topo a aparecer em baixo até chegar a SOBRE_ENTRADA_FIM.
   - atravessar  da entrada por baixo à saída por cima (paralaxe, letreiro).

   Os [data-contar] dentro de um [data-scroll] contam de 0 ao alvo com o
   mesmo --p. Um data-desde="AAAA-MM" (ou "AAAA-MM-DD", ou só "AAAA") faz
   do alvo os anos completos passados desde essa data. */
var SOBRE_ENTRADA_FIM = 0.4;   /* a entrada acaba com o topo a 40% do ecrã */

document.addEventListener('DOMContentLoaded', function () {
  /* Os anos contam-se sempre, com ou sem movimento — o HTML traz o valor
     da altura em que foi escrito. */
  var contadores = Array.prototype.map.call(
    document.querySelectorAll('[data-contar]'),
    function (el) {
      var alvo = el.hasAttribute('data-desde')
        ? anosDesde(el.getAttribute('data-desde'))
        : Number(el.getAttribute('data-contar'));
      el.textContent = alvo;
      return { el: el, alvo: alvo, atual: alvo };
    }
  );

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('[data-palavras]').forEach(separarPalavras);

  var alvos = Array.prototype.map.call(
    document.querySelectorAll('[data-scroll]'),
    function (el) {
      return {
        el: el,
        modo: el.getAttribute('data-scroll'),
        contadores: contadores.filter(function (c) { return el.contains(c.el); })
      };
    }
  );

  var ticking = false;

  function update() {
    var vh = window.innerHeight;

    alvos.forEach(function (alvo) {
      var p = progresso(alvo.el, alvo.modo, vh);
      alvo.el.style.setProperty('--p', p.toFixed(4));

      alvo.contadores.forEach(function (c) {
        var valor = Math.round(c.alvo * p);
        if (valor === c.atual) return;
        c.atual = valor;
        c.el.textContent = valor;
      });
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

/* Anos completos desde "AAAA-MM-DD"; mês e dia em falta contam como 1.
   O ano só sobe quando se passa o aniversário, não a 1 de janeiro. */
function anosDesde(data) {
  var partes = data.split('-').map(Number);
  var ano = partes[0];
  var mes = partes[1] || 1;
  var dia = partes[2] || 1;
  var hoje = new Date();
  var anos = hoje.getFullYear() - ano;
  var mesHoje = hoje.getMonth() + 1;

  if (mesHoje < mes || (mesHoje === mes && hoje.getDate() < dia)) anos--;
  return anos;
}

function progresso(el, modo, vh) {
  var r = el.getBoundingClientRect();
  var p;

  if (modo === 'saida') {
    p = -r.top / r.height;
  } else if (modo === 'pregado') {
    p = -r.top / Math.max(1, r.height - vh);
  } else if (modo === 'entrada') {
    p = (vh - r.top) / (vh * (1 - SOBRE_ENTRADA_FIM));
  } else {
    p = (vh - r.top) / (vh + r.height);
  }

  p = Math.min(1, Math.max(0, p));

  /* Smoothstep na entrada e na saída: tira os arranques secos. A
     paralaxe e o manifesto ficam lineares, para se lerem colados ao dedo. */
  if (modo === 'entrada' || modo === 'saida') p = p * p * (3 - 2 * p);

  return p;
}

/* Parte o texto em <span class="manifesto__palavra"> com --i (posição)
   e escreve --n (total) no próprio elemento. Anda pelos nós de texto,
   portanto um <em> lá dentro continua a ser <em>. */
function separarPalavras(el) {
  var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  var nos = [];
  var i = 0;

  while (walker.nextNode()) nos.push(walker.currentNode);

  nos.forEach(function (no) {
    var fragmento = document.createDocumentFragment();

    no.textContent.split(/(\s+)/).forEach(function (pedaco) {
      if (!pedaco) return;
      if (/^\s+$/.test(pedaco)) {
        fragmento.appendChild(document.createTextNode(pedaco));
        return;
      }
      var palavra = document.createElement('span');
      palavra.className = 'manifesto__palavra';
      palavra.style.setProperty('--i', i++);
      palavra.textContent = pedaco;
      fragmento.appendChild(palavra);
    });

    no.parentNode.replaceChild(fragmento, no);
  });

  el.style.setProperty('--n', i);
}
