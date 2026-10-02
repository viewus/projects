import { DataService } from '../services/dataService.js';
import { useApp, useAsync, usePageSEO, useQuery } from '../hooks/index.jsx';
import PageHero from '../components/PageHero.jsx';
import FilterBar from '../components/FilterBar.jsx';
import ContentGrid from '../components/ContentGrid.jsx';
import Pagination from '../components/Pagination.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { I, Skeleton } from '../components/ui.jsx';

/** One template for /trending, /popular and /new: same grid and filters, different query. */
export default function Listing({ kind }) {
  const { config } = useApp();
  const copy = config.pages[kind];
  const [q] = useQuery();
  const sort = q.sort || copy.sort;
  usePageSEO({ ...config.seo.pages[kind], image: copy.image, path: `/${kind}` }, [kind]);

  const { data: opts } = useAsync(async () => ({ cats: await DataService.getCategories(), subs: await DataService.getSubcategories(q.category && !q.category.includes(',') ? q.category : '-'), platforms: await DataService.getPlatforms() }), [q.category]);
  const flag = kind === 'trending' && !q.sort ? 'trending' : kind === 'popular' && !q.sort ? 'popular' : '';
  const { data, loading } = useAsync(() => DataService.getContent({
    platform: q.platform, category: q.category, subcategory: q.sub, type: q.type, range: q.range, flag, sort, page: q.page, pageSize: config.site.pageSize,
  }), [q.platform, q.category, q.sub, q.type, q.range, sort, q.page, kind]);

  const fields = [
    { param: 'platform', label: 'Platform', all: 'All platforms', options: (config.platforms.filters || []).filter((p) => p.key !== 'all').map((p) => ({ value: p.key, label: p.label })) },
    { param: 'category', label: 'Category', all: 'All categories', options: (opts?.cats || []).map((c) => ({ value: c.slug, label: c.name })), resets: { sub: '' } },
    ...(opts?.subs?.length ? [{ param: 'sub', label: 'Subcategory', all: 'All subcategories', options: opts.subs.map((s) => ({ value: s.slug, label: s.name })) }] : []),
    { param: 'type', label: 'Type', all: 'All types', options: config.site.contentTypes.map((t) => ({ value: t.key, label: t.label })) },
    { param: 'range', label: 'Date', all: 'Any time', options: config.site.dateRanges.filter((d) => d.key).map((d) => ({ value: d.key, label: d.label })) },
    { param: 'sort', label: 'Sort', all: 'Default', options: config.site.sortOptions.map((s) => ({ value: s.key, label: s.label })) },
  ];

  return (
    <>
      <PageHero {...copy} icon={<I c={copy.icon} />} />
      <div className="container section--tight">
        <FilterBar fields={fields} clearKeys={['category', 'sub', 'type', 'range', 'sort', 'platform']} />
        <div data-scroll-anchor />
        {loading && !data ? <Skeleton rows={8} /> : (
          <>
            <p className="result-count" aria-live="polite">{data.total} {data.total === 1 ? 'result' : 'results'}</p>
            <ContentGrid items={data.items} cols={4} empty={<EmptyState text="Try removing a filter or choosing another platform." action={{ href: `/${kind}`, label: 'Reset filters' }} />} />
            <Pagination {...data} />
          </>
        )}
      </div>
    </>
  );
}
