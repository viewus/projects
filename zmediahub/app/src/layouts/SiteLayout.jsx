import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { getConfig } from '../services/config.js';
const PageParticles = lazy(() => import('../components/Particles.jsx'));
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import BottomNav from '../components/BottomNav.jsx';
import DragScroll from '../components/DragScroll.jsx';
import PopupManager from '../components/PopupManager.jsx';
import SmoothScroll from '../components/SmoothScroll.jsx';
import FloatingActions from '../components/FloatingActions.jsx';
import { useApp } from '../hooks/index.jsx';

/** New page => scroll to top + move focus to <main>. Page change inside a list => scroll to the list. */
function ScrollManager() {
  const { pathname, search } = useLocation();
  const prev = useRef({ pathname, page: '' });
  useEffect(() => {
    const p = new URLSearchParams(search).get('page') || '';
    if (prev.current.pathname !== pathname) {
      window.scrollTo(0, 0);
      document.getElementById('main')?.focus({ preventScroll: true });
    } else if (prev.current.page !== p) {
      const el = document.querySelector('[data-scroll-anchor]');
      el ? el.scrollIntoView({ block: 'start' }) : window.scrollTo(0, 0);
    }
    prev.current = { pathname, page: p };
  }, [pathname, search]);
  return null;
}

/** Shared chrome: floating header, page area, footer. */
export default function SiteLayout({ children }) {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const pcfg = getConfig()?.theme?.particles || {};
  const { config } = useApp();
  return (
    <>
      <ScrollManager />
      <DragScroll />
      <SmoothScroll enabled={config.site?.smoothScroll !== false} />
      <button type="button" className="skip-link" onClick={() => { const m = document.getElementById('main'); m?.focus(); m?.scrollIntoView(); }}>Skip to content</button>
      {!reduce && pcfg.enabled !== false && <Suspense fallback={null}><PageParticles cfg={pcfg} /></Suspense>}
      <Header />
      <main id="main" tabIndex={-1} className="page"><motion.div key={pathname} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}>{children}</motion.div></main>
      <Footer />
      <BottomNav />
      <PopupManager />
      <FloatingActions />
    </>
  );
}
