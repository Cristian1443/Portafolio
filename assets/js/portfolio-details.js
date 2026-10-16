/**
 * Página de detalle: portfolio-details.html?id=N
 * Construye el caso con los datos de portfolio-data.js (textContent, nunca innerHTML con datos).
 */
(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }

  function el(tag, text) {
    var node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }

  var id = parseInt(new URLSearchParams(window.location.search).get("id"), 10);
  var project = getProjectData(id);

  if (!project) {
    document.title = "Proyecto no encontrado · Cristian Reyes";
    $("project-error").hidden = false;
    return;
  }

  /* Cabecera */
  document.title = project.title + " · Cristian Reyes";
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", project.summary);

  $("project-title").textContent = project.title;
  $("project-lead").textContent = project.summary;

  /* Video (solo si el proyecto tiene) */
  if (project.video) {
    var video = el("video");
    video.controls = true;
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.preload = "metadata";
    video.src = project.video + "#t=0.1";
    video.setAttribute("aria-label", "Demostración de " + project.title);
    $("project-video").appendChild(video);
    $("project-video").hidden = false;

    // El clip se mueve solo mientras está a la vista (si el visitante no pidió menos movimiento)
    if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) video.play().catch(function () {});
          else video.pause();
        });
      }, { threshold: 0.5 }).observe(video);
    }
  }

  /* Texto */
  $("p-desc").textContent = project.description;
  $("p-challenge").textContent = project.challenge;
  $("p-solution").textContent = project.solution;

  var features = $("p-features");
  project.features.forEach(function (f) { features.appendChild(el("li", f)); });

  /* Ficha */
  var facts = $("p-facts");

  function fact(label, value) {
    var row = el("div");
    row.appendChild(el("dt", label));
    var dd = el("dd");
    if (typeof value === "string") dd.textContent = value;
    else dd.appendChild(value);
    row.appendChild(dd);
    facts.appendChild(row);
  }

  function link(href, text, external) {
    var a = el("a", text);
    a.href = href;
    if (external) { a.target = "_blank"; a.rel = "noopener"; }
    return a;
  }

  fact("Cliente u organización", project.client);
  fact("Categoría", project.category);
  if (project.role) fact("Mi rol", project.role);
  if (project.period) fact("Periodo", project.period);
  if (project.access) fact("Acceso", project.access);
  fact("Tecnologías", project.technologies.join(", "));
  if (project.projectUrl) fact("Proyecto", link(project.projectUrl, "Ver proyecto", true));
  if (project.repository) fact("Repositorio", link(project.repository, "Ver código", true));

  if (project.related && project.related.length) {
    var wrap = el("span");
    project.related.forEach(function (rid, i) {
      var rel = getProjectData(rid);
      if (!rel) return;
      if (i) wrap.appendChild(document.createTextNode(" · "));
      wrap.appendChild(link("portfolio-details.html?id=" + rid, rel.title));
    });
    fact("Relacionado", wrap);
  }

  /* Siguiente proyecto: primero los actuales, luego el archivo, en círculo */
  var order = Object.keys(portfolioData).map(Number).sort(function (a, b) {
    var ga = portfolioData[a].group === "actual" ? 0 : 1;
    var gb = portfolioData[b].group === "actual" ? 0 : 1;
    return ga - gb;
  });
  var nextId = order[(order.indexOf(id) + 1) % order.length];
  $("next-project").href = "portfolio-details.html?id=" + nextId;
  $("next-title").textContent = getProjectData(nextId).title;

  $("project").hidden = false;
})();
