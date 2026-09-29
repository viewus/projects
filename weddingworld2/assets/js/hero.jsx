/**
 * Hero Section — Royal Mandapam couple reveal (jharokha portrait frames).
 */

function PersonBio({ person }) {
  let bioText = person?.bio || '';
  if (person?.paternalLineage) bioText += `\n${person.paternalLineage}`;
  return <p className="hero-person-bio" style={{ whiteSpace: 'pre-line' }}>{bioText}</p>;
}

function HeroPortraitCard({ person, revealClass }) {
  const ref = useReveal();
  const tiltRef = useTilt(6);

  function combinedRef(el) {
    ref.current = el;
    tiltRef.current = el;
  }

  const salutation = person?.salutation ? `${person.salutation} ` : '';

  return (
    <article ref={combinedRef} className={`hero-portrait-card ${revealClass}`}>
      <div className="hero-portrait-frame jharokha-frame">
        <img src={person?.image} alt={person?.name || ''} loading="eager" onError={(e) => e.currentTarget.closest('.hero-portrait-frame').classList.add('image-failed')} />
        <div className="jharokha-corner corner-tl"></div>
        <div className="jharokha-corner corner-tr"></div>
        <div className="jharokha-corner corner-bl"></div>
        <div className="jharokha-corner corner-br"></div>
      </div>
      <div className="hero-portrait-caption">
        <span className="hero-person-role">{person?.role}</span>
        <h3 className="hero-person-name gold-foil-text">{salutation}{person?.name}</h3>
        <PersonBio person={person} />
      </div>
    </article>
  );
}

function HeroSection() {
  const data = useWeddingData();
  const couple = data?.couple;

  if (!couple) return null;

  return (
    <section id="hero-section" className="hero-section" aria-label="Bride and Groom Couple Reveal">
      <div className="container-luxury" style={{ textAlign: 'center' }}>
        <h2 id="hero-invitation-pretext" className="hero-invitation-pretext reveal-fade-up">{couple.invitationPretext}</h2>
        <p id="hero-invitation-quote" className="hero-invitation-quote reveal-fade-up delay-1">{couple.invitationText}</p>

        <div className="hero-couple-showcase">
          <HeroPortraitCard person={couple.bride} revealClass="reveal-fade-left delay-2" />

          <div className="hero-center-connector reveal-zoom-in delay-3">
            <span className="hero-ampersand">&amp;</span>
            <GoldDivider />
            <span className="hero-tagline-badge">Together Forever</span>
          </div>

          <HeroPortraitCard person={couple.groom} revealClass="reveal-fade-right delay-2" />
        </div>

        <div className="hero-date-strip reveal-fade-up delay-4">
          <div className="hero-date-item">
            <i className="fa-solid fa-calendar-days" style={{ color: 'var(--gold-rich)' }}></i>
            <span id="hero-display-date">{couple.displayDate}</span>
          </div>
          <span className="hero-date-separator">•</span>
          <div className="hero-date-item">
            <i className="fa-solid fa-clock" style={{ color: 'var(--gold-rich)' }}></i>
            <span id="hero-display-time">{couple.muhurthamTime ? `Muhurtham: ${couple.muhurthamTime}` : couple.weddingTime}</span>
          </div>
          <span className="hero-date-separator">•</span>
          <div className="hero-date-item">
            <i className="fa-solid fa-location-dot" style={{ color: 'var(--gold-rich)' }}></i>
            <span id="hero-display-venue">{couple.venueName}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
