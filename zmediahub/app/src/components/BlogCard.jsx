import { Link } from 'react-router-dom';
import { formatDate, readingTime } from '../utils/helpers.js';
import { I, Img } from './ui.jsx';
import SaveButton from './SaveButton.jsx';

export default function BlogCard({ post, variant = 'default' }) {
  return (
    <article className={`card blog-card blog-card--${variant}`}>
      <Link to={post.url} className="blog-card__thumb" tabIndex={-1} aria-hidden="true"><Img src={post.thumbnail} alt="" /></Link>
      <div className="blog-card__body">
        <SaveButton type="blog" id={post.id} className="save-btn--card" />
        {post.category && <Link to={post.category.url} className="chip chip--soft">{post.category.name}</Link>}
        <h3><Link to={post.url} className="stretched-link">{post.title}</Link></h3>
        <p>{post.excerpt}</p>
        <p className="blog-card__meta">{post.author} · {formatDate(post.publishedAt)} · <I c="fa-regular fa-clock" /> {readingTime(post.content)} min read</p>
      </div>
    </article>
  );
}
