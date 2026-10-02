/**
 * Per-page SEO: title, description, canonical, Open Graph, Twitter and JSON-LD.
 * The public base URL comes ONLY from data/seo.csv -> baseUrl, so moving the site
 * (GitHub Pages, custom domain, sub-folder) never requires touching code.
 */
import { getConfig } from './config.js';

export function baseUrl() {
  let b = getConfig()?.seo?.baseUrl || '';
  if (!b) b = location.origin + location.pathname.replace(/[^/]*$/, '');
  return b.endsWith('/') ? b : `${b}/`;
}

export function absolute(path) {
  if (!path) return '';
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path;
  try { return new URL(String(path).replace(/^\//, ''), baseUrl()).href; } catch { return ''; }
}

/** Indexable URL for a route. Uses the static landing pages (see tools/build-seo.mjs) when configured. */
export function canonicalFor(routePath = '/') {
  const seo = getConfig()?.seo || {};
  const p = routePath === '/' ? '' : routePath.replace(/^\/|\/$/g, '');
  if (!p) return baseUrl();
  if (seo.staticPagesPath) return `${baseUrl()}${seo.staticPagesPath.replace(/^\/|\/$/g, '')}/${p}/`;
  return `${baseUrl()}#/${p}`;
}

function setMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!value) { el?.remove(); return; }
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', value);
}
function setLink(rel, value) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!value) { el?.remove(); return; }
  if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el); }
  el.href = value;
}

const clip = (s, n = 160) => { s = String(s ?? '').replace(/\s+/g, ' ').trim(); return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s; };
const fill = (tpl, data) => String(tpl || '').replace(/\{(\w+)\}/g, (m, k) => (data[k] ?? ''));

/** Fill a title/description template from data/seo.csv -> templates. */
export function seoFromTemplate(name, data) {
  const t = getConfig()?.seo?.templates?.[name] || {};
  return { title: fill(t.title || '{title}', data), description: clip(fill(t.description || '{description}', data)) };
}

export function applySEO({ title, description, image, path = '/', type = 'website', jsonLd, noindex = false, home = false } = {}) {
  const cfg = getConfig() || {};
  const seo = cfg.seo || {};
  const site = cfg.site || {};
  const fullTitle = home ? (seo.homeTitle || site.name) : fill(seo.titleTemplate || '{title} | {name}', { title: title || site.name, name: site.name });
  const desc = clip(description || seo.defaultDescription || site.description);
  const img = absolute(image || seo.defaultImage);
  const url = canonicalFor(path);

  document.title = fullTitle;
  document.documentElement.lang = site.language || 'en';
  setMeta('name', 'description', desc);
  setMeta('name', 'robots', noindex ? 'noindex,follow' : (seo.robots || 'index,follow'));
  setMeta('name', 'theme-color', seo.themeColor);
  setLink('canonical', url);

  setMeta('property', 'og:site_name', site.name);
  setMeta('property', 'og:type', type);
  setMeta('property', 'og:title', fullTitle);
  setMeta('property', 'og:description', desc);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:image', img);
  setMeta('property', 'og:image:alt', seo.imageAlt || fullTitle);
  setMeta('property', 'og:locale', seo.locale);

  setMeta('name', 'twitter:card', seo.twitterCard || 'summary_large_image');
  setMeta('name', 'twitter:site', seo.twitterSite);
  setMeta('name', 'twitter:title', fullTitle);
  setMeta('name', 'twitter:description', desc);
  setMeta('name', 'twitter:image', img);

  let ld = document.getElementById('jsonld');
  if (!jsonLd) { ld?.remove(); return; }
  if (!ld) { ld = document.createElement('script'); ld.id = 'jsonld'; ld.type = 'application/ld+json'; document.head.appendChild(ld); }
  ld.textContent = JSON.stringify(jsonLd);
}

export function websiteJsonLd() {
  const cfg = getConfig() || {};
  const base = baseUrl();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', name: cfg.site?.name, url: base, description: cfg.site?.description,
        potentialAction: { '@type': 'SearchAction', target: `${base}#/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
      { '@type': 'Organization', name: cfg.seo?.organization?.name || cfg.site?.name, url: base, logo: absolute(cfg.seo?.organization?.logo || cfg.site?.logo) },
    ],
  };
}
