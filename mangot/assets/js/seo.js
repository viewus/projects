/**
 * assets/js/seo.js
 * Reads data-page from <body>, looks up SEO config in data/seo.js,
 * and dynamically injects <title>, <meta>, OG tags, Twitter tags, JSON-LD
 * into <head> — so each page gets its correct SEO without repeating markup.
 *
 * Load order in each HTML page:
 *   <script src="./data/seo.js"></script>   (data first)
 *   <script src="./assets/js/seo.js"></script> (injector second, in <head> with defer)
 */

(function () {
  // Read page key from <body data-page="...">
  // data-page may not be on body yet if script runs in <head>, so we defer to DOMContentLoaded
  function injectSEO() {
    const page = document.body ? document.body.dataset.page : null;
    if (!page || typeof SEO === 'undefined' || !SEO[page]) return;

    const s = SEO[page];
    const head = document.head;

    /** Helper: set or create a <meta> tag */
    function setMeta(selector, attr, value) {
      let el = head.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        head.appendChild(el);
      }
      el.setAttribute(attr, value);
    }

    /** Helper: set or create a <link> tag */
    function setLink(rel, href) {
      let el = head.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.rel = rel;
        head.appendChild(el);
      }
      el.href = href;
    }

    // ── Title ────────────────────────────────────────────────────────────
    if (s.title) document.title = s.title;

    // ── Standard meta ────────────────────────────────────────────────────
    if (s.description)
      setMeta('meta[name="description"]', 'content', s.description);
    if (s.keywords)
      setMeta('meta[name="keywords"]', 'content', s.keywords);
    if (s.canonical) {
      setMeta('meta[name="keywords"]', 'content', s.keywords || ''); // already done above, harmless
      setLink('canonical', s.canonical);
    }

    // ── Open Graph ───────────────────────────────────────────────────────
    if (s.og) {
      const ogMap = {
        'og:type':        s.og.type,
        'og:url':         s.og.url,
        'og:title':       s.og.title,
        'og:description': s.og.description,
        'og:image':       s.og.image,
      };
      Object.entries(ogMap).forEach(([prop, val]) => {
        if (val) setMeta(`meta[property="${prop}"]`, 'content', val);
        head.querySelector(`meta[property="${prop}"]`) &&
          head.querySelector(`meta[property="${prop}"]`).setAttribute('property', prop);
      });
      // Ensure property attribute is set (setMeta uses 'content' attr only)
      Object.entries(ogMap).forEach(([prop, val]) => {
        if (!val) return;
        let el = head.querySelector(`meta[property="${prop}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute('property', prop);
          el.setAttribute('content', val);
          head.appendChild(el);
        } else {
          el.setAttribute('content', val);
        }
      });
    }

    // ── Twitter Card ─────────────────────────────────────────────────────
    if (s.twitter) {
      const twMap = {
        'twitter:card':        s.twitter.card,
        'twitter:title':       s.twitter.title,
        'twitter:description': s.twitter.description,
        'twitter:image':       s.twitter.image,
        'twitter:url':         s.og ? s.og.url : '',
      };
      Object.entries(twMap).forEach(([name, val]) => {
        if (!val) return;
        let el = head.querySelector(`meta[name="${name}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute('name', name);
          head.appendChild(el);
        }
        el.setAttribute('content', val);
      });
    }

    // ── JSON-LD Structured Data ───────────────────────────────────────────
    if (s.schema) {
      // For FAQPage: merge answers from FAQ data if available
      let schema = Object.assign({}, s.schema);
      if (schema['@type'] === 'FAQPage' && typeof FAQ !== 'undefined') {
        schema.mainEntity = FAQ.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        }));
      }
      // Remove existing JSON-LD if any, replace cleanly
      const existing = head.querySelector('script[type="application/ld+json"]');
      if (existing) existing.remove();
      const ldScript = document.createElement('script');
      ldScript.type = 'application/ld+json';
      ldScript.textContent = JSON.stringify(schema, null, 2);
      head.appendChild(ldScript);
    }
  }

  // Run after DOM is ready so body.dataset.page is available
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSEO);
  } else {
    injectSEO();
  }
})();
