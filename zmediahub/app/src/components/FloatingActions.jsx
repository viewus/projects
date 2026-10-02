import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowUp, MessageCircle, Phone } from 'lucide-react';
import { useApp } from '../hooks/index.jsx';
import { safeUrl } from '../utils/helpers.js';

/**
 * Floating buttons (Lucide icons, GSAP motion): back-to-top once you scroll, plus WhatsApp and Call when the dataset has them
 * (data/company.csv -> whatsapp, phone). Turn off with data/site.json -> features.floatingActions = false.
 */
export default function FloatingActions() {
  const { config } = useApp();
  const co = config.company || {};
  const wa = safeUrl(co.whatsapp); const tel = co.phone && !/^\+?0[\s0]*$/.test(co.phone) && !/0{5}/.test(co.phone) ? `tel:${co.phone.replace(/[^+\d]/g, '')}` : '';
  const [top, setTop] = useState(false);
  const box = useRef(null);
  useEffect(() => { const f = () => setTop(window.scrollY > 700); f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f); }, []);
  useEffect(() => {
    const els = box.current?.querySelectorAll('.fab'); if (!els?.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { gsap.set(els, { opacity: 1, y: 0, scale: 1 }); return; }
    gsap.fromTo(els, { opacity: 0, y: 18, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.08, ease: 'back.out(1.8)', overwrite: true });
  }, [top, wa, tel]);
  if (config.site?.features?.floatingActions === false) return null;
  const toTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  return (
    <div className="fab-stack" ref={box}>
      {wa && <a className="fab fab--wa" href={wa} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" title="Chat on WhatsApp"><MessageCircle size={22} /></a>}
      {tel && <a className="fab fab--call" href={tel} aria-label="Call us" title="Call us"><Phone size={20} /></a>}
      {top && <button type="button" className="fab fab--top" onClick={toTop} aria-label="Back to top" title="Back to top"><ArrowUp size={22} /></button>}
    </div>
  );
}
