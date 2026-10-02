import { useQuery } from '../hooks/index.jsx';
import Dropdown from './fields/Dropdown.jsx';

export default function SortDropdown({ options, value, defaultLabel }) {
  const [, setParams] = useQuery();
  const opts = [...(defaultLabel ? [{ value: '', label: defaultLabel }] : []), ...options.map((o) => ({ value: o.key, label: o.label }))];
  return <Dropdown variant="inline" icon="fa-solid fa-arrow-down-wide-short" label="Sort by" value={value || ''} onChange={(v) => setParams({ sort: v })} options={opts} />;
}
