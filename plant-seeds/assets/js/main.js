/* =========================================
   AR Plants & Seeds — Main JS
   main.js
   ========================================= */

'use strict';

/* ---- Navbar Module ---- */
const navbarInit = () => {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navToggle?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close on link click (mobile)
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
};

/* ---- Reveal Animation Module ---- */
const animationInit = () => {
  const items = document.querySelectorAll('.reveal, .reveal-item');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(item => observer.observe(item));
};

/* ---- Toast Notification ---- */
const toastNotification = (msg, duration = 3500) => {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
};

/* ---- Cache Handler ---- */
const cacheHandler = {
  CACHE_KEY: 'visitor_stats',
  TTL: 20 * 60 * 1000, // 20 minutes

  get() {
    try {
      const raw = localStorage.getItem(this.CACHE_KEY);
      if (!raw) return null;
      const { data, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp > this.TTL) {
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }
      return data;
    } catch { return null; }
  },

  set(data) {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    } catch { /* storage full */ }
  }
};

/* ---- API Handler ---- */
const apiHandler = async (url, options = {}) => {
  try {
    const cached = cacheHandler.get();
    if (cached) return cached;

    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    cacheHandler.set(data);
    return data;
  } catch (err) {
    console.warn('[apiHandler]', err.message);
    return null;
  }
};

/* ---- Form Handler ---- */
const API_URL = 'https://script.google.com/macros/s/AKfycbzl717Y-4DxUNX1p-sK6bmb0_yUVCtVSWH_HDMqNWlGJF7_E7YjT9WoV8ql8LxV00Q6Pg/exec';

const formHandler = () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameEl    = form.querySelector('[name="name"]');
  const emailEl   = form.querySelector('[name="email"]');
  const phoneEl   = form.querySelector('[name="phone"]');
  const queryEl   = form.querySelector('[name="query"]');
  const submitBtn = form.querySelector('.form-submit');
  const spinner   = form.querySelector('.spinner');
  const successEl = document.getElementById('formSuccess');

  const setError = (el, msg) => {
    const wrap = el.closest('.form-group');
    wrap.querySelector('.field-error').textContent = msg;
    el.classList.add('error');
  };
  const clearErrors = () => {
    form.querySelectorAll('.field-error').forEach(e => e.textContent = '');
    form.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
  };

  const validate = () => {
    let valid = true;
    if (!nameEl.value.trim() || nameEl.value.trim().length < 2) {
      setError(nameEl, 'Please enter your full name.'); valid = false;
    }
    if (!/^\S+@\S+\.\S+$/.test(emailEl.value.trim())) {
      setError(emailEl, 'Please enter a valid email address.'); valid = false;
    }
    if (!/^\+?[\d\s\-]{8,}$/.test(phoneEl.value.trim())) {
      setError(phoneEl, 'Please enter a valid phone number.'); valid = false;
    }
    if (!queryEl.value.trim() || queryEl.value.trim().length < 10) {
      setError(queryEl, 'Please describe your query (min 10 characters).'); valid = false;
    }
    return valid;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    if (!validate()) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    if (spinner) spinner.style.display = 'inline-block';

    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_lead',
          name:  nameEl.value.trim(),
          email: emailEl.value.trim(),
          phone: phoneEl.value.trim(),
          query: queryEl.value.trim()
        })
      });

      form.reset();
      form.style.display = 'none';
      if (successEl) successEl.style.display = 'flex';
      toastNotification('✅ Message sent! We\'ll be in touch shortly.');
    } catch {
      toastNotification('⚠️ Something went wrong. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    } finally {
      if (spinner) spinner.style.display = 'none';
    }
  });
};

/* ---- Portfolio Filter ---- */
const portfolioFilter = () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.portfolio-item');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      items.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
          item.style.display = match ? 'block' : 'none';
          if (match) {
            requestAnimationFrame(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            });
          }
        }, 150);
      });
    });
  });
};

/* ---- Lightbox ---- */
const lightboxInit = () => {
  const items = document.querySelectorAll('.gallery-item img');
  if (!items.length) return;

  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.innerHTML = `
    <div class="lb-backdrop"></div>
    <div class="lb-box">
      <img src="" alt="" id="lbImg"/>
      <button class="lb-close">✕</button>
    </div>`;
  document.body.appendChild(lb);

  const lbImg = lb.querySelector('#lbImg');
  const open  = (src, alt) => { lbImg.src = src; lbImg.alt = alt; lb.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };

  items.forEach(img => img.closest('.gallery-item').addEventListener('click', () => open(img.src, img.alt)));
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-backdrop').addEventListener('click', close);
  document.addEventListener('keydown', e => e.key === 'Escape' && close());
};

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  navbarInit();
  animationInit();
  formHandler();
  portfolioFilter();
  lightboxInit();
});
