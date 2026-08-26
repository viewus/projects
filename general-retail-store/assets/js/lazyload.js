/* ---------------------------------------------------------------------------
 * lazyload.js — deferred image loading and scroll-in animations.
 *
 * Most images here use the browser's native loading="lazy", which is the right
 * default and costs nothing. This file covers the two cases native lazy loading
 * does not: CSS background images, and revealing sections as they scroll in.
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  var RS = window.RS || (window.RS = {});

  var supportsObserver = "IntersectionObserver" in window;

  /**
   * Swap [data-bg] into an inline background-image once the element nears the
   * viewport. Without an observer we simply load them all — a slower first
   * paint is far better than a page of empty boxes.
   */
  function initBackgrounds() {
    var nodes = document.querySelectorAll("[data-bg]");
    if (!nodes.length) return;

    function load(el) {
      var url = el.getAttribute("data-bg");
      if (!url) return;
      el.style.backgroundImage = 'url("' + url + '")';
      el.removeAttribute("data-bg");
      el.classList.add("isLoaded");
    }

    if (!supportsObserver) {
      Array.prototype.forEach.call(nodes, load);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        load(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "200px" });

    Array.prototype.forEach.call(nodes, function (el) { observer.observe(el); });
  }

  /**
   * Add .isVisible to [data-reveal] elements as they scroll in, which drives the
   * entrance animations in animations.css.
   *
   * Respects prefers-reduced-motion by revealing everything immediately — the
   * content must never depend on an animation the visitor has opted out of.
   */
  function initReveal() {
    var nodes = document.querySelectorAll("[data-reveal]");
    if (!nodes.length) return;

    if (RS.reducedMotion() || !supportsObserver) {
      Array.prototype.forEach.call(nodes, function (el) { el.classList.add("isVisible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("isVisible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -60px 0px", threshold: 0.08 });

    Array.prototype.forEach.call(nodes, function (el) { observer.observe(el); });
  }

  /**
   * Attach the SVG fallback to any image that did not get one inline.
   * Covers images rendered by code paths that build <img> without RS.imgAttrs.
   */
  function initImageFallback() {
    $(document).on("error.rsImg", "img", function () {
      var img = this;
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = "1";
      img.src = RS.placeholder(img.getAttribute("alt") || "?");
    });
  }

  /** Safe to call repeatedly — new nodes get observed, existing ones are skipped. */
  RS.initLazyLoad = function () {
    initBackgrounds();
    initReveal();
    initImageFallback();
  };

})(window, jQuery);
