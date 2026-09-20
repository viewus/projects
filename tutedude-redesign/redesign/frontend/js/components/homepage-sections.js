/*
  Homepage sections (everything after Hero, before Stay Ahead) — one fetch
  of data/homepage.json, one render pass per section, each into its own
  mount point. Consolidated into one file because every section here reads
  the same JSON file; splitting into 8 components would mean 8 duplicate
  fetches for no benefit. Each render*() function is still independent and
  could be lifted into its own module later if a section needs to be reused
  somewhere this file doesn't cover.
*/

import { ICONS, CATEGORY_ICONS, sectionHeader } from '../utils/icons.js';

async function loadHomepageData() {
  const res = await fetch('data/homepage.json');
  if (!res.ok) throw new Error('Failed to load homepage.json');
  return res.json();
}

function mount(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
  return el;
}

/* ---------- Trust bar (real numbers extracted from tutedude.com, not invented) ---------- */
const TRUST_STAT_ICON = { rating: 'star', courses: 'book', learners: 'graduate', doubts: 'question', projects: 'project' };

function renderTrustBar(trustBar) {
  const items = trustBar.stats.map((stat) => `
    <div class="stats-bar__item stats-bar__item--${stat.id}">
      <span class="stats-bar__icon">${ICONS[TRUST_STAT_ICON[stat.id]] || ''}</span>
      <span class="stats-bar__body">
        <strong class="stats-bar__value">${stat.value}</strong>
        <span class="stats-bar__label">${stat.label}</span>
      </span>
    </div>
  `).join('');

  mount('trust-bar', `
    <section class="section" data-section="trustBar">
      <div class="section__inner">
        <div class="stats-bar">${items}</div>
      </div>
    </section>
  `);
}

/* ---------- How it works (numbered process) ---------- */
function renderHowItWorks(howItWorks) {
  const steps = howItWorks.steps.map((step) => `
    <div class="process-step">
      <span class="process-step__number">${step.order}</span>
      <div class="process-step__body">
        <strong>${step.title}</strong>
        <p>${step.description}</p>
      </div>
    </div>
  `).join('');

  mount('how-it-works', `
    <section class="section section--alt" data-section="howItWorks">
      <div class="section__inner">
        ${sectionHeader(howItWorks.sectionHeader)}
        <div class="process-steps">${steps}</div>
      </div>
    </section>
  `);
}

/* ---------- Refund explained (highest-priority section) ----------
   renderRefundSection is exported so the course page can reuse the exact
   same markup/CSS for its own refundExplained data, rather than
   duplicating this render logic.
*/
export function renderRefundSection(refundExplained, headerData) {
  const steps = refundExplained.flow.map((step) => `
    <div class="refund-flow__step">
      <span class="refund-flow__number">${step.step}</span>
      <span>
        <span class="refund-flow__label">${step.label}</span>
        <span class="refund-flow__detail">${step.detail}</span>
      </span>
    </div>
  `).join('');

  const conditions = refundExplained.conditions.map((c) => `<li>${ICONS.check}<span>${c}</span></li>`).join('');
  const reassurance = refundExplained.reassurance ? `<p class="refund-reassurance">${refundExplained.reassurance}</p>` : '';

  return `
    <div class="refund-section">
      ${headerData ? sectionHeader(headerData) : ''}
      <div class="refund-flow">${steps}</div>
      <ul class="refund-conditions">${conditions}</ul>
      ${reassurance}
    </div>
  `;
}

function renderRefundExplained(refundExplained) {
  mount('refund-explained', `
    <section class="section" id="refund" data-section="refundExplained">
      <div class="section__inner">
        ${renderRefundSection(refundExplained, refundExplained.sectionHeader)}
      </div>
    </section>
  `);
}

/* ---------- Browse courses ----------
   Course discovery over the full real catalog: search + category filter +
   level filter, combined (AND) with show/hide (no re-fetch). With 60+
   courses the grid is capped at INITIAL_VISIBLE and expanded by a
   "show all" button, rather than dumping every card on first paint.
*/
const INITIAL_VISIBLE = 10;

