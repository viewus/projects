/*
  Homepage Hero component — 100% fidelity to reference (homehero.png & design system).
  Features:
    - Glowing ambient background & modern typography
    - Interactive Search Bar with instant focus, submit action & popular category chips
    - 3 Stat Cards with circular icon tiles (250K+ Learners, 4.9/5 Google Rating, 64+ Courses)
    - 5 Floating Glass Badges with lively micro-animations and hover effects
    - Playful handwritten script annotations with SVG doodles & arrows
*/

const ICONS = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  mentor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3.5 19c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"/><circle cx="17.5" cy="8.5" r="2.2"/><path d="M14.8 13.8c.9-.5 1.9-.8 2.9-.8 2.6 0 4.8 2 4.8 4.6"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h8l-1 8 11-12h-8l1-8z"/></svg>',
  project: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>',
  certificate: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8.5" r="5"/><polygon points="8.5 13.5 7 21 12 18.5 17 21 15.5 13.5"/></svg>',
  lifetime: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18.178 8c5.096 0 5.096 8 0 8-2.673 0-4.48-2.222-6.178-4-1.698-1.778-3.505-4-6.178-4-5.096 0-5.096 8 0 8 2.673 0 4.48-2.222 6.178-4 1.698-1.778 3.505-4 6.178-4z"/></svg>',
  community: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>',
  plane: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  curvedArrow: '<svg class="hero__doodle-arrow" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M8 38C18 36 32 28 38 14"/><polyline points="28 14 38 14 38 24"/></svg>'
};

async function loadHeroData() {
  const res = await fetch('data/homepage.json');
  if (!res.ok) throw new Error('Failed to load homepage.json for hero');
  return res.json();
}

function renderHeadline(lines) {
  return lines.map((line) => `
    <span class="hero__line ${line.highlight ? 'hero__line--highlight' : ''}">${line.text}</span>
  `).join('');
}

function renderStats(stats) {
  const items = stats.map((stat) => `
    <li class="hero__stat hero__stat--${stat.id}">
      <span class="hero__stat-icon">${ICONS[stat.icon] || ICONS[stat.id] || ''}</span>
      <span class="hero__stat-body">
        <strong class="hero__stat-value">${stat.value}</strong>
        <span class="hero__stat-label">${stat.label}</span>
      </span>
    </li>
  `).join('');
  return `<ul class="hero__stats">${items}</ul>`;
}

function renderFloatingBadges(badges) {
  return badges.map((badge) => {
    let iconHtml = ICONS[badge.id] || ICONS.bolt;
    if (badge.badgeType === 'avatars') {
      iconHtml = `
        <div class="hero__avatar-stack">
          <span class="hero__avatar hero__avatar--1">👨‍💻</span>
          <span class="hero__avatar hero__avatar--2">👩‍💼</span>
          <span class="hero__avatar hero__avatar--3">👨‍🏫</span>
        </div>
      `;
    }

    return `
      <div class="hero__badge hero__badge--${badge.id} hero__badge--type-${badge.badgeType || 'default'}">
        <span class="hero__badge-icon">${iconHtml}</span>
        <div class="hero__badge-text">
          <strong>${badge.title}</strong>
          <small>${badge.subtitle}</small>
        </div>
      </div>
    `;
  }).join('');
}

