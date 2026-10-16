/**
 * Comportamiento compartido por todas las páginas:
 * estado del header, menú móvil, scrollspy, botón de subir y revelado al hacer scroll.
 * Sin dependencias.
 */
(function () {
  "use strict";

  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Header y botón "subir" (un solo listener, throttled con rAF) ---------- */
  const scrollTopBtn = document.querySelector(".scroll-top");
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      const y = window.scrollY;
      body.classList.toggle("scrolled", y > 40);
      if (scrollTopBtn) scrollTopBtn.classList.toggle("active", y > 480);
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
    });
  }

  /* ---------- Menú móvil ---------- */
  const toggle = document.querySelector(".mobile-nav-toggle");
  const navmenu = document.getElementById("navmenu");

  function setNav(open) {
    body.classList.toggle("mobile-nav-active", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    toggle.firstElementChild.className = open ? "bi bi-x-lg" : "bi bi-list";
  }

  if (toggle && navmenu) {
    toggle.addEventListener("click", function () {
      setNav(!body.classList.contains("mobile-nav-active"));
    });

    // Un toque en un enlace o en el velo cierra el menú
    navmenu.addEventListener("click", function (e) {
      if (e.target === navmenu || e.target.closest("a")) setNav(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("mobile-nav-active")) {
        setNav(false);
        toggle.focus();
      }
    });

    window.matchMedia("(min-width: 1200px)").addEventListener("change", function (e) {
      if (e.matches) setNav(false);
    });
  }

  /* ---------- Scrollspy ---------- */
  const navLinks = Array.prototype.slice.call(document.querySelectorAll('.navmenu a[href^="#"]'));

  if (navLinks.length && "IntersectionObserver" in window) {
    const byId = new Map(navLinks.map(function (a) { return [a.getAttribute("href").slice(1), a]; }));

    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.remove("active");
          a.removeAttribute("aria-current");
        });
        const link = byId.get(entry.target.id);
        if (link) {
          link.classList.add("active");
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    byId.forEach(function (_link, id) {
      const section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  /* ---------- Revelado al hacer scroll ----------
     Cada elemento con [data-reveal] entra una vez (opacity + translateY).
     Al terminar se le quita el atributo, así no arrastra transition-delay
     a sus transiciones de hover o de pulsación. */
  const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          observer.unobserve(el);
          el.classList.add("is-visible");
          const delay = parseFloat(el.style.getPropertyValue("--reveal-delay")) || 0;
          setTimeout(function () {
            el.removeAttribute("data-reveal");
            el.classList.remove("is-visible");
            el.style.removeProperty("--reveal-delay");
          }, delay + 540);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 })
    : null;

  function initReveal(root) {
    const scope = root || document;

    // Los hijos de un grupo entran escalonados (60 ms, máximo 6 pasos)
    scope.querySelectorAll("[data-reveal-group]").forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.setAttribute("data-reveal", "");
        child.style.setProperty("--reveal-delay", Math.min(i, 6) * 60 + "ms");
      });
      group.removeAttribute("data-reveal-group");
    });

    scope.querySelectorAll("[data-reveal]").forEach(function (el) {
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add("is-visible");
    });
  }

  window.initReveal = initReveal;
  initReveal(document);
})();
