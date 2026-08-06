/* ---------------------------------------------------------------------------
 * bannerRenderer.js — hero, promo strip and the amber notice banner.
 * ------------------------------------------------------------------------- */
(function (window) {
  "use strict";

  var bannerVariantFiles = {
    hero:   "components/banners/bannerHero.html",
    page:   "components/banners/bannerPage.html",
    promo:  "components/banners/bannerPromo.html",
    notice: "components/banners/bannerNotice.html",
    // Rendered by productRenderer.renderSpotlight(), which supplies the tokens
    // from a product entry. Listed here for the same reason as above.
    spotlight: "components/banners/bannerSpotlight.html"
  };

  function renderBanner(banner, variant) {
    var chosen = variant || banner.variant || "hero";
    var file = bannerVariantFiles[chosen] || bannerVariantFiles.hero;
    return pjRender(file, banner);
  }

  /** Convenience wrapper for the amber "this content is not final" strip. */
  function renderNotice(title, body) {
    return renderBanner({ title: title, body: body }, "notice");
  }

  window.bannerVariantFiles = bannerVariantFiles;
  window.renderBanner = renderBanner;
  window.renderNotice = renderNotice;

})(window);
