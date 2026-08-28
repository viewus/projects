/* ---------------------------------------------------------------------------
 * router.js — link resolution and active-page state.
 *
 * NOTE ON NAMING: this is a multi-page site, so this is deliberately NOT a
 * client-side router. Real .html files are what make deep links, sitemap.xml
 * and crawler-visible SEO work on GitHub Pages without any server config.
 * What this file does instead:
 *
 *   - turn a JSON page key ("products") into a correct href from any depth
 *   - work out which page is currently open
 *   - mark the matching nav item active
 *   - build detail-page links that carry ?slug=
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  var RS = window.RS || (window.RS = {});

  /**
   * The one place that maps a page key to a file. Every link in every JSON file
   * uses these keys, never a path — so moving a page is a single edit here.
   */
  var routes = {
    home:            "index.html",
    products:        "pages/products.html",
    product:         "pages/product.html",
    categories:      "pages/categories.html",
    offers:          "pages/offers.html",
    planner:         "pages/planner.html",
    monthlyGrocery:  "pages/monthly-grocery.html",
    healthyShopping: "pages/healthy-shopping.html",
    recipes:         "pages/recipes.html",
    recipe:          "pages/recipe.html",
    blogs:           "pages/blogs.html",
    blog:            "pages/blog.html",
    about:           "pages/about.html",
    contact:         "pages/contact.html",
    faq:             "pages/faq.html",
    privacy:         "pages/privacy.html",
    terms:           "pages/terms.html",
    notFound:        "404.html"
  };

  RS.routes = routes;

  /**
   * Resolve a link reference to a real href.
   *
   * Accepts, in order of precedence:
   *   "products"                  a route key
   *   "products?tag=organic"      a route key with a query string
   *   "https://…" / "mailto:…"    left untouched
   *   "#anchor"                   left untouched
   *   "pages/custom.html"         treated as a project-relative path
   */
  RS.href = function (ref) {
    var value = String(ref == null ? "" : ref).trim();
    if (!value) return "#";

    if (/^(https?:|mailto:|tel:|#)/i.test(value)) return value;

    var split = value.split("?");
    var key = split[0];
    var query = split[1] ? "?" + split[1] : "";

    if (routes[key]) return RS.path(routes[key]) + query;

    return RS.path(value);
  };

  /** Build a detail-page href: RS.detailHref("product", "basmati-rice") */
  RS.detailHref = function (routeKey, slug) {
    return RS.href(routeKey) + "?slug=" + encodeURIComponent(slug || "");
  };

  /**
   * The current page key. Taken from <body data-page="…">, which is the same
   * attribute that tells app.js which sections and which JSON to load.
   */
  RS.currentPage = function () {
    return document.body.getAttribute("data-page") || "home";
  };

  /**
   * Mark the active item in any nav rendered into `scope`.
   * Matches on the data-route attribute the nav renderer writes.
   */
  RS.markActive = function (scope) {
    var current = RS.currentPage();

    $(scope || document).find("[data-route]").each(function () {
      var $link = $(this);
      var isActive = $link.attr("data-route") === current;

      $link.toggleClass("isActive", isActive);
      if (isActive) {
        $link.attr("aria-current", "page");
        // Open the parent dropdown's active state too, so "Shop > Offers"
        // still highlights "Shop" in the top bar.
        $link.closest(".dropdown").find(".navLink").first().addClass("isActive");
      } else {
        $link.removeAttr("aria-current");
      }
    });
  };

  /**
   * Breadcrumb trail for the current page, derived from navigation.json so the
   * trail never contradicts the menu. Returns [{label, href}] ending with the
   * current page (which carries no href).
   */
  RS.breadcrumbTrail = function (nav, currentLabel) {
    var current = RS.currentPage();
    var trail = [{ label: "Home", href: RS.href("home") }];

    (nav && nav.items || []).forEach(function (item) {
      if (item.route === current) {
        trail.push({ label: item.label });
      } else if (item.children) {
        item.children.forEach(function (child) {
          if (child.route === current) {
            trail.push({ label: item.label });
            trail.push({ label: child.label });
          }
        });
      }
    });

    // Detail pages (?slug=) are not in the menu — caller supplies the leaf.
    if (trail.length === 1 && currentLabel) trail.push({ label: currentLabel });

    return trail;
  };

})(window, jQuery);
