/**
 * Wedding Venue & Maps Helper
 */

(function () {
  'use strict';

  function renderVenue(venueData) {
    const venueSection = document.getElementById('venue-section');
    if (!venueSection) return;

    if (!venueData || !venueData.enabled) {
      venueSection.style.display = 'none';
      return;
    }

    const titleEl = document.getElementById('venue-title');
    const nameEl = document.getElementById('venue-name');
    const addressEl = document.getElementById('venue-address');
    const heroImg = document.getElementById('venue-hero-image');
    const mapBtn = document.getElementById('venue-map-btn');
    const dirBtn = document.getElementById('venue-directions-btn');

    if (titleEl && venueData.sectionTitle) titleEl.textContent = venueData.sectionTitle;
    if (nameEl && venueData.name) nameEl.textContent = venueData.name;
    if (addressEl && venueData.address) addressEl.textContent = venueData.address;

    if (heroImg && venueData.image) {
      heroImg.src = venueData.image;
      heroImg.onerror = () => {
        heroImg.parentElement.classList.add('image-failed');
      };
    }

    const mapsUrl = venueData.googleMapsUrl || (venueData.latitude && venueData.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${venueData.latitude},${venueData.longitude}`
      : '#');

    if (mapBtn) {
      mapBtn.href = mapsUrl;
    }

    if (dirBtn) {
      dirBtn.href = mapsUrl;
    }
  }

  window.WeddingMaps = {
    renderVenue: renderVenue
  };
})();
