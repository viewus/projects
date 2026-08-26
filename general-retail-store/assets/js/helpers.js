/* ---------------------------------------------------------------------------
 * helpers.js — pure utility functions. No DOM writes, no fetching.
 *
 * Everything here is deliberately side-effect free so it can be called from any
 * renderer in any order.
 * ------------------------------------------------------------------------- */
(function (window) {
  "use strict";

  var RS = window.RS || (window.RS = {});

  /* ---------- escaping ------------------------------------------------------ */

  /**
   * HTML-escape a value for safe interpolation. Every token written into a
   * template goes through this unless its key ends in "Html".
   */
  RS.escape = function (value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  /* ---------- object access ------------------------------------------------- */

  /**
   * Read a dotted key out of a nested object without throwing on gaps.
   * RS.get(cfg, "contact.phone") -> "+91 90000 00000"
   */
  RS.get = function (obj, dottedKey) {
    if (!dottedKey) return undefined;
    return String(dottedKey).split(".").reduce(function (acc, part) {
      return acc == null ? undefined : acc[part];
    }, obj);
  };

  /* ---------- template filling ---------------------------------------------- */

  /**
   * Replace {{token}} placeholders in a template string.
   *
   * Keys ending in "Html" are inserted raw — they are markup WE generated.
   * Every other value is HTML-escaped. Unmatched tokens are cleared, so a
   * visitor never sees a literal "{{image}}" when a JSON field is missing.
   *
   * @param {string} template markup containing {{token}} slots
   * @param {object} data     token values
   */
  RS.fill = function (template, data) {
    var out = String(template == null ? "" : template);

    Object.keys(data || {}).forEach(function (key) {
      var value = data[key];
      var replacement = /Html$/.test(key)
        ? (value == null ? "" : value)
        : RS.escape(value);
      out = out.split("{{" + key + "}}").join(replacement);
    });

    return out.replace(/\{\{\s*[\w.]+\s*\}\}/g, "");
  };

  /* ---------- formatting ---------------------------------------------------- */

  /**
   * Format a number as currency using the site's configured locale/currency.
   * Falls back to a plain symbol + number if Intl is unavailable.
   */
  RS.money = function (amount, cfg) {
    var currency = RS.get(cfg, "currency.code") || "INR";
    var locale = RS.get(cfg, "currency.locale") || "en-IN";
    var symbol = RS.get(cfg, "currency.symbol") || "₹";
    var value = Number(amount);

    if (!isFinite(value)) return "";

    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
        maximumFractionDigits: value % 1 === 0 ? 0 : 2
      }).format(value);
    } catch (err) {
      return symbol + value.toFixed(value % 1 === 0 ? 0 : 2);
    }
  };

  /** Percentage saved between a struck-through price and the selling price. */
  RS.discountPercent = function (mrp, price) {
    var a = Number(mrp);
    var b = Number(price);
    if (!isFinite(a) || !isFinite(b) || a <= 0 || b >= a) return 0;
    return Math.round(((a - b) / a) * 100);
  };

  /** "2026-03-14" -> "14 March 2026". Returns the input unchanged if unparseable. */
  RS.formatDate = function (value, locale) {
    var date = new Date(value);
    if (isNaN(date.getTime())) return value || "";
    return date.toLocaleDateString(locale || "en-IN", {
      day: "numeric", month: "long", year: "numeric"
    });
  };

  /** Cut text to a word boundary, appending an ellipsis only if it was cut. */
  RS.truncate = function (text, maxChars) {
    var str = String(text == null ? "" : text);
    if (str.length <= maxChars) return str;
    return str.slice(0, str.lastIndexOf(" ", maxChars)).replace(/[,.;:]$/, "") + "…";
  };

  /** "Fresh Fruits & Veg" -> "fresh-fruits-veg" */
  RS.slugify = function (text) {
    return String(text == null ? "" : text)
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  /* ---------- arrays -------------------------------------------------------- */

  /** Unique values, order preserved. */
  RS.unique = function (list) {
    return (list || []).filter(function (item, i, arr) {
      return arr.indexOf(item) === i;
    });
  };

  /** Flatten one level and de-duplicate — used to collect tags across products. */
  RS.collect = function (list, key) {
    var out = [];
    (list || []).forEach(function (item) {
      var value = item[key];
      if (Array.isArray(value)) out = out.concat(value);
      else if (value != null && value !== "") out.push(value);
    });
    return RS.unique(out);
  };

  /** Stable sort by a comparator, without mutating the input array. */
  RS.sortBy = function (list, compare) {
    return (list || []).slice().sort(compare);
  };

  /* ---------- timing -------------------------------------------------------- */

  /** Trailing debounce — used by the search box so we filter on pause, not per keystroke. */
  RS.debounce = function (fn, wait) {
    var timer;
    return function () {
      var args = arguments;
      var self = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(self, args); }, wait || 150);
    };
  };

  /* ---------- media queries -------------------------------------------------- */

  /**
   * Guarded media-query test.
   *
   * window.matchMedia is missing in a few older browsers and in non-browser
   * environments, and an unguarded call throws — which, from inside the boot
   * chain, takes down the whole page rather than one animation. Always ask
   * through here.
   *
   * @returns {boolean} false when matchMedia is unavailable
   */
  RS.matches = function (query) {
    return !!(window.matchMedia && window.matchMedia(query).matches);
  };

  /** Has the visitor asked for less motion? */
  RS.reducedMotion = function () {
    return RS.matches("(prefers-reduced-motion: reduce)");
  };

  /** Scroll behaviour that respects the reduced-motion preference. */
  RS.scrollBehavior = function () {
    return RS.reducedMotion() ? "auto" : "smooth";
  };

  /* ---------- images -------------------------------------------------------- */

  /**
   * Inline-SVG data URI used whenever a remote image fails to load.
   *
   * The template ships with Unsplash URLs in its JSON so the demo looks like a
   * real store, but those are third-party and can rot or rate-limit. Rather
   * than showing a broken-image icon, every <img> falls back to a generated
   * tile carrying the item's own colour and initial — so the grid still reads
   * correctly offline, and a client swapping in real photos changes only JSON.
   */
  RS.placeholder = function (label, color) {
    var initial = RS.escape(String(label || "?").trim().charAt(0).toUpperCase());
    var bg = color || "#e9ecef";
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">' +
      '<rect width="600" height="450" fill="' + bg + '"/>' +
      '<text x="300" y="250" text-anchor="middle" font-family="Georgia,serif" font-size="160"' +
      ' fill="rgba(255,255,255,.85)">' + initial + "</text></svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  };

  /**
   * Build the src/onerror pair for an image that should degrade to a placeholder.
   * Returns an attribute string ready to drop into a template.
   */
  RS.imgAttrs = function (src, label, color) {
    var fallback = RS.placeholder(label, color);
    return 'src="' + RS.escape(src || fallback) + '" ' +
      'onerror="this.onerror=null;this.src=\'' + fallback + '\'"';
  };

})(window);
