import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DataService } from '../services/dataService.js';
import { useAsync, usePageSEO } from '../hooks/index.jsx';
import { seoFromTemplate, absolute } from '../services/seo.js';
import { formatDate, md, readingTime } from '../utils/helpers.js';
import { I, Skeleton } from '../components/ui.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import TagList from '../components/TagList.jsx';
import BlogCard from '../components/BlogCard.jsx';
import NotFound from './NotFound.jsx';
import SaveButton from '../components/SaveButton.jsx';
import { ShareModal } from '../components/Modal.jsx';
import { ReadingProgress, Toc } from '../components/ArticleExtras.jsx';

export default function BlogPost() {
  const { slug } = useParams();
  const [share, setShare] = useState(false);
  const { data } = useAsync(async () => {
    const post = await DataService.getBlog(slug);
    if (!post) return { missing: true };
    const all = await DataService.getBlogs();
    return { post, more: all.filter((b) => b.id !== post.id).sort((a, b) => Number(b.category?.id === post.category?.id) - Number(a.category?.id === post.category?.id)).slice(0, 3) };
  }, [slug]);
  const post = data?.post;
  usePageSEO(post ? {
    ...seoFromTemplate('blog', { title: post.title, description: post.excerpt }), image: post.thumbnail, path: `/blog/${post.slug}`, type: 'article',
    jsonLd: { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.excerpt, image: absolute(post.thumbnail), author: { '@type': 'Person', name: post.author }, datePublished: post.publishedAt?.toISOString().slice(0, 10) },
  } : { title: 'Blog' }, [post?.id]);

  if (data?.missing) return <NotFound what="article" />;
  if (!data) return <div className="container"><Skeleton rows={6} /></div>;

  return (
    <>
      <ReadingProgress />
      <PageHero title={post.title} subtitle={post.excerpt} image={post.thumbnail}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: post.title }]}>
        <p className="page-hero__meta">
          {post.category && <Link to={post.category.url} className="page-hero__cat">{post.category.name}</Link>}
          <span>By <strong>{post.author}</strong></span><span>{formatDate(post.publishedAt)}</span><span><I c="fa-regular fa-clock" /> {readingTime(post.content)} min read</span>
        </p>
      </PageHero>
      <div className="container container--narrow section--tight">
        <article className="article article--post">
          <Toc content={post.content} />
          <div className="prose" dangerouslySetInnerHTML={{ __html: md(post.content) }} />
          <TagList tags={post.tags} />
          <div className="article__actions"><SaveButton type="blog" id={post.id} className="btn btn--outline" label /><button type="button" className="btn btn--outline" onClick={() => setShare(true)}><I c="fa-solid fa-share-nodes" /> Share</button></div>
        </article>
        <ShareModal open={share} onClose={() => setShare(false)} title={post.title} />
      </div>
      {data.more.length > 0 && <div className="container"><section className="section"><SectionHeader title="Keep reading" href="/blog" /><div className="blog-grid blog-grid--3">{data.more.map((p) => <BlogCard key={p.id} post={p} />)}</div></section></div>}
    </>
  );
}
