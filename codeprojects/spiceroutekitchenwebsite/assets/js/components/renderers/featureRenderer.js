/* ============================================================
   featureRenderer.js — reusable "Why Choose Us" feature card.
   ============================================================ */

function renderFeatureCard(feature) {
  return (
    '<div class="featureCard" data-reveal>' +
      '<div class="featureIcon"><i class="' + escapeHtml(feature.icon) + '" aria-hidden="true"></i></div>' +
      "<h3>" + escapeHtml(feature.title) + "</h3>" +
      "<p>" + escapeHtml(feature.description) + "</p>" +
    "</div>"
  );
}

function renderFeatures(features) {
  return (features || []).map(renderFeatureCard).join("");
}
