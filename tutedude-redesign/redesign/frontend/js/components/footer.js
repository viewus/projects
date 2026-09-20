/*
  Footer component — renders from the single JSON config (data/site.json →
  brand + footer). Same pattern as header.js: one render function, one
  markup source, mounted into whatever element the page provides
  (<footer id="footer">). Link columns collapse into an accordion on
  mobile (see footer.css) and are always expanded from tablet width up.
*/

const ICONS = {
  caret: '<svg class="site-footer__caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>',
  arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.2"/><circle cx="16" cy="8" r="0.6" fill="currentColor" stroke="none"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="4"/><path d="M10.5 9.5v5l4.5-2.5-4.5-2.5z" fill="currentColor" stroke="none"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="4"/><line x1="8" y1="11" x2="8" y2="16"/><circle cx="8" cy="7.7" r="0.9" fill="currentColor" stroke="none"/><path d="M11.3 16v-3.1c0-1.2.9-1.9 2-1.9s1.9.7 1.9 1.9V16"/><line x1="11.3" y1="11.3" x2="11.3" y2="16"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="4"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>',
  // Decorative hand-drawn underline accent beneath the pull-quote.
  squiggle: '<svg class="site-footer__quote-underline" viewBox="0 0 120 12" fill="none" preserveAspectRatio="none"><path d="M2 8c16-8 28 6 44-1 15-6 30 4 44-2 10-4 20 1 28-3" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  // Small flourish flanking the closing message.
  sparkle: '<svg class="site-footer__wave-sparkle" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 6.5l8 6 8-6"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h3l1.5 5-2 2a12 12 0 006.5 6.5l2-2 5 1.5v3a2 2 0 01-2 2C11 21 3 13 3 5a2 2 0 013-2z"/></svg>'
};

async function loadSiteData() {
  const res = await fetch('data/site.json');
  if (!res.ok) throw new Error('Failed to load site.json for footer');
  return res.json();
}

function renderColumn(column) {
  const items = column.links.map((link) => `<li><a class="site-footer__link" href="${link.href}">${link.label}</a></li>`).join('');
  return `
    <div class="site-footer__column" data-footer-column>
      <button class="site-footer__column-toggle" type="button" aria-expanded="false" data-footer-column-toggle>
        <span>${column.title}</span>
        ${ICONS.caret}
      </button>
      <ul class="site-footer__column-list">${items}</ul>
    </div>
  `;
}

function renderSocial(social) {
  return social.items.map((item) => `
    <a class="site-footer__social-link" href="${item.href}" aria-label="${item.label}">
      ${ICONS[item.id] || ''}
    </a>
  `).join('');
}

function renderQuote(quote) {
  if (!quote) return '';
  return `
    <div class="site-footer__quote" data-footer-area="decorative">
      <span class="site-footer__quote-mark" aria-hidden="true">&ldquo;</span>
      <p class="site-footer__quote-text">
        ${quote.text}
        ${ICONS.squiggle}
      </p>
    </div>
  `;
}

function renderWave(wave) {
  if (!wave || !wave.enabled) return '';
  return `
    <div class="site-footer__wave" data-footer-area="closing" aria-hidden="true">
      <svg class="site-footer__wave-svg site-footer__wave-svg--back" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path d="M0,22 C300,4 600,28 900,12 C1100,2 1300,24 1440,10 L1440,100 L0,100 Z" fill="var(--brand-100)"></path>
      </svg>
      <svg class="site-footer__wave-svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="footerWaveGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style="stop-color:var(--brand-500)"/>
            <stop offset="100%" style="stop-color:var(--brand-700)"/>
          </linearGradient>
        </defs>
        <path d="M0,32 C240,12 480,44 720,24 C960,4 1200,40 1440,20 L1440,100 L0,100 Z" fill="url(#footerWaveGradient)"></path>
      </svg>
      <div class="site-footer__wave-glow"></div>
      <p class="site-footer__wave-tagline">
        ${ICONS.sparkle}
        <span>${wave.tagline}</span>
        ${ICONS.sparkle}
      </p>
    </div>
  `;
}

function renderFooterMarkup(config) {
  const { brand, footer } = config;
  const columnsHtml = footer.columns.map(renderColumn).join('');

  return `
    <div class="site-footer" data-footer-root>
      <div class="site-footer__inner">

        <!-- Area 1: Main footer — brand + nav/info columns -->
        <div class="site-footer__top" data-footer-area="main">
          <div class="site-footer__brand">
            <a class="site-footer__brand-link" href="index.html">
              <img class="site-footer__logo" src="${brand.logo}" alt="${brand.name}">
            </a>
            <p class="site-footer__tagline">${footer.tagline}</p>
            <p class="site-footer__description">${footer.description}</p>
            <p class="site-footer__trust">${ICONS.check}<span>${footer.trustLine}</span></p>
            <div class="site-footer__social">${renderSocial(footer.social)}</div>
            <div class="site-footer__contact">
              <a href="mailto:${footer.contact.email}">${ICONS.mail}<span>${footer.contact.email}</span></a>
              <a href="tel:${footer.contact.phone.replace(/\s+/g, '')}">${ICONS.phone}<span>${footer.contact.phone}</span></a>
            </div>
          </div>

          <div class="site-footer__columns">${columnsHtml}</div>
        </div>

        <!-- Area 2: decorative pull-quote strip -->
        ${renderQuote(footer.quote)}

        <!-- Area 3: bottom bar (copyright / back-to-top) -->
        <div class="site-footer__bottom" data-footer-area="bottom">
          <p class="site-footer__copyright">${footer.bottomBar.copyright}</p>
          <p class="site-footer__made-with">${footer.bottomBar.madeWithLine}</p>
          <button class="site-footer__back-to-top" type="button" data-back-to-top>
            ${footer.bottomBar.backToTop.label} ${ICONS.arrowUp}
          </button>
        </div>
      </div>

      <!-- Area 3 continued: the wave carries the bottom message's distinct script typography -->
      ${renderWave(footer.wave)}
    </div>
  `;
}

function wireInteractions(root) {
  root.querySelectorAll('[data-footer-column]').forEach((column) => {
    const toggle = column.querySelector('[data-footer-column-toggle]');
    toggle.addEventListener('click', () => {
      const isOpen = column.classList.contains('is-open');
      column.classList.toggle('is-open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  const backToTop = root.querySelector('[data-back-to-top]');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

export async function renderFooter(mountSelector = '#footer') {
  const mount = document.querySelector(mountSelector);
  if (!mount) return;

  const config = await loadSiteData();
  mount.innerHTML = renderFooterMarkup(config);
  wireInteractions(mount);
}

document.addEventListener('DOMContentLoaded', () => {
  renderFooter('#footer');
});
