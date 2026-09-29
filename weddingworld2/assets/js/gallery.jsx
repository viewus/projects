/**
 * Editorial Wedding Gallery Section
 */

function GalleryItem({ image, index, images }) {
  const lightbox = useLightbox();
  const reveal = useReveal();
  const tilt = useTilt(5);

  function combinedRef(el) {
    reveal.current = el;
    tilt.current = el;
  }

  return (
    <div
      ref={combinedRef}
      className="gallery-item reveal-zoom-in gallery-card-frame"
      onClick={() => lightbox && lightbox.open(images, index)}
    >
      <SafeImage
        src={image.src}
        alt={image.caption || `Wedding Memory ${index + 1}`}
        wrapperClassName="gallery-img-box"
      />
      {image.caption && <div className="gallery-caption">{image.caption}</div>}
    </div>
  );
}

function GallerySection() {
  const data = useWeddingData();
  const gallery = data?.gallery;
  const headerRef = useReveal();

  if (!gallery || !gallery.enabled || !gallery.images || !gallery.images.length) {
    return null;
  }

  return (
    <section id="gallery-section" className="gallery-section" aria-label="Editorial Wedding Moments Gallery">
      <div className="container-luxury">
        <header className="section-header reveal-fade-up" ref={headerRef}>
          <span id="gallery-subtitle" className="section-subtitle">{gallery.subtitle}</span>
          <h2 id="gallery-title" className="section-title">{gallery.title}</h2>
          <GoldDivider />
        </header>

        <div id="gallery-container" className="gallery-editorial-grid">
          {gallery.images.map((image, idx) => (
            <GalleryItem key={image.src} image={image} index={idx} images={gallery.images} />
          ))}
        </div>
      </div>
    </section>
  );
}
