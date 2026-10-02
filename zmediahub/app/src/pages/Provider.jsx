import { Link, useParams } from 'react-router-dom';
import { DataService } from '../services/dataService.js';
import { useApp, useAsync, usePageSEO, useQuery } from '../hooks/index.jsx';
import { seoFromTemplate, absolute } from '../services/seo.js';
import { formatNumber, safeUrl } from '../utils/helpers.js';
import { Avatar, Breadcrumbs, I, Img, Skeleton, Verified } from '../components/ui.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PlatformBadge from '../components/PlatformBadge.jsx';
import ContentTabs from '../components/ContentTabs.jsx';
import ContentGrid from '../components/ContentGrid.jsx';
import Pagination from '../components/Pagination.jsx';
import TagList from '../components/TagList.jsx';
import Stats from '../components/Stats.jsx';
import { typeLabel } from '../components/ProviderCard.jsx';
import NotFound from './NotFound.jsx';

const TABS = [
  { key: 'all', label: 'All', icon: 'fa-solid fa-table-cells-large', sort: 'latest' }, { key: 'trending', label: 'Trending', icon: 'fa-solid fa-arrow-trend-up', sort: 'trending' },
  { key: 'popular', label: 'Popular', icon: 'fa-regular fa-gem', sort: 'popular' }, { key: 'new', label: 'New', icon: 'fa-regular fa-clock', sort: 'latest' },
];

export default function Provider() {
  const { slug } = useParams();
  const { config } = useApp();
  const [q] = useQuery();
  const tab = TABS.find((t) => t.key === q.tab) || TABS[0];
  const view = q.view === 'list' ? 'list' : 'grid';
  const { data } = useAsync(async () => {
    const p = await DataService.getProvider(slug);
    return p ? { p, insights: await DataService.getProviderInsights(p) } : { missing: true };
  }, [slug]);
  const p = data?.p;
  const list = useAsync(() => (p ? DataService.getContentByProvider(p.slug, { sort: q.sort || tab.sort, page: q.page, pageSize: config.site.pageSize, platform: q.platform }) : null), [p?.id, tab.key, q.sort, q.page, q.platform]);

  const seo = p ? seoFromTemplate('provider', { name: p.name, username: p.username, bio: p.bio }) : {};
  usePageSEO(p ? { ...seo, image: p.avatar || p.logo, path: `/provider/${p.slug}`, type: 'profile', jsonLd: { '@context': 'https://schema.org', '@type': p.type === 'business' || p.type === 'brand' ? 'Organization' : 'Person', name: p.name, description: p.bio, image: absolute(p.avatar || p.logo), url: safeUrl(p.website) || undefined, sameAs: p.platforms.map((a) => safeUrl(a.url)).filter(Boolean) } } : { title: 'Provider' }, [p?.id]);

  if (data?.missing) return <NotFound what="provider" />;
  if (!data) return <div className="container"><Skeleton rows={6} /></div>;
  const { insights } = data;
  const square = ['business', 'brand', 'organization'].includes(p.type);
  const site = safeUrl(p.website);

  return (
    <div className="container section--tight">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Creators & Businesses', href: '/creators' }, { label: p.name }]} />
      <div className="profile-cover"><Img src={p.category?.image} alt="" eager /></div>
      <section className="profile card">
        <Avatar provider={p} size="2xl" square={square} />
        <div className="profile__main">
          <h1>{p.name}{p.verified && <Verified />}</h1>
          <p className="profile__user"><span className="chip chip--soft">{typeLabel(p.type)}</span><span>@{p.username}</span>{p.category && <Link to={p.category.url}>{p.category.name}</Link>}{p.location && <span><I c="fa-solid fa-location-dot" /> {p.location}</span>}</p>
          <p className="profile__bio">{p.description || p.bio}</p>
          <div className="profile__contact">
            {site && <a className="btn btn--outline btn--sm" href={site} target="_blank" rel="noopener noreferrer"><I c="fa-solid fa-globe" /> Website</a>}
            {p.email && <a className="btn btn--outline btn--sm" href={`mailto:${p.email}`}><I c="fa-regular fa-envelope" /> Email</a>}
            {p.phone && <a className="btn btn--outline btn--sm" href={`tel:${p.phone.replace(/[^+\d]/g, '')}`}><I c="fa-solid fa-phone" /> Call</a>}
          </div>
          <h2 className="mini-title">Platform accounts</h2>
          <ul className="profile__platforms" aria-label="Platform accounts">
            {p.platforms.map((a) => {
              const url = safeUrl(a.url);
              const inner = <><PlatformBadge platform={a.info} size="sm" /><span><strong>{a.info.name}</strong>@{a.username} · {formatNumber(a.followers)}</span></>;
              return <li key={a.id || a.platform}>{url ? <a href={url} target="_blank" rel="noopener noreferrer">{inner}<I c="fa-solid fa-arrow-up-right-from-square" /></a> : <span>{inner}</span>}</li>;
            })}
            {!p.platforms.length && <li className="muted">No platform accounts listed yet.</li>}
          </ul>
        </div>
        <div className="profile__side">
          <Stats items={[{ icon: 'fa-solid fa-user-group', value: p.followers, label: 'Followers' }, { icon: 'fa-regular fa-gem', value: insights.total, label: 'Posts' }, { icon: 'fa-regular fa-eye', value: insights.views, label: 'Views' }]} />
        </div>
      </section>

      {(insights.categories.length > 0 || insights.tags.length > 0) && (
        <div className="profile-meta">
          {insights.categories.length > 0 && <div><h2>Categories</h2><div className="chip-row">{insights.categories.map((x) => <Link key={x.id} to={x.url} className="chip chip--soft">{x.name}</Link>)}</div></div>}
          {insights.tags.length > 0 && <div><h2>Top tags</h2><TagList tags={insights.tags} /></div>}
        </div>
      )}

      <div data-scroll-anchor />
      <ContentTabs tabs={TABS} activeTab={q.sort ? '' : tab.key} sortOptions={config.site.sortOptions} sort={q.sort} view={view} />
      {list.loading && !list.data ? <Skeleton rows={4} /> : (
        <>
          <ContentGrid items={list.data?.items} view={view} cols={4} empty={<EmptyState title="No content yet" text="This provider has no published content here yet. Check back soon." />} />
          {list.data && <Pagination {...list.data} />}
        </>
      )}
    </div>
  );
}
