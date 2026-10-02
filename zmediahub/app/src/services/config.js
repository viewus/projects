/**
 * Loads every JSON settings file in data/ (site, theme, navigation, ...) and applies the theme as CSS variables,
 * so the whole visual identity can be changed without touching components.
 */
import { setPlaceholder } from '../utils/helpers.js';
import { loadApiConfig, fetchSettings, fetchKeyValues } from './api.js';

const FILES = ['site', 'theme', 'navigation', 'platforms', 'sections', 'footer', 'pages', 'tag-images'];
/** key,value tables; dotted keys become nested objects (pages.about.title). */
const KEY_VALUE_TABLES = ['seo', 'company'];
const keyOf = (name) => name.replace(/-(\w)/g, (m, c) => c.toUpperCase());
let CONFIG = null;

export const getConfig = () => CONFIG;

export async function loadConfig() {
  if (CONFIG) return CONFIG;
  await loadApiConfig(); // data/api.json: where every file / endpoint lives
  const [settings, kv] = await Promise.all([Promise.all(FILES.map((f) => fetchSettings(f))), Promise.all(KEY_VALUE_TABLES.map((n) => fetchKeyValues(n)))]);
  CONFIG = { ...Object.fromEntries(FILES.map((f, i) => [keyOf(f), settings[i]])), ...Object.fromEntries(KEY_VALUE_TABLES.map((n, i) => [n, kv[i]])) };
  setPlaceholder(CONFIG.site.placeholder);
  applyTheme(CONFIG.theme);
  const icon = document.querySelector('link[rel="icon"]'); if (icon && CONFIG.site.favicon) icon.setAttribute('href', CONFIG.site.favicon);
  return CONFIG;
}

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

export function applyTheme(theme = {}) {
  // a named preset (theme.preset) overrides the base colours; the rest of the theme is untouched
  const chosen = theme.presets?.[theme.preset]?.colors;
  if (chosen) theme = { ...theme, colors: { ...theme.colors, ...chosen } };
  const root = document.documentElement.style;
  const set = (prefix, obj) => Object.entries(obj || {}).forEach(([k, v]) => root.setProperty(`--mh-${prefix}${kebab(k)}`, v));
  set('', theme.colors);
  // every hex colour also gets an rgb triplet (--mh-ink-rgb ...) so CSS can build transparent tints: rgba(var(--mh-ink-rgb), .5)
  Object.entries(theme.colors || {}).forEach(([k, v]) => {
    const m = /^#([0-9a-f]{6})$/i.exec(String(v).trim());
    if (m) root.setProperty(`--mh-${kebab(k)}-rgb`, [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)).join(', '));
  });
  // decorative SVG patterns: absolute url() so they resolve the same from any stylesheet
  Object.entries(theme.patterns || {}).forEach(([k, v]) => root.setProperty(`--mh-pattern-${kebab(k)}`, v ? `url("${new URL(v, document.baseURI).href}")` : 'none'));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && theme.colors?.primary) meta.setAttribute('content', theme.colors.primary);
  set('radius-', theme.radius);
  set('shadow-', theme.shadow);
  set('space-', theme.spacing);
  const t = theme.typography || {};
  if (t.headingFont) root.setProperty('--mh-font-heading', t.headingFont);
  if (t.bodyFont) root.setProperty('--mh-font-body', t.bodyFont);
  if (t.baseSize) root.setProperty('--mh-font-size', t.baseSize);
  if (t.lineHeight) root.setProperty('--mh-line-height', t.lineHeight);
  if (t.googleFonts && !document.querySelector(`link[href="${t.googleFonts}"]`)) {
    const l = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: t.googleFonts });
    document.head.appendChild(l);
  }
}
