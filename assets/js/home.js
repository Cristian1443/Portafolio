/**
 * Lógica de index.html: proyectos (render + filtros + video), testimonios,
 * blog, contador de resultados y formulario de contacto.
 * Depende de portfolio-data.js y blog-data.js.
 */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function chips(list, max) {
    return '<ul class="chips">' + list.slice(0, max).map(function (t) {
      return "<li>" + esc(t) + "</li>";
    }).join("") + "</ul>";
  }


  /* ---------- Hero: foco que sigue al cursor (resorte suave, solo transform) ---------- */
  const hero = document.getElementById("hero");
  const spot = document.querySelector(".hero-spot");

  if (hero && spot && finePointer.matches && !reduceMotion.matches) {
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;

    function follow() {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      spot.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      raf = (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) ? requestAnimationFrame(follow) : 0;
    }

    hero.addEventListener("pointermove", function (e) {
      const r = hero.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!spot.classList.contains("on")) {
        x = tx; y = ty; // la primera vez aparece donde está el cursor, sin viajar desde la esquina
        spot.classList.add("on");
      }
      if (!raf) raf = requestAnimationFrame(follow);
    });
    hero.addEventListener("pointerleave", function () { spot.classList.remove("on"); });
  }

  /* ---------- Hero: las fotos cambian con un fundido lento, cada 5.6 s ---------- */
  const heroPhotos = document.querySelectorAll(".hero-photo img");

  if (heroPhotos.length > 1 && !reduceMotion.matches) {
    let shown = 0;
    setInterval(function () {
      if (document.hidden) return;
      heroPhotos[shown].classList.remove("is-on");
      shown = (shown + 1) % heroPhotos.length;
      heroPhotos[shown].classList.add("is-on");
    }, 5600);
  }

  /* ---------- Hero: palabra que cambia cada 2.8 s ---------- */
  const swap = document.querySelector("[data-swap]");

  if (swap && swap.children.length > 1) {
    const words = Array.prototype.slice.call(swap.children);
    let index = 0;

    words.forEach(function (w, i) { w.setAttribute("aria-hidden", String(i !== 0)); });

    if (!reduceMotion.matches) {
      setInterval(function () {
        if (document.hidden) return;
        const leaving = words[index];
        index = (index + 1) % words.length;
        const entering = words[index];

        leaving.classList.remove("is-active");
        leaving.classList.add("is-out");
        leaving.setAttribute("aria-hidden", "true");
        entering.classList.remove("is-out");
        entering.classList.add("is-active");
        entering.setAttribute("aria-hidden", "false");

        setTimeout(function () { leaving.classList.remove("is-out"); }, 420);
      }, 2800);
    }
  }

  /* ---------- Franja de tecnologías: se duplica la lista para el bucle continuo ---------- */
  const marqueeTrack = document.querySelector(".marquee-track");

  if (marqueeTrack && marqueeTrack.firstElementChild) {
    const clone = marqueeTrack.firstElementChild.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    marqueeTrack.appendChild(clone);
  }

  /* ---------- Tarjetas: el brillo sigue al cursor ----------
     Solo se escribe --mx/--my en la tarjeta que está bajo el puntero. */
  if (finePointer.matches && !reduceMotion.matches) {
    let pending = null;
    let frame = 0;

    document.addEventListener("pointermove", function (e) {
      const card = e.target.closest && e.target.closest(".case-card, .project-card, .service-item, .skill-card");
      if (!card) return;
      pending = { card: card, x: e.clientX, y: e.clientY };
      if (frame) return;
      frame = requestAnimationFrame(function () {
        const r = pending.card.getBoundingClientRect();
        pending.card.style.setProperty("--mx", (pending.x - r.left) + "px");
        pending.card.style.setProperty("--my", (pending.y - r.top) + "px");
        frame = 0;
      });
    }, { passive: true });
  }

  /* ---------- Proyectos ---------- */
  const ids = Object.keys(portfolioData).map(Number);
  const current = ids.filter(function (id) { return portfolioData[id].group === "actual"; });
  const archive = ids.filter(function (id) { return portfolioData[id].group === "archivo"; });

  function caseCard(id) {
    const p = portfolioData[id];
    return '<article class="case-card">' +
      '<div class="case-head"><span class="case-icon" aria-hidden="true"><i class="bi ' + esc(p.icon) + '"></i></span>' +
      '<span class="case-org"><strong>' + esc(p.client) + "</strong>" + esc(p.category) + " · " + esc(p.period) + "</span></div>" +
      '<h4><a class="stretched-link" href="portfolio-details.html?id=' + id + '">' + esc(p.title) + "</a></h4>" +
      "<p>" + esc(p.summary) + "</p>" +
      chips(p.technologies, 4) +
      '<span class="case-cta">Ver el caso <i class="bi bi-arrow-right" aria-hidden="true"></i></span>' +
      "</article>";
  }

  function projectCard(id) {
    const p = portfolioData[id];
    return '<article class="project-card" data-kind="' + esc(p.kind) + '">' +
      '<div class="project-media"><video data-src="' + esc(p.video) + '" muted loop playsinline preload="none" tabindex="-1" aria-hidden="true"></video></div>' +
      '<div class="project-body">' +
      '<p class="project-kicker">' + esc(p.category) + "</p>" +
      '<h4><a class="stretched-link" href="portfolio-details.html?id=' + id + '">' + esc(p.title) + "</a></h4>" +
      '<p class="project-summary">' + esc(p.summary) + "</p>" +
      chips(p.technologies, 3) +
      "</div></article>";
  }

  const caseGrid = document.getElementById("case-grid");
  const projectGrid = document.getElementById("project-grid");
  const filterBar = document.getElementById("project-filters");
  const filterStatus = document.getElementById("filter-status");

  if (caseGrid) {
    caseGrid.innerHTML = current.map(caseCard).join("");
    caseGrid.setAttribute("data-reveal-group", "");
  }

  if (projectGrid && filterBar) {
    projectGrid.innerHTML = archive.map(projectCard).join("");
    projectGrid.setAttribute("data-reveal-group", "");

    filterBar.innerHTML = portfolioFilters.map(function (f, i) {
      return '<button type="button" class="filter-chip" data-filter="' + f.key + '" aria-pressed="' + (i === 0) + '">' + esc(f.label) + "</button>";
    }).join("");

    filterBar.addEventListener("click", function (e) {
      const btn = e.target.closest(".filter-chip");
      if (!btn) return;
      filterBar.querySelectorAll(".filter-chip").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      applyFilter(btn.dataset.filter);
    });

    // Las tarjetas que vuelven a aparecer entran con un fundido corto (200 ms, ease-out)
    function applyFilter(key) {
      let shown = 0;
      Array.prototype.forEach.call(projectGrid.children, function (card) {
        const match = key === "*" || card.dataset.kind === key;
        const wasHidden = card.hidden;
        card.hidden = !match;
        if (match) {
          shown += 1;
          if (wasHidden && !reduceMotion.matches && card.animate) {
            card.animate(
              [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
              { duration: 220, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
            );
          }
        }
      });
      filterStatus.textContent = "Mostrando " + shown + (shown === 1 ? " proyecto" : " proyectos");
    }

    /* Video: no se descarga nada hasta que la tarjeta está cerca de la pantalla,
       y solo se reproduce con el puntero encima (o con foco de teclado).
       En táctil y con movimiento reducido queda el primer fotograma. */
    const videos = projectGrid.querySelectorAll("video");

    function loadVideo(video) {
      if (video.dataset.loaded) return;
      video.dataset.loaded = "1";
      video.preload = "metadata";
      video.src = video.dataset.src + "#t=0.1"; // #t fuerza a mostrar un fotograma
    }

    if ("IntersectionObserver" in window) {
      const lazy = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          loadVideo(entry.target);
          observer.unobserve(entry.target);
        });
      }, { rootMargin: "300px 0px" });
      videos.forEach(function (v) { lazy.observe(v); });
    }

    if (finePointer.matches && !reduceMotion.matches) {
      projectGrid.querySelectorAll(".project-card").forEach(function (card) {
        const video = card.querySelector("video");
        const play = function () { loadVideo(video); video.play().catch(function () {}); };
        const stop = function () { video.pause(); };
        card.addEventListener("pointerenter", play);
        card.addEventListener("pointerleave", stop);
        card.addEventListener("focusin", play);
        card.addEventListener("focusout", stop);
      });
    }
  }

  if (window.initReveal) {
    window.initReveal(document.getElementById("portfolio"));
  }

  /* ---------- Resultados: cuenta hasta el valor, una vez ---------- */
  const counters = document.querySelectorAll("[data-count]");

  function countUp(el) {
    const end = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion.matches || !el.animate) {
      el.textContent = end + suffix;
      return;
    }
    const start = performance.now();
    const duration = 900;
    (function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4); // ease-out
      el.textContent = Math.round(end * eased) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    })(start);
  }

  if (counters.length && "IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------- Testimonios: carrusel con scroll-snap (sin autoplay) ---------- */
  const track = document.querySelector(".t-track");

  if (track) {
    const slides = Array.prototype.slice.call(track.children);
    const dotsWrap = document.querySelector(".t-dots");
    const gap = 24;
    let active = 0;

    const dots = slides.map(function (_slide, i) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "t-dot";
      dot.setAttribute("aria-label", "Testimonio " + (i + 1) + " de " + slides.length);
      dot.addEventListener("click", function () { go(i); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function go(i) {
      const n = (i + slides.length) % slides.length;
      track.scrollTo({ left: n * (track.clientWidth + gap), behavior: reduceMotion.matches ? "auto" : "smooth" });
    }

    function sync() {
      active = Math.round(track.scrollLeft / (track.clientWidth + gap));
      dots.forEach(function (d, i) {
        if (i === active) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
    }

    let syncing = false;
    track.addEventListener("scroll", function () {
      if (syncing) return;
      syncing = true;
      requestAnimationFrame(function () { sync(); syncing = false; });
    }, { passive: true });

    document.querySelector(".t-prev").addEventListener("click", function () { go(active - 1); });
    document.querySelector(".t-next").addEventListener("click", function () { go(active + 1); });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
    });
    sync();
  }

  /* ---------- Blog: lectura en <dialog> ---------- */
  const dialog = document.getElementById("blog-dialog");

  if (dialog && typeof dialog.showModal === "function") {
    const titleEl = document.getElementById("blog-dialog-title");
    const metaEl = document.getElementById("blog-dialog-meta");
    const bodyEl = document.getElementById("blog-dialog-body");
    let lastTrigger = null;

    document.querySelectorAll("[data-post]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const post = blogPosts[btn.dataset.post];
        if (!post) return;
        titleEl.textContent = post.title;
        metaEl.textContent = post.meta;
        bodyEl.innerHTML = post.content;
        bodyEl.scrollTop = 0;
        lastTrigger = btn;
        document.body.classList.add("dialog-open");
        dialog.showModal();
      });
    });

    // Se libera el scroll y se devuelve el foco en el mismo instante en que se pide cerrar,
    // sin esperar al evento "close" (que llega cuando termina la transición de salida).
    function release() {
      document.body.classList.remove("dialog-open");
      if (lastTrigger) {
        lastTrigger.focus({ preventScroll: true });
        lastTrigger = null;
      }
    }

    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) { release(); dialog.close(); }
    });
    dialog.querySelector(".blog-dialog-close").addEventListener("click", function () { release(); dialog.close(); });
    dialog.addEventListener("cancel", release); // Esc
    dialog.addEventListener("close", release);
  }

  /* ---------- Cómo trabajo: el modo sin conexión, en vivo ---------- */
  const netSwitch = document.getElementById("net-switch");
  const saleBtn = document.getElementById("sale-btn");
  const salesList = document.getElementById("sales");

  if (netSwitch && saleBtn && salesList) {
    const netLabel = document.getElementById("net-label");
    const salesEmpty = document.getElementById("sales-empty");
    const salesStatus = document.getElementById("sales-status");
    let online = false;
    let count = 0;
    let syncTimers = [];

    // La escena 3D de la portada refleja este mismo estado en la pantalla del teléfono
    function emitState() {
      const rows = Array.prototype.map.call(salesList.children, function (li) {
        return li.dataset.state === "synced" ? "s" : "p";
      });
      window.dispatchEvent(new CustomEvent("demo-state", { detail: { online: online, rows: rows } }));
    }

    function updateStatus() {
      emitState();
      const pending = salesList.querySelectorAll('li[data-state="pending"]').length;
      const synced = salesList.querySelectorAll('li[data-state="synced"]').length;
      salesStatus.textContent = pending + (pending === 1 ? " pendiente" : " pendientes") +
        (synced ? " · " + synced + (synced === 1 ? " sincronizada" : " sincronizadas") : "");
    }

    function setState(li, state) {
      li.dataset.state = state;
      li.querySelector(".val").textContent = state === "pending" ? "pendiente" : "sincronizada";
    }

    function addSale() {
      count += 1;
      const time = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
      const li = document.createElement("li");
      li.className = "is-new";
      li.innerHTML = '<span class="what">Venta ' + count + " · " + time + '</span><span class="dots" aria-hidden="true"></span><span class="val"></span>';
      salesList.appendChild(li);
      setState(li, "pending");
      salesEmpty.hidden = true;

      // Se conservan las últimas seis para que el comprobante no crezca sin fin
      while (salesList.children.length > 6) salesList.removeChild(salesList.firstElementChild);

      if (online) {
        syncTimers.push(setTimeout(function () { setState(li, "synced"); updateStatus(); }, 600));
      }
      updateStatus();
    }

    function setOnline(next) {
      online = next;
      netSwitch.setAttribute("aria-checked", String(online));
      netLabel.textContent = online ? "Internet encendido" : "Internet apagado";
      emitState();

      if (online) {
        // Los pendientes se sincronizan uno tras otro, como papel que sale de la impresora
        const pending = Array.prototype.slice.call(salesList.querySelectorAll('li[data-state="pending"]'));
        pending.forEach(function (li, i) {
          syncTimers.push(setTimeout(function () { setState(li, "synced"); updateStatus(); }, 450 + i * 420));
        });
      } else {
        syncTimers.forEach(clearTimeout);
        syncTimers = [];
      }
    }

    netSwitch.addEventListener("click", function () { setOnline(!online); });
    saleBtn.addEventListener("click", addSale);
  }

  /* ---------- Experiencia: acordeón (los dos empleos actuales vienen abiertos) ---------- */
  document.querySelectorAll(".resume-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const item = btn.closest(".resume-item");
      const open = item.dataset.open !== "true";
      item.dataset.open = String(open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  /* ---------- Contacto: el formulario abre el correo con el mensaje listo ----------
     El sitio es estático (no hay servidor que reciba formularios), así que se arma
     un mailto: en lugar de un envío que fallaría en silencio. */
  const form = document.getElementById("contact-form");

  if (form) {
    const status = document.getElementById("form-status");
    const TO = "cr59828@gmail.com";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const data = new FormData(form);
      const subject = (data.get("subject") || "").toString().trim() || "Contacto desde el portafolio";
      const text = data.get("message") + "\n\n" + data.get("name") + " · " + data.get("email");
      window.location.href = "mailto:" + TO + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
      status.textContent = "Se abrió tu aplicación de correo con el mensaje listo. Si no pasó nada, escríbeme a " + TO + " o por WhatsApp.";
    });
  }
})();
