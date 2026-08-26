/* ---------------------------------------------------------------------------
 * render.js — the section engine.
 *
 * This is the file that makes the headline promise work: delete a section from
 * data/sections.json and it disappears from the site, with no code change.
 *
 * How it works
 *   sections.json holds an ORDERED array per page. Each entry names a component
 *   and where its data lives. This file walks that array, skips anything with
 *   "enabled": false, asks the registry for the matching renderer, and appends
 *   the result. Order in the array IS order on the page, so re-ordering a page
 *   is a JSON edit too.
 *
 * Adding a new section type:
 *   1. write components/sections/yourSection.html with {{token}} slots
 *   2. RS.registerComponent("yourSection", function (data, cfg) { ... })
 *   3. reference "yourSection" from sections.json
 * Nothing else in the codebase needs to know it exists.
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  var RS = window.RS || (window.RS = {});

  /* ---------- component registry -------------------------------------------- */

  var registry = {};

  /**
   * Register a renderer under a component name.
   * @param {string} name    the value used in sections.json "component"
   * @param {function} fn    (data, cfg, section) -> Promise<string>|string
   */
  RS.registerComponent = function (name, fn) {
    if (registry[name]) {
      console.warn("[render] Component '" + name + "' was registered twice; the later one wins.");
    }
    registry[name] = fn;
  };

  RS.hasComponent = function (name) {
    return Object.prototype.hasOwnProperty.call(registry, name);
  };

  /** Exposed for debugging: what section types does this build understand? */
  RS.componentNames = function () {
    return Object.keys(registry).sort();
  };

  /* ---------- section wrapper ----------------------------------------------- */

  /**
   * Wrap a rendered section so every section gets consistent hooks:
   * a stable id for anchor links, the component name for styling, and any
   * extra classes the JSON asked for.
   */
  function wrap(section, innerHtml) {
    if (!innerHtml) return "";

    var classes = ["section", "section" + section.component.charAt(0).toUpperCase() +
      section.component.slice(1)];
    if (section.className) classes.push(section.className);
    if (section.tone) classes.push("isTone" + section.tone.charAt(0).toUpperCase() + section.tone.slice(1));

    return '<section id="' + RS.escape(section.id) + '" class="' + RS.escape(classes.join(" ")) + '">' +
      innerHtml + "</section>";
  }

  /* ---------- rendering one section ----------------------------------------- */

  function renderSection(section, cfg) {
    var fn = registry[section.component];

    if (!fn) {
      // A typo in sections.json degrades exactly one section — it must never
      // blank the whole page, because the client edits this file by hand.
      console.warn(
        "[render] Unknown component '" + section.component + "' for section '" +
        section.id + "'. Known components: " + RS.componentNames().join(", ")
      );
      return $.when("");
    }

    return RS.sectionData(section.data)
      .then(function (data) {
        return fn(data, cfg, section);
      })
      .then(function (html) {
        return wrap(section, html);
      })
      .then(null, function (err) {
        console.error("[render] Section '" + section.id + "' failed:", err);
        return "";  // one bad section, not a bad page
      });
  }

  /* ---------- rendering a page ---------------------------------------------- */

  /**
   * Render every enabled section for a page key into a target element.
   *
   * @param {string} pageKey   matches a top-level key in sections.json
   * @param {string} selector  where to append (default "#sections")
   * @param {object} cfg       site config, passed to every renderer
   */
  RS.renderPage = function (pageKey, selector, cfg) {
    var $target = $(selector || "#sections");
    if (!$target.length) return $.when([]);

    return RS.json("data/sections.json").then(function (all) {
      var sections = (all && all[pageKey]) || [];

      // Detail pages (product / recipe / blog) build their body in a page
      // controller from a ?slug=, so having no sections entry is correct for
      // them and must not look like a misconfiguration.
      if (!sections.length && !(RS.pages && RS.pages[pageKey])) {
        console.warn("[render] No sections defined for page '" + pageKey + "' in sections.json.");
      }

      var enabled = sections.filter(function (s) {
        return s && s.enabled !== false && s.component;
      });

      // Render in parallel but WRITE in array order, so the page always matches
      // sections.json even though the slowest section may resolve first.
      return $.when.apply($, enabled.map(function (section) {
        return renderSection(section, cfg);
      })).then(function () {
        var parts = Array.prototype.slice.call(arguments);
        $target.html(parts.join(""));
        $target.trigger("rs:sectionsRendered", [enabled]);
        return enabled;
      });
    });
  };

  /* ---------- data-bound content -------------------------------------------- */

  /**
   * Fill every [data-content] element inside a scope from a data object.
   * Dotted keys are supported, so nested JSON reaches the page without
   * flattening it: <h1 data-content="hero.title"></h1>
   */
  RS.bindContent = function (data, scope) {
    $(scope || document).find("[data-content]").each(function () {
      var value = RS.get(data, this.getAttribute("data-content"));
      if (value != null && typeof value !== "object") this.textContent = value;
    });
  };

  /** Same idea for input placeholders, which cannot use textContent. */
  RS.bindPlaceholders = function (data, scope) {
    $(scope || document).find("[data-placeholder]").each(function () {
      var value = RS.get(data, this.getAttribute("data-placeholder"));
      if (value != null) this.setAttribute("placeholder", value);
    });
  };

  /** Point every [data-link] at a project-relative href via RS.path(). */
  RS.bindLinks = function (scope) {
    $(scope || document).find("[data-link]").each(function () {
      this.setAttribute("href", RS.path(this.getAttribute("data-link")));
    });
  };

  /** Fill [data-config] / [data-config-href] hooks from site.json. */
  RS.bindConfig = function (cfg, scope) {
    var $scope = $(scope || document);

    $scope.find("[data-config]").each(function () {
      var value = RS.get(cfg, this.getAttribute("data-config"));
      if (value != null) this.textContent = value;
    });

    $scope.find("[data-config-href]").each(function () {
      var value = RS.get(cfg, this.getAttribute("data-config-href"));
      if (value) this.setAttribute("href", value);
    });

    $scope.find("[data-config-src]").each(function () {
      var value = RS.get(cfg, this.getAttribute("data-config-src"));
      if (value) this.setAttribute("src", RS.path(value));
    });
  };

  /* ---------- empty states --------------------------------------------------- */

  /** Consistent "nothing here" block, used by every grid that can come up empty. */
  RS.emptyState = function (title, body, icon) {
    return '<div class="emptyState">' +
      '<i class="bi ' + RS.escape(icon || "bi-inbox") + ' emptyStateIcon" aria-hidden="true"></i>' +
      '<p class="emptyStateTitle">' + RS.escape(title) + "</p>" +
      (body ? '<p class="emptyStateBody">' + RS.escape(body) + "</p>" : "") +
      "</div>";
  };

})(window, jQuery);
