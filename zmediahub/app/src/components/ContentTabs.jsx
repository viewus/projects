import { Link, useLocation } from 'react-router-dom';
import { I } from './ui.jsx';
import SortDropdown from './SortDropdown.jsx';
import ScrollRow from './ScrollRow.jsx';

function hrefWith(pathname, search, changes) {
  const q = new URLSearchParams(search);
  Object.entries(changes).forEach(([k, v]) => (v ? q.set(k, v) : q.delete(k)));
  q.delete('page');
  const s = q.toString();
  return `${pathname}${s ? `?${s}` : ''}`;
}

/** Tabs (Trending / Popular / New / Most Liked / Most Commented) + sort + grid/list toggle. */
export default function ContentTabs({ tabs, activeTab, sortOptions, sort, view = 'grid', showSort = true }) {
  const { pathname, search } = useLocation();
  return (
    <div className="toolbar">
      {tabs && (
        <ScrollRow className="tabs" label="Content views">
          {tabs.map((t) => (
            <Link key={t.key} role="tab" aria-selected={activeTab === t.key} replace to={hrefWith(pathname, search, { tab: t.key === tabs[0].key ? '' : t.key, sort: '' })} className={`tab ${activeTab === t.key ? 'is-active' : ''}`}>
              {t.icon && <I c={t.icon} />}{t.label}
            </Link>
          ))}
        </ScrollRow>
      )}
      <div className="toolbar__right">
        {showSort && <SortDropdown options={sortOptions} value={sort} defaultLabel={activeTab ? 'Default' : undefined} />}
        <div className="view-toggle" role="group" aria-label="Layout">
          <Link replace to={hrefWith(pathname, search, { view: '' })} className={view === 'grid' ? 'is-active' : ''} aria-label="Grid view" aria-pressed={view === 'grid'}><I c="fa-solid fa-table-cells-large" /></Link>
          <Link replace to={hrefWith(pathname, search, { view: 'list' })} className={view === 'list' ? 'is-active' : ''} aria-label="List view" aria-pressed={view === 'list'}><I c="fa-solid fa-list" /></Link>
        </div>
      </div>
    </div>
  );
}
