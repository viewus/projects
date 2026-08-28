/**
 * assets/js/form.js
 * Contact form submission — uses FORM_CONFIG from data/form-config.js
 */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof FORM_CONFIG === 'undefined') return;

  const form    = document.querySelector('.contact-form');
  const submitEl = form?.querySelector('.form-submit');
  if (!form || !submitEl) return;

  /* Give submit button a reliable ID */
  submitEl.id = 'submitBtn';
  submitEl.innerHTML = '<span id="btnText">Send Message &#x1F96D;</span>';
  submitEl.addEventListener('click', handleSubmit);

  /* Inject status container */
  if (!document.getElementById('formStatus')) {
    const s = document.createElement('div');
    s.id = 'formStatus';
    s.className = 'form-status';
    form.appendChild(s);
  }

  function handleSubmit() {
    const name  = document.getElementById('f-name')?.value.trim()  || '';
    const email = document.getElementById('f-email')?.value.trim() || '';
    const phone = document.getElementById('f-phone')?.value.trim() || '';
    const type  = document.getElementById('f-type')?.value.trim()  || '';
    const query = document.getElementById('f-query')?.value.trim() || '';
    const btn   = document.getElementById('submitBtn');
    const txt   = document.getElementById('btnText');

    if (!name || !email || !query) {
      showStatus('Please fill in your name, email, and message.', 'error');
      return;
    }

    btn.disabled = true;
    btn.classList.remove('is-success');
    txt.textContent = 'Sending...';
    showStatus('', '');

    fetch(FORM_CONFIG.apiUrl, {
      method: 'POST',
      body: JSON.stringify({
        action: 'add_lead',
        name,
        email,
        phone,
        query: (type ? `[${type}] ` : '') + query,
      }),
    })
      .then(r => r.json())
      .then(() => {
        btn.classList.add('is-success');
        txt.textContent = "Sent! We'll be in touch soon";
        showStatus(FORM_CONFIG.successMsg, 'success');
        ['f-name','f-email','f-phone','f-query'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = '';
        });
        document.getElementById('f-type').value = '';
        setTimeout(() => {
          btn.disabled = false;
          btn.classList.remove('is-success');
          txt.innerHTML = 'Send Message &#x1F96D;';
        }, 5000);
      })
      .catch(() => {
        btn.disabled = false;
        btn.classList.remove('is-success');
        txt.innerHTML = 'Send Message &#x1F96D;';
        showStatus(FORM_CONFIG.errorMsg, 'error');
      });
  }

  function showStatus(msg, type) {
    const s = document.getElementById('formStatus');
    if (!s) return;
    s.textContent = msg;
    s.className = 'form-status' + (type ? ' ' + type : '');
    s.style.display = msg ? 'block' : 'none';
  }
});