function renderBrowseCourses(browseCourses) {
  const categoryPills = browseCourses.categories.map((cat) => `
    <button type="button" class="category-pill ${cat.id === 'all' ? 'is-active' : ''}" data-category-filter="${cat.id}">${cat.label}</button>
  `).join('');

  const levelPills = browseCourses.levels.map((level) => `
    <button type="button" class="category-pill ${level === 'All Levels' ? 'is-active' : ''}" data-level-filter="${level}">${level}</button>
  `).join('');

  const cards = browseCourses.courses.map((course) => `
    <a class="course-card" href="course.html?course=${course.id}" data-category="${course.category}" data-level="${course.level}" data-title="${course.title.toLowerCase()}" data-search="${(course.title + ' ' + course.categoryLabel).toLowerCase()}">
      ${course.badge ? `<span class="course-card__badge">${course.badge}</span>` : ''}
      <span class="course-card__icon">${course.logo ? `<img src="${course.logo}" alt="${course.title}" loading="lazy">` : (ICONS[CATEGORY_ICONS[course.category]] || ICONS.book)}</span>
      <h3 class="course-card__title">${course.title}</h3>
      <span class="course-card__meta">
        <span class="course-card__chip">${course.categoryLabel}</span>
        <span class="course-card__chip course-card__chip--level">${course.level}</span>
      </span>
    </a>
  `).join('');

  const el = mount('browse-courses', `
    <section class="section section--discovery" id="courses" data-section="browseCourses">
      <div class="section__inner">
        ${sectionHeader(browseCourses.sectionHeader)}

        <div class="course-discovery-controls">
          <label class="course-search">
            ${ICONS.search}
            <input type="text" placeholder="${browseCourses.search.placeholder}" data-course-search-input>
          </label>
          <div class="filter-row" data-category-filters>${categoryPills}</div>
          <div class="filter-row" data-level-filters>${levelPills}</div>
        </div>

        <div class="course-grid" data-course-grid>${cards}</div>
        <p class="course-grid__empty" data-course-empty>${browseCourses.search.noResultsText}</p>

        <div class="course-grid__footer">
          <span class="course-grid__count" data-course-count></span>
          <button type="button" class="course-grid__more" data-course-more>Show all courses ${ICONS.caret}</button>
        </div>
      </div>
    </section>
  `);

  if (el) wireBrowseCourses(el, browseCourses);
}

function wireBrowseCourses(root, browseCourses) {
  const searchInput = root.querySelector('[data-course-search-input]');
  const cards = Array.from(root.querySelectorAll('.course-card'));
  const emptyMessage = root.querySelector('[data-course-empty]');
  const countEl = root.querySelector('[data-course-count]');
  const moreBtn = root.querySelector('[data-course-more]');
  const state = { category: 'all', level: 'All Levels', query: '', expanded: false };

  function applyFilters() {
    const matched = cards.filter((card) => {
      const matchesCategory = state.category === 'all' || card.dataset.category === state.category;
      const matchesLevel = state.level === 'All Levels' || card.dataset.level === state.level;
      const matchesQuery = !state.query || card.dataset.search.includes(state.query);
      return matchesCategory && matchesLevel && matchesQuery;
    });

    const limit = state.expanded ? matched.length : INITIAL_VISIBLE;
    cards.forEach((card) => { card.style.display = 'none'; });
    matched.slice(0, limit).forEach((card) => { card.style.display = ''; });

    emptyMessage.style.display = matched.length === 0 ? 'block' : 'none';
    const shown = Math.min(limit, matched.length);
    countEl.textContent = matched.length
      ? `Showing ${shown} of ${matched.length} ${browseCourses.countLabel || 'courses'}`
      : '';
    moreBtn.style.display = matched.length > INITIAL_VISIBLE ? '' : 'none';
    moreBtn.innerHTML = state.expanded
      ? `Show fewer ${ICONS.caret}`
      : `Show all ${matched.length} courses ${ICONS.caret}`;
  }

  root.querySelectorAll('[data-category-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('[data-category-filter]').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      state.category = btn.dataset.categoryFilter;
      state.expanded = false;
      applyFilters();
    });
  });

  root.querySelectorAll('[data-level-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('[data-level-filter]').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      state.level = btn.dataset.levelFilter;
      state.expanded = false;
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      state.query = searchInput.value.trim().toLowerCase();
      state.expanded = false;
      applyFilters();
    });
  }

  moreBtn.addEventListener('click', () => {
    state.expanded = !state.expanded;
    applyFilters();
  });

  applyFilters();
}

