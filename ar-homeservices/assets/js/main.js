/**
 * AR Home Services — Main JavaScript
 * Modules: navHandler, cacheHandler, animationInit, toastNotification, formHandler, apiHandler
 */

'use strict';

/* ══════════════════════════════════════════════
   CACHE HANDLER
   Stores API responses for 20 min in localStorage
══════════════════════════════════════════════ */
const cacheHandler = {
  CACHE_KEY: 'visitor_stats',
  TTL: 20 * 60 * 1000, // 20 minutes

  get() {
    try {
      const raw = localStorage.getItem(this.CACHE_KEY);
      if (!raw) return null;
      const cached = JSON.parse(raw);
      if (Date.now() - cached.timestamp > this.TTL) {
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }
      return cached.data;
    } catch { return null; }
  },

  set(data) {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch {}
  },

  clear() {
    localStorage.removeItem(this.CACHE_KEY);
  }
};

/* ══════════════════════════════════════════════
   API HANDLER
   Handles API calls with cache support
══════════════════════════════════════════════ */
const apiHandler = {
  CONTACT_API: 'https://script.google.com/macros/s/AKfycbzl717Y-4DxUNX1p-sK6bmb0_yUVCtVSWH_HDMqNWlGJF7_E7YjT9WoV8ql8LxV00Q6Pg/exec',

  async fetchVisitorStats() {
    const cached = cacheHandler.get();
    if (cached) {
      console.log('[Cache] Using cached visitor stats');
      return cached;
    }
    // Simulate visitor stats since we don't have a real endpoint
    const stats = { visitors: 1240, projects: 850, satisfaction: 98 };
    cacheHandler.set(stats);
    return stats;
  },

  async submitLead({ name, email, phone, query }) {
    const response = await fetch(this.CONTACT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'add_lead', name, email, phone, query })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json().catch(() => ({ success: true }));
  }
};

/* ══════════════════════════════════════════════
   TOAST NOTIFICATION
══════════════════════════════════════════════ */
const toastNotification = {
  container: null,

  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },

  show(message, type = 'info', duration = 4000) {
    if (!this.container) this.init();

    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span style="font-weight:700;font-size:1rem;">${icons[type] || icons.info}</span><span>${message}</span>`;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 320);
    }, duration);
  }
};

/* ══════════════════════════════════════════════
   ANIMATION INIT
   Intersection Observer for scroll animations
══════════════════════════════════════════════ */
const animationInit = {
  observer: null,

  init() {
    const targets = document.querySelectorAll('.fade-up, .fade-left, .fade-right');
    if (!targets.length) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(t => this.observer.observe(t));
  },

  countUp(el, target, duration = 1800) {
    const start = performance.now();
    const suffix = el.dataset.suffix || '';
    const update = (now) => {
      const elapsed = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (elapsed < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  },

  initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          this.countUp(el, parseInt(el.dataset.count), 1800);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => obs.observe(c));
  }
};

/* ══════════════════════════════════════════════
   FORM HANDLER
══════════════════════════════════════════════ */
const formHandler = {
  validators: {
    name:    v => v.trim().length >= 2 ? null : 'Please enter your full name',
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Enter a valid email address',
    phone:   v => /^[\d\s\+\-\(\)]{8,15}$/.test(v.trim()) ? null : 'Enter a valid phone number',
    query:   v => v.trim().length >= 10 ? null : 'Please describe your requirement (min 10 chars)'
  },

  validate(form) {
    let valid = true;
    form.querySelectorAll('[data-validate]').forEach(field => {
      const key = field.dataset.validate;
      const error = this.validators[key]?.(field.value);
      const errEl = form.querySelector(`[data-error="${key}"]`);
      if (error) {
        field.classList.add('error');
        if (errEl) errEl.textContent = error;
        valid = false;
      } else {
        field.classList.remove('error');
        if (errEl) errEl.textContent = '';
      }
    });
    return valid;
  },

  init(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Live validation on blur
    form.querySelectorAll('[data-validate]').forEach(field => {
      field.addEventListener('blur', () => {
        const key = field.dataset.validate;
        const error = this.validators[key]?.(field.value);
        const errEl = form.querySelector(`[data-error="${key}"]`);
        if (error) { field.classList.add('error'); if (errEl) errEl.textContent = error; }
        else       { field.classList.remove('error'); if (errEl) errEl.textContent = ''; }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!this.validate(form)) return;

      const submitBtn = form.querySelector('[type="submit"]');
      const successEl = form.querySelector('.success-message');

      const name  = form.querySelector('#name')?.value  || form.querySelector('[name="name"]')?.value;
      const email = form.querySelector('#email')?.value || form.querySelector('[name="email"]')?.value;
      const phone = form.querySelector('#phone')?.value || form.querySelector('[name="phone"]')?.value;
      const query = form.querySelector('#query')?.value || form.querySelector('[name="query"]')?.value;

      submitBtn.disabled = true;
      submitBtn.classList.add('loading');

      try {
        await apiHandler.submitLead({ name, email, phone, query });
        if (successEl) {
          form.querySelector('.form-fields').style.display = 'none';
          successEl.classList.add('show');
        }
        toastNotification.show('Thank you! We\'ll contact you shortly.', 'success');
        setTimeout(() => {
          if (successEl) {
            successEl.classList.remove('show');
            form.querySelector('.form-fields').style.display = '';
          }
          form.reset();
        }, 5000);
      } catch (err) {
        console.error('Form submission error:', err);
        toastNotification.show('Something went wrong. Please call us directly.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
      }
    });
  }
};

/* ══════════════════════════════════════════════
   NAVBAR HANDLER
══════════════════════════════════════════════ */
const navHandler = {
  init() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileClose = document.getElementById('mobile-close');

    if (!navbar) return;

    const updateNav = () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
        navbar.classList.remove('transparent');
      } else {
        navbar.classList.remove('scrolled');
        navbar.classList.add('transparent');
      }
    };

    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });

    // Mobile menu
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    }
    const closeMenu = () => {
      if (mobileMenu) {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    };
    if (mobileClose) mobileClose.addEventListener('click', closeMenu);
    if (mobileMenu)  {
      mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    }

    // Active link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
      const href = a.getAttribute('href')?.split('/').pop();
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }
};

/* ══════════════════════════════════════════════
   SMOOTH SCROLL for anchor links
══════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ══════════════════════════════════════════════
   INIT ALL
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  toastNotification.init();
  navHandler.init();
  animationInit.init();
  animationInit.initCounters();
  formHandler.init('contact-form');

  // Load visitor stats with cache
  if (document.getElementById('hero')) {
    apiHandler.fetchVisitorStats().then(stats => {
      console.log('[Stats] Loaded:', stats);
    });
  }
});
