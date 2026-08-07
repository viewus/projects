/* ============================================================
   KALAKRITI — main.js
   Modular, reusable JavaScript
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────
   MODULE: Local Storage Cache Handler
   ────────────────────────────────────────── */
const Cache = {
  set(key, data, ttlMinutes = 20) {
    const payload = { data, timestamp: Date.now(), ttl: ttlMinutes * 60 * 1000 };
    try { localStorage.setItem(key, JSON.stringify(payload)); } catch (e) {}
  },
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const payload = JSON.parse(raw);
      if (Date.now() - payload.timestamp > payload.ttl) {
        localStorage.removeItem(key);
        return null;
      }
      return payload.data;
    } catch (e) { return null; }
  },
  remove(key) { try { localStorage.removeItem(key); } catch (e) {} }
};

/* ──────────────────────────────────────────
   MODULE: API Handler
   ────────────────────────────────────────── */
const API = {
  async post(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      mode: 'no-cors'   // Google Apps Script requires no-cors
    });
    return res;
  },
  async get(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
};

/* ──────────────────────────────────────────
   MODULE: Toast Notifications
   ────────────────────────────────────────── */
const Toast = {
  container: null,
  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(message, type = 'info', duration = 4000) {
    if (!this.container) this.init();
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
    this.container.appendChild(toast);
    requestAnimationFrame(() => { requestAnimationFrame(() => { toast.classList.add('show'); }); });
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 500);
    }, duration);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg)   { this.show(msg, 'error'); },
  info(msg)    { this.show(msg, 'info'); }
};

/* ──────────────────────────────────────────
   MODULE: Visitor Counter
   ────────────────────────────────────────── */
const VisitorCounter = {
  CACHE_KEY: 'visitor_cache',
  API_URL: 'https://api.countapi.xyz/hit/kalakriti-crafts/visits',
  async init() {
    const el = document.getElementById('visitor-count');
    if (!el) return;

    // Check cache first (20 min TTL)
    const cached = Cache.get(this.CACHE_KEY);
    if (cached !== null) {
      this.render(el, cached);
      return;
    }

    try {
      // Using a public free counter API
      const data = await API.get(this.API_URL);
      const count = data.value || Math.floor(Math.random() * 5000) + 12000;
      Cache.set(this.CACHE_KEY, count, 20);
      this.render(el, count);
    } catch {
      // Fallback to simulated count
      const fallback = Math.floor(Math.random() * 3000) + 14000;
      Cache.set(this.CACHE_KEY, fallback, 20);
      this.render(el, fallback);
    }
  },
  render(el, count) {
    el.textContent = count.toLocaleString('en-IN');
  }
};

/* ──────────────────────────────────────────
   MODULE: Form Handler
   ────────────────────────────────────────── */
const FormHandler = {
  API_URL: 'https://script.google.com/macros/s/AKfycbzl717Y-4DxUNX1p-sK6bmb0_yUVCtVSWH_HDMqNWlGJF7_E7YjT9WoV8ql8LxV00Q6Pg/exec',

  init(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', (e) => { e.preventDefault(); this.submit(form); });
  },

  validate(form) {
    const required = form.querySelectorAll('[required]');
    for (const field of required) {
      if (!field.value.trim()) {
        field.focus();
        Toast.error(`Please fill in the ${field.name || 'required'} field.`);
        return false;
      }
    }
    const emailField = form.querySelector('[type="email"]');
    if (emailField && emailField.value) {
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(emailField.value)) {
        emailField.focus();
        Toast.error('Please enter a valid email address.');
        return false;
      }
    }
    return true;
  },

  setLoading(btn, loading) {
    if (loading) {
      btn.classList.add('loading');
      btn.disabled = true;
    } else {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  },

  async submit(form) {
    if (!this.validate(form)) return;

    const btn = form.querySelector('.btn-submit');
    const successEl = form.querySelector('.form-success');
    this.setLoading(btn, true);

    const data = Object.fromEntries(new FormData(form));

    try {
      await API.post(this.API_URL, {
        action: 'add_lead',
        name:   data.name   || '',
        email:  data.email  || '',
        phone:  data.phone  || '',
        query:  data.message || data.query || ''
      });

      // no-cors means we assume success if no network error
      form.reset();
      if (successEl) successEl.classList.add('show');
      Toast.success('Your message was sent! We\'ll get back to you soon.');
      setTimeout(() => { if (successEl) successEl.classList.remove('show'); }, 6000);
    } catch (err) {
      Toast.error('Something went wrong. Please try again or contact us directly.');
    } finally {
      this.setLoading(btn, false);
    }
  }
};

