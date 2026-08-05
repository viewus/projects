/* ---------------------------------------------------------------------------
 * apiService.js — THE single place this site makes an outbound request from.
 *
 * No form file, and nothing else in the codebase, should call fetch() or
 * $.ajax() directly for a submission. Everything goes through callApi(), so
 * adding a new form means one entry in config/apiEndpoints.json plus a small
 * form file — the request logic is never duplicated or edited again.
 * ------------------------------------------------------------------------- */
(function (window) {
  "use strict";

  var endpointsPromise = null;

  function loadEndpoints() {
    if (!endpointsPromise) {
      // pjPath() keeps this correct from every page depth.
      endpointsPromise = fetch(pjPath("config/apiEndpoints.json")).then(function (res) {
        if (!res.ok) throw new Error("Could not load apiEndpoints.json (HTTP " + res.status + ")");
        return res.json();
      });
    }
    return endpointsPromise;
  }

  /**
   * Send `payload` to the endpoint registered under `endpointKey`.
   * @param {string} endpointKey key in config/apiEndpoints.json, e.g. "contactForm"
   * @param {object} payload     JSON-serialisable body
   * @returns {Promise<object>}  parsed response (or {} when the server sends no JSON)
   */
  function callApi(endpointKey, payload) {
    return loadEndpoints().then(function (endpoints) {
      var endpoint = endpoints[endpointKey];
      if (!endpoint) {
        throw new Error("Unknown API endpoint: " + endpointKey +
          " — add it to config/apiEndpoints.json");
      }

      if (/TODO-replace-with-real-endpoint/.test(endpoint.url)) {
        console.warn("[apiService] '" + endpointKey + "' still points at the placeholder " +
          "endpoint. Set a real URL in config/apiEndpoints.json — no code change needed. " +
          "See learn/05-forms-and-api.md.");
      }

      return fetch(endpoint.url, {
        method: endpoint.method || "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }).then(function (res) {
      if (!res.ok) throw new Error("API error " + res.status);
      return res.json().catch(function () { return {}; });
    });
  }

  window.callApi = callApi;

})(window);
