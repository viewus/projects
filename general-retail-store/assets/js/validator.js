/* ---------------------------------------------------------------------------
 * validator.js — client-side form validation.
 *
 * Rules are declared in JSON alongside the field definitions, so the contact
 * form's requirements are content, not code:
 *
 *   { "name": "phone", "label": "Phone", "type": "tel",
 *     "required": true, "pattern": "phone", "errorMessage": "…" }
 *
 * This is a convenience layer only — it improves the typing experience. It is
 * not a security boundary, and whatever service receives the submission must
 * validate again on its side.
 * ------------------------------------------------------------------------- */
(function (window, $) {
  "use strict";

  var RS = window.RS || (window.RS = {});

  /** Named patterns referenced from JSON by name rather than inline regex. */
  var patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    // Deliberately permissive: 7–15 digits with optional +, spaces and dashes.
    // Over-strict phone rules reject more real numbers than they catch typos.
    phone: /^\+?[\d\s\-()]{7,18}$/,
    pincode: /^\d{4,10}$/,
    name: /^[\p{L}\s.'-]{2,60}$/u,
    url: /^https?:\/\/.+/i
  };

  RS.patterns = patterns;

  /**
   * Validate one value against a field definition.
   * @returns {string|null} an error message, or null when valid
   */
  RS.validateField = function (field, value) {
    var raw = String(value == null ? "" : value).trim();
    var label = field.label || field.name;

    if (field.required && !raw) {
      return field.requiredMessage || (label + " is required.");
    }

    if (!raw) return null;  // optional and empty — nothing further to check

    if (field.minLength && raw.length < field.minLength) {
      return label + " must be at least " + field.minLength + " characters.";
    }

    if (field.maxLength && raw.length > field.maxLength) {
      return label + " must be under " + field.maxLength + " characters.";
    }

    if (field.pattern) {
      var rule = patterns[field.pattern] ||
        (function () { try { return new RegExp(field.pattern); } catch (e) { return null; } })();

      if (rule && !rule.test(raw)) {
        return field.errorMessage || ("Please enter a valid " + label.toLowerCase() + ".");
      }
    }

    return null;
  };

  /**
   * Validate a whole form against its field definitions.
   * @returns {{valid:boolean, values:object, errors:object}}
   */
  RS.validateForm = function (formSelector, fields) {
    var $form = $(formSelector);
    var values = {};
    var errors = {};

    (fields || []).forEach(function (field) {
      var $input = $form.find('[name="' + field.name + '"]');
      var value = $input.attr("type") === "checkbox" ? $input.is(":checked") : $input.val();

      values[field.name] = value;

      var error = RS.validateField(field, value);
      if (error) errors[field.name] = error;

      showFieldError($input, error);
    });

    var firstBad = Object.keys(errors)[0];
    if (firstBad) {
      $form.find('[name="' + firstBad + '"]').trigger("focus");
    }

    return { valid: !firstBad, values: values, errors: errors };
  };

  /** Paint (or clear) the error state on a single control. */
  function showFieldError($input, message) {
    if (!$input.length) return;

    var $group = $input.closest(".formGroup");
    var $error = $group.find(".formError");

    $input.toggleClass("isInvalid", !!message);
    $input.attr("aria-invalid", message ? "true" : "false");

    if (!$error.length && message) {
      $error = $('<p class="formError" role="alert"></p>').appendTo($group);
    }
    if ($error.length) $error.text(message || "").toggle(!!message);
  }

  RS.showFieldError = showFieldError;

  /**
   * Re-validate a field once the visitor leaves it, and clear the error as soon
   * as they start fixing it. Validating on every keystroke from the start is
   * hostile — it flags an email as invalid before it could possibly be complete.
   */
  RS.bindLiveValidation = function (formSelector, fields) {
    var $form = $(formSelector);

    (fields || []).forEach(function (field) {
      var $input = $form.find('[name="' + field.name + '"]');

      $input.on("blur", function () {
        showFieldError($input, RS.validateField(field, $input.val()));
      });

      $input.on("input", function () {
        if ($input.hasClass("isInvalid")) {
          var error = RS.validateField(field, $input.val());
          if (!error) showFieldError($input, null);
        }
      });
    });
  };

})(window, jQuery);
