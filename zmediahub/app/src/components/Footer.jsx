import { useState } from 'react';
import { Link } from 'react-router-dom';
import { featureOn, useApp, useAsync } from '../hooks/index.jsx';
import { DataService } from '../services/dataService.js';
import { linkTarget, safeUrl } from '../utils/helpers.js';
import { I } from './ui.jsx';
import PlatformBadge from './PlatformBadge.jsx';
import { Logo } from './Header.jsx';

function Newsletter({ col, endpoint }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle', msg: '' });
  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setState({ status: 'error', msg: 'Please enter a valid email address.' });
    setState({ status: 'busy', msg: '' });
    try {
      const url = safeUrl(endpoint);
      if (url) {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email }) });
        if (!res.ok) throw new Error(String(res.status));
      } // with no endpoint configured the demo simply confirms; set data/company.csv -> newsletterEndpoint to connect a real service
      setEmail(''); setState({ status: 'ok', msg: col.success || 'Thanks for subscribing!' });
    } catch { setState({ status: 'error', msg: 'Could not subscribe right now. Please try again later.' }); }
  };
  return (
    <div className="footer__news">
      <h2>{col.title}</h2>
      <p>{col.text}</p>
      <form onSubmit={submit} noValidate>
        <label className="sr-only" htmlFor="news-email">Email address</label>
        <input id="news-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={col.placeholder} autoComplete="email" />
        <button type="submit" aria-label={col.button || 'Subscribe'} disabled={state.status === 'busy'}><I c="fa-solid fa-arrow-right" /></button>
      </form>
      {state.msg && <p className={`footer__msg footer__msg--${state.status}`} role="status">{state.msg}</p>}
    </div>
  );
}

const CONTACT_ICONS = { instagram: 'fa-brands fa-instagram', facebook: 'fa-brands fa-facebook-f', youtube: 'fa-brands fa-youtube', x: 'fa-brands fa-x-twitter', tiktok: 'fa-brands fa-tiktok', linkedin: 'fa-brands fa-linkedin-in', whatsapp: 'fa-brands fa-whatsapp', maps: 'fa-solid fa-location-dot', phone: 'fa-solid fa-phone', email: 'fa-regular fa-envelope' };
const CONTACT_LABELS = { instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube', x: 'X (Twitter)', tiktok: 'TikTok', linkedin: 'LinkedIn', whatsapp: 'WhatsApp', maps: 'Find us on Google Maps', phone: 'Call us', email: 'Email us' };

export default function Footer() {
  const { config } = useApp();
  const { footer, company, site } = config;
  const { data } = useAsync(async () => ({
    cats: await DataService.getCategories({ sort: 'popular', limit: 20 }),
    tags: await DataService.getTags({ featured: true, limit: 20 }),
    platforms: await DataService.getPlatforms(),
  }), []);
  const social = Object.entries(company.social || {}).filter(([, u]) => safeUrl(u));
  const pmap = new Map((data?.platforms || []).map((p) => [p.id, p]));

  const renderCol = (col) => {
    let items = [];
    if (col.type === 'links') items = col.links.filter((l) => featureOn(config, l.feature)).map((l) => ({ label: l.label, ...linkTarget(l.href) }));
    if (col.type === 'categories') items = (data?.cats || []).slice(0, col.limit || 8).map((c) => ({ label: c.name, internal: true, to: c.url }));
    if (col.type === 'tags') items = (data?.tags || []).slice(0, col.limit || 8).map((t) => ({ label: `#${t.name}`, internal: true, to: t.url }));
    if (col.type === 'platforms') {
      return (
        <ul className="footer__list footer__list--platforms">
          {(data?.platforms || []).map((p) => <li key={p.id}><Link to={`/trending?platform=${p.id}`}><PlatformBadge platform={p} size="xs" /> {p.name}</Link></li>)}
        </ul>
      );
    }
    return (
      <ul className="footer__list">
        {items.map((it) => <li key={it.label}>{it.internal ? <Link to={it.to}>{it.label}</Link> : <a href={it.to} target="_blank" rel="noopener noreferrer">{it.label}</a>}</li>)}
      </ul>
    );
  };

  return (
    <footer className="site-footer">
      <div className="container footer__grid" style={{ "--footer-cols": footer.columns.filter((col) => featureOn(config, col.feature)).length }}>
        <div className="footer__brand">
          <Logo light />
          <p>{footer.description}</p>
          <ul className="footer__social">
            {social.map(([k, url]) => {
              const p = pmap.get(k);
              return <li key={k}><a href={safeUrl(url)} target="_blank" rel="noopener noreferrer" aria-label={p?.name || CONTACT_LABELS[k] || k}><I c={p?.icon || CONTACT_ICONS[k] || 'fa-solid fa-link'} /></a></li>;
            })}
          </ul>
          {footer.newsletter && <Newsletter col={footer.newsletter} endpoint={company.newsletterEndpoint} />}
        </div>
        {footer.columns.filter((col) => featureOn(config, col.feature)).map((col) => (
          <div key={col.title} className="footer__col">
            <h2>{col.title}</h2>
            {renderCol(col)}
          </div>
        ))}
      </div>
      <div className="footer__bottom">
        <div className="container">
          <p>{(site.copyright || '').replace('{year}', new Date().getFullYear())}</p>
          <ul>{footer.bottomLinks.map((l) => <li key={l.label}><Link to={linkTarget(l.href).to}>{l.label}</Link></li>)}</ul>
        </div>
      </div>
    </footer>
  );
}
