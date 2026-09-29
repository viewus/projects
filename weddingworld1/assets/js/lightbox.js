/**
 * Premium Wedding Lightbox - Cinematic full-screen image expander with gestures & keyboard nav
 */

(function () {
  'use strict';

  let currentGallery = [];
  let currentIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  function initLightbox() {
    let modal = document.getElementById('lightbox-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'lightbox-modal';
      modal.className = 'lightbox-modal';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="lightbox-close-btn" id="lightbox-close" title="Close Lightbox">&times;</div>
      <div class="lightbox-nav-btn lightbox-nav-prev" id="lightbox-prev" aria-label="Previous Image">&#10094;</div>
      <div class="lightbox-nav-btn lightbox-nav-next" id="lightbox-next" aria-label="Next Image">&#10095;</div>
      <div class="lightbox-content-box">
        <img class="lightbox-main-img" id="lightbox-image" src="" alt="Wedding Photograph">
        <div class="lightbox-caption-bar" id="lightbox-caption"></div>
      </div>
    `;

    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const mainImg = document.getElementById('lightbox-image');

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeLightbox();
      });
    }

    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showPrev();
    });

    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showNext();
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });

    // Mobile Swipe Support
    modal.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    modal.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleGesture();
    }, { passive: true });
  }

  function handleGesture() {
    const swipeThreshold = 40;
    if (touchEndX < touchStartX - swipeThreshold) {
      showNext();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      showPrev();
    }
  }

  function openLightbox(imagesArray, startIndex = 0) {
    currentGallery = imagesArray;
    currentIndex = startIndex;

    const modal = document.getElementById('lightbox-modal');
    if (!modal) return;

    updateLightboxContent();
    modal.classList.add('active');
    document.body.classList.add('lock-scroll');
  }

  function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.classList.remove('lock-scroll');
    }
  }

  function showNext() {
    if (currentGallery.length <= 1) return;
    currentIndex = (currentIndex + 1) % currentGallery.length;
    updateLightboxContent();
  }

  function showPrev() {
    if (currentGallery.length <= 1) return;
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    updateLightboxContent();
  }

  function updateLightboxContent() {
    const item = currentGallery[currentIndex];
    if (!item) return;

    const imgEl = document.getElementById('lightbox-image');
    const captionEl = document.getElementById('lightbox-caption');

    imgEl.src = item.src || item.image || item;
    captionEl.textContent = item.caption || item.title || '';
    captionEl.style.display = (item.caption || item.title) ? 'block' : 'none';
  }

  window.WeddingLightbox = {
    init: initLightbox,
    open: openLightbox,
    close: closeLightbox
  };
})();
