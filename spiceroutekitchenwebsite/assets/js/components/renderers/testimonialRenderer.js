/* ============================================================
   testimonialRenderer.js — reusable customer review card.
   ============================================================ */

function renderTestimonialCard(t) {
  return (
    '<div class="testimonialCard" data-reveal>' +
      '<div class="testimonialStars" aria-label="' + t.rating + ' out of 5 stars">' + starMarkup(t.rating) + "</div>" +
      '<p class="testimonialReview">&ldquo;' + escapeHtml(t.review) + '&rdquo;</p>' +
      '<div class="testimonialAuthor">' +
        '<img src="' + escapeHtml(t.avatar) + '" alt="' + escapeHtml(t.name) + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + IMAGE_FALLBACK_PATH + '\';">' +
        "<div>" +
          '<div class="testimonialName">' + escapeHtml(t.name) + "</div>" +
          '<div class="testimonialRole">' + escapeHtml(t.role || "Verified Customer") + "</div>" +
        "</div>" +
      "</div>" +
    "</div>"
  );
}

function renderTestimonials(list) {
  return (list || []).map(renderTestimonialCard).join("");
}
