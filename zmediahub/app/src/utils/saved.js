/**
 * "Saved" list kept in this browser only (localStorage). It stores just small keys like "content:c001" / "blog:3",
 * never whole items, and is capped (data/site.json -> features.saved.limit, default 30) because localStorage is small (~5 MB).
 */
import { useEffect, useState } from 'react';

const KEY = 'mh_saved_v1';
const EVT = 'mh-saved-changed';
export const DEFAULT_LIMIT = 30;

const read = () => {
  try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []; } catch { return []; }
};
const write = (list) => {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { return false; } // storage full or blocked (private mode)
  window.dispatchEvent(new Event(EVT));
  return true;
};

export const savedKey = (type, id) => `${type}:${id}`;
export const getSaved = () => read();
export const isSaved = (key) => read().includes(key);

/** returns { ok, saved, reason } - reason is "limit" or "storage" when it could not save */
export function toggleSaved(key, limit = DEFAULT_LIMIT) {
  const list = read();
  if (list.includes(key)) return { ok: write(list.filter((k) => k !== key)), saved: false };
  if (list.length >= limit) return { ok: false, saved: false, reason: 'limit' };
  return write([key, ...list]) ? { ok: true, saved: true } : { ok: false, saved: false, reason: 'storage' };
}
export const removeSaved = (key) => write(read().filter((k) => k !== key));
export const clearSaved = () => write([]);

/** live list that updates when anything is saved/removed (also across tabs) */
export function useSaved() {
  const [list, setList] = useState(read);
  useEffect(() => {
    const sync = () => setList(read());
    window.addEventListener(EVT, sync); window.addEventListener('storage', sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener('storage', sync); };
  }, []);
  return list;
}
