/**
 * Shared React utilities: context objects, hooks, and small reusable components.
 * Loaded first among the .jsx files — everything here is referenced by later scripts.
 * NOTE: React.createContext() results are `const`, which do NOT become implicit
 * globals in classic scripts, so we explicitly attach them to `window`.
 */

/* --------------------------------------------------------------------------
   Wedding Data Context — single source of truth passed down from App
   -------------------------------------------------------------------------- */
const WeddingDataContext = React.createContext(null);
window.WeddingDataContext = WeddingDataContext;

function useWeddingData() {
  const ctx = React.useContext(WeddingDataContext);
  if (!ctx) {
    console.error('useWeddingData() used outside <WeddingDataContext.Provider>.');
  }
  return ctx;
}

/* --------------------------------------------------------------------------
   Reduced Motion Preference Hook
   -------------------------------------------------------------------------- */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(() => {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  });

  React.useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handler = (e) => setReduced(e.matches);
      mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
      return () => {
        mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler);
      };
    } catch (e) {
      return undefined;
    }
  }, []);

  return reduced;
}

/* --------------------------------------------------------------------------
   Toast Notification Context & Provider
   -------------------------------------------------------------------------- */
const ToastContext = React.createContext(null);
window.ToastContext = ToastContext;

function useToast() {
  return React.useContext(ToastContext);
}

function ToastProvider({ children }) {
  const [message, setMessage] = React.useState('');
  const [visible, setVisible] = React.useState(false);
  const timerRef = React.useRef(null);

  const showToast = React.useCallback((msg) => {
    setMessage(msg);
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 3200);
  }, []);

  React.useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={`luxury-toast${visible ? ' show' : ''}`} role="status" aria-live="polite">
        {message}
      </div>
    </ToastContext.Provider>
  );
}

/* --------------------------------------------------------------------------
   Scroll Reveal Hook — mirrors the original IntersectionObserver behaviour
   -------------------------------------------------------------------------- */
function useReveal() {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (!('IntersectionObserver' in window)) {
      el.classList.add('revealed');
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/* --------------------------------------------------------------------------
   3D Tilt-on-Hover Hook — attach to any card-like element via ref
   -------------------------------------------------------------------------- */
function useTilt(maxDeg = 7) {
  const ref = React.useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return undefined;

    function handleMove(e) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -maxDeg;
      const rotateY = ((x - centerX) / centerX) * maxDeg;
      el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px) scale3d(1.015, 1.015, 1.015)`;
      el.style.transition = 'transform 0.1s ease-out';
    }

    function handleLeave() {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)';
      el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [maxDeg, reducedMotion]);

  return ref;
}

/* --------------------------------------------------------------------------
   Click-Outside Hook (used by the Add-to-Calendar dropdown)
   -------------------------------------------------------------------------- */
function useClickOutside(active, onOutside) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!active) return undefined;

    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onOutside();
      }
    }
    // Match original: attach slightly after mount so the opening click doesn't
    // immediately close the menu.
    const id = setTimeout(() => document.addEventListener('click', handleClick), 10);
    return () => {
      clearTimeout(id);
      document.removeEventListener('click', handleClick);
    };
  }, [active, onOutside]);

  return ref;
}

/* --------------------------------------------------------------------------
   SafeImage — graceful broken-image handling (hides gracefully via a class
   on the wrapper element, matching the original `.image-failed` pattern).
   -------------------------------------------------------------------------- */
function SafeImage({ src, alt, className, wrapperClassName, wrapperStyle, loading, children, imgRef }) {
  const wrapRef = React.useRef(null);

  function handleError() {
    if (wrapRef.current) wrapRef.current.classList.add('image-failed');
  }

  return (
    <div ref={wrapRef} className={wrapperClassName} style={wrapperStyle}>
      <img
        ref={imgRef}
        src={src}
        alt={alt || ''}
        className={className}
        loading={loading || 'lazy'}
        onError={handleError}
      />
      {children}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Reusable Gold Divider
   -------------------------------------------------------------------------- */
function GoldDivider() {
  return (
    <div className="gold-divider" aria-hidden="true">
      <span className="gold-divider-line"></span>
    </div>
  );
}
