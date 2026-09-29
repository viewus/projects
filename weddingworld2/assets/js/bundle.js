
/* ===== utils.jsx ===== */
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
      const handler = e => setReduced(e.matches);
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
function ToastProvider({
  children
}) {
  const [message, setMessage] = React.useState('');
  const [visible, setVisible] = React.useState(false);
  const timerRef = React.useRef(null);
  const showToast = React.useCallback(msg => {
    setMessage(msg);
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 3200);
  }, []);
  React.useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);
  return /*#__PURE__*/React.createElement(ToastContext.Provider, {
    value: showToast
  }, children, /*#__PURE__*/React.createElement("div", {
    className: `luxury-toast${visible ? ' show' : ''}`,
    role: "status",
    "aria-live": "polite"
  }, message));
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
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });
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
      const rotateX = (y - centerY) / centerY * -maxDeg;
      const rotateY = (x - centerX) / centerX * maxDeg;
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
function SafeImage({
  src,
  alt,
  className,
  wrapperClassName,
  wrapperStyle,
  loading,
  children,
  imgRef
}) {
  const wrapRef = React.useRef(null);
  function handleError() {
    if (wrapRef.current) wrapRef.current.classList.add('image-failed');
  }
  return /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    className: wrapperClassName,
    style: wrapperStyle
  }, /*#__PURE__*/React.createElement("img", {
    ref: imgRef,
    src: src,
    alt: alt || '',
    className: className,
    loading: loading || 'lazy',
    onError: handleError
  }), children);
}

/* --------------------------------------------------------------------------
   Reusable Gold Divider
   -------------------------------------------------------------------------- */
function GoldDivider() {
  return /*#__PURE__*/React.createElement("div", {
    className: "gold-divider",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gold-divider-line"
  }));
}

/* ===== particles.jsx ===== */
/**
 * Ambient Specks — a handful of soft, slow-drifting gold flecks on a
 * full-screen canvas. This intentionally replaces the old rose-petal /
 * gold-dust / cursor-sparkle particle engine: minimal luxury calls for a
 * few quiet flecks, not a continuous animation engine with mouse trails.
 * `prefers-reduced-motion` renders a single static frame instead of a loop.
 */

