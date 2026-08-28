/* ---------------------------------------------------------------------------
 * seo.js — site-wide meta tags and JSON-LD structured data.
 *
 * DIVISION OF LABOUR — read this before "fixing" the duplication.
 *
 *   Per-page <title>, description, canonical and OG tags are written STATICALLY
 *   into each page's <head>. They are NOT injected from here, on purpose:
 *   this is a multi-page site precisely so crawlers and link-preview scrapers
 *   (WhatsApp, LinkedIn, Slack) can read those tags without running JavaScript.
 *   Injecting them would hand back the main benefit of the architecture.
 *
 *   data/seo.json remains the single source of truth for those values — when it
 *   changes, mirror the value into the page's head. See README.md.
 *
 *   This file fills only what is genuinely site-wide (theme colour, og:site_name,
 *   og:image, favicon) plus JSON-LD schema, which search engines DO evaluate
 *   after scripts run.
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  var RS = window.RS || (window.RS = {});

  function setMeta(selector, attr, value) {
    if (!value) return;
    var el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  }

  /** Site-wide head values that are identical on every page. */
  function applySharedMeta(cfg) {
    setMeta("#ogSiteName", "content", cfg.siteName);
    setMeta("#ogImage", "content", cfg.defaultOgImage);
    setMeta("#twitterImage", "content", cfg.defaultOgImage);
    setMeta("#twitterSite", "content", cfg.social && cfg.social.twitterHandle);
    setMeta("#faviconLink", "href", cfg.logo && RS.path(cfg.logo.favicon || cfg.logo.mark));
    setMeta("#appleIconLink", "href", cfg.logo && RS.path(cfg.logo.appleTouch || cfg.logo.mark));
  }

  /** Append one JSON-LD block. */
  function addSchema(data) {
    if (!data) return;
    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data, null, 2);
    document.head.appendChild(script);
  }

  /**
   * Organisation + LocalBusiness schema. A retail store is a physical business,
   * so LocalBusiness (with address and opening hours) is what earns the rich
   * result — plain Organization would not.
   */
  function storeSchema(cfg, seo) {
    var contact = cfg.contact || {};
    var schema = {
      "@context": "https://schema.org",
      "@type": (seo && seo.businessType) || "GroceryStore",
      name: cfg.siteName,
      description: cfg.tagline,
      url: cfg.baseUrl,
      telephone: contact.phone,
      email: contact.email,
      image: cfg.defaultOgImage,
      priceRange: (seo && seo.priceRange) || "₹₹"
    };

    if (contact.addressLine1) {
      schema.address = {
        "@type": "PostalAddress",
        streetAddress: [contact.addressLine1, contact.addressLine2].filter(Boolean).join(", "),
        addressLocality: contact.city,
        addressRegion: contact.region,
        postalCode: contact.postalCode,
        addressCountry: contact.country
      };
    }

    if (contact.geo && contact.geo.lat) {
      schema.geo = {
        "@type": "GeoCoordinates",
        latitude: contact.geo.lat,
        longitude: contact.geo.lng
      };
    }

    if (Array.isArray(contact.openingHours) && contact.openingHours.length) {
      schema.openingHoursSpecification = contact.openingHours.map(function (row) {
        return {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: row.days,
          opens: row.opens,
          closes: row.closes
        };
      });
    }

    var social = cfg.social || {};
    var profiles = ["facebook", "instagram", "youtube", "twitter"]
      .map(function (key) { return social[key]; })
      .filter(Boolean);
    if (profiles.length) schema.sameAs = profiles;

    return schema;
  }

  /** Breadcrumb schema, built from the trail already on the page. */
  function breadcrumbSchema(cfg) {
    var crumbs = $(".breadcrumbLink, .breadcrumbCurrent");
    if (crumbs.length < 2) return null;

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map(function (index, el) {
        var item = {
          "@type": "ListItem",
          position: index + 1,
          name: $(el).text().trim()
        };
        var href = $(el).attr("href");
        if (href) item.item = new URL(href, window.location.href).href;
        return item;
      }).get()
    };
  }

  /**
   * Public entry point, called by app.js once the page is fully rendered.
   * @param {object} cfg     site.json
   * @param {string} pageKey current page key
   */
  RS.initSeo = function (cfg, pageKey) {
    applySharedMeta(cfg);

    return RS.json("data/seo.json").then(function (seo) {
      var page = (seo && seo.pages && seo.pages[pageKey]) || {};

      addSchema(storeSchema(cfg, seo && seo.global));
      addSchema(breadcrumbSchema(cfg));

      // Page-type schema, when the JSON declares one (FAQ pages benefit most —
      // FAQPage markup can surface answers directly in results).
      if (page.schema) addSchema(page.schema);

      if (pageKey === "faq" && !page.schema) {
        RS.json("data/faq.json").then(function (faq) {
          var items = [];
          (faq.groups || []).forEach(function (group) {
            (group.items || []).forEach(function (item) { items.push(item); });
          });
          if (!items.length) return;

          addSchema({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map(function (item) {
              return {
                "@type": "Question",
                name: item.question,
                acceptedAnswer: { "@type": "Answer", text: item.answer }
              };
            })
          });
        });
      }
    }, function () {
      // seo.json is optional decoration — never let it break a page.
      addSchema(storeSchema(cfg, null));
    });
  };

})(window, jQuery);
