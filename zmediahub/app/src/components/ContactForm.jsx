import { getConfig } from '../services/config.js';
import { useState } from 'react';
import { safeUrl } from '../utils/helpers.js';
import { I } from './ui.jsx';
import Dropdown from './fields/Dropdown.jsx';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOPICS = ['General question', 'Get my content featured', 'List my business', 'Report or remove content', 'Partnership'];

/**
 * Reusable contact form. With an `endpoint` it POSTs JSON; without one it opens the visitor's email app
 * with the message pre-filled (mailto), so no message is ever lost.
 */
export default function ContactForm({ endpoint, email, topics = TOPICS }) {
  const url = safeUrl(endpoint);
  const [v, setV] = useState({ name: '', email: '', topic: topics[0], message: '', website: '' });
  const [err, setErr] = useState({});
  const [state, setState] = useState('idle'); // idle | busy | sent | mail | error
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (v.name.trim().length < 2) e.name = 'Please tell us your name.';
    if (!EMAIL.test(v.email.trim())) e.email = 'Please enter a valid email address.';
    if (v.message.trim().length < 10) e.message = 'Please write a few words (at least 10 characters).';
    setErr(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (v.website) return; // honeypot: bots fill the hidden field
    if (!validate()) return;
    const body = { name: v.name.trim(), email: v.email.trim(), topic: v.topic, message: v.message.trim() };
    if (!url) {
      const mail = `mailto:${email}?subject=${encodeURIComponent(`[${getConfig()?.site?.name || 'Website'}] ${body.topic}`)}&body=${encodeURIComponent(`${body.message}\n\n${body.name} (${body.email})`)}`;
      window.location.href = mail;
      setState('mail');
      return;
    }
    setState('busy');
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(String(res.status));
      setState('sent'); setV({ name: '', email: '', topic: topics[0], message: '', website: '' });
    } catch { setState('error'); }
  };

  if (state === 'sent') {
    return <div className="form-done" role="status"><span><I c="fa-solid fa-check" /></span><h3>Message sent</h3><p>Thank you. We will get back to you soon.</p><button type="button" className="btn btn--outline btn--sm" onClick={() => setState('idle')}>Send another</button></div>;
  }

  const field = (id, label, control, hint) => (
    <div className={`form-group ${err[id] ? 'has-error' : ''}`}>
      <label htmlFor={`cf-${id}`}>{label}</label>
      {control}
      {err[id] ? <span className="form-error" role="alert">{err[id]}</span> : hint && <small>{hint}</small>}
    </div>
  );

  return (
    <form className="contact-form card" onSubmit={submit} noValidate>
      <h2>Send us a message</h2>
      <div className="contact-form__row">
        {field('name', 'Your name', <input id="cf-name" value={v.name} onChange={set('name')} autoComplete="name" placeholder="e.g. Alex Morgan" aria-invalid={!!err.name} />)}
        {field('email', 'Email address', <input id="cf-email" type="email" value={v.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" aria-invalid={!!err.email} />)}
      </div>
      <Dropdown label="Topic" value={v.topic} onChange={(t) => setV((s) => ({ ...s, topic: t }))} options={topics.map((t) => ({ value: t, label: t }))} variant="stack" className="dd--field" />
      {field('message', 'Message', <textarea id="cf-message" rows="5" value={v.message} onChange={set('message')} placeholder="How can we help?" aria-invalid={!!err.message} />, `${v.message.trim().length} characters`)}
      <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={v.website} onChange={set('website')} name="website" />
      <button type="submit" className="btn btn--primary btn--block" disabled={state === 'busy'}>{state === 'busy' ? 'Sending…' : url ? 'Send message' : 'Send by email'}</button>
      {state === 'mail' && <p className="form-note" role="status"><I c="fa-regular fa-envelope" /> Your email app should open with the message ready to send. If it did not, write to <a href={`mailto:${email}`}>{email}</a>.</p>}
      {state === 'error' && <p className="form-note form-note--error" role="alert">That did not go through. Please try again, or email <a href={`mailto:${email}`}>{email}</a>.</p>}
    </form>
  );
}