class AmbientSpeckField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', {
      alpha: true
    });
    this.width = 0;
    this.height = 0;
    this.specks = [];
    this.isRunning = false;
    this.count = window.innerWidth <= 768 ? 8 : 14;
    this._raf = null;
    this.handleResize = this.handleResize.bind(this);
    this.handleResize();
    window.addEventListener('resize', this.handleResize, {
      passive: true
    });
    for (let i = 0; i < this.count; i++) this.specks.push(this.createSpeck(true));
  }
  destroy() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
  }
  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.count = this.width <= 768 ? 8 : 14;
  }
  createSpeck(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 10,
      radius: Math.random() * 1.4 + 0.6,
      alpha: Math.random() * 0.25 + 0.08,
      speedY: Math.random() * 0.18 + 0.06,
      driftPhase: Math.random() * Math.PI * 2,
      driftSpeed: Math.random() * 0.006 + 0.002
    };
  }
  update() {
    for (let i = 0; i < this.specks.length; i++) {
      const s = this.specks[i];
      s.y -= s.speedY;
      s.driftPhase += s.driftSpeed;
      s.x += Math.sin(s.driftPhase) * 0.15;
      if (s.y < -10) {
        this.specks[i] = this.createSpeck(false);
      }
    }
  }
  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let i = 0; i < this.specks.length; i++) {
      const s = this.specks[i];
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(173, 138, 84, ${s.alpha})`;
      this.ctx.fill();
    }
  }
  loop() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    this._raf = requestAnimationFrame(() => this.loop());
  }
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();
  }
  stop() {
    this.isRunning = false;
    if (this._raf) cancelAnimationFrame(this._raf);
  }
}
const PetalsCanvas = React.forwardRef(function PetalsCanvas(props, ref) {
  const canvasRef = React.useRef(null);
  const engineRef = React.useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  React.useEffect(() => {
    if (!canvasRef.current) return undefined;
    const engine = new AmbientSpeckField(canvasRef.current);
    engineRef.current = engine;
    if (reducedMotion) {
      engine.draw();
    } else {
      engine.start();
    }
    return () => engine.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kept for API compatibility — the minimal ambient field has no burst effect.
  React.useImperativeHandle(ref, () => ({
    burst() {}
  }));
  return /*#__PURE__*/React.createElement("canvas", {
    id: "ambient-specks-canvas",
    ref: canvasRef,
    "aria-hidden": "true"
  });
});

/* ===== calendar.jsx ===== */
/**
 * Wedding Calendar Engine — Google / Outlook deep links + .ics download,
 * plus a <CalendarMenu> dropdown component used by the timeline and the
 * "Don't Miss a Moment" cards.
 */

function formatDateTimeForICS(dateStr, timeStr) {
  const cleanedDate = dateStr.replace(/-/g, '');
  const cleanedTime = (timeStr || '10:00').replace(/:/g, '') + '00';
  return `${cleanedDate}T${cleanedTime}`;
}
function formatDateTimeForGoogle(dateStr, timeStr) {
  const cleanedDate = dateStr.replace(/-/g, '');
  const cleanedTime = (timeStr || '10:00').replace(/:/g, '') + '00';
  return `${cleanedDate}T${cleanedTime}`;
}
function generateGoogleCalendarUrl(event) {
  const startDT = formatDateTimeForGoogle(event.date, event.startTime);
  const endDT = formatDateTimeForGoogle(event.date, event.endTime || event.startTime);
  const title = encodeURIComponent(event.calendar?.title || event.title);
  const details = encodeURIComponent((event.calendar?.description || event.description || '') + '\n\nRSVP & Details: ' + window.location.href);
  const location = encodeURIComponent(event.calendar?.location || event.venue + ', ' + event.address);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDT}/${endDT}&details=${details}&location=${location}`;
}
function generateOutlookCalendarUrl(event) {
  const startDT = `${event.date}T${event.startTime || '10:00'}:00`;
  const endDT = `${event.date}T${event.endTime || event.startTime || '12:00'}:00`;
  const title = encodeURIComponent(event.calendar?.title || event.title);
  const details = encodeURIComponent(event.calendar?.description || event.description || '');
  const location = encodeURIComponent(event.calendar?.location || event.venue + ', ' + event.address);
  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${details}&location=${location}&startdt=${startDT}&enddt=${endDT}`;
}
function downloadICSFile(event) {
  const startDT = formatDateTimeForICS(event.date, event.startTime);
  const endDT = formatDateTimeForICS(event.date, event.endTime || event.startTime);
  const summary = event.calendar?.title || event.title;
  const description = (event.calendar?.description || event.description || '') + '\\n\\n' + window.location.href;
  const location = event.calendar?.location || event.venue + ', ' + event.address;
  const icsData = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Royal Wedding Invitation//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT', `UID:wedding-${event.id || Date.now()}@weddinginvitation.com`, `DTSTAMP:${formatDateTimeForICS(new Date().toISOString().split('T')[0], '00:00')}Z`, `DTSTART:${startDT}`, `DTEND:${endDT}`, `SUMMARY:${summary}`, `DESCRIPTION:${description}`, `LOCATION:${location}`, 'STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const blob = new Blob([icsData], {
    type: 'text/calendar;charset=utf-8'
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${(event.shortTitle || event.title).toLowerCase().replace(/\s+/g, '-')}-wedding-event.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Dropdown menu offering Google / Apple(.ics) / Outlook options for a single
 * ceremony event. Rendered inline next to its trigger button; positions
 * itself via CSS (`position:absolute; top:100%`) relative to a
 * `position:relative` wrapper, matching the original vanilla behaviour.
 */
function CalendarMenu({
  event
}) {
  const [open, setOpen] = React.useState(false);
  const menuRef = useClickOutside(open, () => setOpen(false));
  function handleSelect(action) {
    action();
    setOpen(false);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "calendar-btn-holder",
    style: {
      display: 'inline-block',
      position: 'relative'
    },
    ref: menuRef
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-luxury timeline-cal-btn",
    type: "button",
    onClick: e => {
      e.stopPropagation();
      setOpen(o => !o);
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-calendar-plus",
    style: {
      marginRight: '6px'
    }
  }), /*#__PURE__*/React.createElement("span", null, "Add to Calendar")), open && /*#__PURE__*/React.createElement("div", {
    className: "calendar-popup-menu",
    style: {
      position: 'absolute',
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%) translateY(8px)',
      background: 'var(--paper)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--radius-md)',
      padding: '8px',
      boxShadow: 'var(--shadow-3)',
      zIndex: 200,
      minWidth: '200px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement(CalendarMenuItem, {
    onClick: () => handleSelect(() => window.open(generateGoogleCalendarUrl(event), '_blank', 'noopener,noreferrer'))
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-brands fa-google",
    style: {
      color: 'var(--gold-dim)',
      marginRight: '8px',
      width: '16px'
    }
  }), "Google Calendar"), /*#__PURE__*/React.createElement(CalendarMenuItem, {
    onClick: () => handleSelect(() => downloadICSFile(event))
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-brands fa-apple",
    style: {
      color: 'var(--gold-dim)',
      marginRight: '8px',
      width: '16px'
    }
  }), "Apple / iCal (.ICS)"), /*#__PURE__*/React.createElement(CalendarMenuItem, {
    onClick: () => handleSelect(() => window.open(generateOutlookCalendarUrl(event), '_blank', 'noopener,noreferrer'))
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-brands fa-microsoft",
    style: {
      color: 'var(--gold-dim)',
      marginRight: '8px',
      width: '16px'
    }
  }), "Outlook Calendar")));
}
function CalendarMenuItem({
  children,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      padding: '9px 14px',
      color: hover ? 'var(--ivory)' : 'var(--ink)',
      background: hover ? 'var(--ink)' : 'transparent',
      fontFamily: 'var(--font-body)',
      fontWeight: 400,
      fontSize: '0.85rem',
      textAlign: 'left',
      borderRadius: 'var(--radius-sm)',
      transition: 'all 0.2s',
      width: '100%',
      display: 'flex',
      alignItems: 'center'
    }
  }, children);
}

/* ===== maps.jsx ===== */
/**
 * Wedding Venue & Maps Helpers
 */

function getGoogleMapsUrl(place) {
  if (!place) return '#';
  if (place.googleMapsUrl) return place.googleMapsUrl;
  if (place.latitude && place.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
  }
  return '#';
}

/** Small "Find the Venue" / "View Location" link used in timeline & moments cards. */
function MapButton({
  place,
  label
}) {
  const url = getGoogleMapsUrl(place);
  return /*#__PURE__*/React.createElement("a", {
    href: url,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "btn-gold-outline"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-location-dot",
    style: {
      marginRight: '6px'
    }
  }), /*#__PURE__*/React.createElement("span", null, label || 'View Location'));
}

/* ===== lightbox.jsx ===== */
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
function LightboxProvider({
  children
}) {
  const [state, setState] = React.useState({
    open: false,
    images: [],
    index: 0
  });
  const open = React.useCallback((images, startIndex = 0) => {
    setState({
      open: true,
      images,
      index: startIndex
    });
    document.body.classList.add('lock-scroll');
  }, []);
  const close = React.useCallback(() => {
    setState(s => ({
      ...s,
      open: false
    }));
    document.body.classList.remove('lock-scroll');
  }, []);
  const showNext = React.useCallback(() => {
    setState(s => s.images.length <= 1 ? s : {
      ...s,
      index: (s.index + 1) % s.images.length
    });
  }, []);
  const showPrev = React.useCallback(() => {
    setState(s => s.images.length <= 1 ? s : {
      ...s,
      index: (s.index - 1 + s.images.length) % s.images.length
    });
  }, []);
  return /*#__PURE__*/React.createElement(LightboxContext.Provider, {
    value: {
      open,
      close,
      showNext,
      showPrev
    }
  }, children, /*#__PURE__*/React.createElement(LightboxModal, {
    state: state,
    onClose: close,
    onNext: showNext,
    onPrev: showPrev
  }));
}
function LightboxModal({
  state,
  onClose,
  onNext,
  onPrev
}) {
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
  return /*#__PURE__*/React.createElement("div", {
    id: "lightbox-modal",
    className: `lightbox-modal${state.open ? ' active' : ''}`,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Image Lightbox",
    onClick: e => {
      if (e.target.id === 'lightbox-modal') onClose();
    },
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  }, state.open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "lightbox-close-btn",
    onClick: onClose,
    title: "Close Lightbox"
  }, "×"), /*#__PURE__*/React.createElement("div", {
    className: "lightbox-nav-btn lightbox-nav-prev",
    "aria-label": "Previous Image",
    onClick: e => {
      e.stopPropagation();
      onPrev();
    }
  }, "❮"), /*#__PURE__*/React.createElement("div", {
    className: "lightbox-nav-btn lightbox-nav-next",
    "aria-label": "Next Image",
    onClick: e => {
      e.stopPropagation();
      onNext();
    }
  }, "❯"), /*#__PURE__*/React.createElement("div", {
    className: "lightbox-content-box"
  }, /*#__PURE__*/React.createElement("img", {
    className: "lightbox-main-img",
    src: src,
    alt: "Wedding Photograph"
  }), /*#__PURE__*/React.createElement("div", {
    className: "lightbox-caption-bar",
    style: {
      display: caption ? 'block' : 'none'
    }
  }, caption))));
}

/* ===== gallery.jsx ===== */
/**
 * Editorial Wedding Gallery Section
 */

function GalleryItem({
  image,
  index,
  images
}) {
  const lightbox = useLightbox();
  const reveal = useReveal();
  const tilt = useTilt(5);
  function combinedRef(el) {
    reveal.current = el;
    tilt.current = el;
  }
  return /*#__PURE__*/React.createElement("div", {
    ref: combinedRef,
    className: "gallery-item reveal-zoom-in gallery-card-frame",
    onClick: () => lightbox && lightbox.open(images, index)
  }, /*#__PURE__*/React.createElement(SafeImage, {
    src: image.src,
    alt: image.caption || `Wedding Memory ${index + 1}`,
    wrapperClassName: "gallery-img-box"
  }), image.caption && /*#__PURE__*/React.createElement("div", {
    className: "gallery-caption"
  }, image.caption));
}
function GallerySection() {
  const data = useWeddingData();
  const gallery = data?.gallery;
  const headerRef = useReveal();
  if (!gallery || !gallery.enabled || !gallery.images || !gallery.images.length) {
    return null;
  }
  return /*#__PURE__*/React.createElement("section", {
    id: "gallery-section",
    className: "gallery-section",
    "aria-label": "Editorial Wedding Moments Gallery"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-luxury"
  }, /*#__PURE__*/React.createElement("header", {
    className: "section-header reveal-fade-up",
    ref: headerRef
  }, /*#__PURE__*/React.createElement("span", {
    id: "gallery-subtitle",
    className: "section-subtitle"
  }, gallery.subtitle), /*#__PURE__*/React.createElement("h2", {
    id: "gallery-title",
    className: "section-title"
  }, gallery.title), /*#__PURE__*/React.createElement(GoldDivider, null)), /*#__PURE__*/React.createElement("div", {
    id: "gallery-container",
    className: "gallery-editorial-grid"
  }, gallery.images.map((image, idx) => /*#__PURE__*/React.createElement(GalleryItem, {
    key: image.src,
    image: image,
    index: idx,
    images: gallery.images
  })))));
}

/* ===== timeline.jsx ===== */
/**
 * Interactive Wedding Journey Timeline + "Don't Miss a Moment" quick calendar
 * hub. Both sections read from the same `weddingData.events` array, so the
 * event data is defined exactly once.
 */

function TimelineEventImage({
  event,
  onOpen
}) {
  const wrapRef = React.useRef(null);
  return /*#__PURE__*/React.createElement("div", {
    className: "timeline-event-image-wrapper",
    ref: wrapRef,
    onClick: onOpen
  }, /*#__PURE__*/React.createElement("img", {
    src: event.image,
    alt: event.title,
    loading: "lazy",
    onError: () => wrapRef.current && wrapRef.current.classList.add('image-failed')
  }), /*#__PURE__*/React.createElement("div", {
    className: "timeline-image-zoom-badge"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-magnifying-glass-plus",
    style: {
      fontSize: '0.75rem'
    }
  }), /*#__PURE__*/React.createElement("span", null, "View Photo")));
}
function TimelineCard({
  event,
  index
}) {
  const lightbox = useLightbox();
  const cardRef = useReveal();
  const tiltRef = useTilt(6);
  function combinedRef(el) {
    cardRef.current = el;
    tiltRef.current = el;
  }
  const revealClass = index % 2 === 0 ? 'reveal-fade-right' : 'reveal-fade-left';
  const iconClass = event.icon || 'fa-solid fa-om';
  return /*#__PURE__*/React.createElement("div", {
    className: "timeline-event-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "timeline-node-pin"
  }, String(index + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("div", {
    ref: combinedRef,
    className: `timeline-card paper-card deckled-card ${revealClass}`
  }, event.image && event.showImage !== false && /*#__PURE__*/React.createElement(TimelineEventImage, {
    event: event,
    onOpen: () => lightbox && lightbox.open([{
      src: event.image,
      caption: `${event.title} — ${event.venue}`
    }])
  }), /*#__PURE__*/React.createElement("div", {
    className: "timeline-event-date-badge"
  }, /*#__PURE__*/React.createElement("i", {
    className: iconClass,
    style: {
      marginRight: '4px'
    }
  }), /*#__PURE__*/React.createElement("span", null, event.displayDate || event.date)), /*#__PURE__*/React.createElement("h3", {
    className: "timeline-event-title"
  }, event.title), /*#__PURE__*/React.createElement("div", {
    className: "timeline-event-time-venue"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-clock",
    style: {
      color: 'var(--gold-deep)',
      marginRight: '6px',
      width: '14px'
    }
  }), event.displayTime || `${event.startTime} - ${event.endTime}`), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-landmark-dome",
    style: {
      color: 'var(--gold-deep)',
      marginRight: '6px',
      width: '14px'
    }
  }), event.venue, event.address ? ` — ${event.address}` : '')), /*#__PURE__*/React.createElement("p", {
    className: "timeline-event-desc"
  }, event.description || ''), /*#__PURE__*/React.createElement("div", {
    className: "timeline-actions-row"
  }, event.calendar?.enabled !== false && event.showCalendar !== false && /*#__PURE__*/React.createElement(CalendarMenu, {
    event: event
  }), event.map?.googleMapsUrl && event.showMap !== false && /*#__PURE__*/React.createElement(MapButton, {
    place: event.map,
    label: "View Location"
  }))));
}
function TimelineSection() {
  const data = useWeddingData();
  const events = data?.events;
  const headerRef = useReveal();
  if (!events || !events.length) return null;
  return /*#__PURE__*/React.createElement("section", {
    id: "timeline-section",
    className: "timeline-section",
    "aria-label": "Wedding Ceremonies Timeline"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-luxury"
  }, /*#__PURE__*/React.createElement("header", {
    className: "section-header reveal-fade-up",
    ref: headerRef
  }, /*#__PURE__*/React.createElement("span", {
    className: "section-subtitle"
  }, "Auspicious Celebrations"), /*#__PURE__*/React.createElement("h2", {
    className: "section-title"
  }, "Our Wedding Journey"), /*#__PURE__*/React.createElement(GoldDivider, null), /*#__PURE__*/React.createElement("p", {
    className: "section-desc"
  }, "Join us as we perform the sacred Vedic ceremonies and celebrate every joyous milestone together.")), /*#__PURE__*/React.createElement("div", {
    id: "timeline-track",
    className: "timeline-track-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "timeline-central-vine"
  }), events.map((ev, idx) => /*#__PURE__*/React.createElement(TimelineCard, {
    key: ev.id || idx,
    event: ev,
    index: idx
  })))));
}
function MomentCard({
  event
}) {
  const cardRef = useReveal();
  const tiltRef = useTilt(5);
  function combinedRef(el) {
    cardRef.current = el;
    tiltRef.current = el;
  }
  return /*#__PURE__*/React.createElement("div", {
    ref: combinedRef,
    className: "moment-card reveal-zoom-in"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "moment-date-tag"
  }, /*#__PURE__*/React.createElement("i", {
    className: event.icon || 'fa-solid fa-om',
    style: {
      marginRight: '4px'
    }
  }), " ", event.displayDate || event.date), /*#__PURE__*/React.createElement("h4", {
    className: "moment-card-title"
  }, event.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '0.85rem',
      color: 'var(--gold-deep)',
      fontWeight: 600,
      marginBottom: '4px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-clock",
    style: {
      marginRight: '5px'
    }
  }), event.displayTime || event.startTime), /*#__PURE__*/React.createElement("p", {
    className: "moment-card-venue"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-landmark-dome",
    style: {
      marginRight: '5px'
    }
  }), event.venue)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'center',
      marginTop: '1rem'
    }
  }, /*#__PURE__*/React.createElement(CalendarMenu, {
    event: event
  }), event.map?.googleMapsUrl && event.showMap !== false && /*#__PURE__*/React.createElement(MapButton, {
    place: event.map,
    label: "Location"
  })));
}
function MomentsSection() {
  const data = useWeddingData();
  const events = data?.events;
  const headerRef = useReveal();
  if (!events || !events.length) return null;
  return /*#__PURE__*/React.createElement("section", {
    id: "moments-section",
    className: "moments-section",
    "aria-label": "Quick Calendar Schedule"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-luxury"
  }, /*#__PURE__*/React.createElement("header", {
    className: "section-header reveal-fade-up",
    ref: headerRef
  }, /*#__PURE__*/React.createElement("span", {
    className: "section-subtitle"
  }, "Save The Dates"), /*#__PURE__*/React.createElement("h2", {
    className: "section-title"
  }, "Don't Miss a Moment"), /*#__PURE__*/React.createElement(GoldDivider, null), /*#__PURE__*/React.createElement("p", {
    className: "section-desc"
  }, "Save these beautiful ceremonies directly into your personal calendar so you can celebrate every moment with us.")), /*#__PURE__*/React.createElement("div", {
    id: "moments-grid",
    className: "moments-cards-grid"
  }, events.map(ev => /*#__PURE__*/React.createElement(MomentCard, {
    key: ev.id,
    event: ev
  })))));
}

/* ===== family.jsx ===== */
/**
 * Family Blessings Section — bride & groom sides, each with a nested list
 * of {heading, members[]} sub-sections (parents / grandparents / relatives /
 * nieces & nephews) exactly as authored in data.js.
 */

function FamilySideSections({
  sideData
}) {
  if (!sideData) return null;
  if (sideData.sections && Array.isArray(sideData.sections)) {
    return sideData.sections.map((sec, idx) => /*#__PURE__*/React.createElement("div", {
      className: "patrika-section-block",
      style: {
        marginBottom: '1.4rem'
      },
      key: idx
    }, /*#__PURE__*/React.createElement("h4", {
      className: "patrika-subheading font-royal",
      style: {
        color: 'var(--gold-deep)',
        fontSize: '1.05rem',
        marginBottom: '0.5rem',
        textAlign: 'center',
        borderBottom: '1px dashed rgba(212,175,55,0.3)',
        paddingBottom: '4px'
      }
    }, sec.heading), /*#__PURE__*/React.createElement("ul", {
      className: "family-member-names"
    }, sec.members.map((name, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, name)))));
  }
  if (sideData.names && Array.isArray(sideData.names)) {
    return /*#__PURE__*/React.createElement("ul", {
      className: "family-member-names"
    }, sideData.names.map((name, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, name)));
  }
  return null;
}
function FamilySideCard({
  sideData,
  revealClass
}) {
  const ref = useReveal();
  const tiltRef = useTilt(5);
  function combinedRef(el) {
    ref.current = el;
    tiltRef.current = el;
  }
  return /*#__PURE__*/React.createElement("div", {
    ref: combinedRef,
    className: `family-card paper-card deckled-card ${revealClass}`
  }, /*#__PURE__*/React.createElement("h3", {
    className: "family-side-title"
  }, sideData?.title), /*#__PURE__*/React.createElement("div", {
    id: "family-list"
  }, /*#__PURE__*/React.createElement(FamilySideSections, {
    sideData: sideData
  })));
}
function FamilySection() {
  const data = useWeddingData();
  const family = data?.family;
  const headerRef = useReveal();
  if (!family || !family.enabled) return null;
  return /*#__PURE__*/React.createElement("section", {
    id: "family-section",
    className: "family-section",
    "aria-label": "Family Blessings"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-luxury"
  }, /*#__PURE__*/React.createElement("header", {
    className: "section-header reveal-fade-up",
    ref: headerRef
  }, /*#__PURE__*/React.createElement("span", {
    id: "family-subtitle",
    className: "section-subtitle"
  }, family.subtitle), /*#__PURE__*/React.createElement("h2", {
    id: "family-title",
    className: "section-title"
  }, family.title), /*#__PURE__*/React.createElement(GoldDivider, null)), /*#__PURE__*/React.createElement("div", {
    className: "family-sides-grid"
  }, /*#__PURE__*/React.createElement(FamilySideCard, {
    sideData: family.brideSide,
    revealClass: "reveal-fade-left"
  }), /*#__PURE__*/React.createElement(FamilySideCard, {
    sideData: family.groomSide,
    revealClass: "reveal-fade-right"
  }))));
}

/* ===== venue.jsx ===== */
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
  return /*#__PURE__*/React.createElement("section", {
    id: "venue-section",
    className: "venue-section",
    "aria-label": "Wedding Venue & Directions"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-luxury"
  }, /*#__PURE__*/React.createElement("header", {
    className: "section-header reveal-fade-up",
    ref: headerRef
  }, /*#__PURE__*/React.createElement("span", {
    className: "section-subtitle",
    style: {
      color: 'var(--gold-champagne)'
    }
  }, "Celebration Destination"), /*#__PURE__*/React.createElement("h2", {
    id: "venue-title",
    className: "section-title",
    style: {
      color: 'var(--gold-bright)'
    }
  }, venue.sectionTitle), /*#__PURE__*/React.createElement(GoldDivider, null)), /*#__PURE__*/React.createElement("div", {
    ref: combinedRef,
    className: "venue-card-main reveal-zoom-in"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(SafeImage, {
    src: venue.image,
    alt: "The Wedding Venue",
    className: "venue-hero-image",
    wrapperStyle: {
      display: 'contents'
    },
    loading: "lazy"
  })), /*#__PURE__*/React.createElement("div", {
    className: "venue-details-body"
  }, /*#__PURE__*/React.createElement("h3", {
    id: "venue-name",
    className: "venue-name-title font-royal"
  }, venue.name), /*#__PURE__*/React.createElement("p", {
    id: "venue-address",
    className: "venue-address-text"
  }, venue.address), venue.accommodations && /*#__PURE__*/React.createElement("p", {
    className: "venue-accommodations-text",
    style: {
      color: 'var(--gold-champagne)',
      fontSize: '0.95rem',
      marginBottom: '1.5rem'
    }
  }, venue.accommodations), /*#__PURE__*/React.createElement("div", {
    className: "venue-actions-group"
  }, /*#__PURE__*/React.createElement("a", {
    id: "venue-map-btn",
    href: mapsUrl,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "btn-luxury"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-map-location-dot"
  }), /*#__PURE__*/React.createElement("span", null, "View on Google Maps")), /*#__PURE__*/React.createElement("a", {
    id: "venue-directions-btn",
    href: mapsUrl,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "btn-gold-outline"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-diamond-turn-right"
  }), /*#__PURE__*/React.createElement("span", null, "Get Directions")))))));
}

/* ===== story.jsx ===== */
/**
 * "Our Story" Scrapbook Section — milestone timeline of the couple's journey.
 */

function StoryItem({
  milestone
}) {
  const ref = useReveal();
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: "story-item reveal-fade-up"
  }, /*#__PURE__*/React.createElement("div", {
    className: "story-polaroid"
  }, /*#__PURE__*/React.createElement("img", {
    src: milestone.image,
    alt: milestone.title,
    loading: "lazy",
    onError: e => e.currentTarget.closest('.story-polaroid').classList.add('image-failed')
  })), /*#__PURE__*/React.createElement("div", {
    className: "story-content"
  }, /*#__PURE__*/React.createElement("span", {
    className: "story-year-badge"
  }, milestone.year), /*#__PURE__*/React.createElement("h3", {
    className: "story-milestone-title"
  }, milestone.title), /*#__PURE__*/React.createElement("p", null, milestone.description)));
}
function StorySection() {
  const data = useWeddingData();
  const story = data?.story;
  const headerRef = useReveal();
  if (!story || !story.enabled) return null;
  return /*#__PURE__*/React.createElement("section", {
    id: "story-section",
    className: "story-section",
    "aria-label": "Our Story and Milestones"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-luxury"
  }, /*#__PURE__*/React.createElement("header", {
    className: "section-header reveal-fade-up",
    ref: headerRef
  }, /*#__PURE__*/React.createElement("span", {
    id: "story-subtitle",
    className: "section-subtitle"
  }, story.subtitle), /*#__PURE__*/React.createElement("h2", {
    id: "story-title",
    className: "section-title"
  }, story.title), /*#__PURE__*/React.createElement(GoldDivider, null), /*#__PURE__*/React.createElement("p", {
    id: "story-intro",
    className: "section-desc"
  }, story.introduction)), /*#__PURE__*/React.createElement("div", {
    id: "story-container",
    className: "story-grid"
  }, story.milestones && story.milestones.map((m, idx) => /*#__PURE__*/React.createElement(StoryItem, {
    key: idx,
    milestone: m
  })))));
}

/* ===== countdown.jsx ===== */
/**
 * Live Countdown Section — counts down to the wedding muhurtham.
 */

function CountdownSection() {
  const data = useWeddingData();
  const couple = data?.couple;
  const headerRef = useReveal();
  const gridRef = useReveal();
  const [time, setTime] = React.useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
    finished: false
  });
  React.useEffect(() => {
    if (!couple?.weddingDate) return undefined;
    const timeCleaned = couple.weddingTime ? couple.weddingTime.split(' ')[0] : '10:00';
    const targetTimestamp = new Date(`${couple.weddingDate}T${timeCleaned}:00`).getTime();
    function update() {
      const distance = targetTimestamp - Date.now();
      if (distance <= 0) {
        setTime(t => t.finished ? t : {
          days: 0,
          hours: 0,
          mins: 0,
          secs: 0,
          finished: true
        });
        return;
      }
      setTime({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(distance % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)),
        mins: Math.floor(distance % (1000 * 60 * 60) / (1000 * 60)),
        secs: Math.floor(distance % (1000 * 60) / 1000),
        finished: false
      });
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [couple?.weddingDate, couple?.weddingTime]);
  const pad = n => String(n).padStart(2, '0');
  return /*#__PURE__*/React.createElement("section", {
    id: "countdown-section",
    className: "countdown-section",
    "aria-label": "Wedding Countdown"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-luxury"
  }, /*#__PURE__*/React.createElement("header", {
    className: "section-header reveal-fade-up",
    ref: headerRef
  }, /*#__PURE__*/React.createElement("span", {
    className: "section-subtitle"
  }, "Auspicious Muhurtham"), /*#__PURE__*/React.createElement("h2", {
    className: "section-title"
  }, "Counting Down to Forever"), /*#__PURE__*/React.createElement(GoldDivider, null)), !time.finished ? /*#__PURE__*/React.createElement("div", {
    id: "countdown-grid",
    className: "countdown-grid reveal-zoom-in",
    ref: gridRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "countdown-card"
  }, /*#__PURE__*/React.createElement("div", {
    id: "count-days",
    className: "countdown-number"
  }, pad(time.days)), /*#__PURE__*/React.createElement("div", {
    className: "countdown-label"
  }, "Days")), /*#__PURE__*/React.createElement("div", {
    className: "countdown-card"
  }, /*#__PURE__*/React.createElement("div", {
    id: "count-hours",
    className: "countdown-number"
  }, pad(time.hours)), /*#__PURE__*/React.createElement("div", {
    className: "countdown-label"
  }, "Hours")), /*#__PURE__*/React.createElement("div", {
    className: "countdown-card"
  }, /*#__PURE__*/React.createElement("div", {
    id: "count-mins",
    className: "countdown-number"
  }, pad(time.mins)), /*#__PURE__*/React.createElement("div", {
    className: "countdown-label"
  }, "Minutes")), /*#__PURE__*/React.createElement("div", {
    className: "countdown-card"
  }, /*#__PURE__*/React.createElement("div", {
    id: "count-secs",
    className: "countdown-number"
  }, pad(time.secs)), /*#__PURE__*/React.createElement("div", {
    className: "countdown-label"
  }, "Seconds"))) : /*#__PURE__*/React.createElement("div", {
    id: "countdown-finished",
    className: "countdown-finished-banner"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '1.6rem',
      marginBottom: '0.5rem',
      color: 'var(--gold-dim)',
      fontFamily: 'var(--font-heading)',
      fontWeight: 500
    }
  }, "The Wedding Day Has Arrived"), /*#__PURE__*/React.createElement("p", null, "Let the joyous wedding celebrations and blessings begin!"))));
}

/* ===== hero.jsx ===== */
/**
 * Hero Section — Royal Mandapam couple reveal (jharokha portrait frames).
 */

function PersonBio({
  person
}) {
  let bioText = person?.bio || '';
  if (person?.paternalLineage) bioText += `\n${person.paternalLineage}`;
  return /*#__PURE__*/React.createElement("p", {
    className: "hero-person-bio",
    style: {
      whiteSpace: 'pre-line'
    }
  }, bioText);
}
function HeroPortraitCard({
  person,
  revealClass
}) {
  const ref = useReveal();
  const tiltRef = useTilt(6);
  function combinedRef(el) {
    ref.current = el;
    tiltRef.current = el;
  }
  const salutation = person?.salutation ? `${person.salutation} ` : '';
  return /*#__PURE__*/React.createElement("article", {
    ref: combinedRef,
    className: `hero-portrait-card ${revealClass}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-portrait-frame jharokha-frame"
  }, /*#__PURE__*/React.createElement("img", {
    src: person?.image,
    alt: person?.name || '',
    loading: "eager",
    onError: e => e.currentTarget.closest('.hero-portrait-frame').classList.add('image-failed')
  }), /*#__PURE__*/React.createElement("div", {
    className: "jharokha-corner corner-tl"
  }), /*#__PURE__*/React.createElement("div", {
    className: "jharokha-corner corner-tr"
  }), /*#__PURE__*/React.createElement("div", {
    className: "jharokha-corner corner-bl"
  }), /*#__PURE__*/React.createElement("div", {
    className: "jharokha-corner corner-br"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hero-portrait-caption"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hero-person-role"
  }, person?.role), /*#__PURE__*/React.createElement("h3", {
    className: "hero-person-name gold-foil-text"
  }, salutation, person?.name), /*#__PURE__*/React.createElement(PersonBio, {
    person: person
  })));
}
function HeroSection() {
  const data = useWeddingData();
  const couple = data?.couple;
  if (!couple) return null;
  return /*#__PURE__*/React.createElement("section", {
    id: "hero-section",
    className: "hero-section",
    "aria-label": "Bride and Groom Couple Reveal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-luxury",
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    id: "hero-invitation-pretext",
    className: "hero-invitation-pretext reveal-fade-up"
  }, couple.invitationPretext), /*#__PURE__*/React.createElement("p", {
    id: "hero-invitation-quote",
    className: "hero-invitation-quote reveal-fade-up delay-1"
  }, couple.invitationText), /*#__PURE__*/React.createElement("div", {
    className: "hero-couple-showcase"
  }, /*#__PURE__*/React.createElement(HeroPortraitCard, {
    person: couple.bride,
    revealClass: "reveal-fade-left delay-2"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hero-center-connector reveal-zoom-in delay-3"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hero-ampersand"
  }, "&"), /*#__PURE__*/React.createElement(GoldDivider, null), /*#__PURE__*/React.createElement("span", {
    className: "hero-tagline-badge"
  }, "Together Forever")), /*#__PURE__*/React.createElement(HeroPortraitCard, {
    person: couple.groom,
    revealClass: "reveal-fade-right delay-2"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hero-date-strip reveal-fade-up delay-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-date-item"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-calendar-days",
    style: {
      color: 'var(--gold-rich)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    id: "hero-display-date"
  }, couple.displayDate)), /*#__PURE__*/React.createElement("span", {
    className: "hero-date-separator"
  }, "•"), /*#__PURE__*/React.createElement("div", {
    className: "hero-date-item"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-clock",
    style: {
      color: 'var(--gold-rich)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    id: "hero-display-time"
  }, couple.muhurthamTime ? `Muhurtham: ${couple.muhurthamTime}` : couple.weddingTime)), /*#__PURE__*/React.createElement("span", {
    className: "hero-date-separator"
  }, "•"), /*#__PURE__*/React.createElement("div", {
    className: "hero-date-item"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-location-dot",
    style: {
      color: 'var(--gold-rich)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    id: "hero-display-venue"
  }, couple.venueName)))));
}

