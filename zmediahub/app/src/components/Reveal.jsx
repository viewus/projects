import { motion, useReducedMotion } from 'motion/react';

/** Fades and lifts its content into view once as it scrolls onscreen (skipped for reduced-motion users). */
export default function Reveal({ children, as = 'div', delay = 0, className = '' }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;
  if (reduce) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag className={className} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -8% 0px' }} transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1], delay }}>
      {children}
    </Tag>
  );
}
