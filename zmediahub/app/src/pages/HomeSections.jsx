import { Link } from 'react-router-dom';
import { DataService } from '../services/dataService.js';
import { useApp, useAsync, useMedia, useQuery } from '../hooks/index.jsx';
import { A, I, Img, Skeleton } from '../components/ui.jsx';
import PlatformBadge from '../components/PlatformBadge.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Hero from '../components/Hero.jsx';
import Reveal from '../components/Reveal.jsx';
import ScrollRow from '../components/ScrollRow.jsx';
import PlatformFilter from '../components/PlatformFilter.jsx';
import CategoryCarousel from '../components/CategoryCarousel.jsx';
import TagList from '../components/TagList.jsx';
import Carousel from '../components/Carousel.jsx';
import ContentCard from '../components/ContentCard.jsx';
import ContentGrid from '../components/ContentGrid.jsx';
import ProviderCarousel from '../components/ProviderCarousel.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import Banner from '../components/Banner.jsx';
import BusinessCard from '../components/BusinessCard.jsx';
import BlogCard from '../components/BlogCard.jsx';

import Faq from '../components/Faq.jsx';

const head = (cfg) => ({ title: cfg.title, subtitle: cfg.subtitle, icon: cfg.icon, iconColor: cfg.iconColor, href: cfg.href, linkLabel: cfg.linkLabel });
const Wrap = ({ children, className = '' }) => <Reveal as="section" className={`section ${className}`}><div className="container">{children}</div></Reveal>;

function HeroSection({ cfg }) {
  const { config } = useApp();
  const { data } = useAsync(async () => {
    const [banners, tags, stats, platforms] = await Promise.all([DataService.getBanners({ position: 'hero' }), DataService.getTags({ featured: true, limit: cfg.quickTags || 5 }), DataService.getStats(), DataService.getPlatforms()]);
    return { banners, tags, stats, platforms };
  }, []);
  if (!data) return <div className="hero hero--loading" />;
  return <Hero banners={data.banners} featured={[]} side={[]} stats={data.stats} platforms={data.platforms} quickTags={data.tags} cfg={cfg} autoplayMs={config.site.heroAutoplayMs} />;
}

function PlatformsSection() {
  const [q] = useQuery();
  const { data } = useAsync(() => DataService.getPlatforms(), []);
  return <div className="container platform-row"><PlatformFilter active={q.platform || 'all'} platforms={data || []} sticky /></div>;
}

function CategoriesSection({ cfg }) {
  const { data } = useAsync(() => DataService.getCategories({ limit: cfg.limit || 16 }), []);
  if (!data) return null;
  return (
    <Wrap className="section--tight">
      <SectionHeader {...head(cfg)} />
      <CategoryCarousel categories={data} variant={cfg.variant || 'icon'} />
    </Wrap>
  );
}

function TagsSection({ cfg }) {
  const { data } = useAsync(() => DataService.getTags({ featured: true, limit: cfg.limit || 14 }), []);
  if (!data?.length) return null;
  return (
    <Wrap className="section--tight">
      <div className="tag-strip">
        <h2 className="tag-strip__title"><I c="fa-solid fa-tags" /> {cfg.title}</h2>
        <ScrollRow className="tag-strip__list"><TagList tags={data} /></ScrollRow>
        {cfg.href && <A href={cfg.href} className="icon-link" title={cfg.linkLabel || 'View All'} aria-label={cfg.linkLabel || 'View All'}><I c="fa-solid fa-arrow-right" /></A>}
      </div>
    </Wrap>
  );
}

function BannerSection({ cfg }) {
  const { data } = useAsync(() => DataService.getBanners({ position: cfg.position, limit: 1 }), [cfg.position]);
  if (!data?.length) return null;
  return <Wrap className="section--tight"><Banner banner={data[0]} /></Wrap>;
}

function useFiltered(fn, cfg) {
  const [q] = useQuery();
  const filters = cfg.filterByPlatform && q.platform ? { platform: q.platform } : {};
  return useAsync(() => fn(filters), [q.platform, JSON.stringify(cfg)]);
}

function TrendingSection({ cfg }) {
  const { data, loading } = useFiltered((f) => DataService.getTrending(cfg.limit || 10, f), cfg);
  return (
    <Wrap>
      <SectionHeader {...head(cfg)} />
      {loading && !data ? <Skeleton rows={4} /> : !data?.length ? <EmptyState title="Nothing trending here yet" text="Try a different platform." /> : (
        <Carousel label={cfg.title} className="carousel--cards">
          {data.map((it, i) => <ContentCard key={it.id} item={it} eager={i < 3} />)}
        </Carousel>
      )}
    </Wrap>
  );
}

function ProvidersSection({ cfg }) {
  const [q] = useQuery();
  const { data } = useAsync(() => DataService.getProviders({ featured: true, platform: q.platform, limit: cfg.limit || 12 }), [q.platform]);
  if (!data?.length) return null;
  return (
    <Wrap>
      <SectionHeader {...head(cfg)} />
      <ProviderCarousel providers={data} />
    </Wrap>
  );
}

