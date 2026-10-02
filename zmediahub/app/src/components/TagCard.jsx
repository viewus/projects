import { Link } from 'react-router-dom';
import { useApp } from '../hooks/index.jsx';
import { Img } from './ui.jsx';

/** Image card for a tag. The image comes from data/tag-images.json, then the tag's category, then the default. */
export default function TagCard({ tag }) {
  const { config } = useApp();
  const img = config.tagImages?.tags?.[tag.slug] || tag.category?.image || config.tagImages?.default;
  return (
    <Link to={tag.url} className="tag-card">
      <Img src={img} alt="" />
      <span className="tag-card__body">
        <strong>#{tag.name}</strong>
        <span>{tag.count} {tag.count === 1 ? 'item' : 'items'}{tag.category ? ` · ${tag.category.name}` : ''}</span>
      </span>
    </Link>
  );
}
