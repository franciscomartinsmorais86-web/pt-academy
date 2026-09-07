/* Galeria pregada com mosaico que se reajusta ao scroll.

   A pregagem é toda CSS (o palco é sticky dentro de um wrapper alto que
   arranca por baixo das modalidades). Aqui só se trata do movimento:

   1. O mosaico sai de uma partição por cortes sucessivos — o palco parte-se
      em dois, cada metade volta a partir-se, até haver uma folha por peça.
      Animar só os pontos de corte muda as proporções de todas as peças e
      obriga-as a reajustarem-se umas às outras, mas cobrir o palco todo sem
      frestas nem sobreposições é garantido por construção.
   2. Cada aresta é arredondada uma só vez, no momento do corte, e o mesmo
      inteiro é passado às duas peças vizinhas — é isso que evita a fresta de
      1px que aparece quando cada peça arredonda por sua conta.
   3. A paralaxe acontece dentro de cada peça (a foto é 118% da altura e
      translada em Y), portanto as arestas do mosaico não se mexem. */

/* A tela do mosaico tem esta altura, em alturas de viewport. É por ser
   bem mais alta do que o ecrã que as peças ficam grandes: só se vê uma
   parte de cada vez, e a tela desliza enquanto os cortes se mexem. */
var ALTURA_MOSAICO = 2.6;

/* Folga no fim, em alturas de viewport: o mosaico chega ao fundo e fica
   parado este bocado antes de os planos começarem a subir por cima. */
var TOLERANCIA_FIM = 0.5;

/* Cortes: cada um tem [valor no início, valor no fim] do scroll da galeria. */
var CORTES_DESKTOP = {
  a: [0.205, 0.260],   /* banda de topo | resto */
  b: [0.460, 0.340],   /* resto: faixa das colunas | resto */
  c: [0.400, 0.240],   /* colunas: 1ª | resto */
  d: [0.400, 0.600],   /* colunas: 2ª | 3ª */
  e: [0.358, 0.420],   /* banda B | resto */
  f: [0.375, 0.300],   /* banda B: texto | foto */
  g: [0.530, 0.500],   /* banda C | banda D */
  h: [0.350, 0.460],   /* banda C: foto | foto */
  i: [0.563, 0.470]    /* banda D: foto | texto */
};

/* Uma banda panorâmica no topo, três colunas verticais a meio (é aqui
   que as fotos de pessoas ficam bem) e três bandas largas em baixo. */
var MOSAICO_DESKTOP = {
  eixo: 'y', corte: 'a',
  um: { peca: 'sala-cardio' },
  dois: {
    eixo: 'y', corte: 'b',
    um: {
      eixo: 'x', corte: 'c',
      um: { peca: 'texto-1' },
      dois: { eixo: 'x', corte: 'd', um: { peca: 'peso-morto' }, dois: { peca: 'discos-azafit' } }
    },
    dois: {
      eixo: 'y', corte: 'e',
      um: { eixo: 'x', corte: 'f', um: { peca: 'turma' }, dois: { peca: 'sala-fitness' } },
      dois: {
        eixo: 'y', corte: 'g',
        um:   { eixo: 'x', corte: 'h', um: { peca: 'disco-10' },      dois: { peca: 'estudio' } },
        dois: { eixo: 'x', corte: 'i', um: { peca: 'cross-academy' }, dois: { peca: 'texto-2' } }
      }
    }
  }
};

/* Em ecrã estreito a tela é ainda mais alta em proporção: quase tudo
   bandas de largura inteira, com um só par de colunas. */
var CORTES_MOBILE = {
  a: [0.237, 0.310],
  b: [0.246, 0.190],
  c: [0.360, 0.420],
  d: [0.500, 0.460],
  e: [0.401, 0.360],
  f: [0.603, 0.540]
};

var MOSAICO_MOBILE = {
  eixo: 'y', corte: 'a',
  um: { peca: 'turma' },
  dois: {
    eixo: 'y', corte: 'b',
    um: { peca: 'texto-1' },
    dois: {
      eixo: 'y', corte: 'c',
      um: { eixo: 'x', corte: 'd', um: { peca: 'peso-morto' }, dois: { peca: 'discos-azafit' } },
      dois: {
        eixo: 'y', corte: 'e',
        um: { peca: 'sala-cardio' },
        dois: { eixo: 'y', corte: 'f', um: { peca: 'sala-fitness' }, dois: { peca: 'texto-2' } }
      }
    }
  }
};

var PARALAXE = 5;   /* amplitude máxima, em % da altura da peça */

