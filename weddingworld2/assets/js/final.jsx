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
  const shareText = encodeURIComponent(
    `We joyfully invite you to the wedding celebrations of ${couple.bride?.shortName} & ${couple.groom?.shortName}! 🌸✨\n\nView our digital royal invitation here:\n${shareUrl}`
  );
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
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => showToast && showToast('Invitation link copied to clipboard'))
        .catch(() => fallbackCopy(shareUrl));
    } else {
      fallbackCopy(shareUrl);
    }
  }

  return (
    <section id="final-section" className="final-cinematic-section" aria-label="Final Message & Blessings">
      <div ref={bgWrapRef} style={{ display: 'contents' }}>
        <img
          id="final-bg-image"
          className="final-bg-image"
          src={couple.coupleImage}
          alt="Couple Background"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <div className="final-vignette-overlay"></div>

      <div className="final-content-box reveal-fade-up" ref={contentRef}>
        <GoldDivider />
        <h2 id="final-quote-title" className="final-quote-title">{finalMsg.title}</h2>
        <p id="final-quote-desc" className="final-quote-desc">{finalMsg.description}</p>

        <div id="final-signature" className="final-signature" style={{ whiteSpace: 'pre-line' }}>
          {finalMsg.signature}
        </div>
        <p
          id="final-thank-you"
          style={{
            marginTop: '1.5rem',
            color: 'var(--gold-champagne)',
            fontFamily: 'var(--font-serif-royal)',
            letterSpacing: '0.1em',
            fontSize: '0.95rem',
            whiteSpace: 'pre-line'
          }}
        >
          {finalMsg.thankYouText}
        </p>

        <div className="share-action-container">
          <a
            id="share-whatsapp-btn"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-luxury"
            style={{ background: 'transparent', border: '1px solid var(--hairline-light)', color: 'var(--ivory)' }}
          >
            <i className="fa-brands fa-whatsapp"></i>
            <span>Share on WhatsApp</span>
          </a>
          <button
            id="copy-link-btn"
            type="button"
            className="btn-gold-outline"
            style={{ background: 'transparent', borderColor: 'var(--hairline-light)', color: 'var(--ivory)' }}
            onClick={handleCopyLink}
          >
            <i className="fa-regular fa-copy"></i>
            <span>Copy Invitation Link</span>
          </button>
        </div>
      </div>
    </section>
  );
}
