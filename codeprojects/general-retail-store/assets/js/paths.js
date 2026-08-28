/* ---------------------------------------------------------------------------
 * paths.js — depth-agnostic path resolution. Must load FIRST on every page.
 *
 * Pages in this template sit at two different depths:
 *     index.html              -> project root
 *     pages/products.html     -> one level down
 *
 * Hardcoding "../" per page breaks the moment a file moves, and hardcoding
 * "/assets/..." breaks the moment the site is served from a subfolder. Instead
 * this script works out the project root from ITS OWN location: it always lives
 * at assets/js/paths.js, so stripping that suffix off its src leaves the root.
 *
 * That single trick is what makes the same build work unchanged at:
 *     http://localhost:8000/general-retail-store/
 *     https://user.github.io/repo/general-retail-store/
 *     https://site.netlify.app/
 *
 * Must be a plain <script src> loaded WITHOUT defer/async: document.currentScript
 * is null for modules and unreliable for deferred scripts.
 * ------------------------------------------------------------------------- */
(function (window) {
  "use strict";

  var src = (document.currentScript && document.currentScript.src) || "";
  var base = src.replace(/assets\/js\/paths\.js(\?.*)?$/, "");

  if (!base || base === src) {
    // Only reachable if the script was inlined or renamed. Fall back to the
    // document's own directory so the page degrades instead of dying silently.
    base = new URL(".", window.location.href).href;
    console.warn("[paths] Could not derive project root from script src; falling back to", base);
  }

  /** The single namespace this template exports. Everything hangs off RS. */
  var RS = window.RS || (window.RS = {});

  RS.base = base;

  /**
   * Resolve a project-relative path to an absolute URL.
   * Always use this — never write "assets/..." or "/assets/..." directly.
   *
   * @param {string} rel e.g. "data/products.json", "pages/contact.html"
   * @returns {string} absolute URL
   */
  RS.path = function (rel) {
    return RS.base + String(rel == null ? "" : rel).replace(/^\.?\//, "");
  };

  /**
   * Read a query-string parameter. Detail pages use this (?slug=basmati-rice)
   * so one HTML file can serve every product, recipe or blog post.
   */
  RS.param = function (name) {
    return new URLSearchParams(window.location.search).get(name);
  };
})(window);
