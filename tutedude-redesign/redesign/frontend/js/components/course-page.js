/*
  Common Course Page — one template, driven entirely by JSON.

  Two data paths, both real:
   1. A course with its own data/courses/<id>.json renders in full
      (curriculum, projects, tools included).
   2. Any other course in the catalogue renders from its real catalogue
      entry (name, category, logo) merged with site.json's courseDefaults
      — the universal facts that apply to every Tutedude course. Sections
      that are genuinely course-specific (curriculum, projects, tools) are
      SKIPPED rather than borrowing another course's content, so a Python
      page never shows UI/UX's syllabus.

  Layout follows project/ideas/courseheader.png and coursecurriculum.png:
  a two-column hero (message + image with floating cards) over a trust
  bar, then ONE tabbed explorer that holds Curriculum / Features /
  Projects / Certification / FAQs instead of five stacked sections. Tabs
  are filtered to the panels a course actually has data for.

  Reuses renderFeatureGrid / renderRefundSection / renderHighlightPack /
  renderFaqList / wireFaqAccordion from homepage-sections.js instead of
  duplicating that markup, and .hero__primary-cta from hero.css. Pricing
  uses the same rich AccessCard treatment as the homepage's combo/all-
  access cards (icon, tagline, feature checklist) rather than a plain
  price card — the combo/all-access cards are literally the same real
  data objects the homepage uses, not rebuilt.
*/

import { ICONS, sectionHeader, CATEGORY_ICONS } from '../utils/icons.js';
import { renderFeatureGrid, renderRefundSection, renderHighlightPack, renderFaqList, wireFaqAccordion } from './homepage-sections.js';

function getCourseId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('course') || 'uiux';
}

async function fetchJson(url) {
  const res = await fetch(url);
  return res.ok ? res.json() : null;
}

function buildCourseFromCatalogue(entry, defaults) {
  const d = defaults.hero;
  return {
    id: entry.id,
    category: entry.categoryLabel,
    title: `${entry.title} — ${d.eyebrowSuffix}`,
    logo: entry.logo,
    level: entry.level,
    format: defaults.format,
    hero: {
      eyebrow: `${entry.categoryLabel} · ${d.eyebrowSuffix}`,
      badge: d.badgeTemplate.replace('{course}', entry.title),
      badgeSuffix: d.badgeSuffix,
      headlineLines: [
        { text: `Learn ${entry.title}.`, highlight: false },
        { text: d.highlightLine, highlight: true }
      ],
      subheadline: d.subheadline,
      image: d.image,
      floatingBadges: d.floatingBadges,
      checklist: d.checklist,
      stats: d.stats,
      trustBar: d.trustBar,
      primaryCta: d.primaryCta,
      secondaryCta: d.secondaryCta
    },
    whatYouGet: defaults.whatYouGet,
    refundExplained: defaults.refundExplained,
    curriculumSection: defaults.curriculumSection,
    courseHighlights: defaults.courseHighlights,
    mentor: defaults.mentor,
    certificate: defaults.certificate,
    pricing: defaults.pricing,
    faq: defaults.faq,
    finalCta: {
      title: defaults.finalCta.titleTemplate.replace('{course}', entry.title),
      description: defaults.finalCta.description,
      primaryCta: defaults.finalCta.primaryCta
    }
    // deliberately no curriculum / projects / tools — see file header
  };
}

