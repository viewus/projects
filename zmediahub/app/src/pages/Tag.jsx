import { Link, useParams } from 'react-router-dom';
import { DataService } from '../services/dataService.js';
import { useApp, useAsync, useFeature, usePageSEO } from '../hooks/index.jsx';
import { seoFromTemplate } from '../services/seo.js';
import { to } from '../utils/helpers.js';
import { I, Skeleton } from '../components/ui.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Carousel from '../components/Carousel.jsx';
import ContentCard from '../components/ContentCard.jsx';
import ProviderCard from '../components/ProviderCard.jsx';
import TagList from '../components/TagList.jsx';
import NotFound from './NotFound.jsx';

export default function Tag() {
  const { slug } = useParams();
  const { config } = useApp();
  const provOn = useFeature('providers');
  const { data } = useAsync(async () => {
    const tag = await DataService.getTag(slug);
    if (!tag) return { missing: true };
    const all = await DataService.listContent({ tag: tag.slug });
    const [trending, popular, latest] = await Promise.all([DataService.getTrending(8, { tag: tag.slug }), DataService.getPopular(8, { tag: tag.slug }), DataService.getLatest(8, { tag: tag.slug })]);
    const cats = new Map(); const providers = new Map();
    all.forEach((i) => { i.category && cats.set(i.category, (cats.get(i.category) || 0) + 1); i.provider && providers.set(i.provider, (providers.get(i.provider) || 0) + 1); });
    const top = (m, n) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
    const related = (await DataService.getTagsFor(all, 14)).filter((t) => t.id !== tag.id).slice(0, 10);
    return { tag, total: all.length, trending, popular, latest, cats: top(cats, 6), providers: top(providers, 4), related };
  }, [slug]);
  const tag = data?.tag;
  usePageSEO(tag ? { ...seoFromTemplate('tag', { name: tag.name, description: tag.description, count: data.total }), path: `/tag/${tag.slug}` } : { title: 'Tag' }, [tag?.id]);

  if (data?.missing) return <NotFound what="tag" />;
  if (!data) return <div className="container"><Skeleton rows={6} /></div>;
  const sections = [['Trending', 'fa-solid fa-fire', data.trending, 'trending'], ['Popular', 'fa-regular fa-gem', data.popular, 'popular'], ['Latest', 'fa-regular fa-clock', data.latest, 'latest']];

  return (
    <>
      <PageHero
        title={`#${tag.name}`} subtitle={tag.description}
        image={config.tagImages?.tags?.[tag.slug] || tag.category?.image || config.tagImages?.default}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Tags', href: '/tags' }, { label: `#${tag.name}` }]}
      >
        <p className="page-hero__meta"><I c="fa-solid fa-hashtag" /> <strong>{data.total}</strong> {data.total === 1 ? 'item' : 'items'} tagged</p>
      </PageHero>
      <div className="container section--tight">
      {data.total === 0 ? <EmptyState title="Nothing tagged yet" text="Content with this tag will appear here." action={{ href: '/tags', label: 'Browse all tags' }} /> : (
        <>
          {data.cats.length > 0 && <section className="tag-block"><h2 className="group-title"><I c="fa-solid fa-table-cells-large" /> Related categories</h2><div className="chip-row">{data.cats.map((c) => <Link key={c.id} to={c.url} className="chip chip--lg" style={{ '--c': c.color }}><I c={c.icon} /> {c.name}</Link>)}</div></section>}
          {provOn && data.providers.length > 0 && <section className="tag-block"><h2 className="group-title"><I c="fa-solid fa-user-group" /> Related providers</h2><div className="provider-grid provider-grid--sm">{data.providers.map((p) => <ProviderCard key={p.id} provider={p} />)}</div></section>}
          {sections.map(([label, icon, items, sort]) => items.length > 0 && (
            <section key={label} className="section">
              <SectionHeader title={`${label} in #${tag.name}`} icon={icon} href={to('/search', { tag: tag.slug, sort })} />
              <Carousel label={label} className="carousel--cards">{items.map((it) => <ContentCard key={it.id} item={it} />)}</Carousel>
            </section>
          ))}
          {data.related.length > 0 && <section className="tag-block"><h2 className="group-title"><I c="fa-solid fa-hashtag" /> Related tags</h2><TagList tags={data.related} showCount /></section>}
        </>
      )}
      </div>
    </>
  );
}
