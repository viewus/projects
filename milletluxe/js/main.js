/*!
 * MilletLuxe — page-level rendering
 * Reads JSON from /data and renders reusable card markup.
 * Runs after components.js has mounted the header/footer.
 */
(function () {
  "use strict";
  const { escape } = window.MLRender;

  const stars = (n) => {
    const full = "★".repeat(Math.round(n));
    const empty = "☆".repeat(5 - Math.round(n));
    return full + empty;
  };

  /* ---------------- variety card (click opens the detail popup) ---------------- */
  function varietyCard(v) {
    return `
    <div class="card variety-open" data-id="${v.id}" data-aos="fade-up" role="button" tabindex="0">
      <div class="card-media">
        <img src="${v.image}" alt="${escape(v.name)} grain" loading="lazy" />
        <span class="card-tag">${escape(v.tag)}</span>
        <div class="glass-overlay">${Object.entries(v.nutrition).slice(0, 3).map(([k, val]) => `<span>${escape(k)} ${escape(val)}</span>`).join("")}</div>
      </div>
      <div class="card-body">
        <div class="card-meta"><i class="fa-solid fa-location-dot"></i> ${escape(v.region)}</div>
        <h3>${escape(v.name)} <small style="font-family:var(--font-body); font-weight:600; color:var(--clr-ink-soft); font-size:.75rem;">(${escape(v.local)})</small></h3>
        <p class="card-desc">${escape(v.summary)}</p>
        <span class="card-link">View details <i class="fa-solid fa-arrow-right"></i></span>
      </div>
    </div>`;
  }

  /* ---------------- full variety card (varieties.html) — same click-to-popup behavior ---------------- */
  function varietyCardFull(v) {
    return `
    <div class="card variety-open" id="${v.id}" data-id="${v.id}" data-aos="fade-up" data-category="${escape(v.tag)}" role="button" tabindex="0">
      <div class="card-media">
        <img src="${v.image}" alt="${escape(v.name)} grain" loading="lazy" />
        <span class="card-tag">${escape(v.tag)}</span>
        <div class="glass-overlay">${Object.entries(v.nutrition).slice(0, 3).map(([k, val]) => `<span>${escape(k)} ${escape(val)}</span>`).join("")}</div>
      </div>
      <div class="card-body">
        <div class="card-meta"><i class="fa-solid fa-location-dot"></i> ${escape(v.region)}</div>
        <h3>${escape(v.name)} <small style="font-family:var(--font-body); font-weight:600; color:var(--clr-ink-soft); font-size:.75rem;">(${escape(v.local)})</small></h3>
        <p class="card-desc">${escape(v.summary)}</p>
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin:14px 0;">
          ${Object.entries(v.nutrition).map(([k, val]) => `<span style="font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.03em; background:var(--clr-cream-deep); color:var(--clr-olive); padding:5px 10px; border-radius:4px;">${escape(k)}: ${escape(val)}</span>`).join("")}
        </div>
        <p class="card-desc"><strong>Common uses:</strong> ${v.uses.map(escape).join(", ")}</p>
        <span class="card-link">View full details <i class="fa-solid fa-arrow-right"></i></span>
      </div>
    </div>`;
  }

  /* ---------------- variety detail popup content (with related recipes cross-link) ---------------- */
  function varietyDetailHTML(v, recipes) {
    const related = (recipes || []).filter((r) => r.millet.includes(v.name) || v.name.includes(r.millet));
    return `
      <img src="${v.image}" alt="${escape(v.name)} grain" style="width:100%; border-radius:4px; margin-bottom:20px; aspect-ratio:16/9; object-fit:cover;" />
      <span class="eyebrow">${escape(v.tag)} · ${escape(v.region)}</span>
      <h2>${escape(v.name)} <small style="font-family:var(--font-body); font-weight:600; color:var(--clr-ink-soft); font-size:.85rem;">(${escape(v.local)})</small></h2>
      <p class="lede">${escape(v.description || v.summary)}</p>
      <div style="display:flex; flex-wrap:wrap; gap:16px; margin:18px 0; font-size:.85rem; color:var(--clr-ink-soft);">
        <span><i class="fa-solid fa-location-dot" style="color:var(--clr-gold);"></i> ${escape(v.region)}</span>
        ${v.season ? `<span><i class="fa-solid fa-calendar" style="color:var(--clr-gold);"></i> ${escape(v.season)}</span>` : ""}
      </div>
      <h4>Nutrition (per 100g)</h4>
      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:18px;">
        ${Object.entries(v.nutrition).map(([k, val]) => `<span style="font-size:.74rem; font-weight:700; text-transform:uppercase; letter-spacing:.03em; background:var(--clr-cream-deep); color:var(--clr-olive); padding:6px 12px; border-radius:4px;">${escape(k)}: ${escape(val)}</span>`).join("")}
      </div>
      <h4>Common Uses</h4>
      <ul style="display:grid; gap:8px; margin-bottom:${related.length ? "18px" : "0"};">${v.uses.map((u) => `<li><i class="fa-solid fa-check" style="color:var(--clr-gold); margin-right:8px;"></i>${escape(u)}</li>`).join("")}</ul>
      ${related.length ? `
      <h4>Recipes With This Grain</h4>
      <div style="display:grid; gap:10px;">
        ${related.map((r) => `<a href="recipes.html#${r.id}" class="card-link" style="justify-content:space-between; background:var(--clr-cream-deep); padding:10px 14px; border-radius:4px;">${escape(r.title)} <i class="fa-solid fa-arrow-right"></i></a>`).join("")}
      </div>` : ""}
    `;
  }

  function initVarietyModal(varieties, recipes) {
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest(".variety-open");
      if (!trigger) return;
      const v = varieties.find((x) => x.id === trigger.getAttribute("data-id"));
      if (!v || !window.MLDetailModal) return;
      window.MLDetailModal.open(varietyDetailHTML(v, recipes));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const trigger = e.target.closest && e.target.closest(".variety-open");
      if (!trigger) return;
      e.preventDefault();
      trigger.click();
    });

    // deep link support: varieties.html#pearl opens that variety's popup automatically
    const hashId = location.hash.replace("#", "");
    if (hashId) {
      const v = varieties.find((x) => x.id === hashId);
      if (v && window.MLDetailModal) window.MLDetailModal.open(varietyDetailHTML(v, recipes));
    }
  }

  /* ---------------- recipe card ---------------- */
  function recipeCard(r) {
    return `
    <div class="card" data-aos="fade-up" data-category="${escape(r.category)}">
      <div class="card-media">
        <img src="${r.image}" alt="${escape(r.title)}" loading="lazy" />
        <span class="card-tag">${escape(r.category)}</span>
      </div>
      <div class="card-body">
        <div class="card-meta"><i class="fa-solid fa-clock"></i> ${escape(r.time)} &nbsp;•&nbsp; <i class="fa-solid fa-gauge"></i> ${escape(r.difficulty)}</div>
        <h3>${escape(r.title)}</h3>
        <p class="card-desc">${escape(r.summary)}</p>
        <button type="button" class="card-link recipe-open" data-id="${r.id}" style="background:none;border:none;padding:0;">View recipe <i class="fa-solid fa-arrow-right"></i></button>
      </div>
    </div>`;
  }

  /* ---------------- testimonial card ---------------- */
  function testimonialCard(t) {
    return `
    <div class="testi-card" data-aos="fade-up">
      <div class="testi-stars">${stars(t.rating)}</div>
      <p class="testi-quote">&ldquo;${escape(t.quote)}&rdquo;</p>
      <div class="testi-person">
        <img src="${t.avatar}" alt="${escape(t.name)}" loading="lazy" />
        <div><strong>${escape(t.name)}</strong><span>${escape(t.role)}</span></div>
      </div>
    </div>`;
  }

  /* ---------------- FAQ accordion item ---------------- */
  function faqItem(item, idx) {
    return `
    <div class="acc-item ${idx === 0 ? "is-open" : ""}" id="faq-${idx}">
      <button type="button" class="acc-trigger"><span>${escape(item.q)}</span><i class="fa-solid fa-plus"></i></button>
      <div class="acc-panel" style="${idx === 0 ? "" : "max-height:0;"}">
        <div class="acc-panel-inner">${escape(item.a)}</div>
      </div>
    </div>`;
  }

  /* ---------------- gallery item ---------------- */
  function galleryItem(g) {
    return `
    <a href="${g.src}" class="gallery-item" data-category="${escape(g.category)}" data-aos="zoom-in" data-fancy data-fancy-group="gallery" data-caption="${escape(g.caption)}">
      <img src="${g.src}" alt="${escape(g.caption)}" loading="lazy" />
      <div class="gallery-caption"><i class="fa-solid fa-expand"></i> ${escape(g.caption)}</div>
    </a>`;
  }

  async function renderInto(id, dataPath, mapFn, limit) {
    const mount = document.getElementById(id);
    if (!mount) return null;
    try {
      const data = await window.MLData.load(dataPath);
      const items = limit ? data.slice(0, limit) : data;
      mount.innerHTML = items.map(mapFn).join("");
      window.MLRefreshReveal();
      return data;
    } catch (e) {
      mount.innerHTML = `<p class="card-desc">Content is temporarily unavailable. Please refresh.</p>`;
      console.error(e);
      return null;
    }
  }

  /* ---------------- index.html: every section rendered from site.json ---------------- */
  function renderIndexContent(site) {
    const p = site.pages.index;
    if (!p) return;

    const hero = document.getElementById("heroMount");
    if (hero) {
      const images = p.hero.images || [p.hero.image];
      hero.innerHTML = `
        ${images.map((src, i) => `<img class="hero-bg-slide ${i === 0 ? "is-active" : ""}" src="${src}" alt="Millet fields and grain" />`).join("")}
        <div class="hero-glow gold"></div>
        <div class="hero-glow olive"></div>
        <div class="container hero-content">
          <span class="eyebrow">${escape(p.hero.eyebrow)}</span>
          <h1>${escape(p.hero.titleLine1)}<br>${escape(p.hero.titleLine2)}</h1>
          <p>${escape(p.hero.text)}</p>
          <div class="hero-actions">
            <a href="${p.hero.primaryCta.href}" class="btn btn-gold">${escape(p.hero.primaryCta.label)} <i class="fa-solid fa-arrow-right"></i></a>
            <a href="${p.hero.secondaryCta.href}" class="btn btn-outline" style="color:#fff; border-color:rgba(255,255,255,.5);">${escape(p.hero.secondaryCta.label)}</a>
          </div>
          <div class="hero-stats glass">
            ${p.hero.stats.map((s) => `<div class="hero-stat"><b data-count>${escape(s.value)}</b><span>${escape(s.label)}</span></div>`).join("")}
          </div>
          <div class="hero-variety-strip" id="heroVarietyStrip"></div>
        </div>
        ${images.length > 1 ? `<div class="hero-bg-dots">${images.map((_, i) => `<button type="button" data-i="${i}" class="${i === 0 ? "active" : ""}" aria-label="Slide ${i + 1}"></button>`).join("")}</div>` : ""}`;

      if (images.length > 1) initHeroCarousel(hero, images.length);
    }

    const intro = document.getElementById("introMount");
    if (intro) {
      intro.innerHTML = `
        <div class="container split">
          <div data-aos="fade-right">
            <span class="eyebrow">${escape(p.intro.eyebrow)}</span>
            <h2>${escape(p.intro.title)}</h2>
            <p class="lede">${escape(p.intro.text)}</p>
            <div class="feature-list">
              ${p.intro.features.map((f) => `<div class="feature-item"><div class="ico"><i class="${f.icon}"></i></div><div><h4>${escape(f.title)}</h4><p>${escape(f.text)}</p></div></div>`).join("")}
            </div>
          </div>
          <div class="split-media ratio" data-aos="fade-left">
            <img src="${p.intro.image}" alt="Farmer winnowing millet grain by hand" />
            <div class="badge-float"><i class="${p.intro.badge.icon}"></i><div><strong>${escape(p.intro.badge.title)}</strong><small>${escape(p.intro.badge.text)}</small></div></div>
          </div>
        </div>`;
    }

    const vs = document.getElementById("varietiesSectionMount");
    if (vs) {
      vs.innerHTML = `<span class="eyebrow">${escape(p.varietiesSection.eyebrow)}</span><h2>${escape(p.varietiesSection.title)}</h2><p class="lede">${escape(p.varietiesSection.text)}</p>`;
    }
    const vsCta = document.getElementById("varietiesSectionCta");
    if (vsCta) vsCta.innerHTML = `<a href="${p.varietiesSection.cta.href}" class="btn btn-primary">${escape(p.varietiesSection.cta.label)} <i class="fa-solid fa-arrow-right"></i></a>`;

    const stats = document.getElementById("statsMount");
    if (stats) {
      stats.innerHTML = p.stats
        .map((s, i) => `<div class="stat-box" data-aos="zoom-in" data-aos-delay="${i * 80}"><b data-count>${escape(s.value)}</b><span>${escape(s.label)}</span></div>`)
        .join("");
    }

    const sourcing = document.getElementById("sourcingMount");
    if (sourcing) {
      sourcing.innerHTML = `
        <div class="container split">
          <div class="split-media ratio" data-aos="fade-right"><img src="${p.sourcingSection.image}" alt="Farmer inspecting the season's millet crop" /></div>
          <div data-aos="fade-left">
            <span class="eyebrow">${escape(p.sourcingSection.eyebrow)}</span>
            <h2>${escape(p.sourcingSection.title)}</h2>
            <p class="lede">${escape(p.sourcingSection.text)}</p>
            <a href="${p.sourcingSection.cta.href}" class="card-link" style="font-size:.9rem;">${escape(p.sourcingSection.cta.label)} <i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </div>`;
    }

    const rs = document.getElementById("recipesSectionMount");
    if (rs) rs.innerHTML = `<span class="eyebrow">${escape(p.recipesSection.eyebrow)}</span><h2>${escape(p.recipesSection.title)}</h2><p class="lede">${escape(p.recipesSection.text)}</p>`;
    const rsCta = document.getElementById("recipesSectionCta");
    if (rsCta) rsCta.innerHTML = `<a href="${p.recipesSection.cta.href}" class="btn btn-primary">${escape(p.recipesSection.cta.label)} <i class="fa-solid fa-arrow-right"></i></a>`;

    const ts = document.getElementById("testimonialsSectionMount");
    if (ts) ts.innerHTML = `<span class="eyebrow">${escape(p.testimonialsSection.eyebrow)}</span><h2>${escape(p.testimonialsSection.title)}</h2>`;

    const cta = document.getElementById("ctaBandMount");
    if (cta) {
      cta.dataset.filled = "1";
      cta.innerHTML = `
        <img src="${p.ctaBand.image}" alt="" />
        <div class="inner">
          <span class="eyebrow">${escape(p.ctaBand.eyebrow)}</span>
          <h2>${escape(p.ctaBand.title)}</h2>
          <p style="color:rgba(255,255,255,.85);">${escape(p.ctaBand.text)}</p>
          <a href="${p.ctaBand.cta.href}" class="btn btn-gold">${escape(p.ctaBand.cta.label)} <i class="fa-solid fa-arrow-right"></i></a>
        </div>`;
    }

    window.MLRefreshReveal();
  }

  /* ---------------- hero background carousel (auto-advance + dots) ---------------- */
  function initHeroCarousel(root, count) {
    const slides = root.querySelectorAll(".hero-bg-slide");
    const dots = root.querySelectorAll(".hero-bg-dots button");
    let current = 0;
    let timer;

    function go(i) {
      current = (i + count) % count;
      slides.forEach((s, idx) => s.classList.toggle("is-active", idx === current));
      dots.forEach((d, idx) => d.classList.toggle("active", idx === current));
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(() => go(current + 1), 6000);
    }
    dots.forEach((d) => d.addEventListener("click", () => { go(Number(d.getAttribute("data-i"))); restart(); }));
    restart();
  }

  /* ---------------- marquee ticker of millet varieties ---------------- */
  function renderMarquee(varieties) {
    const mount = document.getElementById("marqueeMount");
    if (!mount) return;
    const items = varieties
      .map((v) => `<span class="marquee-item"><i class="fa-solid fa-wheat-awn"></i>${escape(v.name)} <span style="opacity:.6; font-weight:400;">(${escape(v.local)})</span></span><span class="sep">&#9670;</span>`)
      .join("");
    mount.innerHTML = `<div class="marquee-track">${items}${items}</div>`;
  }

  /* ---------------- hero variety chip strip (showcases every millet up front) ---------------- */
  function renderHeroVarietyStrip(varieties) {
    const mount = document.getElementById("heroVarietyStrip");
    if (!mount) return;
    mount.innerHTML = `
      <div class="strip-label">Shop the Harvest</div>
      <div class="variety-chip-row">
        ${varieties
          .map((v) => `<a href="varieties.html#${v.id}" class="variety-chip glass"><img src="${v.image}" alt="${escape(v.name)}" loading="lazy" />${escape(v.name)}</a>`)
          .join("")}
      </div>`;
    window.MLRefreshReveal();
  }

  /* ---------------- reusable carousel builder (used for testimonials) ---------------- */
  function buildCarousel(mountId, items, cardFn, autoplayMs) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    const perView = () => (window.innerWidth > 780 ? 3 : window.innerWidth > 560 ? 2 : 1);
    const dotCount = Math.max(1, items.length - perView() + 1);
    const slides = items.map((it) => `<div class="carousel-slide">${cardFn(it)}</div>`).join("");
    mount.innerHTML = `
      <div class="carousel">
        <div class="carousel-viewport"><div class="carousel-track">${slides}</div></div>
        <div class="carousel-controls">
          <button type="button" class="carousel-arrow prev" aria-label="Previous"><i class="fa-solid fa-arrow-left"></i></button>
          <div class="carousel-dots">${Array.from({ length: dotCount }, (_, i) => `<button type="button" class="carousel-dot ${i === 0 ? "active" : ""}" data-i="${i}" aria-label="Slide ${i + 1}"></button>`).join("")}</div>
          <button type="button" class="carousel-arrow next" aria-label="Next"><i class="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>`;
    window.MLRefreshReveal();

    const track = mount.querySelector(".carousel-track");
    const dots = mount.querySelectorAll(".carousel-dot");
    let index = 0;
    let timer;

    function maxIndex() {
      return Math.max(0, items.length - perView());
    }
    function go(i) {
      index = Math.min(Math.max(i, 0), maxIndex());
      track.style.transform = `translateX(-${index * (100 / perView())}%)`;
      dots.forEach((d, di) => d.classList.toggle("active", di === index));
    }
    function restart() {
      if (!autoplayMs) return;
      clearInterval(timer);
      timer = setInterval(() => go(index + 1 > maxIndex() ? 0 : index + 1), autoplayMs);
    }
    mount.querySelector(".carousel-arrow.prev").addEventListener("click", () => { go(index - 1 < 0 ? maxIndex() : index - 1); restart(); });
    mount.querySelector(".carousel-arrow.next").addEventListener("click", () => { go(index + 1 > maxIndex() ? 0 : index + 1); restart(); });
    dots.forEach((d) => d.addEventListener("click", () => { go(Number(d.getAttribute("data-i"))); restart(); }));
    window.addEventListener("resize", () => go(index));

    // swipe / drag support
    const viewport = mount.querySelector(".carousel-viewport");
    let startX = 0, dragging = false;
    viewport.addEventListener("pointerdown", (e) => { dragging = true; startX = e.clientX; clearInterval(timer); });
    viewport.addEventListener("pointerup", (e) => {
      if (!dragging) return;
      dragging = false;
      const delta = e.clientX - startX;
      if (delta < -40) go(index + 1 > maxIndex() ? 0 : index + 1);
      else if (delta > 40) go(index - 1 < 0 ? maxIndex() : index - 1);
      restart();
    });
    viewport.addEventListener("pointerleave", () => { dragging = false; });

    go(0);
    restart();
  }

  /* ---------------- generic intro block (eyebrow + title + text), reused across pages ---------------- */
  function renderIntroBlock(mountId, data) {
    const el = document.getElementById(mountId);
    if (!el || !data) return;
    el.innerHTML = `<span class="eyebrow">${escape(data.eyebrow)}</span><h2>${escape(data.title)}</h2>${data.text ? `<p class="lede">${escape(data.text)}</p>` : ""}`;
  }

  /* ---------------- about.html ---------------- */
  function renderAbout(site) {
    const p = site.pages.about;
    if (!p) return;
    const story = document.getElementById("storyMount");
    if (story) {
      story.innerHTML = `
        <div class="container split">
          <div data-aos="fade-right">
            <span class="eyebrow">${escape(p.story.eyebrow)}</span>
            <h2>${escape(p.story.title)}</h2>
            ${p.story.paragraphs.map((t) => `<p class="lede">${escape(t)}</p>`).join("")}
          </div>
          <div class="split-media ratio" data-aos="fade-left">
            <img src="${p.story.image}" alt="Farmer collective at work" />
            <div class="badge-float"><i class="${p.story.badge.icon}"></i><div><strong>${escape(p.story.badge.title)}</strong><small>${escape(p.story.badge.text)}</small></div></div>
          </div>
        </div>`;
    }
    const valuesHead = document.getElementById("valuesHeadMount");
    if (valuesHead) renderIntroBlock("valuesHeadMount", p.values);
    const values = document.getElementById("valuesMount");
    if (values) {
      values.innerHTML = p.values.items
        .map(
          (v, i) => `
        <div class="info-card" data-aos="fade-up" data-aos-delay="${i * 60}">
          <i class="${v.icon}"></i>
          <div><h4>${escape(v.title)}</h4><p>${escape(v.text)}</p></div>
        </div>`
        )
        .join("");
    }
    const teamHead = document.getElementById("teamHeadMount");
    if (teamHead) renderIntroBlock("teamHeadMount", p.team);
    const team = document.getElementById("teamMount");
    if (team) {
      team.innerHTML = p.team.members
        .map(
          (m, i) => `
        <div class="card text-center" data-aos="fade-up" data-aos-delay="${i * 60}">
          <div class="card-media" style="aspect-ratio:1/1;"><img src="${m.image}" alt="${escape(m.name)}" loading="lazy" /></div>
          <div class="card-body"><h3 style="font-size:1rem;">${escape(m.name)}</h3><span style="font-size:.78rem; color:var(--clr-gold); text-transform:uppercase; letter-spacing:.05em;">${escape(m.role)}</span></div>
        </div>`
        )
        .join("");
    }
    window.MLRefreshReveal();
  }

  /* ---------------- nutrition.html: insights derived from real variety data (no invented claims) ---------------- */
  function renderNutritionInsights(varieties) {
    const mount = document.getElementById("insightsMount");
    if (!mount) return;

    const parse = (val) => parseFloat(String(val).match(/[\d.]+/)?.[0] || "0");
    const topBy = (field, label, icon, suffix) => {
      const ranked = [...varieties].sort((a, b) => parse(b.nutrition[field]) - parse(a.nutrition[field]));
      const winner = ranked[0];
      return { icon, label, value: winner.nutrition[field], variety: winner.name, suffix };
    };
    const lowestCalorie = [...varieties].sort((a, b) => parse(a.nutrition.calories) - parse(b.nutrition.calories))[0];

    const insights = [
      topBy("fiber", "Highest in Fiber", "fa-solid fa-leaf"),
      topBy("iron", "Highest in Iron", "fa-solid fa-dumbbell"),
      topBy("protein", "Highest in Protein", "fa-solid fa-drumstick-bite"),
      { icon: "fa-solid fa-fire", label: "Lightest on Calories", value: lowestCalorie.nutrition.calories, variety: lowestCalorie.name },
    ];

    mount.innerHTML = insights
      .map(
        (ins, i) => `
      <div class="insight-card" data-aos="fade-up" data-aos-delay="${i * 70}">
        <i class="${ins.icon}"></i>
        <b data-count>${escape(ins.value)}</b>
        <div class="insight-label">${escape(ins.label)}</div>
        <div class="insight-variety">${escape(ins.variety)}</div>
      </div>`
      )
      .join("");
    window.MLRefreshReveal();
  }

  /* ---------------- nutrition.html ---------------- */
  function renderNutrition(site) {
    const p = site.pages.nutrition;
    if (!p) return;
    const intro = document.getElementById("nutritionIntroMount");
    if (intro) {
      intro.innerHTML = `
        <div class="container split">
          <div data-aos="fade-right">
            <span class="eyebrow">${escape(p.intro.eyebrow)}</span>
            <h2>${escape(p.intro.title)}</h2>
            <p class="lede">${escape(p.intro.text)}</p>
          </div>
          <div class="split-media ratio" data-aos="fade-left">
            <img src="${p.intro.image}" alt="Foxtail millet grains" />
            <div class="badge-float"><i class="${p.intro.badge.icon}"></i><div><strong>${escape(p.intro.badge.title)}</strong><small>${escape(p.intro.badge.text)}</small></div></div>
          </div>
        </div>`;
    }
    renderIntroBlock("comparisonHeadMount", p.comparison);
    renderIntroBlock("insightsHeadMount", p.insights);
    initNutritionChart(p.comparison);
    const table = document.getElementById("comparisonMount");
    if (table) {
      table.innerHTML = `
        <table class="compare-table">
          <thead><tr><th></th><th>Millets</th><th>Polished Rice</th><th>Refined Wheat</th></tr></thead>
          <tbody>
            ${p.comparison.rows.map((r) => `<tr><td>${escape(r.label)}</td><td class="highlight">${escape(r.millet)}</td><td>${escape(r.rice)}</td><td>${escape(r.wheat)}</td></tr>`).join("")}
          </tbody>
        </table>`;
    }
    renderIntroBlock("benefitsHeadMount", p.benefits);
    const benefits = document.getElementById("benefitsMount");
    if (benefits) {
      benefits.innerHTML = p.benefits.items
        .map((b, i) => `<div class="feature-item" data-aos="fade-up" data-aos-delay="${i * 60}"><div class="ico"><i class="${b.icon}"></i></div><div><h4>${escape(b.title)}</h4><p>${escape(b.text)}</p></div></div>`)
        .join("");
    }
    const disclaimer = document.getElementById("disclaimerMount");
    if (disclaimer) disclaimer.textContent = p.disclaimer;
    window.MLRefreshReveal();
  }

  /* ---------------- interactive nutrition comparison chart (signature feature) ---------------- */
  function parseComparisonScore(str) {
    const num = String(str).match(/[\d.]+/);
    if (num) return parseFloat(num[0]);
    const words = { low: 1, medium: 2, high: 3 };
    const matches = String(str).toLowerCase().match(/low|medium|high/g) || [];
    if (!matches.length) return 0;
    return matches.reduce((sum, w) => sum + words[w], 0) / matches.length;
  }

  function initNutritionChart(comparison) {
    const mount = document.getElementById("nutritionChart");
    if (!mount || !comparison) return;
    const rows = comparison.rows;

    mount.innerHTML = `
      <div class="chart-tabs" id="chartTabs">
        ${rows.map((r, i) => `<button type="button" class="tab-btn chart-tab ${i === 0 ? "active" : ""}" data-i="${i}">${escape(r.label)}</button>`).join("")}
      </div>
      <div class="chart-panel" data-aos="fade-up">
        <div class="chart-row"><span class="chart-label">Millets</span><div class="chart-track"><div class="chart-fill millet" id="fillMillet"></div></div><span class="chart-value" id="valMillet"></span></div>
        <div class="chart-row"><span class="chart-label">Polished Rice</span><div class="chart-track"><div class="chart-fill rice" id="fillRice"></div></div><span class="chart-value" id="valRice"></span></div>
        <div class="chart-row"><span class="chart-label">Refined Wheat</span><div class="chart-track"><div class="chart-fill wheat" id="fillWheat"></div></div><span class="chart-value" id="valWheat"></span></div>
        <div class="chart-legend">
          <span><i class="millet"></i>Millets</span>
          <span><i class="rice"></i>Polished Rice</span>
          <span><i class="wheat"></i>Refined Wheat</span>
        </div>
      </div>`;

    function paint(i) {
      const r = rows[i];
      const scores = { millet: parseComparisonScore(r.millet), rice: parseComparisonScore(r.rice), wheat: parseComparisonScore(r.wheat) };
      const max = Math.max(scores.millet, scores.rice, scores.wheat, 0.001);
      const fills = { millet: document.getElementById("fillMillet"), rice: document.getElementById("fillRice"), wheat: document.getElementById("fillWheat") };
      const vals = { millet: document.getElementById("valMillet"), rice: document.getElementById("valRice"), wheat: document.getElementById("valWheat") };
      // reset to 0 first so the width transition re-triggers on every tab switch
      Object.values(fills).forEach((f) => { f.style.width = "0%"; });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fills.millet.style.width = (scores.millet / max) * 100 + "%";
          fills.rice.style.width = (scores.rice / max) * 100 + "%";
          fills.wheat.style.width = (scores.wheat / max) * 100 + "%";
        });
      });
      vals.millet.textContent = r.millet;
      vals.rice.textContent = r.rice;
      vals.wheat.textContent = r.wheat;
    }

    mount.querySelectorAll(".chart-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        mount.querySelectorAll(".chart-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        paint(Number(tab.getAttribute("data-i")));
      });
    });

    paint(0);
    window.MLRefreshReveal();
  }

  /* ---------------- sourcing.html ---------------- */
  function renderSourcing(site) {
    const p = site.pages.sourcing;
    if (!p) return;
    const intro = document.getElementById("sourcingIntroMount");
    if (intro) {
      intro.innerHTML = `
        <div class="container split">
          <div class="split-media ratio" data-aos="fade-right"><img src="${p.intro.image}" alt="Farmer hands with grain" /></div>
          <div data-aos="fade-left">
            <span class="eyebrow">${escape(p.intro.eyebrow)}</span>
            <h2>${escape(p.intro.title)}</h2>
            <p class="lede">${escape(p.intro.text)}</p>
          </div>
        </div>`;
    }
    renderIntroBlock("processHeadMount", p.process);
    const process = document.getElementById("processMount");
    if (process) {
      process.innerHTML = p.process.steps
        .map(
          (s, i) => `
        <div class="info-card" data-aos="fade-up" data-aos-delay="${i * 60}">
          <i class="${s.icon}"></i>
          <div><h4>${i + 1}. ${escape(s.title)}</h4><p>${escape(s.text)}</p></div>
        </div>`
        )
        .join("");
    }
    renderIntroBlock("regionsHeadMount", p.regions);
    const regions = document.getElementById("regionsMount");
    if (regions) {
      regions.innerHTML = p.regions.items
        .map(
          (r, i) => `
        <div class="card" data-aos="fade-up" data-aos-delay="${i * 60}">
          <div class="card-media" style="aspect-ratio:1/1;"><img src="${r.image}" alt="${escape(r.name)}" loading="lazy" /></div>
          <div class="card-body"><h3 style="font-size:1.05rem;">${escape(r.name)}</h3><p class="card-desc">${escape(r.grain)}</p></div>
        </div>`
        )
        .join("");
    }
    window.MLRefreshReveal();
  }

  /* ---------------- contact.html ---------------- */
  function renderContact(site) {
    const p = site.pages.contact;
    if (!p) return;
    renderIntroBlock("contactIntroMount", p.intro);
    const info = document.getElementById("contactInfoMount");
    if (info) {
      info.innerHTML = p.info
        .map((c) => `<div class="info-card" data-aos="fade-up"><i class="${c.icon}"></i><div><h4>${escape(c.title)}</h4><p>${escape(c.text)}</p></div></div>`)
        .join("");
    }
    const note = document.getElementById("formNoteMount");
    if (note) note.textContent = p.formNote;
    const map = document.getElementById("mapMount");
    if (map) map.src = site.contact.mapEmbed;
    window.MLRefreshReveal();
  }

  /* ---------------- shared CTA band, reused on any page that has #ctaBandMount ---------------- */
  function renderSharedCtaBand(site) {
    const cta = document.getElementById("ctaBandMount");
    const p = site.pages.index && site.pages.index.ctaBand;
    if (!cta || !p || cta.dataset.filled) return;
    cta.dataset.filled = "1";
    cta.innerHTML = `
      <img src="${p.image}" alt="" />
      <div class="inner">
        <span class="eyebrow">${escape(p.eyebrow)}</span>
        <h2>${escape(p.title)}</h2>
        <p style="color:rgba(255,255,255,.85);">${escape(p.text)}</p>
        <a href="${p.cta.href}" class="btn btn-gold">${escape(p.cta.label)} <i class="fa-solid fa-arrow-right"></i></a>
      </div>`;
  }

  document.addEventListener("ml:shell-ready", async () => {
    const site = window.MLSite;
    if (site) {
      renderIndexContent(site);
      renderSharedCtaBand(site);
      renderIntroBlock("introBlockMount", site.pages.varieties && site.pages.varieties.intro);
      renderIntroBlock("recipesIntroMount", site.pages.recipes && site.pages.recipes.intro);
      renderIntroBlock("galleryIntroMount", site.pages.gallery && site.pages.gallery.intro);
      renderIntroBlock("faqIntroMount", site.pages.faq && site.pages.faq.intro);
      renderAbout(site);
      renderNutrition(site);
      renderSourcing(site);
      renderContact(site);
    }

    // Full variety list is used everywhere: featured teaser, full grid, marquee, hero strip, popup lookup
    const allVarieties = await window.MLData.load("data/varieties.json");
    const allRecipesForCrossLink = await window.MLData.load("data/recipes.json");
    initVarietyModal(allVarieties, allRecipesForCrossLink);
    renderMarquee(allVarieties);
    renderHeroVarietyStrip(allVarieties.slice(0, 6));
    renderNutritionInsights(allVarieties);

    // Home page teasers
    await renderInto("featuredVarieties", "data/varieties.json", varietyCard, 4);
    await renderInto("featuredRecipes", "data/recipes.json", recipeCard, 3);
    const testimonialsData = await window.MLData.load("data/testimonials.json").catch(() => null);
    if (testimonialsData) buildCarousel("testimonials", testimonialsData, testimonialCard, 5000);

    // Varieties page (full grid + filter)
    const varietiesData = await renderInto("varietiesGrid", "data/varieties.json", varietyCardFull);
    if (varietiesData) initTagFilter(varietiesData);

    // Recipes page (full grid + filter + modal)
    const recipesData = await renderInto("recipesGrid", "data/recipes.json", recipeCard);
    if (recipesData) {
      initTextFilter("recipeTabs", recipesData, "category", ".recipe-tab", "#recipesGrid .card");
      const varietiesForCrossLink = await window.MLData.load("data/varieties.json");
      initRecipeModal(recipesData, varietiesForCrossLink);
    }

    // Testimonials page reuse (all testimonials)
    await renderInto("allTestimonials", "data/testimonials.json", testimonialCard);

    // FAQ page
    const faqData = await renderInto("faqAccordion", "data/faq.json", faqItem);
    if (faqData) {
      window.MLAccordion.init("#faqAccordion");
      // deep link support: faq.html#faq-2 opens and scrolls to that question
      const hashId = location.hash.replace("#", "");
      if (hashId) {
        const target = document.getElementById(hashId);
        if (target && !target.classList.contains("is-open")) target.querySelector(".acc-trigger").click();
        if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
      }
    }

    // Gallery page
    const galleryData = await renderInto("galleryGrid", "data/gallery.json", galleryItem);
    if (galleryData) initTextFilter("galleryTabs", galleryData, "category", ".gallery-tab", "#galleryGrid .gallery-item");
  });

  /* ---------------- builds a tab bar from a JSON field's distinct values ---------------- */
  function initTextFilter(barId, items, field, tabClass, itemSelector) {
    const bar = document.getElementById(barId);
    if (!bar) return;
    const values = ["all", ...new Set(items.map((it) => it[field]))];
    bar.innerHTML = values
      .map((v, i) => `<button type="button" class="tab-btn ${tabClass.slice(1)} ${i === 0 ? "active" : ""}" data-filter="${escape(v)}">${escape(v === "all" ? "All" : v)}</button>`)
      .join("");
    initCategoryFilter(tabClass, itemSelector);
  }

  /* ---------------- generic tab filter (data-category attr) ---------------- */
  function initCategoryFilter(tabSelector, itemSelector) {
    const tabs = document.querySelectorAll(tabSelector);
    if (!tabs.length) return;
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const filter = tab.getAttribute("data-filter");
        document.querySelectorAll(itemSelector).forEach((item) => {
          const match = filter === "all" || item.getAttribute("data-category") === filter;
          item.style.display = match ? "" : "none";
        });
      });
    });
  }

  function initTagFilter(varieties) {
    const bar = document.getElementById("varietyTabs");
    if (!bar) return;
    const tags = ["all", ...new Set(varieties.map((v) => v.tag))];
    bar.innerHTML = tags
      .map((t, i) => `<button type="button" class="tab-btn variety-tab ${i === 0 ? "active" : ""}" data-filter="${escape(t)}">${escape(t === "all" ? "All Varieties" : t)}</button>`)
      .join("");
    initCategoryFilter(".variety-tab", "#varietiesGrid .card");
  }

  /* ---------------- recipe modal (with related-variety cross-link) ---------------- */
  function initRecipeModal(recipes, varieties) {
    const overlay = document.getElementById("recipeModal");
    if (!overlay) return;

    function openRecipe(r) {
      const relatedVariety = (varieties || []).find((v) => r.millet.includes(v.name) || v.name.includes(r.millet));
      overlay.querySelector(".modal-body").innerHTML = `
        <img src="${r.image}" alt="${escape(r.title)}" style="width:100%; border-radius:14px; margin-bottom:20px; aspect-ratio:16/9; object-fit:cover;" />
        <span class="eyebrow">${escape(r.category)} · ${escape(r.millet)}</span>
        <h2>${escape(r.title)}</h2>
        <p class="lede">${escape(r.summary)}</p>
        <div style="display:flex; gap:20px; margin:16px 0; font-size:.85rem; color:var(--clr-ink-soft);">
          <span><i class="fa-solid fa-clock" style="color:var(--clr-gold);"></i> ${escape(r.time)}</span>
          <span><i class="fa-solid fa-gauge" style="color:var(--clr-gold);"></i> ${escape(r.difficulty)}</span>
        </div>
        <h4>Ingredients</h4>
        <ul style="margin-bottom:18px;">${r.ingredients.map((i) => `<li style="padding:6px 0; border-bottom:1px dashed var(--clr-line);"><i class="fa-solid fa-check" style="color:var(--clr-gold); margin-right:8px;"></i>${escape(i)}</li>`).join("")}</ul>
        <h4>Method</h4>
        <ol style="padding-left:20px; display:grid; gap:10px;">${r.steps.map((s) => `<li>${escape(s)}</li>`).join("")}</ol>
        ${relatedVariety ? `
        <a href="varieties.html#${relatedVariety.id}" class="card-link" style="justify-content:space-between; background:var(--clr-cream-deep); padding:10px 14px; border-radius:4px; margin-top:18px;">
          Made with ${escape(relatedVariety.name)} — see grain details <i class="fa-solid fa-arrow-right"></i>
        </a>` : ""}
      `;
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".recipe-open");
      if (!btn) return;
      const r = recipes.find((x) => x.id === btn.getAttribute("data-id"));
      if (r) openRecipe(r);
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay || e.target.closest(".modal-close")) {
        overlay.classList.remove("is-open");
        document.body.style.overflow = "";
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        overlay.classList.remove("is-open");
        document.body.style.overflow = "";
      }
    });

    // deep link support: recipes.html#ragi-dosa opens that recipe automatically
    const hashId = location.hash.replace("#", "");
    if (hashId) {
      const r = recipes.find((x) => x.id === hashId);
      if (r) openRecipe(r);
    }
  }
})();
