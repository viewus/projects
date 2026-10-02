/**
 * DataService: the ONLY module the UI uses to read data.
 *
 *   CSV / JSON / REST API  ->  provider.load()  ->  normalise + link  ->  DataService.getX()
 *
 * MediaHub is a multi-provider discovery platform:
 *   Provider (creator, business, brand, ...) -> platform accounts -> content -> category / tags
 *
 * Components never read CSV files. To move to a REST API, set
 * data/api.json -> "mode": "api" (+ apiBase). All fetching lives in services/api.js.
 * Every public method is async, so the UI does not care whether data is local or remote.
 */
import { fetchTable } from './api.js';
import { getConfig } from './config.js';
import { filterContent, configureFilters, resolvePlatformParam } from '../utils/filters.js';
import { sortContent } from '../utils/sorting.js';
import { tokenize, scoreContent, searchEntities } from '../utils/search.js';
import { slugify, num, bool, lc, parseDate, uniq, clamp } from '../utils/helpers.js';

/* ------------------------------------------------------------------ loading (file or API: see services/api.js + data/api.json) */
const TABLES = ['platforms', 'categories', 'subcategories', 'tags', 'content_tags', 'providers', 'provider_platforms', 'content', 'content_platforms', 'banners', 'blogs', 'businesses', 'popups', 'faq', 'glossary'];

async function loadTable(name) {
  try {
    return await fetchTable(name); // services/api.js decides: file or REST endpoint (see data/api.json)
  } catch (err) {
    console.warn(`[data] Could not load "${name}" (${err.message}). Continuing with no rows.`);
    return [];
  }
}

/* ------------------------------------------------------------------ normalisation */
const OK_STATUS = ['', 'active', 'published', 'live', '1', 'true', 'yes', 'public'];
const isOn = (r) => OK_STATUS.includes(lc(r.status));
const str = (v) => String(v ?? '').trim();
const safeMap = (rows, fn, table) => rows.flatMap((r) => {
  try { const out = fn(r); return out ? [out] : []; } catch (e) { console.warn(`[data] Skipped bad ${table} row (line ${r.__line}):`, e.message); return []; }
});
const splitList = (v) => str(v).split(/[;|]/).map((s) => lc(s)).filter(Boolean);
/** "instagram=https://...;youtube=https://..." -> { instagram: "https://...", youtube: "..." } */
const parseLinks = (v) => Object.fromEntries(str(v).split(';').map((p) => { const i = p.indexOf('='); return i > 0 ? [lc(p.slice(0, i)), p.slice(i + 1).trim()] : null; }).filter(Boolean));

export const PROVIDER_TYPES = ['creator', 'business', 'brand', 'organization', 'publisher', 'educator', 'influencer'];
const FALLBACK_PLATFORM = { id: 'website', name: 'Website', icon: 'fa-solid fa-globe', color: 'var(--mh-primary)', embed: false };

let db = null;
let initPromise = null;

