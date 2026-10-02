import { Link, useLocation } from 'react-router-dom';
import { I } from './ui.jsx';

/** Page list with ellipses: 1 2 3 4 … 9 · 1 … 4 5 6 … 9 · 1 … 6 7 8 9 */
function pageList(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, '…', pages];
  if (page >= pages - 3) return [1, '…', pages - 4, pages - 3, pages - 2, pages - 1, pages];
  return [1, '…', page - 1, page, page + 1, '…', pages];
}

export default function Pagination({ page, pages, total, pageSize }) {
  const { pathname, search } = useLocation();
  if (pages <= 1) return null;
  const href = (p) => {
    const q = new URLSearchParams(search);
    p > 1 ? q.set('page', p) : q.delete('page');
    const s = q.toString();
    return `${pathname}${s ? `?${s}` : ''}`;
  };
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <nav className="pagination" aria-label="Pagination">
      <ul>
        <li>{page > 1
          ? <Link className="pagination__step" to={href(page - 1)} aria-label="Previous page"><I c="fa-solid fa-chevron-left" /><span>Prev</span></Link>
          : <span className="pagination__step is-disabled"><I c="fa-solid fa-chevron-left" /><span>Prev</span></span>}</li>
        {pageList(page, pages).map((p, k) => (
          <li key={`${p}-${k}`} className={typeof p === 'number' ? '' : 'pagination__gap-li'}>
            {typeof p === 'number'
              ? <Link to={href(p)} aria-current={p === page ? 'page' : undefined} className={p === page ? 'is-active' : ''}>{p}</Link>
              : <span className="pagination__gap" aria-hidden="true">…</span>}
          </li>
        ))}
        <li>{page < pages
          ? <Link className="pagination__step" to={href(page + 1)} aria-label="Next page"><span>Next</span><I c="fa-solid fa-chevron-right" /></Link>
          : <span className="pagination__step is-disabled"><span>Next</span><I c="fa-solid fa-chevron-right" /></span>}</li>
      </ul>
      <p className="pagination__info">Showing {from}–{to} of {total}</p>
    </nav>
  );
}
