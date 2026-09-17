/**
 * VintageSoulTheme - Cookie Consent & Preferences Management
 *
 * Rules:
 * - Reject -> Persists indefinitely. The banner does NOT reappear on its own
 *   after any fixed time - the only way to have it re-ask is an admin
 *   bumping the consent version (Theme Settings -> Cache & Cookies ->
 *   "Re-ask Cookie Consent for All"), which every visitor's stored decision
 *   is checked against below.
 * - Accept / Save (with anything granted) -> Re-asks after 30 Days
 *   (30 * 24 * 60 * 60 * 1000 ms), same as before.
 */
(function () {
  'use strict';

  var STORAGE_KEY_STATUS = 'vst_cookie_consent_status';
  var STORAGE_KEY_PREFS = 'vst_cookie_consent_prefs';
  var STORAGE_KEY_EXPIRY = 'vst_cookie_consent_expiry';
  var STORAGE_KEY_VERSION = 'vst_cookie_consent_version';

  var THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  // Used for "reject" so it persists until an admin explicitly re-asks
  // (via the version bump above) rather than expiring on its own. Not
  // Infinity - that stringifies to "Infinity", which parseInt() can't
  // read back - 100 years is effectively permanent for this purpose.
  var PERSISTENT_MS = 100 * 365 * 24 * 60 * 60 * 1000;

  function getStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      if (window.console) console.warn('[vst-cookie-consent] localStorage read blocked - consent can\'t persist:', e);
      return null;
    }
  }

  function setStorage(key, val) {
    try {
      localStorage.setItem(key, val);
    } catch (e) {
      if (window.console) console.warn('[vst-cookie-consent] localStorage write blocked - consent can\'t persist:', e);
    }
  }

  function getPrefs() {
    try {
      return JSON.parse(getStorage(STORAGE_KEY_PREFS) || '{}');
    } catch (e) {
      return {};
    }
  }

  // Expose consent state to anything else on the page (in particular the CMS
  // Plugin's google-services.js, which gates GTM/Ads/AdSense/etc. behind
  // window.adnCookieConsent). Defined at top level - not inside
  // initCookieConsent() below - so it works immediately on script load and on
  // any page, even one where the banner markup isn't present.
  var categoryListeners = { analytics: [], advertising: [] };

  function notifyCategoryChange(category, granted) {
    var listeners = categoryListeners[category] || [];
    for (var i = 0; i < listeners.length; i++) {
      try {
        listeners[i](granted);
      } catch (e) {}
    }
  }

  window.adnCookieConsent = window.adnCookieConsent || {
    /** True for 'necessary' always; for 'analytics'/'advertising', whatever this visitor last chose (false if they haven't decided yet). */
    getCategory: function (category) {
      if ('necessary' === category) return true;
      return !!getPrefs()[category];
    },
    /** Calls back with the new granted/denied state whenever that category's consent changes (accept/reject/save preferences). */
    onCategoryChange: function (category, callback) {
      if (typeof callback !== 'function') return;
      if (!categoryListeners[category]) categoryListeners[category] = [];
      categoryListeners[category].push(callback);
    }
  };

  function initCookieConsent() {
    var banner = document.getElementById('vst-cookie-banner');
    var modal = document.getElementById('vst-cookie-modal');
    if (!banner || !modal) return;

    var btnOpenPrefs = document.getElementById('vst-cookie-open-prefs');
    var btnBannerReject = document.getElementById('vst-cookie-banner-reject');
    var btnBannerAccept = document.getElementById('vst-cookie-banner-accept');

    var btnModalClose = document.getElementById('vst-cookie-modal-close');
    var btnModalBackdrop = document.getElementById('vst-cookie-modal-backdrop');
    var btnModalReject = document.getElementById('vst-cookie-modal-reject');
    var btnModalSave = document.getElementById('vst-cookie-modal-save');
    var btnModalAccept = document.getElementById('vst-cookie-modal-accept');

    var toggleAnalytics = document.getElementById('vst-cookie-toggle-analytics');
    var toggleAdvertising = document.getElementById('vst-cookie-toggle-advertising');

    // 1. If an admin bumped the consent version (Theme Settings -> re-ask
    // cookie consent), forget this visitor's stored decision so they're
    // asked again, same as if they'd never decided.
    //
    // Both sides MUST be parsed to numbers. wp_localize_script() casts every
    // scalar it passes to a string, so window.vstCookieConsent.version arrives
    // as "1", not 1. Comparing that to the parsed stored value with !== was
    // always true, which wiped the saved decision on every single page load -
    // the banner came back even right after someone pressed Reject.
    var currentVersion = parseInt((window.vstCookieConsent && window.vstCookieConsent.version) || 1, 10);
    if (isNaN(currentVersion)) { currentVersion = 1; }
    var storedVersion = parseInt(getStorage(STORAGE_KEY_VERSION) || '0', 10);
    if (isNaN(storedVersion)) { storedVersion = 0; }
    if (storedVersion !== currentVersion) {
      setStorage(STORAGE_KEY_EXPIRY, '0');
      setStorage(STORAGE_KEY_VERSION, String(currentVersion));
    }

    // 2. Check current consent state and expiry
    var expiry = parseInt(getStorage(STORAGE_KEY_EXPIRY) || '0', 10);
    var now = Date.now();

    if (!expiry || now > expiry) {
      // Expiry reached or no decision made yet -> Show banner after subtle delay
      setTimeout(function () {
        banner.classList.remove('is-hidden');
        banner.classList.add('is-visible');
      }, 700);
    }

    // Load saved preferences if any
    var savedPrefs = getPrefs();
    if (toggleAnalytics) toggleAnalytics.checked = !!savedPrefs.analytics;
    if (toggleAdvertising) toggleAdvertising.checked = !!savedPrefs.advertising;

    // Modal open/close handlers
    function openModal() {
      modal.classList.remove('is-hidden');
      modal.classList.add('is-visible');
      document.body.classList.add('cookie-modal-open');
    }

    function closeModal() {
      modal.classList.remove('is-visible');
      setTimeout(function () {
        modal.classList.add('is-hidden');
        document.body.classList.remove('cookie-modal-open');
      }, 250);
    }

    function hideBanner() {
      banner.classList.remove('is-visible');
      setTimeout(function () {
        banner.classList.add('is-hidden');
      }, 300);
    }

    // Decision Handlers
    function handleAcceptAll() {
      var expiryTime = Date.now() + THIRTY_DAYS_MS;
      var prefs = { necessary: true, analytics: true, advertising: true };

      setStorage(STORAGE_KEY_STATUS, 'accepted');
      setStorage(STORAGE_KEY_PREFS, JSON.stringify(prefs));
      setStorage(STORAGE_KEY_EXPIRY, expiryTime.toString());

      if (toggleAnalytics) toggleAnalytics.checked = true;
      if (toggleAdvertising) toggleAdvertising.checked = true;

      notifyCategoryChange('analytics', true);
      notifyCategoryChange('advertising', true);

      closeModal();
      hideBanner();
    }

    function handleRejectAll() {
      var expiryTime = Date.now() + PERSISTENT_MS;
      var prefs = { necessary: true, analytics: false, advertising: false };

      setStorage(STORAGE_KEY_STATUS, 'rejected');
      setStorage(STORAGE_KEY_PREFS, JSON.stringify(prefs));
      setStorage(STORAGE_KEY_EXPIRY, expiryTime.toString());

      if (toggleAnalytics) toggleAnalytics.checked = false;
      if (toggleAdvertising) toggleAdvertising.checked = false;

      notifyCategoryChange('analytics', false);
      notifyCategoryChange('advertising', false);

      closeModal();
      hideBanner();
    }

    function handleSavePreferences() {
      var analytics = toggleAnalytics ? toggleAnalytics.checked : false;
      var advertising = toggleAdvertising ? toggleAdvertising.checked : false;
      var prefs = { necessary: true, analytics: analytics, advertising: advertising };

      // If user accepted optional cookies, re-ask in 30 days. If everything
      // optional was rejected, that persists until an admin re-asks (see
      // handleRejectAll above) - no automatic re-ask on a timer.
      var hasOptional = analytics || advertising;
      var duration = hasOptional ? THIRTY_DAYS_MS : PERSISTENT_MS;
      var expiryTime = Date.now() + duration;

      setStorage(STORAGE_KEY_STATUS, hasOptional ? 'custom' : 'rejected');
      setStorage(STORAGE_KEY_PREFS, JSON.stringify(prefs));
      setStorage(STORAGE_KEY_EXPIRY, expiryTime.toString());

      notifyCategoryChange('analytics', analytics);
      notifyCategoryChange('advertising', advertising);

      closeModal();
      hideBanner();
    }

    // Bind Banner Buttons
    if (btnOpenPrefs) btnOpenPrefs.addEventListener('click', openModal);
    if (btnBannerReject) btnBannerReject.addEventListener('click', handleRejectAll);
    if (btnBannerAccept) btnBannerAccept.addEventListener('click', handleAcceptAll);

    // Bind Modal Buttons
    if (btnModalClose) btnModalClose.addEventListener('click', closeModal);
    if (btnModalBackdrop) btnModalBackdrop.addEventListener('click', closeModal);
    if (btnModalReject) btnModalReject.addEventListener('click', handleRejectAll);
    if (btnModalSave) btnModalSave.addEventListener('click', handleSavePreferences);
    if (btnModalAccept) btnModalAccept.addEventListener('click', handleAcceptAll);

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-visible')) {
        closeModal();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent);
  } else {
    initCookieConsent();
  }
})();
