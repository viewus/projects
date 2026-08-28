/* ---------------------------------------------------------------------------
 * analytics.js — a tracking hook, deliberately inert by default.
 *
 * The template ships with NO analytics provider wired up and NO tracking script
 * loaded. That is intentional: a template that phones home the moment it is
 * deployed is a liability for whoever deploys it, and in several jurisdictions
 * it needs consent before the first request.
 *
 * To enable, set provider + measurement id in data/settings.json:
 *     "analytics": { "provider": "ga4", "id": "G-XXXXXXX", "enabled": true }
 *
 * RS.track() is safe to call from anywhere regardless — when analytics are off
 * it is a no-op, so feature code never needs to check first.
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  var RS = window.RS || (window.RS = {});

  var state = { enabled: false, provider: null, queue: [] };

  /** Inject the GA4 tag. Only reached when settings.json explicitly enables it. */
  function loadGa4(id) {
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true });
  }

  /**
   * Record an event. No-op unless analytics are enabled, so call sites stay
   * clean: RS.track("add_to_list", { item: "Basmati Rice" })
   */
  RS.track = function (eventName, params) {
    if (!state.enabled) {
      // Kept in memory so a developer can inspect RS.trackedEvents() while
      // building, without any data leaving the browser.
      state.queue.push({ event: eventName, params: params, at: new Date().toISOString() });
      return;
    }

    if (state.provider === "ga4" && typeof window.gtag === "function") {
      window.gtag("event", eventName, params || {});
    }
  };

  /** Everything RS.track() captured while disabled — a debugging aid. */
  RS.trackedEvents = function () {
    return state.queue.slice();
  };

  RS.initAnalytics = function () {
    var conf = (RS.opts && RS.opts.analytics) || {};

    if (!conf.enabled || !conf.id || !conf.provider) {
      return;  // the default: nothing loaded, nothing sent
    }

    state.provider = conf.provider;

    if (conf.provider === "ga4") {
      loadGa4(conf.id);
      state.enabled = true;
    } else {
      console.warn("[analytics] Unknown provider '" + conf.provider + "'; nothing loaded.");
      return;
    }

    // Flush anything recorded before init finished.
    state.queue.splice(0).forEach(function (row) {
      RS.track(row.event, row.params);
    });

    RS.track("page_view", { page: RS.currentPage() });
  };

})(window, jQuery);
