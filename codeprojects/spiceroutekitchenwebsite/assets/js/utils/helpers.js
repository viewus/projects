/* ============================================================
   helpers.js — small shared utilities used across renderers.
   No restaurant-specific content lives here.
   ============================================================ */

/** Escape a string for safe HTML interpolation. */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Format a number as currency using the settings.currencySymbol from JSON. */
function formatPrice(amount, currencySymbol) {
  const symbol = currencySymbol || "₹";
  return symbol + Number(amount).toLocaleString("en-IN");
}

/** Build a row of filled/empty spice-flame icons for a given level (0-3). */
function spiceLevelMarkup(level) {
  const max = 3;
  let html = '<span class="spiceLevel" aria-label="Spice level ' + level + ' of ' + max + '">';
  for (let i = 1; i <= max; i++) {
    html += '<i class="fa-solid fa-pepper-hot' + (i <= level ? " active" : "") + '"></i>';
  }
  html += "</span>";
  return html;
}

/** Build a row of filled/empty star icons for a rating value (rounded). */
function starMarkup(rating) {
  const rounded = Math.round(rating);
  let html = "";
  for (let i = 1; i <= 5; i++) {
    html += i <= rounded ? "★" : "☆";
  }
  return html;
}

/** Set the image src with a graceful fallback to the local placeholder SVG. */
function withImageFallback(imgTagAttrs) {
  return 'onerror="this.onerror=null;this.src=\'' + IMAGE_FALLBACK_PATH + '\';"';
}

const IMAGE_FALLBACK_PATH = "assets/svg/icons/placeholder-food.svg";

/** Simple debounce for search input handlers. */
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay || 250);
  };
}

/** Read a nested value safely, e.g. get(data, 'a.b.c'). */
function get(obj, path, fallback) {
  try {
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj) ?? fallback;
  } catch (e) {
    return fallback;
  }
}
