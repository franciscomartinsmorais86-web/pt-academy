/* Página "Equipa": os cartões com vídeo.

   Cartões: cada .pessoa tem a foto e um <video> por cima, invisível. Com
   rato, entrar no cartão liga o vídeo — a foto funde para ele assim que
   há frames (evento playing) — e ele toca uma vez e volta à foto; sair
   antes do fim também volta. Sem rato, ou com prefers-reduced-motion, é
   o botão da moldura que manda, ao toque ou com Enter: um toque liga,
   outro desliga, e tocar noutro cartão desliga o anterior. Só toca um
   de cada vez.

   Os vídeos têm preload="none". Com rato, carregam-se quando o cartão se
   aproxima do ecrã, para o hover não ficar à espera da rede; sem rato,
   cada um só se carrega quando é pedido. */

/* Quanto tempo o vídeo espera antes de rebobinar, depois de apagado:
   tem de ser maior do que a transição de opacidade no CSS (.35s). */
var EQUIPA_REBOBINAR = 400;

document.addEventListener('DOMContentLoaded', function () {
  var comRato = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hoverLiga = comRato && !menosMovimento;
  var aTocar = null;

  /* ---------- Cartões ---------- */

  function ligar(cartao) {
    if (aTocar && aTocar !== cartao) desligar(aTocar);
    aTocar = cartao;
    cartao.botao.setAttribute('aria-pressed', 'true');

    var promessa = cartao.video.play();
    if (promessa && promessa.catch) {
      promessa.catch(function () { desligar(cartao); });
    }
  }

  function desligar(cartao) {
    if (aTocar === cartao) aTocar = null;
    cartao.el.classList.remove('is-a-tocar');
    cartao.botao.setAttribute('aria-pressed', 'false');
    cartao.video.pause();

    /* Rebobina só depois de a foto ter voltado, para o salto para o
       início não se ver. Se entretanto voltou a ligar, deixa estar. */
    setTimeout(function () {
      if (aTocar === cartao) return;
      try { cartao.video.currentTime = 0; } catch (erro) { /* ainda sem metadados */ }
    }, EQUIPA_REBOBINAR);
  }

  var cartoes = Array.prototype.map.call(document.querySelectorAll('.pessoa'), function (el) {
    var cartao = {
      el: el,
      botao: el.querySelector('.pessoa__media'),
      video: el.querySelector('.pessoa__video')
    };

    /* A fusão só arranca quando há mesmo frames — e só se este ainda for
       o cartão pedido (o play() pode resolver depois de o rato já ter
       saído). */
    cartao.video.addEventListener('playing', function () {
      if (aTocar === cartao) el.classList.add('is-a-tocar');
    });
    cartao.video.addEventListener('ended', function () { desligar(cartao); });

    if (hoverLiga) {
      el.addEventListener('mouseenter', function () { ligar(cartao); });
      el.addEventListener('mouseleave', function () { desligar(cartao); });
    }

    cartao.botao.addEventListener('click', function (event) {
      /* Com rato o hover já manda: o clique do rato é ignorado para não
         interromper o vídeo a meio. O clique vindo do teclado (Enter,
         Space) chega com detail 0 e esse conta sempre. */
      if (hoverLiga && event.detail !== 0) return;
      if (aTocar === cartao) desligar(cartao); else ligar(cartao);
    });

    return cartao;
  });

  /* Com rato, pré-carrega cada vídeo quando o cartão se aproxima do ecrã
     (300px de margem), para o hover ser imediato. Sem rato não vale a
     pena descarregar os dezoito. */
  if (hoverLiga && 'IntersectionObserver' in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        var video = entrada.target;
        observador.unobserve(video);
        /* Se já está a tocar (rato pousado antes de chegar aqui), o
           load() reiniciava-o. */
        if (aTocar && aTocar.video === video) return;
        video.preload = 'auto';
        video.load();
      });
    }, { rootMargin: '300px 0px' });

    cartoes.forEach(function (cartao) { observador.observe(cartao.video); });
  }
});
