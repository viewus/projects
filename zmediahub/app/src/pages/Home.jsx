import { useApp, usePageSEO } from '../hooks/index.jsx';
import { websiteJsonLd } from '../services/seo.js';
import { SECTIONS } from './HomeSections.jsx';

/** The homepage is just data/sections.json rendered in order. Disable a section there to remove it. */
export default function Home() {
  const { config } = useApp();
  usePageSEO({ home: true, title: config.site.name, description: config.seo.defaultDescription, path: '/', jsonLd: websiteJsonLd() }, []);
  const sections = (config.sections.home || []).filter((s) => s.enabled !== false);
  return (
    <>
      {!sections.some((s) => s.type === 'hero') && <h1 className="sr-only">{config.seo.homeTitle || config.site.name}</h1>}
      {sections.map((s, i) => {
        const Section = SECTIONS[s.type];
        if (!Section) { console.warn(`[sections] Unknown section type "${s.type}"`); return null; }
        return <Section key={`${s.type}-${i}`} cfg={s} />;
      })}
    </>
  );
}
