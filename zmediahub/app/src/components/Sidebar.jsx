import { Link } from 'react-router-dom';
import { A, I } from './ui.jsx';
import TagList from './TagList.jsx';
import ProviderCard from './ProviderCard.jsx';
import Stats from './Stats.jsx';

/** Left rail on category pages: every category, active one highlighted. */
export function CategoryNav({ categories, active }) {
  return (
    <nav className="side-card category-nav" aria-label="Categories">
      <h2 className="side-card__title">Categories</h2>
      <ul>
        <li><Link to="/categories"><span className="category-nav__ico"><I c="fa-solid fa-layer-group" /></span>All Categories</Link></li>
        {categories.map((c) => (
          <li key={c.id}>
            <Link to={c.url} className={active === c.slug ? 'is-active' : ''} aria-current={active === c.slug ? 'page' : undefined} style={{ '--c': c.color }}>
              <span className="category-nav__ico"><I c={c.icon} /></span>{c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function AboutCard({ title, text, stats }) {
  return (
    <section className="side-card">
      <h2 className="side-card__title">{title}</h2>
      <p className="side-card__text">{text}</p>
      {stats && <Stats items={stats} />}
    </section>
  );
}

export function TagsCard({ title = 'Popular Tags', tags, href = '/tags' }) {
  if (!tags?.length) return null;
  return (
    <section className="side-card">
      <div className="side-card__head"><h2 className="side-card__title"><I c="fa-solid fa-hashtag" /> {title}</h2><A href={href} className="icon-link" title="View all" aria-label="View all"><I c="fa-solid fa-arrow-right" /></A></div>
      <TagList tags={tags} />
    </section>
  );
}

export function ProvidersCard({ title = 'Top Providers', providers, href = '/creators' }) {
  if (!providers?.length) return null;
  return (
    <section className="side-card">
      <div className="side-card__head"><h2 className="side-card__title"><I c="fa-solid fa-crown" /> {title}</h2><A href={href} className="icon-link" title="View all" aria-label="View all"><I c="fa-solid fa-arrow-right" /></A></div>
      <div className="provider-list">{providers.map((p) => <ProviderCard key={p.id} provider={p} variant="row" />)}</div>
    </section>
  );
}
