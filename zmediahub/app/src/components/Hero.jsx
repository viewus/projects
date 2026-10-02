import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { A, I, Img } from './ui.jsx';
import PlatformBadge from './PlatformBadge.jsx';
import SearchBox from './SearchBox.jsx';
import ScrollRow from './ScrollRow.jsx';


/**
 * Editorial hero. Slides come from banners.csv (position = hero). The featured card on the
 * right follows the active slide; the cards under it show trending content.
 */
export default function Hero({ banners, quickTags, cfg, stats, platforms = [], autoplayMs = 7500 }) {
  const slides = banners.length ? banners : [{ id: 'x', title: 'Discover Useful Content||From People, Creators & Businesses', description: '', image: '' }];
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef();
  const n = slides.length;
  const go = useCallback((k) => setI(((k % n) + n) % n), [n]);

  useEffect(() => {
    if (paused || n < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    timer.current = setInterval(() => setI((x) => (x + 1) % n), autoplayMs);
    return () => clearInterval(timer.current);
  }, [paused, n, autoplayMs]);


  return (
    <section className="hero" aria-roledescription="carousel" aria-label="Featured"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="hero__bgs" aria-hidden="true">
        {slides.map((b, k) => (
          <picture key={b.id} className={`hero__bg ${k === i ? 'is-active' : ''}`}>
            {b.mobileImage && <source media="(max-width: 640px)" srcSet={b.mobileImage} />}
            <Img src={b.image} alt="" eager={k === 0} />
          </picture>
        ))}
      </div>
      <div className="hero__shade" />
      <div className="container hero__inner">
        <div className="hero__copy">
          <div className="hero__texts">
            {slides.map((b, k) => {
              const [l1, l2] = b.title.split('||');
              const H = k === 0 ? 'h1' : 'h2';
              return (
                <div key={b.id} className={`hero__text ${k === i ? 'is-active' : ''}`} aria-hidden={k !== i} role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${n}`}>
                  {b.subtitle && <p className="eyebrow">{b.subtitle}</p>}
                  <H className="hero__title">{l1}{l2 && <><br /><span>{l2}</span></>}</H>
                  {b.description && <p className="hero__lead">{b.description}</p>}
                </div>
              );
            })}
          </div>
          <SearchBox variant="hero" placeholder={cfg.searchPlaceholder} />
          {quickTags.length > 0 && (
            <ScrollRow className="hero__quick">
              <span>Popular:</span>
              {quickTags.map((t) => <Link key={t.id} to={t.url}>#{t.name}</Link>)}
            </ScrollRow>
          )}
          {n > 1 && (
            <div className="hero__dots" role="tablist" aria-label="Choose slide">
              {slides.map((b, k) => <button key={b.id} type="button" role="tab" aria-selected={k === i} aria-label={`Slide ${k + 1}`} className={k === i ? 'is-active' : ''} onClick={() => go(k)} />)}
              {slides[i].link && <A href={slides[i].link} className="hero__cta">{slides[i].buttonText || 'Explore'} <I c="fa-solid fa-arrow-right" /></A>}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
