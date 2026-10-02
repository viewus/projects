import { I } from './ui.jsx';

const safeColor = (c) => (/^(#[0-9a-f]{3,8}|var\(--mh-[a-z0-9-]+\))$/i.test(c || '') ? c : 'var(--mh-text-muted)');

/** Round platform icon (Instagram, YouTube, ...). Pass a platform object from DataService. */
export default function PlatformBadge({ platform, size = 'md', label = false }) {
  if (!platform) return null;
  return (
    <span className={`platform-badge platform-badge--${size}`} style={{ '--pf': safeColor(platform.color) }} title={platform.name}>
      <I c={platform.icon} />{label && <span>{platform.name}</span>}
    </span>
  );
}

/** A provider's several accounts as a row of badges. */
export function PlatformBadges({ platforms, size = 'sm' }) {
  return <span className="platform-badges">{platforms.map((a) => <PlatformBadge key={a.id || a.platform} platform={a.info} size={size} />)}</span>;
}
