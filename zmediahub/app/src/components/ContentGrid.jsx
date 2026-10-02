import ContentCard from './ContentCard.jsx';
import EmptyState from './EmptyState.jsx';
import Carousel from './Carousel.jsx';
import { motion, useReducedMotion } from 'motion/react';
import { useMedia } from '../hooks/index.jsx';

/** rail: on phones the grid becomes a swipeable carousel */
export default function ContentGrid({ items, view = 'grid', cols = 4, variant, empty, eagerCount = 0, rail = false }) {
  const phone = useMedia('(max-width: 768px)');
  const reduce = useReducedMotion();
  if (!items?.length) return empty || <EmptyState />;
  if (rail && phone) return <Carousel label="Content" className="carousel--cards">{items.map((it, i) => <ContentCard key={it.id} item={it} variant={variant || 'default'} eager={i < 2} />)}</Carousel>;
  const v = variant || (view === 'list' ? 'row' : 'default');
  return (
    <div className={`content-grid ${view === 'list' ? 'content-grid--list' : `content-grid--cols-${cols}`} ${rail ? 'rail-mobile' : ''}`}>
      {items.map((it, i) => (
        <motion.div key={it.id} className="content-grid__cell" initial={reduce ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -6% 0px' }} transition={{ duration: 0.4, delay: reduce ? 0 : Math.min(i % 5, 4) * 0.06, ease: [0.22, 0.61, 0.36, 1] }}>
          <ContentCard item={it} variant={v} eager={i < eagerCount} />
        </motion.div>
      ))}
    </div>
  );
}
