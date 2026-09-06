/* Hero — revelação fluida.
   Por cima do hero está a fachada (desenhada neste canvas); à volta do
   cursor abre-se um buraco de bordas macias que deixa ver a foto de
   baixo (.hero__photo, no CSS). O buraco persegue o rato com inércia,
   deixa rasto e alarga quando o rato vai depressa.
   Em ecrãs táteis, com prefers-reduced-motion ou sem JS não corre nada
   e fica só a foto de baixo. */
(function () {
  var hero = document.querySelector('.hero');
  var canvas = hero && hero.querySelector('.hero__reveal');
  if (!hero || !canvas) return;

  var noHover = window.matchMedia('(hover: none)').matches;
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (noHover || calmo) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var SRC = './assets/pt-academy-fachada.jpg';
  var FOCO_X = 0.5;        /* enquadramento do cover, 0–1 */
  var FOCO_Y = 0.35;       /* um pouco acima do centro: mantém o letreiro */
  var PERSEGUE = 0.16;     /* quanto do caminho até ao rato se faz por frame */
  var SUAVIZA = 0.12;      /* suavização da velocidade */
  var RAIO_BASE = 0.26;    /* fração da menor dimensão do hero */
  var RAIO_MAX = 5.2;      /* multiplicador máximo do raio com velocidade */
  var DECAI = 0.90;        /* decaimento de cada ponto do rasto */
  var RASTO_MAX = 28;

  var img = new Image();
  var pronta = false;

  var largura = 0, altura = 0, dpr = 1;
  var alvo = { x: 0, y: 0 };
  var pos = { x: 0, y: 0 };
  var temAlvo = false, dentro = false;
  var velocidade = 0;
  var rasto = [];
  var aCorrer = false;

  function medir() {
    var r = hero.getBoundingClientRect();
    largura = r.width;
    altura = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(largura * dpr);
    canvas.height = Math.round(altura * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function desenharFachada() {
    var iw = img.naturalWidth, ih = img.naturalHeight;
    if (!iw || !ih) return;
    var escala = Math.max(largura / iw, altura / ih);
    var w = iw * escala, h = ih * escala;
    ctx.drawImage(img, (largura - w) * FOCO_X, (altura - h) * FOCO_Y, w, h);
  }

  function frame() {
    if (!pronta) { aCorrer = false; return; }

    var antesX = pos.x, antesY = pos.y;
    if (temAlvo) {
      pos.x += (alvo.x - pos.x) * PERSEGUE;
      pos.y += (alvo.y - pos.y) * PERSEGUE;
    }
    var d = Math.hypot(pos.x - antesX, pos.y - antesY);
    velocidade += (d - velocidade) * SUAVIZA;

    var base = Math.min(largura, altura) * RAIO_BASE;
    var mult = Math.min(1 + velocidade / 26, RAIO_MAX);
    var raio = base * mult;

    if (dentro) {
      rasto.push({ x: pos.x, y: pos.y, r: raio, vida: 1 });
      if (rasto.length > RASTO_MAX) rasto.shift();
    }

    for (var i = rasto.length - 1; i >= 0; i--) {
      rasto[i].vida *= DECAI;
      if (rasto[i].vida < 0.02) rasto.splice(i, 1);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, largura, altura);

    /* 1. os blobs do rasto, somados uns aos outros para se fundirem */
    ctx.globalCompositeOperation = 'lighter';
    for (var j = 0; j < rasto.length; j++) {
      var p = rasto[j];
      var r = p.r * (0.4 + 0.6 * p.vida);
      var a = Math.min(1, p.vida * 1.6);
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, 'rgba(0,0,0,' + a + ')');
      g.addColorStop(0.55, 'rgba(0,0,0,' + a * 0.55 + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
    }

    /* 2. a fachada só onde não há blob — o gradiente dá a borda macia */
    ctx.globalCompositeOperation = 'source-out';
    desenharFachada();
    ctx.globalCompositeOperation = 'source-over';

    if (dentro || rasto.length) {
      requestAnimationFrame(frame);
    } else {
      aCorrer = false;
    }
  }

  function arrancar() {
    if (aCorrer) return;
    aCorrer = true;
    requestAnimationFrame(frame);
  }

  function pintarParado() {
    /* estado de repouso: só a fachada, sem buraco nenhum */
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, largura, altura);
    desenharFachada();
  }

  hero.addEventListener('mouseenter', function (e) {
    var r = hero.getBoundingClientRect();
    alvo.x = e.clientX - r.left;
    alvo.y = e.clientY - r.top;
    pos.x = alvo.x;
    pos.y = alvo.y;
    temAlvo = true;
    dentro = true;
    velocidade = 0;
    arrancar();
  });

  hero.addEventListener('mousemove', function (e) {
    var r = hero.getBoundingClientRect();
    alvo.x = e.clientX - r.left;
    alvo.y = e.clientY - r.top;
    if (!temAlvo) { pos.x = alvo.x; pos.y = alvo.y; temAlvo = true; }
    dentro = true;
    arrancar();
  });

  hero.addEventListener('mouseleave', function () {
    dentro = false;   /* deixa de alimentar o rasto: desvanece sozinho */
  });

  var pendente = false;
  var ro = new ResizeObserver(function () {
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(function () {
      pendente = false;
      medir();
      if (pronta && !aCorrer) pintarParado();
    });
  });
  ro.observe(hero);

  medir();
  img.src = SRC;
  var mostra = function () {
    pronta = true;
    if (aCorrer) return;
    pintarParado();
  };
  if (img.decode) {
    img.decode().then(mostra).catch(function () { img.onload = mostra; });
  } else {
    img.onload = mostra;
  }
})();
