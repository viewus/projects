/** Sorting for content lists. Each sorter is a pure comparison; ties fall back to newest first. */

export function trendScore(it) {
  const ageDays = Math.max(0, (Date.now() - it.ts) / 864e5);
  const recency = 0.55 + 0.45 / (1 + ageDays / 60);
  const engagement = it.likes * 2 + it.comments * 4 + it.shares * 5 + it.views * 0.05;
  return engagement * recency * (it.trending ? 2 : 1);
}

const byNewest = (a, b) => b.ts - a.ts || Number(b.id) - Number(a.id);

const SORTERS = {
  latest: byNewest,
  oldest: (a, b) => a.ts - b.ts || Number(a.id) - Number(b.id),
  views: (a, b) => b.views - a.views || byNewest(a, b),
  likes: (a, b) => b.likes - a.likes || byNewest(a, b),
  comments: (a, b) => b.comments - a.comments || byNewest(a, b),
  shares: (a, b) => b.shares - a.shares || byNewest(a, b),
  trending: (a, b) => trendScore(b) - trendScore(a) || byNewest(a, b),
  popular: (a, b) => (Number(b.popular) - Number(a.popular)) || b.views - a.views || byNewest(a, b),
  alpha: (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
};

export const SORT_KEYS = Object.keys(SORTERS);

export function sortContent(items, key = 'latest', scoreOf) {
  if (key === 'relevance' && scoreOf) {
    return [...items].sort((a, b) => scoreOf(b) - scoreOf(a) || byNewest(a, b));
  }
  return [...items].sort(SORTERS[key] || SORTERS.latest);
}
