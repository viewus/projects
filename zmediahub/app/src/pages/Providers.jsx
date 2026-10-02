import { useEffect, useState } from 'react';
import { DataService, PROVIDER_TYPES } from '../services/dataService.js';
import { useApp, useAsync, usePageSEO, useQuery } from '../hooks/index.jsx';
import PageHero from '../components/PageHero.jsx';
import FilterBar from '../components/FilterBar.jsx';
import ProviderCard, { typeLabel } from '../components/ProviderCard.jsx';
import LoadMore from '../components/LoadMore.jsx';
import SearchBox from '../components/SearchBox.jsx';
import Banner from '../components/Banner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { Skeleton } from '../components/ui.jsx';

const STEP = 15;
const PLURAL = { creator: 'Creators', business: 'Businesses', brand: 'Brands', organization: 'Organizations', publisher: 'Publishers', educator: 'Educators', influencer: 'Influencers' };

/** Directory of every provider: creators, businesses, brands, organisations, publishers, educators, influencers. */
export default function Providers() {
  const { config } = useApp();
  const copy = config.pages.providers;
  const [q, setQ] = useQuery();
  const [shown, setShown] = useState(STEP);
  usePageSEO({ ...config.seo.pages.providers, image: copy.image, path: '/creators' });
  useEffect(() => setShown(STEP), [q.type, q.category, q.platform, q.sort]);

  const { data: opts } = useAsync(async () => ({ cats: await DataService.getCategories(), platforms: await DataService.getPlatforms(), banner: (await DataService.getBanners({ position: copy.banner, limit: 1 }))[0] }), []);
  const { data, loading } = useAsync(() => DataService.getProviders({ type: q.type, category: q.category, platform: q.platform, sort: q.sort || 'followers' }), [q.type, q.category, q.platform, q.sort]);

  return (
    <>
      <PageHero {...copy}><SearchBox variant="hero" placeholder="Search creators, businesses or topics…" /></PageHero>
      <div className="container section--tight">
        <FilterBar clearKeys={['type', 'category', 'sort', 'platform']} fields={[
          { param: 'type', label: 'Type', all: 'All types', options: PROVIDER_TYPES.map((t) => ({ value: t, label: PLURAL[t] || typeLabel(t) })) },
  { param: 'platform', label: 'Platform', all: 'All platforms', options: (config.platforms.filters || []).filter((p) => p.key !== 'all').map((p) => ({ value: p.key, label: p.label })) },
          { param: 'category', label: 'Category', all: 'All categories', options: (opts?.cats || []).map((c) => ({ value: c.slug, label: c.name })) },
          { param: 'sort', label: 'Sort', all: 'Most followed', options: [{ value: 'name', label: 'Name (A–Z)' }] },
        ]} />
        <div data-scroll-anchor />
        {loading && !data ? <Skeleton rows={8} /> : !data.length ? <EmptyState title="No providers found" text="Try another type, category or platform." action={{ href: '/creators', label: 'Reset filters' }} /> : (
          <>
            <p className="result-count">{data.length} {data.length === 1 ? 'provider' : 'providers'}</p>
            <div className="provider-grid">{data.slice(0, shown).map((p) => <ProviderCard key={p.id} provider={p} variant="profile" />)}</div>
            <LoadMore shown={Math.min(shown, data.length)} total={data.length} onMore={() => setShown((n) => n + STEP)} />
          </>
        )}
        {opts?.banner && <div className="section"><Banner banner={opts.banner} /></div>}
      </div>
    </>
  );
}
