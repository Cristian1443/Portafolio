/**
 * Fuente única de datos de los proyectos.
 * La usan index.html (tarjetas) y portfolio-details.html (caso completo).
 *
 * kind:  plataforma | movil | web | cloud   (define el filtro de la cuadrícula)
 * group: "actual" (trabajo vigente, va arriba) | "archivo" (el resto)
 * Los campos role, period, access, projectUrl y repository son opcionales:
 * si no existen, simplemente no se muestran.
 */
const portfolioData = {
  // ---------------------------------------------------------------
  // Trabajo actual
  // ---------------------------------------------------------------

  // REVISAR: borrador escrito con lo que declara el CV (stack JavaScript/Node.js,
  // frontend + backend + integraciones). Confirmar alcance real antes de publicar.
  18: {
    group: "actual",
    kind: "plataforma",
    icon: "bi-receipt-cutoff",
    title: "Compras y contratación",
    category: "Plataforma interna",
    client: "Invest in Bogotá",
    period: "2026",
    role: "Desarrollo full stack",
    access: "Uso interno · sin acceso público",
    technologies: ["JavaScript", "Node.js", "Integraciones"],
    summary: "Herramienta interna para organizar y dar seguimiento a los procesos de compras y contratación de la entidad.",
    description: "Plataforma digital de uso interno en Invest in Bogotá para apoyar los procesos de compras y contratación de la entidad. Se desarrolla como parte del trabajo full stack del contrato, desde la interfaz hasta la lógica de servidor.",
    challenge: "Compras y contratación atraviesan varias áreas, documentos y aprobaciones. El reto es darles un único lugar donde cada solicitud tenga un estado claro y cada persona sepa qué sigue.",
    solution: "Desarrollo completo de la herramienta: interfaz web, lógica de negocio en el servidor con Node.js e integración con otros sistemas y herramientas internas de la entidad.",
    features: [
      "Interfaz web para el seguimiento de solicitudes",
      "Backend y lógica de negocio en Node.js",
      "Integración con herramientas internas de la entidad",
      "Acceso restringido al personal de la entidad"
    ],
    related: [19]
  },

  // REVISAR: igual que el anterior; confirmar alcance real.
  19: {
    group: "actual",
    kind: "plataforma",
    icon: "bi-people",
    title: "Gestión humana",
    category: "Plataforma interna",
    client: "Invest in Bogotá",
    period: "2026",
    role: "Desarrollo full stack",
    access: "Uso interno · sin acceso público",
    technologies: ["JavaScript", "Node.js", "Integraciones"],
    summary: "Herramienta interna para ordenar los trámites y la información del área de gestión humana de la entidad.",
    description: "Plataforma digital de uso interno en Invest in Bogotá para apoyar los procesos del área de gestión humana. Hace parte del mismo trabajo full stack del contrato y comparte criterios técnicos con la plataforma de compras y contratación.",
    challenge: "El área de talento humano maneja información sensible y trámites repetitivos entre áreas. El reto es ordenarlos en una sola herramienta sin perder control sobre quién puede ver qué.",
    solution: "Desarrollo de la herramienta de punta a punta: interfaz web, lógica de negocio en Node.js e integración con las demás herramientas internas de la entidad.",
    features: [
      "Interfaz web para los trámites del área",
      "Backend y lógica de negocio en Node.js",
      "Integración con herramientas internas de la entidad",
      "Acceso restringido al personal autorizado"
    ],
    related: [18]
  },

  // REVISAR: el CV describe las apps de ventas de Global Snopek en conjunto
  // (offline-first, sync ERP, impresión Bluetooth/USB). Confirmar cuál hace qué.
  20: {
    group: "actual",
    kind: "movil",
    icon: "bi-phone",
    title: "OPOX",
    category: "App móvil",
    client: "Global Snopek (Argentina)",
    period: "Octubre 2025 – presente",
    role: "Desarrollo móvil con React Native · remoto",
    access: "Uso comercial del cliente · sin acceso público",
    technologies: ["React Native", "SQLite / Realm", "Integración ERP", "Bluetooth / USB"],
    summary: "App móvil de ventas para el equipo en campo, con operación offline y sincronización con el ERP.",
    description: "Aplicación móvil del ecosistema de ventas de Global Snopek, desarrollada en React Native para que el equipo comercial pueda operar en campo, con o sin conexión a internet.",
    challenge: "El equipo de ventas trabaja donde la conexión es inestable y no puede detener la operación: tiene que registrar ventas, consultar inventario y emitir comprobantes aunque no haya internet.",
    solution: "Arquitectura offline-first con base de datos local, sincronización bidireccional con el ERP cuando vuelve la conexión e impresión de comprobantes directamente desde el celular.",
    features: [
      "Operación 100 % offline con base de datos local (SQLite / Realm)",
      "Sincronización bidireccional con el ERP",
      "Integridad de inventarios y ventas al reconectar",
      "Impresión matricial o térmica por Bluetooth o USB",
      "Mejoras de rendimiento para el equipo de ventas en campo"
    ],
    related: [21]
  },

  // REVISAR: ver nota de OPOX.
  21: {
    group: "actual",
    kind: "movil",
    icon: "bi-bag-check",
    title: "4ventas",
    category: "App móvil",
    client: "Global Snopek (Argentina)",
    period: "Octubre 2025 – presente",
    role: "Desarrollo móvil con React Native · remoto",
    access: "Uso comercial del cliente · sin acceso público",
    technologies: ["React Native", "Expo", "Sincronización de datos", "Integración ERP"],
    summary: "App móvil de ventas del ecosistema de Global Snopek, pensada para trabajar sin depender de la conexión.",
    description: "Otra de las aplicaciones móviles de ventas del ecosistema de Global Snopek. Junto con OPOX forma parte del trabajo de desarrollo y mantenimiento móvil que realizo para el equipo comercial de la empresa.",
    challenge: "Mantener evolucionando aplicaciones de ventas que ya están en uso, sin romper la operación diaria del equipo comercial y con datos de inventario y ventas siempre consistentes con el ERP.",
    solution: "Desarrollo en React Native con almacenamiento local, lógica de sincronización con el servidor central y mejoras de rendimiento orientadas al uso real en campo.",
    features: [
      "Funcionamiento sin conexión con datos locales",
      "Sincronización de inventarios y ventas con el ERP",
      "Emisión de comprobantes desde el dispositivo",
      "Mantenimiento y mejoras de rendimiento sobre aplicaciones en uso"
    ],
    related: [20]
  },

  // ---------------------------------------------------------------
  // Otros proyectos
  // ---------------------------------------------------------------
  3: {
    group: "archivo",
    kind: "web",
    title: "VitroCampos",
    category: "Sitio corporativo",
    client: "VitroCampos",
    technologies: ["HTML5", "CSS3", "JavaScript", "Bootstrap", "Responsive Design"],
    summary: "Sitio corporativo responsivo con catálogo y formularios de contacto para una empresa de vidrio y materiales de construcción.",
    description: "Sitio web corporativo para VitroCampos, empresa especializada en vidrios y materiales de construcción. El proyecto incluye diseño responsivo, catálogo de productos y formularios de contacto.",
    challenge: "Crear una plataforma web moderna que refleje la profesionalidad de la empresa y facilite la comunicación con clientes potenciales.",
    solution: "Desarrollo de un sitio web completamente responsivo con diseño moderno, optimizado para SEO y con funcionalidades de contacto integradas.",
    features: [
      "Diseño responsivo para todos los dispositivos",
      "Catálogo de productos con filtros",
      "Formularios de contacto",
      "Optimización SEO",
      "Integración con redes sociales"
    ],
    video: "assets/video/vitrocampo.mp4"
  },

  8: {
    group: "archivo",
    kind: "web",
    title: "Campus Virtual",
    category: "Plataforma educativa",
    client: "Institución educativa",
    technologies: ["React", "Node.js", "MongoDB", "Express", "JWT"],
    summary: "Plataforma de aprendizaje con cursos, tareas, chat en tiempo real y panel de administración.",
    description: "Plataforma virtual de aprendizaje que permite a estudiantes y profesores interactuar en un entorno digital. Incluye gestión de cursos, tareas y comunicación en tiempo real.",
    challenge: "Desarrollar una plataforma educativa intuitiva que facilite el aprendizaje a distancia y la gestión académica.",
    solution: "Creación de una aplicación web moderna con funcionalidades de gestión de usuarios, cursos, tareas y comunicación integrada.",
    features: [
      "Sistema de autenticación y autorización",
      "Gestión de cursos y materias",
      "Sistema de tareas y evaluaciones",
      "Chat en tiempo real",
      "Panel de administración"
    ],
    video: "assets/video/Campus.mp4"
  },

  9: {
    group: "archivo",
    kind: "web",
    title: "Fusoft, fábrica de software",
    category: "Sitio corporativo",
    client: "Fusoft · Uniempresarial",
    technologies: ["React", "Astro", "Node.js", "Bootstrap", "SCSS"],
    summary: "Sitio de la fábrica de software de Uniempresarial: servicios, proyectos y equipo.",
    description: "Sitio web corporativo para Fusoft, la fábrica de software de Uniempresarial. Plataforma que muestra los servicios, proyectos y equipo de desarrollo.",
    challenge: "Crear una plataforma que represente la innovación y profesionalismo de la fábrica de software, destacando los proyectos y servicios ofrecidos.",
    solution: "Desarrollo de un sitio web moderno con arquitectura escalable, diseño atractivo y funcionalidades interactivas que reflejen la calidad del trabajo realizado.",
    features: [
      "Diseño moderno y profesional",
      "Portafolio de proyectos",
      "Información del equipo",
      "Formularios de contacto",
      "Integración con redes sociales"
    ],
    video: "assets/video/fusoft.mp4"
  },

  10: {
    group: "archivo",
    kind: "web",
    title: "Softrium",
    category: "Sitio corporativo",
    client: "Softrium",
    technologies: ["React", "Node.js", "MongoDB", "Express", "Bootstrap"],
    summary: "Sitio corporativo con servicios, portafolio y contacto para una empresa de desarrollo de software.",
    description: "Sitio web corporativo para Softrium, empresa de desarrollo de software. Plataforma que presenta los servicios, proyectos y experiencia de la empresa.",
    challenge: "Desarrollar una plataforma web que comunique efectivamente la experiencia y capacidades de Softrium en el desarrollo de software.",
    solution: "Creación de un sitio web profesional con diseño moderno, portafolio de proyectos y funcionalidades de contacto integradas.",
    features: [
      "Diseño corporativo profesional",
      "Portafolio de proyectos",
      "Información de servicios",
      "Formularios de contacto",
      "Optimización para SEO"
    ],
    video: "assets/video/softrium.mp4"
  },

  11: {
    group: "archivo",
    kind: "web",
    title: "CE-ACE Ingeniería",
    category: "E-commerce",
    client: "CE-ACE Ingeniería",
    technologies: ["React", "Node.js", "MongoDB", "Express", "Stripe", "Bootstrap"],
    summary: "Tienda online con catálogo, carrito, pagos e inventario para productos y servicios de ingeniería.",
    description: "Tienda online completa para CE-ACE Ingeniería, permitiendo la venta de productos y servicios de ingeniería de forma digital.",
    challenge: "Desarrollar una plataforma de e-commerce segura y funcional que permita la venta de productos técnicos y servicios de ingeniería.",
    solution: "Creación de una tienda online completa con sistema de pagos, gestión de inventario, carrito de compras y panel de administración.",
    features: [
      "Catálogo de productos",
      "Sistema de carrito de compras",
      "Integración de pagos",
      "Panel de administración",
      "Gestión de inventario"
    ],
    video: "assets/video/ce-ace-ingenieria.mp4"
  },

  12: {
    group: "archivo",
    kind: "movil",
    title: "Foodboleros",
    category: "App móvil",
    client: "Restaurante Foodboleros",
    technologies: ["React Native", "Node.js", "MongoDB", "Express", "Firebase"],
    summary: "App móvil para pedidos, menú digital y reservas de un restaurante.",
    description: "Aplicación móvil para el restaurante Foodboleros que permite a los clientes realizar pedidos, ver el menú y hacer reservas desde sus dispositivos móviles.",
    challenge: "Crear una aplicación móvil intuitiva que mejore la experiencia de los clientes y optimice el proceso de pedidos del restaurante.",
    solution: "Desarrollo de una aplicación móvil completa con funcionalidades de pedidos, menú digital, reservas y notificaciones push.",
    features: [
      "Menú digital interactivo",
      "Sistema de pedidos",
      "Reservas de mesa",
      "Notificaciones push",
      "Historial de pedidos"
    ],
    video: "assets/video/foodboleros.mp4"
  },

  13: {
    group: "archivo",
    kind: "movil",
    title: "Servicio de grúas",
    category: "App móvil",
    client: "Empresa de servicios de grúas",
    technologies: ["React Native", "Node.js", "MongoDB", "Express", "Geolocalización"],
    summary: "App móvil que conecta usuarios con conductores de grúa cercanos en tiempo real.",
    description: "Aplicación móvil para servicios de grúas que conecta a usuarios con conductores de grúas cercanos, permitiendo solicitar servicios de emergencia de forma rápida y eficiente.",
    challenge: "Desarrollar una aplicación que facilite la conexión entre usuarios que necesitan servicios de grúa y conductores disponibles en tiempo real.",
    solution: "Creación de una aplicación con geolocalización, sistema de matching en tiempo real, chat integrado y sistema de pagos.",
    features: [
      "Geolocalización en tiempo real",
      "Sistema de matching",
      "Chat integrado",
      "Sistema de pagos",
      "Historial de servicios"
    ],
    video: "assets/video/gruas.mp4"
  },

  14: {
    group: "archivo",
    kind: "cloud",
    title: "IA para búsqueda de eventos",
    category: "Inteligencia artificial",
    client: "Plataforma de eventos",
    technologies: ["Python", "TensorFlow", "React", "Node.js", "MongoDB", "APIs"],
    summary: "Recomendador de eventos con machine learning según preferencias y comportamiento.",
    description: "Aplicación de inteligencia artificial que utiliza machine learning para recomendar eventos personalizados a los usuarios basándose en sus preferencias y comportamiento.",
    challenge: "Desarrollar un sistema de recomendación inteligente que mejore la experiencia del usuario al descubrir eventos relevantes.",
    solution: "Implementación de algoritmos de machine learning para análisis de preferencias y desarrollo de un sistema de recomendación personalizado.",
    features: [
      "Sistema de recomendación IA",
      "Análisis de preferencias",
      "Búsqueda inteligente",
      "Filtros avanzados",
      "Notificaciones personalizadas"
    ],
    video: "assets/video/Ia-eventos.mp4"
  },

  15: {
    group: "archivo",
    kind: "web",
    title: "Juguetería online",
    category: "E-commerce",
    client: "Juguetería local",
    technologies: ["React", "Node.js", "MongoDB", "Express", "PayPal", "Bootstrap"],
    summary: "Tienda online con catálogo por edades, filtros avanzados y carrito de compras.",
    description: "Tienda online completa para una juguetería, permitiendo la venta de juguetes y productos infantiles de forma digital con categorización por edades.",
    challenge: "Crear una plataforma de e-commerce atractiva para niños y padres, con categorización inteligente y sistema de recomendaciones por edad.",
    solution: "Desarrollo de una tienda online con diseño amigable, categorización por edades, sistema de filtros y carrito de compras intuitivo.",
    features: [
      "Catálogo por categorías de edad",
      "Sistema de filtros avanzados",
      "Carrito de compras",
      "Sistema de pagos seguro",
      "Panel de administración"
    ],
    video: "assets/video/jugueteria.mp4"
  },

  16: {
    group: "archivo",
    kind: "movil",
    title: "Relacionamiento CCB · Uniempresarial",
    category: "App enterprise",
    client: "Cámara de Comercio de Bogotá y Uniempresarial",
    technologies: ["React Native", "Node.js", "MongoDB", "Express", "Firebase", "API Integration"],
    summary: "App de relacionamiento entre la universidad y la Cámara de Comercio: convenios, emprendimiento y bolsa de empleo.",
    description: "Aplicación estratégica que facilita el relacionamiento institucional entre Uniempresarial y la Cámara de Comercio de Bogotá, conectando estudiantes con oportunidades de emprendimiento, pasantías y vinculación empresarial.",
    challenge: "Crear una plataforma digital que fortalezca la alianza estratégica entre la universidad y la CCB, facilitando programas de emprendimiento, bolsa de empleo y conexión empresa-academia.",
    solution: "Desarrollo de una aplicación enterprise con módulos especializados para gestión de convenios, seguimiento de estudiantes, programas de emprendimiento y networking empresarial, incluyendo dashboards analíticos para ambas instituciones.",
    features: [
      "Gestión de convenios institucionales",
      "Portal de oportunidades empresariales",
      "Seguimiento de estudiantes en programas CCB",
      "Módulo de emprendimiento e innovación",
      "Sistema de networking empresa-academia",
      "Dashboard analítico institucional",
      "Notificaciones de eventos y oportunidades",
      "Portal de bolsa de empleo especializada"
    ],
    video: "assets/video/ccb.mp4"
  },

  17: {
    group: "archivo",
    kind: "cloud",
    title: "Virtualización Uniempresarial",
    category: "Infraestructura cloud",
    client: "Uniempresarial · Área de virtualización",
    technologies: ["AWS", "Docker", "Kubernetes", "React", "Node.js", "MongoDB", "Redis", "CI/CD"],
    summary: "Infraestructura cloud en AWS para plataformas educativas con más de 10.000 estudiantes.",
    description: "Liderazgo e implementación de la infraestructura de virtualización completa para Uniempresarial, gestionando plataformas educativas digitales que atienden a más de 10,000 estudiantes con alta disponibilidad y escalabilidad.",
    challenge: "Diseñar e implementar una arquitectura cloud escalable que soporte el crecimiento de la universidad, garantizando disponibilidad 24/7, seguridad de datos académicos y optimización de costos operativos.",
    solution: "Implementación de arquitectura microservicios en AWS con contenedorización Docker, orquestación Kubernetes, CI/CD automatizado y monitoreo en tiempo real. Reducción de costos operativos en 45% y mejora de disponibilidad a 99.9%.",
    features: [
      "Arquitectura cloud escalable en AWS",
      "Contenedorización con Docker y Kubernetes",
      "Sistema de autenticación SSO universitario",
      "Plataformas LMS integradas",
      "Backup automático y disaster recovery",
      "Monitoreo en tiempo real con alertas",
      "CI/CD automatizado para despliegues",
      "Dashboard administrativo de recursos",
      "Optimización de costos cloud",
      "Seguridad multi-capa y cifrado de datos"
    ],
    video: "assets/video/Campus.mp4"
  }
};

/** Filtros de la cuadrícula "Otros proyectos". */
const portfolioFilters = [
  { key: "*", label: "Todos" },
  { key: "web", label: "Web y e-commerce" },
  { key: "movil", label: "Apps móviles" },
  { key: "cloud", label: "Cloud e IA" }
];

function getProjectData(projectId) {
  return portfolioData[projectId] || null;
}
