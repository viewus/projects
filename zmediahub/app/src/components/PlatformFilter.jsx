import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../hooks/index.jsx';
import { I } from './ui.jsx';

/** Real filter: every pill links to the same page with ?platform=<key>; pages read it and filter. */
export default function PlatformFilter({ active = 'all', platforms, sticky = false }) {
  const { config } = useApp();
  const { pathname, search } = useLocation();
  const pills = config.platforms.filters || [];
  const pmap = new Map(platforms.map((p) => [p.id, p]));
  const hrefFor = (key) => {
    const q = new URLSearchParams(search);
    key === 'all' ? q.delete('platform') : q.set('platform', key);
    q.delete('page');
    const s = q.toString();
    return `${pathname}${s ? `?${s}` : ''}`;
  };
  return (
    <nav className={`platform-filter ${sticky ? 'platform-filter--sticky' : ''}`} aria-label="Filter by platform">
      <div className="platform-filter__track">
        {pills.map((p) => {
          const info = pmap.get(p.platform);
          const icon = p.icon || info?.icon || 'fa-solid fa-circle';
          const color = p.color || info?.color;
          const on = (active || 'all') === p.key;
          return (
            <Link key={p.key} to={hrefFor(p.key)} replace className={`pf-pill ${on ? 'is-active' : ''}`} aria-current={on ? 'true' : undefined} style={color ? { '--c': color } : undefined}>
              <span className="pf-pill__icon"><I c={icon} /></span>{p.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
