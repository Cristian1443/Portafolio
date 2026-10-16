/**
 * Página de detalle: portfolio-details.html?id=N
 * Construye el caso con los datos de portfolio-data.js (textContent, nunca innerHTML con datos).
 */
(function () {
  "use strict";

  const $ = function (id) { return document.getElementById(id); };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function showError() {
    $("project-error").hidden = false;
  }

  const id = parseInt(new URLSearchParams(window.location.search).get("id"), 10);
  const project = getProjectData(id);

  if (!project) {
    document.title = "Proyecto no encontrado · Cristian Reyes";
    showError();
    return;
  }

  /* Cabecera */
  document.title = project.title + " · Cristian Reyes";
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", project.summary);

  $("project-kicker").textContent = project.category + " · " + project.client;
  $("project-title").textContent = project.title;
  $("project-lead").textContent = project.summary;

  const tech = $("project-tech");
  project.technologies.forEach(function (t) { tech.appendChild(el("li", "", t)); });

  /* Video (solo si el proyecto tiene) — sin autoplay: pesa varios MB */
  if (project.video) {
    const video = el("video");
    video.controls = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = project.video + "#t=0.1";
    video.setAttribute("aria-label", "Demostración de " + project.title);
    $("project-video").appendChild(video);
    $("project-video").hidden = false;
  }

  /* Texto */
  $("p-desc").textContent = project.description;
  $("p-challenge").textContent = project.challenge;
  $("p-solution").textContent = project.solution;

  const features = $("p-features");
  project.features.forEach(function (f) {
    const li = el("li");
    li.appendChild(el("i", "bi bi-check2-circle"));
    li.lastChild.setAttribute("aria-hidden", "true");
    li.appendChild(el("span", "", f));
    features.appendChild(li);
  });

  /* Ficha */
  const facts = $("p-facts");

  function fact(label, value) {
    const row = el("div");
    row.appendChild(el("dt", "", label));
    const dd = el("dd");
    if (typeof value === "string") dd.textContent = value;
    else dd.appendChild(value);
    row.appendChild(dd);
    facts.appendChild(row);
  }

  function link(href, text) {
    const a = el("a", "", text);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    return a;
  }

  fact("Cliente u organización", project.client);
  fact("Categoría", project.category);
  if (project.role) fact("Mi rol", project.role);
  if (project.period) fact("Periodo", project.period);
  if (project.access) fact("Acceso", project.access);
  if (project.projectUrl) fact("Proyecto", link(project.projectUrl, "Ver proyecto"));
  if (project.repository) fact("Repositorio", link(project.repository, "Ver código"));

  if (project.related && project.related.length) {
    const wrap = el("span");
    project.related.forEach(function (rid, i) {
      const rel = getProjectData(rid);
      if (!rel) return;
      if (i) wrap.appendChild(document.createTextNode(" · "));
      const a = el("a", "", rel.title);
      a.href = "portfolio-details.html?id=" + rid;
      wrap.appendChild(a);
    });
    fact("Relacionado", wrap);
  }

  /* Siguiente proyecto: primero los actuales, luego el archivo, en círculo */
  const order = Object.keys(portfolioData).map(Number).sort(function (a, b) {
    const ga = portfolioData[a].group === "actual" ? 0 : 1;
    const gb = portfolioData[b].group === "actual" ? 0 : 1;
    return ga - gb;
  });
  const next = getProjectData(order[(order.indexOf(id) + 1) % order.length]);
  const nextId = order[(order.indexOf(id) + 1) % order.length];
  const nextLink = $("next-project");
  nextLink.href = "portfolio-details.html?id=" + nextId;
  $("next-title").textContent = next.title;

  $("project-hero").hidden = false;
  $("project-detail").hidden = false;
})();