document.addEventListener('DOMContentLoaded', function () {
  var galeria = document.querySelector('.galeria');
  var palco = galeria && galeria.querySelector('.galeria__palco');
  var mosaico = palco && palco.querySelector('.galeria__mosaico');
  if (!galeria || !palco || !mosaico) return;

  var pecas = {};
  Array.prototype.forEach.call(mosaico.querySelectorAll('[data-peca]'), function (el, i) {
    pecas[el.getAttribute('data-peca')] = { el: el, img: el.querySelector('img'), ordem: i };
  });

  var estreito = window.matchMedia('(max-width: 900px)');
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)');

  var largura = 0, altura = 0;
  var usadas = {};
  var agendado = false;

  function arvore() { return estreito.matches ? MOSAICO_MOBILE : MOSAICO_DESKTOP; }
  function cortes() { return estreito.matches ? CORTES_MOBILE : CORTES_DESKTOP; }

  function limitar(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

  /* Percorre a árvore e escreve a caixa de cada folha. x0/x1/y0/y1 já vêm
     em pixels inteiros; o corte é arredondado aqui, uma só vez, e os dois
     ramos recebem exatamente o mesmo valor. */
  function dispor(no, x0, y0, x1, y1, valores) {
    if (no.peca) {
      var p = pecas[no.peca];
      if (!p) return;
      usadas[no.peca] = true;
      var el = p.el;
      el.style.display = '';
      el.style.left = x0 + 'px';
      el.style.top = y0 + 'px';
      el.style.width = (x1 - x0) + 'px';
      el.style.height = (y1 - y0) + 'px';
      return;
    }

    var t = valores[no.corte];
    if (no.eixo === 'x') {
      var xm = Math.round(x0 + (x1 - x0) * t);
      dispor(no.um, x0, y0, xm, y1, valores);
      dispor(no.dois, xm, y0, x1, y1, valores);
    } else {
      var ym = Math.round(y0 + (y1 - y0) * t);
      dispor(no.um, x0, y0, x1, ym, valores);
      dispor(no.dois, x0, ym, x1, y1, valores);
    }
  }

  function desenhar() {
    if (!largura || !altura) return;

    var r = galeria.getBoundingClientRect();
    var vh = palco.getBoundingClientRect().height || altura;
    var avanco = -r.top;

    /* Fases: a cortina a subir (modalidades, uma altura de palco), o
       movimento do mosaico, a folga em que ele já chegou ao fundo e fica
       parado, e a saída — os planos a subirem por cima (outra altura de
       palco, fixada pelo margin-top negativo deles no CSS). */
    var curso = r.height - vh * (3 + TOLERANCIA_FIM);
    var p = curso > 0 ? limitar((avanco - vh) / curso) : 0;
    if (calmo.matches) p = 1;
    /* smoothstep: tira o arranque e a chegada secos */
    var e = p * p * (3 - 2 * p);

    var base = cortes();
    var valores = {};
    for (var k in base) {
      valores[k] = base[k][0] + (base[k][1] - base[k][0]) * e;
    }

    /* A tela é mais alta do que o palco e desliza através dele. O deslize
       segue o scroll a direito (p), para se ler colado à página; são só os
       cortes que levam o smoothstep. */
    var alturaTela = Math.round(altura * ALTURA_MOSAICO);
    mosaico.style.height = alturaTela + 'px';
    mosaico.style.transform =
      'translate3d(0,' + (-(alturaTela - altura) * p).toFixed(2) + 'px,0)';

    usadas = {};
    dispor(arvore(), 0, 0, Math.round(largura), alturaTela, valores);

    for (var nome in pecas) {
      var peca = pecas[nome];
      if (!usadas[nome]) {
        peca.el.style.display = 'none';
        continue;
      }
      if (peca.img) {
        /* fatores diferentes por peça: umas sobem, outras descem */
        var fator = ((peca.ordem % 3) + 1) / 3 * (peca.ordem % 2 ? 1 : -1);
        var deslocamento = calmo.matches ? 0 : (e - 0.5) * 2 * PARALAXE * fator;
        peca.img.style.transform = 'translate3d(0,' + deslocamento.toFixed(2) + '%,0)';
      }
    }
  }

  function pedir() {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(function () {
      agendado = false;
      desenhar();
    });
  }

  function medir() {
    var r = palco.getBoundingClientRect();
    largura = r.width;
    altura = r.height;
    desenhar();
  }

  new ResizeObserver(medir).observe(palco);
  window.addEventListener('scroll', pedir, { passive: true });
  if (estreito.addEventListener) estreito.addEventListener('change', medir);

  medir();
});
