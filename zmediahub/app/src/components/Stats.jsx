import { formatNumber } from '../utils/helpers.js';
import { I } from './ui.jsx';

/** Compact stat tiles: [{ icon, value, label }]. */
export default function Stats({ items, className = '' }) {
  return (
    <ul className={`stat-row ${className}`}>
      {items.map((s) => <li key={s.label}><I c={s.icon} /><strong>{formatNumber(s.value)}</strong><span>{s.label}</span></li>)}
    </ul>
  );
}

/** Inline metric used on cards: icon + number. */
export function Stat({ icon, value, label }) {
  return <li title={label}><I c={icon} /><span className="sr-only">{label}: </span>{formatNumber(value)}</li>;
}
