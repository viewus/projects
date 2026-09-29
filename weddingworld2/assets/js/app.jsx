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

  return (
    <header className="vedic-blessing-bar" aria-label="Blessings">
      <div className="container-luxury">
        <div id="vedic-shloka-main" className="vedic-shloka-text">{blessings.ganeshShloka}</div>
        <div id="vedic-shloka-sub" className="vedic-shloka-sanskrit">{blessings.mainShloka}</div>
        <GoldDivider />
      </div>
    </header>
  );
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

    const headerTweens = gsap.utils.toArray('.section-header').map((header) =>
      gsap.from(header, {
        scrollTrigger: { trigger: header, start: 'top 85%', toggleActions: 'play none none none' },
        y: 40,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out'
      })
    );

    const cardTweens = gsap.utils.toArray('.gallery-card-frame').map((card, i) =>
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' },
        y: 50,
        opacity: 0,
        duration: 0.9,
        delay: (i % 3) * 0.15,
        ease: 'power3.out'
      })
    );

    return () => {
      headerTweens.forEach((t) => t.scrollTrigger && t.scrollTrigger.kill());
      cardTweens.forEach((t) => t.scrollTrigger && t.scrollTrigger.kill());
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

  return (
    <WeddingDataContext.Provider value={data}>
      <ToastProvider>
        <LightboxProvider>
          {doorEnabled && (
            <EntranceGate musicApiRef={musicApiRef} />
          )}

          <main id="main-wedding-content">
            <VedicBlessingHeader />
            <HeroSection />
            {features.countdown !== false && <CountdownSection />}
            {features.story !== false && <StorySection />}
            {features.timeline !== false && <TimelineSection />}
            {features.gallery !== false && <GallerySection />}
            {features.family !== false && <FamilySection />}
            {features.venue !== false && <VenueSection />}
            {features.moments !== false && <MomentsSection />}
            <FinalSection />
          </main>

          {features.music !== false && <MusicButton ref={musicApiRef} music={data.music} />}
        </LightboxProvider>
      </ToastProvider>

      <PetalsCanvas ref={petalsApiRef} />
    </WeddingDataContext.Provider>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
} else {
  console.error('#root element not found — cannot mount the React app.');
}
