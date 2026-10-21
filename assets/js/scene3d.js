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

  // Piezas flotantes
  const palette = [0x0a6cff, 0x5b9dff, 0xf4f5f7, 0x1d2432, 0x7fb3ff, 0x0a58ca];
  const shapes = [
    function () { return new THREE.IcosahedronGeometry(0.24, 0); },
    function () { return new THREE.OctahedronGeometry(0.28, 0); },
    function () { return new THREE.TorusGeometry(0.22, 0.08, 16, 36); },
    function () { return new THREE.BoxGeometry(0.34, 0.34, 0.34); },
    function () { return new THREE.CylinderGeometry(0.24, 0.24, 0.08, 32); },
    function () { return new THREE.TorusKnotGeometry(0.17, 0.06, 80, 10); },
    function () { return new THREE.DodecahedronGeometry(0.25, 0); }
  ];
  const TOKEN_COUNT = 12;
  const tokens = [];
  for (let i = 0; i < TOKEN_COUNT; i += 1) {
    const mesh = new THREE.Mesh(
      shapes[i % shapes.length](),
      new THREE.MeshStandardMaterial({ color: palette[i % palette.length], roughness: 0.28, metalness: 0.25, flatShading: i % 3 === 0 })
    );
    world.add(mesh);
    tokens.push({
      mesh: mesh,
      angle: (i / TOKEN_COUNT) * Math.PI * 2 + 0.4,
      ring: 0.9 + (i % 4) * 0.16,
      depth: -1.2 + (i % 5) * 0.75,
      spin: 0.25 + (i % 5) * 0.12,
      phase: i * 1.7,
      scale: 0.7 + (i % 4) * 0.22,
      lane: i % 2 === 0 ? -1 : 1,
      laneJitter: 0.012 + (i % 3) * 0.012,
      lap: 0.55 + (i % 5) * 0.16,
      offset: (i * 0.173) % 1,
      lastScroll: 0
    });
  }

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
          A.slots.push({ cy: r.cy, left: r.left - 105, right: r.right + 105 });
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

    /* ---- Teléfono: sale de la portada, gira una vuelta y aterriza bajo la demostración ---- */
    const phoneHeroX = H.cx - H.w * (isNarrow ? 0.3 : 0.46);
    const phoneHeroY = H.cy + H.h * (isNarrow ? 0.24 : 0.2);
    const phoneHeroH = isNarrow ? clamp(H.h * 0.46, 150, 230) : clamp(H.h * 0.6, 260, 520);
    let phoneX = phoneHeroX;
    let phoneY = phoneHeroY - sy;
    let phoneH = phoneHeroH;
    let phoneRY = 0.45 + mouse.x * 0.35;
    let phoneRX = -0.12 + mouse.y * 0.18;
    let phoneRZ = 0.08;
    let phoneZ = 1.2;
    let phoneShow = true;

    if (A.stage) {
      const end = Math.max(A.stage.cy - vh * 0.5, 400);
      const q = smooth(clamp(sy / end, 0, 1));
      phoneX = lerp(phoneHeroX, A.stage.cx, q) + Math.sin(q * Math.PI) * vw * 0.05;
      phoneY = lerp(phoneHeroY, A.stage.cy, q) - sy;
      phoneH = lerp(phoneHeroH, A.stage.h, q);
      phoneRY = lerp(0.45, -0.32, q) + q * Math.PI * 2 + mouse.x * 0.2 * q + mouse.x * 0.35 * (1 - q);
      phoneRX = lerp(-0.12, 0.08, q) + mouse.y * 0.14;
      phoneRZ = lerp(0.08, -0.05, q);
      phoneZ = lerp(1.2, 0.3, q);
      phoneShow = phoneY > -vh * 0.7 && phoneY < vh * 1.7;
    } else {
      phoneShow = leave < 0.98;
      phoneH *= 1 - leave;
    }
    setPose(
      phone,
      wxp(phoneX),
      wyp(phoneY) + Math.sin(t * 0.9) * 0.08,
      phoneZ,
      pxToWorld(phoneH) / PHONE_H,
      phoneShow
    );
    phone.rotation.set(phoneRX + Math.sin(t * 0.7) * 0.03, phoneRY, phoneRZ);

    /* ---- Comprobante: sale de la portada y aterriza sobre el comprobante de la página ---- */
    const slipHeroX = H.cx + H.w * (isNarrow ? 0.37 : 0.5);
    const slipHeroY = H.cy - H.h * (isNarrow ? 0.16 : 0.12);
    const slipHeroH = isNarrow ? clamp(H.h * 0.42, 130, 200) : clamp(H.h * 0.54, 230, 500);
    let slipX = slipHeroX;
    let slipY = slipHeroY - sy;
    let slipPx = slipHeroH;
    let slipRY = -0.4 + mouse.x * 0.3;
    let slipRX = 0.05 + mouse.y * 0.12;
    let slipRZ = -0.1;
    let slipOpacity = 1;
    let wave = 1;
    let slipShow = true;

    if (A.slip) {
      const end = Math.max(A.slip.cy - vh * 0.5, 400);
      const q = smooth(clamp(sy / end, 0, 1));
      slipX = lerp(slipHeroX, A.slip.cx, q);
      slipY = lerp(slipHeroY, A.slip.cy, q) - sy;
      slipPx = lerp(slipHeroH, A.slip.h * 0.94, q);
      slipRY = lerp(-0.4, 0, q) + mouse.x * 0.3 * (1 - q) + q * Math.PI * 2;
      slipRX = lerp(0.05, 0, q) + mouse.y * 0.12 * (1 - q);
      slipRZ = lerp(-0.1, 0, q);
      wave = 1 - q;
      slipOpacity = 1 - smooth(clamp((q - 0.82) / 0.18, 0, 1));
      slipShow = slipOpacity > 0.01 && slipY > -vh && slipY < vh * 2;
    } else {
      slipShow = leave < 0.98;
      slipPx *= 1 - leave;
    }
    slipMat.opacity = slipOpacity;
    setPose(
      slip,
      wxp(slipX),
      wyp(slipY) + Math.cos(t * 0.8) * 0.1 * wave,
      lerp(0.6, 0, leave),
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

    /* ---- Piezas: giran alrededor de la foto y luego se posan junto a los títulos de sección ---- */
    const slots = A.slots;
    const heroScale = 1 - leave;
    tokens.forEach(function (tk, i) {
      // pose en la portada
      const a = tk.angle + t * 0.12 * (i % 2 ? -1 : 1);
      const hx = H.cx + Math.cos(a) * H.w * (isNarrow ? 0.5 : 0.62) * tk.ring;
      const hy = H.cy + Math.sin(a) * H.h * (isNarrow ? 0.44 : 0.56) * tk.ring - sy;

      // pose junto a un título de sección
      let dx = 0;
      let dy = 0;
      let dockScale = 0;
      if (slots.length) {
        const slot = slots[(i * 5 + Math.floor(i / 2)) % slots.length];
        const vy = slot.cy - sy; // posición vertical del título en el viewport
        const near = 1 - clamp(Math.abs(vy - vh * 0.5) / (vh * 0.8), 0, 1);
        dockScale = smooth(near);
        const side = tk.lane < 0 ? slot.left : slot.right;
        const par = ((vy - vh * 0.5) / vh) * tk.lap * 90; // paralaje: cada pieza a su ritmo
        dx = side + (tk.lane < 0 ? -1 : 1) * tk.laneJitter * 900;
        dy = vy + par + Math.sin(i * 2.1) * 34;
      }

      const useHero = heroScale >= dockScale;
      const px = useHero ? hx : dx;
      const py = useHero ? hy : dy;
      // en pantallas estrechas solo se muestra la mitad de las piezas y más pequeñas
      const sc = tk.scale * Math.max(heroScale, dockScale) * (isNarrow ? 0.7 : 1);
      setPose(
        tk.mesh,
        wxp(px) + Math.sin(t * 0.6 + tk.phase) * 0.06,
        wyp(py) + Math.cos(t * 0.5 + tk.phase) * 0.08,
        useHero ? tk.depth : tk.depth * 0.4,
        sc,
        !(isNarrow && i % 2)
      );
      tk.mesh.rotation.x += 0.004 * tk.spin;
      tk.mesh.rotation.y += 0.006 * tk.spin + (sy - tk.lastScroll) * 0.002;
      tk.lastScroll = sy;
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
