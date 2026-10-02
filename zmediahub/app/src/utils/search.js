/** Client-side search: tokenising + weighted scoring. Swap for an API call inside DataService later. */
import { lc } from './helpers.js';

export function tokenize(q) {
  return [...new Set(lc(q).replace(/[#@]/g, ' ').split(/[^a-z0-9&]+/).filter(Boolean))];
}

/** fields: [[text, weight], ...]. Returns 0 unless EVERY token matches at least one field. */
export function scoreFields(fields, tokens) {
  if (!tokens.length) return 0;
  let total = 0;
  for (const t of tokens) {
    let best = 0;
    for (const [text, weight] of fields) {
      if (!text) continue;
      const s = lc(text);
      const idx = s.indexOf(t);
      if (idx === -1) continue;
      const wordStart = idx === 0 || /[^a-z0-9]/.test(s[idx - 1]);
      best = Math.max(best, weight * (wordStart ? 1.6 : 1) * (s === t ? 1.5 : 1));
    }
    if (!best) return 0;
    total += best;
  }
  return total;
}

export const contentFields = (it) => [
  [it.title, 8], [it.provider?.name, 5], [it.provider?.username, 5],
  [it.tags.map((t) => t.name).join(' '), 5],
  [it.category?.name, 4], [it.subcategory?.name, 4], [it.platformInfo?.name, 3], [it.description, 1.5],
];

export function scoreContent(it, tokens) { return scoreFields(contentFields(it), tokens); }

export function searchEntities(list, tokens, fieldsOf, limit = 50) {
  return list
    .map((e) => ({ e, s: scoreFields(fieldsOf(e), tokens) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.e);
}
