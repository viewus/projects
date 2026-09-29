/*!
 * MilletLuxe — contact form
 * The only "dynamic" page on the site. Validates client-side, then either
 * posts to a Formspree-style endpoint (data/site.json -> contact.formEndpoint)
 * or, with no endpoint configured, falls back to opening a pre-filled mailto:
 * link so the form still works on a plain GitHub Pages deploy with no backend.
 */
(function () {
  "use strict";

  function showStatus(el, type, message) {
    el.textContent = message;
    el.className = "form-status show " + type;
  }

  function validate(form) {
    const errors = [];
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name.length < 2) errors.push("Please enter your full name.");
    if (!emailPattern.test(email)) errors.push("Please enter a valid email address.");
    if (message.length < 10) errors.push("Please add a message of at least 10 characters.");
    if (form.website.value) errors.push("Spam check failed."); // honeypot field, must stay empty

    return errors;
  }

  function initContactForm(site) {
    const form = document.getElementById("contactForm");
    const status = document.getElementById("formStatus");
    if (!form || !status) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const errors = validate(form);
      if (errors.length) {
        showStatus(status, "err", errors[0]);
        return;
      }

      const submitBtn = form.querySelector("button[type=submit]");
      const originalLabel = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

      const endpoint = site.contact.formEndpoint;
      const payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        subject: form.subject.value,
        message: form.message.value.trim(),
      };

      try {
        if (endpoint) {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Form service responded with an error.");
          showStatus(status, "ok", "Thank you! Your message has been sent — we'll reply within one business day.");
          form.reset();
        } else {
          const subjectLine = encodeURIComponent(`[MilletLuxe] ${payload.subject || "Website enquiry"} — ${payload.name}`);
          const bodyLines = encodeURIComponent(
            `Name: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone || "-"}\n\n${payload.message}`
          );
          window.location.href = `mailto:${site.contact.email}?subject=${subjectLine}&body=${bodyLines}`;
          showStatus(status, "ok", "Opening your email client with your message pre-filled — just hit send.");
          form.reset();
        }
      } catch (err) {
        console.error(err);
        showStatus(status, "err", "Something went wrong sending your message. Please email us directly instead.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalLabel;
      }
    });
  }

  document.addEventListener("ml:shell-ready", () => {
    if (window.MLSite) initContactForm(window.MLSite);
  });
})();