function PopularCategoriesSection({ cfg }) {
  const { data } = useAsync(() => DataService.getCategories({ sort: 'popular', limit: cfg.limit || 10 }), []);
  if (!data) return null;
  return (
    <Wrap>
      <SectionHeader {...head(cfg)} />
      <Carousel label={cfg.title} className="carousel--tiles">
        {data.map((c) => <CategoryCard key={c.id} cat={c} variant="tile" />)}
      </Carousel>
    </Wrap>
  );
}

function LatestSection({ cfg }) {
  const { data, loading } = useFiltered((f) => DataService.getLatest(cfg.limit || 8, f), cfg);
  return (
    <Wrap>
      <SectionHeader {...head(cfg)} />
      {loading && !data ? <Skeleton rows={4} /> : <ContentGrid items={data} cols={4} variant="compact" rail />}
    </Wrap>
  );
}

function FeaturedTile({ item, large = false }) {
  return (
    <article className={`feat-tile ${large ? 'feat-tile--lg' : ''}`}>
      <Img src={item.thumbnail} alt="" eager={large} />
      <PlatformBadge platform={item.platformInfo} size={large ? 'md' : 'sm'} />
      <div className="feat-tile__body">
        {item.category && <span className="feat-tile__cat">{item.category.name}</span>}
        <h3><Link to={item.url} className="stretched-link">{item.title}</Link></h3>
        {large && item.description && <p>{item.description}</p>}
        <span className="feat-tile__meta">{item.duration ? <><I c="fa-regular fa-clock" /> {item.duration}</> : item.type}</span>
      </div>
    </article>
  );
}

function FeaturedSection({ cfg }) {
  const { data } = useAsync(() => DataService.getFeatured(cfg.limit || 5), []);
  const phone = useMedia('(max-width: 768px)');
  if (!data?.length) return null;
  const [lead, ...rest] = data;
  return (
    <Wrap>
      <SectionHeader {...head(cfg)} />
      {phone ? (
        <Carousel label={cfg.title} className="carousel--feat">
          {[lead, ...rest.slice(0, 4)].map((it, i) => <FeaturedTile key={it.id} item={it} large={i === 0} />)}
        </Carousel>
      ) : (
        <div className="feat-mosaic">
          <FeaturedTile item={lead} large />
          <div className="feat-mosaic__grid">{rest.slice(0, 4).map((it) => <FeaturedTile key={it.id} item={it} />)}</div>
        </div>
      )}
    </Wrap>
  );
}

function BusinessSection({ cfg }) {
  const { data } = useAsync(async () => {
    const [cat, items, biz] = await Promise.all([
      DataService.getCategory(cfg.category), DataService.getTrending(cfg.limit || 4, { category: cfg.category }), DataService.getBusinesses({ featured: true, limit: cfg.businessLimit || 4 }),
    ]);
    return { cat, items, biz, subs: cat ? await DataService.getSubcategories(cat.slug) : [] };
  }, [cfg.category]);
  if (!data?.items.length) return null;
  return (
    <Wrap className="section--alt">
      <SectionHeader {...head(cfg)} />
      <ul className="topic-chips" aria-label="Business topics">
        {data.subs.map((s) => <li key={s.id}><Link to={`/category/${data.cat.slug}?sub=${s.slug}`}>{s.name}</Link></li>)}
      </ul>
      <div className="business-layout">
        <div className="business-layout__content">
          {data.items.map((it) => <ContentCard key={it.id} item={it} variant="row" />)}
        </div>
        <aside className="business-layout__side" aria-label="Featured businesses">
          <h3>Featured Businesses</h3>
          {data.biz.map((b) => <BusinessCard key={b.id} biz={b} variant="compact" />)}
          <Link to="/businesses" className="icon-link" title="Business directory" aria-label="Business directory"><I c="fa-solid fa-arrow-right" /></Link>
        </aside>
      </div>
    </Wrap>
  );
}

function BlogsSection({ cfg }) {
  const { data } = useAsync(() => DataService.getBlogs({ limit: cfg.limit || 3 }), []);
  const phone = useMedia('(max-width: 768px)');
  if (!data?.length) return null;
  return (
    <Wrap>
      <SectionHeader {...head(cfg)} />
      {phone
        ? <Carousel label={cfg.title} className="carousel--cards">{data.map((p) => <BlogCard key={p.id} post={p} />)}</Carousel>
        : <div className="blog-grid blog-grid--3">{data.map((p) => <BlogCard key={p.id} post={p} />)}</div>}
    </Wrap>
  );
}

function CtaSection() {
  const { data } = useAsync(() => DataService.getBanners({ position: 'cta', limit: 1 }), []);
  if (!data?.length) return null;
  return <Wrap><Banner banner={data[0]} /></Wrap>;
}

function FaqSection({ cfg }) {
  const { data } = useAsync(() => DataService.getFaq({ limit: cfg.limit || 6 }), []);
  if (!data?.length) return null;
  return <Wrap className="section--narrow"><SectionHeader {...head(cfg)} /><Faq items={data} /></Wrap>;
}

/** type -> renderer. Add a new section type here and use it in data/sections.json. */
export const SECTIONS = {
  hero: HeroSection, platforms: PlatformsSection, categories: CategoriesSection, tags: TagsSection, banner: BannerSection, trending: TrendingSection,
  providers: ProvidersSection, popular_categories: PopularCategoriesSection, latest: LatestSection, featured: FeaturedSection, business: BusinessSection,
  blogs: BlogsSection, faq: FaqSection, cta: CtaSection,
};
