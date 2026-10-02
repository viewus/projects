import { Link, useLocation } from 'react-router-dom';
import { featureOn, useApp } from '../hooks/index.jsx';
import { linkTarget } from '../utils/helpers.js';
import { I } from './ui.jsx';

/** Phone-only tab bar (like the YouTube app). Tabs come from data/navigation.json -> mobileTabs. */
export default function BottomNav() {
  const { config } = useApp();
  const { pathname } = useLocation();
  const tabs = (config.navigation.mobileTabs || []).filter((t) => featureOn(config, t.feature));
  if (!tabs.length) return null;
  const on = (t) => { const to = linkTarget(t.href).to; return to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`) || (t.prefix && pathname.startsWith(t.prefix)); };
  return (
    <nav className="bottom-nav" aria-label="Quick navigation">
      {tabs.map((t) => (
        <Link key={t.label} to={linkTarget(t.href).to} className={on(t) ? 'is-active' : ''} aria-current={on(t) ? 'page' : undefined}>
          <I c={on(t) && t.activeIcon ? t.activeIcon : t.icon} /><span>{t.label}</span>
        </Link>
      ))}
    </nav>
  );
}
