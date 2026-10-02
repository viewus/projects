import { I } from '../ui.jsx';
import ScrollRow from '../ScrollRow.jsx';

/** Reusable single-choice chip row. options: [{ value, label, icon? }]; clicking the active chip clears it when allowClear. */
export default function ChipGroup({ value = '', onChange, options, label, allLabel, allowClear = false, className = '' }) {
  const all = allLabel ? [{ value: '', label: allLabel }, ...options] : options;
  return (
    <ScrollRow className={`chip-row ${className}`} label={label}>
      {all.map((o) => {
        const on = String(o.value) === String(value);
        return (
          <button key={String(o.value)} type="button" className={`chip chip--lg ${on ? 'is-active' : ''}`} aria-pressed={on}
            onClick={() => onChange(on && allowClear ? '' : o.value)}>
            {o.icon && <I c={o.icon} />} {o.label}
          </button>
        );
      })}
    </ScrollRow>
  );
}
