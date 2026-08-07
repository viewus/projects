/**
 * ARTISANA — Main JavaScript
 * Modules: navHandler, cacheHandler, apiHandler, formHandler,
 *          toastNotification, animationInit, chartInit, galleryInit, lightboxInit
 */

'use strict';

/* ══════════════════════════════════════════════════════════════
   ░░ CHART DATA — Change variables below to update all charts ░░
   ══════════════════════════════════════════════════════════════ */

/**
 * DATA VARIABLE — Craft category popularity (bar chart)
 * @type {Array<{name: string, value: number}>}
 */
const CHART_CATEGORY_DATA = [
  { name: 'Wooden Crafts',   value: 420 },
  { name: 'Terracotta',      value: 310 },
  { name: 'Textiles',        value: 280 },
  { name: 'Metalwork',       value: 195 },
  { name: 'Paintings',       value: 160 },
  { name: 'Lacquerware',     value: 130 },
];

/**
 * DATA VARIABLE — Monthly order trends (line chart)
 * @type {{ months: string[], orders: number[], revenue: number[] }}
 */
const CHART_ORDERS_DATA = {
  months:  ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  orders:  [42, 55, 63, 78, 91, 88, 102, 115, 97, 130, 148, 160],
  revenue: [210, 270, 315, 390, 455, 440, 510, 575, 485, 650, 740, 800],
};

/**
 * DATA VARIABLE — Service distribution (pie/donut chart)
 * @type {Array<{name: string, value: number}>}
 */
const CHART_DISTRIBUTION_DATA = [
  { name: 'Custom Crafts',      value: 38 },
  { name: 'Corporate Gifting',  value: 32 },
  { name: 'Interior Decor',     value: 18 },
  { name: 'Bulk Orders',        value: 12 },
];

/**
 * DATA VARIABLE — Quality radar chart indicators & values
 * @type {{ indicators: Array<{name:string, max:number}>, values: number[] }}
 */
const CHART_RADAR_DATA = {
  indicators: [
    { name: 'Craftsmanship', max: 100 },
    { name: 'Materials',     max: 100 },
    { name: 'Delivery',      max: 100 },
    { name: 'Packaging',     max: 100 },
    { name: 'Support',       max: 100 },
    { name: 'Value',         max: 100 },
  ],
  values: [97, 95, 88, 92, 90, 86],
};

/* ════════════════════════════════════════════════════════════
   FORM API
   ════════════════════════════════════════════════════════════ */
const API_URL = 'https://script.google.com/macros/s/AKfycbzl717Y-4DxUNX1p-sK6bmb0_yUVCtVSWH_HDMqNWlGJF7_E7YjT9WoV8ql8LxV00Q6Pg/exec';

/* ════════════════════════════════════════════════════════════
   MODULE: toastNotification
   ════════════════════════════════════════════════════════════ */
