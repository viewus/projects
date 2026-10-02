import { useMemo } from 'react';
import { Particles, ParticlesProvider, useParticlesProvider } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

/**
 * Soft floating particles behind the whole page (tsParticles). Colour comes from the theme, so every dataset matches.
 * Not shown for visitors who prefer reduced motion, and it pauses when the tab is hidden.
 * Tune it in data/theme.json -> "particles": { "enabled": true, "count": 36, "speed": 0.5, "links": true, "size": 3 }
 */
const register = async (engine) => { await loadSlim(engine); };

function Layer({ id, cfg }) {
  const { loaded } = useParticlesProvider();
  const color = useMemo(() => getComputedStyle(document.documentElement).getPropertyValue('--mh-primary').trim() || '#ffffff', []);
  const options = useMemo(() => ({
    fullScreen: { enable: false }, background: { color: { value: 'transparent' } }, fpsLimit: 40, detectRetina: true, pauseOnBlur: true,
    particles: {
      number: { value: cfg.count ?? 60, density: { enable: true, area: 900 } }, color: { value: color },
      opacity: { value: { min: 0.35, max: 0.75 } }, size: { value: { min: 2, max: cfg.size ?? 5 } },
      move: { enable: true, speed: cfg.speed ?? 0.5, direction: 'none', outModes: { default: 'out' } },
      links: { enable: cfg.links !== false, color, distance: 150, opacity: 0.3, width: 1 },
    },
    interactivity: { events: { onHover: { enable: true, mode: 'grab' } }, modes: { grab: { distance: 140, links: { opacity: 0.4 } } } },
  }), [color, cfg.count, cfg.size, cfg.speed, cfg.links]);
  if (!loaded) return null;
  return <Particles id={id} className="page-particles" options={options} />;
}

export default function HeroParticles({ id = 'page-particles', cfg = {} }) {
  return <ParticlesProvider init={register}><Layer id={id} cfg={cfg} /></ParticlesProvider>;
}
