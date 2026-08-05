/* ---------------------------------------------------------------------------
 * reviewRenderer.js
 *
 * IMPORTANT — the sample-content guard.
 * data/reviews.json ships with placeholder entries so the page can be designed
 * and reviewed before real reviews exist. Publishing invented testimonials as
 * if they were genuine would mislead customers, so this renderer makes that
 * impossible to do by accident:
 *
 *   - any entry with placeholder:true gets a visible "SAMPLE" tag and muted
 *     styling, and
 *   - if ANY entry is a placeholder, an amber warning banner renders above
 *     the whole grid.
 *
 * Both disappear on their own once the placeholder flags are removed.
 *
 * Note also what is NOT here: no Review or AggregateRating JSON-LD is emitted.
 * Marking up invented ratings as structured data would put a fabricated star
 * rating into Google results and breaches Google's structured-data policies.
 * See learn/03-before-launch.md for the schema to add once reviews are real.
 * ------------------------------------------------------------------------- */
(function (window) {
  "use strict";

  function starsHtml(rating) {
    var value = Math.max(0, Math.min(5, Number(rating) || 0));
    var out = "";
    for (var i = 1; i <= 5; i++) {
      out += '<i class="bi ' + (i <= value ? "bi-star-fill" : "bi-star") +
        ' cardReviewStar" aria-hidden="true"></i>';
    }
    return out;
  }

  function hasPlaceholders(reviews) {
    return (reviews || []).some(function (r) { return r.placeholder; });
  }

  function renderReviewGrid(reviews) {
    return renderCardGrid((reviews || []).map(function (review) {
      return Object.assign({}, review, {
        variant: "review",
        starsHtml: starsHtml(review.rating),
        placeholderClass: review.placeholder ? "isPlaceholder" : "",
        placeholderTagHtml: review.placeholder
          ? '<span class="cardReviewSampleTag">Sample — replace before launch</span>'
          : ""
      });
    }));
  }

  window.starsHtml = starsHtml;
  window.hasPlaceholders = hasPlaceholders;
  window.renderReviewGrid = renderReviewGrid;

})(window);
