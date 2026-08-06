/* ---------------------------------------------------------------------------
 * cardRenderer.js — one variant-to-file map, one render function.
 *
 * To add a brand-new card design:
 *   1. create components/cards/cardYourName.html with {{token}} placeholders
 *   2. add one line to cardVariantFiles below
 *   3. style .cardYourName in assets/css/components/card.css
 * Existing cards are untouched until their JSON "variant" says otherwise.
 * ------------------------------------------------------------------------- */
(function (window) {
  "use strict";

  var cardVariantFiles = {
    elevated: "components/cards/cardElevated.html",
    outline:  "components/cards/cardOutline.html",
    minimal:  "components/cards/cardMinimal.html",
    blog:     "components/cards/cardBlog.html",
    review:   "components/cards/cardReview.html",
    category: "components/cards/cardCategory.html",
    // Filled by productRenderer.js rather than renderCard() — it needs the
    // catalogue's own lookups for badges and tag labels. Listed here so the
    // variant map stays the one place that answers "what cards exist?".
    product:  "components/cards/cardProduct.html"
  };

  /** Build the <li> markup for a card's bullet list, if it has one. */
  function itemsHtml(items) {
    if (!items || !items.length) return "";
    return items.map(function (item) {
      return '<li class="cardListItem">' + pjEscape(item) + "</li>";
    }).join("");
  }

  function renderCard(card, fallbackVariant) {
    var variant = card.variant || fallbackVariant || "elevated";
    var file = cardVariantFiles[variant] || cardVariantFiles.elevated;

    var data = Object.assign({}, card, {
      itemsHtml: itemsHtml(card.items),
      icon: card.icon || "bi-dot"
    });

    return pjRender(file, data);
  }

  function renderCardGrid(cards, fallbackVariant) {
    return Promise.all((cards || []).map(function (card) {
      return renderCard(card, fallbackVariant);
    })).then(function (parts) {
      return parts.join("");
    });
  }

  window.cardVariantFiles = cardVariantFiles;
  window.renderCard = renderCard;
  window.renderCardGrid = renderCardGrid;

})(window);
