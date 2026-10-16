/**
 * Lógica de index.html: hoja de contacto, libro de registro con vista previa,
 * demostraciones, comprobante interactivo, lectura de escritos y contacto.
 * Depende de portfolio-data.js y blog-data.js.
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var ids = Object.keys(portfolioData).map(Number);
  var current = ids.filter(function (id) { return portfolioData[id].group === "actual"; });
  var archive = ids.filter(function (id) { return portfolioData[id].group === "archivo"; });

  function href(id) { return "portfolio-details.html?id=" + id; }

  /* ---------- Carga diferida de video ----------
     Nada se descarga hasta estar cerca de la pantalla; #t=0.1 fuerza a mostrar un fotograma. */
  function loadVideo(video) {
    if (video.dataset.loaded) return;
    video.dataset.loaded = "1";
    video.preload = "metadata";
    video.src = video.dataset.src + "#t=0.1";
  }

  var lazyVideos = "IntersectionObserver" in window
    ? new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          loadVideo(entry.target);
          obs.unobserve(entry.target);
        });
      }, { rootMargin: "400px 0px" })
    : null;

  function watchVideo(video) {
    if (lazyVideos) lazyVideos.observe(video);
    else loadVideo(video);
  }

  /* ---------- Hoja de contacto (portada) ---------- */
  var sheet = document.getElementById("sheet");

  if (sheet) {
    var sheetIds = archive.filter(function (id) { return id !== 17; }); // 17 comparte video con 8

    sheet.innerHTML = sheetIds.map(function (id, i) {
      var p = portfolioData[id];
      return '<a class="frame" style="--i:' + i + '" href="' + href(id) + '">' +
        '<span class="t">' + esc(p.title) + "</span>" +
        '<span class="m"><video data-src="' + esc(p.video) + '" muted loop playsinline preload="none" tabindex="-1" aria-hidden="true"></video></span>' +
        "</a>";
    }).join("");

    sheet.querySelectorAll("video").forEach(watchVideo);

    if (finePointer.matches && !reduceMotion.matches) {
      sheet.querySelectorAll(".frame").forEach(function (frame) {
        var v = frame.querySelector("video");
        frame.addEventListener("pointerenter", function () { loadVideo(v); v.play().catch(function () {}); });
        frame.addEventListener("pointerleave", function () { v.pause(); });
        frame.addEventListener("focus", function () { loadVideo(v); v.play().catch(function () {}); });
        frame.addEventListener("blur", function () { v.pause(); });
      });
    }
  }

  /* ---------- Libro de registro con vista previa (movimiento firma) ---------- */
  var ledgerRows = document.getElementById("ledger-rows");
  var ledger = document.getElementById("ledger");
  var frameBox = document.getElementById("ledger-frame");

  if (ledgerRows && ledger && frameBox) {
    function row(id) {
      var p = portfolioData[id];
      return '<a class="ledger-row" href="' + href(id) + '" data-id="' + id + '">' +
        '<span class="name">' + esc(p.title) + "</span>" +
        '<span class="kind"><span>' + esc(p.category) + "</span>" + (p.year ? "<span>" + esc(p.year) + "</span>" : "") + "</span></a>";
    }

    ledgerRows.innerHTML =
      '<p class="ledger-group first">Trabajo actual</p>' + current.map(row).join("") +
      '<p class="ledger-group">Proyectos anteriores</p>' + archive.map(row).join("");

    // Un elemento de vista previa por proyecto: video si hay, tarjeta de texto si no
    var previews = {};
    var videoByUrl = {};

    ids.forEach(function (id) {
      var p = portfolioData[id];
      var el;
      if (p.video) {
        if (!videoByUrl[p.video]) {
          el = document.createElement("video");
          el.muted = true;
          el.loop = true;
          el.playsInline = true;
          el.preload = "none";
          el.dataset.src = p.video;
          el.tabIndex = -1;
          frameBox.appendChild(el);
          videoByUrl[p.video] = el;
        }
        previews[id] = videoByUrl[p.video];
      } else {
        el = document.createElement("div");
        el.className = "ledger-card";
        el.innerHTML = "<span>" + esc(p.client) + "</span><strong>" + esc(p.title) + "</strong><span>" + esc(p.summary) + "</span>";
        frameBox.appendChild(el);
        previews[id] = el;
      }
    });

    var shown = null;

    function show(rowEl) {
      var id = Number(rowEl.dataset.id);
      var el = previews[id];
      if (!el || el === shown) {
        placeFrame(rowEl);
        return;
      }
      Array.prototype.forEach.call(frameBox.children, function (c) {
        c.classList.remove("on");
        if (c.tagName === "VIDEO" && c !== el) c.pause();
      });
      el.classList.add("on");
      if (el.tagName === "VIDEO") {
        loadVideo(el);
        if (!reduceMotion.matches) el.play().catch(function () {});
      }
      shown = el;
      placeFrame(rowEl);
    }

    // La vista previa se alinea con la fila apuntada, sin salirse del libro
    function placeFrame(rowEl) {
      var max = ledger.offsetHeight - frameBox.offsetHeight;
      var y = Math.max(0, Math.min(rowEl.offsetTop, max));
      frameBox.style.transform = "translateY(" + y + "px)";
    }

    // En reposo queda encendida la primera fila: el libro nunca se ve con el costado vacío
    function rest() {
      Array.prototype.forEach.call(frameBox.children, function (c) {
        c.classList.remove("on");
        if (c.tagName === "VIDEO") c.pause();
      });
      shown = null;
      show(ledgerRows.querySelector(".ledger-row"));
    }

    if (finePointer.matches) {
      ledgerRows.addEventListener("pointerover", function (e) {
        var r = e.target.closest(".ledger-row");
        if (r) show(r);
      });
      ledgerRows.addEventListener("focusin", function (e) {
        var r = e.target.closest(".ledger-row");
        if (r) show(r);
      });
      ledger.addEventListener("pointerleave", rest);
      ledgerRows.addEventListener("focusout", rest);
      rest();
    }
  }

  /* ---------- Demostraciones: cada video se mueve solo mientras está a la vista ---------- */
  var gallery = document.getElementById("gallery");

  if (gallery) {
    var galleryIds = [16, 12, 13, 14, 11, 8];

    gallery.innerHTML = galleryIds.map(function (id, i) {
      var p = portfolioData[id];
      return '<figure class="exhibit e' + (i + 1) + '" data-wipe>' +
        '<div class="m"><video data-src="' + esc(p.video) + '" muted loop playsinline preload="none" aria-label="Demostración de ' + esc(p.title) + '"></video></div>' +
        '<figcaption><a href="' + href(id) + '">' + esc(p.title) + "</a> · " + esc(p.category) + "</figcaption></figure>";
    }).join("");

    gallery.querySelectorAll("video").forEach(watchVideo);

    if ("IntersectionObserver" in window && !reduceMotion.matches) {
      var player = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var v = entry.target;
          if (entry.isIntersecting) { loadVideo(v); v.play().catch(function () {}); }
          else v.pause();
        });
      }, { threshold: 0.45 });
      gallery.querySelectorAll("video").forEach(function (v) { player.observe(v); });
    }

    if (window.initReveal) window.initReveal(gallery);
  }

  /* ---------- Comprobante: el modo sin conexión, en vivo ---------- */
  var netSwitch = document.getElementById("net-switch");
  var saleBtn = document.getElementById("sale-btn");
  var salesList = document.getElementById("sales");

  if (netSwitch && saleBtn && salesList) {
    var netLabel = document.getElementById("net-label");
    var salesEmpty = document.getElementById("sales-empty");
    var salesStatus = document.getElementById("sales-status");
    var online = false;
    var count = 0;
    var syncTimers = [];

    function updateStatus() {
      var pending = salesList.querySelectorAll('li[data-state="pending"]').length;
      var synced = salesList.querySelectorAll('li[data-state="synced"]').length;
      salesStatus.textContent = pending + (pending === 1 ? " pendiente" : " pendientes") + (synced ? " · " + synced + (synced === 1 ? " sincronizada" : " sincronizadas") : "");
    }

    function setState(li, state) {
      li.dataset.state = state;
      li.querySelector(".val").textContent = state === "pending" ? "pendiente" : "sincronizada";
    }

    function addSale() {
      count += 1;
      var time = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
      var li = document.createElement("li");
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

      if (online) {
        // Los pendientes se sincronizan uno tras otro, como papel que sale de la impresora
        var pending = Array.prototype.slice.call(salesList.querySelectorAll('li[data-state="pending"]'));
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

  /* ---------- Escritos: lectura en <dialog> ---------- */
  var reader = document.getElementById("reader");

  if (reader && typeof reader.showModal === "function") {
    var titleEl = document.getElementById("reader-title");
    var metaEl = document.getElementById("reader-meta");
    var bodyEl = document.getElementById("reader-body");
    var lastTrigger = null;

    // Se libera el scroll y se devuelve el foco en cuanto se pide cerrar,
    // sin esperar al evento "close" (llega al terminar la transición de salida).
    function release() {
      document.body.classList.remove("dialog-open");
      if (lastTrigger) {
        lastTrigger.focus({ preventScroll: true });
        lastTrigger = null;
      }
    }

    document.querySelectorAll("[data-post]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var post = blogPosts[btn.dataset.post];
        if (!post) return;
        titleEl.textContent = post.title;
        metaEl.textContent = post.meta;
        bodyEl.innerHTML = post.content;
        bodyEl.scrollTop = 0;
        lastTrigger = btn;
        document.body.classList.add("dialog-open");
        reader.showModal();
      });
    });

    reader.addEventListener("click", function (e) {
      if (e.target === reader) { release(); reader.close(); }
    });
    reader.querySelector(".reader-close").addEventListener("click", function () { release(); reader.close(); });
    reader.addEventListener("cancel", release);
    reader.addEventListener("close", release);
  }

  /* ---------- Contacto: abre el correo con el mensaje listo ----------
     El sitio es estático: no hay servidor que reciba formularios. */
  var form = document.getElementById("contact-form");

  if (form) {
    var status = document.getElementById("form-status");
    var TO = "cr59828@gmail.com";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = form.elements.message.value.trim();
      if (!text) return;
      var subject = "Contacto desde el portafolio";
      window.location.href = "mailto:" + TO + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
      status.textContent = "Se abrió tu correo con el mensaje listo. Si no pasó nada, escríbeme a " + TO + " o por WhatsApp.";
    });
  }
})();
