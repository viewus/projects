import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DataService } from '../services/dataService.js';
import { debounce, to } from '../utils/helpers.js';
import { useApp } from '../hooks/index.jsx';
import { Avatar, I, Img } from './ui.jsx';

/** Debounced global search with grouped suggestions. variant: header | hero | page */
export default function SearchBox({ variant = 'header', initial = '', placeholder, hotkey = false, autoFocus = false, onNavigate }) {
  const { config } = useApp();
  const cfg = config.site.search || {};
  const nav = useNavigate();
  const [q, setQ] = useState(initial);
  const [res, setRes] = useState(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const input = useRef(null);
  const box = useRef(null);
  const listId = useId();

  useEffect(() => setQ(initial), [initial]);

  const lookup = useRef(debounce(async (value) => {
    if (value.trim().length < (cfg.minChars || 2)) { setRes(null); return; }
    setRes(await DataService.search(value, { limit: 3 }));
  }, cfg.debounceMs || 220)).current;
  useEffect(() => () => lookup.cancel(), [lookup]);

  useEffect(() => {
    if (!hotkey) return undefined;
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.current?.focus(); setOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hotkey]);

  useEffect(() => {
    const onDoc = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, []);

  const entries = res ? [
    ...res.categories.slice(0, 2).map((c) => ({ key: `c${c.id}`, to: c.url, kind: 'Category', node: <><span className="sg-icon" style={{ color: c.color }}><I c={c.icon} /></span><span>{c.name}</span></> })),
    ...res.tags.slice(0, 2).map((t) => ({ key: `t${t.id}`, to: t.url, kind: 'Tag', node: <><span className="sg-icon"><I c="fa-solid fa-hashtag" /></span><span>#{t.name}</span></> })),
    ...res.providers.slice(0, 2).map((p) => ({ key: `p${p.id}`, to: p.url, kind: 'Provider', node: <><Avatar provider={p} size="xs" /><span>{p.name} <small>@{p.username}</small></span></> })),
    ...res.content.slice(0, 4).map((i) => ({ key: `i${i.id}`, to: i.url, kind: i.platformInfo.name, node: <><span className="sg-thumb"><Img src={i.thumbnail} alt="" /></span><span>{i.title}</span></> })),
  ] : [];

  const go = (target) => { setOpen(false); input.current?.blur(); onNavigate?.(); nav(target); };
  const submit = (e) => {
    e.preventDefault();
    if (active >= 0 && entries[active]) return go(entries[active].to);
    go(to('/search', { q: q.trim() }));
  };
  const onKey = (e) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (!entries.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % entries.length); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a <= 0 ? entries.length - 1 : a - 1)); }
  };
  const showPanel = open && q.trim().length >= (cfg.minChars || 2);
  const noResults = showPanel && res && !entries.length;

  return (
    <form className={`searchbox searchbox--${variant}`} role="search" onSubmit={submit} ref={box}>
      <I c="fa-solid fa-magnifying-glass" className="searchbox__icon" />
      <input
        ref={input} type="search" name="q" value={q} autoComplete="off" autoFocus={autoFocus} enterKeyHint="search"
        placeholder={placeholder || cfg.placeholder || 'Search…'} aria-label="Search"
        role="combobox" aria-expanded={showPanel} aria-controls={listId} aria-autocomplete="list"
        onChange={(e) => { setQ(e.target.value); setActive(-1); setOpen(true); lookup(e.target.value); }}
        onFocus={() => setOpen(true)} onKeyDown={onKey}
      />
      <button type="submit" className="searchbox__btn" aria-label="Search"><I c="fa-solid fa-arrow-right" /></button>
      {showPanel && (
        <div className="suggest" id={listId} role="listbox">
          {entries.map((e, i) => (
            <Link key={e.key} to={e.to} role="option" aria-selected={i === active} className={`suggest__item ${i === active ? 'is-active' : ''}`} onClick={() => go(e.to)}>
              {e.node}<em>{e.kind}</em>
            </Link>
          ))}
          {noResults && <p className="suggest__empty">No matches for “{q.trim()}”. Press Enter to search everywhere.</p>}
          {entries.length > 0 && <Link to={to('/search', { q: q.trim() })} className="suggest__all" onClick={() => go(to('/search', { q: q.trim() }))}>See all results for “{q.trim()}” <I c="fa-solid fa-arrow-right" /></Link>}
        </div>
      )}
    </form>
  );
}
