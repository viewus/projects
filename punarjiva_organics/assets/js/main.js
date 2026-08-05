/* ---------------------------------------------------------------------------
 * main.js — page orchestration.
 *
 * Order matters and is deliberate:
 *   1. inject the shared chrome (header / nav / footer / CTA / breadcrumbs)
 *   2. load this page's JSON, named by <body data-page="...">
 *   3. fill every [data-content] hook — including hooks inside the chrome that
 *      was only just injected
 *   4. run the page-specific renderer
 *
 * Steps 1 and 3 must not be reordered: jQuery's .load() is async, so filling
 * content before the chrome lands would silently skip the CTA section.
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  /* Which JSON file backs which page. Blog post pages read blog.json too. */
  var pageDataFiles = {
    home:     "data/home.json",
    about:    "data/about.json",
    products: "data/products.json",
    gallery:  "data/gallery.json",
    blog:     "data/blog.json",
    blogPost: "data/blog.json",
    reviews:  "data/reviews.json",
    faq:      "data/faq.json",
    visit:    "data/visit.json",
    contact:  "data/contact.json"
  };

  /* ---------- generic helpers ----------------------------------------------- */

  /**
   * Fill every [data-content] element from the page JSON. Dotted keys are
   * supported ("fields.nameLabel"), so nested content still reaches the page
   * without flattening the JSON or hardcoding text in HTML.
   */
  function fillContent(data, scope) {
    $(scope || document).find("[data-content]").each(function () {
      var value = pjGet(data, this.getAttribute("data-content"));
      if (value != null && typeof value !== "object") this.textContent = value;
    });
  }

  /** Fill input placeholder text from JSON, same dotted-key rules as above. */
  function fillPlaceholders(data) {
    $("[data-placeholder]").each(function () {
      var value = pjGet(data, this.getAttribute("data-placeholder"));
      if (value != null) this.setAttribute("placeholder", value);
    });
  }

  /** Point every [data-link] element at a project-relative href. */
  function fillLinks() {
    $("[data-link]").each(function () {
      this.setAttribute("href", pjPath(this.getAttribute("data-link")));
    });
  }

  /**
   * Fill <img data-image="key" data-image-alt="altKey"> from the page JSON, so
   * swapping a photo is a JSON edit like everything else. A value starting with
   * "assets/" is treated as project-relative; anything else (an Unsplash URL)
   * is used as-is.
   */
  function fillImages(data) {
    $("[data-image]").each(function () {
      var src = data[this.getAttribute("data-image")];
      var alt = data[this.getAttribute("data-image-alt")];
      if (src) this.setAttribute("src", /^(https?:)?\/\//.test(src) ? src : pjPath(src));
      if (alt != null) this.setAttribute("alt", alt);
    });
  }

  function renderBreadcrumbs(trail) {
    var $list = $("#breadCrumbsList");
    if (!$list.length) return;

    $list.html(trail.map(function (crumb, index) {
      var isLast = index === trail.length - 1;
      var inner = isLast || !crumb.href
        ? '<span class="breadCrumbsCurrent" aria-current="page">' + pjEscape(crumb.label) + "</span>"
        : '<a class="breadCrumbsLink" href="' + pjEscape(pjPath(crumb.href)) + '">' +
          pjEscape(crumb.label) + "</a>";
      return '<li class="breadCrumbsItem">' + inner + "</li>";
    }).join(""));
  }

  /* ---------- hero helpers --------------------------------------------------- */

  function assetUrl(value) {
    return /^(https?:)?\/\//.test(value) ? value : pjPath(value);
  }

  /**
   * Build the token object for a hero/page banner from the page's own JSON.
   * backgroundImage is optional — with none set, the banner falls back to the
   * brand gradient, so a page never looks broken for want of a photo.
   */
  function heroData(data) {
    var bg = data.backgroundImage;
    return {
      eyebrow: data.heroEyebrow || data.pageEyebrow,
      title: data.heroTitle || data.pageTitle,
      subtitle: data.heroSubtitle || data.pageIntro,
      image: data.heroImage,
      imageAlt: data.heroImageAlt,
      leaf: pjPath("assets/svg/illustrations/leafSprig.svg"),
      leafParticle: pjPath("assets/svg/illustrations/leafParticle.svg"),
      // Raw by name so the style attribute is inserted, not escaped.
      bgStyleHtml: bg ? 'style="background-image:url(\'' + assetUrl(bg) + '\')"' : ""
    };
  }

  /** tintStrong / tintLight from JSON; anything else keeps the default tint. */
  function applyTint(selector, tint) {
    if (tint === "strong") $(selector).addClass("tintStrong");
    else if (tint === "light") $(selector).addClass("tintLight");
  }

  /**
   * Scatter tree-of-life watermarks into every section marked .hasTrees.
   * Placement, scale and rotation live in organic.css; this only injects the
   * layer so the markup does not carry five decorative <img> tags per section.
   */
  function scatterTrees() {
    var src = pjPath("assets/svg/illustrations/treeOfLife.svg");
    var names = ["One", "Two", "Three", "Four", "Five"];

    $(".hasTrees").each(function (index) {
      // Alternate how many marks each section gets, so consecutive sections
      // never look identical.
      var count = index % 2 === 0 ? 3 : 2;
      var offset = index % 3;
      var marks = "";

      for (var i = 0; i < count; i++) {
        var name = names[(i + offset) % names.length];
        marks += '<img class="treeMark treeMark' + name + '" src="' + src + '" alt="" aria-hidden="true">';
      }

      $(this).prepend('<div class="treeField" aria-hidden="true">' + marks + "</div>");
    });
  }

  /**
   * The page-wide leaf drift: leaves crossing left to right on an arc, behind
   * all content. Injected once per page, directly into <body>, so every page
   * gets it without carrying six decorative <img> tags in its markup.
   */
  function startLeafDrift() {
    if (document.querySelector(".leafDrift")) return;

    var src = pjPath("assets/svg/illustrations/leafParticle.svg");
    var lanes = ["One", "Two", "Three", "Four", "Five", "Six"];

    var html = lanes.map(function (lane) {
      return '<span class="driftTrack driftTrack' + lane + '">' +
        '<img class="driftLeaf" src="' + src + '" alt="">' +
        "</span>";
    }).join("");

    var layer = document.createElement("div");
    layer.className = "leafDrift";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = html;
    document.body.appendChild(layer);
  }

  /** Larger, deliberately visible trees rooted at the edges of a section. */
  function placeStandingTrees() {
    var src = pjPath("assets/svg/illustrations/treeOfLife.svg");
    $(".hasStandingTrees").each(function () {
      $(this).prepend(
        '<img class="standingTree standingTreeLeft" src="' + src + '" alt="" aria-hidden="true">' +
        '<img class="standingTree standingTreeRight" src="' + src + '" alt="" aria-hidden="true">'
      );
    });
  }

  /**
   * The rotating lotus ornament from the logo, once per page at most.
   * When .hasMandala is a component placeholder, the ornament must go INSIDE
   * the injected section — the placeholder div is unpositioned and clips
   * nothing, so anchoring to it would send the ornament across the page.
   */
  function placeMandala() {
    var $marked = $(".hasMandala").first();
    if (!$marked.length) return;

    var $target = $marked.find(".ctaSection").first();
    if (!$target.length) $target = $marked;

    $target.prepend('<img class="mandalaOrnament" src="' +
      pjPath("assets/svg/illustrations/mandalaPetals.svg") + '" alt="" aria-hidden="true">');
  }

  /** Render the Call / WhatsApp / Directions buttons into a container. */
  function fillActions(selector, cfg) {
    var $target = $(selector);
    if (!$target.length) return Promise.resolve();

    return pjJson("data/ctaActions.json").then(function (labels) {
      return renderContactActions(cfg, labels);
    }).then(function (html) {
      $target.html(html);
    });
  }

  /* ---------- page renderers ------------------------------------------------ */

  var pages = {

    home: function (data, cfg) {
      return renderBanner(heroData(data), "hero").then(function (html) {
        $("#heroPlaceholder").html(html);
        applyTint("#heroPlaceholder .bannerHero", data.backgroundTint);
        return fillActions("#heroActions", cfg);
      }).then(function () {
        return pjJson("data/products.json");
      }).then(function (products) {
        return renderCardGrid(products.categories.map(function (category) {
          // Home shows the three categories without their full item lists —
          // the Products page carries those.
          return Object.assign({}, category, { items: null, variant: "outline" });
        }));
      }).then(function (html) {
        $("#homeCategories").html(html);
        return pjJson("data/blog.json");
      }).then(function (blog) {
        return renderPostGrid({
          posts: blog.posts.slice(0, 3),
          emptyMessage: blog.emptyMessage
        }, "");
      }).then(function (html) {
        $("#homeBlogTeaser").html(html);
      });
    },

    about: function (data) {
      return renderCardGrid(data.pillars).then(function (html) {
        $("#aboutPillars").html(html);
      });
    },

    products: function (data) {
      return renderCardGrid(data.categories).then(function (html) {
        $("#productCategories").html(html);
      });
    },

    gallery: function (data) {
      var chain = Promise.resolve();

      if (data.placeholderImagery) {
        chain = renderNotice("Placeholder photography", data.placeholderNotice)
          .then(function (html) { $("#galleryNotice").html(html); });
      }

      return chain.then(function () {
        return renderCardGrid(data.images, "minimal");
      }).then(function (html) {
        $("#galleryGrid").html(html);
      });
    },

    blog: function (data) {
      var category = currentCategory();
      $("#blogFilter").html(renderCategoryFilter(data, category));

      // Reflect the active category in the H1 so a filtered view does not look
      // like a broken copy of the unfiltered one.
      var active = data.categories.filter(function (c) { return c.slug === category; })[0];
      if (active) $("#blogPageTitle").text(active.label);

      return renderPostGrid(data, category).then(function (html) {
        $("#blogGrid").html(html);
      });
    },

    blogPost: function (data) {
      var slug = document.body.getAttribute("data-post");
      var post = findPost(data, slug);

      if (!post) {
        $("#postBody").html('<p class="postParagraph">This article could not be found. ' +
          '<a href="' + pjPath("pages/blog.html") + '">Back to all articles</a>.</p>');
        console.error("[main] No post in data/blog.json with slug:", slug);
        return Promise.resolve();
      }

      $("#postTitle").text(post.title);
      $("#postExcerpt").text(post.excerpt);
      $("#postCategory").text(post.categoryLabel)
        .attr("href", pjPath("pages/blog.html?category=" + encodeURIComponent(post.category)));
      $("#postDate").text(post.dateLabel).attr("datetime", post.date);
      $("#postReadingTime").text(post.readingTime);
      $("#postHeroImage").attr("src", post.heroImage).attr("alt", post.heroImageAlt);
      $("#postBody").html(renderPostBody(post.body));
      $("#postBackLink").text(data.backLabel).attr("href", pjPath("pages/blog.html"));
      $("#postRelatedHeading").text(data.relatedHeading);

      renderBreadcrumbs([
        { label: "Home", href: "index.html" },
        { label: "Blog", href: "pages/blog.html" },
        { label: post.title }
      ]);

      injectPostSchema(post);

      return renderRelated(data, post).then(function (html) {
        if (html) $("#postRelated").html(html);
        else $("#postRelatedSection").hide();
      });
    },

    reviews: function (data, cfg) {
      $("#reviewsGoogleLink").attr("href", cfg.contact.googleReviewsUrl);

      var chain = Promise.resolve();

      // The sample-content guard: any placeholder entry surfaces a banner.
      if (data.sampleWarning || hasPlaceholders(data.reviews)) {
        chain = renderNotice(data.sampleWarningTitle, data.sampleWarningText)
          .then(function (html) { $("#reviewsNotice").html(html); });
      }

      return chain.then(function () {
        return renderReviewGrid(data.reviews);
      }).then(function (html) {
        $("#reviewsGrid").html(html);
      });
    },

    faq: function (data) {
      $("#faqGroups").html(renderFaqGroups(data));
      injectFaqSchema(data);
      return Promise.resolve();
    },

    visit: function (data, cfg) {
      var contact = cfg.contact;
      var hoursUnknown = /^TODO/i.test(contact.hours);

      var rows = [
        ["Address", pjEscape(contact.addressFull)],
        ["Landmark", pjEscape(contact.landmark)],
        ["Phone", '<a href="' + pjEscape(contact.phoneHref) + '">' +
                  pjEscape(contact.phone) + "</a>"],
        ["WhatsApp", '<a href="' + pjEscape(contact.whatsapp) +
                  '" target="_blank" rel="noopener">Send your list</a>'],
        ["Email", '<a href="mailto:' + pjEscape(contact.email) + '">' +
                  pjEscape(contact.email) + "</a>"],
        // No opening hours are published on punarjiva.in, so none are invented.
        ["Timings", hoursUnknown
          ? '<span class="dataTableUnknown">' + pjEscape(contact.hoursFallback) + "</span>"
          : pjEscape(contact.hours)]
      ];

      $("#visitDirectionsLink").attr("href", contact.mapsUrl).text(data.directionsLinkLabel);
      $("#visitBeforeList").html((data.beforeYouCome || []).map(function (item) {
        return '<li class="visitListItem">' + pjEscape(item) + "</li>";
      }).join(""));

      injectLocalBusinessSchema(cfg);

      return renderTable({
        caption: data.detailsHeading,
        columns: data.detailsColumns,
        rows: rows
      }, data.detailsVariant).then(function (html) {
        $("#visitDetailsTable").html(html);
      });
    },

    contact: function (data, cfg) {
      var f = data.fields;

      $("#contactInterest").html(f.interestOptions.map(function (option) {
        return '<option value="' + pjEscape(option) + '">' + pjEscape(option) + "</option>";
      }).join(""));

      $("#contactAddress").text(cfg.contact.addressFull);
      $("#contactHours").text(/^TODO/i.test(cfg.contact.hours)
        ? cfg.contact.hoursFallback
        : cfg.contact.hours);

      initContactForm(data);
      return fillActions("#contactQuickActions", cfg);
    }
  };

  /* ---------- structured data ----------------------------------------------- */

  function appendSchema(schema) {
    var el = document.createElement("script");
    el.type = "application/ld+json";
    el.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(el);
  }

  function injectPostSchema(post) {
    appendSchema({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.metaDescription || post.excerpt,
      datePublished: post.date,
      image: post.heroImage,
      articleSection: post.categoryLabel,
      mainEntityOfPage: window.location.href,
      publisher: { "@type": "Organization", name: "Punarjiva Organics" }
    });
  }

  function injectLocalBusinessSchema(cfg) {
    var c = cfg.contact;
    appendSchema({
      "@context": "https://schema.org",
      "@type": "HealthAndBeautyBusiness",
      name: cfg.legalName,
      alternateName: cfg.siteName,
      description: "Organic groceries, natural cosmetics and Ayurvedic energy boosters in Proddatur.",
      telephone: c.phone,
      email: c.email,
      hasMap: c.mapsUrl,
      address: {
        "@type": "PostalAddress",
        streetAddress: c.addressLine1,
        addressLocality: c.addressLine2,
        addressRegion: c.addressRegion,
        postalCode: c.postalCode,
        addressCountry: "IN"
      }
      // openingHours is deliberately absent: the source site publishes none,
      // and stating hours we cannot verify would send customers to a shut door.
    });
  }

  /* ---------- boot ----------------------------------------------------------- */

  $(function () {
    var page = document.body.getAttribute("data-page") || "home";
    var dataFile = pageDataFiles[page];

    if (!dataFile) {
      console.error("[main] Unknown data-page value:", page);
      return;
    }

    var cfgRef;

    pjLoadChrome()
      .then(function (cfg) {
        cfgRef = cfg;
        return pjJson(dataFile);
      })
      .then(function (data) {
        // Safe on post pages too: they address their own elements by ID
        // (#postTitle, #postBody, ...), so nothing here collides with the
        // listing-page keys that also live in blog.json.
        fillContent(data);
        fillPlaceholders(data);
        fillLinks();
        fillImages(data);

        // Inner pages share the home hero's treatment via the bannerPage
        // variant, so every page gets the same background-image support and
        // organic motion layer without repeating markup 12 times.
        var headerDone = $("#pageHeaderPlaceholder").length
          ? renderBanner(heroData(data), "page").then(function (html) {
              $("#pageHeaderPlaceholder").html(html);
              applyTint("#pageHeaderPlaceholder .bannerHero", data.backgroundTint);
            })
          : Promise.resolve();

        return headerDone.then(function () {
          scatterTrees();
          placeStandingTrees();
          placeMandala();
          startLeafDrift();
          return fillActions("#ctaSectionActions", cfgRef);
        }).then(function () {
          return (pages[page] || function () {})(data, cfgRef);
        });
      })
      .then(function () {
        document.body.classList.add("isLoaded");
      })
      .catch(function (err) {
        console.error("[main] Page failed to initialise:", err);
        document.body.classList.add("isLoaded");
      });
  });

  window.fillContent = fillContent;
  window.renderBreadcrumbs = renderBreadcrumbs;

})(window, jQuery);
