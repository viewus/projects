import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { I } from './ui.jsx';

/** Accordion: opening one question closes the others. Height and the chevron animate with Motion. */
export default function Faq({ items }) {
  const [open, setOpen] = useState(null);
  const reduce = useReducedMotion();
  const uid = useId();
  if (!items?.length) return null;
  return (
    <div className="faq">
      {items.map((f) => {
        const on = open === f.id;
        return (
          <div key={f.id} className={`faq__item ${on ? 'is-open' : ''}`}>
            <h3>
              <button type="button" className="faq__q" aria-expanded={on} aria-controls={`${uid}-${f.id}`} onClick={() => setOpen(on ? null : f.id)}>
                <span>{f.question}</span>
                <motion.i className="fa-solid fa-chevron-down" aria-hidden="true" animate={{ rotate: on ? 180 : 0 }} transition={reduce ? { duration: 0 } : { duration: 0.25 }} />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div id={`${uid}-${f.id}`} role="region" className="faq__answer" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={reduce ? { duration: 0 } : { duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }} style={{ overflow: 'hidden' }}>
                  <p>{f.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
