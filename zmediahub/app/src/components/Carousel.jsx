import { Children, useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import { I } from './ui.jsx';

/**
 * Carousel powered by Embla: drag with the mouse, swipe with touch (with momentum), arrow buttons on
 * desktop, arrow keys when focused. Used for every horizontal row on the site.
 */
export default function Carousel({ children, label = 'Carousel', className = '', itemClass = '' }) {
  // WheelGesturesPlugin: trackpad two-finger swipes and Shift+mouse-wheel scroll the row (vertical wheel still scrolls the page)
  const [viewport, embla] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps', dragFree: true, skipSnaps: true, slidesToScroll: 'auto' }, [WheelGesturesPlugin()]);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback((api) => setEdge({ start: !api.canScrollPrev(), end: !api.canScrollNext() }), []);
  useEffect(() => {
    if (!embla) return undefined;
    update(embla);
    embla.on('select', update).on('reInit', update).on('scroll', update);
    return () => { embla.off('select', update).off('reInit', update).off('scroll', update); };
  }, [embla, update]);
  const items = Children.toArray(children);
  useEffect(() => { embla?.reInit(); }, [embla, items.length]);

  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); embla?.scrollNext(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); embla?.scrollPrev(); }
  };
  const noScroll = edge.start && edge.end;

  return (
    <div className={`carousel ${className} ${noScroll ? 'carousel--static' : ''}`}>
      <button type="button" className="carousel__btn carousel__btn--prev" onClick={() => embla?.scrollPrev()} disabled={edge.start} aria-label="Previous"><I c="fa-solid fa-chevron-left" /></button>
      <div className="carousel__track" ref={viewport} onKeyDown={onKey} tabIndex={0} role="region" aria-roledescription="carousel" aria-label={label}>
        <div className="carousel__container">
          {items.map((c) => <div key={c.key} className={`carousel__item ${itemClass}`}>{c}</div>)}
        </div>
      </div>
      <button type="button" className="carousel__btn carousel__btn--next" onClick={() => embla?.scrollNext()} disabled={edge.end} aria-label="Next"><I c="fa-solid fa-chevron-right" /></button>
    </div>
  );
}
