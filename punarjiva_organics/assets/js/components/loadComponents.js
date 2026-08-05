/* ---------------------------------------------------------------------------
 * loadComponents.js — shared chrome (header / nav / footer / CTA / breadcrumbs)
 * plus the small template + fetch utilities every renderer builds on.
 *
 * Nothing here runs on its own. main.js orchestrates the order, because
 * jQuery's .load() is asynchronous: anything that touches injected markup has
 * to wait for the injection to finish, not merely for DOMContentLoaded.
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  /* ---------- fetch helpers, each cached so one file is never fetched twice -- */

  var jsonCache = {};
  var templateCache = {};

  /** Fetch and cache a JSON file by project-relative path. */
  function pjJson(rel) {
    if (!jsonCache[rel]) {
      jsonCache[rel] = fetch(pjPath(rel)).then(function (res) {
        if (!res.ok) throw new Error("Could not load " + rel + " (HTTP " + res.status + ")");
        return res.json();
      });
    }
    return jsonCache[rel];
  }

  /** Fetch and cache an HTML template file by project-relative path. */
  function pjTemplate(rel) {
    if (!templateCache[rel]) {
      templateCache[rel] = fetch(pjPath(rel)).then(function (res) {
        if (!res.ok) throw new Error("Could not load template " + rel + " (HTTP " + res.status + ")");
        return res.text();
      });
    }
    return templateCache[rel];
  }

  /** The site-wide settings object, fetched once and shared by every caller. */
  function pjConfig() {
    return pjJson("config/config.json");
  }

  /* ---------- template filling ---------------------------------------------- */

  function pjEscape(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /**
   * Replace {{token}} placeholders in a template string.
   * Keys ending in "Html" are inserted raw (they are markup we generated);
   * every other value is HTML-escaped. Unmatched tokens are cleared, so a
   * template never renders a literal "{{image}}" to a visitor.
   */
  function pjFill(template, data) {
    var out = template;
    Object.keys(data || {}).forEach(function (key) {
      var value = data[key];
      var replacement = /Html$/.test(key) ? (value == null ? "" : value) : pjEscape(value);
      out = out.split("{{" + key + "}}").join(replacement);
    });
    return out.replace(/\{\{\w+\}\}/g, "");
  }

  /** Fetch a template and fill it in one step. */
  function pjRender(rel, data) {
    return pjTemplate(rel).then(function (tpl) { return pjFill(tpl, data); });
  }

  /* ---------- reading dotted keys out of config ----------------------------- */

  function pjGet(obj, dottedKey) {
    return String(dottedKey).split(".").reduce(function (acc, part) {
      return acc == null ? undefined : acc[part];
    }, obj);
  }

  /* ---------- <head> values that are identical on every page ---------------- */

  function applySharedMeta(cfg) {
    function setAttr(id, attr, value) {
      var el = document.getElementById(id);
      if (el && value) el.setAttribute(attr, value);
    }
    setAttr("themeColorMeta", "content", cfg.themeColor);
    setAttr("faviconLink", "href", pjPath(cfg.logoPath));
    setAttr("appleIconLink", "href", pjPath(cfg.logoPath));
    setAttr("ogSiteName", "content", cfg.siteName);
    setAttr("ogImage", "content", cfg.defaultOgImage);
    setAttr("twitterImage", "content", cfg.defaultOgImage);
    setAttr("twitterSite", "content", cfg.twitterHandle);
  }

  /* ---------- filling [data-config] hooks inside injected chrome ------------ */

  function applyConfigBindings(cfg, $scope) {
    var scope = $scope || $(document);

    scope.find("[data-config]").each(function () {
      var value = pjGet(cfg, this.getAttribute("data-config"));
      if (value != null) this.textContent = value;
    });

    scope.find("[data-config-href]").each(function () {
      var value = pjGet(cfg, this.getAttribute("data-config-href"));
      if (value) this.setAttribute("href", value);
    });

    scope.find("[data-config-mailto]").each(function () {
      var value = pjGet(cfg, this.getAttribute("data-config-mailto"));
      if (value) this.setAttribute("href", "mailto:" + value);
    });
  }

  /* ---------- JSON-driven field lists --------------------------------------- */

  /**
   * Build one contact/detail line from a lookup entry. The entry names keys in
   * config.json rather than carrying markup, which is what lets the header and
   * footer field lists be edited from JSON alone.
   *
   * @param {object} item {type, icon?, label?, configKey?, hrefKey?}
   *        type: "text"     plain, no link
   *              "link"     internal href taken verbatim from hrefKey
   *              "tel"      href from hrefKey (already tel:)
   *              "mailto"   href built as mailto:<configKey value>
   *              "external" href from hrefKey, opens in a new tab
   * @param {object} cfg parsed config.json
   * @param {object} opts {lineClass, linkClass}
   */
  function renderFieldItem(item, cfg, opts) {
    // "label" wins when the wording is fixed; otherwise show the config value.
    var text = item.label != null ? item.label : pjGet(cfg, item.configKey);
    if (text == null || text === "") return "";

    var icon = item.icon
      ? '<i class="bi ' + pjEscape(item.icon) + '" aria-hidden="true"></i> '
      : "";

    var href = item.hrefKey ? pjGet(cfg, item.hrefKey) : null;
    if (item.type === "mailto") {
      var address = pjGet(cfg, item.configKey);
      href = address ? "mailto:" + address : null;
    }

    var inner;
    if (item.type === "text" || !href) {
      inner = pjEscape(text);
    } else {
      var external = item.type === "external";
      inner = '<a class="' + opts.linkClass + '" href="' + pjEscape(href) + '"' +
        (external ? ' target="_blank" rel="noopener"' : "") + ">" + pjEscape(text) + "</a>";
    }

    return '<' + opts.tag + ' class="' + opts.lineClass + '">' + icon + inner + '</' + opts.tag + '>';
  }

  function renderFieldList(items, cfg, opts) {
    return (items || []).map(function (item) {
      return renderFieldItem(item, cfg, opts);
    }).join("");
  }

  /* ---------- header -------------------------------------------------------- */

  function initHeader(cfg) {
    if (!$(".topBar").length) return Promise.resolve();

    return pjJson("data/header.json").then(function (header) {
      var tagline = pjGet(cfg, header.taglineKey);
      if (tagline) $("#topBarTagline").text(tagline);

      $("#topBarLinks").html(renderFieldList(header.items, cfg, {
        tag: "span",
        lineClass: "topBarLine",
        linkClass: "topBarLink"
      }));
    });
  }

  /* ---------- floating actions ---------------------------------------------- */

  function initFloatingActions(cfg) {
    var $wrap = $(".floatingActions");
    if (!$wrap.length) return;

    $("#floatingWhatsapp").attr("href", cfg.contact.whatsapp);
    $("#floatingCall").attr("href", cfg.contact.phoneHref);

    var $top = $("#floatingTop");
    $top.on("click", function () {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    });

    // Back-to-top only earns its space once there is something to go back up to.
    function syncTop() { $top.toggleClass("isVisible", window.scrollY > 500); }
    $(window).on("scroll", syncTop);
    syncTop();
  }

  /* ---------- navigation ---------------------------------------------------- */

  function buildNavItem(item, activeKey) {
    var isActive = item.key && item.key === activeKey;

    if (!item.children) {
      return '<li class="nav-item navBarItem">' +
        '<a class="nav-link navBarLink' + (isActive ? " isActive" : "") + '"' +
        (isActive ? ' aria-current="page"' : "") +
        ' href="' + pjEscape(pjPath(item.href)) + '">' + pjEscape(item.label) + "</a></li>";
    }

    var childActive = item.children.some(function (c) { return c.key === activeKey; });
    var id = "navDropdown" + pjEscape(item.label).replace(/\W/g, "");

    var childrenHtml = item.children.map(function (child) {
      return '<li><a class="dropdown-item navBarDropdownItem' +
        (child.key === activeKey ? " isActive" : "") + '" href="' +
        pjEscape(pjPath(child.href)) + '">' + pjEscape(child.label) + "</a></li>";
    }).join("");

    return '<li class="nav-item dropdown navBarItem">' +
      '<a class="nav-link dropdown-toggle navBarLink' + (childActive ? " isActive" : "") + '"' +
      ' href="#" id="' + id + '" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
      pjEscape(item.label) + "</a>" +
      '<ul class="dropdown-menu navBarDropdown" aria-labelledby="' + id + '">' +
      childrenHtml + "</ul></li>";
  }

  function initNavBar(cfg) {
    return pjJson("data/navBar.json").then(function (nav) {
      var activeKey = document.body.getAttribute("data-nav") ||
                      document.body.getAttribute("data-page") || "";

      $("#navBarMenu").html(nav.items.map(function (item) {
        return buildNavItem(item, activeKey);
      }).join(""));

      $("#navBarBrand").attr("href", pjPath("index.html"));
      $("#footerBrandLink").attr("href", pjPath("index.html"));

      // The real photographic logo is the brand mark; logoPath (the SVG) stays
      // the favicon, where a flat shape reads better at 16px.
      var mark = pjPath(cfg.logoPhoto || cfg.logoPath);
      $("#navBarLogo").attr("src", mark);
      $("#footerLogo").attr("src", mark);
      $("#footerTree").attr("src", pjPath("assets/svg/illustrations/treeOfLife.svg"));

      $("#navBarCta")
        .text(nav.ctaLabel)
        .attr("href", cfg.contact.whatsapp);

      var $navScope = $(".navBar");
      $navScope.find("[data-content]").each(function () {
        var value = nav[this.getAttribute("data-content")];
        if (value != null) this.textContent = value;
      });
    });
  }

  /* ---------- footer -------------------------------------------------------- */

  function linkListHtml(links) {
    return (links || []).map(function (link) {
      return '<li><a class="footerLink" href="' + pjEscape(pjPath(link.href)) + '">' +
        pjEscape(link.label) + "</a></li>";
    }).join("");
  }

  function initFooter(cfg) {
    return pjJson("data/footer.json").then(function (footer) {
      $(".siteFooter").find("[data-footer]").each(function () {
        var value = footer[this.getAttribute("data-footer")];
        if (value != null) this.textContent = value;
      });

      $("#footerExploreLinks").html(linkListHtml(footer.exploreLinks));
      $("#footerHelpLinks").html(linkListHtml(footer.helpLinks));

      // Contact lines come from the reachItems lookup list, so which details
      // appear (and in what order) is a JSON decision, not an HTML one.
      $("#footerReachList").html(renderFieldList(footer.reachItems, cfg, {
        tag: "p",
        lineClass: "footerContactLine",
        linkClass: "footerContactLink"
      }));

      // Only render social icons whose URL is actually filled in — an empty
      // value in config.json means "no profile yet", not "link to nowhere".
      var iconFor = { instagram: "bi-instagram", facebook: "bi-facebook", youtube: "bi-youtube" };
      var social = cfg.social || {};
      var html = Object.keys(iconFor).filter(function (key) {
        return social[key];
      }).map(function (key) {
        return '<a class="footerSocialLink" href="' + pjEscape(social[key]) +
          '" target="_blank" rel="noopener" aria-label="' + key +
          '"><i class="bi ' + iconFor[key] + '" aria-hidden="true"></i></a>';
      }).join("");
      $("#footerSocial").html(html);
    });
  }

  /* ---------- chrome loading ------------------------------------------------ */

  /** jQuery .load() wrapped as a promise; resolves once markup is in the DOM. */
  function loadInto(selector, rel) {
    var $target = $(selector);
    if (!$target.length) return Promise.resolve(false);

    return new Promise(function (resolve) {
      $target.load(pjPath(rel), function (response, status) {
        if (status === "error") {
          console.error("[loadComponents] Failed to load " + rel +
            " — are you serving over http:// rather than opening the file directly?");
        }
        resolve(status !== "error");
      });
    });
  }

  /**
   * Inject every shared component this page has a placeholder for, then wire
   * up nav, footer and config bindings. Resolves with the config object.
   */
  function pjLoadChrome() {
    return pjConfig().then(function (cfg) {
      applySharedMeta(cfg);

      return Promise.all([
        loadInto("#headerPlaceholder", "components/header.html"),
        loadInto("#navPlaceholder", "components/navBar.html"),
        loadInto("#breadCrumbsPlaceholder", "components/breadcrumbs.html"),
        loadInto("#ctaPlaceholder", "components/ctaSection.html"),
        loadInto("#footerPlaceholder", "components/footer.html"),
        loadInto("#floatingActionsPlaceholder", "components/floatingActions.html")
      ]).then(function () {
        initFloatingActions(cfg);
        return Promise.all([initHeader(cfg), initNavBar(cfg), initFooter(cfg)]);
      }).then(function () {
        applyConfigBindings(cfg);
        return cfg;
      });
    }).catch(function (err) {
      console.error("[loadComponents] Chrome failed to load:", err);
      throw err;
    });
  }

  /* ---------- exports ------------------------------------------------------- */

  window.pjJson = pjJson;
  window.pjTemplate = pjTemplate;
  window.pjConfig = pjConfig;
  window.pjEscape = pjEscape;
  window.pjFill = pjFill;
  window.pjRender = pjRender;
  window.pjGet = pjGet;
  window.pjLoadChrome = pjLoadChrome;
  window.pjApplyConfigBindings = applyConfigBindings;
  window.pjRenderFieldList = renderFieldList;

})(window, jQuery);
