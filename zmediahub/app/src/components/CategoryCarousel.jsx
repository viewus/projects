import Carousel from './Carousel.jsx';
import CategoryCard from './CategoryCard.jsx';

export default function CategoryCarousel({ categories, variant = 'icon', label = 'Categories', showCount }) {
  return (
    <Carousel label={label} className={`carousel--cats carousel--${variant}`}>
      {categories.map((c) => <CategoryCard key={c.id} cat={c} variant={variant} showCount={showCount} />)}
    </Carousel>
  );
}