/* ===== music.jsx ===== */
/**
 * Floating Luxury Music Controller — background soundtrack with an EQ bar
 * visualizer. Autoplay is only ever triggered from a real user gesture
 * (the door-tap), never on mount, so browser autoplay restrictions are
 * respected. Falls back to a synthesized Web Audio ambience if the HTML5
 * audio source is unavailable/blocked.
 */

const MusicButton = React.forwardRef(function MusicButton({
  music
}, ref) {
  const audioRef = React.useRef(null);
  const [playing, setPlaying] = React.useState(false);
  const synthRef = React.useRef({
    ctx: null,
    gain: null,
    interval: null
  });
  function startRoyalSynthAmbience() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const s = synthRef.current;
      if (!s.ctx) s.ctx = new AudioCtx();
      if (s.ctx.state === 'suspended') s.ctx.resume();
      s.gain = s.ctx.createGain();
      s.gain.gain.setValueAtTime(0.001, s.ctx.currentTime);
      s.gain.gain.exponentialRampToValueAtTime(0.08, s.ctx.currentTime + 2.0);
      s.gain.connect(s.ctx.destination);
      const droneNotes = [130.81, 196.0, 261.63];
      droneNotes.forEach(freq => {
        const osc = s.ctx.createOscillator();
        const noteGain = s.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, s.ctx.currentTime);
        const filter = s.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, s.ctx.currentTime);
        noteGain.gain.setValueAtTime(0.03, s.ctx.currentTime);
        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(s.gain);
        osc.start();
      });
      const yamanScale = [261.63, 293.66, 329.63, 369.99, 392.0, 440.0, 493.88, 523.25];
      let step = 0;
      s.interval = setInterval(() => {
        if (!s.ctx) return;
        const noteFreq = yamanScale[step % yamanScale.length];
        step = (step + Math.floor(Math.random() * 3) + 1) % yamanScale.length;
        const sitarOsc = s.ctx.createOscillator();
        const sitarGain = s.ctx.createGain();
        sitarOsc.type = 'sine';
        sitarOsc.frequency.setValueAtTime(noteFreq, s.ctx.currentTime);
        sitarGain.gain.setValueAtTime(0.001, s.ctx.currentTime);
        sitarGain.gain.exponentialRampToValueAtTime(0.05, s.ctx.currentTime + 0.08);
        sitarGain.gain.exponentialRampToValueAtTime(0.0001, s.ctx.currentTime + 1.8);
        sitarOsc.connect(sitarGain);
        sitarGain.connect(s.gain);
        sitarOsc.start(s.ctx.currentTime);
        sitarOsc.stop(s.ctx.currentTime + 1.9);
      }, 1600);
    } catch (e) {
      /* Audio autoplay policy fallback — silently ignore. */
    }
  }
  function stopRoyalSynthAmbience() {
    const s = synthRef.current;
    if (s.interval) {
      clearInterval(s.interval);
      s.interval = null;
    }
    if (s.gain && s.ctx) {
      try {
        s.gain.gain.exponentialRampToValueAtTime(0.0001, s.ctx.currentTime + 0.6);
      } catch (e) {
        /* noop */
      }
    }
  }
  function playMusic() {
    setPlaying(true);
    const audioEl = audioRef.current;
    const hasRealSrc = audioEl && !!audioEl.getAttribute('src');
    if (hasRealSrc) {
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => startRoyalSynthAmbience());
      }
    } else {
      startRoyalSynthAmbience();
    }
  }
  function pauseMusic() {
    setPlaying(false);
    if (audioRef.current) audioRef.current.pause();
    stopRoyalSynthAmbience();
  }
  function toggleMusic() {
    if (playing) pauseMusic();else playMusic();
  }
  React.useImperativeHandle(ref, () => ({
    startAutoplay() {
      if (!playing) playMusic();
    }
  }));
  React.useEffect(() => () => stopRoyalSynthAmbience(), []);
  if (!music || music.enabled === false) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    id: "floating-music-btn",
    className: `floating-music-btn${playing ? ' music-playing' : ''}`,
    type: "button",
    "aria-label": "Toggle Background Music",
    onClick: toggleMusic
  }, /*#__PURE__*/React.createElement("span", {
    className: "music-status-dot",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    id: "music-btn-text"
  }, playing ? 'Playing' : 'Music')), /*#__PURE__*/React.createElement("audio", {
    ref: audioRef,
    id: "wedding-audio",
    preload: "none",
    loop: music.loop
  }));
});

