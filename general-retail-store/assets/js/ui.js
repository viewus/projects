/* ---------------------------------------------------------------------------
 * ui.js — small interactive primitives shared across pages.
 *
 * Toast, modal, accordion, tabs and back-to-top. Bootstrap ships versions of
 * some of these, but they are implemented here so their markup and classes stay
 * consistent with the rest of the template and are themeable through the same
 * CSS custom properties. Bootstrap is still used for the nav collapse/dropdown,
 * where its accessibility handling is worth inheriting.
 *
 * Everything is delegated from `document`, so it works on markup that is
 * injected later by a renderer.
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  var RS = window.RS || (window.RS = {});

  /* ---------- toast ---------------------------------------------------------- */

  var TOAST_ICONS = {
    success: "bi-check-circle-fill",
    error: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill"
  };

  /**
   * Show a transient message.
   * role="status" so screen readers announce it without stealing focus.
   */
  RS.toast = function (message, type, ms) {
    var kind = type || "info";
    var $stack = $("#toastStack");

    if (!$stack.length) {
      $stack = $('<div id="toastStack" class="toastStack" role="status" aria-live="polite"></div>')
        .appendTo(document.body);
    }

    var $toast = $(
      '<div class="toast toast' + kind.charAt(0).toUpperCase() + kind.slice(1) + '">' +
      '<i class="bi ' + (TOAST_ICONS[kind] || TOAST_ICONS.info) + '" aria-hidden="true"></i>' +
      '<span class="toastText"></span>' +
      '<button type="button" class="toastClose" aria-label="Dismiss">' +
      '<i class="bi bi-x" aria-hidden="true"></i></button>' +
      "</div>"
    );

    $toast.find(".toastText").text(message);
    $stack.append($toast);

    // Force a reflow so the entrance transition actually runs.
    $toast[0].offsetHeight;
    $toast.addClass("isVisible");

    var timer = setTimeout(dismiss, ms || 4000);

    function dismiss() {
      clearTimeout(timer);
      $toast.removeClass("isVisible");
      setTimeout(function () { $toast.remove(); }, 300);
    }

    $toast.find(".toastClose").on("click", dismiss);
    return dismiss;
  };

  /* ---------- modal ---------------------------------------------------------- */

  var lastFocused = null;

  /** Open a modal with arbitrary markup as its body. */
  RS.modal = function (title, bodyHtml, opts) {
    var options = opts || {};
    lastFocused = document.activeElement;

    $(".modalBackdrop").remove();

    var $modal = $(
      '<div class="modalBackdrop">' +
      '<div class="modalPanel" role="dialog" aria-modal="true" aria-labelledby="modalTitle">' +
      '<div class="modalHead">' +
      '<h2 class="modalTitle" id="modalTitle"></h2>' +
      '<button type="button" class="modalClose" aria-label="Close">' +
      '<i class="bi bi-x-lg" aria-hidden="true"></i></button>' +
      "</div>" +
      '<div class="modalBody"></div>' +
      (options.footerHtml ? '<div class="modalFoot">' + options.footerHtml + "</div>" : "") +
      "</div></div>"
    );

    $modal.find(".modalTitle").text(title);
    $modal.find(".modalBody").html(bodyHtml);
    $(document.body).append($modal).addClass("hasModal");

    $modal[0].offsetHeight;
    $modal.addClass("isVisible");
    $modal.find(".modalClose").trigger("focus");

    function close() {
      $modal.removeClass("isVisible");
      $(document.body).removeClass("hasModal");
      setTimeout(function () { $modal.remove(); }, 250);
      $(document).off("keydown.rsModal");
      if (lastFocused) lastFocused.focus();
    }

    $modal.find(".modalClose").on("click", close);
    $modal.on("click", function (e) {
      if (e.target === $modal[0]) close();   // click the backdrop, not the panel
    });
    $(document).on("keydown.rsModal", function (e) {
      if (e.key === "Escape") close();
    });

    return close;
  };

  /* ---------- accordion ------------------------------------------------------ */

  /**
   * Accordion built on real <button aria-expanded>, so it is keyboard operable
   * and announced correctly. Used by the FAQ page.
   */
  function initAccordion() {
    $(document).on("click.rsAccordion", ".accordionTrigger", function () {
      var $trigger = $(this);
      var $item = $trigger.closest(".accordionItem");
      var $panel = $item.find(".accordionPanel");
      var isOpen = $trigger.attr("aria-expanded") === "true";

      // Single-open groups collapse their siblings; multi-open ones do not.
      if (!isOpen && $item.closest(".accordion").hasClass("isSingle")) {
        var $group = $item.closest(".accordion");
        $group.find(".accordionTrigger").attr("aria-expanded", "false");
        $group.find(".accordionPanel").removeClass("isOpen").slideUp(180);
      }

      $trigger.attr("aria-expanded", String(!isOpen));
      $panel.toggleClass("isOpen", !isOpen).slideToggle(180);
    });
  }

  /* ---------- tabs ----------------------------------------------------------- */

  function initTabs() {
    $(document).on("click.rsTabs", ".tabBtn", function () {
      var $btn = $(this);
      var $group = $btn.closest(".tabs");
      var target = $btn.attr("data-tab");

      $group.find(".tabBtn").attr("aria-selected", "false").removeClass("isActive");
      $btn.attr("aria-selected", "true").addClass("isActive");

      $group.find(".tabPanel").each(function () {
        $(this).toggleClass("isActive", this.getAttribute("data-tab-panel") === target);
      });
    });

    // Arrow-key navigation between tabs, per the WAI-ARIA tabs pattern.
    $(document).on("keydown.rsTabs", ".tabBtn", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;

      var $tabs = $(this).closest(".tabs").find(".tabBtn");
      var index = $tabs.index(this);
      var next = e.key === "ArrowRight" ? index + 1 : index - 1;

      if (next < 0) next = $tabs.length - 1;
      if (next >= $tabs.length) next = 0;

      $tabs.eq(next).trigger("focus").trigger("click");
      e.preventDefault();
    });
  }

  /* ---------- back to top ----------------------------------------------------- */

  function initBackToTop() {
    var $btn = $("#backToTop");
    if (!$btn.length) return;

    $btn.on("click", function () {
      window.scrollTo({ top: 0, behavior: RS.scrollBehavior() });
    });

    // The control only earns its space once there is something to go back up to.
    function sync() { $btn.toggleClass("isVisible", window.scrollY > 500); }
    $(window).on("scroll.rsTop", sync);
    sync();
  }

  /* ---------- theme toggle ---------------------------------------------------- */

  function initThemeToggle() {
    $(document).on("click.rsTheme", "[data-theme-toggle]", function () {
      RS.toggleColorScheme();
    });
  }

  /* ---------- sticky header --------------------------------------------------- */

  function initStickyHeader() {
    var $nav = $(".siteNav");
    if (!$nav.length) return;

    function sync() { $nav.toggleClass("isStuck", window.scrollY > 10); }
    $(window).on("scroll.rsNav", sync);
    sync();
  }

  /* ---------- boot ------------------------------------------------------------ */

  $(function () {
    initAccordion();
    initTabs();
    initThemeToggle();
  });

  // These need markup that app.js injects, so they run on the ready event.
  $(document).on("rs:ready", function () {
    initBackToTop();
    initStickyHeader();
  });

})(window, jQuery);
