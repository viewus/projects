/* ---------------------------------------------------------------------------
 * paths.js — depth-agnostic path resolution. Must load FIRST on every page.
 *
 * Pages in this site sit at three different depths:
 *     index.html                     -> project root
 *     pages/about.html               -> one level down
 *     pages/blog/why-millets.html    -> two levels down
 *
 * Hardcoding "../" per page breaks the moment a file moves. Instead this script
 * works out the project root from ITS OWN location: it always lives at
 * assets/js/paths.js, so stripping that suffix off its src leaves the root.
 * That holds at localhost:8000/ and at /punarjiva_organics/ alike.
 *
 * Must be a plain <script src>: document.currentScript is null for modules and
 * unreliable for async/defer scripts.
 * ------------------------------------------------------------------------- */
(function () {
  "use strict";

  var src = (document.currentScript && document.currentScript.src) || "";
  var base = src.replace(/assets\/js\/paths\.js(\?.*)?$/, "");

  if (!base) {
    // Only reachable if the script was inlined or renamed. Fall back to the
    // document's own directory so the page degrades instead of dying silently.
    base = new URL(".", window.location.href).href;
    console.warn("[paths.js] Could not derive project root from script src; falling back to", base);
  }

  window.pjBase = base;

  /**
   * Resolve a project-relative path (no leading "../") to an absolute URL.
   * @param {string} rel e.g. "components/navBar.html", "data/blog.json"
   */
  window.pjPath = function (rel) {
    return window.pjBase + String(rel || "").replace(/^\.?\//, "");
  };
})();
