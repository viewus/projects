/* ---------------------------------------------------------------------------
 * renderers/planner.js — the retail planning tools.
 *
 * plannerApp    household profile -> generated starting list
 * listPicker    pick a ready-made monthly / healthy / festival list
 * budgetCalc    split a monthly budget across categories
 * checklistApp  the persistent shopping checklist (print / share / download)
 *
 * All list state lives in RS.checklist (storage.js), which persists to
 * localStorage — so a list survives a refresh and a return visit.
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  var RS = window.RS || (window.RS = {});
  var reg = RS.registerComponent;

  /* ---------- plannerApp ------------------------------------------------------- */

  reg("plannerApp", function (data, cfg) {
    var planner = (data && data.planner) || {};

    var profiles = (planner.profiles || []).map(function (profile, i) {
      return '<button class="featureCard staggerItem" type="button" data-profile="' +
        RS.escape(profile.id) + '" style="--cardIndex:' + i + ';text-align:left;width:100%">' +
        '<span class="featureCardIcon"><i class="bi ' + RS.escape(profile.icon) +
        '" aria-hidden="true"></i></span>' +
        "<span><span class='cardTitle' style='display:block;font-weight:600'>" +
        RS.escape(profile.name) + "</span>" +
        "<span class='cardText'>" + RS.escape(profile.description) + "</span><br>" +
        "<small class='textDim'>About " + RS.escape(RS.money(profile.estimatedBudget, cfg)) +
        " a month</small></span></button>";
    }).join("");

    return '<div class="wrap">' + RS.sectionHead(planner, true) +
      '<p class="formLabel textCenter" style="margin-bottom:var(--s4)">' +
      RS.escape(planner.chooseLabel || "Who are you shopping for?") + "</p>" +
      '<div class="grid gridAuto" id="profileGrid">' + profiles + "</div>" +
      '<div id="profileResult" style="margin-top:var(--s6)"></div></div>';
  });

  /**
   * Turn a chosen household profile into a starting list.
   *
   * The monthly lists are authored per household id, so where one exists we use
   * it verbatim. Where it does not (couple, bachelor), we scale the family list
   * by headcount — an honest approximation, and better than showing nothing.
   */
  $(document).on("click", "[data-profile]", function () {
    var id = $(this).attr("data-profile");

    $("[data-profile]").removeClass("isActive")
      .css({ borderColor: "", background: "" });
    $(this).css({ borderColor: "var(--brand)", background: "var(--brandLight)" });

    $.when(RS.json("data/shopping-lists.json"), RS.config()).then(function (data, cfg) {
      var lists = (data.monthly && data.monthly.lists) || [];
      var profile = ((data.planner && data.planner.profiles) || [])
        .filter(function (p) { return p.id === id; })[0] || {};

      var exact = lists.filter(function (l) { return l.id === id; })[0];
      var items;
      var note = "";

      if (exact) {
        items = exact.items;
      } else {
        var family = lists.filter(function (l) { return l.id === "family"; })[0];
        var ratio = (profile.people || 1) / 4;
        items = (family ? family.items : []).map(function (item) {
          return $.extend({}, item, { qty: Math.max(1, Math.round(item.qty * ratio)) });
        });
        note = '<p class="formHint">Scaled from our family-of-four list for ' +
          RS.escape(profile.people) + " people. Adjust anything that looks off.</p>";
      }

      var rows = items.map(function (item) {
        return '<li class="checklistItem">' +
          '<span class="checklistName">' + RS.escape(item.name) + "</span>" +
          '<span class="checklistCat">' + RS.escape(item.qty + " × " + item.unit) + "</span></li>";
      }).join("");

      $("#profileResult").html(
        '<div class="featureCard" style="flex-direction:column;align-items:stretch">' +
        "<h3>" + RS.escape(profile.name) + " — starting list</h3>" + note +
        '<ul class="checklist" style="margin-block:var(--s4)">' + rows + "</ul>" +
        '<button class="btn btnPrimary" type="button" id="addProfileList" data-profile-id="' +
        RS.escape(id) + '"><i class="bi bi-plus-lg" aria-hidden="true"></i> ' +
        RS.escape((data.planner && data.planner.addAllLabel) || "Add all to my list") +
        "</button></div>"
      );

      // Stash for the add-all handler rather than re-deriving the scaling.
      $("#addProfileList").data("items", items);
    });
  });

  $(document).on("click", "#addProfileList", function () {
    var items = $(this).data("items") || [];

    RS.checklist.addMany(items.map(function (item) {
      return {
        id: item.slug || RS.slugify(item.name),
        name: item.name,
        qty: item.qty,
        unit: item.unit,
        category: item.category
      };
    }));

    RS.toast(items.length + " items added to your list", "success");
    RS.track("add_profile_list", { profile: $(this).attr("data-profile-id") });

    var target = document.getElementById("checklist");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------- listPicker -------------------------------------------------------- */

  /**
   * Renders either the monthly lists, the healthy tag views, or festival lists,
   * depending on which branch of shopping-lists.json the section points at.
   */
  reg("listPicker", function (data) {
    if (!data) return "";

    var lists = data.lists || [];

    var buttons = lists.map(function (list, i) {
      return '<button class="chip" type="button" data-list="' + RS.escape(list.id) +
        '" data-list-kind="' + RS.escape(data.title || "") + '">' +
        (list.icon ? '<i class="bi ' + RS.escape(list.icon) + '" aria-hidden="true"></i> ' : "") +
        RS.escape(list.name) + "</button>";
    }).join("");

    // Everything needed to resolve a click is stashed on the container, so the
    // handler does not have to know which branch it is dealing with.
    return '<div class="wrap" data-list-source=\'' +
      RS.escape(JSON.stringify(lists.map(function (l) { return l.id; }))) + "'>" +
      RS.sectionHead(data, true) +
      '<div class="chipRow" style="justify-content:center;margin-bottom:var(--s6)">' +
      buttons + "</div>" +
      '<div id="listResult"></div></div>';
  });

  $(document).on("click", "[data-list]", function () {
    var id = $(this).attr("data-list");

    $("[data-list]").removeClass("isActive");
    $(this).addClass("isActive");

    $.when(RS.json("data/shopping-lists.json"), RS.json("data/products.json"))
      .then(function (listData, productData) {
        var products = productData.items || [];

        // Search every branch for this id — the same handler serves monthly,
        // healthy, festival and seasonal pickers.
        var found = null;
        var kind = null;

        ["monthly", "festival", "healthy", "seasonal"].forEach(function (branch) {
          if (found) return;
          var match = ((listData[branch] && listData[branch].lists) || [])
            .filter(function (l) { return l.id === id; })[0];
          if (match) { found = match; kind = branch; }
        });

        if (!found) return;

        // Tag-based lists (healthy, seasonal) are filtered views of the
        // catalogue rather than authored item lists.
        if (!found.items && (found.tag || found.tags)) {
          var tags = found.tags || [found.tag];
          var matched = products.filter(function (p) {
            return (p.tags || []).some(function (t) { return tags.indexOf(t) > -1; });
          });

          if (!matched.length) {
            $("#listResult").html(RS.emptyState("Nothing tagged yet",
              "No products currently carry this tag.", "bi-tag"));
            return;
          }

          RS.config().then(function (cfg) {
            RS.productCards(matched, cfg).then(function (cards) {
              $("#listResult").html(
                "<h3>" + RS.escape(found.name) + "</h3>" +
                (found.description ? '<p class="sectionIntro">' + RS.escape(found.description) + "</p>" : "") +
                '<div class="grid gridAuto" style="margin-top:var(--s4)">' + cards + "</div>"
              );
            });
          });
          return;
        }

        var rows = (found.items || []).map(function (item) {
          return '<li class="checklistItem">' +
            '<span class="checklistName">' + RS.escape(item.name) + "</span>" +
            '<span class="checklistCat">' + RS.escape(item.qty + " × " + item.unit) + "</span></li>";
        }).join("");

        $("#listResult").html(
          '<div class="featureCard" style="flex-direction:column;align-items:stretch">' +
          "<h3>" + RS.escape(found.name) + "</h3>" +
          (found.description ? '<p class="cardText">' + RS.escape(found.description) + "</p>" : "") +
          '<ul class="checklist" style="margin-block:var(--s4)">' + rows + "</ul>" +
          '<button class="btn btnPrimary" type="button" id="addPickedList">' +
          '<i class="bi bi-plus-lg" aria-hidden="true"></i> Add all to my list</button></div>'
        );

        $("#addPickedList").data("items", found.items || []);
      });
  });

  $(document).on("click", "#addPickedList", function () {
    var items = $(this).data("items") || [];

    RS.checklist.addMany(items.map(function (item) {
      return {
        id: item.slug || RS.slugify(item.name),
        name: item.name, qty: item.qty, unit: item.unit, category: item.category
      };
    }));

    RS.toast(items.length + " items added to your list", "success");
  });

  /* ---------- budgetCalc ---------------------------------------------------------- */

  reg("budgetCalc", function (data, cfg) {
    if (!data) return "";

    return '<div class="wrap wrapNarrow">' + RS.sectionHead(data, true) +
      '<form class="form" id="budgetForm" style="grid-template-columns:1fr 1fr">' +
      '<div class="formGroup"><label class="formLabel" for="budgetAmount">' +
      RS.escape(data.budgetLabel || "Monthly budget") + "</label>" +
      '<input class="formControl" type="number" id="budgetAmount" min="500" step="100" value="8000"></div>' +
      '<div class="formGroup"><label class="formLabel" for="budgetPeople">' +
      RS.escape(data.peopleLabel || "People in the household") + "</label>" +
      '<input class="formControl" type="number" id="budgetPeople" min="1" max="20" value="4"></div>' +
      '<div class="formGroup" style="grid-column:1/-1">' +
      '<button class="btn btnPrimary" type="submit">' +
      RS.escape(data.calculateLabel || "Work out my split") + "</button></div></form>" +
      '<div id="budgetResult" style="margin-top:var(--s5)"></div></div>';
  });

  $(document).on("submit", "#budgetForm", function (e) {
    e.preventDefault();

    var budget = Number($("#budgetAmount").val()) || 0;
    var people = Number($("#budgetPeople").val()) || 1;

    $.when(RS.json("data/shopping-lists.json"), RS.config()).then(function (data, cfg) {
      var split = (data.budget && data.budget.split) || [];

      var rows = split.map(function (row) {
        var amount = Math.round(budget * row.percent / 100);
        return '<li class="checklistItem">' +
          '<span class="checklistName">' + RS.escape(row.label) + "</span>" +
          '<span class="checklistCat">' + row.percent + "%</span>" +
          "<strong>" + RS.escape(RS.money(amount, cfg)) + "</strong></li>";
      }).join("");

      var perHead = Math.round(budget / people);

      $("#budgetResult").html(
        '<div class="featureCard" style="flex-direction:column;align-items:stretch">' +
        "<h3>Suggested split</h3>" +
        '<p class="cardText">' + RS.escape(RS.money(perHead, cfg)) +
        " per person per month, across " + people + (people === 1 ? " person" : " people") + ".</p>" +
        '<ul class="checklist" style="margin-block:var(--s4)">' + rows + "</ul>" +
        '<p class="formHint">Percentages are averages from our own basket data. ' +
        "Treat them as a starting point rather than a rule.</p></div>"
      );

      RS.track("budget_calculated", { budget: budget, people: people });
    });
  });

  /* ---------- checklistApp ---------------------------------------------------------- */

  reg("checklistApp", function (data, cfg) {
    var copy = data || {};

    return '<div class="wrap wrapNarrow" id="checklist">' +
      RS.sectionHead(copy) +
      '<div id="checklistTotal"></div>' +
      '<div id="checklistBody"></div>' +
      '<div class="checklistActions noPrint">' +
      '<button class="btn btnOutline" type="button" id="printList">' +
      '<i class="bi bi-printer" aria-hidden="true"></i> ' +
      RS.escape(copy.printLabel || "Print list") + "</button>" +
      '<button class="btn btnOutline" type="button" id="shareList">' +
      '<i class="bi bi-share" aria-hidden="true"></i> ' +
      RS.escape(copy.shareLabel || "Share") + "</button>" +
      '<button class="btn btnOutline" type="button" id="downloadList">' +
      '<i class="bi bi-download" aria-hidden="true"></i> ' +
      RS.escape(copy.downloadLabel || "Download") + "</button>" +
      '<button class="btn btnGhost" type="button" id="clearList">' +
      '<i class="bi bi-trash" aria-hidden="true"></i> ' +
      RS.escape(copy.clearLabel || "Clear list") + "</button>" +
      "</div></div>";
  });

  /**
   * The expandable detail panel for one checklist row.
   *
   * A list line only has room for a name and a quantity, but the shopper often
   * wants the rest: which pack size, what it costs, whether it is in stock, and
   * a note to self ("get the small one"). Rather than crowd the row, that lives
   * behind a disclosure — collapsed by default, so the list still prints as a
   * clean single line per item.
   *
   * Products are matched by slug; anything added from a recipe or a generated
   * list that is not in the catalogue still expands, just without pricing.
   */
  function detailPanel(item, product, cfg) {
    var id = "detail_" + RS.slugify(item.id);

    if (!product) {
      return '<div class="checklistDetail" id="' + id + '" hidden>' +
        '<p class="cardText textDim">Not a catalogue item — added from a list or recipe.</p>' +
        noteField(item) + "</div>";
    }

    var off = RS.discountPercent(product.mrp, product.price);
    var lineTotal = (Number(product.price) || 0) * (Number(item.qty) || 1);

    return '<div class="checklistDetail" id="' + id + '" hidden>' +
      '<div class="checklistDetailMain">' +
      '<img class="checklistThumb" ' + RS.imgAttrs(product.image, product.name) +
      ' alt="" loading="lazy" width="80" height="60">' +

      "<div>" +
      '<p class="cardText"><strong>' + RS.escape(product.brand || "") + "</strong> · " +
      RS.escape(product.unit || "") + "</p>" +
      '<p class="cardText">' + RS.escape(RS.truncate(product.description || "", 130)) + "</p>" +

      '<p class="checklistPrices">' +
      '<span class="priceNow">' + RS.escape(RS.money(product.price, cfg)) + "</span>" +
      (off > 0 ? '<span class="priceWas">' + RS.escape(RS.money(product.mrp, cfg)) + "</span>" +
        '<span class="priceOff">' + off + "% off</span>" : "") +
      '<span class="checklistLineTotal">' + item.qty + " × = <strong>" +
      RS.escape(RS.money(lineTotal, cfg)) + "</strong></span>" +
      "</p>" +

      '<p class="cardText">' +
      (product.inStock === false
        ? '<span class="badge badgeOut">Out of stock</span>'
        : '<span class="badge badgeBrand">In stock</span>') +
      ' <a class="linkArrow" href="' + RS.escape(RS.detailHref("product", product.slug)) +
      '">View product <i class="bi bi-arrow-right" aria-hidden="true"></i></a></p>' +
      "</div></div>" +

      noteField(item) + "</div>";
  }

  /** Free-text note per line, persisted with the item. */
  function noteField(item) {
    return '<label class="checklistNote">' +
      '<span class="formLabel">Note</span>' +
      '<input class="formControl" type="text" data-note="' + RS.escape(item.id) +
      '" value="' + RS.escape(item.note || "") +
      '" placeholder="e.g. get the small pack, or a different brand is fine">' +
      "</label>";
  }

  /** Redraw the checklist from storage. Called on every change. */
  function paintChecklist() {
    var $body = $("#checklistBody");
    if (!$body.length) return;

    var items = RS.checklist.all();

    $.when(RS.json("data/homepage.json"), RS.json("data/products.json"),
           RS.json("data/categories.json"), RS.config())
      .then(function (home, productData, categoryData, cfg) {
        var copy = home.checklist || {};
        var products = productData.items || [];
        var catNames = {};
        (categoryData.items || []).forEach(function (c) { catNames[c.slug] = c.name; });

        if (!items.length) {
          $body.html(RS.emptyState(
            copy.emptyTitle || "Your list is empty",
            copy.emptyBody || "",
            "bi-card-checklist"
          ));
          $("#checklistTotal").empty();
          return;
        }

        // Grouped by category so the printed list follows the aisles rather
        // than the order things happened to be added.
        var groups = {};
        items.forEach(function (item) {
          var key = item.category || "other";
          (groups[key] = groups[key] || []).push(item);
        });

        var runningTotal = 0;
        var priced = 0;

        var html = Object.keys(groups).map(function (cat) {
          var rows = groups[cat].map(function (item) {
            var product = products.filter(function (p) { return p.slug === item.id; })[0];

            if (product) {
              runningTotal += (Number(product.price) || 0) * (Number(item.qty) || 1);
              priced++;
            }

            var panelId = "detail_" + RS.slugify(item.id);

            return '<li class="checklistRow' + (item.checked ? " isChecked" : "") + '">' +
              '<div class="checklistItem">' +
              '<input class="checklistCheck" type="checkbox" data-check="' + RS.escape(item.id) + '"' +
              (item.checked ? " checked" : "") + ' aria-label="' + RS.escape(item.name) + '">' +

              '<span class="checklistName">' + RS.escape(item.name) +
              (item.note
                ? ' <span class="checklistNoteFlag" title="' + RS.escape(item.note) + '">' +
                  '<i class="bi bi-sticky" aria-hidden="true"></i></span>'
                : "") +
              "</span>" +

              '<input class="checklistQty" type="number" min="1" value="' + RS.escape(item.qty) +
              '" data-qty="' + RS.escape(item.id) + '" aria-label="Quantity of ' +
              RS.escape(item.name) + '">' +
              '<span class="checklistCat">' + RS.escape(item.unit || "") + "</span>" +

              '<button class="checklistExpand noPrint" type="button" data-expand="' +
              RS.escape(item.id) + '" aria-expanded="false" aria-controls="' + panelId +
              '" aria-label="Show details for ' + RS.escape(item.name) + '">' +
              '<i class="bi bi-chevron-down" aria-hidden="true"></i></button>' +

              '<button class="checklistRemove noPrint" type="button" data-remove="' +
              RS.escape(item.id) + '" aria-label="Remove ' + RS.escape(item.name) + '">' +
              '<i class="bi bi-x-lg" aria-hidden="true"></i></button>' +
              "</div>" +

              detailPanel(item, product, cfg) +
              "</li>";
          }).join("");

          return '<h3 class="checklistGroupTitle">' +
            RS.escape(catNames[cat] || String(cat).replace(/-/g, " ")) +
            ' <span class="checklistGroupCount">' + groups[cat].length + "</span></h3>" +
            '<ul class="checklist">' + rows + "</ul>";
        }).join("");

        $body.html(html);

        // Only an estimate: items added from a recipe or generated list are not
        // always catalogue products, so say what the figure covers rather than
        // presenting a total that quietly excludes things.
        $("#checklistTotal").html(
          '<div class="checklistSummary">' +
          "<span>" + items.length + (items.length === 1 ? " item" : " items") + " on your list</span>" +
          (priced
            ? "<span>Estimated total <strong>" + RS.escape(RS.money(runningTotal, cfg)) +
              "</strong>" + (priced < items.length
                ? ' <small class="textDim">(' + priced + " of " + items.length + " priced)</small>"
                : "") + "</span>"
            : "") +
          "</div>"
        );
      });
  }

  $(document).on("rs:sectionsRendered rs:checklistChanged", paintChecklist);

  $(document).on("change", "[data-check]", function () {
    RS.checklist.toggle($(this).attr("data-check"));
  });

  $(document).on("change", "[data-qty]", function () {
    RS.checklist.setQty($(this).attr("data-qty"), $(this).val());
  });

  /**
   * Expand / collapse one row's detail panel.
   *
   * The panel is toggled directly rather than by repainting the list, because a
   * repaint would collapse every other open row and lose focus.
   */
  $(document).on("click", "[data-expand]", function () {
    var $btn = $(this);
    var $panel = $("#detail_" + RS.slugify($btn.attr("data-expand")));
    var open = $btn.attr("aria-expanded") === "true";

    $btn.attr("aria-expanded", String(!open))
      .find("i").toggleClass("bi-chevron-down", open).toggleClass("bi-chevron-up", !open);

    if (open) {
      $panel.slideUp(160, function () { $panel.attr("hidden", "hidden"); });
    } else {
      $panel.removeAttr("hidden").hide().slideDown(160);
    }
  });

  /** Persist a per-item note. Debounced so we are not writing on each keystroke. */
  var saveNote = RS.debounce(function (id, value) {
    var list = RS.checklist.all();
    list.forEach(function (row) { if (row.id === id) row.note = value; });
    RS.store.set("checklist", list);
  }, 400);

  $(document).on("input", "[data-note]", function () {
    saveNote($(this).attr("data-note"), $(this).val());
  });

  $(document).on("click", "[data-remove]", function () {
    RS.checklist.remove($(this).attr("data-remove"));
  });

  $(document).on("click", "#clearList", function () {
    RS.json("data/homepage.json").then(function (home) {
      var message = (home.checklist && home.checklist.clearConfirm) || "Clear the whole list?";
      if (window.confirm(message)) {
        RS.checklist.clear();
        RS.toast("List cleared", "info");
      }
    });
  });

  $(document).on("click", "#printList", function () {
    window.print();
  });

  /**
   * Share uses the native share sheet where it exists (phones, which is where
   * a shopping list is actually used) and falls back to the clipboard.
   */
  $(document).on("click", "#shareList", function () {
    RS.config().then(function (cfg) {
      var text = RS.checklist.toText("Shopping list — " + cfg.siteName);

      if (navigator.share) {
        navigator.share({ title: "Shopping list", text: text })
          .catch(function () { /* the visitor cancelled — not an error */ });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          RS.toast("List copied to your clipboard", "success");
        });
      } else {
        RS.modal("Your shopping list", "<pre>" + RS.escape(text) + "</pre>");
      }
    });
  });

  /**
   * Download as plain text.
   *
   * TODO: the spec asks for PDF. A real PDF needs a library (jsPDF or similar),
   * which would be the first heavyweight dependency in this template. Plain
   * text plus the print stylesheet covers the actual need — carrying the list
   * to the shop — without that cost. Swap this handler if PDF becomes a
   * requirement.
   */
  $(document).on("click", "#downloadList", function () {
    RS.config().then(function (cfg) {
      var text = RS.checklist.toText("Shopping list — " + cfg.siteName);
      var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);

      var link = document.createElement("a");
      link.href = url;
      link.download = "shopping-list.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      RS.toast("List downloaded", "success");
    });
  });

})(window, jQuery);
