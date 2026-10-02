/**
 * Pure filtering helpers. All filters combine with AND, so
 * Food & Drinks + Instagram + Healthy Eating + Trending works exactly as expected.
 */
import { lc } from './helpers.js';

let PILLS = [];
export function configureFilters({ pills = [] } = {}) { PILLS = pills; }

export const csvList = (v) => (Array.isArray(v) ? v : String(v ?? '').split(','))
  .map((s) => lc(s)).filter(Boolean);

/** "instagram,reels" -> { platforms:Set(instagram), types:Set(reel) } using the pills in platforms.json. */
export function resolvePlatformParam(value) {
  const platforms = new Set(), types = new Set();
  csvList(value).forEach((key) => {
    if (key === 'all') return;
    const pill = PILLS.find((p) => p.key === key);
    if (pill?.type) types.add(lc(pill.type));
    else if (pill?.platform) platforms.add(lc(pill.platform));
    else platforms.add(key);
  });
  return { platforms, types };
}

const RANGE_DAYS = { day: 1, week: 7, month: 30, quarter: 90, year: 365 };
export function inRange(item, range) {
  const days = RANGE_DAYS[lc(range)];
  if (!days) return true;
  return item.ts >= Date.now() - days * 864e5;
}

export function filterContent(items, f = {}) {
  const { platforms, types: pillTypes } = resolvePlatformParam(f.platform);
  const types = new Set(csvList(f.type));
  const cats = new Set(csvList(f.category));
  const subs = new Set(csvList(f.subcategory));
  const tags = new Set(csvList(f.tag));
  const providers = new Set(csvList(f.provider));
  const ids = f.ids ? new Set(csvList(f.ids)) : null;
  const exclude = new Set(csvList(f.exclude));
  const flag = lc(f.flag);
  const tokens = f.tokens || null;

  return items.filter((it) => {
    if (platforms.size && !(it.platformIds || [it.platform]).some((p) => platforms.has(p))) return false;
    if (pillTypes.size && !(it.availableOn || [{ type: it.type }]).some((a) => pillTypes.has(a.type))) return false;
    if (types.size && !types.has(it.type)) return false;
    if (cats.size && !(it.category && (cats.has(it.category.slug) || cats.has(it.categoryId)))) return false;
    if (subs.size && !(it.subcategory && (subs.has(it.subcategory.slug) || subs.has(it.subcategoryId)))) return false;
    if (tags.size && !it.tags.some((t) => tags.has(t.slug))) return false;
    if (providers.size && !(it.provider && (providers.has(it.provider.slug) || providers.has(it.providerId)))) return false;
    if (f.business && String(it.businessId) !== String(f.business)) return false;
    if (ids && !ids.has(it.id)) return false;
    if (exclude.size && exclude.has(it.id)) return false;
    if (flag === 'trending' && !it.trending) return false;
    if (flag === 'popular' && !it.popular) return false;
    if (flag === 'featured' && !it.featured) return false;
    if (f.range && !inRange(it, f.range)) return false;
    if (tokens && !tokens.every((t) => it.hay.includes(t))) return false;
    return true;
  });
}
