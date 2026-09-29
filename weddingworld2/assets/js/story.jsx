/**
 * "Our Story" Scrapbook Section — milestone timeline of the couple's journey.
 */

function StoryItem({ milestone }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="story-item reveal-fade-up">
      <div className="story-polaroid">
        <img
          src={milestone.image}
          alt={milestone.title}
          loading="lazy"
          onError={(e) => e.currentTarget.closest('.story-polaroid').classList.add('image-failed')}
        />
      </div>
      <div className="story-content">
        <span className="story-year-badge">{milestone.year}</span>
        <h3 className="story-milestone-title">{milestone.title}</h3>
        <p>{milestone.description}</p>
      </div>
    </div>
  );
}

function StorySection() {
  const data = useWeddingData();
  const story = data?.story;
  const headerRef = useReveal();

  if (!story || !story.enabled) return null;

  return (
    <section id="story-section" className="story-section" aria-label="Our Story and Milestones">
      <div className="container-luxury">
        <header className="section-header reveal-fade-up" ref={headerRef}>
          <span id="story-subtitle" className="section-subtitle">{story.subtitle}</span>
          <h2 id="story-title" className="section-title">{story.title}</h2>
          <GoldDivider />
          <p id="story-intro" className="section-desc">{story.introduction}</p>
        </header>

        <div id="story-container" className="story-grid">
          {story.milestones && story.milestones.map((m, idx) => (
            <StoryItem key={idx} milestone={m} />
          ))}
        </div>
      </div>
    </section>
  );
}
