/*!
 * MilletLuxe — shared components
 * Every piece of text on the site — nav labels, footer, headings, SEO meta —
 * comes from data/site.json and data/seo.json. Nothing is hardcoded in HTML.
 * Loaded on every page BEFORE the page-specific script.
 */
(function () {
  "use strict";

  window.ML_BASE = "";

  window.MLData = {
    cache: {},
    async load(path) {
      if (this.cache[path]) return this.cache[path];
      const res = await fetch(window.ML_BASE + path, { cache: "no-cache" });
      if (!res.ok) throw new Error("Failed to load " + path);
      const json = await res.json();
      this.cache[path] = json;
      return json;
    },
  };

  function currentPage() {
    const p = location.pathname.split("/").pop() || "index.html";
    return (p.replace(".html", "") || "index").split("?")[0].split("#")[0];
  }
  window.MLCurrentPage = currentPage;

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------- SEO: inject <title> + meta tags from seo.json ---------------- */
  function applySEO(seo) {
    const page = currentPage();
    const entry = seo.pages[page];
    if (!entry) return;
    document.title = entry.title;
    setMeta("description", entry.description);
    setMeta("keywords", entry.keywords);
    setMeta("og:title", entry.title, true);
    setMeta("og:description", entry.description, true);
    setMeta("og:image", entry.image || seo.defaultImage, true);
    setMeta("og:type", "website", true);
    setMeta("og:site_name", seo.siteName, true);
    setMeta("twitter:card", "summary_large_image", true);
    setMeta("twitter:title", entry.title, true);
    setMeta("twitter:description", entry.description, true);
    setMeta("twitter:image", entry.image || seo.defaultImage, true);
  }
  function setMeta(name, content, isProperty) {
    if (!content) return;
    const attr = isProperty ? "property" : "name";
    let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(attr, name);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  /* ---------------- header / footer, built entirely from site.json ---------------- */
  function headerHTML(site) {
    const page = currentPage();
    const links = site.nav
      .map((n) => `<a href="${n.href}" class="${page === n.id ? "active" : ""}">${esc(n.label)}</a>`)
      .join("");
    return `
    <header class="site-header" id="siteHeader">
      <div class="container nav-inner">
        <a href="index.html" class="brand"><i class="${site.brand.icon}"></i>&nbsp;${esc(site.brand.name)}<span>${esc(site.brand.highlight)}</span></a>
        <nav class="nav-links" id="navLinks">
          ${links}
          <a href="${site.navCta.href}" class="btn btn-gold btn-sm" style="margin-top:6px;">${esc(site.navCta.label)}</a>
        </nav>
        <div class="nav-cta">
          <button class="nav-search-btn" id="navSearchBtn" aria-label="Search the site"><i class="fa-solid fa-magnifying-glass"></i></button>
          <button class="nav-toggle" id="navToggle" aria-label="Toggle menu"><i class="fa-solid fa-bars"></i></button>
        </div>
      </div>
    </header>`;
  }

  function footerHTML(site) {
    const year = new Date().getFullYear();
    const columns = site.footer.columns
      .map(
        (col) => `
        <div>
          <h5>${esc(col.title)}</h5>
          <ul>${col.links.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join("")}</ul>
        </div>`
      )
      .join("");
    const social = site.social.map((s) => `<a href="${s.href}" aria-label="${esc(s.label)}"><i class="${s.icon}"></i></a>`).join("");
    return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="footer-brand">${esc(site.brand.name)}<span>${esc(site.brand.highlight)}</span></div>
            <p style="max-width:320px; font-size:.9rem;">${esc(site.footer.about)}</p>
            <div class="social-row">${social}</div>
          </div>
          ${columns}
          <div>
            <h5>Visit The Mill</h5>
            <ul>
              <li><i class="fa-solid fa-location-dot" style="color:var(--clr-gold); margin-right:8px;"></i>${esc(site.contact.address)}</li>
              <li><i class="fa-solid fa-phone" style="color:var(--clr-gold); margin-right:8px;"></i>${esc(site.contact.phone)}</li>
              <li><i class="fa-solid fa-envelope" style="color:var(--clr-gold); margin-right:8px;"></i>${esc(site.contact.email)}</li>
            </ul>
          </div>
        </div>
        <div class="footer-grain-row" aria-hidden="true">
          <i class="fa-solid fa-wheat-awn"></i>
          <i class="fa-solid fa-seedling"></i>
          <i class="fa-solid fa-wheat-awn-circle-exclamation"></i>
          <i class="fa-solid fa-leaf"></i>
          <i class="fa-solid fa-wheat-awn"></i>
        </div>
        <div class="footer-bottom">
          <span>&copy; ${year} ${esc(site.brand.name)}${esc(site.brand.highlight)}. All rights reserved.</span>
          <span>${esc(site.footer.bottomRight)}</span>
        </div>
      </div>
    </footer>
    <button class="back-to-top" id="backToTop" aria-label="Back to top"><i class="fa-solid fa-arrow-up"></i></button>
    <a class="whatsapp-fab" href="${site.contact.whatsapp}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
    `;
  }

  /* ---------------- generic page-header renderer (used by every inner page) ---------------- */
  function renderPageHeader(site) {
    const el = document.querySelector(".page-header[data-page]");
    if (!el) return;
    const key = el.getAttribute("data-page");
    const data = site.pages[key] && site.pages[key].header;
    if (!data) return;
    el.innerHTML = `
      <img src="${data.image}" alt="" />
      <div class="inner container">
        <span class="eyebrow">${esc(data.eyebrow)}</span>
        <h1>${esc(data.title)}</h1>
        <div class="breadcrumb">${data.breadcrumb.split(" / ").map((c, i, arr) => (i === arr.length - 1 ? esc(c) : `<a href="index.html">${esc(c)}</a>`)).join(" / ")}</div>
      </div>`;
  }

  /* ---------------- nav scroll + mobile toggle ---------------- */
  function initNav() {
    const header = document.getElementById("siteHeader");
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 30);
      const backBtn = document.getElementById("backToTop");
      if (backBtn) backBtn.classList.toggle("show", window.scrollY > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toggle && links) {
      toggle.addEventListener("click", () => {
        links.classList.toggle("is-open");
        toggle.innerHTML = links.classList.contains("is-open") ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
      });
      links.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => {
          links.classList.remove("is-open");
          toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        })
      );
    }

    const backBtn = document.getElementById("backToTop");
    if (backBtn) backBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------------- scroll reveal (auto-staggers siblings in the same grid) ---------------- */
  function initReveal() {
    const items = document.querySelectorAll("[data-aos]:not(.aos-in)");
    if (!items.length) return;

    const siblingIndex = new Map();
    items.forEach((el) => {
      if (el.hasAttribute("data-aos-delay")) return;
      const parent = el.parentElement;
      const n = siblingIndex.get(parent) || 0;
      el.setAttribute("data-aos-delay", Math.min(n * 70, 420));
      siblingIndex.set(parent, n + 1);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.getAttribute("data-aos-delay") || 0;
            setTimeout(() => entry.target.classList.add("aos-in"), Number(delay));
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ---------------- animated number counters (0 -> value on scroll into view) ---------------- */
  function initCounters() {
    const els = document.querySelectorAll("[data-count]:not(.counted)");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          io.unobserve(el);
          el.classList.add("counted");
          const raw = el.textContent.trim();
          const match = raw.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/);
          if (!match) return; // non-numeric (e.g. "Low"), leave untouched
          const [, prefix, numStr, suffix] = match;
          const target = parseFloat(numStr.replace(/,/g, ""));
          const isInt = !numStr.includes(".");
          const duration = 1100;
          const start = performance.now();
          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;
            const formatted = isInt ? Math.round(current).toLocaleString("en-IN") : current.toFixed(1);
            el.textContent = prefix + formatted + suffix;
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = raw;
          }
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );
    els.forEach((el) => io.observe(el));
  }

  window.MLRefreshReveal = function () {
    initReveal();
    initCounters();
  };

  /* ---------------- reusable accordion ---------------- */
  window.MLAccordion = {
    init(container) {
      const root = typeof container === "string" ? document.querySelector(container) : container;
      if (!root) return;
      root.querySelectorAll(".acc-item").forEach((item) => {
        const trigger = item.querySelector(".acc-trigger");
        const panel = item.querySelector(".acc-panel");
        if (!trigger || !panel) return;
        trigger.addEventListener("click", () => {
          const isOpen = item.classList.contains("is-open");
          root.querySelectorAll(".acc-item.is-open").forEach((openItem) => {
            if (openItem !== item) {
              openItem.classList.remove("is-open");
              openItem.querySelector(".acc-panel").style.maxHeight = null;
            }
          });
          item.classList.toggle("is-open", !isOpen);
          panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : null;
        });
      });
    },
  };

  window.MLRender = { escape: esc };

  /* ---------------- reusable detail modal (generic popup, any HTML content) ---------------- */
  window.MLDetailModal = (function () {
    let overlay, body;
    function build() {
      overlay = document.createElement("div");
      overlay.className = "modal-overlay";
      overlay.innerHTML = `
        <div class="modal-box">
          <button type="button" class="modal-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
          <div class="modal-body"></div>
        </div>`;
      document.body.appendChild(overlay);
      body = overlay.querySelector(".modal-body");
      overlay.querySelector(".modal-close").addEventListener("click", close);
      overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    }
    function open(html) {
      if (!overlay) build();
      body.innerHTML = html;
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      if (!overlay) return;
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    return { open, close };
  })();

  /* ---------------- site-wide search: indexes varieties + recipes + faq ---------------- */
  window.MLSearch = (function () {
    let overlay, input, resultsEl, index = null, activeIdx = -1, results = [];

    function esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

    async function buildIndex() {
      if (index) return index;
      const [varieties, recipes, faq] = await Promise.all([
        window.MLData.load("data/varieties.json"),
        window.MLData.load("data/recipes.json"),
        window.MLData.load("data/faq.json"),
      ]);
      index = [
        ...varieties.map((v) => ({
          type: "Variety", icon: "fa-solid fa-wheat-awn", image: v.image,
          title: `${v.name} (${v.local})`, subtitle: v.summary, href: `varieties.html#${v.id}`,
          keywords: `${v.name} ${v.local} ${v.tag} ${v.region} ${v.uses.join(" ")}`.toLowerCase(),
        })),
        ...recipes.map((r) => ({
          type: "Recipe", icon: "fa-solid fa-utensils", image: r.image,
          title: r.title, subtitle: r.summary, href: `recipes.html#${r.id}`,
          keywords: `${r.title} ${r.category} ${r.millet}`.toLowerCase(),
        })),
        ...faq.map((f, i) => ({
          type: "FAQ", icon: "fa-solid fa-circle-question", image: null,
          title: f.q, subtitle: f.a, href: `faq.html#faq-${i}`,
          keywords: `${f.q} ${f.a}`.toLowerCase(),
        })),
      ];
      return index;
    }

    function highlight(text, q) {
      if (!q) return esc(text);
      const i = text.toLowerCase().indexOf(q.toLowerCase());
      if (i < 0) return esc(text);
      return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
    }

    function render(query) {
      const q = query.trim();
      if (!q) {
        resultsEl.innerHTML = `<div class="search-empty">Start typing to search varieties, recipes and FAQs…</div>`;
        results = [];
        activeIdx = -1;
        return;
      }
      const ql = q.toLowerCase();
      results = index.filter((it) => it.keywords.includes(ql)).slice(0, 20);
      if (!results.length) {
        resultsEl.innerHTML = `<div class="search-empty">No results for "${esc(q)}". Try a different term.</div>`;
        activeIdx = -1;
        return;
      }
      const groups = {};
      results.forEach((r) => { (groups[r.type] = groups[r.type] || []).push(r); });
      resultsEl.innerHTML = Object.entries(groups)
        .map(
          ([type, items]) => `
        <div class="search-group-label">${type}</div>
        ${items
          .map((it) => {
            const globalIdx = results.indexOf(it);
            return `
          <a href="${it.href}" class="search-result" data-idx="${globalIdx}">
            ${it.image ? `<img src="${it.image}" alt="" loading="lazy" />` : `<span class="icon-fallback"><i class="${it.icon}"></i></span>`}
            <div>
              <div class="search-result-title">${highlight(it.title, q)}</div>
              <div class="search-result-sub">${highlight(it.subtitle.slice(0, 80), q)}</div>
            </div>
          </a>`;
          })
          .join("")}`
        )
        .join("");
      activeIdx = -1;
    }

    function setActive(i) {
      resultsEl.querySelectorAll(".search-result").forEach((el) => el.classList.remove("is-active"));
      if (i >= 0 && i < results.length) {
        const el = resultsEl.querySelector(`[data-idx="${i}"]`);
        if (el) { el.classList.add("is-active"); el.scrollIntoView({ block: "nearest" }); }
      }
      activeIdx = i;
    }

    function build() {
      overlay = document.createElement("div");
      overlay.className = "search-overlay";
      overlay.innerHTML = `
        <div class="search-box">
          <div class="search-input-row">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Search varieties, recipes, FAQs…" autocomplete="off" />
            <button type="button" class="search-close" aria-label="Close search"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="search-results"></div>
          <div class="search-hint"><kbd>Esc</kbd> to close &nbsp;·&nbsp; <kbd>&uarr;</kbd><kbd>&darr;</kbd> to navigate &nbsp;·&nbsp; <kbd>Enter</kbd> to open</div>
        </div>`;
      document.body.appendChild(overlay);
      input = overlay.querySelector("input");
      resultsEl = overlay.querySelector(".search-results");

      overlay.querySelector(".search-close").addEventListener("click", close);
      overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
      input.addEventListener("input", () => render(input.value));
      resultsEl.addEventListener("click", (e) => { if (e.target.closest(".search-result")) close(); });
      document.addEventListener("keydown", (e) => {
        if (!overlay.classList.contains("is-open")) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowDown") { e.preventDefault(); setActive(Math.min(activeIdx + 1, results.length - 1)); }
        if (e.key === "ArrowUp") { e.preventDefault(); setActive(Math.max(activeIdx - 1, 0)); }
        if (e.key === "Enter" && activeIdx >= 0) { window.location.href = results[activeIdx].href; }
      });
    }

    async function open() {
      if (!overlay) build();
      await buildIndex();
      render("");
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
      setTimeout(() => input.focus(), 50);
    }
    function close() {
      if (!overlay) return;
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    document.addEventListener("click", (e) => { if (e.target.closest("#navSearchBtn")) open(); });
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") { e.preventDefault(); open(); }
    });

    return { open, close };
  })();

  /* ---------------- reusable lightbox: works on any <a data-fancy href="img"> ---------------- */
  window.MLLightbox = (function () {
    let overlay, imgEl, capEl, items = [], index = 0;

    function build() {
      overlay = document.createElement("div");
      overlay.className = "lightbox-overlay";
      overlay.innerHTML = `
        <div class="lightbox-box">
          <button type="button" class="lightbox-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
          <button type="button" class="lightbox-nav prev" aria-label="Previous image"><i class="fa-solid fa-chevron-left"></i></button>
          <button type="button" class="lightbox-nav next" aria-label="Next image"><i class="fa-solid fa-chevron-right"></i></button>
          <img alt="" />
          <div class="lightbox-caption"><span class="lightbox-caption-text"></span><span class="lightbox-counter"></span></div>
        </div>`;
      document.body.appendChild(overlay);
      imgEl = overlay.querySelector("img");
      capEl = overlay.querySelector(".lightbox-caption-text");

      overlay.querySelector(".lightbox-close").addEventListener("click", close);
      overlay.querySelector(".lightbox-nav.prev").addEventListener("click", () => show(index - 1));
      overlay.querySelector(".lightbox-nav.next").addEventListener("click", () => show(index + 1));
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
      });
      document.addEventListener("keydown", (e) => {
        if (!overlay.classList.contains("is-open")) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowLeft") show(index - 1);
        if (e.key === "ArrowRight") show(index + 1);
      });
    }

    function collectGroup(triggerEl) {
      const group = triggerEl.getAttribute("data-fancy-group") || "default";
      const all = Array.from(document.querySelectorAll(`[data-fancy][data-fancy-group="${group}"]`));
      const visible = all.filter((el) => el.offsetParent !== null);
      return visible.length ? visible : all;
    }

    function show(i) {
      if (!items.length) return;
      index = (i + items.length) % items.length;
      const el = items[index];
      imgEl.src = el.getAttribute("href");
      const caption = el.getAttribute("data-caption") || el.querySelector("img")?.getAttribute("alt") || "";
      capEl.textContent = caption;
      overlay.querySelector(".lightbox-counter").textContent = items.length > 1 ? `${index + 1} / ${items.length}` : "";
    }

    function open(triggerEl) {
      if (!overlay) build();
      items = collectGroup(triggerEl);
      index = items.indexOf(triggerEl);
      if (index < 0) index = 0;
      show(index);
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function close() {
      if (!overlay) return;
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-fancy]");
      if (!trigger) return;
      e.preventDefault();
      open(trigger);
    });

    return { open, close };
  })();

  /* ---------------- scroll progress bar — thin gold line, top of viewport ---------------- */
  function initScrollProgress() {
    const bar = document.createElement("div");
    bar.id = "mlScrollProgress";
    bar.style.cssText = "position:fixed;top:0;left:0;height:3px;width:0%;background:linear-gradient(90deg,var(--clr-gold),var(--clr-terracotta));z-index:1100;transition:width .1s linear;";
    document.body.appendChild(bar);
    const update = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------------- boot ---------------- */
  async function boot() {
    try {
      const [site, seo] = await Promise.all([window.MLData.load("data/site.json"), window.MLData.load("data/seo.json")]);
      window.MLSite = site;
      window.MLSeo = seo;
      applySEO(seo);
      const headerMount = document.getElementById("ml-header");
      const footerMount = document.getElementById("ml-footer");
      if (headerMount) headerMount.innerHTML = headerHTML(site);
      if (footerMount) footerMount.innerHTML = footerHTML(site);
      renderPageHeader(site);
      initNav();
      initReveal();
      initCounters();
      initScrollProgress();
    } catch (e) {
      console.error("MilletLuxe: failed to boot shell", e);
    } finally {
      document.dispatchEvent(new CustomEvent("ml:shell-ready"));
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
