/**
 * Comportamiento compartido: estado de la barra y entradas al hacer scroll.
 * Sin dependencias.
 */
(function () {
  "use strict";

  var body = document.body;
  var ticking = false;

  /* El nombre de la barra aparece cuando la banda de la portada sale de la pantalla */
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      body.classList.toggle("scrolled", window.scrollY > 120);
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Entradas: cada elemento con [data-reveal] o [data-wipe] llega una sola vez.
     Los hijos de [data-reveal-group] entran en cascada de 70 ms (máximo 6 pasos). */
  var observer = "IntersectionObserver" in window
    ? new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 })
    : null;

  function initReveal(root) {
    var scope = root || document;

    scope.querySelectorAll("[data-reveal-group]").forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.setAttribute("data-reveal", "");
        child.style.setProperty("--d", Math.min(i, 6) * 70 + "ms");
      });
      group.removeAttribute("data-reveal-group");
    });

    scope.querySelectorAll("[data-reveal], [data-wipe]").forEach(function (el) {
      if (el.classList.contains("is-in")) return;
      if (observer) observer.observe(el);
      else el.classList.add("is-in");
    });
  }

  window.initReveal = initReveal;
  initReveal(document);
})();