async function loadCourseData(courseId) {
  const [homepage, site] = await Promise.all([
    fetchJson('data/homepage.json'),
    fetchJson('data/site.json')
  ]);
  const entry = homepage && homepage.browseCourses.courses.find((c) => c.id === courseId);
  const defaults = site && site.courseDefaults;
  // Real combo/all-access objects, reused as-is for the pricing cards below
  // instead of duplicating that content into every course file.
  const combos = homepage && homepage.combosAndAllAccess;

  // The catalogue knows which courses have their own file, so we never
  // fire a request that we expect to 404.
  if (entry && entry.hasDetailPage) {
    const own = await fetchJson(`data/courses/${courseId}.json`);
    // A course file only carries what is specific to it; the universal
    // labels still come from courseDefaults so they stay in one place.
    if (own) {
      if (defaults) {
        if (!own.curriculumSection) own.curriculumSection = defaults.curriculumSection;
        if (!own.courseHighlights) own.courseHighlights = defaults.courseHighlights;
        if (!own.hero.stats) own.hero.stats = defaults.hero.stats;
        if (!own.hero.trustBar) own.hero.trustBar = defaults.hero.trustBar;
      }
      own._combos = combos;
      return own;
    }
  }

  if (entry && defaults) {
    const built = buildCourseFromCatalogue(entry, defaults);
    built._combos = combos;
    return built;
  }

  // Unknown id — fall back to the one fully-written course.
  const fallback = await fetchJson('data/courses/uiux.json');
  if (fallback) fallback._combos = combos;
  return fallback;
}

function mount(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
  return el;
}

