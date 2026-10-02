import Carousel from './Carousel.jsx';
import ProviderCard from './ProviderCard.jsx';

export default function ProviderCarousel({ providers }) {
  return (
    <Carousel label="Creators and businesses" className="carousel--providers">
      {providers.map((p) => <ProviderCard key={p.id} provider={p} />)}
    </Carousel>
  );
}
