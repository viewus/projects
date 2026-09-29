/**
 * 3D Interactive Card Parallax, Gyroscope & Gold Sheen Engine
 * Provides physical 3D depth tilt to hero cards, story scrapbook, timeline, and gallery cards.
 */
(function () {
  'use strict';

  function init3DTilt() {
    const tiltSelectors = [
      '.hero-portrait-card',
      '.story-card',
      '.timeline-card',
      '.family-card',
      '.venue-card',
      '.moment-card',
      '.gallery-item',
      '.door-seal-container'
    ];

    const elements = document.querySelectorAll(tiltSelectors.join(','));

    elements.forEach((el) => {
      // Add dynamic sheen overlay if not present
      let sheen = el.querySelector('.card-gold-sheen');
      if (!sheen) {
        sheen = document.createElement('div');
        sheen.className = 'card-gold-sheen';
        sheen.style.position = 'absolute';
        sheen.style.inset = '0';
        sheen.style.borderRadius = 'inherit';
        sheen.style.pointerEvents = 'none';
        sheen.style.opacity = '0';
        sheen.style.transition = 'opacity 0.4s ease';
        sheen.style.background = 'radial-gradient(circle at 50% 50%, rgba(247, 215, 126, 0.28) 0%, rgba(212, 175, 55, 0.08) 40%, transparent 70%)';
        sheen.style.zIndex = '5';
        el.style.position = el.style.position || 'relative';
        el.appendChild(sheen);
      }

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -7; // Max tilt 7deg
        const rotateY = ((x - centerX) / centerX) * 7;

        el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px) scale3d(1.015, 1.015, 1.015)`;
        el.style.transition = 'transform 0.1s ease-out';

        const posXPercent = ((x / rect.width) * 100).toFixed(1);
        const posYPercent = ((y / rect.height) * 100).toFixed(1);
        sheen.style.background = `radial-gradient(circle at ${posXPercent}% ${posYPercent}%, rgba(247, 215, 126, 0.35) 0%, rgba(212, 175, 55, 0.1) 45%, transparent 75%)`;
        sheen.style.opacity = '1';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)';
        el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        sheen.style.opacity = '0';
      });
    });

    // Touch device slight gyroscope / dynamic spring interaction
    if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', (e) => {
        const gamma = e.gamma; // [-90, 90] left/right
        const beta = e.beta;   // [-180, 180] front/back
        if (gamma === null || beta === null) return;

        const rotY = Math.min(Math.max((gamma / 90) * 8, -8), 8);
        const rotX = Math.min(Math.max(((beta - 45) / 90) * 8, -8), 8);

        const heroPortraits = document.querySelectorAll('.hero-portrait-card');
        heroPortraits.forEach((card) => {
          card.style.transform = `perspective(800px) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg)`;
        });
      }, { passive: true });
    }
  }

  window.RoyalTilt = { init: init3DTilt };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3DTilt);
  } else {
    init3DTilt();
  }
})();
