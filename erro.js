/* Página 404: o botão "Voltar" leva à página de onde se veio.

   Se não houver página anterior (o link foi aberto num separador novo,
   ou escrito à mão), o histórico só tem esta página e o botão segue o
   href, que é a homepage. */
document.addEventListener('click', function (evento) {
  var link = evento.target.closest('[data-voltar]');
  if (!link || window.history.length < 2) return;
  evento.preventDefault();
  window.history.back();
});