/* ===== door.jsx ===== */
/**
 * Wedding Entrance Gate — a quiet, minimal-luxury "tap to enter" reveal.
 * Replaces the old 3D carved-door spectacle (confetti, medallion, jiggling
 * button, spinning light rays) with a single calm full-screen panel: the
 * couple's names in fine serif type, a thin gold rule, and one button.
 * GSAP is used (when available) for a smooth cross-fade; it degrades to a
 * plain CSS transition otherwise. No canvas-confetti, no audio flourish.
 */

function EntranceGate({
  musicApiRef,
  onOpened
}) {
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
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('.hero-section .hero-portrait-card', {
        y: 18,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power2.out'
      });
      gsap.fromTo('.hero-section .hero-center-connector', {
        opacity: 0
      }, {
        opacity: 1,
        duration: 0.8,
        delay: 0.15,
        ease: 'power2.out'
      });
      gsap.fromTo('.hero-date-strip', {
        y: 14,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.35,
        ease: 'power2.out'
      });
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
  return /*#__PURE__*/React.createElement("aside", {
    id: "entry-gate",
    className: wrapperClass,
    "aria-label": "Wedding Invitation Entrance",
    ref: wrapperRef,
    onKeyDown: handleKeydown
  }, /*#__PURE__*/React.createElement("div", {
    className: "entry-gate-inner"
  }, /*#__PURE__*/React.createElement("span", {
    className: "entry-gate-eyebrow"
  }, "You Are Invited"), /*#__PURE__*/React.createElement("h1", {
    className: "entry-gate-names"
  }, couple.bride?.shortName, /*#__PURE__*/React.createElement("span", {
    className: "entry-gate-amp"
  }, "&"), couple.groom?.shortName), /*#__PURE__*/React.createElement("div", {
    className: "entry-gate-rule",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("p", {
    className: "entry-gate-date"
  }, couple.displayDate), /*#__PURE__*/React.createElement("button", {
    id: "entry-gate-btn",
    className: "entry-gate-btn",
    type: "button",
    "aria-label": "Open Wedding Invitation",
    onClick: openGate
  }, "Enter Invitation")));
}

/* ===== final.jsx ===== */
/**
 * Final Cinematic Message, Thank-You & Sharing Section.
 */

function FinalSection() {
  const data = useWeddingData();
  const couple = data?.couple;
  const finalMsg = data?.finalMessage;
  const showToast = useToast();
  const contentRef = useReveal();
  const bgWrapRef = React.useRef(null);
  if (!finalMsg || !couple) return null;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(`We joyfully invite you to the wedding celebrations of ${couple.bride?.shortName} & ${couple.groom?.shortName}! 🌸✨\n\nView our digital royal invitation here:\n${shareUrl}`);
  const whatsappHref = `https://api.whatsapp.com/send?text=${shareText}`;
  function fallbackCopy(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      /* noop */
    }
    document.body.removeChild(tempInput);
    showToast && showToast('Invitation link copied to clipboard');
  }
  function handleCopyLink() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => showToast && showToast('Invitation link copied to clipboard')).catch(() => fallbackCopy(shareUrl));
    } else {
      fallbackCopy(shareUrl);
    }
  }
  return /*#__PURE__*/React.createElement("section", {
    id: "final-section",
    className: "final-cinematic-section",
    "aria-label": "Final Message & Blessings"
  }, /*#__PURE__*/React.createElement("div", {
    ref: bgWrapRef,
    style: {
      display: 'contents'
    }
  }, /*#__PURE__*/React.createElement("img", {
    id: "final-bg-image",
    className: "final-bg-image",
    src: couple.coupleImage,
    alt: "Couple Background",
    loading: "lazy",
    onError: e => {
      e.currentTarget.style.display = 'none';
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "final-vignette-overlay"
  }), /*#__PURE__*/React.createElement("div", {
    className: "final-content-box reveal-fade-up",
    ref: contentRef
  }, /*#__PURE__*/React.createElement(GoldDivider, null), /*#__PURE__*/React.createElement("h2", {
    id: "final-quote-title",
    className: "final-quote-title"
  }, finalMsg.title), /*#__PURE__*/React.createElement("p", {
    id: "final-quote-desc",
    className: "final-quote-desc"
  }, finalMsg.description), /*#__PURE__*/React.createElement("div", {
    id: "final-signature",
    className: "final-signature",
    style: {
      whiteSpace: 'pre-line'
    }
  }, finalMsg.signature), /*#__PURE__*/React.createElement("p", {
    id: "final-thank-you",
    style: {
      marginTop: '1.5rem',
      color: 'var(--gold-champagne)',
      fontFamily: 'var(--font-serif-royal)',
      letterSpacing: '0.1em',
      fontSize: '0.95rem',
      whiteSpace: 'pre-line'
    }
  }, finalMsg.thankYouText), /*#__PURE__*/React.createElement("div", {
    className: "share-action-container"
  }, /*#__PURE__*/React.createElement("a", {
    id: "share-whatsapp-btn",
    href: whatsappHref,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "btn-luxury",
    style: {
      background: 'transparent',
      border: '1px solid var(--hairline-light)',
      color: 'var(--ivory)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-brands fa-whatsapp"
  }), /*#__PURE__*/React.createElement("span", null, "Share on WhatsApp")), /*#__PURE__*/React.createElement("button", {
    id: "copy-link-btn",
    type: "button",
    className: "btn-gold-outline",
    style: {
      background: 'transparent',
      borderColor: 'var(--hairline-light)',
      color: 'var(--ivory)'
    },
    onClick: handleCopyLink
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-regular fa-copy"
  }), /*#__PURE__*/React.createElement("span", null, "Copy Invitation Link")))));
}

