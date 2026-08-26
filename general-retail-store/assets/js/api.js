/* ---------------------------------------------------------------------------
 * api.js — THE single place this template makes an outbound request from.
 *
 * No form file and nothing else should call $.ajax() directly for a submission.
 * Everything goes through RS.callApi(), so adding a new form means one entry in
 * config/apiEndpoints.json plus a small handler — the request logic is never
 * duplicated or edited again.
 *
 * The site is fully static, so there is no backend of our own. Endpoints are
 * expected to point at a form service (Formspree, Netlify Forms, Google Apps
 * Script, etc.) which is why they live in config rather than in code.
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  var RS = window.RS || (window.RS = {});

  var PLACEHOLDER = /TODO-replace-with-real-endpoint/;

  function endpoints() {
    return RS.json("config/apiEndpoints.json");
  }

  /**
   * Send a payload to the endpoint registered under `key`.
   *
   * @param {string} key     a key in config/apiEndpoints.json, e.g. "contactForm"
   * @param {object} payload JSON-serialisable body
   * @returns {Promise<object>} parsed response, or {} when the service sends none
   */
  RS.callApi = function (key, payload) {
    return endpoints().then(function (all) {
      var endpoint = all && all[key];

      if (!endpoint) {
        return $.Deferred().reject(new Error(
          "Unknown API endpoint '" + key + "' — add it to config/apiEndpoints.json"
        )).promise();
      }

      if (PLACEHOLDER.test(endpoint.url)) {
        // The template ships without a real service wired up. Say so loudly in
        // the console, then resolve as if it worked so the success path stays
        // demonstrable — a client sees the finished UX before they buy a form
        // service, and finds one clear instruction when they are ready.
        console.warn(
          "[api] '" + key + "' still points at the placeholder endpoint.\n" +
          "Set a real URL in config/apiEndpoints.json — no code change needed.\n" +
          "Submitted payload was:", payload
        );
        return $.Deferred().resolve({ ok: true, simulated: true }).promise();
      }

      return $.ajax({
        url: endpoint.url,
        method: endpoint.method || "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(payload)
      }).then(null, function (xhr) {
        return $.Deferred().reject(
          new Error("Request failed (HTTP " + (xhr && xhr.status) + ")")
        ).promise();
      });
    });
  };

  /**
   * Standard submit flow shared by every form: disable the button, show a
   * pending label, call the API, then toast success or failure and reset.
   *
   * @param {object} opts {form, endpoint, payload, button, labels, onSuccess}
   */
  RS.submitForm = function (opts) {
    var $form = $(opts.form);
    var $button = $(opts.button || $form.find("[type=submit]"));
    var original = $button.text();
    var labels = opts.labels || {};

    $button.prop("disabled", true).text(labels.sending || "Sending…");

    return RS.callApi(opts.endpoint, opts.payload)
      .then(function (res) {
        RS.toast(labels.success || "Thanks — we'll be in touch shortly.", "success");
        $form[0].reset();
        $form.find(".isInvalid").removeClass("isInvalid");
        if (opts.onSuccess) opts.onSuccess(res);
      }, function (err) {
        console.error("[api] Submission failed:", err);
        RS.toast(labels.error || "Something went wrong. Please try again, or call us.", "error");
      })
      .always(function () {
        $button.prop("disabled", false).text(original);
      });
  };

})(window, jQuery);
