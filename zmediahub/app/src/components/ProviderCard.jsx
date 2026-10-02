import { Link } from 'react-router-dom';
import { memo } from 'react';
import { formatNumber } from '../utils/helpers.js';
import { Avatar, I, Verified } from './ui.jsx';
import { PlatformBadges } from './PlatformBadge.jsx';

const TYPE_LABEL = { creator: 'Creator', business: 'Business', brand: 'Brand', organization: 'Organization', publisher: 'Publisher', educator: 'Educator', influencer: 'Influencer' };
export const typeLabel = (t) => TYPE_LABEL[t] || 'Provider';

/** variant: card (carousel) | profile (grid) | row (sidebar) */
function ProviderCard({ provider: p, variant = 'card' }) {
  const square = p.type === 'business' || p.type === 'brand' || p.type === 'organization';
  if (variant === 'row') {
    return (
      <Link to={p.url} className="provider-row">
        <Avatar provider={p} size="md" square={square} />
        <span className="provider-row__text">
          <strong>{p.name}{p.verified && <Verified />}</strong>
          <span>{typeLabel(p.type)} · {formatNumber(p.followers)} followers</span>
        </span>
        <I c="fa-solid fa-chevron-right" />
      </Link>
    );
  }
  if (variant === 'profile') {
    return (
      <article className="card provider-card provider-card--profile">
        <Link to={p.url} className="stretched-link" aria-label={`${p.name} profile`} />
        <Avatar provider={p} size="xl" square={square} />
        <h3>{p.name}{p.verified && <Verified />}</h3>
        <p className="provider-card__type">{typeLabel(p.type)}{p.location && <> · {p.location}</>}</p>
        <p className="provider-card__bio">{p.bio}</p>
        <div className="provider-card__meta">
          {p.category && <span className="chip chip--soft">{p.category.name}</span>}
          <span><I c="fa-solid fa-user-group" /> {formatNumber(p.followers)}</span>
        </div>
        <PlatformBadges platforms={p.platforms} />
      </article>
    );
  }
  return (
    <article className="card provider-card">
      <Link to={p.url} className="stretched-link" aria-label={`${p.name} profile`} />
      <div className="provider-card__head">
        <Avatar provider={p} size="lg" square={square} />
        <span className="provider-card__text">
          <strong>{p.name}{p.verified && <Verified />}</strong>
          <span className="provider-card__type">{typeLabel(p.type)}</span>
        </span>
      </div>
      <PlatformBadges platforms={p.platforms} />
      <div className="provider-card__meta">
        {p.category && <span className="chip chip--soft">{p.category.name}</span>}
        <span>{formatNumber(p.followers)} followers</span>
      </div>
      <span className="provider-card__cta">Explore <I c="fa-solid fa-arrow-right" /></span>
    </article>
  );
}

export default memo(ProviderCard);