/* ---------- Course hero (two columns + trust bar + video modal) ---------- */
function renderCourseHero(course) {
  const hero = course.hero;

  const lines = (hero.headlineLines || [{ text: hero.headline, highlight: false }])
    .map((line) => `<span class="course-hero__line${line.highlight ? ' course-hero__line--highlight' : ''}">${line.text}</span>`)
    .join('');

  const counts = {
    modules: course.curriculum && course.curriculum.length,
    lessons: course.curriculum && course.curriculum.reduce((sum, m) => sum + m.lessons.length, 0),
    projects: course.projects && course.projects.length
  };

  const statsHtml = (hero.stats || [])
    .map((stat) => ({ ...stat, value: stat.value || counts[stat.id] || '' }))
    .slice(0, 4)
    .map((stat) => `
      <li class="course-hero__stat course-hero__stat--${stat.id}">
        <span class="course-hero__stat-icon">${ICONS[stat.icon] || ICONS.book}</span>
        <span class="course-hero__stat-body">
          <strong class="course-hero__stat-value">${stat.value} ${stat.label}</strong>
          <small class="course-hero__stat-sublabel">${stat.sublabel || ''}</small>
        </span>
      </li>
    `).join('');

  const checklist = (hero.checklist || [])
    .map((item) => `<li>${ICONS.check}<span>${item}</span></li>`)
    .join('');

  // Floating feature badges overlapping right workspace scene
  const floats = (hero.floatingBadges || []).map((badge) => `
    <div class="course-hero__float course-hero__float--${badge.id}">
      <span class="course-hero__float-icon">${ICONS[badge.icon] || ICONS[badge.id] || ICONS.check}</span>
      <div class="course-hero__float-body">
        <strong>${badge.title}</strong>
        <small>${badge.subtitle}</small>
      </div>
    </div>
  `).join('');

  const trust = (hero.trustBar || []).map((item) => `
    <div class="course-hero__trust-item">
      <span class="course-hero__trust-icon">${ICONS[item.icon] || ICONS.star}</span>
      <span class="course-hero__trust-body">
        <strong>${item.title}</strong>
        <span>${item.subtitle}</span>
      </span>
    </div>
  `).join('');

  mount('course-hero', `
    <section class="course-hero" data-course-hero>
      <!-- Ambient decorative glow -->
      <div class="course-hero__glow course-hero__glow--top" aria-hidden="true"></div>
      <div class="course-hero__glow course-hero__glow--bottom" aria-hidden="true"></div>

      <div class="course-hero__inner">
        <div class="course-hero__main">
          <!-- Content Left Column -->
          <div class="course-hero__content">
            <div class="course-hero__badge-pill">
              <span class="course-hero__badge-dot"></span>
              <strong class="course-hero__badge-tag">${hero.badge || ('ONLINE ' + (course.category || 'COURSE').toUpperCase())}</strong>
              <span class="course-hero__badge-divider"></span>
              <span class="course-hero__badge-suffix">${hero.badgeSuffix || 'From Basics to Career-Ready'}</span>
            </div>

            <h1 class="course-hero__headline">${lines}</h1>
            <p class="course-hero__subheadline">${hero.subheadline}</p>

            <!-- 4 Metric Chips -->
            <ul class="course-hero__stats">${statsHtml}</ul>

            <!-- Action Buttons -->
            <div class="course-hero__actions">
              <a class="course-hero__primary-btn" href="${hero.primaryCta.href || '#course-explorer'}">
                <span>${hero.primaryCta.label || 'Explore Course Curriculum'}</span>
                ${ICONS.arrow}
              </a>
              <button type="button" class="course-hero__video-btn" id="open-intro-video">
                <span class="course-hero__video-btn-icon">${ICONS.play}</span>
                <span>${hero.secondaryCta.label || 'Watch Intro (2:15)'}</span>
              </button>
            </div>

            <!-- Value checklist -->
            ${checklist ? `<ul class="course-hero__checklist">${checklist}</ul>` : ''}
          </div>

          <!-- Visual Right Column -->
          <div class="course-hero__visual">
            <div class="course-hero__scene">
              <!-- Handwritten Doodle Accent -->
              <div class="course-hero__doodle" aria-hidden="true">
                <span>Small Steps Big Opportunities</span>
                <svg class="course-hero__doodle-arrow" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                  <path d="M8 28 C 16 26, 26 20, 28 8"/>
                  <polyline points="20 8 28 8 28 16"/>
                </svg>
              </div>

              <!-- Main Workspace Artwork -->
              <div class="course-hero__image-wrap">
                <div class="course-hero__image-glow" aria-hidden="true"></div>
                <img 
                  class="course-hero__image" 
                  src="${hero.image ? hero.image.src : 'assets/images/courseheader-ref.png'}" 
                  alt="${hero.image ? hero.image.alt : 'Course Workspace'}"
                  onerror="this.onerror=null;this.src='${hero.image && hero.image.fallbackSrc ? hero.image.fallbackSrc : 'assets/images/course-workspace.jpg'}';"
                >
              </div>

              <!-- Floating Feature Cards Overlapping Left of Image -->
              ${floats ? `<div class="course-hero__floats">${floats}</div>` : ''}
            </div>
          </div>
        </div>

        <!-- Full-Width Bottom Trust Card -->
        <div class="course-hero__trust-card">
          <div class="course-hero__trust-grid">${trust}</div>
        </div>
      </div>

      <!-- Video Intro Modal -->
      <div class="course-video-modal" id="course-video-modal" aria-hidden="true">
        <div class="course-video-modal__backdrop" id="close-video-backdrop"></div>
        <div class="course-video-modal__dialog">
          <div class="course-video-modal__header">
            <div class="course-video-modal__title-wrap">
              <span class="course-video-modal__tag">01. Introduction</span>
              <h3 class="course-video-modal__title">Welcome to ${course.category || course.title}</h3>
            </div>
            <button type="button" class="course-video-modal__close" id="close-video-btn" aria-label="Close video">✕</button>
          </div>
          <div class="course-video-modal__player">
            <div class="course-video-modal__screen">
              <div class="course-video-modal__play-center">
                <span class="course-video-modal__large-play">${ICONS.play}</span>
              </div>
              <div class="course-video-modal__overlay-info">
                <strong>Your journey to a successful career starts here.</strong>
                <small>Mentor Walkthrough · 02:15</small>
              </div>
            </div>
            <div class="course-video-modal__controls">
              <button type="button" class="course-video-modal__ctrl-btn">${ICONS.play}</button>
              <span class="course-video-modal__time">0:00 / 02:15</span>
              <div class="course-video-modal__progress-bar">
                <div class="course-video-modal__progress-fill"></div>
              </div>
              <span class="course-video-modal__hd">HD</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `);

  wireCourseHeroInteractions();
}