function renderSearchSection(search) {
  if (!search) return '';
  const tags = (search.popularTags || []).map((tag) => `
    <button type="button" class="hero__popular-tag" data-tag="${tag}">${tag}</button>
  `).join('');

  return `
    <div class="hero__search-container">
      <form class="hero__search-bar" id="hero-search-form" action="#courses" method="get">
        <span class="hero__search-icon">${ICONS.search}</span>
        <input 
          type="text" 
          id="hero-search-input"
          class="hero__search-input" 
          placeholder="${search.placeholder || 'What do you want to learn today?'}" 
          autocomplete="off"
        >
        <button type="submit" class="hero__search-btn">
          <span>${search.buttonLabel || 'Explore Courses'}</span>
          ${ICONS.arrow}
        </button>
      </form>

      ${tags ? `
        <div class="hero__popular-wrap">
          <span class="hero__popular-label">${search.popularLabel || 'Popular:'}</span>
          <div class="hero__popular-tags">${tags}</div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderMarkup(homepage) {
  const { hero } = homepage;

  return `
    <section class="hero" data-hero-root>
      <!-- Ambient decorative glow elements -->
      <div class="hero__glow hero__glow--left" aria-hidden="true"></div>
      <div class="hero__glow hero__glow--right" aria-hidden="true"></div>
      <div class="hero__glow hero__glow--center" aria-hidden="true"></div>

      <div class="hero__inner">
        <!-- Content Column (Left) -->
        <div class="hero__content">
          <div class="hero__eyebrow-wrap">
            <span class="hero__eyebrow-sparkle">✦</span>
            <p class="hero__eyebrow">${hero.eyebrow}</p>
          </div>

          <h1 class="hero__headline">
            ${renderHeadline(hero.headlineLines)}
          </h1>

          <p class="hero__description">${hero.description}</p>

          <!-- Interactive Search & Tags -->
          ${renderSearchSection(hero.search)}

          <!-- Stats & Doodle on bottom-left -->
          <div class="hero__bottom-row">
            <div class="hero__stats-wrap">
              ${renderStats(hero.stats)}
            </div>

            <div class="hero__doodle hero__doodle--students" aria-hidden="true">
              <span class="hero__doodle-text">Same Students Brighter Futures ☻</span>
              ${ICONS.curvedArrow}
            </div>
          </div>
        </div>

        <!-- Visual Scene Column (Right) -->
        <div class="hero__visual">
          <div class="hero__scene">
            <!-- Floating Handwritten Accents -->
            <div class="hero__doodle hero__doodle--steps" aria-hidden="true">
              <span>Small Steps Big Progress</span>
            </div>

            <div class="hero__doodle hero__doodle--brighter" aria-hidden="true">
              <span>A Brighter You ☻</span>
            </div>

            <div class="hero__doodle hero__doodle--future" aria-hidden="true">
              <span>Your Future Self Thanks You ♡</span>
              <span class="hero__doodle-plane">${ICONS.plane}</span>
            </div>

            <!-- Main Scene Artwork -->
            <div class="hero__image-wrap">
              <div class="hero__image-glow" aria-hidden="true"></div>
              <img 
                class="hero__image" 
                src="${hero.image.src}" 
                alt="${hero.image.alt}"
                onerror="this.onerror=null;this.src='${hero.image.fallbackSrc || 'assets/images/hero-student.jpg'}';"
              >
            </div>

            <!-- Floating Glass Cards (Surrounding Learner) -->
            <div class="hero__badges">
              ${renderFloatingBadges(hero.floatingBadges)}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function wireHeroInteractions() {
  const searchForm = document.getElementById('hero-search-form');
  const searchInput = document.getElementById('hero-search-input');
  const popularTags = document.querySelectorAll('.hero__popular-tag');

  function triggerCourseSearch(query) {
    const browseSection = document.getElementById('browse-courses') || document.getElementById('courses');
    const courseSearchInput = document.querySelector('.browse-courses__search-input, #course-search-input');

    if (courseSearchInput) {
      courseSearchInput.value = query;
      courseSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (browseSection) {
      browseSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = searchInput.value.trim();
      triggerCourseSearch(val);
    });
  }

  popularTags.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tag = btn.getAttribute('data-tag');
      if (searchInput) searchInput.value = tag;
      triggerCourseSearch(tag);
    });
  });
}

export async function renderHero(mountSelector = '#hero') {
  const mount = document.querySelector(mountSelector);
  if (!mount) return;

  const homepage = await loadHeroData();
  mount.innerHTML = renderMarkup(homepage);
  wireHeroInteractions();
}

document.addEventListener('DOMContentLoaded', () => {
  renderHero('#hero');
});
