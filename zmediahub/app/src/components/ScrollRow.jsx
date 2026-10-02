import { useCallback, useEffect, useRef, useState } from 'react';
import { I } from './ui.jsx';

/**
 * A horizontally scrolling row (tabs, chips, tag strip) with left/right arrows that appear only when
 * there is more to scroll. The track still scrolls by touch, wheel and mouse-drag (see DragScroll).
 *   <ScrollRow className="tabs">...</ScrollRow>   (className is applied to the scrolling track)
 */
export default function ScrollRow({ children, className = '', label }) {
  const track = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: true });
  const update = useCallback(() => {
    const el = track.current; if (!el) return;
    setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  }, []);
  useEffect(() => {
    update();
    const el = track.current; const ro = new ResizeObserver(update); ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c));
    return () => ro.disconnect();
  }, [update, children]);
  const go = (dir) => {
    const el = track.current; const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: smooth ? 'smooth' : 'auto' });
  };
  const scrollable = !(edge.start && edge.end);
  return (
    <div className={`scrollrow ${scrollable ? 'is-scrollable' : ''} ${edge.start ? 'at-start' : ''} ${edge.end ? 'at-end' : ''}`}>
      <button type="button" className="scrollrow__btn scrollrow__btn--prev" onClick={() => go(-1)} aria-label="Scroll left" tabIndex={edge.start ? -1 : 0}><I c="fa-solid fa-chevron-left" /></button>
      <div className={`scrollrow__track ${className}`} ref={track} onScroll={update} role={label ? 'group' : undefined} aria-label={label}>{children}</div>
      <button type="button" className="scrollrow__btn scrollrow__btn--next" onClick={() => go(1)} aria-label="Scroll right" tabIndex={edge.end ? -1 : 0}><I c="fa-solid fa-chevron-right" /></button>
    </div>
  );
}
