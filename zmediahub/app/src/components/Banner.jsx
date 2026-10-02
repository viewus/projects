import { A, I, Img } from './ui.jsx';

/** Data-driven banner (promo, category, business, info, seasonal, custom, cta). */
export default function Banner({ banner: b, variant }) {
  if (!b) return null;
  const v = variant || (b.position === 'cta' ? 'cta' : 'promo');
  const [l1, l2] = b.title.split('||');
  if (v === 'cta') {
    return (
      <section className="cta">
        <span className="cta__icon"><I c={b.icon || 'fa-solid fa-rocket'} /></span>
        <div className="cta__text">
          <h2>{l1}{l2 && <> {l2}</>}</h2>
          {b.description && <p>{b.description}</p>}
        </div>
        {b.link && <A href={b.link} className="btn btn--dark btn--lg">{b.buttonText || 'Learn more'} <I c="fa-solid fa-arrow-right" /></A>}
      </section>
    );
  }
  return (
    <section className={`banner banner--${b.position}`} aria-label={b.title}>
      <picture>
        {b.mobileImage && <source media="(max-width: 640px)" srcSet={b.mobileImage} />}
        <Img src={b.image} alt="" className="banner__bg" />
      </picture>
      <div className="banner__shade" />
      <div className="banner__body">
        {b.subtitle && <p className="eyebrow">{b.subtitle}</p>}
        <h2>{l1}{l2 && <> <span>{l2}</span></>}</h2>
        {b.description && <p>{b.description}</p>}
        {b.link && <A href={b.link} className="btn btn--primary">{b.buttonText || 'Learn more'} <I c="fa-solid fa-arrow-right" /></A>}
      </div>
    </section>
  );
}
