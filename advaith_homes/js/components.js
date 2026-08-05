const BLOG_LINKS = [
  { id: 'london-hotspots-2026', icon: '📍', title: 'London Hotspots', desc: 'Top 5 growth areas' },
  { id: 'negotiation-secrets', icon: '💰', title: 'Negotiation Secrets', desc: 'Save £20k+ easily' },
  { id: 'property-rules-2026', icon: '⚖️', title: 'Property Rules', desc: 'Law changes for 2026' },
  { id: 'mortgage-secrets-2026', icon: '🏦', title: 'Mortgage Secrets', desc: 'Unlock the best rates' },
  { id: 'midlands-boom-2026', icon: '🏗️', title: 'The Midlands Boom', desc: 'Manchester is smart buy' },
  { id: 'first-time-buyer-2026', icon: '🔑', title: 'First-Time Buyer', desc: 'Your step-by-step key' },
  { id: 'hidden-costs-buying', icon: '💸', title: 'Hidden Costs', desc: 'The extra £10k you need' },
  { id: 'new-build-vs-period', icon: '🏘️', title: 'New Build vs Period', desc: 'Which wins in 2026?' },
  { id: 'shared-ownership-reality', icon: '🤝', title: 'Shared Ownership', desc: 'Trap or ticket?' },
  { id: 'digital-legals-2026', icon: '📱', title: 'Digital Legals', desc: 'Paperwork-free buying' }
];

const MAIN_NAV = [
  { title: 'Home', href: 'index.html', icon: '🏠', showInMain: true },
  { title: 'Services', href: 'services.html', icon: '✨', showInMain: false },
  {
    title: 'Buying Guides',
    type: 'dropdown',
    icon: '📋',
    showInMain: true,
    items: [
      { id: 'property-research.html', icon: '🔍', title: 'Property Research Report', desc: 'Deep analysis before you buy' },
      { id: 'legal-search.html', icon: '⚖️', title: 'Legal Search Packs', desc: "What's hidden in the paperwork" },
      { id: 'buyers-guide.html', icon: '📋', title: "Buyer's Guide", desc: 'Complete buying process' },
      { id: 'deposit-guide.html', icon: '💰', title: 'Deposit Guide', desc: 'How much you really need' },
      { id: 'mortgage-guide.html', icon: '🏦', title: 'Mortgage Guide', desc: 'Navigate rates & lenders' },
      { id: 'moving-guide.html', icon: '🚛', title: 'Moving Guide', desc: 'Stress-free moving day' },
      { id: 'price-calculator.html', icon: '🧮', title: 'Price Calculator', desc: 'Dynamic cost estimations', highlight: true }
    ]
  },
  {
    title: 'Blog',
    type: 'mega',
    icon: '✍️',
    showInMain: true,
    items: BLOG_LINKS
  },
  { title: 'About Us', href: 'about.html', icon: '👥', showInMain: false },
  { title: 'Client Stories', href: 'previous-clients.html', icon: '⭐', showInMain: false },
  { title: 'Contact', href: 'contact.html', icon: '📬', showInMain: false }
];

const BLOG_DROPDOWN_HTML = `
  <div class="nav__dropdown-menu nav__dropdown-menu--mega" style="width: 90vw; left: 50%; padding: 10px; overflow-x: auto; overflow-y: hidden;">
    <div style="display: grid; grid-template-rows: repeat(2, 1fr); grid-auto-flow: column; gap: 20px; min-width: max-content; padding-bottom: 5px;">
      ${BLOG_LINKS.map(blog => `
        <a href="pages/detail.html?type=blog&page=${blog.id}" class="nav__dropdown-item" style="width: 240px; flex-shrink: 0; display: flex; align-items: flex-start; gap: 12px; border-right: 1px solid var(--slate-100); padding-right: 15px;">
          <div class="nav__dropdown-item-icon" style="margin-bottom: 0; flex-shrink: 0;">${blog.icon}</div>
          <div>
            <div style="font-weight:700;color:var(--slate-800);font-size:.82rem;margin-bottom:2px">${blog.title}</div>
            <div style="font-size:.75rem;color:var(--text-muted);line-height:1.4">${blog.desc}</div>
          </div>
        </a>
      `).join('')}
    </div>
  </div>
`;

