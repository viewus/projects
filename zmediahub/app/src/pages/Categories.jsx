import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataService } from '../services/dataService.js';
import { useApp, useAsync, useFeature, usePageSEO, useQuery } from '../hooks/index.jsx';
import { tokenize } from '../utils/search.js';
import { lc, formatNumber } from '../utils/helpers.js';
import PageHero from '../components/PageHero.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import Banner from '../components/Banner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Dropdown from '../components/fields/Dropdown.jsx';
import CountUp from '../components/CountUp.jsx';
import { I, Skeleton } from '../components/ui.jsx';

export default function Categories() {
  const { config } = useApp();
  const provOn = useFeature('providers');
  const copy = config.pages.categories;
  const [q, setQ] = useQuery();
  const [text, setText] = useState('');
  const sort = q.sort || 'order';
  const view = q.view === 'list' ? 'list' : 'grid';
  usePageSEO({ ...config.seo.pages.categories, path: '/categories' });

  const { data } = useAsync(async () => {
    const [cats, stats, platforms, banners] = await Promise.all([
      DataService.getCategories({ platform: q.platform, hideEmpty: !!q.platform, sort }), DataService.getStats(), DataService.getPlatforms(),
      DataService.getBanners({ position: copy.banner, limit: 1 }),
    ]);
    return { cats, stats, platforms, banner: banners[0] };
  }, [q.platform, sort]);

  const tokens = tokenize(text);
  const cats = (data?.cats || []).filter((c) => !tokens.length || tokens.every((t) => lc(`${c.name} ${c.description} ${c.subs.map((s) => s.name).join(' ')}`).includes(t)));
  const s = data?.stats;

  const tiles = s && [
    ['fa-solid fa-table-cells-large', s.categories, 'Categories'], ['fa-regular fa-gem', s.content, 'Content Items'],
    ...(provOn ? [['fa-solid fa-user-group', s.providers, 'Providers']] : []), ['fa-solid fa-globe', s.platforms, 'Platforms'],
  ];

  return (
    <>
      <PageHero {...copy} aside={tiles && (
        <ul className="hero-stats" aria-label="At a glance">
          {tiles.map(([icon, v, l]) => <li key={l}><span><I c={icon} /></span><strong><CountUp value={v} /></strong>{l}</li>)}
        </ul>
      )}>
        <form className="searchbox searchbox--hero" role="search" onSubmit={(e) => e.preventDefault()}>
          <I c="fa-solid fa-magnifying-glass" className="searchbox__icon" />
          <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={copy.searchPlaceholder} aria-label="Filter categories" />
        </form>
      </PageHero>


      <div className="container layout-sidebar">
        <aside className="side-card filter-card" aria-label="Filter categories">
          <div className="side-card__head"><h2 className="side-card__title"><I c="fa-solid fa-sliders" /> Filter Categories</h2><Link to="/categories" className="icon-link" title="Clear all" aria-label="Clear all"><I c="fa-solid fa-rotate-left" /></Link></div>
          <ul>
            {(data?.cats || []).map((c) => <li key={c.id}><Link to={c.url} style={{ '--c': c.color }}><span className="category-nav__ico"><I c={c.icon} /></span>{c.name}<em>{c.count}</em></Link></li>)}
          </ul>
        </aside>

        <section aria-labelledby="all-cats">
          <div className="toolbar">
            <div><h2 id="all-cats" className="section-header__title">All Categories</h2><p className="muted">Explore content from your favourite topics</p></div>
            <div className="toolbar__right">
              <Dropdown variant="inline" icon="fa-solid fa-arrow-down-wide-short" label="Sort by" value={sort} onChange={(v) => setQ({ sort: v === 'order' ? '' : v })}
                options={[{ value: 'order', label: 'Featured' }, { value: 'popular', label: 'Popularity' }, { value: 'alpha', label: 'A–Z' }, { value: 'new', label: 'Newest' }]} />
              <div className="view-toggle" role="group" aria-label="Layout">
                <button type="button" className={view === 'grid' ? 'is-active' : ''} aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => setQ({ view: '' })}><I c="fa-solid fa-table-cells-large" /></button>
                <button type="button" className={view === 'list' ? 'is-active' : ''} aria-label="List view" aria-pressed={view === 'list'} onClick={() => setQ({ view: 'list' })}><I c="fa-solid fa-list" /></button>
              </div>
            </div>
          </div>
          {!data ? <Skeleton rows={8} /> : !cats.length ? (
            <EmptyState title="No categories found" text="Try another keyword or platform." action={{ href: '/categories', label: 'Reset' }} />
          ) : (
            <div className={`cat-grid ${view === 'list' ? 'cat-grid--list' : ''}`}>
              {cats.map((c) => <CategoryCard key={c.id} cat={c} variant={view === 'list' ? 'row' : 'large'} />)}
            </div>
          )}
        </section>
      </div>
      {data?.banner && <div className="container section"><Banner banner={data.banner} /></div>}
    </>
  );
}
