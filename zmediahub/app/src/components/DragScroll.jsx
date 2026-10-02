import { useEffect } from 'react';

/**
 * Global "grab and drag" for every horizontally scrolling row (pills, tabs, chip rows, rails).
 * Touch screens and trackpads already scroll natively; this adds the same feel for a mouse.
 * Event delegation: no per-row wiring, and rows added later work automatically.
 */
const scrollerFrom = (el) => {
  for (let e = el; e && e !== document.body; e = e.parentElement) {
    const ox = getComputedStyle(e).overflowX;
    if ((ox === 'auto' || ox === 'scroll') && e.scrollWidth > e.clientWidth + 2) return e;
  }
  return null;
};

export default function DragScroll() {
  useEffect(() => {
    let st = null;
    const down = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('input, textarea, select, [contenteditable]')) return;
      const el = scrollerFrom(e.target);
      if (!el) return;
      st = { el, x: e.clientX, left: el.scrollLeft, moved: false, snap: el.style.scrollSnapType };
    };
    const move = (e) => {
      if (!st) return;
      const dx = e.clientX - st.x;
      if (!st.moved && Math.abs(dx) < 5) return;
      if (!st.moved) { st.moved = true; st.el.style.scrollSnapType = 'none'; st.el.classList.add('is-dragging'); }
      st.el.scrollLeft = st.left - dx;
    };
    const up = () => {
      if (!st) return;
      const { el, moved, snap } = st;
      el.classList.remove('is-dragging');
      el.style.scrollSnapType = snap;
      if (moved) { const stop = (ev) => { ev.stopPropagation(); ev.preventDefault(); }; window.addEventListener('click', stop, { capture: true, once: true }); setTimeout(() => window.removeEventListener('click', stop, true), 60); }
      st = null;
    };
    // Without this the browser starts a native link/image drag and cancels the pointer after a few pixels.
    const noNativeDrag = (e) => { const t = e.target; if (t.closest && t.closest('a, img') && (t.closest('.carousel, .scrollrow__track') || scrollerFrom(t))) e.preventDefault(); };
    document.addEventListener('dragstart', noNativeDrag);
    document.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => { document.removeEventListener('dragstart', noNativeDrag); document.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  }, []);
  return null;
}
