/**
 * Royal Wedding Door - Ultra-Luxury 3D Interactive Opening & Palace Walk-Through Engine
 * Powered by GSAP, Canvas-Confetti, and Royal Particle Engine
 */

(function () {
  'use strict';

  function initDoor() {
    const doorWrapper = document.getElementById('royal-door-screen');
    const doorTapBtn = document.getElementById('door-tap-btn');
    const doorPanels = document.querySelectorAll('.door-panel');
    const doorStage = document.getElementById('door-3d-stage');
    const mainContent = document.getElementById('main-wedding-content');

    if (!doorWrapper || !doorTapBtn) return;

    // Strict Scroll Lock & Guarantee Top Position
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Strict Scroll & Touch Lock
    document.body.classList.add('lock-scroll');
    document.documentElement.classList.add('lock-scroll');

    // Prevent touch gestures from scrolling while door is locked
    function blockScrollGesture(e) {
      if (document.body.classList.contains('lock-scroll')) {
        // Allow tap on button/panels
        if (e.target.closest('#door-tap-btn') || e.target.closest('.door-panel') || e.target.closest('#door-seal-wrap')) {
          return;
        }
        e.preventDefault();
      }
    }
    window.addEventListener('touchmove', blockScrollGesture, { passive: false });
    window.addEventListener('wheel', blockScrollGesture, { passive: false });

    function openDoorSequence() {
      if (doorWrapper.classList.contains('door-opening') || doorWrapper.classList.contains('door-dismissed')) return;

      doorWrapper.classList.add('door-opening');

      // Re-assert top scroll
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Play rich royal chime sound flourish
      playOpeningFlourish();

      // Trigger royal music upon user interaction
      if (window.WeddingMusic && typeof window.WeddingMusic.startAutoplay === 'function') {
        window.WeddingMusic.startAutoplay();
      }

      // 1. Fire Luxury Canvas-Confetti Cannons
      launchRoyalConfetti();

      // 2. Spawn 3D Falling Rose & Marigold Petals via RoyalParticles
      if (window.RoyalParticles && typeof window.RoyalParticles.burst === 'function') {
        window.RoyalParticles.burst(55);
      }

      // 3. GSAP 3D Walk-Through Animation
      const leftGate = document.querySelector('.door-left');
      const rightGate = document.querySelector('.door-right');
      const seal = document.getElementById('door-seal-wrap');
      const interiorImg = document.querySelector('.interior-chamber-img');
      const interiorGlow = document.querySelector('.interior-golden-glow');
      const interiorRays = document.querySelector('.interior-light-rays');

      if (typeof gsap !== 'undefined') {
        // A. Seal Dissolves with Shockwave
        if (seal) {
          gsap.to(seal, {
            scale: 1.45,
            opacity: 0,
            z: 150,
            duration: 0.55,
            ease: 'power2.in'
          });
        }

        // B. Palace Gates Swing Inward & Part Outwards (True 3D Walk-through)
        if (leftGate && rightGate) {
          gsap.to(leftGate, {
            rotationY: -118,
            x: '-8vw',
            z: 80,
            duration: 1.6,
            ease: 'power3.inOut'
          });
          gsap.to(rightGate, {
            rotationY: 118,
            x: '8vw',
            z: 80,
            duration: 1.6,
            ease: 'power3.inOut'
          });
        }

        // C. Camera Moves Forward Into the Palace Chamber
        if (doorStage) {
          gsap.to(doorStage, {
            z: 550,
            scale: 1.2,
            duration: 2.0,
            ease: 'power2.inOut'
          });
        }

        // D. Interior Hall Illuminates & Zooms In
        if (interiorImg) {
          gsap.to(interiorImg, {
            scale: 1.55,
            filter: 'brightness(1.25) contrast(1.06) blur(0px)',
            duration: 2.2,
            ease: 'power2.out'
          });
        }
        if (interiorGlow) {
          gsap.to(interiorGlow, {
            opacity: 0.95,
            duration: 1.5,
            ease: 'power1.in'
          });
        }
        if (interiorRays) {
          gsap.to(interiorRays, {
            opacity: 0.85,
            duration: 1.5,
            ease: 'power1.in'
          });
        }
      }

      // Step 1: Camera Dive into palace chamber
      setTimeout(() => {
        doorWrapper.style.animation = 'doorCameraPush 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      }, 1500);

      // Step 2: Unveil Main Wedding Invitation Card & Unlock Scroll strictly at Top
      setTimeout(() => {
        doorWrapper.classList.add('door-dismissed');
        document.body.classList.remove('lock-scroll');
        document.documentElement.classList.remove('lock-scroll');

        // Remove gesture blocker
        window.removeEventListener('touchmove', blockScrollGesture);
        window.removeEventListener('wheel', blockScrollGesture);

        // Lock to top
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Animate hero card elements entrance
        if (typeof gsap !== 'undefined') {
          gsap.fromTo('.hero-section .hero-portrait-card', 
            { y: 50, opacity: 0, scale: 0.93 },
            { y: 0, opacity: 1, scale: 1, duration: 1.1, stagger: 0.22, ease: 'power3.out' }
          );
          gsap.fromTo('.hero-section .hero-center-connector',
            { scale: 0.4, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.9, delay: 0.25, ease: 'back.out(1.8)' }
          );
          gsap.fromTo('.hero-date-strip',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, delay: 0.5, ease: 'power2.out' }
          );
          gsap.fromTo('.vedic-blessing-bar',
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }
          );
        }
      }, 2200);
    }

    const sealWrap = document.getElementById('door-seal-wrap');
    if (sealWrap) {
      sealWrap.style.pointerEvents = 'auto';
      sealWrap.style.cursor = 'pointer';
      sealWrap.addEventListener('click', (e) => {
        e.stopPropagation();
        openDoorSequence();
      });
    }

    doorTapBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDoorSequence();
    });

    doorPanels.forEach(panel => {
      panel.addEventListener('click', () => openDoorSequence());
    });

    doorWrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDoorSequence();
      }
    });
  }

  function launchRoyalConfetti() {
    if (typeof confetti !== 'function') return;

    const goldColors = ['#d4af37', '#f5d77f', '#ffffff', '#c59b27', '#e85d04', '#c9184a'];

    confetti({
      particleCount: 75,
      angle: 60,
      spread: 65,
      origin: { x: 0.1, y: 0.7 },
      colors: goldColors,
      shapes: ['circle', 'square'],
      ticks: 200,
      gravity: 0.85,
      scalar: 1.2
    });

    confetti({
      particleCount: 75,
      angle: 120,
      spread: 65,
      origin: { x: 0.9, y: 0.7 },
      colors: goldColors,
      shapes: ['circle', 'square'],
      ticks: 200,
      gravity: 0.85,
      scalar: 1.2
    });

    setTimeout(() => {
      confetti({
        particleCount: 95,
        spread: 100,
        origin: { x: 0.5, y: 0.4 },
        colors: goldColors,
        ticks: 260,
        gravity: 0.75,
        scalar: 1.35
      });
    }, 450);
  }

  function playOpeningFlourish() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Royal Temple Chime & Sitar harmonic series
      const frequencies = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.18 / (idx + 1), ctx.currentTime + idx * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 2.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 2.3);
      });
    } catch (e) {
      // AudioContext safe fallback
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDoor);
  } else {
    initDoor();
  }
})();
