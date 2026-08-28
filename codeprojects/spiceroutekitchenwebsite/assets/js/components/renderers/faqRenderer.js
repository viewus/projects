/* ============================================================
   faqRenderer.js — reusable FAQAccordion component.
   ============================================================ */

function renderFaqItem(item, index) {
  const qid = "faqQ" + index;
  const aid = "faqA" + index;
  return (
    '<div class="faqItem" data-reveal>' +
      '<h3>' +
        '<button type="button" class="faqQuestion" id="' + qid + '" aria-expanded="false" aria-controls="' + aid + '">' +
          '<span>' + escapeHtml(item.question) + "</span>" +
          '<i class="fa-solid fa-plus" aria-hidden="true"></i>' +
        "</button>" +
      "</h3>" +
      '<div class="faqAnswerWrap" id="' + aid + '" role="region" aria-labelledby="' + qid + '">' +
        '<p class="faqAnswer">' + escapeHtml(item.answer) + "</p>" +
      "</div>" +
    "</div>"
  );
}

function renderFaq(list) {
  return (list || []).map(renderFaqItem).join("");
}

/** Wire up expand/collapse behaviour for a rendered FAQ accordion. */
function initFaqAccordion() {
  $("#faqAccordion").on("click", ".faqQuestion", function () {
    const $btn = $(this);
    const $item = $btn.closest(".faqItem");
    const $wrap = $item.find(".faqAnswerWrap");
    const isOpen = $item.hasClass("open");

    // Close any other open item for a clean accordion feel.
    $("#faqAccordion .faqItem.open").not($item).each(function () {
      $(this).removeClass("open");
      $(this).find(".faqAnswerWrap").css("max-height", "");
      $(this).find(".faqQuestion").attr("aria-expanded", "false");
    });

    if (isOpen) {
      $item.removeClass("open");
      $wrap.css("max-height", "");
      $btn.attr("aria-expanded", "false");
    } else {
      $item.addClass("open");
      $wrap.css("max-height", $wrap.prop("scrollHeight") + "px");
      $btn.attr("aria-expanded", "true");
    }
  });
}
