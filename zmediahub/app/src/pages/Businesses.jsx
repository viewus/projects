import { DataService } from '../services/dataService.js';
import { useApp, useAsync, usePageSEO, useQuery } from '../hooks/index.jsx';
import PageHero from '../components/PageHero.jsx';
import FilterBar from '../components/FilterBar.jsx';
import BusinessCard from '../components/BusinessCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { Skeleton } from '../components/ui.jsx';

/** A directory of businesses (not a marketplace: no cart, no checkout, no payments). */
export default function Businesses() {
  const { config } = useApp();
  const [q] = useQuery();
  usePageSEO({ ...config.seo.pages.businesses, image: config.pages.businesses.image, path: '/businesses' });
  const { data: cats } = useAsync(() => DataService.getCategories(), []);
  const { data } = useAsync(() => DataService.getBusinesses({ category: q.category }), [q.category]);
  return (
    <>
      <PageHero {...config.pages.businesses} />
      <div className="container section--tight">
        <FilterBar clearKeys={['category']} fields={[{ param: 'category', label: 'Category', all: 'All categories', options: (cats || []).map((c) => ({ value: c.slug, label: c.name })) }]} />
        {!data ? <Skeleton rows={6} /> : !data.length ? <EmptyState title="No businesses found" text="Try another category." action={{ href: '/businesses', label: 'Reset' }} /> : (
          <div className="biz-grid">{data.map((b) => <BusinessCard key={b.id} biz={b} />)}</div>
        )}
      </div>
    </>
  );
}
