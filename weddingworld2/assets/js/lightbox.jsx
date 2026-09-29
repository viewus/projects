/**
 * Premium Wedding Lightbox — cinematic full-screen image expander with
 * keyboard navigation (Escape/Arrow keys) and touch swipe support.
 * Exposed to the rest of the app via a Context so any component (gallery,
 * timeline) can call `open(images, startIndex)`.
 */

const LightboxContext = React.createContext(null);
window.LightboxContext = LightboxContext;

function useLightbox() {
  return React.useContext(LightboxContext);
}

function LightboxProvider({ children }) {
  const [state, setState] = React.useState({ open: false, images: [], index: 0 });

  const open = React.useCallback((images, startIndex = 0) => {
    setState({ open: true, images, index: startIndex });
    document.body.classList.add('lock-scroll');
  }, []);

  const close = React.useCallback(() => {
    setState((s) => ({ ...s, open: false }));
    document.body.classList.remove('lock-scroll');
  }, []);

  const showNext = React.useCallback(() => {
    setState((s) => (s.images.length <= 1 ? s : { ...s, index: (s.index + 1) % s.images.length }));
  }, []);

  const showPrev = React.useCallback(() => {
    setState((s) => (s.images.length <= 1 ? s : { ...s, index: (s.index - 1 + s.images.length) % s.images.length }));
  }, []);

  return (
    <LightboxContext.Provider value={{ open, close, showNext, showPrev }}>
      {children}
      <LightboxModal state={state} onClose={close} onNext={showNext} onPrev={showPrev} />
    </LightboxContext.Provider>
  );
}

function LightboxModal({ state, onClose, onNext, onPrev }) {
  const touchStartX = React.useRef(0);

  React.useEffect(() => {
    if (!state.open) return undefined;

    function handleKeydown(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    }
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [state.open, onClose, onNext, onPrev]);

  function handleTouchStart(e) {
    touchStartX.current = e.changedTouches[0].screenX;
  }

  function handleTouchEnd(e) {
    const touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 40;
    if (touchEndX < touchStartX.current - swipeThreshold) onNext();
    if (touchEndX > touchStartX.current + swipeThreshold) onPrev();
  }

  const item = state.images[state.index];
  const src = item ? item.src || item.image || item : '';
  const caption = item ? item.caption || item.title || '' : '';

  return (
    <div
      id="lightbox-modal"
      className={`lightbox-modal${state.open ? ' active' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Image Lightbox"
      onClick={(e) => {
        if (e.target.id === 'lightbox-modal') onClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {state.open && (
        <React.Fragment>
          <div className="lightbox-close-btn" onClick={onClose} title="Close Lightbox">&times;</div>
          <div
            className="lightbox-nav-btn lightbox-nav-prev"
            aria-label="Previous Image"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
          >
            &#10094;
          </div>
          <div
            className="lightbox-nav-btn lightbox-nav-next"
            aria-label="Next Image"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            &#10095;
          </div>
          <div className="lightbox-content-box">
            <img className="lightbox-main-img" src={src} alt="Wedding Photograph" />
            <div className="lightbox-caption-bar" style={{ display: caption ? 'block' : 'none' }}>
              {caption}
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}
