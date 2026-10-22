/**
 * Escena 3D de la portada (three.js, alojado en assets/vendor/three).
 *
 * Un teléfono con la app de ventas, el comprobante térmico y piezas flotantes rodean
 * la foto de la portada. Al hacer scroll, las piezas se sueltan de la portada y viajan
 * por los márgenes de la página con paralaje y giro; el cursor las inclina.
 *
 * Es decorativo (aria-hidden, pointer-events: none): si WebGL no existe, si el
 * visitante pidió menos movimiento o si el equipo va justo, la página sigue igual.
 */
import * as THREE from "../vendor/three/three.module.min.js";

(function () {
  "use strict";

  const canvas = document.getElementById("scene3d");
  if (!canvas) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function hasWebGL() {
    try {
      const probe = document.createElement("canvas");
      return !!(probe.getContext("webgl2") || probe.getContext("webgl"));
    } catch (e) {
      return false;
    }
  }

  if (!hasWebGL()) return;

  /* ------------------------------------------------------------ utilidades */
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);

  /* ------------------------------------------------------------ renderer y cámara */
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const FOV = 32;
  const DIST = 12;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);
  camera.position.set(0, 0, DIST);

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(3, 5, 7);
  scene.add(key);
  const rim = new THREE.PointLight(0x3a86ff, 90, 0, 2);
  rim.position.set(-5, -2, 5);
  scene.add(rim);

  let vw = 1;
  let vh = 1;
  let visH = 1; // alto visible del mundo en z = 0
  let visW = 1;
  let isNarrow = false;
  let pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);

  /* ------------------------------------------------------------ texturas dibujadas */
  function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

  // Pantalla del teléfono: la demostración de "vender sin internet"
  const screenCanvas = makeCanvas(512, 1024);
  const screenCtx = screenCanvas.getContext("2d");
  const screenTex = new THREE.CanvasTexture(screenCanvas);
  screenTex.colorSpace = THREE.SRGBColorSpace;

  const screenStates = [
    { online: false, rows: [] },
    { online: false, rows: ["p"] },
    { online: false, rows: ["p", "p"] },
    { online: false, rows: ["p", "p", "p"] },
    { online: true, rows: ["s", "p", "p"] },
    { online: true, rows: ["s", "s", "p"] },
    { online: true, rows: ["s", "s", "s"] }
  ];

  function drawScreen(state) {
    const ctx = screenCtx;
    ctx.clearRect(0, 0, 512, 1024);
    ctx.save();
    roundRect(ctx, 0, 0, 512, 1024, 64);
    ctx.clip();
    ctx.fillStyle = "#0b0e14";
    ctx.fillRect(0, 0, 512, 1024);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 42px " + FONT;
    ctx.fillText("Venta de campo", 40, 120);

    // estado de la conexión
    const chipColor = state.online ? "#16a34a" : "#b45309";
    roundRect(ctx, 40, 156, state.online ? 250 : 270, 56, 28);
    ctx.fillStyle = chipColor;
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 28px " + FONT;
    ctx.fillText(state.online ? "Con conexión" : "Sin conexión", 64, 195);

    // filas de ventas
    for (let i = 0; i < 3; i += 1) {
      const y = 270 + i * 120;
      roundRect(ctx, 40, y, 432, 96, 22);
      ctx.fillStyle = state.rows[i] ? "#151b27" : "#0f131c";
      ctx.fill();
      if (state.rows[i]) {
        ctx.fillStyle = "#e6ecf8";
        ctx.font = "600 30px " + FONT;
        ctx.fillText("Venta " + (i + 1), 66, y + 58);
        const synced = state.rows[i] === "s";
        ctx.fillStyle = synced ? "#4ade80" : "#fbbf24";
        ctx.font = "600 26px " + FONT;
        const label = synced ? "sincronizada" : "pendiente";
        ctx.fillText(label, 446 - ctx.measureText(label).width, y + 58);
      }
    }

    // botón
    roundRect(ctx, 40, 860, 432, 96, 48);
    ctx.fillStyle = "#0a6cff";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 32px " + FONT;
    const txt = "Registrar venta";
    ctx.fillText(txt, 256 - ctx.measureText(txt).width / 2, 920);
    ctx.restore();
    screenTex.needsUpdate = true;
  }
  drawScreen(screenStates[0]);

  // Comprobante térmico con borde en zigzag
  const slipCanvas = makeCanvas(512, 1400);
  (function drawSlip() {
    const ctx = slipCanvas.getContext("2d");
    ctx.clearRect(0, 0, 512, 1400);
    const teeth = 16;
    const toothW = 512 / teeth;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(512, 0);
    ctx.lineTo(512, 1360);
    for (let i = teeth; i > 0; i -= 1) {
      ctx.lineTo(i * toothW - toothW / 2, 1400);
      ctx.lineTo((i - 1) * toothW, 1360);
    }
    ctx.closePath();
    ctx.fillStyle = "#f4f5f7";
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = "#12161c";
    ctx.font = "700 34px " + FONT;
    ctx.fillText("Comprobante de venta", 36, 84);
    const lines = [
      ["Sin conexión", true],
      ["Guardar el pedido", "SQLite"],
      ["Descontar inventario", "al instante"],
      ["Imprimir comprobante", "Bluetooth"],
      ["Al volver la conexión", true],
      ["Enviar pedidos al ERP", "en segundo plano"],
      ["Traer inventario", "ambos sentidos"],
      ["Ventas de esta sesión", true],
      ["Venta 1", "sincronizada"],
      ["Venta 2", "sincronizada"],
      ["Venta 3", "sincronizada"]
    ];
    let y = 170;
    lines.forEach(function (row) {
      if (row[1] === true) {
        y += 34;
        ctx.font = "700 30px " + FONT;
        ctx.fillStyle = "#12161c";
        ctx.fillText(row[0], 36, y);
        y += 22;
      } else {
        ctx.font = "400 27px " + FONT;
        ctx.fillStyle = "#12161c";
        ctx.fillText(row[0], 36, y + 20);
        const w = ctx.measureText(row[1]).width;
        ctx.fillText(row[1], 476 - w, y + 20);
        ctx.fillStyle = "#9aa1ad";
        const lw = ctx.measureText(row[0]).width;
        for (let x = 36 + lw + 14; x < 476 - w - 14; x += 14) ctx.fillRect(x, y + 16, 3, 3);
        y += 48;
      }
    });
    ctx.fillStyle = "#12161c";
    ctx.fillRect(0, 1190, 512, 76);
    ctx.fillStyle = "#f4f5f7";
    ctx.font = "600 28px " + FONT;
    ctx.fillText("Nada se pierde sin internet", 36, 1238);
    ctx.restore();
  })();
  const slipTex = new THREE.CanvasTexture(slipCanvas);
  slipTex.colorSpace = THREE.SRGBColorSpace;
  slipTex.anisotropy = 4;

  /* ------------------------------------------------------------ objetos */
  const world = new THREE.Group();
  scene.add(world);

  // Teléfono
  const phone = new THREE.Group();
  (function buildPhone() {
    const w = 1.0;
    const h = 2.04;
    const r = 0.17;
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 + r, -h / 2);
    shape.lineTo(w / 2 - r, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    shape.lineTo(w / 2, h / 2 - r);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    shape.lineTo(-w / 2 + r, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    shape.lineTo(-w / 2, -h / 2 + r);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 4, curveSegments: 16 });
    geo.translate(0, 0, -0.05);
    const body = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x1d2432, roughness: 0.32, metalness: 0.55 }));
    phone.add(body);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.92, 1.84),
      new THREE.MeshBasicMaterial({ map: screenTex, transparent: true, toneMapped: false })
    );
    screen.position.z = 0.081;
    phone.add(screen);
  })();
  world.add(phone);

  // Comprobante
  const slipGeo = new THREE.PlaneGeometry(1.05, 2.9, 7, 36);
  const slipBase = Float32Array.from(slipGeo.attributes.position.array);
  const slip = new THREE.Mesh(
    slipGeo,
    new THREE.MeshStandardMaterial({ map: slipTex, transparent: true, opacity: 1, alphaTest: 0.5, roughness: 0.9, metalness: 0, side: THREE.DoubleSide })
  );
  world.add(slip);

  /* Objetos de ingeniería de software: cada sección se acompaña de lo que tiene que ver con ella.
     Todos miden aproximadamente 1 unidad y se escalan igual al posarse. */
  const BLUE = 0x0a6cff;
  const SKY = 0x5b9dff;
  const WHITE = 0xf4f5f7;
  const NAVY = 0x1d2432;
  const std = (color, o) => new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.3, metalness: 0.25 }, o || {}));

  function extrudePoly(points, depth, color) {
    const shape = new THREE.Shape();
    points.forEach(function (pt, i) { if (i) shape.lineTo(pt[0], pt[1]); else shape.moveTo(pt[0], pt[1]); });
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.02, bevelSegments: 3 });
    geo.translate(0, 0, -depth / 2);
    return new THREE.Mesh(geo, std(color, { metalness: 0.35, roughness: 0.28 }));
  }

  // </>  código
  function buildBrackets() {
    const g = new THREE.Group();
    const left = extrudePoly([[0.2, 0.5], [-0.25, 0], [0.2, -0.5], [0.36, -0.36], [0.02, 0], [0.36, 0.36]], 0.16, BLUE);
    left.position.x = -0.62;
    const right = extrudePoly([[-0.2, 0.5], [0.25, 0], [-0.2, -0.5], [-0.36, -0.36], [-0.02, 0], [-0.36, 0.36]], 0.16, SKY);
    right.position.x = 0.62;
    const slash = extrudePoly([[0.09, 0.55], [0.25, 0.55], [-0.09, -0.55], [-0.25, -0.55]], 0.16, WHITE);
    g.add(left, right, slash);
    g.scale.setScalar(0.78);
    return g;
  }

  // base de datos: discos apilados
  function buildDatabase() {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i += 1) {
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.2, 48), std(i === 1 ? SKY : BLUE, { metalness: 0.4 }));
      disc.position.y = (i - 1) * 0.27;
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.385, 0.385, 0.018, 48), std(WHITE, { roughness: 0.4 }));
      rim.position.y = (i - 1) * 0.27 + 0.1;
      g.add(disc, rim);
    }
    return g;
  }

  // nube
  function buildCloud() {
    const g = new THREE.Group();
    [[0, 0.05, 0.3], [-0.32, -0.06, 0.21], [0.33, -0.04, 0.23], [0.1, 0.22, 0.23]].forEach(function (c) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(c[2], 32, 24), std(0xa9cbff, { roughness: 0.5, metalness: 0.08 }));
      m.position.set(c[0], c[1], 0);
      g.add(m);
    });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 40), std(0xa9cbff, { roughness: 0.5, metalness: 0.08 }));
    base.rotation.z = Math.PI / 2;
    base.scale.set(0.5, 1, 0.45);
    base.position.set(0, -0.15, 0);
    g.add(base);
    g.scale.setScalar(0.95);
    return g;
  }

  // historial de git: commits y ramas
  function buildGit() {
    const g = new THREE.Group();
    const nodes = [[0, -0.55], [0, 0], [0, 0.55], [0.5, 0.3]];
    const edges = [[0, 1], [1, 2], [1, 3], [3, 2]];
    const up = new THREE.Vector3(0, 1, 0);
    edges.forEach(function (e) {
      const A = new THREE.Vector3(nodes[e[0]][0], nodes[e[0]][1], 0);
      const B = new THREE.Vector3(nodes[e[1]][0], nodes[e[1]][1], 0);
      const dir = B.clone().sub(A);
      const len = dir.length();
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 12), std(SKY));
      bar.position.copy(A).addScaledVector(dir, 0.5);
      bar.quaternion.setFromUnitVectors(up, dir.normalize());
      g.add(bar);
    });
    nodes.forEach(function (n, i) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), std(i === 3 ? WHITE : BLUE, { metalness: 0.35 }));
      m.position.set(n[0], n[1], 0);
      g.add(m);
    });
    g.position.x = -0.2;
    const wrap = new THREE.Group();
    wrap.add(g);
    return wrap;
  }

  // procesador
  function buildChip() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.72, 0.1), std(0x3a4c6e, { metalness: 0.45 }));
    const die = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.12), std(BLUE, { metalness: 0.4 }));
    die.position.z = 0.03;
    g.add(base, die);
    for (let i = 0; i < 4; i += 1) {
      const o = -0.27 + i * 0.18;
      [[o, 0.44, 0], [o, -0.44, 0]].forEach(function (pp) {
        const pin = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, 0.04), std(WHITE));
        pin.position.set(pp[0], pp[1], 0);
        g.add(pin);
      });
      [[0.44, o], [-0.44, o]].forEach(function (pp) {
        const pin = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.04), std(WHITE));
        pin.position.set(pp[0], pp[1], 0);
        g.add(pin);
      });
    }
    return g;
  }

  // engranaje
  function buildGear() {
    const teeth = 10;
    const rO = 0.5;
    const rI = 0.39;
    const polar = (r, a) => [Math.cos(a) * r, Math.sin(a) * r];
    const da = (Math.PI * 2) / teeth;
    const pts = [];
    for (let i = 0; i < teeth; i += 1) {
      const a = i * da;
      pts.push(polar(rI, a), polar(rO, a + 0.12 * da), polar(rO, a + 0.4 * da), polar(rI, a + 0.52 * da));
    }
    const shape = new THREE.Shape();
    pts.forEach(function (pt, i) { if (i) shape.lineTo(pt[0], pt[1]); else shape.moveTo(pt[0], pt[1]); });
    shape.closePath();
    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.16, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 2 });
    geo.translate(0, 0, -0.07);
    const g = new THREE.Group();
    g.add(new THREE.Mesh(geo, std(SKY, { metalness: 0.55, roughness: 0.28 })));
    return g;
  }

  // terminal con comandos reales de trabajo
  function buildTerminal() {
    const c = makeCanvas(512, 340);
    const ctx = c.getContext("2d");
    roundRect(ctx, 0, 0, 512, 340, 26);
    ctx.fillStyle = "#0b0e14";
    ctx.fill();
    ["#ef4444", "#f59e0b", "#22c55e"].forEach(function (col, i) {
      ctx.beginPath();
      ctx.arc(34 + i * 30, 34, 9, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
    });
    ctx.font = "600 27px Consolas, 'Courier New', monospace";
    const lines = [["$ git push origin main", "#e6ecf8"], ["✓ desplegado", "#4ade80"], ["$ npm run build", "#e6ecf8"], ["✓ listo en 1.2 s", "#4ade80"], ["$ _", "#5b9dff"]];
    lines.forEach(function (ln, i) {
      ctx.fillStyle = ln[1];
      ctx.fillText(ln[0], 34, 100 + i * 46);
    });
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.74, 0.07), std(NAVY, { metalness: 0.5 }));
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 0.7), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
    screen.position.z = 0.04;
    g.add(body, screen);
    return g;
  }

  // contenedores (despliegue)
  function buildContainers() {
    const g = new THREE.Group();
    [[SKY, 0, -0.28, 0], [BLUE, 0.08, 0, 0], [WHITE, -0.07, 0.28, 0]].forEach(function (c) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.24, 0.4), std(c[0], { metalness: 0.3 }));
      box.position.set(c[1], c[2], 0);
      g.add(box);
      for (let i = -3; i <= 3; i += 1) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.42), std(NAVY, { roughness: 0.6, metalness: 0.1 }));
        rib.position.set(c[1] + i * 0.12, c[2], 0);
        g.add(rib);
      }
    });
    return g;
  }

  // avión de papel (enviar)
  function buildPlane() {
    const v = new Float32Array([
      0.65, 0.04, 0, -0.4, 0.34, 0.1, -0.22, 0, -0.14,
      0.65, 0.04, 0, -0.22, 0, -0.14, -0.4, -0.34, 0.1,
      -0.22, 0, -0.14, -0.4, 0.34, 0.1, -0.4, -0.34, 0.1
    ]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(v, 3));
    geo.computeVertexNormals();
    const g = new THREE.Group();
    g.add(new THREE.Mesh(geo, std(WHITE, { roughness: 0.5, metalness: 0.05, side: THREE.DoubleSide })));
    const keel = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.025, 0.02), std(BLUE));
    keel.position.set(0.12, 0.02, -0.07);
    keel.rotation.z = -0.02;
    g.add(keel);
    return g;
  }

  const BUILDERS = {
    brackets: buildBrackets, database: buildDatabase, cloud: buildCloud, git: buildGit, chip: buildChip,
    gear: buildGear, terminal: buildTerminal, containers: buildContainers, plane: buildPlane
  };

  // qué objeto acompaña a cada sección (izquierda, derecha)
  const DOCK = {
    about: ["brackets", "terminal"],
    stats: ["database", "chip"],
    resume: ["git", "terminal"],
    portfolio: ["containers", "cloud"],
    skills: ["chip", "gear"],
    services: ["gear", "cloud"],
    testimonials: ["cloud", "brackets"],
    blog: ["terminal", "plane"],
    contact: ["plane", "cloud"]
  };

  const tokens = [];
  Object.keys(DOCK).forEach(function (sectionId, si) {
    DOCK[sectionId].forEach(function (kind, side) {
      const obj = BUILDERS[kind]();
      obj.visible = false;
      world.add(obj);
      tokens.push({
        mesh: obj,
        section: sectionId,
        lane: side === 0 ? -1 : 1,
        spin: 0.3 + ((si + side) % 4) * 0.12,
        phase: si * 1.9 + side * 0.9,
        lap: 0.6 + ((si * 3 + side) % 5) * 0.2,
      });
    });
  });

  /* ------------------------------------------------------------ diseño: anclas en coordenadas de página */
  const heroEl = document.getElementById("hero");
  const photoEl = document.querySelector(".hero-photo");
  const A = {
    hero: { cx: 0, cy: 0, w: 1, h: 1 },
    stage: null, // hueco bajo los controles de "Vender sin internet", donde aterriza el teléfono
    slip: null, // el comprobante HTML, donde aterriza el comprobante 3D
    slots: [] // costados vacíos junto a los títulos de sección
  };
  let heroBottom = 800;

  // Caja del elemento en coordenadas de página. Se suma offsetLeft/offsetTop para ignorar
  // las transformaciones de las animaciones de entrada (que desplazarían la medida).
  function pageRect(el) {
    let left = 0;
    let top = 0;
    let node = el;
    while (node) {
      left += node.offsetLeft;
      top += node.offsetTop;
      node = node.offsetParent;
    }
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    return { cx: left + w / 2, cy: top + h / 2, w: w, h: h, left: left, right: left + w, top: top, bottom: top + h };
  }

  function measure() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    isNarrow = vw < 992;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.updateProjectionMatrix();
    visH = 2 * Math.tan((FOV * Math.PI) / 360) * DIST;
    visW = visH * camera.aspect;

    if (photoEl) A.hero = pageRect(photoEl);
    heroBottom = heroEl ? heroEl.offsetHeight : vh;

    // Aterrizajes de la sección "Vender sin internet" (solo en pantallas anchas)
    A.stage = null;
    A.slip = null;
    const stageEl = document.querySelector("#offline .phone-stage");
    const slipEl = document.getElementById("slip");
    if (!isNarrow && slipEl) A.slip = pageRect(slipEl);
    if (!isNarrow && stageEl && stageEl.offsetParent) {
      const r = pageRect(stageEl);
      A.stage = { cx: r.cx, cy: r.cy, h: Math.min(r.h, 440) };
    }

    // Costados vacíos junto a cada título de sección
    A.slots = [];
    if (!isNarrow) {
      document.querySelectorAll(".section-title").forEach(function (el) {
        const r = pageRect(el);
        if (r.left > 190) {
          const sec = el.closest("section");
          A.slots.push({ id: sec ? sec.id : "", cy: r.cy, left: r.left - 105, right: r.right + 105 });
        }
      });
    }
  }

  // de píxeles del viewport a coordenadas del mundo
  const wxp = (px) => (px / vw - 0.5) * visW;
  const wyp = (py) => (0.5 - py / vh) * visH;
  const pxToWorld = (px) => (px * visH) / vh;

  /* ------------------------------------------------------------ cursor y scroll */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  if (finePointer && !reduceMotion) {
    window.addEventListener("pointermove", function (e) {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  let scrollY = window.scrollY;
  window.addEventListener("scroll", function () { scrollY = window.scrollY; }, { passive: true });

  /* ------------------------------------------------------------ actualización por cuadro */
  function setPose(obj, x, y, z, s, visible) {
    obj.visible = visible && s > 0.02;
    obj.position.set(x, y, z);
    obj.scale.setScalar(Math.max(s, 0.001));
  }

  const PHONE_H = 2.04;
  const SLIP_H = 2.9;
  const slipMat = slip.material;

  function update(time) {
    const t = reduceMotion ? 0 : time / 1000;
    mouse.x = lerp(mouse.x, mouse.tx, 0.06);
    mouse.y = lerp(mouse.y, mouse.ty, 0.06);

    const sy = scrollY;
    const H = A.hero;

    // 0 en la portada, 1 cuando la portada ya salió de la pantalla
    const leave = smooth(clamp(sy / (heroBottom * 0.8), 0, 1));

    /* ---- Teléfono: vive en la portada y reaparece en "Vender sin internet"; nunca cruza el texto ---- */
    const phoneHeroX = H.cx - H.w * (isNarrow ? 0.3 : 0.5);
    const phoneHeroY = H.cy + H.h * (isNarrow ? 0.24 : 0.22);
    const phoneHeroH = isNarrow ? clamp(H.h * 0.46, 150, 230) : clamp(H.h * 0.5, 240, 460);
    const heroFade = 1 - smooth(clamp(sy / (heroBottom * 0.5), 0, 1));
    let phoneX = phoneHeroX;
    let phoneY = phoneHeroY - sy;
    let phoneH = phoneHeroH * heroFade;
    let phoneRY = 0.45 + mouse.x * 0.35;
    let phoneRX = -0.12 + mouse.y * 0.18;
    let phoneRZ = 0.08;
    let phoneZ = 1.2;

    if (A.stage) {
      const stageVY = A.stage.cy - sy;
      const near = smooth(clamp(1 - Math.abs(stageVY - vh * 0.5) / (vh * 0.62), 0, 1) * 1.6);
      if (near * A.stage.h > phoneH) {
        phoneX = A.stage.cx;
        phoneY = stageVY;
        phoneH = A.stage.h * near;
        phoneRY = -0.32 + (1 - near) * Math.PI * 2 + mouse.x * 0.2;
        phoneRX = 0.08 + mouse.y * 0.14;
        phoneRZ = -0.05;
        phoneZ = 0.3;
      }
    }
    setPose(
      phone,
      wxp(phoneX),
      wyp(phoneY) + Math.sin(t * 0.9) * 0.08,
      phoneZ,
      pxToWorld(phoneH) / PHONE_H,
      true
    );
    phone.rotation.set(phoneRX + Math.sin(t * 0.7) * 0.03, phoneRY, phoneRZ);

    /* ---- Comprobante: entra volando y se posa sobre el comprobante de la página ---- */
    let slipShow = false;
    let slipOpacity = 0;
    let wave = 0;
    let slipX = 0;
    let slipY = 0;
    let slipPx = 1;
    let slipRY = 0;
    let slipRX = 0;
    let slipRZ = 0;
    if (A.slip) {
      const topVY = A.slip.cy - A.slip.h / 2 - sy;
      const q = smooth(clamp((vh * 0.95 - topVY) / (vh * 0.6), 0, 1));
      slipShow = q > 0.004 && q < 0.996;
      slipX = lerp(A.slip.cx + vw * 0.22, A.slip.cx, q);
      slipY = lerp(A.slip.cy - vh * 0.35, A.slip.cy, q) - sy;
      slipPx = A.slip.h * 0.94 * lerp(0.7, 1, q);
      slipRY = lerp(-0.7, 0, q) + (1 - q) * Math.PI;
      slipRX = lerp(0.2, 0, q);
      slipRZ = lerp(-0.2, 0, q);
      wave = 1 - q;
      slipOpacity = smooth(clamp(q / 0.18, 0, 1)) * (1 - smooth(clamp((q - 0.84) / 0.16, 0, 1)));
    }
    slipMat.opacity = slipOpacity;
    setPose(
      slip,
      wxp(slipX),
      wyp(slipY) + Math.cos(t * 0.8) * 0.1 * wave,
      0.6 * wave,
      pxToWorld(slipPx) / SLIP_H,
      slipShow
    );
    slip.rotation.set(slipRX, slipRY, slipRZ);

    // El papel ondula como si saliera de la impresora; al aterrizar queda liso
    const pos = slipGeo.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      const bx = slipBase[i * 3];
      const by = slipBase[i * 3 + 1];
      pos.setZ(i, (Math.sin(by * 1.7 + t * 1.3) * 0.07 + Math.sin(bx * 3 + t) * 0.015 + (by < 0 ? by * by * 0.04 : 0)) * wave);
    }
    pos.needsUpdate = true;
    slipGeo.computeVertexNormals();

    /* ---- Objetos de ingeniería: se posan junto al título de su sección ---- */
    const slotById = {};
    A.slots.forEach(function (sl) { slotById[sl.id] = sl; });
    const size = clamp(vw * 0.085, 100, 170); // alto aproximado en píxeles

    tokens.forEach(function (tk, i) {
      const slot = slotById[tk.section];
      if (!slot) {
        tk.mesh.visible = false;
        return;
      }
      const vy = slot.cy - sy; // posición vertical del título en el viewport
      const near = 1 - clamp(Math.abs(vy - vh * 0.5) / (vh * 0.8), 0, 1);
      const dock = smooth(near);
      const par = ((vy - vh * 0.5) / vh) * tk.lap * 90; // paralaje: cada objeto a su ritmo
      const px = tk.lane < 0 ? slot.left : slot.right;
      const py = vy + par;
      setPose(
        tk.mesh,
        wxp(px) + Math.sin(t * 0.6 + tk.phase) * 0.06,
        wyp(py) + Math.cos(t * 0.5 + tk.phase) * 0.08,
        0.2,
        pxToWorld(size) * dock * (isNarrow ? 0.7 : 1),
        true
      );
      tk.mesh.rotation.set(
        Math.sin(t * 0.4 + tk.phase) * 0.18 + mouse.y * 0.2,
        tk.lane * -0.45 + Math.sin(t * 0.5 + tk.phase) * 0.3 + Math.sin(sy * 0.002 + tk.phase) * 0.35 + mouse.x * 0.3,
        0
      );
    });

    world.rotation.y = mouse.x * 0.05 * (1 - leave);
    world.rotation.x = mouse.y * 0.04 * (1 - leave);
  }

  /* ------------------------------------------------------------ foto de la portada: inclinación 3D con el cursor */
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  if (photoEl && finePointer && !reduceMotion && heroEl) {
    heroEl.addEventListener("pointermove", function (e) {
      const r = heroEl.getBoundingClientRect();
      tilt.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      tilt.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    }, { passive: true });
    heroEl.addEventListener("pointerleave", function () { tilt.tx = 0; tilt.ty = 0; });
  }

  function tiltPhoto() {
    if (!photoEl) return;
    tilt.x = lerp(tilt.x, tilt.tx, 0.08);
    tilt.y = lerp(tilt.y, tilt.ty, 0.08);
    const ry = tilt.x * 9; // grados
    const rx = -tilt.y * 7;
    const angle = Math.sqrt(rx * rx + ry * ry);
    // La propiedad individual "rotate" se suma a la animación de entrada sin pisarla
    photoEl.style.rotate = angle < 0.02 ? "none" : rx.toFixed(3) + " " + ry.toFixed(3) + " 0 " + angle.toFixed(3) + "deg";
  }

  /* ------------------------------------------------------------ pantalla del teléfono: bucle, y espejo de la demostración real */
  let stateIndex = 0;
  let nextState = 0;
  let mirrored = false;

  // home.js avisa cada vez que cambia la demostración "Vender sin internet"
  window.addEventListener("demo-state", function (e) {
    mirrored = true;
    const d = e.detail;
    drawScreen({ online: d.online, rows: d.rows.slice(-3) });
  });

  function stepScreen(time) {
    if (mirrored || time < nextState) return;
    drawScreen(screenStates[stateIndex]);
    nextState = time + (stateIndex === screenStates.length - 1 ? 2600 : 1100);
    stateIndex = (stateIndex + 1) % screenStates.length;
  }

  /* ------------------------------------------------------------ bucle y rendimiento */
  let frames = 0;
  let slowFrames = 0;
  let last = 0;
  let running = false;

  function frame(time) {
    if (!running) return;
    requestAnimationFrame(frame);
    if (document.hidden) return;

    // calidad adaptativa: si el equipo va justo, baja la resolución y quita piezas
    if (last) {
      const dt = time - last;
      frames += 1;
      if (dt > 34) slowFrames += 1;
      if (frames === 90) {
        if (slowFrames > 30 && pixelRatio > 1) {
          pixelRatio = 1;
          measure();
        }
        if (slowFrames > 45) {
          tokens.forEach(function (tk, i) { if (i % 2) tk.mesh.removeFromParent(); });
        }
      }
    }
    last = time;

    stepScreen(time);
    tiltPhoto();
    update(time);
    renderer.render(scene, camera);
  }

  function renderOnce() {
    update(0);
    renderer.render(scene, camera);
  }

  measure();
  canvas.classList.add("is-ready");

  let resizeTimer = 0;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      measure();
      if (reduceMotion) renderOnce();
    }, 120);
  });

  if (reduceMotion) {
    // Escena quieta: un solo cuadro, y otro cuando cambia el scroll
    renderOnce();
    let pending = false;
    window.addEventListener("scroll", function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () { renderOnce(); pending = false; });
    }, { passive: true });
  } else {
    running = true;
    requestAnimationFrame(frame);
  }

  // Si la pestaña se esconde, el bucle ya no dibuja; al volver, sigue donde estaba
  document.addEventListener("visibilitychange", function () { last = 0; });

  // El tamaño de la portada puede cambiar cuando cargan las fuentes y las imágenes
  window.addEventListener("load", measure);
})();
