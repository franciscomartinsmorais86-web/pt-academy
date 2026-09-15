/* Página "Contactos". O formulário está aberto na página em vez de
   dentro de um modal, portanto só há que ligá-lo — a validação e o envio
   vivem no formulario.js, partilhados com o modal da homepage. */

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('form-contacto');
  if (!form) return;

  ligarFormulario(form, document.querySelector('[data-sucesso]'));
});
