import { useState } from 'react';
import SearchField from '../components/fields/SearchField.jsx';
import { useApp, useAsync, usePageSEO } from '../hooks/index.jsx';
import { DataService } from '../services/dataService.js';
import { clearSaved, useSaved, DEFAULT_LIMIT } from '../utils/saved.js';
import PageHero from '../components/PageHero.jsx';
import ContentGrid from '../components/ContentGrid.jsx';
import BlogCard from '../components/BlogCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { I } from '../components/ui.jsx';

export default function Saved() {
  const { config } = useApp();
  const list = useSaved();
  const [q, setQ] = useState('');
  const cfg = config.site?.features?.saved;
  const limit = (typeof cfg === 'object' && cfg?.limit) || DEFAULT_LIMIT;
  usePageSEO({ title: 'Saved', description: 'Items you saved in this browser.', path: '/saved' });
  const ids = (t) => list.filter((k) => k.startsWith(`${t}:`)).map((k) => k.slice(t.length + 1));
  const { data } = useAsync(async () => {
    const c = new Set(ids('content')); const b = new Set(ids('blog'));
    const [content, blogs] = await Promise.all([c.size ? DataService.listContent({ ids: [...c].join(','), sort: 'latest' }) : [], b.size ? DataService.getBlogs() : []]);
    return { content, blogs: blogs.filter((p) => b.has(String(p.id))) };
  }, [list.join('|')]);
  // the search box only filters what is already saved (title, description, category, tags)
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hit = (...parts) => { const hay = parts.filter(Boolean).join(' ').toLowerCase(); return words.every((w) => hay.includes(w)); };
  const content = (data?.content || []).filter((it) => hit(it.title, it.description, it.category?.name, it.subcategory?.name, ...(it.tags || []).map((t) => t.name)));
  const blogs = (data?.blogs || []).filter((b) => hit(b.title, b.excerpt, b.category?.name, ...(b.tags || []).map((t) => t.name)));
  const total = (data?.content.length || 0) + (data?.blogs.length || 0);
  const shown = content.length + blogs.length;

  return (
    <>
      <PageHero title="Saved" subtitle="Things you saved to look at later. They stay in this browser only." image={config.tagImages?.default} compact crumbs={[{ label: 'Home', href: '/' }, { label: 'Saved' }]} />
      <div className="container section--tight">
        <div className="saved-bar">
          <p><I c="fa-solid fa-bookmark" /> <strong>{list.length}</strong> of {limit} saved</p>
          {list.length > 0 && <SearchField className="saved-search" value={q} onChange={setQ} placeholder="Search your saved items…" label="Search saved items" />}
          {list.length > 0 && <button type="button" className="btn btn--outline btn--sm" onClick={() => { if (window.confirm('Remove everything from your saved list?')) clearSaved(); }}><I c="fa-regular fa-trash-can" /> Clear all</button>}
        </div>
        {data && total > 0 && q && !shown ? (
          <EmptyState title="No saved item matches" text={`Nothing you saved matches "${q}".`} />
        ) : !list.length || (data && !total) ? (
          <EmptyState title="Nothing saved yet" text="Tap the bookmark on any item to keep it here." action={{ href: '/categories', label: 'Browse the range' }} />
        ) : (
          <>
            {content.length > 0 && <ContentGrid items={content} cols={4} />}
            {blogs.length > 0 && <div className="blog-grid blog-grid--3" style={{ marginTop: 20 }}>{blogs.map((p) => <BlogCard key={p.id} post={p} />)}</div>}
          </>
        )}
      </div>
    </>
  );
}
