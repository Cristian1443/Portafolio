document.addEventListener('DOMContentLoaded', () => {
  const loadingMessage = document.getElementById('loading-message');
  loadingMessage.style.display = 'block';

  try {
    // Verificar que portfolioData esté disponible
    if (typeof portfolioData === 'undefined') {
      throw new Error('No se pudo cargar la información del portafolio');
    }

    // 1. Obtener el ID del proyecto desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = parseInt(urlParams.get('id'));

    if (!projectId) {
      throw new Error('ID de proyecto no especificado');
    }

    // 2. Encontrar el proyecto en nuestra base de datos
    const project = portfolioData.find(p => p.id === projectId);

    // 3. Si no se encuentra el proyecto, mostrar un error
    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    // 4. Poblar la página con la información del proyecto
    document.title = `Detalles - ${project.title}`;
    document.getElementById('portfolio-title').textContent = project.title;
    document.getElementById('portfolio-category').textContent = project.category;
    document.getElementById('portfolio-client').textContent = project.client;
    document.getElementById('portfolio-date').textContent = project.date;
    document.getElementById('portfolio-tech').textContent = project.technologies;
    document.getElementById('portfolio-description-text').textContent = project.description;
    
    const projectUrlElement = document.getElementById('portfolio-url');
    if (project.url && project.url !== '#') {
      projectUrlElement.href = project.url;
      projectUrlElement.parentElement.style.display = 'block';
    } else {
      projectUrlElement.parentElement.style.display = 'none';
    }

    // 5. Cargar las imágenes en el slider
    const sliderWrapper = document.getElementById('portfolio-slider-wrapper');
    sliderWrapper.innerHTML = ''; // Limpiar el contenido anterior

    // Añadir la imagen principal
    sliderWrapper.innerHTML += `<div class=\"swiper-slide\"><img src=\"${project.mainImage}\" alt=\"${project.title}\"></div>`;

    // Añadir imágenes adicionales del slider si existen
    if (project.sliderImages && project.sliderImages.length > 0) {
      project.sliderImages.forEach(imgUrl => {
        sliderWrapper.innerHTML += `<div class=\"swiper-slide\"><img src=\"${imgUrl}\" alt=\"Detalle del proyecto\"></div>`;
      });
    }
    
    // Reinicializar el slider (Swiper.js) y el lightbox (Glightbox)
    new Swiper('.portfolio-details-slider', {
      speed: 400,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      }
    });
    
    GLightbox({
      selector: '.portfolio-lightbox'
    });

  } catch (error) {
    console.error('Error al cargar los detalles del proyecto:', error);
    document.querySelector('#portfolio-title').textContent = 'Error al cargar el proyecto';
    document.querySelector('.portfolio-info').style.display = 'none';
    document.querySelector('.portfolio-description').style.display = 'none';
    document.querySelector('.portfolio-details-slider').style.display = 'none';
    
    // Mostrar mensaje de error al usuario
    const errorMessage = document.createElement('div');
    errorMessage.className = 'alert alert-danger';
    errorMessage.textContent = 'No se pudo cargar la información del proyecto. Por favor, intenta nuevamente.';
    document.querySelector('.container').prepend(errorMessage);
  } finally {
    loadingMessage.style.display = 'none';
  }
}); 