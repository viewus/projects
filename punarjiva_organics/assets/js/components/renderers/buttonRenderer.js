/* ---------------------------------------------------------------------------
 * buttonRenderer.js — button designs as template files, plus the one place
 * that knows what the site's three standing CTAs are (call / WhatsApp /
 * directions). Every page that needs those calls renderContactActions().
 * ------------------------------------------------------------------------- */
(function (window) {
  "use strict";

  var buttonVariantFiles = {
    primary:   "components/buttons/btnPrimary.html",
    secondary: "components/buttons/btnSecondary.html",
    ghost:     "components/buttons/btnGhost.html"
  };

  function renderButton(button, variant) {
    var chosen = variant || button.variant || "primary";
    var file = buttonVariantFiles[chosen] || buttonVariantFiles.primary;

    return pjRender(file, {
      href: button.href || "#",
      label: button.label || "",
      // Named *Html so pjFill inserts it raw — it is an attribute string
      // authored here in JS, not user input.
      attrsHtml: button.external ? 'target="_blank" rel="noopener"' : ""
    });
  }

  /**
   * The three standing calls-to-action. Links come from config/config.json so
   * the phone number lives in exactly one place; wording comes from
   * data/ctaActions.json so it can be edited without touching code.
   * @param {object} cfg    parsed config.json
   * @param {object} labels {ctaCallLabel, ctaWhatsappLabel, ctaDirectionsLabel}
   */
  function renderContactActions(cfg, labels) {
    var buttons = [
      { href: cfg.contact.phoneHref, label: labels.ctaCallLabel, variant: "primary" },
      { href: cfg.contact.whatsapp, label: labels.ctaWhatsappLabel, variant: "secondary", external: true },
      { href: cfg.contact.mapsUrl, label: labels.ctaDirectionsLabel, variant: "ghost", external: true }
    ].filter(function (b) { return b.label; });

    return Promise.all(buttons.map(function (b) {
      return renderButton(b);
    })).then(function (parts) {
      return parts.join("");
    });
  }

  window.buttonVariantFiles = buttonVariantFiles;
  window.renderButton = renderButton;
  window.renderContactActions = renderContactActions;

})(window);
