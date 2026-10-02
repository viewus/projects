import { Link } from 'react-router-dom';
import { hue, I, Img } from './ui.jsx';
import { initials } from '../utils/helpers.js';

export function BizLogo({ biz, size = 'md' }) {
  return (
    <span className={`biz-logo biz-logo--${size}`} style={{ '--av': `hsl(${hue(biz.name)} 40% 38%)` }}>
      {biz.logo ? <Img src={biz.logo} alt="" /> : initials(biz.name)}
    </span>
  );
}

export default function BusinessCard({ biz, variant = 'default' }) {
  return (
    <article className={`card biz-card biz-card--${variant}`}>
      {variant !== 'compact' && <div className="biz-card__cover"><Img src={biz.cover} alt="" /></div>}
      <div className="biz-card__body">
        <BizLogo biz={biz} />
        <div className="biz-card__text">
          <h3><Link to={biz.url} className="stretched-link">{biz.name}</Link></h3>
          <p className="biz-card__meta">{biz.category?.name}{biz.location && <> · <I c="fa-solid fa-location-dot" /> {biz.location}</>}</p>
          {variant !== 'compact' && <p className="biz-card__desc">{biz.description}</p>}
        </div>
      </div>
    </article>
  );
}