/* ---------- Combos & All Access ---------- */
export function renderPricingGrid(plans) {
  return plans.map((plan) => `
    <div class="pricing-card ${plan.featured ? 'pricing-card--featured' : ''}">
      ${plan.featured ? '<span class="pricing-card__badge">Most Popular</span>' : ''}
      <h3 class="pricing-card__title">${plan.title}</h3>
      <p class="pricing-card__description">${plan.description}</p>
      <span class="pricing-card__price-note">${plan.priceNote}</span>
      <a class="pricing-card__cta" href="${plan.cta.href}">${plan.cta.label} ${ICONS.arrow}</a>
    </div>
  `).join('');
}

/* Combo pack card — the reference's "Combo Pack Card": pack name +
   discount, rating/enrolment proof, then the real courses inside the pack
   as icon+name chips. A deliberately different card to the mini course
   card, because a bundle is not a course. */
function renderComboCards(packs) {
  return packs.map((pack) => {
    const includes = pack.includes.map((item) => `
      <li class="combo-card__include ${item.logo ? '' : 'combo-card__include--text-only'}">
        ${item.logo ? `<img src="${item.logo}" alt="" loading="lazy">` : ''}
        <span>${item.name}</span>
      </li>
    `).join('');

    return `
      <article class="combo-card" data-combo-group="${pack.group}">
        <div class="combo-card__head">
          <div>
            <span class="combo-card__kicker">Combo Pack</span>
            <h3 class="combo-card__title">${pack.title}</h3>
          </div>
          <span class="combo-card__discount">${pack.discount}</span>
        </div>

        <div class="combo-card__proof">
          <span>${ICONS.star} ${pack.rating}</span>
          <span>${pack.enrolled} enrolled</span>
        </div>

        <ul class="combo-card__includes">${includes}</ul>

        <div class="combo-card__foot">
          <a class="combo-card__cta" href="${pack.cta.href}">${pack.cta.label} ${ICONS.arrow}</a>
        </div>
      </article>
    `;
  }).join('');
}

/* The two headline plans get their own section — they're priced plans,
   not career-track bundles, so they don't belong in the combo grid.
   No per-card validity line: lifetime access applies to everything, so
   the section description says it once. */
// Exported so course-page.js can build the same rich card for a single
// course's own plan, not just the homepage's combo/all-access packs.
export function renderHighlightPack(pack, modifier) {
  // Real catalogue entries with their real icons — the chips show what is
  // actually in the pack rather than standing in for it.
  const chips = (pack.sampleCourses || []).map((course) => `
    <li class="access-chip">
      <img src="${course.logo}" alt="">
      <span>${course.name}</span>
    </li>
  `).join('');

  const features = (pack.features || []).map((feature) => `
    <li>${ICONS.check}<span>${feature}</span></li>
  `).join('');

  return `
    <article class="access-card access-card--${modifier}">
      <header class="access-card__head">
        <span class="access-card__icon">${ICONS[pack.icon] || ICONS.quality}</span>
        <div class="access-card__heading">
          <h3 class="access-card__title">${pack.title}</h3>
          <p class="access-card__tagline">${pack.tagline}</p>
        </div>
        ${pack.badge ? `<span class="access-card__badge">${pack.badge}</span>` : ''}
      </header>

      <p class="access-card__description">${pack.description}</p>

      ${chips ? `
        <p class="access-card__courses-label">${pack.coursesLabel}</p>
        <ul class="access-card__courses">
          ${chips}
          ${pack.moreLabel ? `<li class="access-chip access-chip--more">${pack.moreLabel}</li>` : ''}
        </ul>
      ` : ''}

      ${features ? `<ul class="access-card__features">${features}</ul>` : ''}

      <div class="access-card__footer">
        <p class="access-card__pricing">
          <strong>${pack.priceNote}</strong>
          ${pack.originalPriceNote ? `<s>${pack.originalPriceNote}</s>` : ''}
          ${pack.discountNote ? `<span class="access-card__discount">${pack.discountNote}</span>` : ''}
        </p>
        <a class="access-card__cta" href="${pack.cta.href}">${pack.cta.label} ${ICONS.arrow}</a>
      </div>
    </article>
  `;
}

