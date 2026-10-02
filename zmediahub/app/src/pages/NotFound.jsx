import { useApp, usePageSEO } from '../hooks/index.jsx';
import PageHero from '../components/PageHero.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function NotFound({ what = 'page' }) {
  const { config } = useApp();
  usePageSEO({ ...config.seo.pages.notfound, noindex: true, path: '/404' });
  return (
    <>
      <PageHero title="Page not found" subtitle={`We couldn't find that ${what}. It may have been moved or removed.`} image={config.tagImages?.default} compact />
      <div className="container section">
        <EmptyState icon="fa-regular fa-compass" title="Let's get you back on track" text="Try searching, browse the categories, or head back to the homepage." action={{ href: '/', label: 'Back to home' }} />
      </div>
    </>
  );
}
