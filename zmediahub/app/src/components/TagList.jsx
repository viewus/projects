import { Link } from 'react-router-dom';

export function TagChip({ tag, showCount = false, active = false }) {
  return (
    <Link to={tag.url} className={`tag-chip ${active ? 'is-active' : ''}`}>
      #{tag.name}{showCount && <span className="tag-chip__count">{tag.count}</span>}
    </Link>
  );
}

export default function TagList({ tags, showCount = false, className = '' }) {
  if (!tags?.length) return null;
  return <div className={`tag-list ${className}`}>{tags.map((t) => <TagChip key={t.id} tag={t} showCount={showCount} />)}</div>;
}
