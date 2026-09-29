/**
 * Wedding Editorial Gallery Builder
 */

(function () {
  'use strict';

  function renderGallery(galleryData) {
    const galleryContainer = document.getElementById('gallery-container');
    const gallerySection = document.getElementById('gallery-section');

    if (!galleryContainer || !galleryData || !galleryData.enabled || !galleryData.images || !galleryData.images.length) {
      if (gallerySection) gallerySection.style.display = 'none';
      return;
    }

    const titleEl = document.getElementById('gallery-title');
    if (titleEl && galleryData.title) {
      titleEl.textContent = galleryData.title;
    }

    const subtitleEl = document.getElementById('gallery-subtitle');
    if (subtitleEl && galleryData.subtitle) {
      subtitleEl.textContent = galleryData.subtitle;
    }

    galleryContainer.innerHTML = '';

    galleryData.images.forEach((imgObj, idx) => {
      const item = document.createElement('div');
      item.className = 'gallery-item reveal-zoom-in';

      const box = document.createElement('div');
      box.className = 'gallery-img-box';

      const img = document.createElement('img');
      img.src = imgObj.src;
      img.alt = imgObj.caption || `Wedding Memory ${idx + 1}`;
      img.loading = 'lazy';

      img.onerror = () => {
        item.classList.add('image-failed');
      };

      box.appendChild(img);
      item.appendChild(box);

      if (imgObj.caption) {
        const caption = document.createElement('div');
        caption.className = 'gallery-caption';
        caption.textContent = imgObj.caption;
        item.appendChild(caption);
      }

      // Lightbox click handler
      item.addEventListener('click', () => {
        if (window.WeddingLightbox) {
          window.WeddingLightbox.open(galleryData.images, idx);
        }
      });

      galleryContainer.appendChild(item);
    });
  }

  window.WeddingGallery = {
    render: renderGallery
  };
})();
