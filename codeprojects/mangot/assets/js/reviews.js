/**
 * assets/js/reviews.js
 * Modern Luxury B2B Client Reviews Showcase
 * Renders verified trade partner review cards with rich metrics, flags, and pagination.
 */
function renderReviews() {
  const container = document.getElementById('reviews-container-dynamic');
  if (!container || typeof REVIEWS === 'undefined') return;

  container.innerHTML = `
    <div class="reviews-stats-bar fade-up">
      <div class="rsb-item">
        <div class="rsb-num">4.96 <span class="rsb-star">&#11088;</span></div>
        <div class="rsb-label">Global Buyer Satisfaction Rating</div>
      </div>
      <div class="rsb-divider"></div>
      <div class="rsb-item">
        <div class="rsb-num">100%</div>
        <div class="rsb-label">Phytosanitary &amp; GAP Compliance</div>
      </div>
      <div class="rsb-divider"></div>
      <div class="rsb-item">
        <div class="rsb-num">18+</div>
        <div class="rsb-label">International Destination Ports</div>
      </div>
    </div>

    <div class="reviews-bento-grid">
      ${REVIEWS.map((r, i) => `
        <div class="review-bento-card fade-up" style="transition-delay: ${(i % 3) * 0.1}s">
          <div class="rbc-top">
            <div class="rbc-location-pill">
              <span class="rbc-flag">${r.flag}</span>
              <span class="rbc-loc-text">${r.location}</span>
            </div>
            <div class="rbc-rating">${'&#11088;'.repeat(r.rating)}</div>
          </div>

          <div class="rbc-highlight">${r.highlight}</div>

          <p class="rbc-text">&ldquo;${r.text}&rdquo;</p>

          <div class="rbc-consignment-tag">
            <span class="rbc-con-icon">&#x1F4E6;</span> ${r.consignment}
          </div>

          <div class="rbc-footer">
            <div class="rbc-avatar-wrap">
              <img src="${r.avatar}" alt="${r.name}" loading="lazy" />
              <div class="rbc-verified-badge" title="Verified Trade Partner">&#x2713;</div>
            </div>
            <div class="rbc-author-info">
              <div class="rbc-author-name">${r.name}</div>
              <div class="rbc-author-role">${r.role} &middot; <span class="rbc-company">${r.company}</span></div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  if (window.initFadeIn) window.initFadeIn();
}

document.addEventListener('DOMContentLoaded', renderReviews);