const toastNotification = {
  /**
   * Show a toast message
   * @param {string} message
   * @param {'success'|'error'} type
   */
  show(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icon   = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    const toast  = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `<i class="fas ${icon}" aria-hidden="true"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }
};

/* ════════════════════════════════════════════════════════════
   MODULE: cacheHandler
   ════════════════════════════════════════════════════════════ */
const cacheHandler = {
  CACHE_KEY:    'visitor_stats',
  CACHE_TTL_MS: 20 * 60 * 1000, // 20 minutes

  /** Store data in localStorage */
  set(data) {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) {
      console.warn('[cacheHandler] Could not write to localStorage:', e);
    }
  },

  /**
   * Retrieve cached data if still valid
   * @returns {any|null}
   */
  get() {
    try {
      const raw = localStorage.getItem(this.CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < this.CACHE_TTL_MS) return parsed.data;
      localStorage.removeItem(this.CACHE_KEY);
      return null;
    } catch (e) {
      return null;
    }
  }
};

/* ════════════════════════════════════════════════════════════
   MODULE: apiHandler
   Calls API once per 20 min, caches result
   ════════════════════════════════════════════════════════════ */
const apiHandler = {
  async fetchVisitorStats() {
    const cached = cacheHandler.get();
    if (cached) {
      console.info('[apiHandler] Using cached visitor stats');
      return cached;
    }
    try {
      const res  = await fetch(API_URL + '?action=stats');
      const data = await res.json();
      cacheHandler.set(data);
      console.info('[apiHandler] Fresh visitor stats fetched & cached');
      return data;
    } catch (e) {
      console.error('[apiHandler] Fetch error:', e);
      return null;
    }
  }
};

/* ════════════════════════════════════════════════════════════
   MODULE: formHandler
   ════════════════════════════════════════════════════════════ */
const formHandler = {
  init() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Real-time validation feedback
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
    });
  },

  /** Validate a single field */
  validateField(field) {
    const errorEl = document.getElementById(field.name + 'Error');
    let   error   = '';

    if (field.required && !field.value.trim()) {
      error = 'This field is required.';
    } else if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      error = 'Please enter a valid email address.';
    } else if (field.name === 'message' && field.value.trim().length < 10) {
      error = 'Message must be at least 10 characters.';
    }

    if (errorEl) errorEl.textContent = error;
    field.classList.toggle('error', !!error);
    return !error;
  },

  /** Validate entire form */
  validateForm(form) {
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!this.validateField(field)) valid = false;
    });
    return valid;
  },

  async handleSubmit(e) {
    e.preventDefault();
    const form     = e.target;
    const btn      = document.getElementById('submitBtn');
    const btnText  = btn.querySelector('.btn-text');
    const spinner  = btn.querySelector('.btn-spinner');
    const successEl = document.getElementById('formSuccess');

    if (!this.validateForm(form)) {
      toastNotification.show('Please fix the errors above.', 'error');
      return;
    }

    // Build payload
    const payload = {};
    new FormData(form).forEach((v, k) => { payload[k] = v; });

    // UI loading state
    btn.disabled       = true;
    btnText.textContent = 'Sending…';
    spinner.hidden     = false;

    try {
      await fetch(API_URL, {
        method: 'POST',
        mode:   'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body:   JSON.stringify(payload),
      });

      // Success UI
      form.reset();
      successEl.hidden = false;
      form.querySelectorAll('.form-group').forEach(g => g.style.display = 'none');
      btn.style.display = 'none';
      toastNotification.show('Your enquiry has been sent!', 'success');
    } catch (err) {
      console.error('[formHandler]', err);
      toastNotification.show('Something went wrong. Please try again.', 'error');
      btn.disabled       = false;
      btnText.textContent = 'Send Enquiry';
      spinner.hidden     = true;
    }
  }
};

/* ════════════════════════════════════════════════════════════
   MODULE: animationInit
   Scroll-reveal + parallax + counter + navbar
   ════════════════════════════════════════════════════════════ */
const animationInit = {
  init() {
    this.initReveal();
    this.initParallax();
    this.initNavbar();
    this.initCounters();
    this.initHamburger();
  },

  /** Intersection Observer for reveal animations */
  initReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  },

  /** Hero parallax on scroll */
  initParallax() {
    const parallax = document.getElementById('heroParallax');
    if (!parallax) return;
    const onScroll = () => {
      const y = window.scrollY;
      parallax.style.transform = `translateY(${y * 0.38}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  },

  /** Sticky navbar scroll class */
  initNavbar() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run on load
  },

  /** Animated number counters */
  initCounters() {
    const nums = document.querySelectorAll('.stat-num');
    if (!nums.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    nums.forEach(n => observer.observe(n));
  },

  animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const step     = 16;
    const steps    = Math.ceil(duration / step);
    let   current  = 0;
    const increment = target / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, step);
  },

  /** Mobile hamburger */
  initHamburger() {
    const btn  = document.getElementById('hamburger');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
      menu.setAttribute('aria-hidden', !isOpen);
    });
  }
};

/* ════════════════════════════════════════════════════════════
   MODULE: chartInit (Apache ECharts)
   ════════════════════════════════════════════════════════════ */
