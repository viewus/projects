import { memo } from 'react';
import { Link } from 'react-router-dom';
import { formatDuration, timeAgo } from '../utils/helpers.js';
import { useApp } from '../hooks/index.jsx';
import { Avatar, I, Img, Verified } from './ui.jsx';
import PlatformBadge from './PlatformBadge.jsx';
import { Stat } from './Stats.jsx';
import { isEmbeddable } from './EmbedViewer.jsx';
import SaveButton from './SaveButton.jsx';

const TYPE = {
  video: ['Video', 'fa-solid fa-play'], reel: ['Reel', 'fa-solid fa-film'], short: ['Short', 'fa-solid fa-bolt'], post: ['Post', 'fa-regular fa-image'],
  article: ['Article', 'fa-regular fa-newspaper'], live: ['Live', 'fa-solid fa-tower-broadcast'], link: ['Link', 'fa-solid fa-link'],
};

/** One reusable card for every platform. variant: default | compact | row | mini */
function ContentCard({ item, variant = 'default', eager = false, showTags = true }) {
  const [typeLabel, typeIcon] = TYPE[item.type] || [item.type, 'fa-solid fa-circle'];
  const dur = formatDuration(item.duration);
  const embed = isEmbeddable(item);
  const p = item.provider;
  const { config } = useApp();
  const showProvider = config.site.cards?.showProvider !== false;
  const showStats = config.site.cards?.showStats !== false;

  if (variant === 'mini') {
    return (
      <article className="card content-card content-card--mini">
        <Link to={item.url} className="content-card__thumb">
          <Img src={item.thumbnail} alt="" />
          {dur && <span className="content-card__duration">{dur}</span>}
          <PlatformBadge platform={item.platformInfo} size="xs" />
        </Link>
        <div className="content-card__body">
          <h3 className="content-card__title"><Link to={item.url} className="stretched-link">{item.title}</Link></h3>
          {showProvider && p && <span className="content-card__provider-plain">{p.name}</span>}
        </div>
      </article>
    );
  }

  return (
    <article className={`card content-card content-card--${variant}`}>
      <div className="content-card__media">
        <Link to={item.url} className="content-card__thumb" tabIndex={-1} aria-hidden="true">
          <Img src={item.thumbnail} alt="" eager={eager} />
        </Link>
        <span className="content-card__platforms">{item.availableOn.map((a) => <PlatformBadge key={a.platform} platform={a.info} size={item.availableOn.length > 1 ? 'sm' : 'md'} />)}</span>
        <span className="content-card__type" title={embed ? 'Preview available here' : 'Opens the original platform'}>
          <I c={typeIcon} /> {typeLabel}
          <I c={embed ? 'fa-solid fa-circle-play' : 'fa-solid fa-arrow-up-right-from-square'} className="content-card__mode" />
          <span className="sr-only">{embed ? 'Embedded preview' : 'External link'}</span>
        </span>
        {dur && <span className="content-card__duration">{dur}</span>}
      </div>
      <div className="content-card__body">
        <SaveButton id={item.id} className="save-btn--card" />
        {item.category && <Link to={item.category.url} className="content-card__eyebrow">{item.category.name}</Link>}
        <h3 className="content-card__title"><Link to={item.url} className="stretched-link">{item.title}</Link></h3>
        {item.description && variant !== 'compact' && <p className="content-card__desc">{item.description}</p>}
        {!showProvider ? null : p ? (
          <Link to={p.url} className="content-card__provider">
            <Avatar provider={p} size="xs" /><span>{p.name}</span>{p.verified && <Verified />}
          </Link>
        ) : <span className="content-card__provider"><Avatar size="xs" /><span>Independent source</span></span>}
        {showTags && (
          <p className="content-card__meta">
            {item.tags.slice(0, 1).map((t) => <Link key={t.id} to={t.url}>#{t.name}</Link>)}
            <span>{timeAgo(item.publishedAt)}</span>
          </p>
        )}
        {showStats && <ul className="content-card__stats">
          <Stat icon="fa-regular fa-eye" value={item.views} label="Views" />
          <Stat icon="fa-regular fa-heart" value={item.likes} label="Likes" />
          <Stat icon="fa-regular fa-comment" value={item.comments} label="Comments" />
          {variant === 'row' && <li className="content-card__date">{timeAgo(item.publishedAt)}</li>}
        </ul>}
        {!showStats && variant === 'row' && <p className="content-card__date content-card__date--solo">{timeAgo(item.publishedAt)}</p>}
      </div>
    </article>
  );
}

export default memo(ContentCard);
