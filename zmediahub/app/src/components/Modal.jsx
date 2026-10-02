import { useEffect, useRef } from 'react';
import { baseUrl } from '../services/seo.js';
import { copyText } from '../utils/helpers.js';
import { I } from './ui.jsx';
import { useToast } from './Toast.jsx';

/**
 * Reusable popup built on the native <dialog> element (focus trap, Esc and backdrop-click to close).
 *   <Modal open onClose title="Share" size="sm|md|lg" footer={<button/>}>...</Modal>
 * Content scrolls inside the popup, never outside the screen, and long text wraps.
 */
export default function Modal({ open, onClose, title, children, footer, size = 'md', className = '', hideTitle = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} data-lenis-prevent className={`modal modal--${size} ${className}`} onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }} aria-label={title}>
      <div className="modal__box">
        <header className={`modal__head ${hideTitle ? 'modal__head--bare' : ''}`}>
          {!hideTitle && <h2>{title}</h2>}
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close"><I c="fa-solid fa-xmark" /></button>
        </header>
        <div className="modal__body">{open && children}</div>
        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </dialog>
  );
}

/** Share popup: social links and a copy-link field. */
export function ShareModal({ open, onClose, title, url }) {
  const toast = useToast();
  const full = url || (typeof location !== 'undefined' ? location.href : baseUrl());
  const enc = encodeURIComponent;
  const links = [
    ['X', 'fa-brands fa-x-twitter', `https://x.com/intent/tweet?text=${enc(title)}&url=${enc(full)}`],
    ['Facebook', 'fa-brands fa-facebook-f', `https://www.facebook.com/sharer/sharer.php?u=${enc(full)}`],
    ['WhatsApp', 'fa-brands fa-whatsapp', `https://wa.me/?text=${enc(`${title} ${full}`)}`],
    ['Email', 'fa-regular fa-envelope', `mailto:?subject=${enc(title)}&body=${enc(full)}`],
  ];
  return (
    <Modal open={open} onClose={onClose} title="Share" size="sm">
      <p className="modal__text">{title}</p>
      <div className="share-links">
        {links.map(([name, icon, href]) => <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="share-link"><I c={icon} /><span>{name}</span></a>)}
      </div>
      <div className="share-copy">
        <input readOnly value={full} aria-label="Link" onFocus={(e) => e.target.select()} />
        <button type="button" className="btn btn--primary btn--sm" onClick={async () => { toast((await copyText(full)) ? 'Link copied' : 'Copy failed'); }}><I c="fa-regular fa-copy" /> Copy</button>
      </div>
    </Modal>
  );
}
