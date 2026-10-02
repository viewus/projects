import { useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { slugify } from '../utils/helpers.js';
import { I } from './ui.jsx';

/** Thin reading-progress bar at the top of the page (Motion scroll-linked, springy). */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });
  return <motion.div className="read-progress" style={{ scaleX: reduce ? scrollYProgress : x }} aria-hidden="true" />;
}

/** "On this page": built from the ## headings of the article text; highlights the section being read. */
export function Toc({ content }) {
  const items = [...String(content || '').matchAll(/^##\s+(.+)$/gm)].map((m) => ({ id: slugify(m[1]), label: m[1].replace(/[*`_]/g, '') }));
  const [active, setActive] = useState('');
  useEffect(() => {
    if (items.length < 3) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let cur = items[0].id;
      for (const it of items) { const el = document.getElementById(it.id); if (el && el.getBoundingClientRect().top <= 150) cur = it.id; }
      setActive(atBottom ? items[items.length - 1].id : cur);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update(); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [content]); // eslint-disable-line react-hooks/exhaustive-deps
  if (items.length < 3) return null;
  return (
    <nav className="toc" aria-label="On this page">
      <p className="toc__title"><I c="fa-solid fa-list-ul" /> On this page</p>
      <ol>{items.map((i) => (
        <li key={i.id}><a href={`#${i.id}`} className={active === i.id ? 'is-active' : ''} onClick={(e) => { e.preventDefault(); document.getElementById(i.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{i.label}</a></li>
      ))}</ol>
    </nav>
  );
}
