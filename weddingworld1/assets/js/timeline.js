/**
 * Interactive Wedding Journey Timeline Builder
 */

(function () {
  'use strict';

  function renderTimeline(eventsList) {
    const trackContainer = document.getElementById('timeline-track');
    const timelineSection = document.getElementById('timeline-section');

    if (!trackContainer || !eventsList || !eventsList.length) {
      if (timelineSection) timelineSection.style.display = 'none';
      return;
    }

    trackContainer.innerHTML = '<div class="timeline-central-vine"></div>';

    eventsList.forEach((ev, index) => {
      const row = document.createElement('div');
      row.className = 'timeline-event-row';

      const padIndex = String(index + 1).padStart(2, '0');

      // Center Node Pin
      const pin = document.createElement('div');
      pin.className = 'timeline-node-pin';
      pin.textContent = padIndex;
      row.appendChild(pin);

      // Event Card
      const card = document.createElement('div');
      card.className = `timeline-card paper-card deckled-card ${index % 2 === 0 ? 'reveal-fade-right' : 'reveal-fade-left'}`;

      let imageHtml = '';
      if (ev.image && ev.showImage !== false) {
        imageHtml = `
          <div class="timeline-event-image-wrapper" data-img-src="${ev.image}" data-img-caption="${ev.title} - ${ev.displayDate || ev.date}">
            <img src="${ev.image}" alt="${ev.title}" loading="lazy">
            <div class="timeline-image-zoom-badge">
              <i class="fa-solid fa-magnifying-glass-plus" style="font-size:0.75rem;"></i>
              <span>View Photo</span>
            </div>
          </div>
        `;
      }

      let actionsHtml = '';
      if (ev.calendar?.enabled !== false && ev.showCalendar !== false) {
        actionsHtml += `
          <div class="calendar-btn-holder" style="display:inline-block;">
            <button class="btn-luxury timeline-cal-btn" type="button">
              <i class="fa-solid fa-calendar-plus" style="margin-right:6px;"></i>
              <span>Add to Calendar</span>
            </button>
          </div>
        `;
      }

      if (ev.map?.googleMapsUrl && ev.showMap !== false) {
        actionsHtml += `
          <a href="${ev.map.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-gold-outline">
            <i class="fa-solid fa-location-dot" style="margin-right:6px;"></i>
            <span>View Location</span>
          </a>
        `;
      }

      const iconClass = ev.icon || 'fa-solid fa-om';

      card.innerHTML = `
        ${imageHtml}
        <div class="timeline-event-date-badge">
          <i class="${iconClass}" style="margin-right:4px;"></i>
          <span>${ev.displayDate || ev.date}</span>
        </div>
        <h3 class="timeline-event-title">${ev.title}</h3>
        <div class="timeline-event-time-venue">
          <span><i class="fa-solid fa-clock" style="color:var(--gold-deep); margin-right:6px; width:14px;"></i>${ev.displayTime || (ev.startTime + ' - ' + ev.endTime)}</span>
          <span><i class="fa-solid fa-landmark-dome" style="color:var(--gold-deep); margin-right:6px; width:14px;"></i>${ev.venue}${ev.address ? ' — ' + ev.address : ''}</span>
        </div>
        <p class="timeline-event-desc">${ev.description || ''}</p>
        <div class="timeline-actions-row">
          ${actionsHtml}
        </div>
      `;

      // Attach image click lightbox
      const imgWrapper = card.querySelector('.timeline-event-image-wrapper');
      if (imgWrapper) {
        const imgElement = imgWrapper.querySelector('img');
        imgElement.onerror = () => {
          imgWrapper.classList.add('image-failed');
        };

        imgWrapper.addEventListener('click', () => {
          if (window.WeddingLightbox) {
            window.WeddingLightbox.open([{ src: ev.image, caption: `${ev.title} — ${ev.venue}` }]);
          }
        });
      }

      // Attach calendar dropdown click
      const calBtn = card.querySelector('.timeline-cal-btn');
      if (calBtn) {
        calBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.WeddingCalendar) {
            window.WeddingCalendar.openCalendarMenu(ev, calBtn);
          }
        });
      }

      row.appendChild(card);
      trackContainer.appendChild(row);
    });
  }

  window.WeddingTimeline = {
    render: renderTimeline
  };
})();
