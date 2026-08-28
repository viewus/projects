/* ---------------------------------------------------------------------------
 * filter.js — declarative filtering and sorting for any JSON collection.
 *
 * A filter state object looks like:
 *   { category: "fruits", brand: ["tata","aashirvaad"], maxPrice: 500,
 *     tags: ["organic"], inStock: true, sort: "priceAsc" }
 *
 * Which keys are meaningful is decided by the caller's field map, not by this
 * file — so the same engine filters products, recipes and blog posts.
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  var RS = window.RS || (window.RS = {});

  /** Does an item's value satisfy a wanted value (scalar or array)? */
  function matchesValue(itemValue, wanted) {
    if (wanted == null || wanted === "" || (Array.isArray(wanted) && !wanted.length)) {
      return true;  // no constraint set
    }

    var wantedList = Array.isArray(wanted) ? wanted : [wanted];

    // Item value may itself be a list (tags), in which case any overlap counts.
    if (Array.isArray(itemValue)) {
      return wantedList.some(function (w) { return itemValue.indexOf(w) > -1; });
    }

    return wantedList.indexOf(itemValue) > -1;
  }

  var sorters = {
    relevance:  null,  // keep incoming order
    priceAsc:   function (a, b) { return (a.price || 0) - (b.price || 0); },
    priceDesc:  function (a, b) { return (b.price || 0) - (a.price || 0); },
    nameAsc:    function (a, b) { return String(a.name || "").localeCompare(String(b.name || "")); },
    nameDesc:   function (a, b) { return String(b.name || "").localeCompare(String(a.name || "")); },
    discount:   function (a, b) {
      return RS.discountPercent(b.mrp, b.price) - RS.discountPercent(a.mrp, a.price);
    },
    popularity: function (a, b) { return (b.popularity || 0) - (a.popularity || 0); },
    latest:     function (a, b) { return new Date(b.date || 0) - new Date(a.date || 0); },
    rating:     function (a, b) { return (b.rating || 0) - (a.rating || 0); }
  };

  RS.sortOptions = Object.keys(sorters);

  /**
   * Apply a filter state to a list.
   *
   * @param {object[]} list
   * @param {object}   state  see file header
   * @param {object}   map    which item field each state key tests, e.g.
   *                          { category: "category", brand: "brand", tags: "tags" }
   */
  RS.filter = function (list, state, map) {
    var s = state || {};
    var fields = map || {};

    var out = (list || []).filter(function (item) {
      // Equality / membership constraints
      var passesFields = Object.keys(fields).every(function (stateKey) {
        return matchesValue(RS.get(item, fields[stateKey]), s[stateKey]);
      });
      if (!passesFields) return false;

      // Price window
      if (s.minPrice != null && s.minPrice !== "" && Number(item.price) < Number(s.minPrice)) return false;
      if (s.maxPrice != null && s.maxPrice !== "" && Number(item.price) > Number(s.maxPrice)) return false;

      // Availability
      if (s.inStock && item.inStock === false) return false;

      // Discounted only
      if (s.onOffer && RS.discountPercent(item.mrp, item.price) <= 0) return false;

      return true;
    });

    var sorter = sorters[s.sort];
    return sorter ? RS.sortBy(out, sorter) : out;
  };

  /**
   * Build the set of available filter values from the data itself, so a new
   * product with a new brand appears in the brand filter with no code change.
   *
   * @returns {object} { category: [...], brand: [...], tags: [...] }
   */
  RS.facets = function (list, map) {
    var out = {};
    Object.keys(map || {}).forEach(function (stateKey) {
      out[stateKey] = RS.collect(list, map[stateKey]).sort(function (a, b) {
        return String(a).localeCompare(String(b));
      });
    });
    return out;
  };

  /** Price bounds across a list, for setting slider min/max from the data. */
  RS.priceRange = function (list) {
    var prices = (list || []).map(function (item) { return Number(item.price); })
      .filter(function (n) { return isFinite(n); });

    if (!prices.length) return { min: 0, max: 0 };
    return { min: Math.floor(Math.min.apply(null, prices)), max: Math.ceil(Math.max.apply(null, prices)) };
  };

  /* ---------- URL sync -------------------------------------------------------- */

  /**
   * Read filter state from the query string, so a filtered view is linkable and
   * survives a refresh — "?category=fruits&sort=priceAsc".
   */
  RS.filterStateFromUrl = function (keys) {
    var params = new URLSearchParams(window.location.search);
    var state = {};

    (keys || []).forEach(function (key) {
      var value = params.get(key);
      if (value == null || value === "") return;
      state[key] = value.indexOf(",") > -1 ? value.split(",") : value;
    });

    return state;
  };

  /** Write filter state back to the URL without adding a history entry. */
  RS.filterStateToUrl = function (state) {
    var params = new URLSearchParams();

    Object.keys(state || {}).forEach(function (key) {
      var value = state[key];
      if (value == null || value === "" || (Array.isArray(value) && !value.length)) return;
      params.set(key, Array.isArray(value) ? value.join(",") : value);
    });

    var query = params.toString();
    var url = window.location.pathname + (query ? "?" + query : "");
    window.history.replaceState(null, "", url);
  };

})(window, jQuery);
