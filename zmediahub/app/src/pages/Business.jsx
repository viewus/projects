import { Link, useParams } from 'react-router-dom';
import { DataService } from '../services/dataService.js';
import { useAsync, usePageSEO } from '../hooks/index.jsx';
import { seoFromTemplate } from '../services/seo.js';
import { safeUrl } from '../utils/helpers.js';
import { Breadcrumbs, I, Img, Skeleton } from '../components/ui.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import PlatformBadge from '../components/PlatformBadge.jsx';
import BusinessCard, { BizLogo } from '../components/BusinessCard.jsx';
import ContentGrid from '../components/ContentGrid.jsx';
import EmptyState from '../components/EmptyState.jsx';
import TagList from '../components/TagList.jsx';
import NotFound from './NotFound.jsx';

export default function Business() {
  const { slug } = useParams();
  const { data } = useAsync(async () => {
    const biz = await DataService.getBusiness(slug);
    if (!biz) return { missing: true };
    return { biz, content: await DataService.listContent({ business: biz.id, sort: 'trending' }), similar: (await DataService.getBusinesses({ category: biz.category?.slug })).filter((b) => b.id !== biz.id).slice(0, 3), platforms: await DataService.getPlatforms() };
  }, [slug]);
  const biz = data?.biz;
  usePageSEO(biz ? { ...seoFromTemplate('business', { name: biz.name, description: biz.description }), image: biz.cover, path: `/business/${biz.slug}`,
    jsonLd: { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: biz.name, description: biz.description, address: biz.location, telephone: biz.phone || undefined, url: safeUrl(biz.website) || undefined } } : { title: 'Business' }, [biz?.id]);

  if (data?.missing) return <NotFound what="business" />;
  if (!data) return <div className="container"><Skeleton rows={6} /></div>;
  const pmap = new Map(data.platforms.map((p) => [p.id, p]));
  const site = safeUrl(biz.website);

  return (
    <div className="container section--tight">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Businesses', href: '/businesses' }, { label: biz.name }]} />
      <section className="card biz-profile">
        <div className="biz-profile__cover"><Img src={biz.cover} alt="" eager /></div>
        <div className="biz-profile__body">
          <BizLogo biz={biz} size="lg" />
          <div className="biz-profile__text">
            <h1>{biz.name}{biz.featured && <span className="chip chip--gold">Featured</span>}</h1>
            <p className="muted">{biz.category && <Link to={biz.category.url}>{biz.category.name}</Link>}{biz.location && <> · <I c="fa-solid fa-location-dot" /> {biz.location}</>}</p>
            <p>{biz.description}</p>
            <div className="biz-profile__actions">
              {site && <a className="btn btn--primary" href={site} target="_blank" rel="noopener noreferrer"><I c="fa-solid fa-globe" /> Visit website</a>}
              {biz.phone && <a className="btn btn--outline" href={`tel:${biz.phone.replace(/[^+\d]/g, '')}`}><I c="fa-solid fa-phone" /> {biz.phone}</a>}
              {biz.email && <a className="btn btn--outline" href={`mailto:${biz.email}`}><I c="fa-regular fa-envelope" /> Email</a>}
              <ul className="social-row">
                {Object.entries(biz.social).map(([k, u]) => safeUrl(u) && <li key={k}><a href={safeUrl(u)} target="_blank" rel="noopener noreferrer" aria-label={pmap.get(k)?.name || k}><PlatformBadge platform={pmap.get(k)} size="sm" /></a></li>)}
              </ul>
            </div>
            <TagList tags={biz.tags} />
          </div>
        </div>
      </section>
      <section className="section"><SectionHeader title={`Content from ${biz.name}`} />
        <ContentGrid items={data.content} cols={4} empty={<EmptyState title="No related content yet" text="Content featuring this business will appear here." />} />
      </section>
      {data.similar.length > 0 && <section className="section"><SectionHeader title="Similar businesses" href="/businesses" /><div className="biz-grid">{data.similar.map((b) => <BusinessCard key={b.id} biz={b} />)}</div></section>}
    </div>
  );
}