function renderAccessPacks(combos) {
  mount('access-packs', `
    <section class="section" id="all-access" data-section="accessPacks">
      <div class="section__inner">
        ${sectionHeader(combos.accessSectionHeader)}
        <div class="pack-highlight-grid">
          ${renderHighlightPack(combos.customPack, 'custom')}
          ${renderHighlightPack(combos.allAccess, 'all')}
        </div>
      </div>
    </section>
  `);
}

function renderCombosAndAllAccess(combos) {
  const tabs = combos.groups.map((g) => `
    <button type="button" class="category-pill ${g.id === 'all' ? 'is-active' : ''}" data-combo-filter="${g.id}">${g.label}</button>
  `).join('');

  const el = mount('combos-all-access', `
    <section class="section section--alt" id="combos" data-section="combosAndAllAccess">
      <div class="section__inner">
        ${sectionHeader(combos.sectionHeader)}
        <div class="combo-tabs" data-combo-tabs>${tabs}</div>
        <div class="combo-grid" data-combo-grid>${renderComboCards(combos.packs)}</div>
      </div>
    </section>
  `);

  renderAccessPacks(combos);

  if (el) {
    const cards = Array.from(el.querySelectorAll('[data-combo-group]'));
    el.querySelectorAll('[data-combo-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        el.querySelectorAll('[data-combo-filter]').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const group = btn.dataset.comboFilter;
        cards.forEach((card) => {
          card.style.display = group === 'all' || card.dataset.comboGroup === group ? '' : 'none';
        });
      });
    });
  }
}

/* ---------- Why Tutedude / What You Get (varied icon-box colors, matching
   the reference's multi-color feature-card pattern) ---------- */
const FEATURE_ICON_VARIANT = {
  recorded: '',
  mentor: 'feature-card__icon--teal',
  project: 'feature-card__icon--success',
  certificate: 'feature-card__icon--gold',
  community: 'feature-card__icon--soft',
  refund: 'feature-card__icon--success',
  internship: 'feature-card__icon--teal',
  quality: 'feature-card__icon--gold'
};

export function renderFeatureGrid(items) {
  return items.map((item) => `
    <div class="feature-card">
      <span class="feature-card__icon ${FEATURE_ICON_VARIANT[item.id] || ''}">${ICONS[item.id] || ICONS.check}</span>
      <h3 class="feature-card__title">${item.title}</h3>
      <p class="feature-card__description">${item.description}</p>
    </div>
  `).join('');
}

function renderWhyTutedude(whyTutedude) {
  mount('why-tutedude', `
    <section class="section" data-section="whyTutedude">
      <div class="section__inner">
        ${sectionHeader(whyTutedude.sectionHeader)}
        <div class="feature-grid">${renderFeatureGrid(whyTutedude.benefits)}</div>
      </div>
    </section>
  `);
}

/* ---------- FAQ ---------- */
export function renderFaqList(items) {
  return items.map((item, i) => `
    <div class="faq-item" data-faq-item>
      <button class="faq-item__question" type="button" data-faq-toggle aria-expanded="false">
        <span>${item.question}</span>
        ${ICONS.caret}
      </button>
      <div class="faq-item__answer">${item.answer}</div>
    </div>
  `).join('');
}

