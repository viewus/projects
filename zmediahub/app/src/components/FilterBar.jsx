import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '../hooks/index.jsx';
import { I } from './ui.jsx';
import Dropdown from './fields/Dropdown.jsx';
import Modal from './Modal.jsx';

/**
 * Flipkart-style filtering: one "Filters" button opens a panel with every filter group, chosen filters
 * show as removable chips, and sorting stays a separate dropdown.
 *
 * fields: [{ param, label, all, options:[{value,label}], resets }]. A field with param "sort" becomes the sort dropdown.
 * Everything is stored in the URL query, so filters stack, can be shared, and work with the back button.
 */
export default function FilterBar({ fields, clearKeys = [], className = '' }) {
  const [params, setParams] = useQuery();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const sortField = fields.find((f) => f.param === 'sort');
  const groups = fields.filter((f) => f.param !== 'sort');

  // every group is multi-select (values are comma separated in the URL) except single-choice ones like Date
  const list = (f) => String(params[f.param] || '').split(',').filter(Boolean);
  const multi = (f) => f.multi !== false && f.param !== 'range';
  const labelOf = (f, v) => f.options.find((o) => String(o.value) === String(v))?.label || v;
  const active = groups.flatMap((f) => list(f).map((v) => ({ f, v })));
  const pick = (f, v) => {
    if (!v) return setParams({ [f.param]: '', ...(f.resets || {}) });
    if (!multi(f)) return setParams({ [f.param]: v, ...(f.resets || {}) });
    const cur = list(f); const next = cur.includes(String(v)) ? cur.filter((x) => x !== String(v)) : [...cur, String(v)];
    setParams({ [f.param]: next.join(','), ...(f.resets || {}) });
  };
  const removeOne = (f, v) => setParams({ [f.param]: list(f).filter((x) => x !== String(v)).join(','), ...(f.resets || {}) });
  const clearAll = () => setParams(Object.fromEntries(groups.flatMap((g) => [g.param, ...Object.keys(g.resets || {})]).map((k) => [k, ''])));

  return (
    <div className={`filter-bar ${className}`}>
      <button type="button" className="filter-btn" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <I c="fa-solid fa-sliders" /> Filters{active.length > 0 && <b>{active.length}</b>}
      </button>
      <div className="filter-bar__chips">
        {active.length > 1 && <button type="button" className="filter-clear" onClick={clearAll} title="Clear all filters" aria-label="Clear all filters"><I c="fa-solid fa-trash-can" /></button>}
        {active.map(({ f, v }) => (
          <button key={`${f.param}:${v}`} type="button" className="filter-chip" onClick={() => removeOne(f, v)} aria-label={`Remove filter ${f.label}: ${labelOf(f, v)}`}>
            <span>{f.label}:</span> {labelOf(f, v)} <I c="fa-solid fa-xmark" />
          </button>
        ))}
      </div>
      {sortField && (
        <Dropdown variant="inline" icon="fa-solid fa-arrow-down-wide-short" label="Sort" value={params.sort || ''} onChange={(v) => setParams({ sort: v })}
          options={[...(sortField.all !== false ? [{ value: '', label: sortField.all || 'Default' }] : []), ...sortField.options]} />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Filters" size="sm" className="modal--drawer"
        footer={<><button type="button" className="btn btn--outline btn--sm" onClick={clearAll} disabled={!active.length} title="Clear all" aria-label="Clear all filters"><I c="fa-solid fa-rotate-left" /></button><button type="button" className="btn btn--primary btn--sm" onClick={() => setOpen(false)}>Show results</button></>}>
        {groups.map((f) => (
          <fieldset key={f.param} className="filter-group">
            <legend>{f.label}{multi(f) && <em>select any</em>}</legend>
            <div className="filter-group__opts">
              {f.options.map((o) => {
                const on = list(f).includes(String(o.value));
                return <button key={String(o.value)} type="button" className={`filter-opt ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => pick(f, o.value)}><span className="filter-opt__box" aria-hidden="true">{on && <I c="fa-solid fa-check" />}</span>{o.label}</button>;
              })}
            </div>
          </fieldset>
        ))}
      </Modal>
    </div>
  );
}
