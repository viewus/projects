import { motion, useReducedMotion } from 'motion/react';
import { useApp } from '../hooks/index.jsx';
import { savedKey, toggleSaved, useSaved, DEFAULT_LIMIT } from '../utils/saved.js';
import { I } from './ui.jsx';
import { useToast } from './Toast.jsx';

/** Bookmark toggle for a content item or blog post. type: "content" | "blog". Hidden when features.saved is off. */
export default function SaveButton({ type = 'content', id, className = '', label = false }) {
  const { config } = useApp();
  const list = useSaved();
  const reduce = useReducedMotion();
  const toast = useToast();
  const cfg = config.site?.features?.saved;
  if (cfg === false) return null;
  const limit = (typeof cfg === 'object' && cfg?.limit) || DEFAULT_LIMIT;
  const key = savedKey(type, id);
  const on = list.includes(key);
  const click = (e) => {
    e.preventDefault(); e.stopPropagation();
    const r = toggleSaved(key, limit);
    if (r.reason === 'limit') toast(`Saved list is full (${limit} items). Remove one to add another.`);
    else if (r.reason === 'storage') toast('Could not save in this browser.');
    else toast(r.saved ? 'Saved' : 'Removed from saved');
  };
  return (
    <motion.button whileTap={reduce ? undefined : { scale: 0.88 }} type="button" className={`save-btn ${on ? 'is-saved' : ''} ${className}`} onClick={click} aria-pressed={on} aria-label={on ? 'Remove from saved' : 'Save for later'} title={on ? 'Remove from saved' : 'Save for later'}>
      <motion.span key={String(on)} style={{ display: 'inline-flex' }} initial={reduce ? false : { scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 520, damping: 14 }}><I c={on ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'} /></motion.span>{label && <span>{on ? 'Saved' : 'Save'}</span>}
    </motion.button>
  );
}
