import { useMemo, useState } from 'react';
import { DataService } from '../services/dataService.js';
import { useApp, useAsync, usePageSEO } from '../hooks/index.jsx';
import { lc } from '../utils/helpers.js';
import PageHero from '../components/PageHero.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import TagList from '../components/TagList.jsx';
import TagCard from '../components/TagCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SearchField from '../components/fields/SearchField.jsx';
import ChipGroup from '../components/fields/ChipGroup.jsx';
import { I, Skeleton } from '../components/ui.jsx';

export default function Tags() {
  const { config } = useApp();
  usePageSEO({ ...config.seo.pages.tags, image: config.pages.tags.image, path: '/tags' });
  const { data } = useAsync(async () => ({ tags: await DataService.getTags(), cats: await DataService.getCategories() }), []);
  const [text, setText] = useState('');
  const [cat, setCat] = useState('');

  const q = lc(text).replace(/^#/, '');
  const groups = useMemo(() => {
    if (!data) return [];
    return data.cats
      .filter((c) => !cat || c.id === cat)
      .map((c) => ({ cat: c, tags: data.tags.filter((t) => t.categoryId === c.id && (!q || lc(`${t.name} ${t.description}`).includes(q))) }))
      .filter((g) => g.tags.length);
  }, [data, cat, q]);

  const trending = data?.tags.slice(0, 8) || [];
  const filtering = !!(q || cat);

  return (
    <>
      <PageHero {...config.pages.tags} compact />
      <div className="container">
        {!data ? <div className="section"><Skeleton rows={8} /></div> : (
          <>
            {!filtering && (
              <section className="section">
                <SectionHeader title="Trending tags" subtitle="The most used tags across every platform" icon="fa-solid fa-fire" iconColor="var(--mh-primary)" />
                <div className="tag-grid">{trending.map((t) => <TagCard key={t.id} tag={t} />)}</div>
              </section>
            )}

            <section className="section section--tight tags-browse">
              <SectionHeader title="Browse all tags" subtitle={`${data.tags.length} tags, grouped by topic`} icon="fa-solid fa-hashtag" />
              <div className="tags-toolbar">
                <SearchField value={text} onChange={setText} placeholder="Filter tags…" label="Filter tags" />
                <ChipGroup value={cat} onChange={setCat} allLabel="All" allowClear label="Filter by category" options={data.cats.map((c) => ({ value: c.id, label: c.name, icon: c.icon }))} />
              </div>

              {groups.length ? (
                <div className="tag-groups">
                  {groups.map(({ cat: c, tags }) => (
                    <section key={c.id} className="tag-group" style={{ '--c': c.color }}>
                      <h3 className="tag-group__title"><span><I c={c.icon} /></span>{c.name}<em>{tags.length}</em></h3>
                      <TagList tags={tags} showCount />
                    </section>
                  ))}
                </div>
              ) : <EmptyState title="No tags match" text="Try another word or choose a different category." />}
            </section>
          </>
        )}
      </div>
    </>
  );
}