/* ===== app.jsx ===== */
/**
 * Master Application Root — mounts the whole React tree into <div id="root">.
 * Wires weddingData (data.js) through context, and orchestrates the
 * cross-cutting features (SEO tags, GSAP ScrollTrigger reveals) that used to
 * live in app.js.
 */

function VedicBlessingHeader() {
  const data = useWeddingData();
  const blessings = data?.blessings;
  if (!blessings) return null;
  return /*#__PURE__*/React.createElement("header", {
    className: "vedic-blessing-bar",
    "aria-label": "Blessings"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-luxury"
  }, /*#__PURE__*/React.createElement("div", {
    id: "vedic-shloka-main",
    className: "vedic-shloka-text"
  }, blessings.ganeshShloka), /*#__PURE__*/React.createElement("div", {
    id: "vedic-shloka-sub",
    className: "vedic-shloka-sanskrit"
  }, blessings.mainShloka), /*#__PURE__*/React.createElement(GoldDivider, null)));
}

/** Injects SEO/meta tags from weddingData.seo, matching the original populateSEO(). */
function useSEO(seo) {
  React.useEffect(() => {
    if (!seo) return;
    if (seo.title) document.title = seo.title;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    if (seo.description) metaDesc.content = seo.description;
    let themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = document.createElement('meta');
      themeMeta.name = 'theme-color';
      document.head.appendChild(themeMeta);
    }
    if (seo.themeColor) themeMeta.content = seo.themeColor;
  }, [seo]);
}

