import { A, I } from './ui.jsx';

/** Title row (icon, heading, "View All" link on the right) with the description underneath. */
export default function SectionHeader({ title, subtitle, icon, iconColor, href, linkLabel = 'View All', level = 2, id }) {
  const H = `h${level}`;
  return (
    <div className="section-header">
      <div className="section-header__row">
        {icon && <span className="section-header__icon" style={iconColor ? { color: iconColor } : undefined}><I c={icon} /></span>}
        <H id={id} className="section-header__title">{title}</H>
        {href && <A href={href} className="icon-link" title={linkLabel} aria-label={linkLabel}><I c="fa-solid fa-arrow-right" /></A>}
      </div>
      {subtitle && <p className="section-header__sub">{subtitle}</p>}
    </div>
  );
}