const chartInit = {
  /** Brand palette for charts */
  COLORS: ['#C8A96A', '#4E342E', '#8D6E63', '#E8C98A', '#6D4C41', '#BCAAA4'],

  init() {
    if (typeof echarts === 'undefined') return;
    this.renderCategoryChart();
    this.renderOrdersChart();
    this.renderDistributionChart();
    this.renderRadarChart();

    // Re-render on resize (responsive)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ['chart-category','chart-orders','chart-distribution','chart-radar'].forEach(id => {
          const instance = echarts.getInstanceByDom(document.getElementById(id));
          if (instance) instance.resize();
        });
      }, 200);
    });
  },

  /** Helper: get or create ECharts instance */
  getInstance(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    return echarts.getInstanceByDom(el) || echarts.init(el, null, { renderer: 'svg' });
  },

  /** Chart 1: Horizontal Bar — Craft Category Popularity */
  renderCategoryChart() {
    const chart = this.getInstance('chart-category');
    if (!chart) return;
    const names  = CHART_CATEGORY_DATA.map(d => d.name);
    const values = CHART_CATEGORY_DATA.map(d => d.value);
    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#4E342E', borderColor: '#C8A96A', textStyle: { color: '#fff', fontSize: 12 } },
      grid: { left: '3%', right: '8%', top: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: 'rgba(78,52,46,0.08)' } }, axisLabel: { color: '#7A6A62', fontSize: 11 } },
      yAxis: { type: 'category', data: names, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#4E342E', fontSize: 11, fontWeight: 'bold' } },
      series: [{
        type: 'bar',
        data: values,
        barMaxWidth: 28,
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
          color: (params) => ({
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [{ offset: 0, color: '#4E342E' }, { offset: 1, color: '#C8A96A' }]
          })
        },
        label: { show: true, position: 'right', color: '#7A6A62', fontSize: 11, formatter: '{c} orders' }
      }]
    });
  },

  /** Chart 2: Dual-line — Monthly Orders + Revenue */
  renderOrdersChart() {
    const chart = this.getInstance('chart-orders');
    if (!chart) return;
    chart.setOption({
      tooltip: { trigger: 'axis', backgroundColor: '#4E342E', borderColor: '#C8A96A', textStyle: { color: '#fff', fontSize: 12 } },
      legend: { data: ['Orders', 'Revenue (₹k)'], bottom: 0, textStyle: { color: '#7A6A62', fontSize: 11 } },
      grid: { left: '3%', right: '4%', top: '8%', bottom: '30px', containLabel: true },
      xAxis: { type: 'category', data: CHART_ORDERS_DATA.months, boundaryGap: false, axisLine: { lineStyle: { color: 'rgba(78,52,46,0.15)' } }, axisLabel: { color: '#7A6A62', fontSize: 10 }, axisTick: { show: false } },
      yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: 'rgba(78,52,46,0.08)' } }, axisLabel: { color: '#7A6A62', fontSize: 10 } },
      series: [
        {
          name: 'Orders',
          type: 'line',
          data: CHART_ORDERS_DATA.orders,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#4E342E', width: 2.5 },
          itemStyle: { color: '#4E342E', borderColor: '#fff', borderWidth: 2 },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(78,52,46,0.18)' }, { offset: 1, color: 'rgba(78,52,46,0)' }] } }
        },
        {
          name: 'Revenue (₹k)',
          type: 'line',
          data: CHART_ORDERS_DATA.revenue,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#C8A96A', width: 2.5 },
          itemStyle: { color: '#C8A96A', borderColor: '#fff', borderWidth: 2 },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(200,169,106,0.18)' }, { offset: 1, color: 'rgba(200,169,106,0)' }] } }
        }
      ]
    });
  },

  /** Chart 3: Donut Pie — Service Distribution */
  renderDistributionChart() {
    const chart = this.getInstance('chart-distribution');
    if (!chart) return;
    chart.setOption({
      tooltip: { trigger: 'item', backgroundColor: '#4E342E', borderColor: '#C8A96A', textStyle: { color: '#fff', fontSize: 12 }, formatter: '{b}: {c}% ({d}%)' },
      legend: { bottom: '0%', left: 'center', textStyle: { color: '#7A6A62', fontSize: 11 } },
      color: this.COLORS,
      series: [{
        name: 'Services',
        type: 'pie',
        radius: ['42%', '70%'],
        center: ['50%', '46%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 3 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold', color: '#4E342E' }, itemStyle: { shadowBlur: 14, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.15)' } },
        data: CHART_DISTRIBUTION_DATA
      }]
    });
  },

  /** Chart 4: Radar — Quality Dimensions */
  renderRadarChart() {
    const chart = this.getInstance('chart-radar');
    if (!chart) return;
    chart.setOption({
      tooltip: { backgroundColor: '#4E342E', borderColor: '#C8A96A', textStyle: { color: '#fff', fontSize: 12 } },
      radar: {
        indicator: CHART_RADAR_DATA.indicators,
        shape: 'polygon',
        center: ['50%', '50%'],
        radius: '62%',
        axisName: { color: '#4E342E', fontSize: 11, fontWeight: 'bold' },
        splitLine: { lineStyle: { color: ['rgba(200,169,106,0.12)', 'rgba(200,169,106,0.2)', 'rgba(200,169,106,0.28)', 'rgba(200,169,106,0.36)', 'rgba(200,169,106,0.44)'] } },
        splitArea: { areaStyle: { color: ['rgba(253,246,238,0.4)', 'rgba(245,233,218,0.3)'] } },
        axisLine: { lineStyle: { color: 'rgba(200,169,106,0.25)' } }
      },
      series: [{
        type: 'radar',
        data: [{
          value: CHART_RADAR_DATA.values,
          name: 'Quality Score',
          lineStyle: { color: '#C8A96A', width: 2.5 },
          areaStyle: { color: 'rgba(200,169,106,0.22)' },
          itemStyle: { color: '#C8A96A', borderColor: '#fff', borderWidth: 2 },
          symbol: 'circle',
          symbolSize: 7
        }]
      }]
    });
  }
};