/** GSAP ScrollTrigger section/gallery-card stagger reveals (progressive enhancement). */
function useGsapScrollReveals(reducedMotion) {
  React.useEffect(() => {
    if (reducedMotion) return undefined;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return undefined;
    gsap.registerPlugin(ScrollTrigger);
    const headerTweens = gsap.utils.toArray('.section-header').map(header => gsap.from(header, {
      scrollTrigger: {
        trigger: header,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 40,
      opacity: 0,
      duration: 1.1,
      ease: 'power3.out'
    }));
    const cardTweens = gsap.utils.toArray('.gallery-card-frame').map((card, i) => gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 50,
      opacity: 0,
      duration: 0.9,
      delay: i % 3 * 0.15,
      ease: 'power3.out'
    }));
    return () => {
      headerTweens.forEach(t => t.scrollTrigger && t.scrollTrigger.kill());
      cardTweens.forEach(t => t.scrollTrigger && t.scrollTrigger.kill());
    };
  }, [reducedMotion]);
}
function App() {
  const data = weddingData;
  const features = data.features || {};
  const petalsApiRef = React.useRef(null);
  const musicApiRef = React.useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  useSEO(data.seo);
  useGsapScrollReveals(reducedMotion);
  React.useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);
  const doorEnabled = features.door !== false;

  // If the door feature is disabled entirely, ensure scroll stays unlocked.
  React.useEffect(() => {
    if (!doorEnabled) document.body.classList.remove('lock-scroll');
  }, [doorEnabled]);
  return /*#__PURE__*/React.createElement(WeddingDataContext.Provider, {
    value: data
  }, /*#__PURE__*/React.createElement(ToastProvider, null, /*#__PURE__*/React.createElement(LightboxProvider, null, doorEnabled && /*#__PURE__*/React.createElement(EntranceGate, {
    musicApiRef: musicApiRef
  }), /*#__PURE__*/React.createElement("main", {
    id: "main-wedding-content"
  }, /*#__PURE__*/React.createElement(VedicBlessingHeader, null), /*#__PURE__*/React.createElement(HeroSection, null), features.countdown !== false && /*#__PURE__*/React.createElement(CountdownSection, null), features.story !== false && /*#__PURE__*/React.createElement(StorySection, null), features.timeline !== false && /*#__PURE__*/React.createElement(TimelineSection, null), features.gallery !== false && /*#__PURE__*/React.createElement(GallerySection, null), features.family !== false && /*#__PURE__*/React.createElement(FamilySection, null), features.venue !== false && /*#__PURE__*/React.createElement(VenueSection, null), features.moments !== false && /*#__PURE__*/React.createElement(MomentsSection, null), /*#__PURE__*/React.createElement(FinalSection, null)), features.music !== false && /*#__PURE__*/React.createElement(MusicButton, {
    ref: musicApiRef,
    music: data.music
  }))), /*#__PURE__*/React.createElement(PetalsCanvas, {
    ref: petalsApiRef
  }));
}
const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(/*#__PURE__*/React.createElement(App, null));
} else {
  console.error('#root element not found — cannot mount the React app.');
}
