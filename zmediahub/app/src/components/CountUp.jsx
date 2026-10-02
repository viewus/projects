import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { formatNumber } from '../utils/helpers.js';

/** Number that counts up (GSAP) the first time it scrolls into view. Falls back to the plain number for reduced motion. */
export default function CountUp({ value, duration = 1.4 }) {
  const ref = useRef(null);
  const target = Number(value) || 0;
  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || target < 2) { el.textContent = formatNumber(target); return undefined; }
    const state = { n: 0 }; let tween;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      tween = gsap.to(state, { n: target, duration, ease: 'power2.out', onUpdate: () => { el.textContent = formatNumber(Math.round(state.n)); }, onComplete: () => { el.textContent = formatNumber(target); } });
    }, { threshold: 0.4 });
    el.textContent = formatNumber(0); io.observe(el);
    return () => { io.disconnect(); tween?.kill(); };
  }, [target, duration]);
  return <span ref={ref}>{formatNumber(target)}</span>;
}