const NAV_HTML = `
<nav class="nav" id="mainNav">
  <div class="container">
    <div class="nav__inner">
      <a href="index.html" class="nav__logo">
           <img src="logo.png" style='height:40px;'/>
        <span>Advaith <em style="font-style:italic;font-family:var(--font-accent)">Homes</em></span>
      </a>

      <ul class="nav__menu">
        ${MAIN_NAV.map((nav, index) => {
  const priorityClass = `nav__item-p${index + 1}`;
  if (nav.type === 'dropdown') {
    return `
              <li class="nav__dropdown ${priorityClass}">
                <button class="nav__link nav__dropdown-toggle">
                  ${nav.title}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                <div class="nav__dropdown-menu">
                  ${nav.items.map(item => `
                    <a href="pages/${item.id}" class="nav__dropdown-item" ${item.highlight ? 'style="background: var(--bg-alt); border-radius: 8px;"' : ''}>
                      <div class="nav__dropdown-item-icon" ${item.highlight ? 'style="background: var(--accent); color: white;"' : ''}>${item.icon}</div>
                      <div>
                        <div style="font-weight:${item.highlight ? '700' : '600'};color:${item.highlight ? 'var(--accent)' : 'var(--slate-800)'};font-size:.85rem;${item.desc.length > 25 ? 'width: max-content;' : ''}">${item.title}</div>
                        <div style="font-size:.78rem;color:var(--text-muted);margin-top:2px">${item.desc}</div>
                      </div>
                    </a>
                  `).join('')}
                </div>
              </li>
            `;
  } else if (nav.type === 'mega') {
    return `
              <li class="nav__dropdown ${priorityClass}">
                <button class="nav__link nav__dropdown-toggle">
                  ${nav.title}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                ${BLOG_DROPDOWN_HTML}
              </li>
            `;
  } else {
    return `<li class="${priorityClass}"><a href="${nav.href}" class="nav__link" data-page="${nav.title.toLowerCase().replace(/ /g, '')}">${nav.title}</a></li>`;
  }
}).join('')}

        <!-- "More" Dropdown (Auto-Handles Overflow) -->
        <li class="nav__dropdown nav__item-more-trigger">
          <button class="nav__link nav__dropdown-toggle" style="color: var(--accent); font-weight: 700;">
            More
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="nav__dropdown-menu" style="min-width: 220px;">
            ${MAIN_NAV.map((nav, index) => `
              <a href="${nav.href || '#'}" class="nav__dropdown-item nav__more-item-${index + 1}" style="padding: 12px 16px;">
                <span style="margin-right: 10px;">${nav.icon}</span> ${nav.title}
              </a>
            `).join('')}
          </div>
        </li>
      </ul>

      <div class="nav__actions">
        <a href="tel:+447747223762" class="btn btn-secondary btn-sm">📞 Call Us</a>
        <a href="free-consultation.html" class="btn btn-primary btn-sm">Free Consultation</a>
        <button class="nav__hamburger" id="hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </div>
</nav>

<div class="nav__mobile" id="mobileNav">
  ${MAIN_NAV.map(nav => {
  if (nav.type === 'dropdown' || nav.type === 'mega') {
    return `
        <details class="nav__mobile-details">
          <summary class="nav__mobile-summary">${nav.icon} ${nav.title} <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg></summary>
          <div class="nav__mobile-sub-menu">
            ${nav.items.map(item => {
      const href = nav.type === 'mega' ? `pages/detail.html?type=blog&page=${item.id}` : `pages/${item.id}`;
      return `<a href="${href}" class="nav__mobile-link" ${item.highlight ? 'style="color: var(--accent); font-weight: 700;"' : ''}>${item.icon} ${item.title}</a>`;
    }).join('')}
            ${nav.title === 'Buying Guides' ? '<a href="free-consultation.html" class="nav__mobile-link">☎️ Free Consultation Guide</a>' : ''}
          </div>
        </details>
      `;
  } else {
    return `<a href="${nav.href}" class="nav__mobile-link">${nav.icon} ${nav.title}</a>`;
  }
}).join('')}
  <div style="padding:16px;">
    <a href="free-consultation.html" class="btn btn-primary" style="width:100%;justify-content:center">Book Free Consultation</a>
  </div>
</div>

<style>
.nav__mobile-details { border-bottom: 1px solid rgba(0,0,0,0.05); }
.nav__mobile-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  font-weight: 600;
  color: var(--slate-700);
  cursor: pointer;
  list-style: none;
}
.nav__mobile-summary::-webkit-details-marker { display: none; }
.nav__mobile-summary svg { transition: transform 0.3s ease; }
.nav__mobile-details[open] .nav__mobile-summary svg { transform: rotate(180deg); }
.nav__mobile-sub-menu { background: rgba(0,0,0,0.02); padding-left: 15px; padding-bottom: 5px; }
</style>
`;

