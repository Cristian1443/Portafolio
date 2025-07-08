// Funcionalidad específica para la página de detalles del portafolio

document.addEventListener('DOMContentLoaded', function() {
  
  // Inicializar AOS (Animate On Scroll)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }

  // Inicializar GLightbox para videos
  if (typeof GLightbox !== 'undefined') {
    GLightbox({
      selector: '.portfolio-lightbox',
      touchNavigation: true,
      loop: true,
      autoplayVideos: true
    });
  }

  // Inicializar Swiper para el slider de detalles
  if (typeof Swiper !== 'undefined') {
    const portfolioDetailsSwiper = new Swiper('.portfolio-details-slider', {
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  }

  // Manejar el botón de volver al portafolio
  const backButton = document.querySelector('.btn-back-to-portfolio');
  if (backButton) {
    backButton.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'index.html#portfolio';
    });
  }

  // Función para mostrar mensaje de carga
  function showLoading() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
      loadingMessage.style.display = 'block';
    }
  }

  // Función para ocultar mensaje de carga
  function hideLoading() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
      loadingMessage.style.display = 'none';
    }
  }

  // Manejar enlaces de proyectos y repositorios
  document.addEventListener('click', function(e) {
    if (e.target.matches('a[href="#"]')) {
      e.preventDefault();
      // Mostrar mensaje temporal
      const originalText = e.target.textContent;
      e.target.textContent = 'Enlace próximamente disponible';
      e.target.style.opacity = '0.7';
      
      setTimeout(() => {
        e.target.textContent = originalText;
        e.target.style.opacity = '1';
      }, 2000);
    }
  });

  // Función para reproducir/pausar videos automáticamente
  function handleVideoPlayback() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      // Pausar video cuando no está visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            video.play().catch(e => console.log('Error reproduciendo video:', e));
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(video);
    });
  }

  // Inicializar manejo de videos
  handleVideoPlayback();

  // Función para copiar enlaces al portapapeles
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      // Mostrar notificación de éxito
      showNotification('Enlace copiado al portapapeles', 'success');
    }).catch(err => {
      console.error('Error copiando al portapapeles:', err);
      showNotification('Error al copiar enlace', 'error');
    });
  }

  // Función para mostrar notificaciones
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: 500;
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
      background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    `;

    document.body.appendChild(notification);

    // Remover notificación después de 3 segundos
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Agregar estilos CSS para las animaciones de notificaciones
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Función para compartir proyecto en redes sociales
  function shareProject(platform) {
    const currentUrl = window.location.href;
    const projectTitle = document.title;
    
    let shareUrl = '';
    
    switch(platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent('Mira este proyecto: ' + projectTitle)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }

  // Agregar botones de compartir si no existen
  const portfolioInfo = document.querySelector('.portfolio-info');
  if (portfolioInfo && !document.querySelector('.share-buttons')) {
    const shareButtons = document.createElement('div');
    shareButtons.className = 'share-buttons mt-4';
    shareButtons.innerHTML = `
      <h4>Compartir Proyecto</h4>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary btn-sm" onclick="shareProject('twitter')">
          <i class="bi bi-twitter"></i> Twitter
        </button>
        <button class="btn btn-outline-primary btn-sm" onclick="shareProject('linkedin')">
          <i class="bi bi-linkedin"></i> LinkedIn
        </button>
        <button class="btn btn-outline-primary btn-sm" onclick="shareProject('facebook')">
          <i class="bi bi-facebook"></i> Facebook
        </button>
      </div>
    `;
    portfolioInfo.appendChild(shareButtons);
  }

  // Hacer las funciones disponibles globalmente
  window.shareProject = shareProject;
  window.copyToClipboard = copyToClipboard;

  // Ocultar mensaje de carga al finalizar
  hideLoading();

  console.log('Portfolio details page initialized successfully');
}); 