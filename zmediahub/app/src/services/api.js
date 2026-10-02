/**
 * The ONE place that knows where data comes from.
 *
 *   data/api.json  = the registry: for every table / settings file it lists the local FILE and the REST ENDPOINT.
 *   this module    = reads that registry and fetches either the file or the endpoint.
 *
 * Nothing else in the app calls fetch() for content, settings or theme. To move to a real backend:
 *   1. open data/api.json
 *   2. set "mode": "api" and "apiBase": "https://your-api.example.com/v1" (optional "headers": { "Authorization": "Bearer ..." })
 *   3. make each endpoint return the same shape as the file it replaces (see README -> "Moving to an API").
 * A single resource can use a different source than the rest with  "source": "file" | "api"  on its entry.
 *
 * Two more switches:
 *   - "url": "https://..." on any entry loads THAT address directly (for example a Google Sheet published as CSV:
 *     File > Share > Publish to web > pick the sheet > CSV). Non-developers can then edit content in a spreadsheet.
 *   - "basePath": "data_lawknowledge/" points the whole site at another dataset folder. Image paths written as
 *     "data/media/..." inside the files are re-pointed to that folder automatically.
 */
import { parseCSV } from '../utils/csvParser.js';

/** Built-in defaults so the site still works if data/api.json is missing. */
export const API_DEFAULTS = {
  mode: 'files', // "files" -> read from /data   |   "api" -> call apiBase + endpoint
  basePath: 'data/', // folder that holds the files
  apiBase: '',
  headers: {},
  version: '', // cache-buster appended to file URLs (change it after editing data to bypass browser caches)
  resources: { settings: {}, tables: {}, keyValues: {} },
};

let API = API_DEFAULTS;
export const getApiConfig = () => API;

export async function loadApiConfig() {
  try {
    const res = await fetch(`${API_DEFAULTS.basePath}api.json`);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const j = await res.json();
    j.basePath = String(j.basePath || API_DEFAULTS.basePath).replace(/\/?$/, '/');
    API = { ...API_DEFAULTS, ...j, headers: { ...(j.headers || {}) }, resources: { ...API_DEFAULTS.resources, ...(j.resources || {}) } };
  } catch (err) {
    console.warn(`[api] Could not load ${API_DEFAULTS.basePath}api.json (${err.message}). Using built-in defaults.`);
    API = API_DEFAULTS;
  }
  return API;
}

/* ----------------------------------------------------------------- helpers */
const entryFor = (group, name, ext) => {
  const e = API.resources?.[group]?.[name] || {};
  return { file: e.file || `${name}.${ext}`, endpoint: e.endpoint || `/${name}`, url: e.url || '', source: e.url ? 'url' : e.source || API.mode };
};
/** Image/file paths inside the data are written as "data/..."; when basePath points elsewhere, re-point them. */
const rebase = (v) => {
  const to = String(API.basePath || 'data/').replace(/\/?$/, '/');
  if (to === 'data/') return v;
  if (typeof v === 'string') return v.startsWith('data/') ? to + v.slice(5) : v;
  if (Array.isArray(v)) return v.map(rebase);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, rebase(x)]));
  return v;
};
const versioned = (u) => (API.version ? `${u}${u.includes('?') ? '&' : '?'}v=${encodeURIComponent(API.version)}` : u);
const fileUrl = (file) => versioned(`${API.basePath || 'data/'}${file}`);
const apiUrl = (endpoint) => `${String(API.apiBase || '').replace(/\/$/, '')}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
const get = async (url, isApi) => {
  const res = await fetch(url, isApi ? { headers: { Accept: 'application/json', ...(API.headers || {}) } } : undefined);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res;
};
/** APIs often wrap lists as { data: [...] } / { items: [...] } / { results: [...] } */
const unwrap = (body) => (Array.isArray(body) ? body : body && (body.data ?? body.items ?? body.results) !== undefined ? (body.data ?? body.items ?? body.results) : body);

/* ----------------------------------------------------------------- public fetchers */
/** A table of rows (content, providers, categories ...). Same column names whether it comes from CSV, JSON or an API. */
export async function fetchTable(name) {
  const e = entryFor('tables', name, 'csv');
  if (e.source === 'api') {
    const body = unwrap(await (await get(apiUrl(e.endpoint), true)).json());
    return rebase(Array.isArray(body) ? body : []);
  }
  const target = e.source === 'url' ? e.url : e.file;
  const res = await get(e.source === 'url' ? e.url : fileUrl(e.file));
  if (/\.json(\?|$)/i.test(target)) { const body = unwrap(await res.json()); return rebase(Array.isArray(body) ? body : []); }
  const { rows, errors } = parseCSV(await res.text());
  if (errors.length) console.warn(`[data] ${target}:`, errors.slice(0, 5).join(' | '));
  return rebase(rows);
}

/** A settings object (site, theme, navigation, sections ...). */
export async function fetchSettings(name) {
  const e = entryFor('settings', name, 'json');
  try {
    const body = e.source === 'api' ? await (await get(apiUrl(e.endpoint), true)).json() : await (await get(e.source === 'url' ? e.url : fileUrl(e.file))).json();
    const out = unwrap(body);
    return out && typeof out === 'object' ? rebase(out) : {};
  } catch (err) {
    console.warn(`[config] Could not load settings "${name}" (${err.message}). Using defaults.`);
    return {};
  }
}

/** key,value tables (seo, company). Dotted keys become nested objects: "pages.about.title" -> { pages: { about: { title } } }. */
export async function fetchKeyValues(name) {
  const e = entryFor('keyValues', name, 'csv');
  const out = {};
  try {
    let rows;
    if (e.source === 'api') {
      const body = unwrap(await (await get(apiUrl(e.endpoint), true)).json());
      rows = Array.isArray(body) ? body : Object.entries(body || {}).map(([key, value]) => ({ key, value }));
    } else {
      rows = parseCSV(await (await get(e.source === 'url' ? e.url : fileUrl(e.file))).text()).rows;
    }
    rows.forEach((r) => {
      const key = String(r.key || '').trim();
      if (!key) return;
      const parts = key.split('.');
      let o = out;
      parts.slice(0, -1).forEach((p) => { o = o[p] && typeof o[p] === 'object' ? o[p] : (o[p] = {}); });
      o[parts[parts.length - 1]] = rebase(r.value ?? '');
    });
  } catch (err) {
    console.warn(`[config] Could not load "${name}" (${err.message}). Using defaults.`);
  }
  return out;
}
