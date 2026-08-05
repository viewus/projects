/* ---------------------------------------------------------------------------
 * contactForm.js — this form's own fields and validation, nothing else.
 * The network call is delegated to callApi() in assets/js/api/apiService.js.
 *
 * A second form later (order, newsletter, ...) = a new entry in
 * config/apiEndpoints.json + a file like this one. apiService.js never changes.
 * ------------------------------------------------------------------------- */
(function (window) {
  "use strict";

  var INDIAN_MOBILE = /^[6-9]\d{9}$/;
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showFieldError($field, message) {
    $field.addClass("isInvalid").attr("aria-invalid", "true");
    $field.closest(".formGroup").find(".formError").text(message).show();
  }

  function clearFieldErrors($form) {
    $form.find(".isInvalid").removeClass("isInvalid").removeAttr("aria-invalid");
    $form.find(".formError").text("").hide();
  }

  function validate($form, messages) {
    var errors = 0;
    var firstInvalid = null;

    function fail($field, message) {
      showFieldError($field, message);
      if (!firstInvalid) firstInvalid = $field;
      errors++;
    }

    var $name = $form.find("#contactName");
    var $phone = $form.find("#contactPhone");
    var $email = $form.find("#contactEmail");
    var $message = $form.find("#contactMessage");

    if (!$name.val().trim()) fail($name, messages.nameRequired);

    var phone = $phone.val().replace(/[\s\-()]/g, "").replace(/^\+91/, "");
    if (!phone) fail($phone, messages.phoneRequired);
    else if (!INDIAN_MOBILE.test(phone)) fail($phone, messages.phoneInvalid);

    // Email is optional; validate only if something was typed.
    var email = $email.val().trim();
    if (email && !EMAIL.test(email)) fail($email, messages.emailInvalid);

    if (!$message.val().trim()) fail($message, messages.messageRequired);

    if (firstInvalid) firstInvalid.trigger("focus");
    return errors === 0;
  }

  /**
   * Wire up the form. Called by main.js once contact.json has loaded, so all
   * labels and validation messages come from JSON rather than being hardcoded.
   */
  function initContactForm(content) {
    var $form = $("#contactForm");
    if (!$form.length) return;

    var $status = $("#contactFormStatus");
    var $submit = $form.find("#contactSubmit");
    var idleLabel = content.fields.submitLabel;

    $form.on("submit", function (event) {
      event.preventDefault();
      clearFieldErrors($form);
      $status.attr("class", "formStatus").empty().hide();

      if (!validate($form, content.validation)) return;

      var payload = {
        name: $form.find("#contactName").val().trim(),
        phone: $form.find("#contactPhone").val().trim(),
        email: $form.find("#contactEmail").val().trim(),
        interest: $form.find("#contactInterest").val(),
        message: $form.find("#contactMessage").val().trim(),
        submittedFrom: window.location.href
      };

      $submit.prop("disabled", true).text(content.fields.submitBusyLabel);

      callApi("contactForm", payload)
        .then(function () {
          $form[0].reset();
          $status
            .attr("class", "formStatus isSuccess")
            .html("<strong>" + pjEscape(content.successTitle) + "</strong><br>" +
                  pjEscape(content.successText))
            .show();
        })
        .catch(function (err) {
          console.error("[contactForm] Submission failed:", err);
          $status
            .attr("class", "formStatus isError")
            .html("<strong>" + pjEscape(content.errorTitle) + "</strong><br>" +
                  pjEscape(content.errorText))
            .show();
        })
        .then(function () {
          $submit.prop("disabled", false).text(idleLabel);
        });
    });
  }

  window.initContactForm = initContactForm;

})(window);
