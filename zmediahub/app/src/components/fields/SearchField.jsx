import { I } from '../ui.jsx';

/** Reusable text filter with a search icon and a clear button. */
export default function SearchField({ value, onChange, placeholder = 'Search…', label = 'Search', className = '' }) {
  return (
    <label className={`search-field ${className}`}>
      <I c="fa-solid fa-magnifying-glass" /><span className="sr-only">{label}</span>
      <input type="search" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {value && <button type="button" className="search-field__clear" aria-label="Clear" onClick={() => onChange('')}><I c="fa-solid fa-xmark" /></button>}
    </label>
  );
}
