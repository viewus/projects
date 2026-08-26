/* ---------------------------------------------------------------------------
 * search.js — text matching over any JSON collection.
 *
 * Deliberately generic: products, recipes, blogs and categories are all just
 * arrays of objects, so one search implementation serves every page. Which
 * fields are searchable is passed in, never hardcoded here.
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  var RS = window.RS || (window.RS = {});

  /** Normalise for comparison: lowercase, collapse whitespace, drop accents. */
  function norm(value) {
    return String(value == null ? "" : value)
      .toLowerCase()
      .normalize ? String(value == null ? "" : value).toLowerCase().normalize("NFD")
        .replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim()
      : String(value == null ? "" : value).toLowerCase().trim();
  }

  /** Build the searchable haystack for one record. */
  function haystack(item, fields) {
    return norm((fields || []).map(function (field) {
      var value = RS.get(item, field);
      return Array.isArray(value) ? value.join(" ") : value;
    }).join(" "));
  }

  /**
   * Filter a list by a query string.
   *
   * Every whitespace-separated term must appear somewhere in the record, so
   * "organic rice" narrows rather than widens — which is what a shopper expects
   * from a store search.
   *
   * @param {object[]} list
   * @param {string}   query
   * @param {string[]} fields dotted keys to search, e.g. ["name","tags","brand"]
   */
  RS.search = function (list, query, fields) {
    var q = norm(query);
    if (!q) return (list || []).slice();

    var terms = q.split(" ").filter(Boolean);

    return (list || []).filter(function (item) {
      var hay = haystack(item, fields);
      return terms.every(function (term) {
        return hay.indexOf(term) > -1;
      });
    });
  };

  /**
   * Rank matches so the best ones surface first in a suggestion dropdown:
   * a name that starts with the query beats one that merely contains it.
   */
  RS.searchRanked = function (list, query, fields, primaryField) {
    var q = norm(query);
    if (!q) return [];

    var primary = primaryField || (fields && fields[0]) || "name";

    return RS.search(list, query, fields)
      .map(function (item) {
        var name = norm(RS.get(item, primary));
        var score = name.indexOf(q) === 0 ? 0 : (name.indexOf(q) > -1 ? 1 : 2);
        return { item: item, score: score, name: name };
      })
      .sort(function (a, b) {
        return a.score - b.score || a.name.localeCompare(b.name);
      })
      .map(function (row) { return row.item; });
  };

  /**
   * Wire a search input to a callback, debounced.
   * Returns a teardown function so a page can rebuild its controls safely.
   */
  RS.bindSearch = function (selector, onChange, wait) {
    var $input = $(selector);
    if (!$input.length) return function () {};

    var handler = RS.debounce(function () {
      onChange($input.val().trim());
    }, wait || 180);

    $input.on("input.rsSearch", handler);

    // Escape clears the field — expected behaviour in every store search box.
    $input.on("keydown.rsSearch", function (e) {
      if (e.key === "Escape") {
        $input.val("");
        onChange("");
        $input.trigger("blur");
      }
    });

    return function () { $input.off(".rsSearch"); };
  };

  /**
   * "/" focuses the site search from anywhere, unless the visitor is already
   * typing into a field.
   */
  RS.bindSearchHotkey = function (selector) {
    $(document).on("keydown.rsHotkey", function (e) {
      if (e.key !== "/") return;

      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;

      e.preventDefault();
      $(selector).trigger("focus");
    });
  };

})(window, jQuery);
