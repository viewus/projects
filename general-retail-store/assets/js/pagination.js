/* ---------------------------------------------------------------------------
 * pagination.js — page slicing plus the control strip.
 *
 * Page size comes from settings.json, never from a constant here, so a client
 * can show 12 or 48 products per page without touching code.
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  var RS = window.RS || (window.RS = {});

  /** Clamp a requested page into the range that actually exists. */
  function clampPage(page, totalPages) {
    var n = parseInt(page, 10);
    if (!isFinite(n) || n < 1) return 1;
    return Math.min(n, Math.max(1, totalPages));
  }

  /**
   * Slice a list for the requested page.
   * @returns {{items, page, totalPages, total, from, to, perPage}}
   */
  RS.paginate = function (list, page, perPage) {
    var all = list || [];
    var size = Math.max(1, parseInt(perPage, 10) || 12);
    var totalPages = Math.max(1, Math.ceil(all.length / size));
    var current = clampPage(page, totalPages);
    var start = (current - 1) * size;

    return {
      items: all.slice(start, start + size),
      page: current,
      totalPages: totalPages,
      total: all.length,
      from: all.length ? start + 1 : 0,
      to: Math.min(start + size, all.length),
      perPage: size
    };
  };

  /**
   * Which page numbers to show. Always first and last, always a window around
   * the current page, with "…" standing in for the gaps — so 40 pages of
   * products never produce 40 buttons.
   */
  function pageNumbers(current, total, window_) {
    var span = window_ || 1;
    var pages = [];
    var last = 0;

    for (var i = 1; i <= total; i++) {
      var isEdge = i === 1 || i === total;
      var isNear = Math.abs(i - current) <= span;

      if (isEdge || isNear) {
        if (last && i - last > 1) pages.push("…");
        pages.push(i);
        last = i;
      }
    }

    return pages;
  }

  /**
   * Build the pagination control markup. Rendered as real <button>s inside a
   * <nav>, so it is keyboard reachable and announced correctly.
   */
  RS.paginationHtml = function (result, labels) {
    if (!result || result.totalPages <= 1) return "";

    var text = labels || {};
    var prevLabel = text.prev || "Previous";
    var nextLabel = text.next || "Next";

    function button(page, content, opts) {
      var o = opts || {};
      return '<button type="button" class="pageBtn' + (o.active ? " isActive" : "") + '"' +
        ' data-page="' + page + '"' +
        (o.disabled ? " disabled" : "") +
        (o.active ? ' aria-current="page"' : "") +
        (o.label ? ' aria-label="' + RS.escape(o.label) + '"' : "") +
        ">" + content + "</button>";
    }

    var parts = [
      button(result.page - 1, '<i class="bi bi-chevron-left" aria-hidden="true"></i>',
        { disabled: result.page === 1, label: prevLabel })
    ];

    pageNumbers(result.page, result.totalPages).forEach(function (entry) {
      if (entry === "…") {
        parts.push('<span class="pageGap" aria-hidden="true">…</span>');
      } else {
        parts.push(button(entry, entry, { active: entry === result.page, label: "Page " + entry }));
      }
    });

    parts.push(button(result.page + 1, '<i class="bi bi-chevron-right" aria-hidden="true"></i>',
      { disabled: result.page === result.totalPages, label: nextLabel }));

    return '<nav class="pagination" aria-label="' + RS.escape(text.aria || "Pagination") + '">' +
      parts.join("") + "</nav>";
  };

  /** "Showing 1–12 of 87 products" */
  RS.paginationSummary = function (result, noun) {
    if (!result || !result.total) return "";
    var word = noun || "results";
    return "Showing " + result.from + "–" + result.to + " of " + result.total + " " + word;
  };

  /**
   * Wire the control strip. The callback receives the requested page number.
   * Scrolls back to the top of the grid so page 2 does not start mid-list.
   */
  RS.bindPagination = function (selector, onPage, scrollTarget) {
    $(document).off("click.rsPage", selector + " .pageBtn")
      .on("click.rsPage", selector + " .pageBtn", function () {
        var page = parseInt($(this).attr("data-page"), 10);
        if (!isFinite(page)) return;

        onPage(page);

        var $anchor = $(scrollTarget || selector);
        if ($anchor.length) {
          window.scrollTo({
            top: $anchor.offset().top - 90,
            behavior: RS.scrollBehavior()
          });
        }
      });
  };

})(window, jQuery);
