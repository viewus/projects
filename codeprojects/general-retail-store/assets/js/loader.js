/* ---------------------------------------------------------------------------
 * loader.js — the ONLY place this template reads a file from.
 *
 * Every JSON file and every component template comes through here, and every
 * request is cached by path. The cache stores the *promise*, not the result,
 * so ten renderers asking for products.json during the same tick share one
 * network request rather than firing ten.
 *
 * IMPORTANT: these are AJAX requests, so the site must be served over http://.
 * Opening index.html straight off the disk (file://) is blocked by the browser's
 * CORS rules and every request here will fail. See the console hint below.
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  var RS = window.RS || (window.RS = {});

  var jsonCache = {};
  var templateCache = {};

  function isFileProtocol() {
    return window.location.protocol === "file:";
  }

  function explain(rel, status) {
    if (isFileProtocol()) {
      console.error(
        "[loader] Could not load " + rel + ".\n" +
        "This page is open via file:// — browsers block AJAX there.\n" +
        "Serve the folder instead:  python -m http.server 8000"
      );
    } else {
      console.error("[loader] Could not load " + rel + " (HTTP " + status + ")");
    }
  }

  /**
   * Fetch and cache a JSON file by project-relative path.
   * @param {string} rel e.g. "data/products.json"
   * @returns {Promise<object>}
   */
  RS.json = function (rel) {
    if (!jsonCache[rel]) {
      jsonCache[rel] = $.ajax({ url: RS.path(rel), dataType: "json" })
        .then(function (data) {
          // MUST return a single value. $.ajax resolves with three arguments
          // (data, textStatus, jqXHR); if they are passed straight through,
          // $.when(a, b) hands the caller ARRAYS rather than the parsed JSON,
          // and every cfg.something lookup silently becomes undefined.
          return data;
        }, function (xhr) {
          explain(rel, xhr && xhr.status);
          return $.Deferred().reject(new Error("Failed to load " + rel)).promise();
        });
    }
    return jsonCache[rel];
  };

  /**
   * Fetch and cache an HTML component template by project-relative path.
   * @param {string} rel e.g. "components/cards/cardProduct.html"
   * @returns {Promise<string>}
   */
  RS.template = function (rel) {
    if (!templateCache[rel]) {
      templateCache[rel] = $.ajax({ url: RS.path(rel), dataType: "html" })
        .then(function (markup) {
          return markup;   // single value — see the note in RS.json above
        }, function (xhr) {
          explain(rel, xhr && xhr.status);
          return $.Deferred().reject(new Error("Failed to load " + rel)).promise();
        });
    }
    return templateCache[rel];
  };

  /**
   * Fetch a template and fill its {{tokens}} in one step — the workhorse call
   * that nearly every renderer in this template is built on.
   */
  RS.render = function (rel, data) {
    return RS.template(rel).then(function (tpl) {
      return RS.fill(tpl, data);
    });
  };

  /**
   * Render a list of items through the same template and join the result.
   * @returns {Promise<string>} concatenated markup ("" for an empty list)
   */
  RS.renderList = function (rel, items, mapFn) {
    var list = items || [];
    if (!list.length) return $.when("");

    return $.when.apply($, list.map(function (item, index) {
      return RS.render(rel, mapFn ? mapFn(item, index) : item);
    })).then(function () {
      return Array.prototype.slice.call(arguments).join("");
    });
  };

  /* ---------- shared configuration ------------------------------------------ */

  /** Site-wide identity + contact details. Fetched once, shared by everything. */
  RS.config = function () {
    return RS.json("data/site.json");
  };

  /** Behaviour flags (page size, feature switches). */
  RS.settings = function () {
    return RS.json("data/settings.json");
  };

  /**
   * Resolve a section's "data" reference from sections.json.
   * Supports "homepage.json#hero" to pull one branch out of a larger file,
   * which keeps related content together instead of exploding into micro-files.
   *
   * @param {string} ref e.g. "categories.json" or "homepage.json#hero"
   */
  RS.sectionData = function (ref) {
    if (!ref) return $.when(null);

    var parts = String(ref).split("#");
    var file = parts[0];
    var branch = parts[1];

    return RS.json("data/" + file).then(function (data) {
      return branch ? RS.get(data, branch) : data;
    });
  };

})(window, jQuery);
