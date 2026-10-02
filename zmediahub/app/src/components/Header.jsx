import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { featureOn, useApp } from '../hooks/index.jsx';
import { linkTarget } from '../utils/helpers.js';
import { I } from './ui.jsx';
import SearchBox from './SearchBox.jsx';

export function Logo({ light = false }) {
  const { config } = useApp();
  const s = config.site;
  const [a, b] = s.nameParts || [s.name, ''];
  return (
    <Link to="/" className={`logo ${light ? 'logo--light' : ''}`} aria-label={`${s.name} home`}>
      <img src={s.logo} alt="" width="40" height="40" />
      <span className="logo__text"><span className="logo__name">{a}<b>{b}</b></span><small>{s.tagline}</small></span>
    </Link>
  );
}

/** Floating, sticky pill header. Mobile: logo + search + menu. No sign-in, no account. */
export default function Header() {
  const { config } = useApp();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [more, setMore] = useState(false);
  const [mSearch, setMSearch] = useState(false);
  const moreRef = useRef(null);
  const nav = { main: config.navigation.main.filter((i) => featureOn(config, i.feature)), more: config.navigation.more.filter((i) => featureOn(config, i.feature)) };

  useEffect(() => { setMenu(false); setMore(false); setMSearch(false); }, [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    const close = (e) => { if (moreRef.current && !moreRef.current.contains(e.target)) setMore(false); };
    const esc = (e) => { if (e.key === 'Escape') { setMore(false); setMenu(false); } };
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc); };
  }, []);
  useEffect(() => { document.body.classList.toggle('no-scroll', menu); return () => document.body.classList.remove('no-scroll'); }, [menu]);

  const PREFIX = { '/categories': '/category', '/creators': '/provider', '/blog': '/blog', '/businesses': '/business' };
  const reduce = useReducedMotion();
  const spring = reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 32 };
  const isActive = (item) => {
    const t = linkTarget(item.href).to;
    if (t === '/') return pathname === '/';
    return pathname === t || pathname.startsWith(`${t}/`) || (PREFIX[t] && pathname.startsWith(PREFIX[t]));
  };

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="site-header__bar">
        <Logo />
        <nav className="main-nav" aria-label="Main">
          <ul>
            {nav.main.map((i) => (
              <li key={i.label}><Link to={linkTarget(i.href).to} className={isActive(i) ? 'is-active' : ''} aria-current={isActive(i) ? 'page' : undefined}>
                {isActive(i) && <motion.span layoutId="nav-pill" className="nav-pill" transition={spring} />}
                <span className="nav-label">{i.label}</span>
              </Link></li>
            ))}
            <li className="more" ref={moreRef}>
              <button type="button" className={nav.more.some(isActive) ? 'is-active' : ''} aria-expanded={more} aria-haspopup="true" onClick={() => setMore(!more)}>More <I c="fa-solid fa-chevron-down" /></button>
              <AnimatePresence>
                {more && (
                  <motion.ul className="more__menu" initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 460, damping: 34 }}>
                    {nav.more.map((i, k) => (
                      <motion.li key={i.label} initial={reduce ? false : { opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: reduce ? 0 : 0.03 * k, duration: 0.18 }}>
                        <Link to={linkTarget(i.href).to} className={isActive(i) ? 'is-active' : ''} aria-current={isActive(i) ? 'page' : undefined}>{i.icon && <I c={i.icon} />}{i.label}</Link>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          </ul>
        </nav>
        <div className="site-header__search"><SearchBox variant="header" hotkey /></div>
        <div className="site-header__actions">
          <button type="button" className="icon-btn" aria-label="Search" aria-expanded={mSearch} onClick={() => { setMSearch(!mSearch); setMenu(false); }}><I c="fa-solid fa-magnifying-glass" /></button>
          <button type="button" className="icon-btn" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => { setMenu(!menu); setMSearch(false); }}><I c={menu ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'} /></button>
        </div>
      </div>
      {mSearch && <div className="mobile-search"><SearchBox variant="page" autoFocus onNavigate={() => setMSearch(false)} /></div>}
      {menu && (
        <div className="drawer" role="dialog" aria-label="Menu">
          <ul>
            {[...nav.main, ...nav.more].map((i) => (
              <li key={i.label}><Link to={linkTarget(i.href).to} className={isActive(i) ? 'is-active' : ''}>{i.icon && <I c={i.icon} />}{i.label}<I c="fa-solid fa-chevron-right" /></Link></li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
