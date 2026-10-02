import { DataService } from '../services/dataService.js';
import { useApp, useAsync, useFeature, usePageSEO, useQuery } from '../hooks/index.jsx';
import { to } from '../utils/helpers.js';
import PageHero from '../components/PageHero.jsx';
import ScrollRow from '../components/ScrollRow.jsx';
import SearchBox from '../components/SearchBox.jsx';
import FilterBar from '../components/FilterBar.jsx';
import ContentGrid from '../components/ContentGrid.jsx';
import Pagination from '../components/Pagination.jsx';
import ProviderCard from '../components/ProviderCard.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import TagList from '../components/TagList.jsx';
import BlogCard from '../components/BlogCard.jsx';
import BusinessCard from '../components/BusinessCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { I, Skeleton } from '../components/ui.jsx';

const ALL_SCOPES = [['all', 'All'], ['content', 'Content'], ['providers', 'Providers'], ['categories', 'Categories'], ['tags', 'Tags'], ['blogs', 'Blogs'], ['businesses', 'Businesses']];

export default function Search() {
  const { config } = useApp();
  const [q, setQ] = useQuery();
  const bizOn = useFeature('businesses');
  const provOn = useFeature('providers');
  const SCOPES = ALL_SCOPES.filter(([k]) => (bizOn || k !== 'businesses') && (provOn || k !== 'providers'));
  const term = (q.q || '').trim();
  const scope = SCOPES.some(([k]) => k === q.scope) ? q.scope : 'all';
  const sort = q.sort || (term ? 'relevance' : 'latest');
  usePageSEO({ ...config.seo.pages.search, path: '/search', noindex: true });

  const { data: opts } = useAsync(async () => ({ ...(await DataService.getFilterOptions()), platforms: await DataService.getPlatforms() }), []);
  const filters = { platform: q.platform, category: q.category, subcategory: q.sub, tag: q.tag, provider: q.provider, type: q.type, range: q.range };
  const hasFilters = Object.values(filters).some(Boolean);

  const groups = useAsync(() => (term ? DataService.search(term, { limit: scope === 'all' ? 4 : 24 }) : null), [term, scope]);
  const content = useAsync(() => DataService.getContent({ ...filters, q: term, sort, page: q.page, pageSize: config.site.pageSize }), [term, q.platform, q.category, q.sub, q.tag, q.provider, q.type, q.range, sort, q.page]);

  const g = groups.data && !bizOn ? { ...groups.data, businesses: [] } : groups.data;
  const counts = g && { content: content.data?.total ?? 0, providers: g.providers.length, categories: g.categories.length, tags: g.tags.length, blogs: g.blogs.length, businesses: g.businesses.length };
  const subs = opts && q.category ? opts.subcategories.filter((s) => q.category.split(',').includes(s.category?.slug)) : [];

  const fields = opts && [
    { param: 'platform', label: 'Platform', all: 'All platforms', options: (config.platforms.filters || []).filter((p) => p.key !== 'all').map((p) => ({ value: p.key, label: p.label })) },
    { param: 'category', label: 'Category', all: 'All categories', options: opts.categories.map((c) => ({ value: c.slug, label: c.name })), resets: { sub: '' } },
    ...(subs.length ? [{ param: 'sub', label: 'Subcategory', all: 'All subcategories', options: subs.map((s) => ({ value: s.slug, label: s.name })) }] : []),
    ...(provOn ? [{ param: 'provider', label: 'Provider', all: 'All providers', options: opts.providers.map((p) => ({ value: p.slug, label: p.name })) }] : []),
    { param: 'tag', label: 'Tag', all: 'All tags', options: opts.tags.slice(0, 40).map((t) => ({ value: t.slug, label: `#${t.name}` })) },
    { param: 'type', label: 'Type', all: 'All types', options: config.site.contentTypes.map((t) => ({ value: t.key, label: t.label })) },
    { param: 'range', label: 'Date', all: 'Any time', options: config.site.dateRanges.filter((d) => d.key).map((d) => ({ value: d.key, label: d.label })) },
    { param: 'sort', label: 'Sort', all: term ? 'Most relevant' : 'Latest', options: config.site.sortOptions.map((s) => ({ value: s.key, label: s.label })) },
  ];

  const showContent = scope === 'all' || scope === 'content';
  const none = term && g && !content.data?.total && !g.providers.length && !g.categories.length && !g.tags.length && !g.blogs.length && !g.businesses.length;

  return (
    <>
      <PageHero {...config.pages.search} compact>
        <SearchBox variant="hero" initial={term} placeholder="Search content, providers, tags…" />
      </PageHero>
      <div className="container section--tight">
        {fields && <FilterBar fields={fields} clearKeys={['category', 'sub', 'provider', 'tag', 'type', 'range', 'sort', 'platform']} />}
        {term && (
          <ScrollRow className="tabs tabs--scroll" label="Result types">
            {SCOPES.map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={scope === k} className={`tab ${scope === k ? 'is-active' : ''}`} onClick={() => setQ({ scope: k === 'all' ? '' : k })}>
                {label}{counts && k !== 'all' && <em>{counts[k]}</em>}
              </button>
            ))}
          </ScrollRow>
        )}
        <div data-scroll-anchor />
        <p className="result-count" aria-live="polite">
          {term ? <>Results for <strong>“{term}”</strong></> : hasFilters ? 'Filtered content' : 'All content'} · {content.data?.total ?? 0} {content.data?.total === 1 ? 'item' : 'items'}
        </p>

        {none && <EmptyState icon="fa-solid fa-magnifying-glass" title={`No results for “${term}”`} text="Check the spelling, try a broader keyword or browse a category." action={{ href: '/categories', label: 'Browse categories' }} />}

        {g && scope !== 'content' && (
          <div className="results-groups">
            {g.categories.length > 0 && (scope === 'all' || scope === 'categories') && (
              <section><h2 className="group-title"><I c="fa-solid fa-table-cells-large" /> Categories</h2><div className="cat-grid cat-grid--compact">{g.categories.map((c) => <CategoryCard key={c.id} cat={c} variant="large" />)}</div></section>
            )}
            {g.tags.length > 0 && (scope === 'all' || scope === 'tags') && (
              <section><h2 className="group-title"><I c="fa-solid fa-hashtag" /> Tags</h2><TagList tags={g.tags} showCount /></section>
            )}
            {provOn && g.providers.length > 0 && (scope === 'all' || scope === 'providers') && (
              <section><h2 className="group-title"><I c="fa-solid fa-user-group" /> Creators & Businesses</h2><div className="provider-grid">{g.providers.map((p) => <ProviderCard key={p.id} provider={p} variant="profile" />)}</div></section>
            )}
            {g.blogs.length > 0 && (scope === 'all' || scope === 'blogs') && (
              <section><h2 className="group-title"><I c="fa-regular fa-newspaper" /> Blog</h2><div className="blog-grid blog-grid--3">{g.blogs.map((b) => <BlogCard key={b.id} post={b} />)}</div></section>
            )}
            {g.businesses.length > 0 && (scope === 'all' || scope === 'businesses') && (
              <section><h2 className="group-title"><I c="fa-solid fa-briefcase" /> Businesses</h2><div className="biz-grid">{g.businesses.map((b) => <BusinessCard key={b.id} biz={b} />)}</div></section>
            )}
          </div>
        )}

        {showContent && !none && (
          content.loading && !content.data ? <Skeleton rows={8} /> : (
            <section>
              {term && scope === 'all' && <h2 className="group-title"><I c="fa-regular fa-gem" /> Content</h2>}
              <ContentGrid items={content.data?.items} cols={4} empty={<EmptyState title="No content matches" text="Try removing a filter or searching for something broader." action={{ href: to('/search', { q: term }), label: 'Clear filters' }} />} />
              {content.data && <Pagination {...content.data} />}
            </section>
          )
        )}
      </div>
    </>
  );
}
