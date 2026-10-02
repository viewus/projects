import { useApp, useAsync, usePageSEO } from '../hooks/index.jsx';
import { DataService } from '../services/dataService.js';
import PageHero from '../components/PageHero.jsx';
import Faq from '../components/Faq.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function FaqPage() {
  const { config } = useApp();
  usePageSEO({ title: 'FAQ', description: 'Frequently asked questions.', path: '/faq' });
  const { data } = useAsync(() => DataService.getFaq(), []);
  const groups = [...(data || []).reduce((m, f) => m.set(f.category || '', [...(m.get(f.category || '') || []), f]), new Map())];
  return (
    <>
      <PageHero title="Frequently asked questions" subtitle="Quick answers to common questions." image={config.tagImages?.default} compact crumbs={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]} />
      <div className="container container--narrow section--tight">
        {!data ? null : !data.length ? <EmptyState title="No questions yet" text="Add rows to data/faq.csv." /> : groups.map(([cat, items]) => (
          <section key={cat || 'general'} className="faq-group">{cat && <h2 className="faq-group__title">{cat}</h2>}<Faq items={items} /></section>
        ))}
      </div>
    </>
  );
}
