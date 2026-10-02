import { getConfig } from '../services/config.js';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { getImage, getPlaceholder, initials, linkTarget } from '../utils/helpers.js';

export const I = ({ c, className = '' }) => <i className={`${c} ${className}`} aria-hidden="true" />;

/** Smart link: internal routes use the router, http(s) links open safely in a new tab. */
export function A({ href, to: toProp, children, className, ...rest }) {
  const t = linkTarget(toProp ?? href);
  if (t.internal) return <Link to={t.to} className={className} {...rest}>{children}</Link>;
  return <a href={t.to} className={className} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
}

/** Lazy image; a broken source swaps to the placeholder once (central image fallback). */
export function Img({ src, alt = '', className, eager = false, width, height, ...rest }) {
  const [bad, setBad] = useState(false);
  return (
    <img
      src={bad ? getPlaceholder() : getImage(src)} alt={alt} className={className} width={width} height={height}
      loading={eager ? undefined : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async"
      onError={() => setBad(true)} {...rest}
    />
  );
}

export const hue = (s) => [...String(s)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 360, 7);

export const Verified = () => <i className="fa-solid fa-circle-check verified" title="Verified" role="img" aria-label="Verified" />;

/** Avatar / logo with an initials fallback if there is no image or it fails to load. */
export function Avatar({ provider, size = 'md', square = false }) {
  const [bad, setBad] = useState(false);
  const name = provider?.name || getConfig()?.site?.name || '';
  const src = provider?.avatar || provider?.logo;
  return (
    <span className={`avatar avatar--${size} ${square ? 'avatar--square' : ''}`} style={{ '--av': `hsl(${hue(name)} 42% 40%)` }}>
      <span className="avatar__fallback" aria-hidden="true">{initials(name)}</span>
      {src && !bad && <img src={src} alt="" loading="lazy" decoding="async" onError={() => setBad(true)} />}
    </span>
  );
}

export function Breadcrumbs({ items, light = false }) {
  return (
    <nav className={`breadcrumbs ${light ? 'breadcrumbs--light' : ''}`} aria-label="Breadcrumb">
      <ol>
        {items.map((it, i) => (
          <li key={i}>
            {it.href && i < items.length - 1 ? <Link to={it.href}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
            {i < items.length - 1 && <I c="fa-solid fa-chevron-right" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Chip({ to: href, children, className = '', color, ...rest }) {
  return <Link to={href} className={`chip ${className}`} style={color ? { '--c': color } : undefined} {...rest}>{children}</Link>;
}

export function Skeleton({ rows = 4 }) {
  return (
    <div className="skeleton-grid" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => <div key={i} className="skeleton" />)}
    </div>
  );
}
