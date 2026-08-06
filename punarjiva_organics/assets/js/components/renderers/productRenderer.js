/* ---------------------------------------------------------------------------
 * productRenderer.js — the catalogue.
 *
 * Three jobs, in order of size:
 *
 *   1. the listing page: a TWO-LEVEL filter (range -> shelf) over the product
 *      grid, with the state mirrored into ?type= and ?tag= so a filtered view
 *      is a shareable URL rather than a mood the page happens to be in
 *   2. the detail page: one HTML file (pages/product.html) serving every
 *      product, chosen by ?slug=, with a gallery, tabs, share row and lightbox
 *   3. the home page's featured spotlight and best-seller rail
 *
 * Everything reads from data/products.json. Adding a product is a JSON edit;
 * adding a whole new range or shelf is a JSON edit plus nothing.
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  /* ---------- lookups -------------------------------------------------------
   * Built fresh from the data object each time rather than cached in module
   * state: the catalogue JSON is itself cached by pjJson(), so there is nothing
   * to gain from a second layer, and a stale index is a genuinely annoying bug.
   */

  function typeBySlug(data, slug) {
    return (data.types || []).filter(function (t) { return t.slug === slug; })[0];
  }

  function tagBySlug(data, slug) {
    return (data.tags || []).filter(function (t) { return t.slug === slug; })[0];
  }

  function productBySlug(data, slug) {
    return (data.products || []).filter(function (p) { return p.slug === slug; })[0];
  }

  function typeLabel(data, slug) {
    var type = typeBySlug(data, slug);
    return type ? type.label : slug;
  }

  function tagsForType(data, typeSlug) {
    if (!typeSlug) return data.tags || [];
    return (data.tags || []).filter(function (t) { return t.type === typeSlug; });
  }

  /** Products matching a {type, tag} pair; either may be "" for "any". */
  function filterProducts(data, type, tag) {
    return (data.products || []).filter(function (product) {
      if (type && product.type !== type) return false;
      if (tag && (product.tags || []).indexOf(tag) === -1) return false;
      return true;
    });
  }

  function productsWithBadge(data, badge) {
    return (data.products || []).filter(function (p) {
      return (p.badges || []).indexOf(badge) !== -1;
    });
  }

  function productHref(slug) {
    return pjPath("pages/product.html?slug=" + encodeURIComponent(slug));
  }

  /** Images may be project-relative ("assets/images/x.jpg") or absolute URLs. */
  function imageUrl(value) {
    return /^(https?:)?\/\//.test(value) ? value : pjPath(value);
  }

  function productImage(product, index) {
    var image = (product.images || [])[index || 0];
    return image ? { src: imageUrl(image.src), alt: image.alt || product.name } : null;
  }

  /* ---------- small markup builders ----------------------------------------- */

  function badgeClass(badge) {
    return "badge" + badge.charAt(0).toUpperCase() + badge.slice(1);
  }

  function badgesHtml(data, product) {
    var labels = data.badgeLabels || {};
    return (product.badges || []).map(function (badge) {
      if (!labels[badge]) return "";
      return '<span class="productBadge ' + badgeClass(badge) + '">' +
        pjEscape(labels[badge]) + "</span>";
    }).join("");
  }

  function tagPillsHtml(data, product, className) {
    return (product.tags || []).map(function (slug) {
      var tag = tagBySlug(data, slug);
      if (!tag) return "";
      return '<span class="' + className + '">' + pjEscape(tag.label) + "</span>";
    }).join("");
  }

  /* ---------- product card --------------------------------------------------- */

  /**
   * @param {object} data    parsed products.json
   * @param {object} product one entry from data.products
   * @param {object} opts    {index, rank, moreLabel}
   */
  function renderProductCard(data, product, opts) {
    var options = opts || {};
    var primary = productImage(product, 0) || { src: "", alt: product.name };
    var secondary = productImage(product, 1);

    return pjRender("components/cards/cardProduct.html", {
      href: productHref(product.slug),
      index: options.index || 0,
      image: primary.src,
      imageAlt: primary.alt,
      // The hover image is optional — a product with a single photograph simply
      // does not get the cross-fade rather than getting a broken one.
      altImageHtml: secondary
        ? '<img class="productCardImage productCardImageAlt" src="' + pjEscape(secondary.src) +
          '" alt="" aria-hidden="true" loading="lazy">'
        : "",
      rankHtml: options.rank
        ? '<span class="productCardRank" aria-hidden="true">' + pjEscape(options.rank) + "</span>"
        : "",
      badgesHtml: badgesHtml(data, product),
      typeLabel: typeLabel(data, product.type),
      name: product.name,
      tagline: product.tagline,
      tagsHtml: tagPillsHtml(data, product, "productCardTag"),
      moreLabel: options.moreLabel || "View details"
    });
  }

  function renderProductGrid(data, products, opts) {
    var options = opts || {};

    if (!products.length) {
      return Promise.resolve(
        '<div class="productEmpty">' +
        '<i class="productEmptyIcon bi bi-basket" aria-hidden="true"></i>' +
        '<p>' + pjEscape(data.emptyMessage) + "</p></div>"
      );
    }

    return Promise.all(products.map(function (product, index) {
      return renderProductCard(data, product, {
        index: index,
        rank: options.ranked ? index + 1 : null,
        moreLabel: options.moreLabel
      });
    })).then(function (parts) {
      return parts.join("");
    });
  }

  /* ---------- the two-level filter ------------------------------------------- */

  /* Level one (range) decides what level two (shelf) contains. Picking a shelf
     with no range set implies its range, because a shelf only ever belongs to
     one — that is the whole reason the two levels are worth having. */

  function filterState() {
    var params = new URLSearchParams(window.location.search);
    return {
      type: params.get("type") || "",
      tag: params.get("tag") || ""
    };
  }

  /** Mirror the state into the address bar without reloading or adding history. */
  function syncUrl(state) {
    var params = new URLSearchParams();
    if (state.type) params.set("type", state.type);
    if (state.tag) params.set("tag", state.tag);

    var query = params.toString();
    window.history.replaceState(null, "",
      window.location.pathname + (query ? "?" + query : ""));
  }

  function typeTilesHtml(data, state) {
    var all = '<button class="filterType' + (state.type ? "" : " isActive") +
      '" type="button" data-type="" aria-pressed="' + (state.type ? "false" : "true") + '">' +
      '<i class="filterTypeIcon bi bi-grid" aria-hidden="true"></i>' +
      '<span>' + pjEscape(data.filterAllLabel) + "</span>" +
      '<span class="filterTypeCount">' + (data.products || []).length + "</span>" +
      "</button>";

    return all + (data.types || []).map(function (type) {
      var isActive = state.type === type.slug;
      var count = filterProducts(data, type.slug, "").length;

      return '<button class="filterType' + (isActive ? " isActive" : "") +
        '" type="button" data-type="' + pjEscape(type.slug) +
        '" aria-pressed="' + (isActive ? "true" : "false") + '">' +
        '<i class="filterTypeIcon bi ' + pjEscape(type.icon) + '" aria-hidden="true"></i>' +
        "<span>" + pjEscape(type.shortLabel || type.label) + "</span>" +
        '<span class="filterTypeCount">' + count + "</span>" +
        "</button>";
    }).join("");
  }

  function tagChipsHtml(data, state) {
    var tags = tagsForType(data, state.type);

    var all = '<button class="filterTag' + (state.tag ? "" : " isActive") +
      '" type="button" data-tag="" aria-pressed="' + (state.tag ? "false" : "true") + '">' +
      '<i class="bi bi-asterisk" aria-hidden="true"></i>' +
      pjEscape(state.type ? data.filterAllTagsLabel : data.filterAllLabel) + "</button>";

    return all + tags.map(function (tag) {
      var isActive = state.tag === tag.slug;
      var count = filterProducts(data, tag.type, tag.slug).length;

      return '<button class="filterTag' + (isActive ? " isActive" : "") +
        '" type="button" data-tag="' + pjEscape(tag.slug) +
        '" aria-pressed="' + (isActive ? "true" : "false") + '">' +
        '<i class="bi ' + pjEscape(tag.icon || "bi-dot") + '" aria-hidden="true"></i>' +
        pjEscape(tag.label) + " <span class=\"filterTagCount\">(" + count + ")</span></button>";
    }).join("");
  }

  function countLabel(data, count) {
    var template = count === 1 ? data.resultsSingular : data.resultsPlural;
    return String(template).replace("{{count}}", count);
  }

  /**
   * Wire the whole listing page: filter rail, grid, URL sync.
   * Called once; every later change is handled inside.
   */
  function initProductCatalogue(data) {
    var $filter = $("#productFilter");
    var $grid = $("#productGrid");
    if (!$filter.length || !$grid.length) return Promise.resolve();

    var state = filterState();

    // A ?tag= arriving on its own (from a link on a detail page, say) implies
    // its range — otherwise level one would sit on "Everything" while level two
    // showed a single active chip, which looks broken.
    if (state.tag && !state.type) {
      var owner = tagBySlug(data, state.tag);
      if (owner) state.type = owner.type;
    }

    // A ?tag= that does not belong to the ?type= is dropped rather than
    // silently producing an empty grid.
    if (state.tag) {
      var tag = tagBySlug(data, state.tag);
      if (!tag || (state.type && tag.type !== state.type)) state.tag = "";
    }

    function paintFilter() {
      $("#filterTypes").html(typeTilesHtml(data, state));
      $("#filterTags").html(tagChipsHtml(data, state));
      $("#filterClear").toggleClass("isVisible", Boolean(state.type || state.tag));
    }

    function paintGrid(animateOut) {
      var products = filterProducts(data, state.type, state.tag);
      $("#filterCount").html("<strong>" + pjEscape(countLabel(data, products.length)) + "</strong>");

      var swap = function () {
        return renderProductGrid(data, products).then(function (html) {
          $grid.removeClass("isSwapping").html(html);
        });
      };

      if (!animateOut) return swap();

      // Let the outgoing cards fade before the incoming ones are built, so a
      // filter change reads as a swap rather than as a flicker.
      $grid.addClass("isSwapping");
      return new Promise(function (resolve) {
        window.setTimeout(function () { swap().then(resolve); }, 170);
      });
    }

    function apply(next) {
      state = next;
      syncUrl(state);
      paintFilter();
      return paintGrid(true);
    }

    // Delegated, because both chip rows are replaced on every change.
    $filter.on("click", ".filterType", function () {
      var type = this.getAttribute("data-type");
      if (type === state.type) return;

      // Keep the shelf only if it still exists inside the new range.
      var keep = state.tag && tagBySlug(data, state.tag);
      var nextTag = keep && (!type || keep.type === type) ? state.tag : "";

      apply({ type: type, tag: nextTag });
    });

    $filter.on("click", ".filterTag", function () {
      var slug = this.getAttribute("data-tag");
      if (slug === state.tag) return;

      var owner = slug ? tagBySlug(data, slug) : null;
      apply({ type: owner ? owner.type : state.type, tag: slug });
    });

    $filter.on("click", "#filterClear", function () {
      apply({ type: "", tag: "" });
    });

    paintFilter();
    return paintGrid(false);
  }

  /* ---------- detail page ----------------------------------------------------- */

  function highlightsHtml(product) {
    return (product.highlights || []).map(function (item) {
      return '<span class="productHighlight">' +
        '<i class="bi ' + pjEscape(item.icon || "bi-dot") + '" aria-hidden="true"></i>' +
        pjEscape(item.label) + "</span>";
    }).join("");
  }

  function thumbsHtml(product) {
    return (product.images || []).map(function (image, index) {
      return '<button class="galleryThumb' + (index === 0 ? " isActive" : "") +
        '" type="button" role="tab" aria-selected="' + (index === 0 ? "true" : "false") +
        '" data-index="' + index + '">' +
        '<img src="' + pjEscape(imageUrl(image.src)) + '" alt="' + pjEscape(image.alt) +
        '" loading="lazy"></button>';
    }).join("");
  }

  function specsHtml(product) {
    return (product.specs || []).map(function (spec) {
      return "<tr><th scope=\"row\">" + pjEscape(spec.label) + "</th><td>" +
        pjEscape(spec.value) + "</td></tr>";
    }).join("");
  }

  function pointsHtml(items) {
    return (items || []).map(function (item) {
      return "<li>" + pjEscape(item) + "</li>";
    }).join("");
  }

  function paragraphsHtml(items) {
    return (items || []).map(function (item) {
      return "<p>" + pjEscape(item) + "</p>";
    }).join("");
  }

  /** Tag pills on the detail page link back into the filtered listing. */
  function detailTagsHtml(data, product) {
    return (product.tags || []).map(function (slug) {
      var tag = tagBySlug(data, slug);
      if (!tag) return "";
      return '<a class="productInfoTag" href="' +
        pjEscape(pjPath("pages/products.html?type=" + encodeURIComponent(tag.type) +
                        "&tag=" + encodeURIComponent(tag.slug))) + '">' +
        pjEscape(tag.label) + "</a>";
    }).join("");
  }

  /**
   * The share row. Every target is a plain link built from the page URL — no
   * third-party script, no tracking pixel, nothing that needs a cookie banner.
   * "Copy link" is the exception and is handled in JS below.
   */
  function shareHtml(product, shareText) {
    var url = window.location.href;
    var encodedUrl = encodeURIComponent(url);
    var encodedText = encodeURIComponent(shareText);
    var image = productImage(product, 0);

    var targets = [
      {
        cls: "shareWhatsapp", icon: "bi-whatsapp", label: "Share on WhatsApp",
        href: "https://wa.me/?text=" + encodeURIComponent(shareText + " " + url)
      },
      {
        cls: "shareFacebook", icon: "bi-facebook", label: "Share on Facebook",
        href: "https://www.facebook.com/sharer/sharer.php?u=" + encodedUrl
      },
      {
        cls: "shareX", icon: "bi-twitter-x", label: "Share on X",
        href: "https://twitter.com/intent/tweet?text=" + encodedText + "&url=" + encodedUrl
      },
      {
        cls: "sharePinterest", icon: "bi-pinterest", label: "Save to Pinterest",
        href: "https://pinterest.com/pin/create/button/?url=" + encodedUrl +
              "&description=" + encodedText +
              (image ? "&media=" + encodeURIComponent(image.src) : "")
      }
    ];

    var links = targets.map(function (target) {
      return '<a class="productShareBtn ' + target.cls + '" href="' + pjEscape(target.href) +
        '" target="_blank" rel="noopener" aria-label="' + pjEscape(target.label) + '">' +
        '<i class="bi ' + target.icon + '" aria-hidden="true"></i>' +
        '<span class="shareTip">' + pjEscape(target.label.split(" ").slice(-1)[0]) + "</span></a>";
    }).join("");

    return links +
      '<button class="productShareBtn shareCopy" type="button" id="shareCopyBtn" aria-label="Copy link">' +
      '<i class="bi bi-link-45deg" aria-hidden="true"></i>' +
      '<span class="shareTip" id="shareCopyTip">Copy link</span></button>';
  }

  /** Two contact buttons, with the product name already in the WhatsApp text. */
  function orderActionsHtml(data, product, cfg) {
    var message = "Hello Punarjiva Organics, I would like to ask about " +
      product.name + " — is it in stock?";
    var whatsapp = cfg.contact.whatsapp +
      (cfg.contact.whatsapp.indexOf("?") === -1 ? "?" : "&") +
      "text=" + encodeURIComponent(message);

    return '<a class="btn btnSecondary" href="' + pjEscape(whatsapp) +
      '" target="_blank" rel="noopener">' + pjEscape(data.detailWhatsappLabel) + "</a>" +
      '<a class="btn btnGhost" href="' + pjEscape(cfg.contact.phoneHref) + '">' +
      pjEscape(data.detailCallLabel) + "</a>";
  }

  function renderProductDetail(data, product, cfg) {
    var primary = productImage(product, 0) || { src: "", alt: product.name };

    return pjRender("components/products/productDetail.html", {
      image: primary.src,
      imageAlt: primary.alt,
      galleryHint: data.detailGalleryHint,
      zoomAriaLabel: "View larger images of " + product.name,
      thumbsAriaLabel: product.name + " photographs",
      tabsAriaLabel: "More about " + product.name,
      badgesHtml: badgesHtml(data, product),
      thumbsHtml: thumbsHtml(product),
      typeLabel: typeLabel(data, product.type),
      name: product.name,
      tagline: product.tagline,
      summary: product.summary,
      tagsHtml: detailTagsHtml(data, product),
      highlightsHtml: highlightsHtml(product),
      orderHeading: data.detailOrderHeading,
      orderText: data.detailOrderText,
      orderActionsHtml: orderActionsHtml(data, product, cfg),
      priceNote: data.detailPriceNote,
      shareHeading: data.detailShareHeading,
      shareHtml: shareHtml(product, product.name + " — " + product.tagline),
      aboutHeading: data.detailAboutHeading,
      benefitsHeading: data.detailBenefitsHeading,
      usageHeading: data.detailUsageHeading,
      specsHeading: data.detailSpecsHeading,
      storageHeading: data.detailStorageHeading,
      aboutHtml: paragraphsHtml(product.about),
      benefitsHtml: pointsHtml(product.benefits),
      usageHtml: pointsHtml(product.usage),
      specsHtml: specsHtml(product),
      storage: product.storage
    });
  }

  /* ---------- gallery + lightbox ---------------------------------------------- */

  function initProductGallery(product) {
    var images = product.images || [];
    if (!images.length) return;

    var current = 0;
    var $stage = $("#galleryStage");
    var $image = $("#galleryImage");

    function show(index) {
      if (index === current || !images[index]) return;
      current = index;

      // Fade out, swap the src while invisible, fade back in. Swapping in place
      // shows a blank frame on anything slower than a warm cache.
      $image.addClass("isSwapping");
      window.setTimeout(function () {
        $image.attr("src", imageUrl(images[index].src))
              .attr("alt", images[index].alt)
              .removeClass("isSwapping");
      }, 180);

      $("#galleryThumbs .galleryThumb").each(function (i) {
        $(this).toggleClass("isActive", i === index)
               .attr("aria-selected", i === index ? "true" : "false");
      });
    }

    $("#galleryThumbs").on("click", ".galleryThumb", function () {
      show(Number(this.getAttribute("data-index")));
    });

    // Hovering a thumbnail previews it too — on a catalogue page that is what
    // people try first, and making them click feels unnecessarily strict.
    $("#galleryThumbs").on("mouseenter", ".galleryThumb", function () {
      show(Number(this.getAttribute("data-index")));
    });

    var lightbox = buildLightbox(images);

    $stage.on("click", function () { lightbox.open(current); });
    $stage.on("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        lightbox.open(current);
      }
    });
  }

  /** One lightbox per page, created lazily and reused. */
  function buildLightbox(images) {
    var index = 0;

    var node = document.createElement("div");
    node.className = "productLightbox";
    node.setAttribute("role", "dialog");
    node.setAttribute("aria-modal", "true");
    node.setAttribute("aria-label", "Product photograph");
    node.innerHTML =
      '<button class="lightboxClose" type="button" aria-label="Close">' +
      '<i class="bi bi-x-lg" aria-hidden="true"></i></button>' +
      '<button class="lightboxStep lightboxPrev" type="button" aria-label="Previous image">' +
      '<i class="bi bi-chevron-left" aria-hidden="true"></i></button>' +
      '<button class="lightboxStep lightboxNext" type="button" aria-label="Next image">' +
      '<i class="bi bi-chevron-right" aria-hidden="true"></i></button>' +
      '<figure class="lightboxFigure">' +
      '<img class="lightboxImage" src="" alt="">' +
      '<figcaption class="lightboxCaption"></figcaption></figure>';

    document.body.appendChild(node);

    var $node = $(node);
    var $img = $node.find(".lightboxImage");
    var $caption = $node.find(".lightboxCaption");
    var lastFocused = null;

    function paint() {
      var image = images[index];
      $img.attr("src", imageUrl(image.src)).attr("alt", image.alt);
      $caption.text(image.alt);
    }

    function open(at) {
      lastFocused = document.activeElement;
      index = at || 0;
      paint();
      $node.addClass("isOpen");
      document.body.classList.add("hasLightboxOpen");
      $node.find(".lightboxClose").focus();
    }

    function close() {
      $node.removeClass("isOpen");
      document.body.classList.remove("hasLightboxOpen");
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    function step(by) {
      index = (index + by + images.length) % images.length;
      paint();
    }

    $node.find(".lightboxClose").on("click", close);
    $node.find(".lightboxPrev").on("click", function () { step(-1); });
    $node.find(".lightboxNext").on("click", function () { step(1); });

    // Clicking the backdrop closes; clicking the photograph itself must not.
    $node.on("click", function (event) { if (event.target === node) close(); });

    $(document).on("keydown", function (event) {
      if (!$node.hasClass("isOpen")) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    });

    // A single image needs no arrows, and showing dead ones is worse than none.
    if (images.length < 2) $node.find(".lightboxStep").hide();

    return { open: open, close: close };
  }

  /* ---------- tabs -------------------------------------------------------------- */

  function initProductTabs() {
    var $buttons = $(".productTabBtn");
    if (!$buttons.length) return;

    function activate(button) {
      var panelId = button.getAttribute("aria-controls");

      $buttons.each(function () {
        var isTarget = this === button;
        $(this).toggleClass("isActive", isTarget)
               .attr("aria-selected", isTarget ? "true" : "false")
               .attr("tabindex", isTarget ? "0" : "-1");
      });

      $(".productTabPanel").each(function () {
        var isTarget = this.id === panelId;
        $(this).toggleClass("isActive", isTarget);
        // hidden AND the class: the class drives the animation, the attribute
        // is what keeps an inactive panel out of the accessibility tree.
        if (isTarget) this.removeAttribute("hidden");
        else this.setAttribute("hidden", "");
      });
    }

    $buttons.on("click", function () { activate(this); });

    $buttons.on("keydown", function (event) {
      var step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;

      event.preventDefault();
      var list = $buttons.toArray();
      var next = list[(list.indexOf(this) + step + list.length) % list.length];
      next.focus();
      activate(next);
    });
  }

  /* ---------- copy-link button --------------------------------------------------- */

  function initShareCopy() {
    var button = document.getElementById("shareCopyBtn");
    if (!button) return;

    button.addEventListener("click", function () {
      var url = window.location.href;
      var tip = document.getElementById("shareCopyTip");

      var done = function () {
        button.classList.add("isCopied");
        if (tip) tip.textContent = "Link copied";
        window.setTimeout(function () {
          button.classList.remove("isCopied");
          if (tip) tip.textContent = "Copy link";
        }, 1800);
      };

      // navigator.clipboard is unavailable over plain http:// on anything but
      // localhost, which is exactly how this site is usually previewed — so the
      // textarea fallback is not legacy cruft, it is the common path in dev.
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(done).catch(fallback);
      } else {
        fallback();
      }

      function fallback() {
        var field = document.createElement("textarea");
        field.value = url;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        try { document.execCommand("copy"); done(); } catch (err) {
          console.warn("[productRenderer] Could not copy the link:", err);
        }
        document.body.removeChild(field);
      }
    });
  }

  /* ---------- related shelf --------------------------------------------------------- */

  /** Same shelf first, then the rest of the range, never the product itself. */
  function relatedProducts(data, product, limit) {
    var max = limit || 3;
    var pool = (data.products || []).filter(function (p) { return p.slug !== product.slug; });

    var sameShelf = pool.filter(function (p) {
      return (p.tags || []).some(function (tag) {
        return (product.tags || []).indexOf(tag) !== -1;
      });
    });

    var sameRange = pool.filter(function (p) {
      return p.type === product.type && sameShelf.indexOf(p) === -1;
    });

    return sameShelf.concat(sameRange).slice(0, max);
  }

  /* ---------- home: spotlight + rail -------------------------------------------------- */

  /**
   * The featured banner. Which of the flagged products gets the slot rotates by
   * the DAY rather than by page load — a banner that changes every time someone
   * navigates reads as a bug, and a fixed one makes "this month's pick" a lie.
   * Falls back to the first product if nothing is flagged featured at all.
   */
  function renderSpotlight(data, eyebrow, actionsHtml) {
    var featured = productsWithBadge(data, "featured");
    var dayNumber = Math.floor(Date.now() / 86400000);
    var product = featured.length
      ? featured[dayNumber % featured.length]
      : (data.products || [])[0];
    if (!product) return Promise.resolve("");

    var image = productImage(product, 0) || { src: "", alt: product.name };

    return pjRender("components/banners/bannerSpotlight.html", {
      eyebrow: eyebrow || typeLabel(data, product.type),
      title: product.name,
      tagline: product.tagline,
      text: product.summary,
      image: image.src,
      imageAlt: image.alt,
      marksHtml: (product.highlights || []).map(function (item) {
        return '<span class="spotlightMark">' +
          '<i class="bi ' + pjEscape(item.icon || "bi-dot") + '" aria-hidden="true"></i>' +
          pjEscape(item.label) + "</span>";
      }).join(""),
      actionsHtml: actionsHtml || ('<a class="btn btnPrimary" href="' +
        pjEscape(productHref(product.slug)) + '">See the full details</a>')
    });
  }

  /** Left/right buttons for a rail, disabled at each end. */
  function initProductRail(railSelector) {
    var $rail = $(railSelector);
    if (!$rail.length) return;

    var track = $rail.find(".productRailTrack")[0];
    var $prev = $rail.find(".productRailPrev");
    var $next = $rail.find(".productRailNext");
    if (!track) return;

    function page(direction) {
      track.scrollBy({
        left: direction * Math.max(track.clientWidth * 0.8, 240),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    }

    function sync() {
      var max = track.scrollWidth - track.clientWidth - 4;
      $prev.prop("disabled", track.scrollLeft <= 4);
      $next.prop("disabled", track.scrollLeft >= max);
    }

    $prev.on("click", function () { page(-1); });
    $next.on("click", function () { page(1); });
    $(track).on("scroll", sync);
    $(window).on("resize", sync);
    sync();
  }

  /* ---------- structured data ------------------------------------------------------------ */

  /**
   * Product schema WITHOUT an offers block. Google will happily accept one with
   * a made-up price; the store publishes none, so none is stated here either.
   */
  function productSchema(data, product, cfg) {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.summary,
      image: (product.images || []).map(function (image) { return imageUrl(image.src); }),
      category: typeLabel(data, product.type),
      brand: { "@type": "Brand", name: cfg.siteName },
      url: window.location.href
    };
  }

  /* ---------- exports ---------------------------------------------------------------------- */

  window.pjProducts = {
    typeBySlug: typeBySlug,
    tagBySlug: tagBySlug,
    productBySlug: productBySlug,
    typeLabel: typeLabel,
    filterProducts: filterProducts,
    productsWithBadge: productsWithBadge,
    productHref: productHref,
    productImage: productImage,
    renderProductCard: renderProductCard,
    renderProductGrid: renderProductGrid,
    initProductCatalogue: initProductCatalogue,
    renderProductDetail: renderProductDetail,
    initProductGallery: initProductGallery,
    initProductTabs: initProductTabs,
    initShareCopy: initShareCopy,
    relatedProducts: relatedProducts,
    renderSpotlight: renderSpotlight,
    initProductRail: initProductRail,
    productSchema: productSchema
  };

})(window, jQuery);
