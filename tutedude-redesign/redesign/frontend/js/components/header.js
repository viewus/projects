/*
  Header component — renders the standard or floating header from a single
  JSON nav config (data/site.json → brand + nav). One render function, one
  markup source; the variant is chosen per-page via [data-variant] on the
  mount element, and the active page via <body data-page="home|course">.
*/

const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>',
  caret: '<svg class="site-header__caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5"/></svg>'
};

async function loadNavData() {
  const res = await fetch('data/site.json');
  if (!res.ok) throw new Error('Failed to load site.json for header');
  return res.json();
}

function isActive(matchPage, currentPage) {
  return Boolean(matchPage) && matchPage === currentPage;
}

function renderDesktopNavItem(item, currentPage) {
  const active = isActive(item.matchPage, currentPage);
  const hasDropdown = Boolean(item.dropdown);

  const linkClasses = ['site-header__nav-link'];
  if (active) linkClasses.push('is-active');

  const linkHtml = `
    <a class="${linkClasses.join(' ')}" href="${item.href}" ${active ? 'aria-current="page"' : ''}>
      ${item.label}
      ${hasDropdown ? ICONS.caret : ''}
    </a>
  `;

  if (!hasDropdown) {
    return `<li class="site-header__nav-item">${linkHtml}</li>`;
  }

  const children = item.dropdown.children.map((child) => {
    const childActive = isActive(child.matchPage, currentPage);
    return `
      <li>
        <a class="site-header__dropdown-link" href="${child.href}" ${childActive ? 'aria-current="page"' : ''}>
          <span class="site-header__dropdown-title">${child.label}</span>
          <span class="site-header__dropdown-desc">${child.description}</span>
        </a>
      </li>
    `;
  }).join('');

  return `
    <li class="site-header__nav-item has-dropdown" data-dropdown-item>
      ${linkHtml}
      <div class="site-header__dropdown" role="menu">
        <div class="site-header__dropdown-panel">
          <p class="site-header__dropdown-heading">${item.dropdown.heading}</p>
          <ul class="site-header__dropdown-list">${children}</ul>
        </div>
      </div>
    </li>
  `;
}

function renderMobileNavItem(item, currentPage) {
  const active = isActive(item.matchPage, currentPage);
  const hasDropdown = Boolean(item.dropdown);

  if (!hasDropdown) {
    return `
      <li class="mobile-nav__item">
        <a class="mobile-nav__link ${active ? 'is-active' : ''}" href="${item.href}">${item.label}</a>
      </li>
    `;
  }

  const children = item.dropdown.children.map((child) => {
    const childActive = isActive(child.matchPage, currentPage);
    return `<a class="mobile-nav__sublink ${childActive ? 'is-active' : ''}" href="${child.href}">${child.label}</a>`;
  }).join('');

  return `
    <li class="mobile-nav__item" data-mobile-dropdown-item>
      <button class="mobile-nav__item-toggle" type="button" aria-expanded="false">
        ${item.label} ${ICONS.caret}
      </button>
      <div class="mobile-nav__submenu">${children}</div>
    </li>
  `;
}

