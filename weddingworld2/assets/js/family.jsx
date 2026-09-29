/**
 * Family Blessings Section — bride & groom sides, each with a nested list
 * of {heading, members[]} sub-sections (parents / grandparents / relatives /
 * nieces & nephews) exactly as authored in data.js.
 */

function FamilySideSections({ sideData }) {
  if (!sideData) return null;

  if (sideData.sections && Array.isArray(sideData.sections)) {
    return sideData.sections.map((sec, idx) => (
      <div className="patrika-section-block" style={{ marginBottom: '1.4rem' }} key={idx}>
        <h4
          className="patrika-subheading font-royal"
          style={{
            color: 'var(--gold-deep)',
            fontSize: '1.05rem',
            marginBottom: '0.5rem',
            textAlign: 'center',
            borderBottom: '1px dashed rgba(212,175,55,0.3)',
            paddingBottom: '4px'
          }}
        >
          {sec.heading}
        </h4>
        <ul className="family-member-names">
          {sec.members.map((name, i) => (
            <li key={i}>{name}</li>
          ))}
        </ul>
      </div>
    ));
  }

  if (sideData.names && Array.isArray(sideData.names)) {
    return (
      <ul className="family-member-names">
        {sideData.names.map((name, i) => (
          <li key={i}>{name}</li>
        ))}
      </ul>
    );
  }

  return null;
}

function FamilySideCard({ sideData, revealClass }) {
  const ref = useReveal();
  const tiltRef = useTilt(5);

  function combinedRef(el) {
    ref.current = el;
    tiltRef.current = el;
  }

  return (
    <div ref={combinedRef} className={`family-card paper-card deckled-card ${revealClass}`}>
      <h3 className="family-side-title">{sideData?.title}</h3>
      <div id="family-list">
        <FamilySideSections sideData={sideData} />
      </div>
    </div>
  );
}

function FamilySection() {
  const data = useWeddingData();
  const family = data?.family;
  const headerRef = useReveal();

  if (!family || !family.enabled) return null;

  return (
    <section id="family-section" className="family-section" aria-label="Family Blessings">
      <div className="container-luxury">
        <header className="section-header reveal-fade-up" ref={headerRef}>
          <span id="family-subtitle" className="section-subtitle">{family.subtitle}</span>
          <h2 id="family-title" className="section-title">{family.title}</h2>
          <GoldDivider />
        </header>

        <div className="family-sides-grid">
          <FamilySideCard sideData={family.brideSide} revealClass="reveal-fade-left" />
          <FamilySideCard sideData={family.groomSide} revealClass="reveal-fade-right" />
        </div>
      </div>
    </section>
  );
}
