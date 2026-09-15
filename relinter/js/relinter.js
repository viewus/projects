/**
 * RELINTER ARCHITECTURAL SYSTEMS — JAVASCRIPT CORE ENGINE
 * Shared Navigation • Door Reveal Preloader • Lightbox • 2D Frame Profile Simulator
 */

(function () {
  'use strict';

  // 1. Scroll Progress Indicator
  const progressBar = document.getElementById('scrollProgressBar');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollY / (docHeight || 1)) * 100;
    if (progressBar) progressBar.style.width = progress + '%';
  }, { passive: true });

  // 2. Sticky Header Scroll Effect
  const skylaHeader = document.getElementById('skylaHeader');
  window.addEventListener('scroll', () => {
    if (skylaHeader) {
      skylaHeader.classList.toggle('scrolled', window.scrollY > 20);
    }
  }, { passive: true });

  // 3. Mobile Navigation Drawer
  const mobOpen = document.getElementById('mobileMenuOpen');
  const mobClose = document.getElementById('mobileMenuClose');
  const mobCurtain = document.getElementById('mobileNavDrawer');
  if (mobOpen && mobCurtain) {
    mobOpen.addEventListener('click', () => mobCurtain.classList.add('open'));
  }
  if (mobClose && mobCurtain) {
    mobClose.addEventListener('click', () => mobCurtain.classList.remove('open'));
  }
  document.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', () => {
      if (mobCurtain) mobCurtain.classList.remove('open');
    });
  });

  // 4. Architectural Luxury Reveal Preloader
  const doorPreloader = document.getElementById('doorPreloader');
  const doorFill = document.getElementById('doorTrackFill');
  const doorTelemetry = document.getElementById('doorTelemetry');
  const preloaderPercent = document.getElementById('preloaderPercent');

  if (doorPreloader) {
    let loadProgress = 0;
    const loadSteps = [
      { p: 25, msg: 'EXTRUDING 6063-T6 PRIMARY ALLOY...' },
      { p: 55, msg: 'MILLING 18MM MINIMALIST SIGHTLINES...' },
      { p: 85, msg: 'CALIBRATING DUAL 48dB ACOUSTIC SEALS...' },
      { p: 100, msg: 'RELINTER ARCHITECTURAL SUITE READY' }
    ];

    const stepInterval = setInterval(() => {
      loadProgress += Math.floor(Math.random() * 8) + 4;
      if (loadProgress >= 100) {
        loadProgress = 100;
        clearInterval(stepInterval);
      }

      if (doorFill) doorFill.style.width = loadProgress + '%';
      if (preloaderPercent) preloaderPercent.textContent = `${loadProgress}%`;

      const currentStep = loadSteps.find(s => loadProgress <= s.p) || loadSteps[loadSteps.length - 1];
      if (doorTelemetry) doorTelemetry.textContent = currentStep.msg;

      if (loadProgress >= 100) {
        setTimeout(() => {
          doorPreloader.classList.add('opening');
          setTimeout(() => {
            doorPreloader.classList.add('loaded');
          }, 1100);
        }, 280);
      }
    }, 45);

    // Safety fallback
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (!doorPreloader.classList.contains('loaded')) {
          doorPreloader.classList.add('opening');
          setTimeout(() => doorPreloader.classList.add('loaded'), 1000);
        }
      }, 2200);
    });
  }

  // 5. Interactive 2D CAD Frame Profile Anatomy Inspector (Fully Responsive & High-DPI)
  const frameCanvas = document.getElementById('frameProfileCanvas');
  const cadModeBadge = document.getElementById('cadModeBadge');

  if (frameCanvas) {
    const ctx = frameCanvas.getContext('2d');
    let fWidth = 0;
    let fHeight = 0;
    let activeFeature = 'interlock';
    let time = 0;
    let animId = null;

    function resizeFrameCanvas() {
      const rect = frameCanvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      
      fWidth = rect.width;
      fHeight = rect.height;
      
      frameCanvas.width = Math.floor(rect.width * dpr);
      frameCanvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', resizeFrameCanvas);
    resizeFrameCanvas();

    const featureButtons = document.querySelectorAll('.profile-feature-card');
    featureButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        featureButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFeature = btn.dataset.feature || 'interlock';
        if (cadModeBadge) {
          if (activeFeature === 'interlock') cadModeBadge.textContent = '✦ 18MM MINIMALIST INTERLOCK';
          if (activeFeature === 'thermal') cadModeBadge.textContent = '✦ PA66 THERMAL BREAK • U=1.1';
          if (activeFeature === 'lock') cadModeBadge.textContent = '✦ MULTI-POINT SECURITY CAM RC3';
        }
      });
    });

    function drawFrameProfile() {
      if (fWidth === 0 || fHeight === 0) {
        resizeFrameCanvas();
      }

      ctx.clearRect(0, 0, fWidth, fHeight);
      time += 0.025;

      const cx = fWidth / 2;
      const cy = fHeight / 2;

      // Compute scale so drawing fits cleanly on any screen (300px mobile up to 4K)
      const targetW = 460;
      const targetH = 300;
      const scale = Math.min((fWidth - 24) / targetW, (fHeight - 24) / targetH, 1.0);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      // 1. Subtle CAD Blueprint Grid Background
      ctx.strokeStyle = 'rgba(243, 201, 120, 0.06)';
      ctx.lineWidth = 1;
      const gridSpan = 220;
      for (let x = -gridSpan; x <= gridSpan; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, -140);
        ctx.lineTo(x, 140);
        ctx.stroke();
      }
      for (let y = -140; y <= 140; y += 30) {
        ctx.beginPath();
        ctx.moveTo(-gridSpan, y);
        ctx.lineTo(gridSpan, y);
        ctx.stroke();
      }

      // 2. Glass DGU Panes (Left Section)
      const glassTop = -125;
      const glassBottom = 125;
      const glassHeight = glassBottom - glassTop;

      // Outer Glass Pane (6mm Low-E)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-180, glassTop, 16, glassHeight);
      ctx.strokeRect(-180, glassTop, 16, glassHeight);

      // Argon Gas Gap (16mm) with subtle acoustic wave shimmer
      const shimmer = 0.08 + Math.sin(time * 2.5) * 0.04;
      ctx.fillStyle = `rgba(0, 242, 254, ${shimmer})`;
      ctx.fillRect(-164, glassTop, 24, glassHeight);

      // Argon wave line
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
      ctx.beginPath();
      for (let y = glassTop; y <= glassBottom; y += 10) {
        const xOffset = -152 + Math.sin(time * 3 + y * 0.08) * 3;
        if (y === glassTop) ctx.moveTo(xOffset, y);
        else ctx.lineTo(xOffset, y);
      }
      ctx.stroke();

      // Inner Glass Pane (8mm Toughened)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-140, glassTop, 18, glassHeight);
      ctx.strokeRect(-140, glassTop, 18, glassHeight);

      // 3. Dual EPDM Acoustic Rubber Gaskets
      ctx.fillStyle = '#06080C';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.fillRect(-122, -90, 8, 180);
      ctx.strokeRect(-122, -90, 8, 180);

      // 4. Primary 18mm Aluminium Interlock Stile (Center Profile)
      const isInterlockActive = activeFeature === 'interlock';
      ctx.fillStyle = '#090D15';
      ctx.strokeStyle = isInterlockActive ? '#F3C978' : 'rgba(243, 201, 120, 0.5)';
      ctx.lineWidth = isInterlockActive ? 2 : 1.5;

      if (isInterlockActive) {
        ctx.shadowColor = 'rgba(243, 201, 120, 0.4)';
        ctx.shadowBlur = 15;
      }

      // Main Outer Sash Housing
      ctx.beginPath();
      ctx.roundRect(-114, -110, 110, 220, [6]);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Internal Chambers & Structural Stiffeners
      ctx.strokeStyle = 'rgba(243, 201, 120, 0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-106, -95, 42, 90);
      ctx.strokeRect(-106, 5, 42, 90);

      // 5. PA66 Polyamide Thermal Break Strut
      const isThermalActive = activeFeature === 'thermal';
      ctx.fillStyle = isThermalActive ? 'rgba(243, 201, 120, 0.9)' : '#161E2E';
      ctx.strokeStyle = isThermalActive ? '#FFFFFF' : '#F3C978';
      ctx.lineWidth = isThermalActive ? 2 : 1;

      if (isThermalActive) {
        ctx.shadowColor = '#F3C978';
        ctx.shadowBlur = 20;
      }

      ctx.beginPath();
      ctx.roundRect(-58, -75, 36, 150, [4]);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Thermal Break Hatching
      ctx.strokeStyle = isThermalActive ? '#000' : 'rgba(243, 201, 120, 0.3)';
      for (let hy = -65; hy < 65; hy += 16) {
        ctx.beginPath();
        ctx.moveTo(-54, hy);
        ctx.lineTo(-26, hy + 8);
        ctx.stroke();
      }

      // 6. European Multi-Point Security Cam & Hardened Receiver (Right Side)
      const isLockActive = activeFeature === 'lock';
      ctx.fillStyle = isLockActive ? '#00F2FE' : '#1E293B';
      ctx.strokeStyle = isLockActive ? '#FFFFFF' : '#38BDF8';
      ctx.lineWidth = isLockActive ? 2 : 1;

      if (isLockActive) {
        ctx.shadowColor = '#00F2FE';
        ctx.shadowBlur = 22;
      }

      // Cam Hook
      ctx.beginPath();
      ctx.roundRect(4, -40, 28, 80, [4]);
      ctx.fill();
      ctx.stroke();

      // Locking Bolt Head
      const lockPulse = isLockActive ? Math.sin(time * 5) * 3 : 0;
      ctx.beginPath();
      ctx.arc(18, 0, 10 + lockPulse, 0, Math.PI * 2);
      ctx.fillStyle = isLockActive ? '#FFFFFF' : '#0EA5E9';
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 7. Dimension Caliper Overlays
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#F3C978';
      ctx.strokeStyle = 'rgba(243, 201, 120, 0.6)';
      ctx.lineWidth = 1;

      // 18mm Dimension line on top
      ctx.beginPath();
      ctx.moveTo(-114, -125);
      ctx.lineTo(-4, -125);
      ctx.moveTo(-114, -120);
      ctx.lineTo(-114, -130);
      ctx.moveTo(-4, -120);
      ctx.lineTo(-4, -130);
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillText('18.0 mm STILE', -59, -132);

      // Glass Dimension line on bottom
      ctx.beginPath();
      ctx.moveTo(-180, 138);
      ctx.lineTo(-122, 138);
      ctx.moveTo(-180, 133);
      ctx.lineTo(-180, 143);
      ctx.moveTo(-122, 133);
      ctx.lineTo(-122, 143);
      ctx.stroke();
      ctx.fillText('32mm DGU', -151, 152);

      ctx.restore();

      animId = requestAnimationFrame(drawFrameProfile);
    }

    drawFrameProfile();
  }

  // 6. Category Filter Buttons (Products & Overview)
  const filterBtns = document.querySelectorAll('.filter-pill-btn');
  const systemCards = document.querySelectorAll('.system-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      systemCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 7. Fullscreen Lightbox Modal
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lbImage = document.getElementById('lbImage');
  const lbTitle = document.getElementById('lbTitle');
  const lbTag = document.getElementById('lbTag');
  const lbDesc = document.getElementById('lbDesc');
  const lbClose = document.getElementById('lightboxClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');

  const galleryData = [
    {
      img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=90&fm=webp',
      title: 'REL-SL18 Minimalist Sliding System',
      tag: '18MM ULTRA-SLIM SIGHTLINE • 4.2M HEIGHT',
      desc: 'Flush concealed floor threshold with automated tandem stainless steel bogie runners.'
    },
    {
      img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=90&fm=webp',
      title: 'REL-BF75 Concertina Bi-Fold Wall',
      tag: '95% CLEAR APERTURE • 12-METER SPAN',
      desc: 'Heavy-duty accordion folding glass wall uniting interior salons with tropical terraces.'
    },
    {
      img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=90&fm=webp',
      title: 'REL-LS150 Grand Lift & Slide Portal',
      tag: 'CYCLONIC 3500 PA • 800KG PANEL GLIDE',
      desc: 'High-altitude storm-shield fenestration engineered for 52nd-floor penthouse coastal wind loads.'
    },
    {
      img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=90&fm=webp',
      title: 'REL-CS65 Acoustic Casement & Tilt-Turn',
      tag: '48 DB STUDIO SOUND ISOLATION',
      desc: 'Triple-gasket EPDM barrier delivering sound studio quiet and zero thermal bridging.'
    },
    {
      img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=90&fm=webp',
      title: 'REL-CW50 Structural Curtain Wall Facades',
      tag: 'UNITIZED STRUCTURAL GLAZING • LEED PLATINUM',
      desc: 'Precision mullion-transom grid curtain walling for commercial high-rise headquarters.'
    },
    {
      img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=90&fm=webp',
      title: 'REL-PT30 Demountable Acoustic Partitions',
      tag: 'FLUSH FRAMELESS DRY-JOINT GLAZING',
      desc: 'Acoustic glass partitioning suites for corporate boardrooms with concealed soft-pivot doors.'
    }
  ];

  let currentGalleryIndex = 0;

  function showLightbox(index) {
    if (!lightboxOverlay) return;
    currentGalleryIndex = (index + galleryData.length) % galleryData.length;
    const item = galleryData[currentGalleryIndex];

    if (lbImage) lbImage.src = item.img;
    if (lbTitle) lbTitle.textContent = item.title;
    if (lbTag) lbTag.textContent = item.tag;
    if (lbDesc) lbDesc.textContent = item.desc;

    lightboxOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function hideLightbox() {
    if (!lightboxOverlay) return;
    lightboxOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-lightbox-index]').forEach(el => {
    el.addEventListener('click', (e) => {
      const idx = parseInt(el.dataset.lightboxIndex, 10) || 0;
      showLightbox(idx);
    });
  });

  if (lbClose) lbClose.addEventListener('click', hideLightbox);
  if (lbPrev) lbPrev.addEventListener('click', (e) => { e.stopPropagation(); showLightbox(currentGalleryIndex - 1); });
  if (lbNext) lbNext.addEventListener('click', (e) => { e.stopPropagation(); showLightbox(currentGalleryIndex + 1); });

  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', (e) => {
      if (e.target === lightboxOverlay) hideLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideLightbox();
    if (e.key === 'ArrowLeft') showLightbox(currentGalleryIndex - 1);
    if (e.key === 'ArrowRight') showLightbox(currentGalleryIndex + 1);
  });

  // 7. Interactive Specification Chips & Notes Counter
  window.appendSpecTag = function (tagText) {
    const notes = document.getElementById('fNotes');
    if (!notes) return;
    const current = notes.value.trim();
    if (current.includes(tagText)) return;
    notes.value = current ? `${current}\n• ${tagText}` : `• ${tagText}`;
    window.updateNotesCount(notes);
    notes.focus();
  };

  window.updateNotesCount = function (el) {
    const counter = document.getElementById('notesCharCounter');
    if (!counter || !el) return;
    const len = el.value.length;
    counter.textContent = `${len} / 1000 characters`;
    if (len > 900) {
      counter.style.color = 'var(--gold-primary)';
    } else {
      counter.style.color = 'var(--text-muted)';
    }
  };

  // 8. Kinetic Scroll Reveal IntersectionObserver
  const revealElements = document.querySelectorAll('.reveal-fade-up, .reveal-slide-left, .reveal-slide-right, .reveal-scale-in');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }

  // 9. Kinetic Smooth Metric Counter Engine
  const counterElements = document.querySelectorAll('[data-counter]');
  if ('IntersectionObserver' in window && counterElements.length > 0) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          observer.unobserve(el);

          const targetNum = parseFloat(el.getAttribute('data-counter')) || 0;
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const decimals = parseInt(el.getAttribute('data-decimals'), 10) || 0;
          const duration = 1600;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = (targetNum * easeProgress).toFixed(decimals);

            el.textContent = `${prefix}${currentVal}${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = `${prefix}${targetNum.toFixed(decimals)}${suffix}`;
            }
          }

          requestAnimationFrame(updateCounter);
        }
      });
    }, {
      root: null,
      threshold: 0.2
    });

    counterElements.forEach(el => counterObserver.observe(el));
  }

})();

