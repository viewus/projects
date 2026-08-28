/* ---------------------------------------------------------------------------
 * app.js — page orchestration. Loads LAST, after every other script.
 *
 * Order below is deliberate and must not be shuffled:
 *
 *   1. theme      — before anything paints, so there is no light-to-dark flash
 *   2. config     — site.json + settings.json, needed by every renderer
 *   3. chrome     — header / nav / footer / breadcrumbs / floating actions
 *   4. bindings   — [data-config] hooks, including ones inside the chrome that
 *                   only just landed in the DOM (this is why it comes after 3)
 *   5. sections   — the page body, driven by sections.json
 *   6. post       — lazy loading, SEO schema, analytics: all need final markup
 *
 * Steps 3 and 4 must stay in this order: chrome injection is asynchronous, so
 * binding before it lands would silently skip every hook inside the footer.
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  var RS = window.RS || (window.RS = {});

  /* ---------- 1. theme ------------------------------------------------------- */

  /**
   * Apply theme tokens from theme.json onto :root as CSS custom properties.
   * This is what makes a re-skin a JSON edit: change theme.json, get a new
   * brand, touch no CSS.
   */
  function applyTheme(theme) {
    if (!theme) return;

    var root = document.documentElement;
    var tokens = theme.tokens || {};

    Object.keys(tokens).forEach(function (name) {
      root.style.setProperty("--" + name, tokens[name]);
    });

    if (theme.fontHeading) root.style.setProperty("--fontHeading", theme.fontHeading);
    if (theme.fontBody) root.style.setProperty("--fontBody", theme.fontBody);
    if (theme.radius) root.style.setProperty("--radius", theme.radius);
  }

  /** Dark mode: stored choice wins, otherwise follow the OS. */
  function initColorScheme(settings) {
    var stored = RS.store.get("theme", null);
    var prefersDark = RS.matches("(prefers-color-scheme: dark)");
    var allowDark = !settings || settings.darkMode !== false;

    var mode = stored || (allowDark && prefersDark ? "dark" : "light");
    setColorScheme(mode);
  }

  function setColorScheme(mode) {
    document.documentElement.setAttribute("data-theme", mode);
    var meta = document.getElementById("themeColorMeta");
    if (meta) {
      meta.setAttribute("content", getComputedStyle(document.documentElement)
        .getPropertyValue(mode === "dark" ? "--bgDark" : "--brand").trim() || "#ffffff");
    }
  }

  RS.toggleColorScheme = function () {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setColorScheme(next);
    RS.store.set("theme", next);
    $(document).trigger("rs:themeChanged", [next]);
    return next;
  };

  /* ---------- 3. chrome ------------------------------------------------------ */

  /** Inject one component file into a placeholder, if that placeholder exists. */
  function inject(selector, componentPath) {
    var $target = $(selector);
    if (!$target.length) return $.when(false);

    return RS.template(componentPath).then(function (html) {
      $target.html(html);
      return true;
    }, function () {
      return false;  // loader.js has already explained the failure
    });
  }

  function loadChrome() {
    return $.when(
      inject("#headerPlaceholder", "components/header.html"),
      inject("#navPlaceholder", "components/nav.html"),
      inject("#breadcrumbPlaceholder", "components/breadcrumb.html"),
      inject("#newsletterPlaceholder", "components/newsletter.html"),
      inject("#footerPlaceholder", "components/footer.html"),
      inject("#floatingPlaceholder", "components/floatingActions.html")
    );
  }

  /* ---------- boot ----------------------------------------------------------- */

  function boot() {
    var pageKey = RS.currentPage();

    return $.when(RS.config(), RS.settings(), RS.json("data/theme.json"))
      .then(function (cfg, settings, theme) {
        applyTheme(theme);
        initColorScheme(settings);

        RS.cfg = cfg;
        RS.opts = settings;

        return loadChrome().then(function () {
          // Chrome is in the DOM — now everything that decorates it can run.
          return $.when(
            RS.initHeader && RS.initHeader(cfg),
            RS.initNav && RS.initNav(cfg),
            RS.initFooter && RS.initFooter(cfg),
            RS.initFloating && RS.initFloating(cfg)
          );
        }).then(function () {
          RS.bindConfig(cfg);
          RS.bindLinks();
          RS.markActive();

          if (RS.initBreadcrumb) RS.initBreadcrumb();
          if (RS.initSearchBox) RS.initSearchBox(cfg);
          if (RS.initNewsletter) RS.initNewsletter(cfg);

          return RS.renderPage(pageKey, "#sections", cfg);
        }).then(function () {
          // Page-specific controllers register themselves under RS.pages.
          var controller = RS.pages && RS.pages[pageKey];
          return controller ? controller(cfg) : null;
        }).then(function () {
          if (RS.initLazyLoad) RS.initLazyLoad();
          if (RS.initSeo) RS.initSeo(cfg, pageKey);
          if (RS.initAnalytics) RS.initAnalytics(cfg);

          document.body.classList.add("isReady");
          $(document).trigger("rs:ready", [pageKey, cfg]);
        });
      })
      .then(null, function (err) {
        console.error("[app] Boot failed:", err);
        showBootError();
      });
  }

  /**
   * If the very first config request fails there is no chrome, no sections and
   * no explanation on screen — just a white page. Nearly always this is someone
   * opening index.html off the disk, so say that plainly rather than leaving
   * them staring at nothing.
   */
  function showBootError() {
    var isFile = window.location.protocol === "file:";
    $("#sections").html(
      '<div class="bootError">' +
      "<h1>This page could not load its content</h1>" +
      (isFile
        ? "<p>The site is open directly from the file system, and browsers block " +
          "data requests there.</p><p>Serve the folder over http instead:</p>" +
          "<pre>python -m http.server 8000</pre>" +
          "<p>then open <code>http://localhost:8000/general-retail-store/</code></p>"
        : "<p>A data file failed to load. Check the browser console for which one.</p>") +
      "</div>"
    );
  }

  /** RS.pages is where per-page controllers register themselves. */
  RS.pages = RS.pages || {};

  $(boot);

})(window, jQuery);
