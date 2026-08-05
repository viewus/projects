/* ---------------------------------------------------------------------------
 * faqRenderer.js — grouped Bootstrap accordion, plus the FAQPage JSON-LD.
 *
 * Answers flagged todo:true in data/faq.json render an amber chip so an
 * unfinished policy answer cannot quietly ship as if it were final.
 * ------------------------------------------------------------------------- */
(function (window) {
  "use strict";

  function renderGroup(group, groupIndex) {
    var groupId = "faqGroup" + groupIndex;

    var itemsHtml = group.items.map(function (item, itemIndex) {
      var id = groupId + "Item" + itemIndex;
      var todoChip = item.todo
        ? '<span class="faqTodoChip" title="' + pjEscape(item.todoNote || "") +
          '">Needs confirmation</span>'
        : "";

      return '' +
        '<div class="accordion-item faqItem">' +
          '<h3 class="accordion-header faqQuestionHeader" id="' + id + 'Header">' +
            '<button class="accordion-button collapsed faqQuestion" type="button"' +
              ' data-bs-toggle="collapse" data-bs-target="#' + id + 'Body"' +
              ' aria-expanded="false" aria-controls="' + id + 'Body">' +
              pjEscape(item.q) + todoChip +
            "</button>" +
          "</h3>" +
          '<div id="' + id + 'Body" class="accordion-collapse collapse"' +
            ' aria-labelledby="' + id + 'Header" data-bs-parent="#' + groupId + '">' +
            '<div class="accordion-body faqAnswer">' +
              "<p>" + pjEscape(item.a) + "</p>" +
            "</div>" +
          "</div>" +
        "</div>";
    }).join("");

    return '' +
      '<section class="faqGroup">' +
        '<h2 class="faqGroupTitle">' + pjEscape(group.groupTitle) + "</h2>" +
        '<div class="accordion faqAccordion" id="' + groupId + '">' + itemsHtml + "</div>" +
      "</section>";
  }

  function renderFaqGroups(faq) {
    return (faq.groups || []).map(renderGroup).join("");
  }

  /**
   * FAQPage structured data. Unlike review markup this is safe and useful —
   * the questions and answers on the page are genuinely the business's own.
   * Injected as a <script type="application/ld+json"> so it stays in sync with
   * the JSON rather than being hand-maintained in HTML.
   */
  function injectFaqSchema(faq) {
    var entities = [];
    (faq.groups || []).forEach(function (group) {
      group.items.forEach(function (item) {
        entities.push({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a }
        });
      });
    });

    var schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: entities
    };

    var el = document.createElement("script");
    el.type = "application/ld+json";
    el.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(el);
  }

  window.renderFaqGroups = renderFaqGroups;
  window.injectFaqSchema = injectFaqSchema;

})(window);