const FOOTER_HTML = `
<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div>
        <a href="index.html" class="nav__logo" style="margin-bottom:0">
          <div class="nav__logo-mark">AH</div>
          <span style="color:white;font-size:1.4rem">Advaith <em style="font-style:italic;font-family:var(--font-accent)">Homes</em></span>
        </a>
        <p class="footer__brand-desc">
          The UK's dedicated buyer's agent — we work exclusively for you, not the seller.
          Saving you time, stress, and thousands of pounds on your most important purchase.
        </p>
        <div class="footer__badge">🇬🇧 Proudly serving UK home buyers</div>
        <div class="footer__socials" style="margin-top:16px">
          <div class="footer__social">📘</div>
          <div class="footer__social">🐦</div>
          <div class="footer__social">📸</div>
          <div class="footer__social">▶️</div>
          <div class="footer__social">💼</div>
        </div>
      </div>

      <div>
        <div class="footer__col-title">Buying Guides</div>
        <div class="footer__links">
          ${MAIN_NAV.find(n => n.title === 'Buying Guides').items.map(guide => `
            <a href="pages/${guide.id}" class="footer__link" ${guide.highlight ? 'style="color: var(--client-color-100); font-weight: 700;"' : ''}>${guide.title}</a>
          `).join('')}
          <a href="free-consultation.html" class="footer__link">Free Consultation Guide</a>
        </div>
      </div>

      <div>
        <div class="footer__col-title">Company</div>
        <div class="footer__links">
          ${MAIN_NAV.filter(n => n.type !== 'dropdown' && n.type !== 'mega').map(n => `
            <a href="${n.href}" class="footer__link">${n.title}</a>
          `).join('')}
          <a href="pages/privacy-policy.html" class="footer__link">Privacy Policy</a>
          <a href="pages/terms.html" class="footer__link">Terms & Conditions</a>
          <a href="pages/refund-policy.html" class="footer__link">Refund Policy</a>
        </div>
      </div>

      <div>
        <div class="footer__col-title">Get In Touch</div>
        <div class="footer__contact-item">
          <span class="footer__contact-icon">📞</span>
          <div>
            <div style="color:white;font-weight:600">+44 774 722 3762</div>
            <div style="font-size:.78rem;margin-top:2px">Mon–Sat, 9am–6pm</div>
          </div>
        </div>
        <div class="footer__contact-item">
          <span class="footer__contact-icon">✉️</span>
          <div>
            <div style="color:white;font-weight:600">contact@advaithhomes.co.uk</div>
            <div style="font-size:.78rem;margin-top:2px">We reply within 2 hours</div>
          </div>
        </div>
        <div class="footer__contact-item">
          <span class="footer__contact-icon">📍</span>
          <div>
            <div style="color:white;font-weight:600">London & Nationwide</div>
            <div style="font-size:.78rem;margin-top:2px">Covering all of England & Wales</div>
          </div>
        </div>
        <div style="margin-top:20px">
          <a href="free-consultation.html" class="btn btn-gold btn-sm" style="width:100%;justify-content:center">
            Book Free Consultation →
          </a>
        </div>
      </div>
    </div>

    <div class="footer__bottom">
      <div style="font-size:.8rem">© 2026 Advaith Homes. All rights reserved.</div>
    </div>
  </div>
</footer>
`;