/* ════════════════════════════════════════════════════════════
   MODULE: galleryInit
   Masonry filter + lightbox
   ════════════════════════════════════════════════════════════ */
const galleryInit = {
  currentIndex: 0,
  items: [],

  init() {
    this.initFilters();
    this.initLightbox();
  },

  initFilters() {
    const btns  = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.masonry-item');
    if (!btns.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        items.forEach(item => {
          const show = filter === 'all' || item.dataset.category === filter;
          item.classList.toggle('hidden', !show);
        });
      });
    });
  },

  initLightbox() {
    const grid      = document.getElementById('galleryGrid');
    const lightbox  = document.getElementById('lightbox');
    const imgEl     = document.getElementById('lightboxImg');
    const titleEl   = document.getElementById('lightboxTitle');
    const subEl     = document.getElementById('lightboxSub');
    const closeBtn  = document.getElementById('lightboxClose');
    const prevBtn   = document.getElementById('lightboxPrev');
    const nextBtn   = document.getElementById('lightboxNext');
    if (!grid || !lightbox) return;

    this.items = Array.from(grid.querySelectorAll('.masonry-item'));

    const open = (index) => {
      this.currentIndex = index;
      const item    = this.items[index];
      const img     = item.querySelector('img');
      const overlay = item.querySelector('.masonry-overlay');
      imgEl.src          = img ? img.src.replace(/w=\d+/, 'w=1200') : '';
      imgEl.alt          = img ? img.alt : '';
      titleEl.textContent = overlay ? overlay.querySelector('span').textContent : '';
      subEl.textContent   = overlay ? overlay.querySelector('small').textContent : '';
      lightbox.hidden    = false;
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      lightbox.hidden = true;
      imgEl.src = '';
      document.body.style.overflow = '';
    };

    this.items.forEach((item, i) => {
      item.addEventListener('click', () => open(i));
      item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
    });

    if (closeBtn)  closeBtn.addEventListener('click', close);
    if (prevBtn)   prevBtn.addEventListener('click', () => open((this.currentIndex - 1 + this.items.length) % this.items.length));
    if (nextBtn)   nextBtn.addEventListener('click', () => open((this.currentIndex + 1) % this.items.length));

    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape')      close();
      if (e.key === 'ArrowLeft')   open((this.currentIndex - 1 + this.items.length) % this.items.length);
      if (e.key === 'ArrowRight')  open((this.currentIndex + 1) % this.items.length);
    });
  }
};

/* ════════════════════════════════════════════════════════════
   MODULE: swiperInit
   ════════════════════════════════════════════════════════════ */
const swiperInit = {
  init() {
    if (typeof Swiper === 'undefined') return;
    const el = document.querySelector('.testimonial-swiper');
    if (!el) return;
    new Swiper('.testimonial-swiper', {
      loop: true,
      autoplay: { delay: 5000, disableOnInteraction: false },
      speed: 600,
      pagination: { el: '.swiper-pagination', clickable: true },
      a11y: { prevSlideMessage: 'Previous testimonial', nextSlideMessage: 'Next testimonial' }
    });
  }
};

/* ════════════════════════════════════════════════════════════
   APP INIT
   ════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  animationInit.init();
  formHandler.init();
  swiperInit.init();
  galleryInit.init();
  chartInit.init();

  // Fetch visitor stats (once per 20 min, cached)
  apiHandler.fetchVisitorStats().then(data => {
    if (data) console.info('[App] Visitor stats ready:', data);
  });
});