function renderHeaderMarkup(config, variant, currentPage) {
  const { brand, nav } = config;
  const navItemsHtml = nav.items.map((item) => renderDesktopNavItem(item, currentPage)).join('');
  const mobileItemsHtml = nav.items.map((item) => renderMobileNavItem(item, currentPage)).join('');

  return `
    <div class="site-header site-header--${variant}" data-header-root>
      <div class="site-header__inner">
        <a class="site-header__brand" href="index.html">
          <img class="site-header__logo" src="${brand.logo}" alt="${brand.name}">
        </a>

        <nav class="site-header__nav" aria-label="Primary">
          <ul class="site-header__nav-list">${navItemsHtml}</ul>
        </nav>

        <div class="site-header__actions">
          ${nav.actions.search.enabled ? `
            <div style="position:relative;">
              <button class="site-header__icon-btn" type="button" data-search-toggle aria-label="Search">${ICONS.search}</button>
              <div class="site-header__search" data-search-panel>
                <input type="search" placeholder="${nav.actions.search.placeholder}" aria-label="Search courses">
              </div>
            </div>
          ` : ''}
          <a class="site-header__login" href="${nav.actions.login.href}">${ICONS.user}${nav.actions.login.label}</a>
          <a class="site-header__cta" href="${nav.actions.primaryCta.href}">${nav.actions.primaryCta.label} ${ICONS.arrow}</a>
          <button class="site-header__menu-toggle" type="button" data-mobile-open aria-label="Open menu">${ICONS.menu}</button>
        </div>
      </div>
    </div>

    <div class="mobile-nav" data-mobile-nav>
      <div class="mobile-nav__backdrop" data-mobile-close></div>
      <div class="mobile-nav__panel" role="dialog" aria-label="Menu">
        <div class="mobile-nav__top">
          <a class="site-header__brand" href="index.html">
            <img class="site-header__logo" src="${brand.logo}" alt="${brand.name}">
          </a>
          <button class="mobile-nav__close" type="button" data-mobile-close aria-label="Close menu">${ICONS.close}</button>
        </div>

        ${nav.actions.search.enabled ? `
          <div class="mobile-nav__search">
            <input type="search" placeholder="${nav.actions.search.placeholder}" aria-label="Search courses">
          </div>
        ` : ''}

        <ul class="mobile-nav__list">${mobileItemsHtml}</ul>

        <div class="mobile-nav__actions">
          <a class="mobile-nav__login" href="${nav.actions.login.href}">${ICONS.user}${nav.actions.login.label}</a>
          <a class="mobile-nav__cta" href="${nav.actions.primaryCta.href}">${nav.actions.primaryCta.label} ${ICONS.arrow}</a>
        </div>
      </div>
    </div>
  `;
}

function wireInteractions(root) {
  const header = root.querySelector('[data-header-root]');
  const variant = header?.classList.contains('site-header--standard') ? 'standard' : 'floating';

  // Desktop dropdown (click/keyboard support in addition to CSS :hover)
  root.querySelectorAll('[data-dropdown-item]').forEach((item) => {
    const link = item.querySelector('.site-header__nav-link');
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = item.classList.contains('is-open');
      root.querySelectorAll('[data-dropdown-item].is-open').forEach((el) => el.classList.remove('is-open'));
      item.classList.toggle('is-open', !isOpen);
    });
  });

  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) {
      root.querySelectorAll('[data-dropdown-item].is-open').forEach((el) => el.classList.remove('is-open'));
    }
  });

  // Search toggle
  const searchToggle = root.querySelector('[data-search-toggle]');
  const searchPanel = root.querySelector('[data-search-panel]');
  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', () => {
      searchPanel.classList.toggle('is-open');
      if (searchPanel.classList.contains('is-open')) searchPanel.querySelector('input').focus();
    });
    document.addEventListener('click', (e) => {
      if (!searchToggle.contains(e.target) && !searchPanel.contains(e.target)) {
        searchPanel.classList.remove('is-open');
      }
    });
  }

  // Mobile menu open/close
  const mobileNav = root.querySelector('[data-mobile-nav]');
  root.querySelectorAll('[data-mobile-open]').forEach((btn) => {
    btn.addEventListener('click', () => mobileNav.classList.add('is-open'));
  });
  root.querySelectorAll('[data-mobile-close]').forEach((btn) => {
    btn.addEventListener('click', () => mobileNav.classList.remove('is-open'));
  });

  // Mobile accordion dropdowns
  root.querySelectorAll('[data-mobile-dropdown-item]').forEach((item) => {
    const toggle = item.querySelector('.mobile-nav__item-toggle');
    toggle.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // Sticky elevation for the standard variant only
  if (variant === 'standard') {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Below desktop width the header switches to position: fixed (see
    // header.css) since sticky is unreliable on mobile browsers. Fixed takes
    // it out of the flow, so <main> needs the exact header height pushed
    // back in as padding-top — measured live rather than hardcoded, so it
    // stays correct across screen sizes and if the header's own content
    // ever changes height.
    document.body.classList.add('has-fixed-header');
    const syncHeaderOffset = () => {
      document.documentElement.style.setProperty('--header-offset', `${header.offsetHeight}px`);
    };
    syncHeaderOffset();
    window.addEventListener('resize', syncHeaderOffset);
    window.addEventListener('orientationchange', syncHeaderOffset);
  }
}

export async function renderHeader(mountSelector = '#header') {
  const mount = document.querySelector(mountSelector);
  if (!mount) return;

  const variant = mount.dataset.variant === 'floating' ? 'floating' : 'standard';
  const currentPage = document.body.dataset.page || '';

  const config = await loadNavData();
  mount.innerHTML = renderHeaderMarkup(config, variant, currentPage);
  wireInteractions(mount);
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeader('#header');
});
