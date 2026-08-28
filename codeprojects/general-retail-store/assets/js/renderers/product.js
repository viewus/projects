/* ---------------------------------------------------------------------------
 * renderers/product.js — everything that renders a product, category or offer.
 *
 * productRow    a fixed selection of products (home page rows)
 * catalogue     the full filterable, searchable, paginated grid
 * categoryGrid  category tiles
 * offerGrid     promotional cards
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  var RS = window.RS || (window.RS = {});
  var reg = RS.registerComponent;

  var CARD = "components/cards/cardProduct.html";

  /* ---------- one product card ------------------------------------------------ */

  /**
   * Map a product record onto the card template's tokens.
   * Discount state is DERIVED from mrp vs price rather than stored as a flag,
   * so a price edit can never leave a stale "on sale" badge behind.
   */
  function productTokens(product, index, cfg) {
    var off = RS.discountPercent(product.mrp, product.price);
    var swatch = RS.swatches && RS.swatches[product.category];

    var badges = (product.badges || []).map(function (label) {
      return '<span class="badge badgeBrand">' + RS.escape(label) + "</span>";
    });
    if (off > 0) badges.unshift('<span class="badge badgeSale">' + off + "% off</span>");

    return {
      index: index,
      slug: product.slug,
      name: product.name,
      brand: product.brand || "",
      unit: product.unit || "",
      category: product.category,
      href: RS.detailHref("product", product.slug),
      imageAlt: product.name,
      imgAttrsHtml: RS.imgAttrs(product.image, product.name, swatch),
      badgesHtml: badges.join(""),
      priceText: RS.money(product.price, cfg),
      priceWasHtml: off > 0
        ? '<span class="priceWas">' + RS.escape(RS.money(product.mrp, cfg)) + "</span>"
        : "",
      priceOffHtml: off > 0 ? '<span class="priceOff">Save ' + off + "%</span>" : "",
      outOfStockHtml: product.inStock === false
        ? '<span class="productCardOut">Out of stock</span>'
        : ""
    };
  }

  /** Render a list of products into card markup. */
  function productCards(products, cfg) {
    return RS.renderList(CARD, products, function (product, i) {
      return productTokens(product, i, cfg);
    });
  }

  RS.productCards = productCards;

  /* ---------- selecting products from JSON ------------------------------------ */

  /**
   * Home-page rows describe WHICH products they want declaratively, so choosing
   * "the eight most popular" or "everything discounted" is a JSON decision.
   */
  function selectProducts(all, spec) {
    var list = all.slice();

    if (spec.filterTag) {
      list = list.filter(function (p) {
        return (p.tags || []).indexOf(spec.filterTag) > -1;
      });
    }

    if (spec.category) {
      list = list.filter(function (p) { return p.category === spec.category; });
    }

    if (spec.onlyDiscounted) {
      list = list.filter(function (p) { return RS.discountPercent(p.mrp, p.price) > 0; });
    }

    if (spec.slugs) {
      list = spec.slugs.map(function (slug) {
        return all.filter(function (p) { return p.slug === slug; })[0];
      }).filter(Boolean);
    }

    if (spec.sort) list = RS.filter(list, { sort: spec.sort }, {});

    return spec.limit ? list.slice(0, spec.limit) : list;
  }

  /* ---------- productRow -------------------------------------------------------- */

  reg("productRow", function (spec, cfg) {
    if (!spec) return "";

    return RS.json("data/products.json").then(function (data) {
      var chosen = selectProducts(data.items || [], spec);
      if (!chosen.length) return "";

      return productCards(chosen, cfg).then(function (cards) {
        return '<div class="wrap" data-reveal>' + RS.sectionHeadRow(spec) +
          '<div class="grid gridAuto">' + cards + "</div></div>";
      });
    });
  });

  /* ---------- catalogue ---------------------------------------------------------- */

  /**
   * The full products page: search + facet filters + sort + pagination.
   *
   * Renders the shell here and hands live behaviour to RS.pages.products (in
   * pages.js), because the shell only needs building once while the grid
   * re-renders on every interaction.
   */
  reg("catalogue", function (data, cfg, section) {
    if (!data) return "";

    var sortLabels = data.sortLabels || {};
    var sortOptions = Object.keys(sortLabels).map(function (key) {
      return '<option value="' + RS.escape(key) + '">' + RS.escape(sortLabels[key]) + "</option>";
    }).join("");

    // The healthy-shopping page reuses this component but wants its tag chips
    // rather than the full facet rail.
    var isHealthy = section && section.id === "healthyProducts";

    return '<div class="wrap">' +
      '<div class="gridSidebar">' +

      '<aside class="filterRail" id="filterRail" aria-label="Filter products">' +
      '<div class="toolbar" style="margin:0 0 var(--s3)">' +
      '<strong style="font-size:var(--fsSm)">Filters</strong>' +
      '<button class="btnGhost btnSm" type="button" id="clearFilters">Clear all</button>' +
      "</div>" +
      '<div id="facets"></div>' +
      "</aside>" +

      '<div>' +
      '<div class="toolbar">' +
      '<div class="searchBox">' +
      '<i class="bi bi-search searchBoxIcon" aria-hidden="true"></i>' +
      '<input type="search" id="catalogueSearch" placeholder="Search products…"' +
      ' aria-label="Search products" autocomplete="off">' +
      '<kbd class="searchBoxKey">/</kbd>' +
      "</div>" +
      '<div style="display:flex;gap:var(--s3);align-items:center">' +
      '<span class="toolbarCount" id="catalogueCount"></span>' +
      '<label class="srOnly" for="catalogueSort">Sort by</label>' +
      '<select class="select" id="catalogueSort">' + sortOptions + "</select>" +
      "</div></div>" +

      (isHealthy ? '<div class="chipRow" id="healthyTags" style="margin-bottom:var(--s5)"></div>' : "") +

      '<div class="grid gridAuto" id="catalogueGrid" aria-live="polite"></div>' +
      '<div id="cataloguePages"></div>' +
      "</div></div></div>";
  });

  /* ---------- categoryGrid --------------------------------------------------------- */

  reg("categoryGrid", function (data, cfg) {
    if (!data || !data.items) return "";

    // Product counts are computed from the catalogue rather than stored on the
    // category, so adding a product can never leave a count out of date.
    return RS.json("data/products.json").then(function (productData) {
      var products = productData.items || [];

      return RS.renderList("components/cards/cardCategory.html", data.items, function (cat, i) {
        var count = products.filter(function (p) { return p.category === cat.slug; }).length;

        return {
          index: i,
          name: cat.name,
          href: RS.href("products") + "?category=" + encodeURIComponent(cat.slug),
          imageAlt: cat.name,
          imgAttrsHtml: RS.imgAttrs(cat.image, cat.name, cat.color),
          countLabel: count + (count === 1 ? " product" : " products")
        };
      }).then(function (cards) {
        return '<div class="wrap" data-reveal>' + RS.sectionHeadRow(data) +
          '<div class="grid gridAuto">' + cards + "</div></div>";
      });
    });
  });

  /* ---------- offerGrid ------------------------------------------------------------- */

  reg("offerGrid", function (data, cfg) {
    if (!data || !data.items) return "";

    var locale = RS.get(cfg, "currency.locale");

    return RS.renderList("components/cards/cardOffer.html", data.items, function (offer, i) {
      return {
        index: i,
        color: offer.color || "var(--brand)",
        tag: offer.tag || "",
        title: offer.title,
        text: offer.text || "",
        href: RS.href(offer.route || offer.href),
        ctaLabel: offer.ctaLabel || "Shop now",
        codeHtml: offer.code
          ? '<span class="offerCardCode">' + RS.escape(offer.code) + "</span>"
          : "",
        validHtml: offer.validUntil
          ? '<p class="cardText textDim">Valid until ' +
            RS.escape(RS.formatDate(offer.validUntil, locale)) + "</p>"
          : ""
      };
    }).then(function (cards) {
      return '<div class="wrap" data-reveal>' + RS.sectionHeadRow(data) +
        '<div class="grid gridAuto">' + cards + "</div></div>";
    });
  });

  /* ---------- add to list ------------------------------------------------------------
   * Delegated once, here, so every product card on every page works — including
   * cards that a filter change rendered a moment ago.
   * ---------------------------------------------------------------------------------- */

  $(document).on("click", "[data-add-to-list]", function () {
    var $btn = $(this);

    RS.checklist.add({
      id: $btn.attr("data-add-to-list"),
      name: $btn.attr("data-name"),
      unit: $btn.attr("data-unit"),
      category: $btn.attr("data-category"),
      qty: 1
    });

    RS.toast($btn.attr("data-name") + " added to your list", "success");
    RS.track("add_to_list", { item: $btn.attr("data-name") });

    // Brief confirmation on the button itself, so the feedback is where the
    // click was as well as in the toast.
    var original = $btn.html();
    $btn.html('<i class="bi bi-check-lg" aria-hidden="true"></i> Added').prop("disabled", true);
    setTimeout(function () { $btn.html(original).prop("disabled", false); }, 1400);
  });

})(window, jQuery);
