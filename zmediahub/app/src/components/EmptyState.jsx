import { A, I } from './ui.jsx';

export default function EmptyState({ icon = 'fa-regular fa-face-frown-open', title = 'No content found', text = 'Try another category or search term.', action, level = 3 }) {
  const H = `h${level}`;
  return (
    <div className="empty-state" role="status">
      <span className="empty-state__icon"><I c={icon} /></span>
      <H>{title}</H>
      <p>{text}</p>
      {action && <A href={action.href} className="btn btn--primary">{action.label}</A>}
    </div>
  );
}
