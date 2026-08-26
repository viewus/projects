/* ---------------------------------------------------------------------------
 * storage.js — localStorage with a namespace and a safety net.
 *
 * Every write is wrapped: private browsing, a full quota and disabled storage
 * all throw on localStorage access, and none of them should take the page down.
 * When storage is unavailable we fall back to an in-memory store so the app
 * still behaves correctly for the current visit.
 *
 * The shopping checklist is the main consumer — it is the one piece of state
 * this otherwise-stateless static site keeps between visits.
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  var RS = window.RS || (window.RS = {});

  var PREFIX = "rs:";
  var memory = {};
  var available = (function () {
    try {
      var probe = PREFIX + "probe";
      window.localStorage.setItem(probe, "1");
      window.localStorage.removeItem(probe);
      return true;
    } catch (err) {
      console.warn("[storage] localStorage unavailable; falling back to memory for this visit.");
      return false;
    }
  })();

  /* ---------- primitives ----------------------------------------------------- */

  RS.store = {
    get: function (key, fallback) {
      var full = PREFIX + key;
      try {
        var raw = available ? window.localStorage.getItem(full) : memory[full];
        return raw == null ? fallback : JSON.parse(raw);
      } catch (err) {
        return fallback;
      }
    },

    set: function (key, value) {
      var full = PREFIX + key;
      try {
        var raw = JSON.stringify(value);
        if (available) window.localStorage.setItem(full, raw);
        else memory[full] = raw;
        return true;
      } catch (err) {
        console.warn("[storage] Could not save '" + key + "':", err && err.message);
        return false;
      }
    },

    remove: function (key) {
      var full = PREFIX + key;
      try {
        if (available) window.localStorage.removeItem(full);
        else delete memory[full];
      } catch (err) { /* nothing useful to do */ }
    }
  };

  /* ---------- shopping checklist --------------------------------------------- */

  var LIST_KEY = "checklist";

  /**
   * The checklist is an array of {id, name, qty, unit, category, checked}.
   * Items are keyed by id so adding the same product twice bumps quantity
   * instead of creating a duplicate line.
   */
  RS.checklist = {
    all: function () {
      var list = RS.store.get(LIST_KEY, []);
      return Array.isArray(list) ? list : [];
    },

    count: function () {
      return RS.checklist.all().length;
    },

    save: function (list) {
      RS.store.set(LIST_KEY, list);
      $(document).trigger("rs:checklistChanged", [list]);
      return list;
    },

    /** Add one item, or increase its quantity if already present. */
    add: function (item) {
      var list = RS.checklist.all();
      var id = item.id || RS.slugify(item.name);
      var existing = list.filter(function (row) { return row.id === id; })[0];

      if (existing) {
        existing.qty = (Number(existing.qty) || 1) + (Number(item.qty) || 1);
      } else {
        list.push({
          id: id,
          name: item.name,
          qty: Number(item.qty) || 1,
          unit: item.unit || "",
          category: item.category || "",
          checked: false
        });
      }

      return RS.checklist.save(list);
    },

    /** Add many at once — used by "add all ingredients" and the planner. */
    addMany: function (items) {
      (items || []).forEach(function (item) {
        var list = RS.checklist.all();
        var id = item.id || RS.slugify(item.name);
        var existing = list.filter(function (row) { return row.id === id; })[0];

        if (existing) {
          existing.qty = (Number(existing.qty) || 1) + (Number(item.qty) || 1);
          RS.store.set(LIST_KEY, list);
        } else {
          list.push({
            id: id,
            name: item.name,
            qty: Number(item.qty) || 1,
            unit: item.unit || "",
            category: item.category || "",
            checked: false
          });
          RS.store.set(LIST_KEY, list);
        }
      });

      var final = RS.checklist.all();
      $(document).trigger("rs:checklistChanged", [final]);
      return final;
    },

    remove: function (id) {
      return RS.checklist.save(RS.checklist.all().filter(function (row) {
        return row.id !== id;
      }));
    },

    toggle: function (id) {
      var list = RS.checklist.all();
      list.forEach(function (row) {
        if (row.id === id) row.checked = !row.checked;
      });
      return RS.checklist.save(list);
    },

    setQty: function (id, qty) {
      var list = RS.checklist.all();
      list.forEach(function (row) {
        if (row.id === id) row.qty = Math.max(1, Number(qty) || 1);
      });
      return RS.checklist.save(list);
    },

    clear: function () {
      return RS.checklist.save([]);
    },

    /** Plain-text export, used by both the share sheet and the download link. */
    toText: function (title) {
      var list = RS.checklist.all();
      var lines = [title || "Shopping List", ""];

      list.forEach(function (row) {
        lines.push((row.checked ? "[x] " : "[ ] ") + row.name +
          "  " + row.qty + (row.unit ? " " + row.unit : ""));
      });

      return lines.join("\n");
    }
  };

})(window, jQuery);
