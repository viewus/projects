/**
 * Wedding Entrance Gate — a quiet, minimal-luxury "tap to enter" reveal.
 * Replaces the old 3D carved-door spectacle (confetti, medallion, jiggling
 * button, spinning light rays) with a single calm full-screen panel: the
 * couple's names in fine serif type, a thin gold rule, and one button.
 * GSAP is used (when available) for a smooth cross-fade; it degrades to a
 * plain CSS transition otherwise. No canvas-confetti, no audio flourish.
 */

function EntranceGate({ musicApiRef, onOpened }) {
  const data = useWeddingData();
  const couple = data?.couple;
  const [opening, setOpening] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const wrapperRef = React.useRef(null);
  const openedRef = React.useRef(false);

  React.useEffect(() => {
    // Always start at the very top, and keep the page locked while the
    // entrance panel is showing.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.body.classList.add('lock-scroll');
  }, []);

  function openGate() {
    if (openedRef.current) return;
    openedRef.current = true;
    setOpening(true);

    if (musicApiRef && musicApiRef.current && typeof musicApiRef.current.startAutoplay === 'function') {
      musicApiRef.current.startAutoplay();
    }

    const node = wrapperRef.current;
    if (typeof gsap !== 'undefined' && node) {
      gsap.to(node, {
        opacity: 0,
        duration: 0.7,
        ease: 'power2.inOut',
        onComplete: finishOpen
      });
    } else if (node) {
      node.style.transition = 'opacity 0.6s ease';
      node.style.opacity = '0';
      setTimeout(finishOpen, 600);
    } else {
      finishOpen();
    }
  }

  function finishOpen() {
    setDismissed(true);
    document.body.classList.remove('lock-scroll');
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(
        '.hero-section .hero-portrait-card',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.15, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.hero-section .hero-center-connector',
        { opacity: 0 },
        { opacity: 1, duration: 0.8, delay: 0.15, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.hero-date-strip',
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.35, ease: 'power2.out' }
      );
    }

    if (onOpened) onOpened();
  }

  if (!couple) return null;

  function handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openGate();
    }
  }

  let wrapperClass = 'entry-gate';
  if (opening) wrapperClass += ' entry-gate-opening';
  if (dismissed) wrapperClass += ' entry-gate-dismissed';

  return (
    <aside
      id="entry-gate"
      className={wrapperClass}
      aria-label="Wedding Invitation Entrance"
      ref={wrapperRef}
      onKeyDown={handleKeydown}
    >
      <div className="entry-gate-inner">
        <span className="entry-gate-eyebrow">You Are Invited</span>
        <h1 className="entry-gate-names">
          {couple.bride?.shortName}
          <span className="entry-gate-amp">&amp;</span>
          {couple.groom?.shortName}
        </h1>
        <div className="entry-gate-rule" aria-hidden="true"></div>
        <p className="entry-gate-date">{couple.displayDate}</p>

        <button
          id="entry-gate-btn"
          className="entry-gate-btn"
          type="button"
          aria-label="Open Wedding Invitation"
          onClick={openGate}
        >
          Enter Invitation
        </button>
      </div>
    </aside>
  );
}
