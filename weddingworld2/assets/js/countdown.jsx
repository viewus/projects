/**
 * Live Countdown Section — counts down to the wedding muhurtham.
 */

function CountdownSection() {
  const data = useWeddingData();
  const couple = data?.couple;
  const headerRef = useReveal();
  const gridRef = useReveal();

  const [time, setTime] = React.useState({ days: 0, hours: 0, mins: 0, secs: 0, finished: false });

  React.useEffect(() => {
    if (!couple?.weddingDate) return undefined;

    const timeCleaned = couple.weddingTime ? couple.weddingTime.split(' ')[0] : '10:00';
    const targetTimestamp = new Date(`${couple.weddingDate}T${timeCleaned}:00`).getTime();

    function update() {
      const distance = targetTimestamp - Date.now();
      if (distance <= 0) {
        setTime((t) => (t.finished ? t : { days: 0, hours: 0, mins: 0, secs: 0, finished: true }));
        return;
      }
      setTime({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000),
        finished: false
      });
    }

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [couple?.weddingDate, couple?.weddingTime]);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <section id="countdown-section" className="countdown-section" aria-label="Wedding Countdown">
      <div className="container-luxury">
        <header className="section-header reveal-fade-up" ref={headerRef}>
          <span className="section-subtitle">Auspicious Muhurtham</span>
          <h2 className="section-title">Counting Down to Forever</h2>
          <GoldDivider />
        </header>

        {!time.finished ? (
          <div id="countdown-grid" className="countdown-grid reveal-zoom-in" ref={gridRef}>
            <div className="countdown-card">
              <div id="count-days" className="countdown-number">{pad(time.days)}</div>
              <div className="countdown-label">Days</div>
            </div>
            <div className="countdown-card">
              <div id="count-hours" className="countdown-number">{pad(time.hours)}</div>
              <div className="countdown-label">Hours</div>
            </div>
            <div className="countdown-card">
              <div id="count-mins" className="countdown-number">{pad(time.mins)}</div>
              <div className="countdown-label">Minutes</div>
            </div>
            <div className="countdown-card">
              <div id="count-secs" className="countdown-number">{pad(time.secs)}</div>
              <div className="countdown-label">Seconds</div>
            </div>
          </div>
        ) : (
          <div id="countdown-finished" className="countdown-finished-banner">
            <h3 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--gold-dim)', fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
              The Wedding Day Has Arrived
            </h3>
            <p>Let the joyous wedding celebrations and blessings begin!</p>
          </div>
        )}
      </div>
    </section>
  );
}
