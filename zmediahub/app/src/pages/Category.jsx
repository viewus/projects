import { Link, useParams } from 'react-router-dom';
import { DataService } from '../services/dataService.js';
import { useApp, useAsync, useFeature, usePageSEO, useQuery } from '../hooks/index.jsx';
import { seoFromTemplate } from '../services/seo.js';
import { formatNumber, to } from '../utils/helpers.js';
import { Breadcrumbs, I, Img, Skeleton } from '../components/ui.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { CategoryNav } from '../components/Sidebar.jsx';
import Carousel from '../components/Carousel.jsx';
import ContentTabs from '../components/ContentTabs.jsx';
import ContentGrid from '../components/ContentGrid.jsx';
import Pagination from '../components/Pagination.jsx';
import Banner from '../components/Banner.jsx';
import NotFound from './NotFound.jsx';

export default function Category() {
  const { slug } = useParams();
  const { config } = useApp();
  const provOn = useFeature('providers');
  const [q] = useQuery();
  const tabs = config.site.contentTabs;
  const tab = tabs.find((t) => t.key === q.tab) || tabs[0];
  const sort = q.sort || tab.sort;
  const view = q.view === 'list' ? 'list' : 'grid';

  const { data } = useAsync(async () => {
    const cat = await DataService.getCategory(slug);
    if (!cat) return { missing: true };
    const [cats, subs, banners, platforms, all] = await Promise.all([
      DataService.getCategories(), DataService.getSubcategories(cat.slug), DataService.getBanners({ categoryId: cat.id, limit: 1 }),
      DataService.getPlatforms(), DataService.listContent({ category: cat.slug }),
    ]);
    // providers who actually publish in this category
    const byProvider = new Map();
    all.forEach((i) => i.provider && byProvider.set(i.provider, (byProvider.get(i.provider) || 0) + 1));
    const top = [...byProvider.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([p]) => p);
    return { cat, cats, subs, providers: top, banner: banners[0], platforms, tags: await DataService.getTagsFor(all, 14) };
  }, [slug]);

  const cat = data?.cat;
  const sub = data?.subs?.find((s) => s.slug === q.sub);
  const list = useAsync(() => (cat ? DataService.getContent({ category: cat.slug, subcategory: q.sub, platform: q.platform, sort, page: q.page, pageSize: config.site.pageSize }) : null),
    [cat?.id, q.sub, q.platform, sort, q.page]);

  const seo = cat ? seoFromTemplate('category', { name: sub ? `${sub.name} in ${cat.name}` : cat.name, description: sub?.description || cat.description }) : null;
  usePageSEO(cat ? { ...seo, image: cat.image, path: `/category/${cat.slug}` } : { title: 'Category' }, [cat?.id, sub?.id]);

  if (data?.missing) return <NotFound what="category" />;
  if (!data) return <div className="container"><Skeleton rows={6} /></div>;
  const { subs } = data;
  const keep = { platform: q.platform, tab: q.tab, view: q.view };

  return (
    <div className="container layout-3col">
      <div className="layout-3col__nav"><CategoryNav categories={data.cats} active={cat.slug} /></div>

      <div className="layout-3col__main">
        <section className="cat-hero" style={{ '--c': cat.color }}>
          <Img src={cat.image} alt="" className="cat-hero__bg" eager />
          <div className="cat-hero__shade" />
          <div className="cat-hero__copy">
            <Breadcrumbs light items={[{ label: 'Home', href: '/' }, { label: 'Categories', href: '/categories' }, { label: cat.name }]} />
            <div className="cat-hero__title">
              <span className="cat-hero__icon"><I c={cat.icon} /></span>
              <div>
                <h1>{cat.name}</h1>
                <p>{sub ? sub.description : cat.description}</p>
              </div>
            </div>
            <p className="cat-hero__stats">
              <strong>{formatNumber(cat.count)}</strong> posts <i>•</i> {provOn && <><strong>{cat.providerCount}</strong> providers <i>•</i> </>}<strong>{subs.length}</strong> subcategories
            </p>
          </div>
          <ul className="cat-hero__subs">
            {subs.slice(0, 3).map((s) => (
              <li key={s.id}><Link to={to(`/category/${cat.slug}`, { sub: s.slug })}><Img src={s.image || cat.image} alt="" /><span>{s.name}</span><I c="fa-solid fa-arrow-right" /></Link></li>
            ))}
          </ul>
        </section>

        {subs.length > 0 && (
          <Carousel label="Subcategories" className="carousel--subs">
            <Link to={to(`/category/${cat.slug}`, keep)} className={`sub-chip ${!q.sub ? 'is-active' : ''}`}><span className="sub-chip__icon"><I c={cat.icon} /></span><span><strong>All</strong><em>{cat.count}</em></span></Link>
            {subs.map((s) => (
              <Link key={s.id} to={to(`/category/${cat.slug}`, { ...keep, sub: s.slug })} className={`sub-chip ${q.sub === s.slug ? 'is-active' : ''}`} aria-current={q.sub === s.slug ? 'true' : undefined}>
                <span className="sub-chip__icon"><I c={s.icon || cat.icon} /></span><span><strong>{s.name}</strong><em>{s.count}</em></span>
              </Link>
            ))}
          </Carousel>
        )}

        {data.banner && <div className="spaced"><Banner banner={data.banner} /></div>}

        <div data-scroll-anchor />
        <ContentTabs tabs={tabs} activeTab={q.sort ? '' : tab.key} sortOptions={config.site.sortOptions} sort={q.sort} view={view} />
        {list.loading && !list.data ? <Skeleton rows={6} /> : (
          <>
            <p className="result-count" aria-live="polite">{list.data?.total ?? 0} {list.data?.total === 1 ? 'result' : 'results'}{sub ? ` in ${sub.name}` : ''}</p>
            <ContentGrid items={list.data?.items} view={view} cols={3} empty={<EmptyState title="No content found" text="Try another subcategory, platform or tab." action={{ href: `/category/${cat.slug}`, label: 'Reset filters' }} />} />
            {list.data && <Pagination {...list.data} />}
          </>
        )}
      </div>

    </div>
  );
}
