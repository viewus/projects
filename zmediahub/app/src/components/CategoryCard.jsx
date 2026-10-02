import { Link } from 'react-router-dom';
import { formatNumber } from '../utils/helpers.js';
import { I, Img } from './ui.jsx';

const color = (c) => (/^(#[0-9a-f]{3,8}|var\(--mh-[a-z0-9-]+\))$/i.test(c.color || '') ? c.color : 'var(--mh-primary)');
export const postsLabel = (n) => `${formatNumber(n)} ${n === 1 ? 'post' : 'posts'}`;

/** variant: icon (home strip) | bubble (round photo) | tile (popular) | large (categories page) | row (list view) */
export default function CategoryCard({ cat, variant = 'large', showCount = false }) {
  const style = { '--c': color(cat) };
  if (variant === 'icon') {
    return (
      <Link to={cat.url} className="cat-chip" style={style}>
        <span className="cat-chip__icon"><I c={cat.icon} /></span>
        <span className="cat-chip__name">{cat.name}</span>
        {showCount && <span className="cat-chip__count">{cat.count}</span>}
      </Link>
    );
  }
  if (variant === 'bubble') {
    return (
      <Link to={cat.url} className="cat-bubble" style={style}>
        <span className="cat-bubble__img"><Img src={cat.image} alt="" /></span>
        <span className="cat-bubble__name">{cat.name}</span>
      </Link>
    );
  }
  if (variant === 'tile') {
    return (
      <Link to={cat.url} className="cat-tile" style={style}>
        <Img src={cat.image} alt="" />
        <span className="cat-tile__body">
          <strong>{cat.name}</strong>
          <span>{postsLabel(cat.count)}</span>
        </span>
      </Link>
    );
  }
  return (
    <Link to={cat.url} className={`cat-card ${variant === 'row' ? 'cat-card--row' : ''}`} style={style}>
      <Img src={cat.image} alt="" className="cat-card__bg" />
      <span className="cat-card__shade" />
      <span className="cat-card__body">
        <span className="cat-card__icon"><I c={cat.icon} /></span>
        <span className="cat-card__text">
          <strong className="cat-card__name">{cat.name}</strong>
          <span className="cat-card__count">{postsLabel(cat.count)}</span>
          <span className="cat-card__desc">{cat.description}</span>
        </span>
        <span className="cat-card__go"><I c="fa-solid fa-chevron-right" /></span>
      </span>
    </Link>
  );
}