function normalise(raw) {
  const platforms = new Map();
  safeMap(raw.platforms, (r) => {
    const id = lc(r.id || r.slug || r.name);
    if (!id || !isOn(r)) return null;
    const p = { id, name: str(r.name) || id, icon: str(r.icon) || FALLBACK_PLATFORM.icon, color: str(r.color) || 'var(--mh-primary)', embed: bool(r.embed_supported), url: str(r.profile_url), sort: num(r.sort_order, 99) };
    platforms.set(id, p); return p;
  }, 'platforms');

  const categories = safeMap(raw.categories, (r) => {
    const name = str(r.name); if (!name || !isOn(r)) return null;
    return { id: str(r.id) || slugify(name), name, slug: str(r.slug) || slugify(name), description: str(r.description), icon: str(r.icon) || 'fa-solid fa-folder',
      image: str(r.image), parentId: str(r.parent_id), sort: num(r.sort_order, 999), featured: bool(r.featured), color: str(r.color) || 'var(--mh-primary)' };
  }, 'categories').sort((a, b) => a.sort - b.sort);

  const subcategories = safeMap(raw.subcategories, (r) => {
    const name = str(r.name); if (!name || !isOn(r)) return null;
    return { id: str(r.id) || slugify(name), categoryId: str(r.category_id), name, slug: str(r.slug) || slugify(name), description: str(r.description),
      image: str(r.image), icon: str(r.icon), sort: num(r.sort_order, 999) };
  }, 'subcategories').sort((a, b) => a.sort - b.sort);

  const tags = safeMap(raw.tags, (r) => {
    const name = str(r.name).replace(/^#/, ''); if (!name || !isOn(r)) return null;
    return { id: str(r.id) || slugify(name), name, slug: str(r.slug) || lc(name), description: str(r.description), usageCsv: num(r.usage_count), featured: bool(r.featured) };
  }, 'tags');

  const providers = safeMap(raw.providers, (r) => {
    const name = str(r.name); if (!name || !isOn(r)) return null;
    const type = lc(r.provider_type);
    return { id: str(r.id) || slugify(name), name, slug: str(r.slug) || slugify(name), type: PROVIDER_TYPES.includes(type) ? type : 'creator',
      username: str(r.username).replace(/^@/, '') || slugify(name).replace(/-/g, ''), avatar: str(r.avatar), logo: str(r.logo), bio: str(r.bio), description: str(r.description) || str(r.bio),
      website: str(r.website), email: str(r.email), phone: str(r.phone), location: str(r.location), categoryId: str(r.category_id), featured: bool(r.featured), verified: bool(r.verified) };
  }, 'providers');

  const providerPlatforms = safeMap(raw.provider_platforms, (r) => {
    const providerId = str(r.provider_id); const platform = lc(r.platform);
    if (!providerId || !platform || !isOn(r)) return null;
    return { id: str(r.id), providerId, platform, username: str(r.username).replace(/^@/, ''), url: str(r.profile_url), followers: num(r.followers), verified: bool(r.verified) };
  }, 'provider_platforms');

  const businesses = safeMap(raw.businesses, (r) => {
    const name = str(r.name); if (!name || !isOn(r)) return null;
    return { id: str(r.id) || slugify(name), name, slug: str(r.slug) || slugify(name), logo: str(r.logo), cover: str(r.cover), description: str(r.description),
      categoryId: str(r.category_id), location: str(r.location), website: str(r.website), phone: str(r.phone), email: str(r.email), social: parseLinks(r.social_links),
      tagSlugs: splitList(r.tags), featured: bool(r.featured) };
  }, 'businesses');

  const content = safeMap(raw.content, (r) => {
    const title = str(r.title); if (!title || !isOn(r)) return null;
    const d = parseDate(r.published_at);
    const id = str(r.id) || slugify(title);
    return { id, title, slug: str(r.slug) || `${slugify(title)}-${id}`, description: str(r.description), providerId: str(r.provider_id), platform: lc(r.platform) || 'website',
      type: lc(r.content_type) || 'post', categoryId: str(r.category_id), subcategoryId: str(r.subcategory_id), businessId: str(r.business_id),
      thumbnail: str(r.thumbnail), embedUrl: str(r.embed_url), externalUrl: str(r.external_url), duration: str(r.duration),
      publishedAt: d, ts: d ? d.getTime() : 0, views: num(r.views), likes: num(r.likes), comments: num(r.comments), shares: num(r.shares),
      featured: bool(r.featured), trending: bool(r.trending), popular: bool(r.popular), tagSlugs: splitList(r.tags) };
  }, 'content');

  // content_tags.csv joins by content id + tag (the tag's slug / unique id); the older tag_id column still works
  const contentTags = safeMap(raw.content_tags, (r) => { const t = lc(r.tag || r.tag_id); return str(r.content_id) && t ? { c: str(r.content_id), t } : null; }, 'content_tags');

  // the same content can be published on several platforms: content_platforms.csv lists the extra ones
  const extraPlatforms = new Map();
  safeMap(raw.content_platforms, (r) => {
    const cid = str(r.content_id); const platform = lc(r.platform); if (!cid || !platform) return null;
    const a = extraPlatforms.get(cid) || []; a.push({ platform, type: lc(r.content_type), externalUrl: str(r.external_url), embedUrl: str(r.embed_url), views: num(r.views), likes: num(r.likes) }); extraPlatforms.set(cid, a); return null;
  }, 'content_platforms');

  const blogs = safeMap(raw.blogs, (r) => {
    const title = str(r.title); if (!title || !isOn(r)) return null;
    const d = parseDate(r.published_at);
    return { id: str(r.id) || slugify(title), title, slug: str(r.slug) || slugify(title), excerpt: str(r.excerpt), content: String(r.content ?? ''), author: str(r.author) || 'MediaHub Team',
      categoryId: str(r.category_id) || str(r.category), tagSlugs: splitList(r.tags), thumbnail: str(r.thumbnail), publishedAt: d, ts: d ? d.getTime() : 0, featured: bool(r.featured) };
  }, 'blogs').sort((a, b) => b.ts - a.ts);

  const banners = safeMap(raw.banners, (r) => {
    if (!isOn(r)) return null;
    const title = str(r.title); if (!title) return null;
    return { id: str(r.id), title, subtitle: str(r.subtitle), description: str(r.description), image: str(r.image), mobileImage: str(r.mobile_image), link: str(r.link),
      buttonText: str(r.button_text), position: lc(r.position) || 'promo', categoryId: str(r.category_id), providerId: str(r.provider_id), start: parseDate(r.start_date),
      end: parseDate(r.end_date), priority: num(r.priority), icon: str(r.icon) };
  }, 'banners');

  const popups = safeMap(raw.popups, (r) => {
    if (!isOn(r) || !str(r.id) || !(str(r.title) || str(r.message))) return null;
    return { id: str(r.id), title: str(r.title), message: str(r.message), image: str(r.image), buttonText: str(r.button_text), link: str(r.link), page: lc(r.page) || 'all',
      delay: Math.max(0, num(r.delay_seconds, 3)), frequency: ['once', 'session', 'always'].includes(lc(r.frequency)) ? lc(r.frequency) : 'once', start: parseDate(r.start_date), end: parseDate(r.end_date), priority: num(r.priority) };
  }, 'popups');

  const faq = safeMap(raw.faq || [], (r) => (isOn(r) && str(r.question) && str(r.answer) ? { id: str(r.id) || slugify(r.question), question: str(r.question), answer: str(r.answer), category: str(r.category), sort: num(r.sort_order, 999) } : null), 'faq').sort((a, b) => a.sort - b.sort);
  const glossary = safeMap(raw.glossary || [], (r) => (isOn(r) && str(r.term) && str(r.definition) ? { term: str(r.term), definition: str(r.definition), category: str(r.category) } : null), 'glossary').sort((a, b) => a.term.localeCompare(b.term));
  return { platforms, categories, subcategories, tags, providers, providerPlatforms, businesses, content, contentTags, blogs, banners, extraPlatforms, popups, faq, glossary };
}

function link(n) {
  const byId = (arr) => new Map(arr.map((x) => [x.id, x]));
  const bySlug = (arr) => new Map(arr.map((x) => [x.slug, x]));
  const idx = {
    category: byId(n.categories), categoryS: bySlug(n.categories), sub: byId(n.subcategories), subS: bySlug(n.subcategories),
    tag: byId(n.tags), tagS: bySlug(n.tags), provider: byId(n.providers), providerS: bySlug(n.providers), business: byId(n.businesses), businessS: bySlug(n.businesses),
    content: byId(n.content), contentS: bySlug(n.content), blogS: bySlug(n.blogs),
  };

  const tagsOfContent = new Map();
  const addTag = (cid, tag) => { if (!tag) return; const a = tagsOfContent.get(cid) || []; if (!a.includes(tag)) a.push(tag); tagsOfContent.set(cid, a); };
  n.contentTags.forEach(({ c, t }) => addTag(c, idx.tag.get(t) || idx.tagS.get(t)));
  n.content.forEach((it) => it.tagSlugs.forEach((s) => addTag(it.id, idx.tagS.get(s))));

  const inc = (m, k) => k && m.set(k, (m.get(k) || 0) + 1);
  const add = (m, k, v) => { if (!k) return; const s = m.get(k) || new Set(); s.add(v); m.set(k, s); };
  const stats = { cat: new Map(), sub: new Map(), tag: new Map(), provider: new Map(), biz: new Map(), catProviders: new Map(), tagCats: new Map() };

  n.content.forEach((it) => {
    it.provider = idx.provider.get(it.providerId) || null;
    it.category = idx.category.get(it.categoryId) || null;
    it.subcategory = idx.sub.get(it.subcategoryId) || null;
    it.business = idx.business.get(it.businessId) || null;
    it.tags = tagsOfContent.get(it.id) || [];
    // all the places this content lives: the main one first, then the others
    it.availableOn = [{ platform: it.platform, type: it.type, externalUrl: it.externalUrl, embedUrl: it.embedUrl, views: it.views, likes: it.likes, info: null }, ...(n.extraPlatforms.get(it.id) || [])]
      .map((a) => ({ ...a, info: n.platforms.get(a.platform) || { ...FALLBACK_PLATFORM, id: a.platform, name: a.platform.replace(/^./, (c) => c.toUpperCase()) } }));
    it.platformIds = it.availableOn.map((a) => a.platform);
    it.platformInfo = n.platforms.get(it.platform) || { ...FALLBACK_PLATFORM, id: it.platform, name: it.platform.replace(/^./, (c) => c.toUpperCase()) };
    it.url = `/content/${it.slug}`;
    it.hay = lc([it.title, it.description, it.provider?.name, it.provider?.username, it.category?.name, it.subcategory?.name, it.platformInfo.name, it.type, it.tags.map((t) => t.name).join(' ')].join(' '));
    inc(stats.cat, it.categoryId); inc(stats.sub, it.subcategoryId); inc(stats.provider, it.providerId); inc(stats.biz, it.businessId);
    it.tags.forEach((t) => { inc(stats.tag, t.id); if (it.categoryId) { const m = stats.tagCats.get(t.id) || new Map(); m.set(it.categoryId, (m.get(it.categoryId) || 0) + 1); stats.tagCats.set(t.id, m); } });
    add(stats.catProviders, it.categoryId, it.providerId);
  });

  n.providers.forEach((p) => {
    // one provider, many platform accounts
    p.platforms = n.providerPlatforms.filter((x) => x.providerId === p.id).map((x) => ({ ...x, info: n.platforms.get(x.platform) || { ...FALLBACK_PLATFORM, id: x.platform, name: x.platform } }))
      .sort((a, b) => b.followers - a.followers);
    p.followers = p.platforms.reduce((s, x) => s + x.followers, 0);
    p.platformInfo = p.platforms[0]?.info || FALLBACK_PLATFORM;
    p.category = idx.category.get(p.categoryId) || null;
    p.contentCount = stats.provider.get(p.id) || 0;
    p.url = `/provider/${p.slug}`;
  });
  n.categories.forEach((c) => {
    c.count = stats.cat.get(c.id) || 0;
    c.providerCount = stats.catProviders.get(c.id)?.size || 0;
    c.subs = n.subcategories.filter((s) => s.categoryId === c.id);
    c.url = `/category/${c.slug}`;
  });
  n.subcategories.forEach((s) => { s.category = idx.category.get(s.categoryId) || null; s.count = stats.sub.get(s.id) || 0; });
  n.tags.forEach((t) => {
    t.count = stats.tag.get(t.id) ?? t.usageCsv;
    const cats = [...(stats.tagCats.get(t.id) || new Map()).entries()].sort((a, b) => b[1] - a[1]);
    t.categoryId = cats[0]?.[0] || '';
    t.category = idx.category.get(t.categoryId) || null; // most common category of the tagged content
    t.url = `/tag/${t.slug}`;
  });
  n.businesses.forEach((b) => {
    b.category = idx.category.get(b.categoryId) || null;
    b.tags = b.tagSlugs.map((s) => idx.tagS.get(s)).filter(Boolean);
    b.contentCount = stats.biz.get(b.id) || 0;
    b.url = `/business/${b.slug}`;
  });
  n.blogs.forEach((b) => {
    b.category = idx.category.get(b.categoryId) || idx.categoryS.get(b.categoryId) || null;
    b.tags = b.tagSlugs.map((s) => idx.tagS.get(s)).filter(Boolean);
    b.url = `/blog/${b.slug}`;
  });
  return { ...n, idx };
}

/* ------------------------------------------------------------------ helpers */
const activeNow = (b, now = new Date()) => (!b.start || b.start <= now) && (!b.end || new Date(b.end.getTime() + 864e5 - 1) >= now);
const paginate = (list, page, size) => {
  const total = list.length;
  const pageSize = Math.max(1, size);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const p = clamp(parseInt(page, 10) || 1, 1, pages);
  return { items: list.slice((p - 1) * pageSize, p * pageSize), total, page: p, pages, pageSize };
};
const lookup = (map, mapS, v) => map.get(String(v)) || mapS.get(lc(v)) || null;

/* ------------------------------------------------------------------ public API */
export const DataService = {
  /** Loads and links all tables once. Safe to call repeatedly. */
  init() {
    if (!initPromise) {
      initPromise = (async () => {
        const cfg = getConfig();
        configureFilters({ pills: cfg.platforms?.filters || [] });
        const loaded = await Promise.all(TABLES.map((t) => loadTable(t)));
        const raw = Object.fromEntries(TABLES.map((t, i) => [t, loaded[i]]));
        db = link(normalise(raw));
        if (!db.content.length) console.warn('[data] No content rows were loaded.');
      })();
    }
    return initPromise;
  },

  /* ---------- platforms */
  async getPlatforms() { return [...db.platforms.values()].sort((a, b) => a.sort - b.sort); },
  async getPlatform(id) { return db.platforms.get(lc(id)) || null; },

  /* ---------- categories */
  async getCategories({ featured, limit, platform, hideEmpty = false, sort = 'order' } = {}) {
    let list = db.categories.filter((c) => !c.parentId);
    if (featured) list = list.filter((c) => c.featured);
    if (platform) {
      const items = filterContent(db.content, { platform });
      const counts = new Map();
      items.forEach((i) => counts.set(i.categoryId, (counts.get(i.categoryId) || 0) + 1));
      list = list.map((c) => ({ ...c, count: counts.get(c.id) || 0 }));
    }
    if (hideEmpty) list = list.filter((c) => c.count > 0);
    if (sort === 'popular') list = [...list].sort((a, b) => b.count - a.count);
    if (sort === 'alpha') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'new') list = [...list].sort((a, b) => Number(b.id) - Number(a.id));
    return limit ? list.slice(0, limit) : list;
  },
  async getCategory(slugOrId) { return lookup(db.idx.category, db.idx.categoryS, slugOrId); },
  async getSubcategories(categorySlugOrId) {
    const c = lookup(db.idx.category, db.idx.categoryS, categorySlugOrId);
    return c ? c.subs : [];
  },
  async getSubcategory(slugOrId) { return lookup(db.idx.sub, db.idx.subS, slugOrId); },

  /* ---------- tags */
  async getTags({ featured, limit, categoryId, sort = 'usage' } = {}) {
    let list = [...db.tags];
    if (featured) list = list.filter((t) => t.featured);
    if (categoryId) list = list.filter((t) => t.categoryId === String(categoryId));
    list.sort(sort === 'name' ? (a, b) => a.name.localeCompare(b.name) : (a, b) => b.count - a.count || a.name.localeCompare(b.name));
    return limit ? list.slice(0, limit) : list;
  },
  async getTag(slug) { return lookup(db.idx.tag, db.idx.tagS, slug); },
  /** Tags used inside a content list (most used first). */
  async getTagsFor(items, limit = 12) {
    const m = new Map();
    items.forEach((i) => i.tags.forEach((t) => m.set(t, (m.get(t) || 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([t]) => t);
  },

  /* ---------- providers (creators, businesses, brands, ...) */
  async getProviders({ type, featured, category, platform, q, sort = 'followers', limit, page, pageSize } = {}) {
    let list = [...db.providers];
    if (type) { const ts = String(type).split(',').map(lc); list = list.filter((p) => ts.includes(p.type)); }
    if (featured) list = list.filter((p) => p.featured);
    if (category) { const ids = String(category).split(',').map((s) => lookup(db.idx.category, db.idx.categoryS, s)?.id).filter(Boolean); list = list.filter((x) => ids.includes(x.categoryId)); }
    if (platform) {
      const { platforms } = resolvePlatformParam(platform);
      if (platforms.size) list = list.filter((p) => p.platforms.some((a) => platforms.has(a.platform)));
    }
    const tokens = tokenize(q);
    if (tokens.length) list = searchEntities(list, tokens, (p) => [[p.name, 8], [p.username, 8], [p.bio, 1.5], [p.type, 3], [p.category?.name, 3], [p.location, 2]]);
    else list.sort(sort === 'name' ? (a, b) => a.name.localeCompare(b.name) : (a, b) => b.followers - a.followers);
    if (page) return paginate(list, page, pageSize || 12);
    return limit ? list.slice(0, limit) : list;
  },
  async getProvider(slugOrId) { return lookup(db.idx.provider, db.idx.providerS, slugOrId); },
  async getProviderPlatforms(providerSlugOrId) {
    const p = lookup(db.idx.provider, db.idx.providerS, providerSlugOrId);
    return p ? p.platforms : [];
  },
  /** Profile extras: categories they publish in, their most-used tags and totals. */
  async getProviderInsights(provider) {
    const items = db.content.filter((i) => i.providerId === provider.id);
    const cats = new Map(); const tags = new Map();
    items.forEach((i) => { if (i.category) cats.set(i.category, (cats.get(i.category) || 0) + 1); i.tags.forEach((t) => tags.set(t, (tags.get(t) || 0) + 1)); });
    const top = (m, n) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
    return { categories: top(cats, 6), tags: top(tags, 10), total: items.length, views: items.reduce((s, i) => s + i.views, 0), likes: items.reduce((s, i) => s + i.likes, 0) };
  },

  /* ---------- content */
  /** query: {platform,type,category,subcategory,tag,provider,business,q,flag,range,sort,page,pageSize,ids,exclude} */
  async getContent(query = {}) {
    const { sort = 'latest', page = 1, pageSize = getConfig().site?.pageSize || 12, q } = query;
    const tokens = tokenize(q);
    let items = filterContent(db.content, { ...query, tokens: tokens.length ? tokens : null });
    const key = sort === 'relevance' && !tokens.length ? 'latest' : sort;
    items = sortContent(items, key, tokens.length ? (it) => scoreContent(it, tokens) : null);
    return paginate(items, page, pageSize);
  },
  /** Unpaginated, filtered + sorted list (small sections and aggregations). */
  async listContent(query = {}) {
    const { sort = 'latest', limit } = query;
    const tokens = tokenize(query.q);
    const items = sortContent(filterContent(db.content, { ...query, tokens: tokens.length ? tokens : null }), sort, tokens.length ? (it) => scoreContent(it, tokens) : null);
    return limit ? items.slice(0, limit) : items;
  },
  async getContentByProvider(providerSlugOrId, query = {}) {
    const p = lookup(db.idx.provider, db.idx.providerS, providerSlugOrId);
    return this.getContent({ ...query, provider: p ? p.slug : '__none__' });
  },
  async getContentItem(slugOrId) { return lookup(db.idx.content, db.idx.contentS, slugOrId); },
  async getTrending(limit = 10, filters = {}) { return this.listContent({ ...filters, sort: 'trending', limit }); },
  async getPopular(limit = 10, filters = {}) { return this.listContent({ ...filters, sort: 'popular', limit }); },
  async getLatest(limit = 10, filters = {}) { return this.listContent({ ...filters, sort: 'latest', limit }); },
  async getFeatured(limit = 6, filters = {}) {
    const f = await this.listContent({ ...filters, flag: 'featured', sort: 'trending' });
    if (f.length >= limit) return f.slice(0, limit);
    const more = await this.listContent({ ...filters, sort: 'trending' });
    return uniq([...f, ...more]).slice(0, limit);
  },
  async getRelated(item, limit = 8) {
    const mine = new Set(item.tags.map((t) => t.id));
    return db.content.filter((o) => o.id !== item.id).map((o) => {
      let s = 0;
      o.tags.forEach((t) => { if (mine.has(t.id)) s += 3; });
      if (o.subcategoryId && o.subcategoryId === item.subcategoryId) s += 3;
      if (o.categoryId === item.categoryId) s += 2;
      if (o.providerId === item.providerId) s += 1;
      return { o, s };
    }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || b.o.ts - a.o.ts).slice(0, limit).map((x) => x.o);
  },
  async getMoreFromProvider(item, limit = 8) {
    return sortContent(db.content.filter((o) => o.providerId === item.providerId && o.id !== item.id), 'trending').slice(0, limit);
  },

  /* ---------- banners */
  async getBanners({ position, categoryId, providerId, limit } = {}) {
    let list = db.banners.filter((b) => activeNow(b));
    if (position) list = list.filter((b) => b.position === lc(position));
    if (categoryId) list = list.filter((b) => b.categoryId === String(categoryId));
    if (providerId) list = list.filter((b) => b.providerId === String(providerId));
    list.sort((a, b) => b.priority - a.priority || Number(a.id) - Number(b.id));
    return limit ? list.slice(0, limit) : list;
  },

  /* ---------- faq + glossary (data/faq.csv, data/glossary.csv) */
  async getFaq({ category, limit } = {}) { const list = category ? db.faq.filter((f) => lc(f.category) === lc(category)) : db.faq; return limit ? list.slice(0, limit) : list; },
  async getGlossary() { return db.glossary; },

  /* ---------- popups (data/popups.csv) */
  /** Popups that apply to a route, inside their date window, highest priority first. page: "home", "all", "category/travel", "trending"... */
  async getPopups({ path = '/' } = {}) {
    const route = path.replace(/^\/|\/$/g, '') || 'home';
    return db.popups.filter((p) => activeNow(p) && (p.page === 'all' || p.page === route || route.startsWith(`${p.page}/`))).sort((a, b) => b.priority - a.priority);
  },

  /* ---------- blogs */
  async getBlogs({ category, tag, featured, limit, page, pageSize } = {}) {
    let list = [...db.blogs];
    if (category) { const c = lookup(db.idx.category, db.idx.categoryS, category); list = c ? list.filter((b) => b.category?.id === c.id) : []; }
    if (tag) list = list.filter((b) => b.tags.some((t) => t.slug === lc(tag)));
    if (featured) list = list.filter((b) => b.featured);
    if (page) return paginate(list, page, pageSize || 9);
    return limit ? list.slice(0, limit) : list;
  },
  async getBlog(slug) { return db.idx.blogS.get(lc(slug)) || null; },

  /* ---------- businesses (a directory, not a marketplace) */
  async getBusinesses({ category, featured, limit, q } = {}) {
    let list = [...db.businesses];
    if (category) { const c = lookup(db.idx.category, db.idx.categoryS, category); list = c ? list.filter((b) => b.categoryId === c.id) : []; }
    if (featured) list = list.filter((b) => b.featured);
    const tokens = tokenize(q);
    if (tokens.length) list = searchEntities(list, tokens, (b) => [[b.name, 8], [b.description, 1.5], [b.location, 3], [b.category?.name, 3], [b.tags.map((t) => t.name).join(' '), 4]]);
    else list.sort((a, b) => Number(b.featured) - Number(a.featured));
    return limit ? list.slice(0, limit) : list;
  },
  async getBusiness(slug) { return lookup(db.idx.business, db.idx.businessS, slug); },

  /* ---------- search */
  /** Grouped results for the search page and the header suggestions. */
  async search(q, { limit = 6 } = {}) {
    const tokens = tokenize(q);
    if (!tokens.length) return { tokens, content: [], providers: [], categories: [], tags: [], blogs: [], businesses: [] };
    const found = await this.listContent({ q, sort: 'relevance', limit });
    return {
      tokens,
      content: found,
      providers: searchEntities(db.providers, tokens, (p) => [[p.name, 8], [p.username, 8], [p.bio, 1.5], [p.type, 3], [p.category?.name, 3]], limit),
      categories: searchEntities(db.categories, tokens, (c) => [[c.name, 8], [c.description, 1.5], [c.subs.map((s) => s.name).join(' '), 3]], limit),
      tags: searchEntities(db.tags, tokens, (t) => [[t.name, 8], [t.description, 1.5]], limit),
      blogs: searchEntities(db.blogs, tokens, (b) => [[b.title, 8], [b.excerpt, 2], [b.author, 2], [b.tags.map((t) => t.name).join(' '), 4]], limit),
      businesses: searchEntities(db.businesses, tokens, (b) => [[b.name, 8], [b.description, 1.5], [b.location, 3], [b.category?.name, 3]], limit),
    };
  },

  /* ---------- misc */
  async getStats() {
    return {
      categories: db.categories.length, subcategories: db.subcategories.length, tags: db.tags.length, providers: db.providers.length,
      content: db.content.length, platforms: new Set(db.content.map((c) => c.platform)).size, businesses: db.businesses.length, blogs: db.blogs.length,
    };
  },
  async getFilterOptions() {
    return {
      categories: db.categories.filter((c) => !c.parentId), subcategories: db.subcategories,
      providers: [...db.providers].sort((a, b) => a.name.localeCompare(b.name)), tags: [...db.tags].sort((a, b) => b.count - a.count),
    };
  },
  /** All slugs, for the sitemap generator and debugging. */
  async getAllSlugs() {
    return { content: db.content.map((c) => c.slug), categories: db.categories.map((c) => c.slug), providers: db.providers.map((p) => p.slug),
      tags: db.tags.map((t) => t.slug), blogs: db.blogs.map((b) => b.slug), businesses: db.businesses.map((b) => b.slug) };
  },
};
