/* Modal de contacto da homepage: abre pelo botão "Enviar questão" da
   faixa de fecho. Trata só de abrir, fechar e prender o foco — a
   validação e o envio vivem no formulario.js, partilhados com a página
   de contactos, e por isso o formulario.js tem de vir antes deste. */

document.addEventListener('DOMContentLoaded', function () {
  var root = document.documentElement;
  var modal = document.getElementById('modal-contacto');
  var form = document.getElementById('form-contacto');
  if (!modal || !form) return;

  var caixa = modal.querySelector('.modal__caixa');
  var sucesso = modal.querySelector('[data-sucesso]');
  var contacto = ligarFormulario(form, sucesso);
  var focoAnterior = null;

  /* ---------- Abrir e fechar ---------- */

  function abrir() {
    focoAnterior = document.activeElement;
    modal.hidden = false;
    /* Um frame antes de pôr a classe, senão o browser não anima a
       transição de um elemento que acabou de deixar de estar hidden. */
    requestAnimationFrame(function () {
      root.classList.add('is-modal-open');
      var primeiro = form.querySelector('.campo__input');
      if (primeiro) primeiro.focus();
    });
  }

  function fechar() {
    root.classList.remove('is-modal-open');
    window.setTimeout(function () {
      modal.hidden = true;
      contacto.reiniciar();
      if (focoAnterior) focoAnterior.focus();
    }, 350);
  }

  document.addEventListener('click', function (evento) {
    if (evento.target.closest('[data-modal-abrir]')) {
      evento.preventDefault();
      abrir();
    } else if (evento.target.closest('[data-modal-fechar]')) {
      fechar();
    }
  });

  document.addEventListener('keydown', function (evento) {
    if (modal.hidden) return;
    if (evento.key === 'Escape') fechar();
    if (evento.key === 'Tab') prenderFoco(evento);
  });

  /* Enquanto o modal está aberto o Tab não sai da caixa. */
  function prenderFoco(evento) {
    var focaveis = caixa.querySelectorAll(
      'a[href], button:not([disabled]), input:not([type="hidden"]), textarea, select'
    );
    var visiveis = [];
    for (var i = 0; i < focaveis.length; i++) {
      if (focaveis[i].offsetParent !== null) visiveis.push(focaveis[i]);
    }
    if (!visiveis.length) return;

    var primeiro = visiveis[0];
    var ultimo = visiveis[visiveis.length - 1];

    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  }
});
