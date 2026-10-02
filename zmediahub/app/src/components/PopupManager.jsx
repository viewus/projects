import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DataService } from '../services/dataService.js';
import { A, I, Img } from './ui.jsx';
import Modal from './Modal.jsx';

const KEY = 'mediahub:popup:';
const seen = (p) => { try { return (p.frequency === 'session' ? sessionStorage : localStorage).getItem(KEY + p.id) === '1'; } catch { return false; } };
const remember = (p) => { try { if (p.frequency !== 'always') (p.frequency === 'session' ? sessionStorage : localStorage).setItem(KEY + p.id, '1'); } catch { /* storage unavailable */ } };

/**
 * Shows one popup message at a time from data/popups.csv, using the reusable <Modal>.
 * Each row decides its own page, delay, frequency (once / session / always) and date window.
 */
export default function PopupManager() {
  const { pathname } = useLocation();
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    let timer; let alive = true;
    setPopup(null);
    DataService.getPopups({ path: pathname }).then((list) => {
      const next = list.find((p) => !seen(p));
      if (!alive || !next) return;
      timer = setTimeout(() => alive && setPopup(next), next.delay * 1000);
    });
    return () => { alive = false; clearTimeout(timer); };
  }, [pathname]);

  const close = () => { if (popup) remember(popup); setPopup(null); };
  if (!popup) return null;
  return (
    <Modal open onClose={close} title={popup.title || 'Message'} hideTitle size="sm" className="modal--popup">
      {popup.image && <div className="popup-msg__img"><Img src={popup.image} alt="" eager /></div>}
      <div className="popup-msg__body">
        {popup.title && <h2>{popup.title}</h2>}
        {popup.message && <p>{popup.message}</p>}
        <div className="popup-msg__actions">
          {popup.link && popup.buttonText && <A href={popup.link} className="btn btn--primary" onClick={close}>{popup.buttonText} <I c="fa-solid fa-arrow-right" /></A>}
          <button type="button" className="btn btn--outline" onClick={close}>Maybe later</button>
        </div>
      </div>
    </Modal>
  );
}
