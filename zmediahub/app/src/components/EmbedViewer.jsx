import { useEffect, useRef, useState } from 'react';
import { getConfig } from '../services/config.js';
import { formatNumber, safeUrl } from '../utils/helpers.js';
import { Avatar, I, Img, Verified } from './ui.jsx';
import PlatformBadge from './PlatformBadge.jsx';

/**
 * Detects YouTube, Instagram, Facebook, TikTok, X and generic embeds.
 * Embeds are click-to-load (fast pages, no third-party cookies until asked) and only allowed from
 * hosts listed in data/platforms.json -> embedHosts. Anything else, or any failure, falls back to a
 * "View Original Content" card, so a third-party embed can never break the page.
 */
export function resolveEmbed(item) {
  const url = safeUrl(item?.embedUrl);
  if (!url) return null;
  let u;
  try { u = new URL(url); } catch { return null; }
  if (u.protocol !== 'https:') return null;
  const cfg = getConfig()?.platforms || {};
  if (!(cfg.embedHosts || []).includes(u.hostname)) return null;
  /** ratios come from data/platforms.json -> embeds (per platform: ratio, shortRatio) with sensible defaults */
  const ratioOf = (key, fallback, vertical) => (vertical ? cfg.embeds?.[key]?.shortRatio : cfg.embeds?.[key]?.ratio) || fallback;

  const host = u.hostname.replace(/^(www|m)\./, '');
  const vertical = item.type === 'reel' || item.type === 'short';
  if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'youtu.be') {
    const m = host === 'youtu.be' ? [null, u.pathname.slice(1)] : u.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{6,})/) || [null, u.searchParams.get('v')];
    if (!m[1]) return null;
    const short = item.type === 'short' || /\/shorts\//.test(u.pathname);
    return { kind: 'youtube', src: `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0&modestbranding=1`, ratio: ratioOf('youtube', '16/9', short), vertical: short, host: 'YouTube' };
  }
  if (host === 'instagram.com') {
    const p = u.pathname.replace(/\/$/, '');
    return { kind: 'instagram', src: `https://www.instagram.com${/\/embed(\/captioned)?$/.test(p) ? p : `${p}/embed`}/`, ratio: ratioOf('instagram', '4/5'), vertical: true, host: 'Instagram' };
  }
  if (host === 'tiktok.com') return { kind: 'tiktok', src: url, ratio: ratioOf('tiktok', '9/16'), vertical: true, host: 'TikTok' };
  if (host === 'facebook.com') {
    // a normal Facebook video / reel / post link is turned into the official plugin URL
    const plugin = /\/plugins\//.test(u.pathname) ? url
      : `https://www.facebook.com/plugins/${/\/posts\//.test(u.pathname) ? 'post' : 'video'}.php?href=${encodeURIComponent(url)}&show_text=false`;
    return { kind: 'facebook', src: plugin, ratio: ratioOf('facebook', '16/9', vertical), vertical, host: 'Facebook' };
  }
  if (host === 'platform.twitter.com') return { kind: 'x', src: url, ratio: ratioOf('x', '4/5'), vertical: true, host: 'X' };
  return { kind: 'generic', src: url, ratio: ratioOf('generic', '16/9', vertical), vertical, host: item.platformInfo?.name || host };
}

export const isEmbeddable = (item) => !!resolveEmbed(item);

/** No live embed available: show the whole post as a native-looking preview, with a button to the original. */
function Fallback({ item }) {
  const ext = safeUrl(item.externalUrl);
  const pf = item.platformInfo;
  const p = item.provider;
  const square = ['post', 'article', 'link'].includes(item.type) && pf?.id !== 'youtube';
  const vertical = item.type === 'reel' || item.type === 'short';
  return (
    <article className={`fallback-card post-preview ${vertical ? 'post-preview--vertical' : ''}`}>
      <header className="post-preview__head">
        <Avatar provider={p} size="md" />
        <span className="post-preview__who"><strong>{p ? p.name : 'Independent source'}{p?.verified && <Verified />}</strong><em>{p && getConfig()?.site?.cards?.showProvider ? `@${p.username} · ` : ''}{pf?.name || 'the original site'}</em></span>
        <PlatformBadge platform={pf} size="md" />
      </header>
      <div className={`post-preview__media ${square ? 'is-square' : ''} ${vertical ? 'is-vertical' : ''}`}>
        <Img src={item.thumbnail} alt={item.title} eager />
        {['video', 'reel', 'short', 'live'].includes(item.type) && <span className="post-preview__play"><I c="fa-solid fa-play" /></span>}
        {item.duration && <span className="post-preview__dur">{item.duration}</span>}
      </div>
      <div className="post-preview__body">
        {getConfig()?.site?.cards?.showStats !== false && <p className="post-preview__stats"><span><I c="fa-regular fa-heart" /> {formatNumber(item.likes)}</span><span><I c="fa-regular fa-comment" /> {formatNumber(item.comments)}</span><span><I c="fa-regular fa-eye" /> {formatNumber(item.views)}</span></p>}
        <p className="post-preview__caption"><strong>{p?.username || pf?.name}</strong> {item.description || item.title}</p>
        {item.tags.length > 0 && <p className="post-preview__tags">{item.tags.slice(0, 5).map((t) => `#${t.name}`).join(' ')}</p>}
        {ext
          ? <a className="btn btn--primary btn--block" href={ext} target="_blank" rel="noopener noreferrer"><I c="fa-solid fa-arrow-up-right-from-square" /> View Original Content on {pf?.name || 'the original site'}</a>
          : <span className="btn btn--ghost btn--block" aria-disabled="true">Original link unavailable</span>}
      </div>
    </article>
  );
}

export default function EmbedViewer({ item }) {
  const embed = resolveEmbed(item);
  const [state, setState] = useState('idle'); // idle | loading | ready | slow
  const timer = useRef();
  useEffect(() => { setState('idle'); return () => clearTimeout(timer.current); }, [item.id]);
  if (!embed) return <Fallback item={item} />;
  const ext = safeUrl(item.externalUrl);

  const start = () => { setState('loading'); timer.current = setTimeout(() => setState((s) => (s === 'ready' ? s : 'slow')), 9000); };
  const where = item.platformInfo?.name || embed.host;
  return (
    <div className="embed-wrap">
      <div className={`embed ${embed.vertical ? 'embed--vertical' : ''}`} style={{ '--ratio': embed.ratio }}>
        {state === 'idle' ? (
          <button type="button" className="embed__facade" onClick={start} aria-label={`Play ${item.title} here`}>
            <Img src={item.thumbnail} alt="" eager />
            <span className="embed__play"><I c="fa-solid fa-play" /></span>
          </button>
        ) : (
          <>
            <iframe
              src={embed.kind === 'youtube' ? `${embed.src}&autoplay=1` : embed.src} title={item.title} loading="lazy" allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin" onLoad={() => { clearTimeout(timer.current); setState('ready'); }}
            />
            {state === 'loading' && <span className="embed__loading"><I c="fa-solid fa-circle-notch fa-spin" /> Loading…</span>}
          </>
        )}
      </div>
      <div className="embed-actions">
        {state === 'idle' && <button type="button" className="btn btn--primary btn--sm" onClick={start}><I c="fa-solid fa-play" /> Play here</button>}
        {ext ? <a className="btn btn--outline btn--sm" href={ext} target="_blank" rel="noopener noreferrer"><I c="fa-solid fa-arrow-up-right-from-square" /> Open on {where}</a> : null}
        {state === 'slow' && <span className="embed-note">Not playing? The publisher may block embedding, so use the official link.</span>}
      </div>
    </div>
  );
}