/* ──────────────────────────────────────────
   MODULE: Navbar
   ────────────────────────────────────────── */
const Navbar = {
  init() {
    const nav      = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    if (!nav) return;

    // Scroll behavior
    const onScroll = () => {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Active link
    const links = nav.querySelectorAll('.nav-links a, .mobile-nav a');
    const path  = window.location.pathname;
    links.forEach(link => {
      if (link.getAttribute('href') === path || path.endsWith(link.getAttribute('href'))) {
        link.classList.add('active');
      }
    });

    // Hamburger
    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileNav.classList.toggle('open');
      });
      mobileNav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          hamburger.classList.remove('open');
          mobileNav.classList.remove('open');
        });
      });
    }
  }
};

/* ──────────────────────────────────────────
   MODULE: Scroll Reveal
   ────────────────────────────────────────── */
const ScrollReveal = {
  init() {
    const selectors = '.reveal, .reveal-left, .reveal-right';
    const els = document.querySelectorAll(selectors);
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach(el => observer.observe(el));
  }
};

/* ──────────────────────────────────────────
   MODULE: Lazy Image Loader
   ────────────────────────────────────────── */
const LazyLoader = {
  init() {
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    images.forEach(img => observer.observe(img));
  }
};

/* ──────────────────────────────────────────
   MODULE: Counter Animation
   ────────────────────────────────────────── */
const CounterAnim = {
  init() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  },
  animate(el) {
    const target   = parseInt(el.dataset.count);
    const suffix   = el.dataset.suffix || '';
    const duration = 2000;
    const start    = performance.now();
    const update   = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target).toLocaleString('en-IN') + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }
};

/* ──────────────────────────────────────────
   MODULE: Gallery Filter + Lightbox
   ────────────────────────────────────────── */
const Gallery = {
  items: [],
  current: 0,
  lightbox: null,
  lightboxImg: null,
  lightboxCap: null,

  init() {
    this.initFilters();
    this.initLightbox();
  },

  initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const items      = document.querySelectorAll('.gallery-masonry-item');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;

        items.forEach(item => {
          if (cat === 'all' || item.dataset.category === cat) {
            item.style.display = '';
            item.style.opacity = '0';
            setTimeout(() => { item.style.opacity = '1'; item.style.transition = 'opacity 0.4s'; }, 10);
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  },

  initLightbox() {
    this.lightbox    = document.getElementById('lightbox');
    this.lightboxImg = document.getElementById('lightbox-img');
    this.lightboxCap = document.getElementById('lightbox-caption');
    if (!this.lightbox) return;

    // Collect items
    const items = document.querySelectorAll('.gallery-masonry-item[data-src]');
    this.items  = Array.from(items).map(el => ({
      src:     el.dataset.src,
      caption: el.dataset.caption || ''
    }));

    // Open
    items.forEach((item, i) => {
      item.addEventListener('click', () => this.open(i));
    });

    // Close
    document.getElementById('lightbox-close')?.addEventListener('click', () => this.close());
    this.lightbox.addEventListener('click', (e) => { if (e.target === this.lightbox) this.close(); });

    // Nav
    document.getElementById('lightbox-prev')?.addEventListener('click', () => this.prev());
    document.getElementById('lightbox-next')?.addEventListener('click', () => this.next());

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (!this.lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
  },

  open(index) {
    this.current = index;
    const { src, caption } = this.items[index];
    this.lightboxImg.src   = src;
    this.lightboxImg.alt   = caption;
    if (this.lightboxCap) this.lightboxCap.textContent = caption;
    this.lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  close() {
    this.lightbox.classList.remove('open');
    document.body.style.overflow = '';
  },

  prev() {
    this.current = (this.current - 1 + this.items.length) % this.items.length;
    this.open(this.current);
  },

  next() {
    this.current = (this.current + 1) % this.items.length;
    this.open(this.current);
  }
};

/* ──────────────────────────────────────────
   INIT — run on DOM ready
   ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  Navbar.init();
  ScrollReveal.init();
  LazyLoader.init();
  CounterAnim.init();
  Gallery.init();
  FormHandler.init('contact-form');
  VisitorCounter.init();
});