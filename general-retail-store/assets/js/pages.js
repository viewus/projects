/* ---------------------------------------------------------------------------
 * pages.js — per-page controllers.
 *
 * render.js builds each page's static shell from sections.json. Anything that
 * has to react to input afterwards — filtering, sorting, paging, detail lookup
 * by ?slug= — lives here, registered under RS.pages[pageKey] and called by
 * app.js once the sections are in the DOM.
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  var RS = window.RS || (window.RS = {});
  RS.pages = RS.pages || {};

  /* =========================================================================
   * PRODUCTS — search, facets, sort, pagination
   * ========================================================================= */

  /** Which filter-state key tests which product field. */
  var PRODUCT_FIELDS = { category: "category", brand: "brand", tags: "tags" };

  function facetHtml(title, key, values, active, labels) {
    if (!values.length) return "";

    var options = values.map(function (value) {
      var checked = [].concat(active[key] || []).indexOf(value) > -1;
      var label = (labels && labels[value]) || String(value).replace(/-/g, " ");

      return '<label class="filterOption">' +
        '<input type="checkbox" data-facet="' + RS.escape(key) + '" value="' + RS.escape(value) + '"' +
        (checked ? " checked" : "") + ">" +
        '<span style="text-transform:capitalize">' + RS.escape(label) + "</span></label>";
    }).join("");

    return '<div class="filterGroup"><p class="filterGroupTitle">' + RS.escape(title) + "</p>" +
      options + "</div>";
  }

  RS.pages.products = function (cfg) {
    var $grid = $("#catalogueGrid");
    if (!$grid.length) return;

    return $.when(RS.json("data/products.json"), RS.json("data/categories.json"))
      .then(function (productData, categoryData) {
        var all = productData.items || [];
        var categories = categoryData.items || [];
        var perPage = (RS.opts && RS.opts.productsPerPage) || 12;

        // Category names for the facet labels, so the rail reads "Fruits &
        // Vegetables" rather than the slug.
        var catLabels = {};
        categories.forEach(function (c) { catLabels[c.slug] = c.name; });

        // Deep links like ?category=fruits-vegetables must work — they are what
        // the category tiles and offer cards link to.
        var state = RS.filterStateFromUrl(["category", "brand", "tags", "sort", "q"]);
        state.sort = state.sort || "relevance";

        var page = 1;
        var facets = RS.facets(all, PRODUCT_FIELDS);

        if (state.q) $("#catalogueSearch").val(state.q);
        $("#catalogueSort").val(state.sort);

        function currentList() {
          var list = RS.search(all, state.q, ["name", "brand", "category", "tags", "description"]);
          return RS.filter(list, state, PRODUCT_FIELDS);
        }

        function paintFacets() {
          $("#facets").html(
            facetHtml("Category", "category", facets.category, state, catLabels) +
            facetHtml("Brand", "brand", facets.brand, state) +
            facetHtml("Dietary & tags", "tags", facets.tags, state)
          );
        }

        function paint() {
          var list = currentList();
          var result = RS.paginate(list, page, perPage);

          $("#catalogueCount").text(RS.paginationSummary(result, "products"));

          if (!list.length) {
            $grid.html(RS.emptyState(
              "No products match those filters",
              "Try removing a filter or searching for something else.",
              "bi-search"
            ));
            $("#cataloguePages").empty();
            return;
          }

          RS.productCards(result.items, cfg).then(function (cards) {
            $grid.html(cards);
            $("#cataloguePages").html(RS.paginationHtml(result));
            if (RS.initLazyLoad) RS.initLazyLoad();
          });
        }

        function update(resetPage) {
          if (resetPage !== false) page = 1;
          RS.filterStateToUrl($.extend({}, state, { q: state.q || "" }));
          paint();
        }

        /* ---- wiring ---- */

        $(document).on("change.rsFacet", "[data-facet]", function () {
          var key = $(this).attr("data-facet");
          var value = $(this).val();
          var list = [].concat(state[key] || []);

          if (this.checked) {
            if (list.indexOf(value) === -1) list.push(value);
          } else {
            list = list.filter(function (v) { return v !== value; });
          }

          state[key] = list.length ? list : "";
          update();
        });

        $("#catalogueSort").on("change", function () {
          state.sort = $(this).val();
          update();
        });

        $("#clearFilters").on("click", function () {
          state = { sort: state.sort };
          $("#catalogueSearch").val("");
          paintFacets();
          update();
        });

        RS.bindSearch("#catalogueSearch", function (query) {
          state.q = query;
          update();
        });
        RS.bindSearchHotkey("#catalogueSearch");

        RS.bindPagination("#cataloguePages", function (next) {
          page = next;
          paint();
        }, "#catalogueGrid");

        paintFacets();
        paint();
      });
  };

  /* =========================================================================
   * HEALTHY SHOPPING — the catalogue, pre-filtered by dietary tag
   * ========================================================================= */

  RS.pages.healthyShopping = function (cfg) {
    var $grid = $("#catalogueGrid");
    if (!$grid.length) return;

    return $.when(RS.json("data/products.json"), RS.json("data/shopping-lists.json"))
      .then(function (productData, listData) {
        var all = productData.items || [];
        var tags = ((listData.healthy && listData.healthy.lists) || []);
        var active = "";

        $("#healthyTags").html(
          '<button class="chip isActive" type="button" data-healthy="">All products</button>' +
          tags.map(function (t) {
            return '<button class="chip" type="button" data-healthy="' + RS.escape(t.tag) + '">' +
              '<i class="bi ' + RS.escape(t.icon) + '" aria-hidden="true"></i> ' +
              RS.escape(t.name) + "</button>";
          }).join("")
        );

        function paint() {
          var list = active
            ? all.filter(function (p) { return (p.tags || []).indexOf(active) > -1; })
            : all;

          $("#catalogueCount").text(list.length + (list.length === 1 ? " product" : " products"));

          if (!list.length) {
            $grid.html(RS.emptyState("Nothing tagged yet",
              "No products currently carry this tag.", "bi-tag"));
            return;
          }

          RS.productCards(list, cfg).then(function (cards) { $grid.html(cards); });
        }

        $(document).on("click.rsHealthy", "[data-healthy]", function () {
          $("[data-healthy]").removeClass("isActive");
          $(this).addClass("isActive");
          active = $(this).attr("data-healthy");
          paint();
        });

        RS.bindSearch("#catalogueSearch", function (query) {
          var list = RS.search(all, query, ["name", "brand", "tags"]);
          if (active) {
            list = list.filter(function (p) { return (p.tags || []).indexOf(active) > -1; });
          }
          RS.productCards(list, cfg).then(function (cards) {
            $grid.html(cards || RS.emptyState("No matches", "Try a different term.", "bi-search"));
          });
        });

        // The facet rail is redundant here — the tag chips are the filter.
        $("#filterRail").remove();
        $(".gridSidebar").css("grid-template-columns", "1fr");

        paint();
      });
  };

  /* =========================================================================
   * DETAIL PAGES — one HTML file each, ?slug= picks the record
   * ========================================================================= */

  /** Shared "record not found" panel for every detail page. */
  function notFoundPanel(what, backRoute, backLabel) {
    return '<div class="wrap textCenter" style="padding-block:var(--s8)">' +
      "<h1>" + RS.escape(what) + " not found</h1>" +
      '<p class="lede" style="margin-inline:auto">The link may be out of date.</p>' +
      '<a class="btn btnPrimary" href="' + RS.escape(RS.href(backRoute)) + '">' +
      RS.escape(backLabel) + "</a></div>";
  }

  RS.pages.product = function (cfg) {
    var slug = RS.param("slug");

    return $.when(RS.json("data/products.json"), RS.json("data/categories.json"))
      .then(function (productData, categoryData) {
        var all = productData.items || [];
        var product = all.filter(function (p) { return p.slug === slug; })[0];

        if (!product) {
          $("#sections").html(notFoundPanel("Product", "products", "Browse all products"));
          return;
        }

        document.title = product.name + " | " + cfg.siteName;

        var category = (categoryData.items || [])
          .filter(function (c) { return c.slug === product.category; })[0] || {};
        var off = RS.discountPercent(product.mrp, product.price);

        var badges = (product.badges || []).map(function (b) {
          return '<span class="badge badgeBrand">' + RS.escape(b) + "</span>";
        }).join("");

        var html = '<div class="wrap"><div class="grid grid2" style="gap:var(--s7);align-items:start">' +
          '<div class="heroMedia"><img class="heroImage" ' +
          RS.imgAttrs(product.image, product.name, category.color) +
          ' alt="' + RS.escape(product.name) + '" width="600" height="450"></div>' +

          "<div>" +
          '<a class="eyebrow" href="' + RS.escape(RS.href("products") + "?category=" + product.category) +
          '">' + RS.escape(category.name || product.category) + "</a>" +
          "<h1>" + RS.escape(product.name) + "</h1>" +
          '<p class="textDim">' + RS.escape(product.brand || "") + " · " +
          RS.escape(product.unit || "") + "</p>" +
          '<div class="chipRow" style="margin-block:var(--s3)">' + badges + "</div>" +

          '<div class="productCardPrice" style="margin-block:var(--s4)">' +
          '<span class="priceNow" style="font-size:var(--fs2xl)">' +
          RS.escape(RS.money(product.price, cfg)) + "</span>" +
          (off > 0 ? '<span class="priceWas">' + RS.escape(RS.money(product.mrp, cfg)) + "</span>" +
            '<span class="priceOff">Save ' + off + "%</span>" : "") +
          "</div>" +

          '<p class="lede">' + RS.escape(product.description || "") + "</p>" +

          (product.inStock === false
            ? '<p class="badge badgeOut">Currently out of stock</p>'
            : '<button class="btn btnPrimary btnLg" type="button" data-add-to-list="' +
              RS.escape(product.slug) + '" data-name="' + RS.escape(product.name) +
              '" data-unit="' + RS.escape(product.unit || "") + '" data-category="' +
              RS.escape(product.category) + '"><i class="bi bi-plus-lg" aria-hidden="true"></i>' +
              " Add to my list</button>") +

          '<div class="stack" style="margin-top:var(--s6)">' +
          '<p class="cardText"><i class="bi bi-truck" aria-hidden="true"></i> Free delivery above ' +
          RS.escape(RS.money(RS.get(cfg, "delivery.freeAbove"), cfg)) + "</p>" +
          '<p class="cardText"><i class="bi bi-clock" aria-hidden="true"></i> Same-day if ordered before ' +
          RS.escape(RS.get(cfg, "delivery.sameDayCutoff") || "6 pm") + "</p>" +
          "</div></div></div></div>";

        // Related: same category, this product excluded.
        var related = all.filter(function (p) {
          return p.category === product.category && p.slug !== product.slug;
        }).slice(0, (RS.opts && RS.opts.relatedCount) || 4);

        $("#sections").html(html);
        RS.initBreadcrumb(product.name);

        if (related.length) {
          RS.productCards(related, cfg).then(function (cards) {
            $("#sections").append(
              '<section class="section isToneAlt"><div class="wrap">' +
              "<h2 class='sectionTitle'>More from " + RS.escape(category.name || "this aisle") + "</h2>" +
              '<div class="grid gridAuto">' + cards + "</div></div></section>"
            );
          });
        }
      });
  };

  RS.pages.blog = function (cfg) {
    var slug = RS.param("slug");

    return RS.json("data/blogs.json").then(function (data) {
      var post = (data.items || []).filter(function (p) { return p.slug === slug; })[0];

      if (!post) {
        $("#sections").html(notFoundPanel("Article", "blogs", "Back to the blog"));
        return;
      }

      document.title = post.title + " | " + cfg.siteName;

      $("#sections").html(
        '<div class="wrap wrapNarrow">' +
        '<span class="eyebrow">' + RS.escape(post.category) + "</span>" +
        "<h1>" + RS.escape(post.title) + "</h1>" +
        '<p class="textDim">' + RS.escape(RS.formatDate(post.date, RS.get(cfg, "currency.locale"))) +
        " · " + RS.escape(post.readTime || "") + " · " + RS.escape(post.author || "") + "</p>" +
        '<div class="heroMedia" style="margin-block:var(--s5)"><img class="heroImage" ' +
        RS.imgAttrs(post.image, post.title, "#5b8fb9") +
        ' alt="' + RS.escape(post.title) + '" width="800" height="450"></div>' +
        '<div class="prose">' + RS.renderBlocks(post.body) + "</div>" +
        '<p style="margin-top:var(--s7)"><a class="linkArrow" href="' +
        RS.escape(RS.href("blogs")) + '"><i class="bi bi-arrow-left" aria-hidden="true"></i> ' +
        "All articles</a></p></div>"
      );

      RS.initBreadcrumb(post.title);
    });
  };

  RS.pages.recipe = function (cfg) {
    var slug = RS.param("slug");

    return RS.json("data/recipes.json").then(function (data) {
      var recipe = (data.items || []).filter(function (r) { return r.slug === slug; })[0];

      if (!recipe) {
        $("#sections").html(notFoundPanel("Recipe", "recipes", "All recipes"));
        return;
      }

      document.title = recipe.name + " | " + cfg.siteName;

      var ingredients = (recipe.ingredients || []).map(function (ing) {
        return '<li class="checklistItem">' +
          '<span class="checklistName">' + RS.escape(ing.name) + "</span>" +
          '<span class="checklistCat">' + RS.escape(ing.qty + " × " + ing.unit) + "</span>" +
          '<button class="btn btnGhost btnSm" type="button" data-add-to-list="' +
          RS.escape(ing.slug || RS.slugify(ing.name)) + '" data-name="' + RS.escape(ing.name) +
          '" data-unit="' + RS.escape(ing.unit) + '" data-category="' + RS.escape(ing.category) +
          '">Add</button></li>';
      }).join("");

      $("#sections").html(
        '<div class="wrap"><div class="grid grid2" style="gap:var(--s7);align-items:start">' +
        '<div class="heroMedia"><img class="heroImage" ' +
        RS.imgAttrs(recipe.image, recipe.name, "#d4644a") +
        ' alt="' + RS.escape(recipe.name) + '" width="600" height="450"></div>' +

        "<div><h1>" + RS.escape(recipe.name) + "</h1>" +
        '<p class="textDim">Serves ' + RS.escape(recipe.serves) + " · " +
        RS.escape(recipe.time) + " · " + RS.escape(recipe.difficulty) + "</p>" +
        '<p class="lede">' + RS.escape(recipe.description) + "</p>" +

        "<h2 style='font-size:var(--fsXl);margin-top:var(--s5)'>Ingredients</h2>" +
        '<ul class="checklist">' + ingredients + "</ul>" +

        '<button class="btn btnPrimary btnLg" type="button" data-add-recipe="' +
        RS.escape(recipe.slug) + '" style="margin-top:var(--s5)">' +
        '<i class="bi bi-basket" aria-hidden="true"></i> ' +
        RS.escape(data.addAllLabel || "Add all ingredients to my list") + "</button>" +
        "</div></div></div>"
      );

      RS.initBreadcrumb(recipe.name);
    });
  };

})(window, jQuery);
