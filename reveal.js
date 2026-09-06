/* Dispara a animação .reveal quando a imagem entra no ecrã.
   Elementos dentro de um [data-reveal-group] entram escalonados,
   pela ordem em que aparecem no HTML. */
var REVEAL_STAGGER = 100;

document.addEventListener('DOMContentLoaded', function () {
  var targets = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-revealed'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var el = entry.target;
      var group = el.closest('[data-reveal-group]');
      var index = group
        ? Array.prototype.indexOf.call(group.querySelectorAll('.reveal'), el)
        : 0;

      el.style.setProperty('--reveal-delay', index * REVEAL_STAGGER + 'ms');
      el.classList.add('is-revealed');
      observer.unobserve(el);
    });
  }, { threshold: 0.2 });

  targets.forEach(function (el) { observer.observe(el); });
});