function wireCourseHeroInteractions() {
  const openVideoBtn = document.getElementById('open-intro-video');
  const modal = document.getElementById('course-video-modal');
  const closeBtn = document.getElementById('close-video-btn');
  const backdrop = document.getElementById('close-video-backdrop');

  function openModal() {
    if (modal) {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (openVideoBtn) openVideoBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

/* ---------- Refund (reuses RefundFlow) ---------- */
function renderRefund(course) {
  mount('course-refund', `
    <section class="section" id="refund" data-section="refundExplained">
      <div class="section__inner">
        ${renderRefundSection(course.refundExplained, {
          kicker: 'The part everyone asks about',
          title: 'Yes, this course refunds 100% too',
          description: 'Same rule as every course on Tutedude — finish inside 3 months, get your fee back.'
        })}
      </div>
    </section>
  `);
}

/* ---------- Panel builders (one per tab) ---------- */
function curriculumPanel(course, labels) {
  const modules = course.curriculum;

  const sidebar = modules.map((mod, i) => `
    <li>
      <button class="curriculum-module-btn${i === 0 ? ' is-active' : ''}" type="button" data-module-index="${i}">
        <span class="curriculum-module-btn__num">${String(i + 1).padStart(2, '0')}</span>
        <span class="curriculum-module-btn__icon">${ICONS[mod.icon] || ICONS.book}</span>
        <span class="curriculum-module-btn__text">
          <strong>${mod.module}</strong>
          <span>${mod.lessons.length} Topics</span>
        </span>
        ${ICONS.caret}
      </button>
    </li>
  `).join('');

  const details = modules.map((mod, i) => {
    const lessons = mod.lessons.map((lesson, li) => `
      <li class="curriculum-lesson">
        <span class="curriculum-lesson__num">${li + 1}</span>
        <span class="curriculum-lesson__body">
          <strong class="curriculum-lesson__title">${lesson.title}</strong>
          ${lesson.description ? `<span class="curriculum-lesson__description">${lesson.description}</span>` : ''}
        </span>
        <span class="curriculum-lesson__tag${li === 0 ? ' is-preview' : ''}">
          ${li === 0 ? ICONS.play : ICONS.lock}${li === 0 ? 'Preview' : 'Locked'}
        </span>
      </li>
    `).join('');

    const takeaways = (mod.takeaways || [])
      .map((t) => `<li>${ICONS.check}<span>${t}</span></li>`)
      .join('');

    return `
      <div class="curriculum-detail" data-module-detail="${i}" ${i === 0 ? '' : 'hidden'}>
        <div class="curriculum-detail__head">
          <span class="curriculum-detail__num">${String(i + 1).padStart(2, '0')}</span>
          <div>
            <h3 class="curriculum-detail__title">${mod.module}</h3>
            ${mod.summary ? `<p class="curriculum-detail__summary">${mod.summary}</p>` : ''}
          </div>
          <span class="curriculum-detail__meta">${ICONS.book}${mod.lessons.length} Topics</span>
        </div>

        <ul class="curriculum-lessons">${lessons}</ul>

        ${takeaways ? `
          <div class="curriculum-takeaways">
            <span class="curriculum-takeaways__icon">${ICONS.bulb}</span>
            <div class="curriculum-takeaways__body">
              <h4 class="curriculum-takeaways__title">${labels.takeawaysLabel}</h4>
              <ul class="curriculum-takeaways__list">${takeaways}</ul>
            </div>
            <a class="curriculum-takeaways__cta" href="${labels.enrollHref}">${labels.startLabel} ${ICONS.arrow}</a>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  return `
    <div class="curriculum-layout">
      <aside class="curriculum-modules">
        <h3 class="curriculum-modules__title">${labels.modulesLabelTemplate.replace('{count}', modules.length)}</h3>
        <ul class="curriculum-modules__list">${sidebar}</ul>
      </aside>
      <div class="curriculum-details">${details}</div>
    </div>
  `;
}

function featuresPanel(course) {
  const tools = (course.tools || []).map((tool) => `
    <div class="tools-list__item">
      <img src="${tool.logo}" alt="${tool.name} logo">
      <span>${tool.name}</span>
    </div>
  `).join('');

  return `
    <div class="feature-grid">${renderFeatureGrid(course.whatYouGet)}</div>
    ${tools ? `
      <div class="tools-card">
        <h3 class="tools-card__title">Tools You Will Use</h3>
        <p class="tools-card__subtitle">Real tools used throughout the course, not just talked about.</p>
        <div class="tools-list">${tools}</div>
      </div>
    ` : ''}
  `;
}

function projectsPanel(course) {
  const cards = course.projects.map((project, i) => {
    const skills = (project.skills || []).map((s) => `<li>${s}</li>`).join('');
    return `
      <article class="project-card">
        <span class="project-card__index">Project ${String(i + 1).padStart(2, '0')}</span>
        <h3 class="project-card__title">${project.title}</h3>
        <p class="project-card__description">${project.description}</p>
        ${skills ? `<ul class="project-card__skills">${skills}</ul>` : ''}
      </article>
    `;
  }).join('');

  return `<div class="project-grid">${cards}</div>`;
}

function certificationPanel(course) {
  return `
    <div class="info-cards">
      <div class="info-card">
        <span class="info-card__icon">${ICONS.certificate}</span>
        <div>
          <h3 class="info-card__title">${course.certificate.title}</h3>
          <p class="info-card__description">${course.certificate.description}</p>
        </div>
      </div>
      <div class="info-card">
        <span class="info-card__icon">${ICONS.mentor}</span>
        <div>
          <h3 class="info-card__title">${course.mentor.role}</h3>
          <p class="info-card__description">${course.mentor.bio}</p>
        </div>
      </div>
    </div>
  `;
}

function faqsPanel(course) {
  return `<div class="faq-list">${renderFaqList(course.faq)}</div>`;
}

/* ---------- Tabbed course explorer ---------- */
function renderCourseExplorer(course) {
  const labels = course.curriculumSection;
  if (!labels) return;

  const builders = {
    curriculum: () => (course.curriculum && course.curriculum.length ? curriculumPanel(course, labels) : null),
    features: () => (course.whatYouGet && course.whatYouGet.length ? featuresPanel(course) : null),
    projects: () => (course.projects && course.projects.length ? projectsPanel(course) : null),
    certification: () => (course.certificate && course.mentor ? certificationPanel(course) : null),
    faqs: () => (course.faq && course.faq.length ? faqsPanel(course) : null)
  };

  // Only tabs whose panel has real content survive — no empty tabs.
  const panels = labels.tabs
    .map((tab) => ({ tab, html: builders[tab.id] ? builders[tab.id]() : null }))
    .filter((p) => p.html);
  if (!panels.length) return;

  const tabsHtml = panels.map((p, i) => `
    <button class="course-tab${i === 0 ? ' is-active' : ''}" type="button" data-tab="${p.tab.id}">
      ${ICONS[p.tab.icon] || ''}<span>${p.tab.label}</span>
    </button>
  `).join('');

  const panelsHtml = panels.map((p, i) => `
    <div class="course-panel${i === 0 ? ' is-active' : ''}" data-panel="${p.tab.id}">${p.html}</div>
  `).join('');

  const highlights = (course.courseHighlights || []).map((h) => `
    <div class="course-highlight">
      <span class="course-highlight__icon">${ICONS[h.id] || ICONS.check}</span>
      <span>
        <strong>${h.title}</strong>
        <span>${h.subtitle}</span>
      </span>
    </div>
  `).join('');

  // No section header here: in the reference the tab bar is the top of the
  // card and the hero's headline already names the course.
  const el = mount('course-explorer', `
    <section class="course-explorer" data-section="courseExplorer">
      <div class="course-explorer__card">
        <div class="course-tabs-bar">
          <div class="course-tabs">${tabsHtml}</div>
          <a class="course-tabs-bar__enroll" href="${labels.enrollHref}">${labels.enrollLabel} ${ICONS.arrow}</a>
        </div>

        ${panelsHtml}
        ${highlights ? `<div class="course-highlights">${highlights}</div>` : ''}
      </div>
    </section>
  `);

  if (el) wireCourseExplorer(el);
}

function wireCourseExplorer(root) {
  root.querySelectorAll('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.tab;
      root.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('is-active', b === button));
      root.querySelectorAll('[data-panel]').forEach((p) => p.classList.toggle('is-active', p.dataset.panel === id));
    });
  });

  root.querySelectorAll('[data-module-index]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = button.dataset.moduleIndex;
      root.querySelectorAll('[data-module-index]').forEach((b) => b.classList.toggle('is-active', b === button));
      root.querySelectorAll('[data-module-detail]').forEach((d) => {
        d.hidden = d.dataset.moduleDetail !== index;
      });
    });
  });

  const faqRoot = root.querySelector('[data-panel="faqs"]');
  if (faqRoot) wireFaqAccordion(faqRoot);
}

