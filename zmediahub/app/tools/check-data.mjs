/**
 * Data checker: finds the mistakes that are easy to make when editing CSV/JSON by hand.
 *
 *   npm run check                    checks ../data
 *   npm run check -- data_sample     checks any other dataset folder
 *
 * Exits with code 1 when there are errors (warnings do not fail it), so it can run in CI before publishing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseCSV } from '../src/utils/csvParser.js';

const root = path.resolve(import.meta.dirname, '..', '..');
const folder = process.argv[2] || 'data';
const dir = path.join(root, folder);
const errors = []; const warnings = [];
const err = (m) => errors.push(m); const warn = (m) => warnings.push(m);
if (!fs.existsSync(dir)) { console.error(`Folder not found: ${dir}`); process.exit(2); }

const readJSON = (f) => { try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { err(`${f}: ${e.message}`); return null; } };
const table = (n) => {
  const f = path.join(dir, `${n}.csv`);
  if (!fs.existsSync(f)) { warn(`${n}.csv is missing (treated as empty)`); return []; }
  const { rows, errors: pe } = parseCSV(fs.readFileSync(f, 'utf8'));
  pe.slice(0, 5).forEach((m) => err(`${n}.csv: ${m}`));
  return rows;
};
const s = (v) => String(v ?? '').trim();
const live = (r) => ['', 'active', 'published', 'live', '1', 'true', 'yes', 'public'].includes(s(r.status).toLowerCase());

// ---- JSON settings parse
const settings = {};
for (const n of ['api', 'site', 'theme', 'navigation', 'platforms', 'sections', 'footer', 'pages', 'tag-images']) {
  if (!fs.existsSync(path.join(dir, `${n}.json`))) { n === 'api' ? warn('api.json is missing (built-in defaults will be used)') : err(`${n}.json is missing`); continue; }
  settings[n] = readJSON(`${n}.json`);
}
const site = settings.site || {};
if (!site.name) err('site.json: "name" is empty');
if (site.logo && !fs.existsSync(path.join(root, folder, site.logo.replace(/^data\//, '')))) err(`site.json: logo not found (${site.logo})`);
const theme = settings.theme?.colors || {};
for (const k of ['primary', 'primaryDark', 'primaryLight', 'primarySoft', 'secondary', 'background', 'text', 'border']) if (!theme[k]) err(`theme.json: colour "${k}" is missing`);
for (const [k, v] of Object.entries(theme)) if (typeof v === 'string' && v.startsWith('#') && !/^#[0-9a-f]{6}$/i.test(v)) warn(`theme.json: colour "${k}" (${v}) is not a 6-digit hex, so tints derived from it will not work`);

// ---- tables
const platforms = table('platforms'); const cats = table('categories'); const subs = table('subcategories'); const tags = table('tags');
const providers = table('providers'); const content = table('content'); const ctags = table('content_tags'); const blogs = table('blogs'); const banners = table('banners');
const ids = (rows, key = 'id') => new Set(rows.map((r) => s(r[key])));
const dupes = (rows, key, label) => { const seen = new Set(); rows.forEach((r) => { const v = s(r[key]); if (!v) return; if (seen.has(v)) err(`${label}: duplicate ${key} "${v}"`); seen.add(v); }); };
dupes(cats, 'id', 'categories'); dupes(cats, 'slug', 'categories'); dupes(content, 'id', 'content'); dupes(content, 'slug', 'content'); dupes(blogs, 'slug', 'blogs'); dupes(tags, 'slug', 'tags'); dupes(subs, 'slug', 'subcategories');
const catIds = ids(cats); const subById = new Map(subs.map((r) => [s(r.id), r])); const provIds = ids(providers); const platIds = ids(platforms); const contentIds = ids(content); const tagSlugs = new Set(tags.map((t) => s(t.slug) || s(t.id)));

if (!content.length) err('content.csv has no rows');
content.forEach((r) => {
  const id = s(r.id) || '(no id)'; const where = `content.csv ${id}`;
  if (!s(r.title)) err(`${where}: title is empty`);
  if (s(r.category_id) && !catIds.has(s(r.category_id))) err(`${where}: category_id "${r.category_id}" does not exist in categories.csv`);
  if (s(r.subcategory_id)) { const sub = subById.get(s(r.subcategory_id)); if (!sub) err(`${where}: subcategory_id "${r.subcategory_id}" does not exist`); else if (s(r.category_id) && s(sub.category_id) !== s(r.category_id)) warn(`${where}: subcategory belongs to a different category`); }
  if (s(r.provider_id) && !provIds.has(s(r.provider_id))) err(`${where}: provider_id "${r.provider_id}" does not exist in providers.csv`);
  if (s(r.platform) && !platIds.has(s(r.platform).toLowerCase())) warn(`${where}: platform "${r.platform}" is not in platforms.csv`);
  if (live(r) && !s(r.thumbnail)) warn(`${where}: no thumbnail`);
  if (s(r.embed_url) && !/^https:\/\//i.test(s(r.embed_url))) err(`${where}: embed_url must start with https://`);
  if (s(r.external_url) && !/^https?:\/\//i.test(s(r.external_url))) err(`${where}: external_url is not a web address`);
  if (s(r.published_at) && Number.isNaN(Date.parse(s(r.published_at)))) err(`${where}: published_at "${r.published_at}" is not a date (use YYYY-MM-DD)`);
});
ctags.forEach((r) => { if (!contentIds.has(s(r.content_id))) err(`content_tags.csv: content_id "${r.content_id}" does not exist`); if (!tagSlugs.has(s(r.tag).replace(/^#/, ''))) err(`content_tags.csv: tag "${r.tag}" is not in tags.csv`); });
subs.forEach((r) => { if (!catIds.has(s(r.category_id))) err(`subcategories.csv ${s(r.id)}: category_id "${r.category_id}" does not exist`); });
blogs.forEach((r) => {
  if (s(r.category_id) && !catIds.has(s(r.category_id))) err(`blogs.csv ${s(r.slug)}: category_id "${r.category_id}" does not exist`);
  s(r.tags).split(/[;|]/).map((t) => t.trim()).filter(Boolean).forEach((t) => { if (!tagSlugs.has(t)) warn(`blogs.csv ${s(r.slug)}: tag "${t}" is not in tags.csv`); });
});
if (!banners.some((r) => s(r.position) === 'hero' && live(r))) warn('banners.csv: no active "hero" banner, the home page hero will be empty');

// ---- every image / file path must exist
const checkPaths = (label, value) => {
  if (typeof value === 'string') {
    if (/^data\/.+\.(jpe?g|png|webp|gif|svg|avif)$/i.test(value) && !fs.existsSync(path.join(dir, value.slice(5)))) err(`${label}: file not found: ${value}`);
  } else if (Array.isArray(value)) value.forEach((v) => checkPaths(label, v));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([k, v]) => checkPaths(`${label}.${k}`, v));
};
for (const f of fs.readdirSync(dir)) {
  if (f.endsWith('.csv')) table(f.replace(/\.csv$/, '')).forEach((r, i) => Object.entries(r).forEach(([k, v]) => k !== '__line' && checkPaths(`${f} row ${i + 2} ${k}`, v)));
  if (f.endsWith('.json') && settings[f.replace(/\.json$/, '')]) checkPaths(f, settings[f.replace(/\.json$/, '')]);
}

// ---- navigation links must point at something that exists
const catSlugs = new Set(cats.map((c) => s(c.slug)));
const nav = JSON.stringify(settings.navigation || {}) + JSON.stringify(settings.footer || {}) + banners.map((b) => s(b.link)).join(' ');
for (const m of nav.matchAll(/#\/category\/([a-z0-9-]+)/g)) if (!catSlugs.has(m[1])) err(`a menu, footer or banner links to #/category/${m[1]} but no such category exists`);
for (const m of nav.matchAll(/#\/blog\/([a-z0-9-]+)/g)) if (!blogs.some((b) => s(b.slug) === m[1])) err(`a menu, footer or banner links to #/blog/${m[1]} but no such article exists`);

// ---- company details left as placeholders
const company = Object.fromEntries(table('company').map((r) => [s(r.key), s(r.value)]));
if (/example\.com|^\+0+ /.test(`${company.email} ${company.phone} ${company.website}`)) warn('company.csv still has placeholder contact details (example.com / +00 ...)');

console.log(`Checked ${folder}/: ${content.length} content, ${cats.length} categories, ${blogs.length} articles, ${tags.length} tags.`);
warnings.forEach((m) => console.log('  warning: ' + m));
errors.forEach((m) => console.log('  ERROR:   ' + m));
console.log(errors.length ? `\n${errors.length} error(s), ${warnings.length} warning(s).` : `\nNo errors${warnings.length ? `, ${warnings.length} warning(s)` : ''}.`);
process.exit(errors.length ? 1 : 0);
