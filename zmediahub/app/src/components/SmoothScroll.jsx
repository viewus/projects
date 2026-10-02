import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Smooth, inertial mouse-wheel / trackpad scrolling (Lenis). Touch devices keep their native scrolling.
 * Switched off for reduced-motion visitors. Elements with data-lenis-prevent (dialogs, scrollable panels) scroll normally.
 * Turn off in data/site.json -> "smoothScroll": false
 */
export default function SmoothScroll({ enabled = true }) {
  useEffect(() => {
    if (!enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, anchors: false });
    let raf = 0;
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, [enabled]);
  return null;
}
