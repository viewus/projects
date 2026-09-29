/**
 * Master Application Orchestrator for Royal Wedding Invitation
 * Consumes data.js (Single Source of Truth) to dynamically populate UI
 */

(function () {
  'use strict';

  function initApp() {
    // Force manual scroll restoration to always start at the very top
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (typeof weddingData === 'undefined') {
      console.error('weddingData is not defined. Ensure data.js is loaded before app.js.');
      return;
    }

    // 1. Inject SEO and Document Metadata
    populateSEO(weddingData.seo);

    // 2. Populate Divine Blessings & Invocation
    populateBlessings(weddingData.blessings);

    // 3. Initialize Subsystems
    if (window.WeddingDoor && weddingData.features.door !== false) {
      window.WeddingDoor.init();
    } else {
      const door = document.getElementById('royal-door-screen');
      if (door) door.style.display = 'none';
      document.body.classList.remove('lock-scroll');
    }

    if (window.WeddingLightbox) {
      window.WeddingLightbox.init();
    }

    if (window.WeddingMusic && weddingData.features.music !== false) {
      window.WeddingMusic.init(weddingData.music);
    }

    // 4. Populate Hero Section
    populateHero(weddingData.couple);

    // 5. Initialize Live Countdown
    if (weddingData.features.countdown !== false) {
      initCountdown(weddingData.couple.weddingDate, weddingData.couple.weddingTime);
    } else {
      const countdownSec = document.getElementById('countdown-section');
      if (countdownSec) countdownSec.style.display = 'none';
    }

    // 6. Populate Our Story Section
    if (weddingData.features.story !== false && weddingData.story?.enabled) {
      populateStory(weddingData.story);
    } else {
      const storySec = document.getElementById('story-section');
      if (storySec) storySec.style.display = 'none';
    }

    // 7. Render Wedding Journey Timeline
    if (weddingData.features.timeline !== false && window.WeddingTimeline) {
      window.WeddingTimeline.render(weddingData.events);
    }

    // 8. Render Editorial Gallery
    if (weddingData.features.gallery !== false && window.WeddingGallery) {
      window.WeddingGallery.render(weddingData.gallery);
    }

    // 9. Populate Family Blessings
    if (weddingData.features.family !== false && weddingData.family?.enabled) {
      populateFamily(weddingData.family);
    } else {
      const familySec = document.getElementById('family-section');
      if (familySec) familySec.style.display = 'none';
    }

    // 10. Populate Venue & Map
    if (weddingData.features.venue !== false && window.WeddingMaps) {
      window.WeddingMaps.renderVenue(weddingData.venue);
    }

    // 11. Populate "Don't Miss a Moment" Quick Calendar Hub
    if (weddingData.features.moments !== false) {
      populateMoments(weddingData.events);
    } else {
      const momentsSec = document.getElementById('moments-section');
      if (momentsSec) momentsSec.style.display = 'none';
    }

    // 12. Populate Final Cinematic Message & Signature
    populateFinalMessage(weddingData.finalMessage, weddingData.couple);

    // 13. Setup Sharing & Copy Link Actions
    setupSharing(weddingData.couple);

    // 14. Setup Advanced Scroll Reveals & GSAP ScrollTrigger
    setupScrollReveals();

    // 15. Setup Interactive 3D Card Hover Tilt Effects
    setupCardTiltEffects();
  }

  /* --------------------------------------------------------------------------
     Vedic Blessings & Sanskrit Shloka Populator
     -------------------------------------------------------------------------- */
  function populateBlessings(blessings) {
    if (!blessings) return;
    const mainEl = document.getElementById('vedic-shloka-main');
    const subEl = document.getElementById('vedic-shloka-sub');

    if (mainEl && blessings.ganeshShloka) mainEl.textContent = blessings.ganeshShloka;
    if (subEl && blessings.mainShloka) subEl.textContent = blessings.mainShloka;
  }

  /* --------------------------------------------------------------------------
     SEO & Head Injector
     -------------------------------------------------------------------------- */
  function populateSEO(seo) {
    if (!seo) return;
    if (seo.title) document.title = seo.title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    if (seo.description) metaDesc.content = seo.description;

    let themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = document.createElement('meta');
      themeMeta.name = 'theme-color';
      document.head.appendChild(themeMeta);
    }
    if (seo.themeColor) themeMeta.content = seo.themeColor;
  }

  /* --------------------------------------------------------------------------
     Hero Section Populator (Marriage Invitation Style)
     -------------------------------------------------------------------------- */
  function populateHero(couple) {
    if (!couple) return;

    // Door Monogram Initials & Names
    const brideInit = (couple.bride?.shortName || couple.bride?.name || 'A').trim().charAt(0).toUpperCase();
    const groomInit = (couple.groom?.shortName || couple.groom?.name || 'R').trim().charAt(0).toUpperCase();
    const monogramEl = document.getElementById('door-monogram-initials');
    if (monogramEl) {
      monogramEl.innerHTML = `<span class="monogram-char">${brideInit}</span><span class="monogram-amp">&amp;</span><span class="monogram-char">${groomInit}</span>`;
    }

    const doorCoupleEl = document.getElementById('door-couple-names');
    if (doorCoupleEl && couple.bride?.shortName && couple.groom?.shortName) {
      doorCoupleEl.innerHTML = `${couple.bride.shortName} &amp; ${couple.groom.shortName}`;
    }

    // Invitation Pretexts
    const pretextEl = document.getElementById('hero-invitation-pretext');
    if (pretextEl && couple.invitationPretext) pretextEl.textContent = couple.invitationPretext;

    const quoteEl = document.getElementById('hero-invitation-quote');
    if (quoteEl && couple.invitationText) quoteEl.textContent = couple.invitationText;

    // Bride Card
    const brideNameEl = document.getElementById('hero-bride-name');
    const brideImgEl = document.getElementById('hero-bride-img');
    const brideRoleEl = document.getElementById('hero-bride-role');
    const brideBioEl = document.getElementById('hero-bride-bio');

    if (brideNameEl && couple.bride?.name) {
      const salutation = couple.bride.salutation ? `${couple.bride.salutation} ` : '';
      brideNameEl.textContent = `${salutation}${couple.bride.name}`;
    }
    if (brideRoleEl && couple.bride?.role) brideRoleEl.textContent = couple.bride.role;
    if (brideBioEl) {
      let bioText = couple.bride.bio || '';
      if (couple.bride.paternalLineage) {
        bioText += `\n✦ ${couple.bride.paternalLineage}`;
      }
      brideBioEl.innerText = bioText;
    }
    if (brideImgEl && couple.bride?.image) {
      brideImgEl.src = couple.bride.image;
      brideImgEl.alt = couple.bride.name || 'The Bride';
      brideImgEl.onerror = () => brideImgEl.parentElement.classList.add('image-failed');
    }

    // Groom Card
    const groomNameEl = document.getElementById('hero-groom-name');
    const groomImgEl = document.getElementById('hero-groom-img');
    const groomRoleEl = document.getElementById('hero-groom-role');
    const groomBioEl = document.getElementById('hero-groom-bio');

    if (groomNameEl && couple.groom?.name) {
      const salutation = couple.groom.salutation ? `${couple.groom.salutation} ` : '';
      groomNameEl.textContent = `${salutation}${couple.groom.name}`;
    }
    if (groomRoleEl && couple.groom?.role) groomRoleEl.textContent = couple.groom.role;
    if (groomBioEl) {
      let bioText = couple.groom.bio || '';
      if (couple.groom.paternalLineage) {
        bioText += `\n✦ ${couple.groom.paternalLineage}`;
      }
      groomBioEl.innerText = bioText;
    }
    if (groomImgEl && couple.groom?.image) {
      groomImgEl.src = couple.groom.image;
      groomImgEl.alt = couple.groom.name || 'The Groom';
      groomImgEl.onerror = () => groomImgEl.parentElement.classList.add('image-failed');
    }

    // Date & Muhurtham Strip
    const dateDisplayEl = document.getElementById('hero-display-date');
    if (dateDisplayEl && couple.displayDate) dateDisplayEl.textContent = couple.displayDate;

    const timeDisplayEl = document.getElementById('hero-display-time');
    if (timeDisplayEl && (couple.muhurthamTime || couple.weddingTime)) {
      timeDisplayEl.textContent = couple.muhurthamTime ? `Muhurtham: ${couple.muhurthamTime}` : couple.weddingTime;
    }

    const venueDisplayEl = document.getElementById('hero-display-venue');
    if (venueDisplayEl && couple.venueName) venueDisplayEl.textContent = couple.venueName;
  }

  /* --------------------------------------------------------------------------
     Live Countdown Calculator (Counting to Vivah Muhurtham)
     -------------------------------------------------------------------------- */
  function initCountdown(weddingDateStr, weddingTimeStr) {
    const daysEl = document.getElementById('count-days');
    const hoursEl = document.getElementById('count-hours');
    const minsEl = document.getElementById('count-mins');
    const secsEl = document.getElementById('count-secs');
    const finishedBanner = document.getElementById('countdown-finished');
    const gridEl = document.getElementById('countdown-grid');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    // Parse wedding target date
    const timeCleaned = weddingTimeStr ? weddingTimeStr.split(' ')[0] : '10:00';
    const targetTimestamp = new Date(`${weddingDateStr}T${timeCleaned}:00`).getTime();

    function update() {
      const now = new Date().getTime();
      const distance = targetTimestamp - now;

      if (distance <= 0) {
        if (gridEl) gridEl.style.display = 'none';
        if (finishedBanner) {
          finishedBanner.style.display = 'block';
          finishedBanner.innerHTML = `
            <h3 style="font-size: 1.8rem; margin-bottom: 0.5rem; color:var(--gold-bright);">✦ THE WEDDING DAY HAS ARRIVED ✦</h3>
            <p>Let the joyous wedding celebrations and blessings begin!</p>
          `;
        }
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minsEl.textContent = String(minutes).padStart(2, '0');
      secsEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  /* --------------------------------------------------------------------------
     Our Story Populator (Scrapbook)
     -------------------------------------------------------------------------- */
  function populateStory(story) {
    const titleEl = document.getElementById('story-title');
    const subtitleEl = document.getElementById('story-subtitle');
    const introEl = document.getElementById('story-intro');
    const container = document.getElementById('story-container');

    if (titleEl && story.title) titleEl.textContent = story.title;
    if (subtitleEl && story.subtitle) subtitleEl.textContent = story.subtitle;
    if (introEl && story.introduction) introEl.textContent = story.introduction;

    if (!container || !story.milestones) return;
    container.innerHTML = '';

    story.milestones.forEach((m, idx) => {
      const item = document.createElement('div');
      item.className = 'story-item reveal-fade-up';

      item.innerHTML = `
        <div class="story-polaroid">
          <img src="${m.image}" alt="${m.title}" loading="lazy">
        </div>
        <div class="story-content">
          <span class="story-year-badge">${m.year}</span>
          <h3 class="story-milestone-title">${m.title}</h3>
          <p>${m.description}</p>
        </div>
      `;

      const img = item.querySelector('img');
      if (img) {
        img.onerror = () => item.querySelector('.story-polaroid').classList.add('image-failed');
      }

      container.appendChild(item);
    });
  }

  /* --------------------------------------------------------------------------
     Family Blessings & Patrika Populator (Proper Relationship Categorization)
     -------------------------------------------------------------------------- */
  function populateFamily(family) {
    const titleEl = document.getElementById('family-title');
    const subtitleEl = document.getElementById('family-subtitle');
    const brideTitleEl = document.getElementById('family-bride-title');
    const groomTitleEl = document.getElementById('family-groom-title');
    const brideListEl = document.getElementById('family-bride-list');
    const groomListEl = document.getElementById('family-groom-list');

    if (titleEl && family.title) titleEl.textContent = family.title;
    if (subtitleEl && family.subtitle) subtitleEl.textContent = family.subtitle;

    if (brideTitleEl && family.brideSide?.title) brideTitleEl.textContent = family.brideSide.title;
    if (groomTitleEl && family.groomSide?.title) groomTitleEl.textContent = family.groomSide.title;

    // Helper to render side sections
    function renderSideSections(sideData, listContainer) {
      if (!listContainer || !sideData) return;
      listContainer.innerHTML = '';

      if (sideData.sections && Array.isArray(sideData.sections)) {
        sideData.sections.forEach((sec) => {
          const secWrapper = document.createElement('div');
          secWrapper.className = 'patrika-section-block';
          secWrapper.style.marginBottom = '1.4rem';

          const secHead = document.createElement('h4');
          secHead.className = 'patrika-subheading font-royal';
          secHead.style.cssText = 'color: var(--gold-deep); font-size: 1.05rem; margin-bottom: 0.5rem; text-align: center; border-bottom: 1px dashed rgba(212,175,55,0.3); padding-bottom: 4px;';
          secHead.textContent = sec.heading;
          secWrapper.appendChild(secHead);

          const ul = document.createElement('ul');
          ul.className = 'family-member-names';
          sec.members.forEach((name) => {
            const li = document.createElement('li');
            li.textContent = name;
            ul.appendChild(li);
          });
          secWrapper.appendChild(ul);
          listContainer.appendChild(secWrapper);
        });
      } else if (sideData.names && Array.isArray(sideData.names)) {
        const ul = document.createElement('ul');
        ul.className = 'family-member-names';
        sideData.names.forEach((name) => {
          const li = document.createElement('li');
          li.textContent = name;
          ul.appendChild(li);
        });
        listContainer.appendChild(ul);
      }
    }

    renderSideSections(family.brideSide, brideListEl);
    renderSideSections(family.groomSide, groomListEl);
  }

  /* --------------------------------------------------------------------------
     "Don't Miss a Moment" Quick Calendar Hub
     -------------------------------------------------------------------------- */
  function populateMoments(eventsList) {
    const container = document.getElementById('moments-grid');
    if (!container || !eventsList) return;

    container.innerHTML = '';

    eventsList.forEach((ev) => {
      const card = document.createElement('div');
      card.className = 'moment-card reveal-zoom-in';

      let mapBtnHtml = '';
      if (ev.map?.googleMapsUrl && ev.showMap !== false) {
        mapBtnHtml = `
          <a href="${ev.map.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-gold-outline" style="font-size: 0.75rem; padding: 8px 16px;">
            <i class="fa-solid fa-location-dot" style="margin-right:5px;"></i>
            <span>Location</span>
          </a>
        `;
      }

      card.innerHTML = `
        <div>
          <div class="moment-date-tag"><i class="${ev.icon || 'fa-solid fa-om'}" style="margin-right:4px;"></i> ${ev.displayDate || ev.date}</div>
          <h4 class="moment-card-title">${ev.title}</h4>
          <p style="font-size: 0.85rem; color: var(--gold-deep); font-weight:600; margin-bottom: 4px;">
            <i class="fa-solid fa-clock" style="margin-right:5px;"></i>${ev.displayTime || ev.startTime}
          </p>
          <p class="moment-card-venue">
            <i class="fa-solid fa-landmark-dome" style="margin-right:5px;"></i>${ev.venue}
          </p>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; align-items:center; margin-top:1rem;">
          <button class="btn-luxury moment-cal-btn" type="button" style="font-size: 0.75rem; padding: 8px 18px; width:100%;">
            <i class="fa-solid fa-calendar-plus" style="margin-right:6px;"></i>
            <span>Add to Calendar</span>
          </button>
          ${mapBtnHtml}
        </div>
      `;

      const calBtn = card.querySelector('.moment-cal-btn');
      if (calBtn) {
        calBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.WeddingCalendar) {
            window.WeddingCalendar.openCalendarMenu(ev, calBtn);
          }
        });
      }

      container.appendChild(card);
    });
  }

  /* --------------------------------------------------------------------------
     Final Marriage Invitation Message, Host Signature & RSVP
     -------------------------------------------------------------------------- */
  function populateFinalMessage(finalMsg, couple) {
    if (!finalMsg) return;

    const titleEl = document.getElementById('final-quote-title');
    const descEl = document.getElementById('final-quote-desc');
    const sigEl = document.getElementById('final-signature');
    const thankEl = document.getElementById('final-thank-you');
    const bgImg = document.getElementById('final-bg-image');

    if (titleEl && finalMsg.title) titleEl.textContent = finalMsg.title;
    if (descEl && finalMsg.description) descEl.textContent = finalMsg.description;
    if (sigEl) sigEl.textContent = finalMsg.signature || `Cordially Invited by:\nSharma & Verma Families`;
    if (thankEl && finalMsg.thankYouText) thankEl.innerText = finalMsg.thankYouText;

    if (bgImg && couple.coupleImage) {
      bgImg.src = couple.coupleImage;
      bgImg.onerror = () => bgImg.style.display = 'none';
    }
  }

  /* --------------------------------------------------------------------------
     WhatsApp & Copy Link Sharing Handlers
     -------------------------------------------------------------------------- */
  function setupSharing(couple) {
    const whatsappBtn = document.getElementById('share-whatsapp-btn');
    const copyLinkBtn = document.getElementById('copy-link-btn');

    const shareUrl = window.location.href;
    const shareText = encodeURIComponent(`We joyfully invite you to the wedding celebrations of ${couple.bride.shortName} & ${couple.groom.shortName}! 🌸✨\n\nView our digital royal invitation here:\n${shareUrl}`);

    if (whatsappBtn) {
      whatsappBtn.href = `https://api.whatsapp.com/send?text=${shareText}`;
    }

    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('✦ Invitation Link Copied to Clipboard ✦');
          }).catch(() => {
            fallbackCopy(shareUrl);
          });
        } else {
          fallbackCopy(shareUrl);
        }
      });
    }
  }

  function fallbackCopy(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast('✦ Invitation Link Copied to Clipboard ✦');
  }

  function showToast(message) {
    let toast = document.querySelector('.luxury-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'luxury-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  /* --------------------------------------------------------------------------
     Scroll Reveal Intersection Observer & GSAP ScrollTrigger Integration
     -------------------------------------------------------------------------- */
  function setupScrollReveals() {
    // If GSAP and ScrollTrigger CDN are available, configure smooth timeline animations
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // Section titles reveal & subtle stagger
      gsap.utils.toArray('.section-header').forEach((header) => {
        gsap.from(header, {
          scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          y: 40,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out'
        });
      });

      // Gallery cards stagger
      gsap.utils.toArray('.gallery-card-frame').forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none'
          },
          y: 50,
          opacity: 0,
          duration: 0.9,
          delay: (i % 3) * 0.15,
          ease: 'power3.out'
        });
      });
    }

    // Native IntersectionObserver fallback
    const revealElements = document.querySelectorAll('.reveal-fade-up, .reveal-fade-left, .reveal-fade-right, .reveal-zoom-in');

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach((el) => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach((el) => observer.observe(el));
  }

  /* --------------------------------------------------------------------------
     Interactive 3D Card Hover Tilt Effects
     -------------------------------------------------------------------------- */
  function setupCardTiltEffects() {
    const cards = document.querySelectorAll('.timeline-card, .moment-card, .family-card, .hero-portrait-card');
    
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