// ── Inject shared components ─────────────────
function initComponents() {
  const isPagesDir = window.location.pathname.includes('/pages/');
  const rootPrefix = isPagesDir ? '../' : '';

  let finalNav = NAV_HTML;
  let finalFooter = FOOTER_HTML;

  if (isPagesDir) {
    // Fix top-level links (e.g., index.html -> ../index.html)
    // Only if they don't already start with http, #, or ../
    finalNav = finalNav.replace(/href="(?!(http|#|\.\.\/))([a-zA-Z0-9-]+\.html)(\?[^"]*)?"/g, 'href="../$2$3"');

    // Fix pages links (e.g., pages/detail.html -> detail.html)
    finalNav = finalNav.replace(/href="pages\/([a-zA-Z0-9-]+\.html)(\?[^"]*)?"/g, 'href="$1$2"');

    finalNav = finalNav.replace(/src="logo\.png"/g, 'src="../logo.png"');

    finalFooter = finalFooter.replace(/href="(?!(http|#|\.\.\/))([a-zA-Z0-9-]+\.html)(\?[^"]*)?"/g, 'href="../$2$3"');
    finalFooter = finalFooter.replace(/href="pages\/([a-zA-Z0-9-]+\.html)(\?[^"]*)?"/g, 'href="$1$2"');
  }

  // Nav
  const navTarget = document.getElementById('nav-placeholder');
  if (navTarget) navTarget.innerHTML = finalNav;

  let favicon = document.querySelector('link[rel="icon"]');
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = rootPrefix + 'logo.png';
    document.head.appendChild(favicon);
  }

  // Footer
  const footerTarget = document.getElementById('footer-placeholder');
  if (footerTarget) footerTarget.innerHTML = finalFooter;

  // WhatsApp Floating Button
  let waFloat = document.querySelector('.floating-chat');
  if (!waFloat) {
    waFloat = document.createElement('a');
    waFloat.className = 'floating-chat';
    waFloat.href = 'https://wa.me/447747223762?text=Hi%20Advaith%20Homes,%20I%20would%20like%20to%20learn%20more%20about%20your%20services...';
    waFloat.target = '_blank';
    waFloat.rel = 'noopener noreferrer';
    waFloat.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
      </svg>
      <span>Chat with us</span>`;
    document.body.appendChild(waFloat);
  }

  // Scroll effect
  const nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // Hamburger
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
  }

  // Active page
  const page = document.body.dataset.page;
  document.querySelectorAll(`[data-page="${page}"]`).forEach(el => el.classList.add('active'));

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const revealOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          // Add visible class
          e.target.classList.add('visible');

          // Handle delays if specified
          if (e.target.classList.contains('reveal-delay-1')) e.target.style.transitionDelay = '0.2s';
          if (e.target.classList.contains('reveal-delay-2')) e.target.style.transitionDelay = '0.4s';
          if (e.target.classList.contains('reveal-delay-3')) e.target.style.transitionDelay = '0.6s';

          obs.unobserve(e.target);
        }
      });
    }, revealOptions);

    reveals.forEach(el => {
      // Check if already in viewport
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add('visible');
      } else {
        obs.observe(el);
      }
    });
  }

  // FAQ
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // Counter animation
  document.querySelectorAll('.count-up').forEach(el => {
    const target = +el.dataset.target;
    const obs2 = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        let current = 0;
        const inc = target / 60;
        const t = setInterval(() => {
          current = Math.min(current + inc, target);
          el.textContent = Math.floor(current).toLocaleString();
          if (current >= target) clearInterval(t);
        }, 16);
        obs2.unobserve(el);
      }
    });
    obs2.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', initComponents);

// ── News Ticker Close ─────────────────────────
(function () {
  const ticker = document.getElementById('news-ticker');
  const closeBtn = document.getElementById('newsTickerClose');
  if (!ticker || !closeBtn) return;
  closeBtn.addEventListener('click', () => {
    ticker.classList.add('hidden');
    document.body.style.paddingTop = '';
  });
})();
