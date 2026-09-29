/**
 * Venue & Destination Section
 */

function VenueSection() {
  const data = useWeddingData();
  const venue = data?.venue;
  const headerRef = useReveal();
  const cardRef = useReveal();
  const tiltRef = useTilt(4);

  if (!venue || !venue.enabled) return null;

  function combinedRef(el) {
    cardRef.current = el;
    tiltRef.current = el;
  }

  const mapsUrl = getGoogleMapsUrl(venue);

  return (
    <section id="venue-section" className="venue-section" aria-label="Wedding Venue & Directions">
      <div className="container-luxury">
        <header className="section-header reveal-fade-up" ref={headerRef}>
          <span className="section-subtitle" style={{ color: 'var(--gold-champagne)' }}>Celebration Destination</span>
          <h2 id="venue-title" className="section-title" style={{ color: 'var(--gold-bright)' }}>{venue.sectionTitle}</h2>
          <GoldDivider />
        </header>

        <div ref={combinedRef} className="venue-card-main reveal-zoom-in">
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <SafeImage
              src={venue.image}
              alt="The Wedding Venue"
              className="venue-hero-image"
              wrapperStyle={{ display: 'contents' }}
              loading="lazy"
            />
          </div>
          <div className="venue-details-body">
            <h3 id="venue-name" className="venue-name-title font-royal">{venue.name}</h3>
            <p id="venue-address" className="venue-address-text">{venue.address}</p>
            {venue.accommodations && (
              <p
                className="venue-accommodations-text"
                style={{ color: 'var(--gold-champagne)', fontSize: '0.95rem', marginBottom: '1.5rem' }}
              >
                {venue.accommodations}
              </p>
            )}
            <div className="venue-actions-group">
              <a id="venue-map-btn" href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-luxury">
                <i className="fa-solid fa-map-location-dot"></i>
                <span>View on Google Maps</span>
              </a>
              <a id="venue-directions-btn" href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-gold-outline">
                <i className="fa-solid fa-diamond-turn-right"></i>
                <span>Get Directions</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
