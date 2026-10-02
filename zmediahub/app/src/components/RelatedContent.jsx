import SectionHeader from './SectionHeader.jsx';
import Carousel from './Carousel.jsx';
import ContentCard from './ContentCard.jsx';
import ContentGrid from './ContentGrid.jsx';

/** A titled block of related items: a carousel (default) or a grid. */
export default function RelatedContent({ title, items, href, layout = 'carousel' }) {
  if (!items?.length) return null;
  return (
    <section className="section">
      <SectionHeader title={title} href={href} />
      {layout === 'grid'
        ? <ContentGrid items={items} cols={4} />
        : <Carousel label={title} className="carousel--cards">{items.map((it) => <ContentCard key={it.id} item={it} />)}</Carousel>}
    </section>
  );
}
