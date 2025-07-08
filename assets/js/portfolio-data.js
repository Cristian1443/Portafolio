// Datos de los proyectos del portafolio
const portfolioData = {
  // Proyecto 3: VitroCampos
  3: {
    title: "VitroCampos",
    category: "Desarrollo Web",
    technologies: ["HTML5", "CSS3", "JavaScript", "Bootstrap", "Responsive Design"],
    client: "VitroCampos",
    projectUrl: "#",
    repository: "#",
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
    images: ["assets/video/VITROCAMPO.mp4"],
    video: "assets/video/VITROCAMPO.mp4"
  },

  // Proyecto 8: Campus
  8: {
    title: "Campus Virtual",
    category: "Plataforma Educativa",
    technologies: ["React", "Node.js", "MongoDB", "Express", "JWT"],
    client: "Institución Educativa",
    projectUrl: "#",
    repository: "#",
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
    images: ["assets/video/Campus.mp4"],
    video: "assets/video/Campus.mp4"
  },

  // Proyecto 9: Fusoft
  9: {
    title: "Fusoft - Fábrica de Software",
    category: "Sitio Web Corporativo",
    technologies: ["React", "Astro", "Node.js", "Bootstrap", "SCSS"],
    client: "Fusoft - Uniempresarial",
    projectUrl: "#",
    repository: "#",
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
    images: ["assets/video/fusoft.mp4"],
    video: "assets/video/fusoft.mp4"
  },

  // Proyecto 10: Softrium
  10: {
    title: "Softrium",
    category: "Sitio Web Corporativo",
    technologies: ["React", "Node.js", "MongoDB", "Express", "Bootstrap"],
    client: "Softrium",
    projectUrl: "#",
    repository: "#",
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
    images: ["assets/video/softrium.mp4"],
    video: "assets/video/softrium.mp4"
  },

  // Proyecto 11: CE-ACE Ingeniería
  11: {
    title: "CE-ACE Ingeniería - Tienda Online",
    category: "E-commerce",
    technologies: ["React", "Node.js", "MongoDB", "Express", "Stripe", "Bootstrap"],
    client: "CE-ACE Ingeniería",
    projectUrl: "#",
    repository: "#",
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
    images: ["assets/video/ce-ace-ingenieria.mp4"],
    video: "assets/video/ce-ace-ingenieria.mp4"
  },

  // Proyecto 12: Foodboleros
  12: {
    title: "Foodboleros - Aplicación de Restaurante",
    category: "Aplicación Móvil",
    technologies: ["React Native", "Node.js", "MongoDB", "Express", "Firebase"],
    client: "Restaurante Foodboleros",
    projectUrl: "#",
    repository: "#",
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
    images: ["assets/video/foodboleros .mp4"],
    video: "assets/video/foodboleros .mp4"
  },

  // Proyecto 13: Grúas
  13: {
    title: "Servicio de Grúas - Aplicación",
    category: "Aplicación Móvil",
    technologies: ["React Native", "Node.js", "MongoDB", "Express", "Geolocalización"],
    client: "Empresa de Servicios de Grúas",
    projectUrl: "#",
    repository: "#",
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
    images: ["assets/video/gruas.mp4"],
    video: "assets/video/gruas.mp4"
  },

  // Proyecto 14: IA Eventos
  14: {
    title: "IA para Búsqueda de Eventos",
    category: "Aplicación de Inteligencia Artificial",
    technologies: ["Python", "TensorFlow", "React", "Node.js", "MongoDB", "APIs"],
    client: "Plataforma de Eventos",
    projectUrl: "#",
    repository: "#",
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
    images: ["assets/video/Ia-eventos.mp4"],
    video: "assets/video/Ia-eventos.mp4"
  },

  // Proyecto 15: Juguetería Online
  15: {
    title: "Juguetería Online",
    category: "E-commerce",
    technologies: ["React", "Node.js", "MongoDB", "Express", "PayPal", "Bootstrap"],
    client: "Juguetería Local",
    projectUrl: "#",
    repository: "#",
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
    images: ["assets/video/jugueteria.mp4"],
    video: "assets/video/jugueteria.mp4"
  },

  // Proyecto 16: CCB
  16: {
    title: "CCB - Aplicación",
    category: "Aplicación Móvil",
    technologies: ["React Native", "Node.js", "MongoDB", "Express", "Firebase"],
    client: "CCB",
    projectUrl: "#",
    repository: "#",
    description: "Aplicación móvil para CCB que facilita la gestión de servicios y comunicación con clientes, optimizando procesos internos y mejorando la experiencia del usuario.",
    challenge: "Desarrollar una aplicación que optimice los procesos internos de CCB y mejore la comunicación con los clientes.",
    solution: "Creación de una aplicación móvil integral con funcionalidades de gestión, comunicación y seguimiento de servicios.",
    features: [
      "Gestión de servicios",
      "Comunicación con clientes",
      "Seguimiento de procesos",
      "Notificaciones push",
      "Panel de administración"
    ],
    images: ["assets/video/ccb.mp4"],
    video: "assets/video/ccb.mp4"
  }
};

// Función para obtener los datos del proyecto por ID
function getProjectData(projectId) {
  return portfolioData[projectId] || null;
}

// Función para cargar los detalles del proyecto
function loadProjectDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  
  if (!projectId) {
    window.location.href = 'index.html';
    return;
  }

  const projectData = getProjectData(parseInt(projectId));
  
  if (!projectData) {
    window.location.href = 'index.html';
    return;
  }

  // Actualizar el título de la página
  document.title = `${projectData.title} - Detalles del Proyecto`;

  // Actualizar la información del proyecto
  const portfolioInfo = document.querySelector('.portfolio-info');
  if (portfolioInfo) {
    portfolioInfo.innerHTML = `
      <h3>Información del Proyecto</h3>
      <ul>
        <li><strong>Categoría</strong>: ${projectData.category}</li>
        <li><strong>Tecnologías</strong>: ${projectData.technologies.join(', ')}</li>
        <li><strong>Cliente</strong>: ${projectData.client}</li>
        <li><strong>URL del Proyecto</strong>: <a href="${projectData.projectUrl}" target="_blank">Ver proyecto</a></li>
        <li><strong>Repositorio</strong>: <a href="${projectData.repository}" target="_blank">Ver código</a></li>
      </ul>
    `;
  }

  // Actualizar la descripción del proyecto
  const portfolioDescription = document.querySelector('.portfolio-description');
  if (portfolioDescription) {
    portfolioDescription.innerHTML = `
      <h2>Descripción del Proyecto</h2>
      <p>${projectData.description}</p>
      
      <h2>El Desafío</h2>
      <p>${projectData.challenge}</p>
      
      <h2>La Solución</h2>
      <p>${projectData.solution}</p>
      
      <h2>Características Principales</h2>
      <ul>
        ${projectData.features.map(feature => `<li>${feature}</li>`).join('')}
      </ul>
    `;
  }

  // Actualizar el slider de imágenes/videos
  const sliderWrapper = document.querySelector('.portfolio-details-slider .swiper-wrapper');
  if (sliderWrapper && projectData.video) {
    sliderWrapper.innerHTML = `
      <div class="swiper-slide">
        <video src="${projectData.video}" controls autoplay muted loop style="width:100%;height:auto;border-radius:12px;">
          Tu navegador no soporta el elemento video.
        </video>
      </div>
    `;
  }

  // Reinicializar el slider si es necesario
  if (typeof Swiper !== 'undefined') {
    new Swiper('.portfolio-details-slider', {
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
    });
  }
}

// Cargar los detalles cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadProjectDetails);