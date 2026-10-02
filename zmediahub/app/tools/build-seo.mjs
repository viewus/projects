/**
 * SEO build step (recommended for GitHub Pages).
 *
 * The app uses hash routes (#/category/food-drinks) which search engines do not index.
 * This script reads data/seo.csv (baseUrl lives ONLY there) and the CSV files, then writes:
 *   - sitemap.xml            every public page, using the static landing URLs below
 *   - robots.txt             points crawlers at the sitemap
 *   - s/<route>/index.html   tiny landing pages with a real <title>, description, canonical and
 *                            Open Graph tags that forward visitors to the matching hash route
 *   - 404.html               friendly fallback that forwards to the app
 *
 * Usage:  node tools/build-seo.mjs        (also runs as part of `npm run build`)
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const json = (f) => JSON.parse(read(f));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clip = (s, n = 160) => { s = String(s ?? '').replace(/\s+/g, ' ').trim(); return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s; };
const fill = (t, d) => String(t || '').replace(/\{(\w+)\}/g, (m, k) => d[k] ?? '');

function parseCSV(text) {
  const rows = []; let row = [], f = '', q = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; continue; }
    if (c === '"' && f === '') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); f = ''; rows.push(row); row = []; }
    else if (c !== '\r') f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const head = (rows.shift() || []).map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return rows.filter((r) => r.some(Boolean)).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));
}
const table = (n) => { try { return parseCSV(read(`data/${n}.csv`)); } catch { return []; } };
const live = (r) => ['', 'active', 'published', 'live', '1', 'true', 'yes', 'public'].includes(String(r.status || '').toLowerCase());

// data/seo.csv is a key,value table; dotted keys become nested objects (pages.about.title)
const seo = {};
table('seo').forEach((r) => { const parts = r.key.split('.'); let o = seo; parts.slice(0, -1).forEach((k) => { o = o[k] = o[k] || {}; }); o[parts[parts.length - 1]] = r.value; });
const site = json('data/site.json');
let base = seo.baseUrl || '';
if (!base) { console.warn('! data/seo.csv baseUrl is empty. Sitemap URLs need an absolute address, so set it first.'); base = 'https://example.com/'; }
if (!base.endsWith('/')) base += '/';
const sp = (seo.staticPagesPath || 's/').replace(/^\/|\/$/g, '');
const abs = (p) => new URL(String(p || seo.defaultImage).replace(/^\//, ''), base).href;
const title = (t) => fill(seo.titleTemplate || '{title} | {name}', { title: t, name: site.name });
const tpl = (name, data) => ({ title: title(fill(seo.templates?.[name]?.title, data)), description: clip(fill(seo.templates?.[name]?.description, data)) });

const pages = [{ route: '', title: seo.homeTitle, description: seo.defaultDescription, image: seo.defaultImage, pri: seo.sitemap?.priority?.home || '1.0' }];
const ROUTE_OF = { providers: 'creators' };
for (const [k, v] of Object.entries(seo.pages || {})) {
  if (['search', 'notfound'].includes(k)) continue;
  pages.push({ route: ROUTE_OF[k] || k, title: title(v.title), description: v.description, image: seo.defaultImage, pri: seo.sitemap?.priority?.listing || '0.8' });
}
const det = seo.sitemap?.priority?.detail || '0.6';

table('categories').filter(live).forEach((c) => pages.push({ route: `category/${c.slug}`, ...tpl('category', c), image: c.image, pri: '0.7' }));
table('providers').filter(live).forEach((p) => pages.push({ route: `provider/${p.slug}`, ...tpl('provider', p), image: p.avatar || p.logo, pri: det }));
const usage = {};
table('content_tags').forEach((r) => { const t = r.tag || r.tag_id; usage[t] = (usage[t] || 0) + 1; });
table('tags').filter(live).forEach((t) => pages.push({ route: `tag/${t.slug}`, ...tpl('tag', { ...t, count: usage[t.slug] || 0 }), image: seo.defaultImage, pri: det }));
table('content').filter(live).forEach((c) => pages.push({ route: `content/${c.slug}`, ...tpl('content', c), image: c.thumbnail, pri: det }));
table('blogs').filter(live).forEach((b) => pages.push({ route: `blog/${b.slug}`, ...tpl('blog', { ...b, description: b.excerpt }), image: b.thumbnail, pri: det }));
table('businesses').filter(live).forEach((b) => pages.push({ route: `business/${b.slug}`, ...tpl('business', b), image: b.cover, pri: det }));
['privacy', 'terms', 'contact'].forEach((s) => pages.push({ route: `page/${s}`, title: title(s[0].toUpperCase() + s.slice(1)), description: seo.defaultDescription, image: seo.defaultImage, pri: '0.3' }));

const urlOf = (route) => (route ? `${base}${sp}/${route}/` : base);
// landing pages redirect with a relative path, so they work on any host and in local previews
const relOf = (route) => `${'../'.repeat(route.split('/').length + 1)}#/${route}`;

const out = path.join(ROOT, sp);
fs.rmSync(out, { recursive: true, force: true });
for (const p of pages) {
  if (!p.route) continue;
  const html = `<!doctype html>
<html lang="${esc(site.language || 'en')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
<link rel="canonical" href="${esc(urlOf(p.route))}">
<meta name="robots" content="${esc(seo.robots || 'index,follow')}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${esc(urlOf(p.route))}">
<meta property="og:image" content="${esc(abs(p.image))}">
<meta name="twitter:card" content="${esc(seo.twitterCard || 'summary_large_image')}">
<meta name="twitter:title" content="${esc(p.title)}">
<meta name="twitter:description" content="${esc(p.description)}">
<meta name="twitter:image" content="${esc(abs(p.image))}">
<script>location.replace(${JSON.stringify(relOf(p.route))});</script>
<meta http-equiv="refresh" content="3;url=${esc(relOf(p.route))}">
</head>
<body style="font-family:system-ui,sans-serif;max-width:640px;margin:15vh auto;padding:0 20px;color:#222">
<h1>${esc(p.title)}</h1>
<p>${esc(p.description)}</p>
<p><a href="${esc(relOf(p.route))}">Open this page on ${esc(site.name)}</a></p>
</body>
</html>
`;
  const dir = path.join(out, p.route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${esc(urlOf(p.route))}</loc><lastmod>${today}</lastmod><changefreq>${seo.sitemap?.changefreq || 'weekly'}</changefreq><priority>${p.pri}</priority></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${base}sitemap.xml\n`);
fs.writeFileSync(path.join(ROOT, '404.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found | ${esc(site.name)}</title><meta name="robots" content="noindex"><script>location.replace(${JSON.stringify(base)});</script></head><body style="font-family:system-ui,sans-serif;text-align:center;margin-top:20vh"><h1>Page not found</h1><p><a href="${esc(base)}">Back to ${esc(site.name)}</a></p></body></html>\n`);
console.log(`SEO build: ${pages.length} URLs, base ${base}, landing pages in /${sp}/`);
