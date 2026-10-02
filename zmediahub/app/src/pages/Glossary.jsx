import { useMemo, useState } from 'react';
import { useApp, useAsync, usePageSEO } from '../hooks/index.jsx';
import { DataService } from '../services/dataService.js';
import PageHero from '../components/PageHero.jsx';
import SearchField from '../components/fields/SearchField.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Glossary() {
  const { config } = useApp();
  const [q, setQ] = useState('');
  usePageSEO({ title: 'Glossary', description: 'Plain-language definitions of common terms.', path: '/glossary' });
  const { data } = useAsync(() => DataService.getGlossary(), []);
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const list = (data || []).filter((g) => words.every((w) => `${g.term} ${g.definition}`.toLowerCase().includes(w)));
  const groups = useMemo(() => list.reduce((m, g) => { const l = g.term[0].toUpperCase(); (m[l] = m[l] || []).push(g); return m; }, {}), [list]);
  const letters = Object.keys(groups).sort();
  return (
    <>
      <PageHero title="Glossary" subtitle="Plain-language definitions of common terms." image={config.tagImages?.default} compact crumbs={[{ label: 'Home', href: '/' }, { label: 'Glossary' }]} />
      <div className="container container--narrow section--tight">
        {data && !data.length ? <EmptyState title="No terms yet" text="Add rows to data/glossary.csv." /> : (
          <>
            <div className="glossary-tools">
              <SearchField value={q} onChange={setQ} placeholder="Search terms…" label="Search the glossary" />
              <nav className="glossary-az" aria-label="Jump to letter">{letters.map((l) => <a key={l} href={`#/glossary`} onClick={(e) => { e.preventDefault(); document.getElementById(`gl-${l}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{l}</a>)}</nav>
            </div>
            {letters.map((l) => (
              <section key={l} id={`gl-${l}`} className="glossary-group">
                <h2>{l}</h2>
                <dl>{groups[l].map((g) => <div key={g.term} className="glossary-item"><dt>{g.term}{g.category && <small>{g.category}</small>}</dt><dd>{g.definition}</dd></div>)}</dl>
              </section>
            ))}
            {data && data.length > 0 && !list.length && <EmptyState title="No term matches" text={`Nothing matches "${q}".`} />}
          </>
        )}
      </div>
    </>
  );
}
