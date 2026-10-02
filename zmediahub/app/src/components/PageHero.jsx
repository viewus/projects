import { Img, Breadcrumbs } from './ui.jsx';

/** Full-bleed page header with photo background (sits under the floating header). */
export default function PageHero({ title, highlight, subtitle, image, crumbs, icon, children, aside, compact = false }) {
  return (
    <section className={`page-hero bleed-top ${compact ? 'page-hero--compact' : ''}`}>
      {image && <Img src={image} alt="" className="page-hero__bg" eager />}
      <div className="page-hero__shade" />
      <div className="container page-hero__inner">
        <div className="page-hero__copy">
          {crumbs && <Breadcrumbs items={crumbs} light />}
          <h1 className="page-hero__title">{icon}{title}{highlight && <> <span>{highlight}</span></>}</h1>
          {subtitle && <p className="page-hero__sub">{subtitle}</p>}
          {children}
        </div>
        {aside && <div className="page-hero__aside">{aside}</div>}
      </div>
    </section>
  );
}
