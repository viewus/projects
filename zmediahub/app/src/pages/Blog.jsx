import { Link } from 'react-router-dom';
import { DataService } from '../services/dataService.js';
import { useApp, useAsync, usePageSEO, useQuery } from '../hooks/index.jsx';
import PageHero from '../components/PageHero.jsx';
import ScrollRow from '../components/ScrollRow.jsx';
import BlogCard from '../components/BlogCard.jsx';
import Pagination from '../components/Pagination.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { Skeleton } from '../components/ui.jsx';

export default function Blog() {
  const { config } = useApp();
  const [q] = useQuery();
  usePageSEO({ ...config.seo.pages.blog, image: config.pages.blog.image, path: '/blog' });
  const { data: cats } = useAsync(async () => (await DataService.getBlogs()).map((b) => b.category).filter(Boolean), []);
  const { data, loading } = useAsync(async () => {
    const res = await DataService.getBlogs({ category: q.category, page: q.page || 1, pageSize: 6 });
    const lead = !q.category && res.page === 1 ? (await DataService.getBlogs({ featured: true, limit: 1 }))[0] : null;
    return { ...res, lead, items: lead ? res.items.filter((p) => p.id !== lead.id) : res.items };
  }, [q.category, q.page]);
  const uniqueCats = [...new Map((cats || []).map((c) => [c.id, c])).values()];

  return (
    <>
      <PageHero {...config.pages.blog} />
      <div className="container section--tight">
        <ScrollRow className="chip-row chip-row--filters" label="Filter by category">
          <Link to="/blog" replace className={`chip chip--lg ${!q.category ? 'is-active' : ''}`}>All</Link>
          {uniqueCats.map((c) => <Link key={c.id} to={`/blog?category=${c.slug}`} replace className={`chip chip--lg ${q.category === c.slug ? 'is-active' : ''}`}>{c.name}</Link>)}
        </ScrollRow>
        <div data-scroll-anchor />
        {loading && !data ? <Skeleton rows={6} /> : !data.items.length && !data.lead ? <EmptyState title="No articles yet" text="Check back soon for new guides." /> : (
          <>
            {data.lead && <BlogCard post={data.lead} variant="lead" />}
            <div className="blog-grid blog-grid--3">{data.items.map((p) => <BlogCard key={p.id} post={p} />)}</div>
            <Pagination {...data} />
          </>
        )}
      </div>
    </>
  );
}
