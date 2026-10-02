/* Small, dependency-free utilities shared by every module. */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export const slugify = (s) =>
  String(s ?? '').toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const num = (v, d = 0) => {
  const n = parseFloat(String(v ?? '').replace(/[, ]/g, ''));
  return Number.isFinite(n) ? n : d;
};
export const bool = (v) => ['1', 'true', 'yes', 'y'].includes(String(v ?? '').trim().toLowerCase());
export const lc = (v) => String(v ?? '').trim().toLowerCase();
export const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
export const uniq = (arr) => [...new Set(arr)];
export const debounce = (fn, ms = 200) => {
  let t;
  const d = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  d.cancel = () => clearTimeout(t);
  return d;
};

/** 12400 -> 12.4K, 120000 -> 120K, 1250000 -> 1.2M */
export function formatNumber(n) {
  n = Number(n) || 0;
  const fmt = (v, s) => `${v < 100 ? (Math.round(v * 10) / 10).toString() : Math.round(v)}${s}`;
  if (n >= 1e9) return fmt(n / 1e9, 'B');
  if (n >= 1e6) return fmt(n / 1e6, 'M');
  if (n >= 1e3) return fmt(n / 1e3, 'K');
  return String(Math.round(n));
}

export function parseDate(v) {
  if (!v) return null;
  const s = String(v).trim();
  const d = /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00`) : new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}
export function formatDate(v, opts = { year: 'numeric', month: 'short', day: 'numeric' }) {
  const d = v instanceof Date ? v : parseDate(v);
  return d ? d.toLocaleDateString('en-US', opts) : '';
}
export function timeAgo(v) {
  const d = v instanceof Date ? v : parseDate(v);
  if (!d) return '';
  const days = Math.floor((Date.now() - d.getTime()) / 864e5);
  if (days < 0) return formatDate(d);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) { const w = Math.floor(days / 7); return `${w} week${w > 1 ? 's' : ''} ago`; }
  if (days < 365) { const m = Math.floor(days / 30); return `${m} month${m > 1 ? 's' : ''} ago`; }
  return formatDate(d);
}
/** "8:12" / "1:02:03" / 75 -> "1:15" ; invalid -> "" */
export function formatDuration(v) {
  const s = String(v ?? '').trim();
  if (!s) return '';
  if (/^\d+:\d{2}(:\d{2})?$/.test(s)) return s;
  const n = parseInt(s, 10);
  if (!Number.isFinite(n) || n <= 0) return '';
  const h = Math.floor(n / 3600), m = Math.floor((n % 3600) / 60), sec = n % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}

export const initials = (name) =>
  String(name ?? '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

/** Safe external URL (http/https only), else ''. */
export function safeUrl(u) {
  if (!String(u ?? '').trim()) return '';
  try {
    const url = new URL(String(u ?? '').trim(), location.href);
    return /^https?:$/.test(url.protocol) ? url.href : '';
  } catch { return ''; }
}

/** In-app route with query: to('/category/food', {tab:'new'}) -> "/category/food?tab=new" */
export function to(path, params) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const q = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '' || v === false) return;
    q.set(k, Array.isArray(v) ? v.join(',') : String(v));
  });
  const qs = q.toString();
  return `${p}${qs ? `?${qs}` : ''}`;
}

/** Normalise a data/config link: "#/trending" -> {internal:true,to:"/trending"}; https://.. -> external. */
export function linkTarget(link) {
  const l = String(link ?? '').trim();
  if (!l) return { internal: true, to: '/' };
  if (l.startsWith('#/')) return { internal: true, to: l.slice(1) };
  if (l.startsWith('/')) return { internal: true, to: l };
  const url = safeUrl(l);
  return url ? { internal: false, to: url } : { internal: true, to: '/' };
}

/** Central image helper: returns the path, or the fallback when missing. */
let PLACEHOLDER = 'data/media/images/placeholder.svg';
export const setPlaceholder = (p) => { if (p) PLACEHOLDER = p; };
export const getPlaceholder = () => PLACEHOLDER;
export function getImage(path, fallback) {
  const p = String(path ?? '').trim();
  return p || fallback || PLACEHOLDER;
}

/** Minimal, safe markdown: ##/### headings, - lists, paragraphs, **bold**, *em*, `code`, [text](url). */
export function md(text) {
  const inline = (s) => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|#[^)\s]*)\)/g, (m, t, u) =>
      `<a href="${u}"${u.startsWith('#') ? '' : ' target="_blank" rel="noopener noreferrer"'}>${t}</a>`);
  // a heading line always ends its block, even when the next line follows without a blank line
  const src = String(text ?? '').replace(/^(#{2,3}[ \t].+)\n(?!\n)/gm, '$1\n\n');
  return src.split(/\n{2,}/).map((block) => {
    const b = block.trim();
    if (!b) return '';
    if (/^###\s/.test(b)) return `<h3>${inline(b.replace(/^###\s+/, ''))}</h3>`;
    if (/^##\s/.test(b)) { const t = b.replace(/^##\s+/, ''); return `<h2 id="${slugify(t)}">${inline(t)}</h2>`; }
    const lines = b.split('\n');
    if (lines.every((l) => /^[-*]\s+/.test(l.trim()))) return `<ul>${lines.map((l) => `<li>${inline(l.trim().replace(/^[-*]\s+/, ''))}</li>`).join('')}</ul>`;
    return `<p>${lines.map((l) => inline(l)).join('<br>')}</p>`;
  }).join('\n');
}
export const readingTime = (text) => Math.max(1, Math.round(String(text ?? '').split(/\s+/).length / 200));

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    try {
      const ta = Object.assign(document.createElement('textarea'), { value: text, style: 'position:fixed;opacity:0' });
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy'); ta.remove(); return ok;
    } catch { return false; }
  }
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