export function wireFaqAccordion(container) {
  container.querySelectorAll('[data-faq-item]').forEach((item) => {
    const toggle = item.querySelector('[data-faq-toggle]');
    toggle.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      container.querySelectorAll('[data-faq-item].is-open').forEach((el) => {
        el.classList.remove('is-open');
        el.querySelector('[data-faq-toggle]').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

function renderFaq(faq) {
  const el = mount('faq', `
    <section class="section section--alt" data-section="faq">
      <div class="section__inner">
        ${sectionHeader(faq.sectionHeader)}
        <div class="faq-list">${renderFaqList(faq.items)}</div>
      </div>
    </section>
  `);
  if (el) wireFaqAccordion(el);
}

/* ---------- Final CTA ---------- */
function renderFinalCta(finalCta) {
  mount('final-cta', `
    <section class="section" data-section="finalCta">
      <div class="section__inner">
        <div class="cta-section">
          <h2 class="cta-section__title">${finalCta.title}</h2>
          <p class="cta-section__description">${finalCta.description}</p>
          <a class="cta-section__button" href="${finalCta.primaryCta.href}">${finalCta.primaryCta.label} ${ICONS.arrow}</a>
        </div>
      </div>
    </section>
  `);
}

/* ---------- Proof: rating + the real video reviews ----------
   Tutedude publishes video reviews (names only, no written quotes and no
   per-review stars), so this renders the real aggregate rating plus the
   real reviewer names as initials. No quote text is fabricated and no
   learner photos are reproduced — see homepage.json proof._note. */
function initials(name) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function renderProof(proof) {
  if (!proof || !proof.rating) return;

  const stars = Array.from({ length: proof.rating.stars }, () => ICONS.star).join('');

  const highlights = (proof.highlights || []).map((item) => `
    <li class="rating-summary__stat">
      <span class="rating-summary__stat-icon">${ICONS[item.id] || ICONS.check}</span>
      <span>
        <strong>${item.value}</strong>
        <span>${item.label}</span>
      </span>
    </li>
  `).join('');

  const people = proof.videoReviews.people.map((person) => `
    <li class="review-card">
      <span class="review-card__avatar">${initials(person.name)}</span>
      <span class="review-card__body">
        <strong>${person.name}</strong>
        <span>${proof.videoReviews.role}</span>
      </span>
      <span class="review-card__play" aria-hidden="true">${ICONS.play}</span>
    </li>
  `).join('');

  mount('proof', `
    <section class="section section--alt" data-section="proof">
      <div class="section__inner">
        ${sectionHeader(proof.sectionHeader)}

        <div class="rating-summary">
          <div class="rating-summary__score">
            <p class="rating-summary__value">${proof.rating.value}<span>/${proof.rating.outOf}</span></p>
            <div class="rating-summary__stars">${stars}</div>
            <p class="rating-summary__source">${proof.rating.source}</p>
            <p class="rating-summary__support">${proof.rating.supportLine}</p>
          </div>
          <ul class="rating-summary__stats">${highlights}</ul>
        </div>

        <p class="review-strip__label">${proof.videoReviews.label}</p>
        <ul class="review-strip">${people}</ul>
      </div>
    </section>
  `);
}

export async function renderHomepageSections() {
  const homepage = await loadHomepageData();
  renderTrustBar(homepage.trustBar);
  renderHowItWorks(homepage.howItWorks);
  renderRefundExplained(homepage.refundExplained);
  renderBrowseCourses(homepage.browseCourses);
  renderCombosAndAllAccess(homepage.combosAndAllAccess);
  renderWhyTutedude(homepage.whyTutedude);
  renderProof(homepage.proof);
  renderFaq(homepage.faq);
  renderFinalCta(homepage.finalCta);
}

document.addEventListener('DOMContentLoaded', () => {
  renderHomepageSections();
});
