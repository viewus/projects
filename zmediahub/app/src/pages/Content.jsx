import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DataService } from '../services/dataService.js';
import { useApp, useAsync, useFeature, usePageSEO } from '../hooks/index.jsx';
import { seoFromTemplate, absolute } from '../services/seo.js';
import { formatDate, formatNumber, safeUrl } from '../utils/helpers.js';
import { Avatar, Breadcrumbs, I, Img, Skeleton, Verified } from '../components/ui.jsx';
import PlatformBadge from '../components/PlatformBadge.jsx';
import EmbedViewer, { isEmbeddable } from '../components/EmbedViewer.jsx';
import ContentCard from '../components/ContentCard.jsx';
import RelatedContent from '../components/RelatedContent.jsx';
import TagList from '../components/TagList.jsx';
import { ShareModal } from '../components/Modal.jsx';
import SaveButton from '../components/SaveButton.jsx';
import { typeLabel } from '../components/ProviderCard.jsx';
import NotFound from './NotFound.jsx';

const TYPE_LABEL = { video: 'Video', reel: 'Reel', short: 'Short', post: 'Post', article: 'Article', live: 'Live', link: 'Link' };

export default function Content() {
  const { slug } = useParams();
  const [share, setShare] = useState(false);
  const showBusiness = useFeature('businesses');
  const showProviders = useFeature('providers');
  const showStats = useApp().config.site?.cards?.showStats !== false;
  const { data } = useAsync(async () => {
    const item = await DataService.getContentItem(slug);
    if (!item) return { missing: true };
    const [related, more, tags] = await Promise.all([DataService.getRelated(item, 8), DataService.getMoreFromProvider(item, 8), DataService.getTags({ categoryId: item.categoryId, limit: 12 })]);
    return { item, related, more, relatedTags: tags.filter((t) => !item.tags.includes(t)).slice(0, 8) };
  }, [slug]);
  const item = data?.item;

  usePageSEO(item ? {
    ...seoFromTemplate('content', { title: item.title, description: item.description }), image: item.thumbnail, path: `/content/${item.slug}`, type: 'article',
    jsonLd: { '@context': 'https://schema.org', '@type': item.type === 'article' ? 'Article' : 'CreativeWork', name: item.title, headline: item.title, description: item.description, image: absolute(item.thumbnail),
      datePublished: item.publishedAt?.toISOString().slice(0, 10), author: item.provider ? { '@type': 'Organization', name: item.provider.name } : undefined, url: safeUrl(item.externalUrl) || undefined },
  } : { title: 'Content' }, [item?.id]);

  if (data?.missing) return <NotFound what="content" />;
  if (!data) return <div className="container"><Skeleton rows={6} /></div>;
  const { related, more, relatedTags } = data;
  const p = item.provider;
  const ext = safeUrl(item.externalUrl);
  const embeddable = isEmbeddable(item);
  const crumbs = [{ label: 'Home', href: '/' }, item.category && { label: item.category.name, href: item.category.url }, { label: item.title }].filter(Boolean);

  /* plain information item (no video / social embed): a proper detail layout instead of a mock social post */
  if (!embeddable) {
    return (
      <div className="container section--tight">
        <Breadcrumbs items={crumbs} />
        <article className="feature">
          <div className="feature__media"><Img src={item.thumbnail} alt={item.title} eager /></div>
          <div className="feature__info">
            <div className="feature__chips">
              {item.category && <Link to={item.category.url} className="chip chip--soft">{item.category.name}</Link>}
              {item.subcategory && <Link to={`${item.category.url}?sub=${item.subcategory.slug}`} className="chip chip--soft">{item.subcategory.name}</Link>}
            </div>
            <h1>{item.title}</h1>
            <p className="feature__meta"><I c="fa-regular fa-calendar" /> <time dateTime={item.publishedAt?.toISOString().slice(0, 10)}>{formatDate(item.publishedAt)}</time>{item.duration && <> · <I c="fa-regular fa-clock" /> {item.duration}</>}</p>
            <p className="feature__lead">{item.description}</p>
            {item.tags.length > 0 && <TagList tags={item.tags} />}
            <div className="feature__actions">
              {ext && <a className="btn btn--primary" href={ext} target="_blank" rel="noopener noreferrer"><I c="fa-solid fa-arrow-up-right-from-square" /> Learn more</a>}
              <SaveButton id={item.id} className="btn btn--outline" label />
              <button type="button" className="btn btn--outline" onClick={() => setShare(true)}><I c="fa-solid fa-share-nodes" /> Share</button>
            </div>
            {showProviders && p && <Link to={p.url} className="feature__by"><Avatar provider={p} size="md" /><span>By <strong>{p.name}{p.verified && <Verified />}</strong></span></Link>}
            {showBusiness && item.business && <p className="feature__biz"><I c="fa-solid fa-briefcase" /> <Link to={item.business.url}>{item.business.name}</Link> · {item.business.location}</p>}
          </div>
        </article>
        {showProviders && p && more.length > 1 && <RelatedContent title={`More from ${p.name}`} items={more.slice(0, 5)} layout="grid" />}
        <RelatedContent title="You may also like" items={related.slice(0, 5)} layout="grid" />
        <ShareModal open={share} onClose={() => setShare(false)} title={item.title} />
      </div>
    );
  }

  return (
    <div className="container section--tight">
      <Breadcrumbs items={crumbs} />
      <div className="detail">
        <article className="detail__main">
          <header className="detail__head">
            <div className="detail__badges">
              <PlatformBadge platform={item.platformInfo} label />
              <span className="chip">{TYPE_LABEL[item.type] || item.type}</span>
              {item.category && <Link to={item.category.url} className="chip chip--soft">{item.category.name}</Link>}
              {item.subcategory && <Link to={`${item.category.url}?sub=${item.subcategory.slug}`} className="chip chip--soft">{item.subcategory.name}</Link>}
            </div>
            <h1>{item.title}</h1>
            <p className="detail__meta"><I c="fa-regular fa-calendar" /> <time dateTime={item.publishedAt?.toISOString().slice(0, 10)}>{formatDate(item.publishedAt)}</time>{item.duration && <> · <I c="fa-regular fa-clock" /> {item.duration}</>}{showStats && <><span className="detail__stat"><I c="fa-regular fa-eye" /> {formatNumber(item.views)}</span><span className="detail__stat"><I c="fa-regular fa-heart" /> {formatNumber(item.likes)}</span><span className="detail__stat"><I c="fa-regular fa-comment" /> {formatNumber(item.comments)}</span></>}</p>
          </header>
          <EmbedViewer item={item} />

          <div className="detail__provider">
            {p ? (
              <Link to={p.url} className="detail__provider-link"><Avatar provider={p} size="lg" /><span><strong>{p.name}{p.verified && <Verified />}</strong><em>{typeLabel(p.type)} · {formatNumber(p.followers)} followers</em></span></Link>
            ) : <div className="detail__provider-link"><Avatar size="lg" /><span><strong>Independent source</strong></span></div>}
            {p && <Link to={p.url} className="btn btn--outline btn--sm">View profile</Link>}
          </div>

          <div className="detail__actions">
            {ext && !embeddable ? null : ext ? <a className="btn btn--primary" href={ext} target="_blank" rel="noopener noreferrer"><I c="fa-solid fa-arrow-up-right-from-square" /> View Original</a> : <span className="btn btn--ghost" aria-disabled="true">Original link unavailable</span>}
            <SaveButton id={item.id} className="btn btn--outline" label />
            <button type="button" className="btn btn--outline" onClick={() => setShare(true)}><I c="fa-solid fa-share-nodes" /> Share</button>
          </div>

          {item.availableOn.length > 1 && (
            <section className="also">
              <h2 className="mini-title">Also available on</h2>
              <ul>{item.availableOn.slice(1).map((a) => (
                <li key={a.platform}>{safeUrl(a.externalUrl) ? <a href={safeUrl(a.externalUrl)} target="_blank" rel="noopener noreferrer"><PlatformBadge platform={a.info} size="sm" /><span><strong>{a.info.name}</strong><em>{a.type} · {formatNumber(a.views)} views</em></span><I c="fa-solid fa-arrow-up-right-from-square" /></a> : null}</li>
              ))}</ul>
            </section>
          )}

          {embeddable && <section className="detail__body"><h2>About this content</h2><p>{item.description}</p></section>}
          {embeddable && item.tags.length > 0 && <section><h2 className="mini-title">Tags</h2><TagList tags={item.tags} /></section>}
          {showBusiness && item.business && (
            <section className="detail__biz"><I c="fa-solid fa-briefcase" /><div><strong>Featured business</strong><p><Link to={item.business.url}>{item.business.name}</Link> · {item.business.location}</p></div></section>
          )}
        </article>

        <aside className="detail__side">
          <section className="side-card">
            <h2 className="side-card__title">Up Next</h2>
            <div className="mini-list">{related.slice(0, 5).map((it) => <ContentCard key={it.id} item={it} variant="mini" />)}</div>
          </section>
          {relatedTags.length > 0 && <section className="side-card"><h2 className="side-card__title">Related Tags</h2><TagList tags={relatedTags} /></section>}
          {item.category && <section className="side-card"><h2 className="side-card__title">Related Category</h2><Link to={item.category.url} className="btn btn--outline btn--block"><I c={item.category.icon} /> More in {item.category.name}</Link></section>}
        </aside>
      </div>

      {p && <RelatedContent title={`More from ${p.name}`} items={more.slice(0, 5)} href={p.url} layout="grid" />}
      <RelatedContent title="Related Content" items={related.slice(0, 5)} layout="grid" />
      <ShareModal open={share} onClose={() => setShare(false)} title={item.title} />
    </div>
  );
}
