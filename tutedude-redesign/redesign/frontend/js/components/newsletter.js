/*
  StayAhead / Newsletter component — reusable, JSON-driven (data/site.json →
  newsletter). Meant to sit immediately above <footer id="footer"> so it
  reads as the footer's opening beat rather than a separate card; it's a
  standalone component (its own mount point) so it can be reused elsewhere
  later without touching footer.js.
*/

async function loadSiteData() {
  const res = await fetch('data/site.json');
  if (!res.ok) throw new Error('Failed to load site.json for newsletter section');
  return res.json();
}

function renderIllustration(illustration) {
  return `
    <div class="newsletter__illustration">
      <img src="${illustration.image}" alt="${illustration.alt}">
    </div>
  `;
}

function renderMarkup(newsletter) {
  return `
    <div class="newsletter" data-newsletter-root>
      <div class="newsletter__inner">
        <div class="newsletter__content">
          <p class="newsletter__eyebrow">${newsletter.eyebrow}</p>
          <h2 class="newsletter__headline">${newsletter.headline.prefix}<span class="newsletter__headline-highlight">${newsletter.headline.highlight}</span></h2>
          <p class="newsletter__description">${newsletter.description}</p>

          <form class="newsletter__form" data-newsletter-form novalidate>
            <label class="newsletter__field">
              <span class="newsletter__field-visually-hidden">Email address</span>
              <input type="email" required placeholder="${newsletter.form.placeholder}" data-newsletter-email>
            </label>
            <button type="submit" class="newsletter__submit">${newsletter.form.submitLabel}</button>
          </form>
          <p class="newsletter__success" data-newsletter-success hidden>${newsletter.form.successMessage}</p>
        </div>

        ${renderIllustration(newsletter.illustration)}
      </div>
    </div>
  `;
}

function wireInteractions(root) {
  const form = root.querySelector('[data-newsletter-form]');
  const success = root.querySelector('[data-newsletter-success]');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = root.querySelector('[data-newsletter-email]');
    if (!email.checkValidity()) {
      email.reportValidity();
      return;
    }
    form.hidden = true;
    success.hidden = false;
  });
}

export async function renderNewsletter(mountSelector = '#stay-ahead') {
  const mount = document.querySelector(mountSelector);
  if (!mount) return;

  const { newsletter } = await loadSiteData();
  mount.innerHTML = renderMarkup(newsletter);
  wireInteractions(mount);
}

document.addEventListener('DOMContentLoaded', () => {
  renderNewsletter('#stay-ahead');
});
