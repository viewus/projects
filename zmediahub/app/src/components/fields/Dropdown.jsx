import { useEffect, useId, useRef, useState } from 'react';
import { I } from '../ui.jsx';

/**
 * Reusable dropdown (replaces the native <select>): keyboard accessible, click-outside and Esc to close,
 * scrolls long lists, marks the selected option.
 *
 *   <Dropdown label="Category" value={v} onChange={setV} options={[{ value: 'a', label: 'A' }]} />
 *   variant: "stack" (label above the value, for filter bars) | "inline" (label beside the value, for toolbars)
 */
export default function Dropdown({ label, icon, value = '', onChange, options, variant = 'stack', className = '', placeholder = 'Select…' }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const root = useRef(null);
  const list = useRef(null);
  const id = useId();
  const index = Math.max(0, options.findIndex((o) => String(o.value) === String(value)));
  const current = options.find((o) => String(o.value) === String(value));

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (root.current && !root.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, [open]);
  useEffect(() => { list.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' }); }, [active, open]);

  const openMenu = () => { setActive(index); setOpen(true); };
  const pick = (o) => { onChange?.(o.value); setOpen(false); root.current?.querySelector('button')?.focus(); };
  const onKey = (e) => {
    if (!open) { if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openMenu(); } return; }
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(options.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(options.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (options[active]) pick(options[active]); }
    else if (e.key === 'Tab') setOpen(false);
  };

  return (
    <div className={`dd dd--${variant} ${open ? 'is-open' : ''} ${className}`} ref={root} onKeyDown={onKey}>
      <button type="button" className="dd__btn" aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-list`} title={icon ? label : undefined} onClick={() => (open ? setOpen(false) : openMenu())}>
        {icon ? <I c={icon} className="dd__icon" /> : label && <span className="dd__label">{label}</span>}
        {icon && label && <span className="sr-only">{label}</span>}
        <span className="dd__value">{current ? current.label : placeholder}</span>
        <I c="fa-solid fa-chevron-down" className="dd__chev" />
      </button>
      {open && (
        <ul className="dd__list" id={`${id}-list`} role="listbox" aria-label={label} ref={list}>
          {options.map((o, i) => {
            const selected = String(o.value) === String(value);
            return (
              <li key={String(o.value)} role="option" aria-selected={selected} data-active={i === active} className={`dd__opt ${selected ? 'is-selected' : ''} ${i === active ? 'is-active' : ''}`}
                onPointerEnter={() => setActive(i)} onClick={() => pick(o)}>
                <span>{o.label}</span>{selected && <I c="fa-solid fa-check" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
