/**
 * Interactive Wedding Journey Timeline + "Don't Miss a Moment" quick calendar
 * hub. Both sections read from the same `weddingData.events` array, so the
 * event data is defined exactly once.
 */

function TimelineEventImage({ event, onOpen }) {
  const wrapRef = React.useRef(null);
  return (
    <div className="timeline-event-image-wrapper" ref={wrapRef} onClick={onOpen}>
      <img
        src={event.image}
        alt={event.title}
        loading="lazy"
        onError={() => wrapRef.current && wrapRef.current.classList.add('image-failed')}
      />
      <div className="timeline-image-zoom-badge">
        <i className="fa-solid fa-magnifying-glass-plus" style={{ fontSize: '0.75rem' }}></i>
        <span>View Photo</span>
      </div>
    </div>
  );
}

function TimelineCard({ event, index }) {
  const lightbox = useLightbox();
  const cardRef = useReveal();
  const tiltRef = useTilt(6);

  function combinedRef(el) {
    cardRef.current = el;
    tiltRef.current = el;
  }

  const revealClass = index % 2 === 0 ? 'reveal-fade-right' : 'reveal-fade-left';
  const iconClass = event.icon || 'fa-solid fa-om';

  return (
    <div className="timeline-event-row">
      <div className="timeline-node-pin">{String(index + 1).padStart(2, '0')}</div>

      <div ref={combinedRef} className={`timeline-card paper-card deckled-card ${revealClass}`}>
        {event.image && event.showImage !== false && (
          <TimelineEventImage event={event} onOpen={() => lightbox && lightbox.open([{ src: event.image, caption: `${event.title} — ${event.venue}` }])} />
        )}

        <div className="timeline-event-date-badge">
          <i className={iconClass} style={{ marginRight: '4px' }}></i>
          <span>{event.displayDate || event.date}</span>
        </div>

        <h3 className="timeline-event-title">{event.title}</h3>

        <div className="timeline-event-time-venue">
          <span>
            <i className="fa-solid fa-clock" style={{ color: 'var(--gold-deep)', marginRight: '6px', width: '14px' }}></i>
            {event.displayTime || `${event.startTime} - ${event.endTime}`}
          </span>
          <span>
            <i className="fa-solid fa-landmark-dome" style={{ color: 'var(--gold-deep)', marginRight: '6px', width: '14px' }}></i>
            {event.venue}{event.address ? ` — ${event.address}` : ''}
          </span>
        </div>

        <p className="timeline-event-desc">{event.description || ''}</p>

        <div className="timeline-actions-row">
          {event.calendar?.enabled !== false && event.showCalendar !== false && <CalendarMenu event={event} />}
          {event.map?.googleMapsUrl && event.showMap !== false && <MapButton place={event.map} label="View Location" />}
        </div>
      </div>
    </div>
  );
}

function TimelineSection() {
  const data = useWeddingData();
  const events = data?.events;
  const headerRef = useReveal();

  if (!events || !events.length) return null;

  return (
    <section id="timeline-section" className="timeline-section" aria-label="Wedding Ceremonies Timeline">
      <div className="container-luxury">
        <header className="section-header reveal-fade-up" ref={headerRef}>
          <span className="section-subtitle">Auspicious Celebrations</span>
          <h2 className="section-title">Our Wedding Journey</h2>
          <GoldDivider />
          <p className="section-desc">
            Join us as we perform the sacred Vedic ceremonies and celebrate every joyous milestone together.
          </p>
        </header>

        <div id="timeline-track" className="timeline-track-container">
          <div className="timeline-central-vine"></div>
          {events.map((ev, idx) => (
            <TimelineCard key={ev.id || idx} event={ev} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MomentCard({ event }) {
  const cardRef = useReveal();
  const tiltRef = useTilt(5);

  function combinedRef(el) {
    cardRef.current = el;
    tiltRef.current = el;
  }

  return (
    <div ref={combinedRef} className="moment-card reveal-zoom-in">
      <div>
        <div className="moment-date-tag">
          <i className={event.icon || 'fa-solid fa-om'} style={{ marginRight: '4px' }}></i> {event.displayDate || event.date}
        </div>
        <h4 className="moment-card-title">{event.title}</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--gold-deep)', fontWeight: 600, marginBottom: '4px' }}>
          <i className="fa-solid fa-clock" style={{ marginRight: '5px' }}></i>{event.displayTime || event.startTime}
        </p>
        <p className="moment-card-venue">
          <i className="fa-solid fa-landmark-dome" style={{ marginRight: '5px' }}></i>{event.venue}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', marginTop: '1rem' }}>
        <CalendarMenu event={event} />
        {event.map?.googleMapsUrl && event.showMap !== false && <MapButton place={event.map} label="Location" />}
      </div>
    </div>
  );
}

function MomentsSection() {
  const data = useWeddingData();
  const events = data?.events;
  const headerRef = useReveal();

  if (!events || !events.length) return null;

  return (
    <section id="moments-section" className="moments-section" aria-label="Quick Calendar Schedule">
      <div className="container-luxury">
        <header className="section-header reveal-fade-up" ref={headerRef}>
          <span className="section-subtitle">Save The Dates</span>
          <h2 className="section-title">Don't Miss a Moment</h2>
          <GoldDivider />
          <p className="section-desc">
            Save these beautiful ceremonies directly into your personal calendar so you can celebrate every moment with us.
          </p>
        </header>

        <div id="moments-grid" className="moments-cards-grid">
          {events.map((ev) => (
            <MomentCard key={ev.id} event={ev} />
          ))}
        </div>
      </div>
    </section>
  );
}