/* ---------- Pricing (reuses PricingCard grid) ---------- */
// Builds the "This Course Only" card in the same rich shape as the
// homepage's combo/all-access packs — using this course's own real
// content (its own What You Get list), not invented copy.
function buildSingleCoursePlan(course) {
  const single = course.pricing.plans.find((p) => p.id === 'single') || course.pricing.plans[0];
  const features = (course.whatYouGet || []).slice(0, 4).map((item) => item.title);
  return {
    title: single.title,
    tagline: course.category,
    icon: CATEGORY_ICONS[course.id] || 'book',
    description: single.description,
    priceNote: single.priceNote,
    features,
    cta: single.cta
  };
}

function renderPricing(course) {
  const combos = course._combos;
  const singlePlan = buildSingleCoursePlan(course);
  const comboPlan = combos && combos.customPack;
  const allAccessPlan = combos && combos.allAccess;

  const cards = [
    renderHighlightPack(singlePlan, 'single'),
    comboPlan ? renderHighlightPack(comboPlan, 'custom') : '',
    allAccessPlan ? renderHighlightPack(allAccessPlan, 'all') : ''
  ].join('');

  mount('course-pricing', `
    <section class="section section--alt" id="pricing" data-section="pricing">
      <div class="section__inner">
        ${sectionHeader({ kicker: 'Choose your plan', title: 'Enroll in This Challenge', description: 'The same 100% refund rule runs on every plan.' })}
        <div class="pack-highlight-grid pack-highlight-grid--three">${cards}</div>
      </div>
    </section>
  `);
}

/* ---------- Final CTA (reuses CTASection) ---------- */
function renderCourseFinalCta(course) {
  mount('course-final-cta', `
    <section class="section" data-section="finalCta">
      <div class="section__inner">
        <div class="cta-section">
          <h2 class="cta-section__title">${course.finalCta.title}</h2>
          <p class="cta-section__description">${course.finalCta.description}</p>
          <a class="cta-section__button" href="${course.finalCta.primaryCta.href}">${course.finalCta.primaryCta.label} ${ICONS.arrow}</a>
        </div>
      </div>
    </section>
  `);
}

export async function renderCoursePage() {
  const course = await loadCourseData(getCourseId());
  document.title = `${course.title} — Tutedude`;

  renderCourseHero(course);
  renderCourseExplorer(course);
  renderRefund(course);
  renderPricing(course);
  renderCourseFinalCta(course);
}

document.addEventListener('DOMContentLoaded', () => {
  renderCoursePage();
});
