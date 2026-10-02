/** "Load more" button for long lists. shown/total come from the page; onMore reveals the next batch. */
export default function LoadMore({ shown, total, onMore, label = 'Load more' }) {
  if (shown >= total) return null;
  return (
    <div className="load-more">
      <p>Showing {shown} of {total}</p>
      <button type="button" className="btn btn--outline" onClick={onMore}>{label}</button>
    </div>
  );
}
