/**
 * NEXORA ELECTRONICS — MODULAR COMPONENT SYSTEM
 * Reusable UI Components Engine for Multi-Page Electronics Showroom
 * Zero hardcoded values • Single source of truth from NEXORA_CONFIG
 * Powered by FontAwesome 6 Icon System
 */

window.NexoraComponents = (function () {
  'use strict';

  const cfg = () => (typeof NEXORA_CONFIG !== 'undefined' ? NEXORA_CONFIG : {
    storeName: "NEXORA ELECTRONICS",
    brandTitle: "NEXORA",
    brandSub: "Explore Plus ⚡",
    shortAddress: "123 Commercial Street, Bengaluru",
    openingHours: "Mon – Sat: 10:00 AM – 8:30 PM",
    phone: "+91 90000 00000",
    whatsappNumber: "919000000000",
    email: "concierge@nexora-electronics.com",
    address: "123 Commercial Street, Bengaluru, Karnataka, India - 560001",
    copyright: "© 2026 NEXORA ELECTRONICS. All rights reserved."
  });

  const formatPrice = (amt) => '₹' + Number(amt).toLocaleString('en-IN');

  // 1. TOP ANNOUNCEMENT BAR COMPONENT
  function renderTopBar() {
    const c = cfg();
    return `
      <aside class="top-announcement-bar" role="region" aria-label="Announcement">
        <div class="container top-bar-inner">
          <div class="top-bar-location">
            <span><i class="fa-solid fa-location-dot" style="color:var(--accent-cyan); margin-right:4px;"></i> <strong>Showroom:</strong> ${c.shortAddress} • <strong>Hours:</strong> ${c.openingHours}</span>
          </div>
          <div class="top-bar-links">
            <a href="about.html" class="top-bar-link"><i class="fa-solid fa-circle-info" style="margin-right:4px;"></i>Showroom Story</a>
            <a href="contact.html" class="top-bar-link"><i class="fa-solid fa-map-location-dot" style="margin-right:4px;"></i>Store Location</a>
            <a href="https://wa.me/${c.whatsappNumber}?text=Hi%20Nexora,%20I%20would%20like%20to%20inquire%20about%20your%20products." 
               target="_blank" 
               rel="noopener noreferrer" 
               class="top-bar-wa-link">
              <span class="pulse-dot"></span>
              <i class="fa-brands fa-whatsapp" style="font-size:1rem; margin-right:4px;"></i> WhatsApp Concierge: ${c.phone}
            </a>
          </div>
        </div>
      </aside>
    `;
  }

  // 2. MAIN HEADER COMPONENT
  function renderHeader(options = {}) {
    const c = cfg();
    return `
      <header class="main-header" role="banner">
        <div class="container header-container">
          <!-- Brand Logo -->
          <a href="index.html" class="brand-logo-wrap" title="${c.storeName}">
            <div class="brand-icon-box"><i class="fa-solid fa-microchip"></i></div>
            <div class="brand-name-group">
              <span class="brand-title">${c.brandTitle}</span>
              <span class="brand-sub">${c.brandSub}</span>
            </div>
          </a>

          <!-- Universal Live Search Bar -->
          <div class="header-search-form" role="search">
            <div class="search-input-wrapper">
              <input 
                type="text" 
                class="header-search-input" 
                id="global-search-input"
                placeholder="Search smartphones, OLED 4K TVs, laptops, audio..." 
                aria-label="Search Showroom Catalogue" 
                autocomplete="off"
              />
              <button class="header-search-btn" type="button" id="global-search-btn" aria-label="Submit Search">
                <i class="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
            <div class="search-autocomplete-box" id="global-search-autocomplete"></div>
          </div>

          <!-- Header Actions -->
          <div class="header-actions-group">
            <a href="wishlist.html" class="header-action-link" title="Your Wishlist" id="header-wishlist-link">
              <i class="fa-solid fa-heart"></i>
              <span>Wishlist</span>
              <span class="header-badge wishlist-counter-badge">0</span>
            </a>

            <button type="button" class="header-action-link" onclick="window.NexoraApp.openCompareModal()" title="Compare Products" id="header-compare-link" style="background:transparent; border:none; cursor:pointer;">
              <i class="fa-solid fa-scale-balanced"></i>
              <span>Compare</span>
              <span class="header-badge compare-counter-badge">0</span>
            </button>

            <a href="cart.html" class="header-action-link" title="Shopping Cart" id="header-cart-link">
              <i class="fa-solid fa-cart-shopping"></i>
              <span>Cart</span>
              <span class="header-badge cart-counter-badge">0</span>
            </a>

            <button class="header-whatsapp-btn" type="button" onclick="window.NexoraApp.directCartWhatsAppOrder()" title="Instant WhatsApp Order">
              <i class="fa-brands fa-whatsapp" style="font-size:1.15rem;"></i>
              <span>WhatsApp Order</span>
            </button>

            <!-- Mobile Drawer Toggle -->
            <button class="mobile-menu-toggle" type="button" onclick="window.NexoraApp.toggleMobileDrawer()" aria-label="Open Navigation Menu">
              <i class="fa-solid fa-bars" style="color:var(--accent-cyan); font-size:1.2rem;"></i>
            </button>
          </div>
        </div>
      </header>
    `;
  }

  // 3. CATEGORY NAVIGATION BAR COMPONENT
  function renderCategoryNav(activeCategory = '') {
    const cats = typeof NEXORA_CATEGORIES !== 'undefined' ? NEXORA_CATEGORIES : [];
    const itemsHtml = cats.map(cat => {
      const isAct = activeCategory && (activeCategory.toLowerCase() === cat.id.toLowerCase() || activeCategory.toLowerCase() === cat.name.toLowerCase());
      return `
        <a href="shop.html?category=${encodeURIComponent(cat.name)}" class="category-nav-item ${isAct ? 'active' : ''}">
          <div class="category-nav-icon">${cat.icon}</div>
          <span>${cat.name.split(' ')[0]}</span>
        </a>
      `;
    }).join('');

    return `
      <nav class="category-nav-bar" aria-label="Departments">
        <div class="container category-nav-inner">
          ${itemsHtml}
          <a href="shop.html" class="category-nav-item ${activeCategory === 'all' ? 'active' : ''}">
            <div class="category-nav-icon"><i class="fa-solid fa-bolt"></i></div>
            <span>All 16 Depts</span>
          </a>
        </div>
      </nav>
    `;
  }

  // 4. SECONDARY SUB-NAV BAR COMPONENT
  function renderSubNav(activeKey = '') {
    const links = [
      { key: 'home', label: '<i class="fa-solid fa-house" style="margin-right:5px;"></i> Home', url: 'index.html' },
      { key: 'shop', label: '<i class="fa-solid fa-bag-shopping" style="margin-right:5px;"></i> Storefront Catalogue', url: 'shop.html' },
      { key: 'deals', label: '<i class="fa-solid fa-fire" style="margin-right:5px; color:#ff4343;"></i> Flash Deals', url: 'shop.html?deal=true', style: 'color: #ff4343; font-weight:700;' },
      { key: 'gaming', label: '<i class="fa-solid fa-gamepad" style="margin-right:5px;"></i> Gaming Zone', url: 'shop.html?occasion=gaming' },
      { key: 'work', label: '<i class="fa-solid fa-laptop-code" style="margin-right:5px;"></i> Pro Workstations', url: 'shop.html?occasion=work' },
      { key: 'about', label: '<i class="fa-solid fa-store" style="margin-right:5px;"></i> Showroom Experience', url: 'about.html' },
      { key: 'contact', label: '<i class="fa-solid fa-map-location-dot" style="margin-right:5px;"></i> Visit Bengaluru Store', url: 'contact.html' }
    ];

    const linksHtml = links.map(l => {
      const isAct = activeKey === l.key;
      return `
        <a href="${l.url}" class="sub-nav-link ${isAct ? 'active' : ''}" style="${l.style || ''}">
          ${l.label}
        </a>
      `;
    }).join('');

    return `
      <nav class="sub-nav-bar" aria-label="Secondary Navigation">
        <div class="container sub-nav-inner">
          ${linksHtml}
        </div>
      </nav>
    `;
  }

  // 5. RICH LUXURY FOOTER COMPONENT
  function renderFooter() {
    const c = cfg();
    const cats = typeof NEXORA_CATEGORIES !== 'undefined' ? NEXORA_CATEGORIES.slice(0, 7) : [];
    
    const catLinksHtml = cats.map(cat => `
      <a href="shop.html?category=${encodeURIComponent(cat.name)}" class="footer-link-item">
        <span style="color:var(--accent-cyan); width:18px; display:inline-block;">${cat.icon}</span> ${cat.name}
      </a>
    `).join('');

    return `
      <footer class="main-footer" role="contentinfo">
        <div class="container">
          <div class="footer-columns-grid">
            <!-- Brand & Concierge Info -->
            <div class="footer-brand-col">
              <div class="footer-brand-title">${c.storeName}</div>
              <div class="footer-tagline">"${c.tagline}"</div>
              <p class="footer-desc">
                ${c.subtitle}. Direct brand authorized showroom connecting online shopping with tactile in-store demonstrations.
              </p>
              <div class="footer-wa-block">
                <a href="https://wa.me/${c.whatsappNumber}?text=Hi%20Nexora,%20I%20would%20like%20to%20connect%20with%20the%20showroom." 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="footer-wa-btn">
                  <i class="fa-brands fa-whatsapp" style="font-size:1.1rem; margin-right:4px;"></i> Concierge Desk: ${c.phone}
                </a>
              </div>
            </div>

            <!-- Top Categories -->
            <div>
              <h4 class="footer-col-title">TECH DEPARTMENTS</h4>
              <div class="footer-links-col">
                ${catLinksHtml}
                <a href="shop.html" class="footer-link-item" style="color: var(--accent-cyan);"><i class="fa-solid fa-arrow-right" style="margin-right:4px;"></i> Explore All 16 Departments</a>
              </div>
            </div>

            <!-- Quick Navigation -->
            <div>
              <h4 class="footer-col-title">SHOWROOM NAVIGATION</h4>
              <div class="footer-links-col">
                <a href="about.html" class="footer-link-item"><i class="fa-solid fa-store" style="margin-right:6px; color:var(--accent-cyan);"></i>Showroom Story & Zones</a>
                <a href="shop.html" class="footer-link-item"><i class="fa-solid fa-bag-shopping" style="margin-right:6px; color:var(--accent-cyan);"></i>Full Live Catalogue</a>
                <a href="contact.html" class="footer-link-item"><i class="fa-solid fa-map-location-dot" style="margin-right:6px; color:var(--accent-cyan);"></i>Directions & Contact</a>
                <a href="wishlist.html" class="footer-link-item"><i class="fa-solid fa-heart" style="margin-right:6px; color:#f43f5e;"></i>Saved Wishlist</a>
                <a href="cart.html" class="footer-link-item"><i class="fa-solid fa-cart-shopping" style="margin-right:6px; color:var(--accent-cyan);"></i>Shopping Cart & Quotations</a>
                <a href="javascript:void(0)" onclick="window.NexoraApp.openAdvisorModal()" class="footer-link-item"><i class="fa-solid fa-robot" style="margin-right:6px; color:var(--accent-cyan);"></i>AI Tech Advisor</a>
                <a href="javascript:void(0)" onclick="window.NexoraApp.openExchangeModal()" class="footer-link-item"><i class="fa-solid fa-arrows-rotate" style="margin-right:6px; color:#10b981;"></i>Trade-In Valuator</a>
              </div>
            </div>

            <!-- Customer Care & Policies -->
            <div>
              <h4 class="footer-col-title">CONCIERGE CARE</h4>
              <div class="footer-links-col">
                <a href="about.html#warranty" class="footer-link-item"><i class="fa-solid fa-shield-halved" style="margin-right:6px; color:#10b981;"></i>100% Brand Warranty</a>
                <a href="contact.html#pickup" class="footer-link-item"><i class="fa-solid fa-stopwatch" style="margin-right:6px; color:var(--accent-gold);"></i>Fast-Track 30-Min Pickup</a>
                <a href="contact.html#delivery" class="footer-link-item"><i class="fa-solid fa-truck-fast" style="margin-right:6px; color:var(--accent-cyan);"></i>Same-Day Bengaluru Delivery</a>
                <a href="javascript:void(0)" onclick="window.NexoraApp.openBookingModal()" class="footer-link-item"><i class="fa-solid fa-calendar-check" style="margin-right:6px; color:#818cf8;"></i>Book VIP Demo Room</a>
                <a href="javascript:void(0)" onclick="window.NexoraApp.openTrackOrderModal()" class="footer-link-item"><i class="fa-solid fa-box-open" style="margin-right:6px; color:var(--accent-cyan);"></i>Track Order Dispatch</a>
                <a href="https://wa.me/${c.whatsappNumber}" target="_blank" class="footer-link-item" style="color: #25d366;"><i class="fa-brands fa-whatsapp" style="margin-right:6px;"></i>Order on WhatsApp</a>
              </div>
            </div>

            <!-- Bengaluru Showroom Details -->
            <div>
              <h4 class="footer-col-title">BENGALURU SHOWROOM</h4>
              <p class="footer-address-block">
                <strong><i class="fa-solid fa-location-dot" style="color:var(--accent-cyan); margin-right:4px;"></i> Address:</strong><br />
                ${c.address}<br /><br />
                <strong><i class="fa-solid fa-clock" style="color:var(--accent-gold); margin-right:4px;"></i> Operating Hours:</strong><br />
                ${c.openingHours}<br /><br />
                <strong><i class="fa-solid fa-envelope" style="color:var(--accent-cyan); margin-right:4px;"></i> Email:</strong><br />
                <a href="mailto:${c.email}" style="color:var(--text-muted);">${c.email}</a>
              </p>
            </div>
          </div>

          <!-- Footer Trust Badges Strip -->
          <div class="footer-trust-strip">
            <div class="trust-badge-item">
              <span class="trust-icon" style="color:#10b981;"><i class="fa-solid fa-shield-halved"></i></span>
              <div>
                <strong>100% Genuine Sealed Tech</strong>
                <p>Authorized manufacturer serials</p>
              </div>
            </div>
            <div class="trust-badge-item">
              <span class="trust-icon" style="color:var(--accent-cyan);"><i class="fa-solid fa-bolt"></i></span>
              <div>
                <strong>Zero Gateway Fees</strong>
                <p>Direct WhatsApp & showroom pricing</p>
              </div>
            </div>
            <div class="trust-badge-item">
              <span class="trust-icon" style="color:var(--accent-violet);"><i class="fa-solid fa-store"></i></span>
              <div>
                <strong>6,500 Sq.Ft Experience Lab</strong>
                <p>Acoustic suites & gaming rigs</p>
              </div>
            </div>
            <div class="trust-badge-item">
              <span class="trust-icon" style="color:var(--accent-gold);"><i class="fa-solid fa-calculator"></i></span>
              <div>
                <strong>0% No-Cost EMI Available</strong>
                <p>Instant tenure calculation</p>
              </div>
            </div>
          </div>

          <!-- Footer Bottom Bar -->
          <div class="footer-bottom-info">
            <div>${c.copyright}</div>
            <div class="footer-bottom-badges">
              <span>Apple Authorized</span>
              <span>Sony Center</span>
              <span>Samsung Exclusive</span>
              <span>Bose Audio Lounge</span>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  // 6. REUSABLE PRODUCT CARD COMPONENT (Ultra-Luxury Light Glassmorphism Redesign)
  function renderProductCard(product, options = {}) {
    if (!product) return '';
    const discount = product.discount || (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0);
    const badgeLabel = product.isDeal 
      ? '<i class="fa-solid fa-bolt" style="margin-right:3px;"></i> Flash Deal' 
      : (product.isFeatured 
        ? '<i class="fa-solid fa-star" style="margin-right:3px;"></i> Flagship' 
        : (product.isNew 
          ? '<i class="fa-solid fa-wand-magic-sparkles" style="margin-right:3px;"></i> New Gen' 
          : (product.isBestSeller 
            ? '<i class="fa-solid fa-fire" style="margin-right:3px;"></i> Bestseller' 
            : '')));
    const isInWishlist = window.NexoraApp ? window.NexoraApp.isInWishlist(product.id) : false;
    const isInCompare = window.NexoraApp ? window.NexoraApp.isInCompare(product.id) : false;
    const emiPerMonth = Math.round(product.price / 24);
    const tagsToShow = (product.tags || []).slice(0, 2);

    return `
      <article class="store-product-card" data-product-id="${product.id}">
        <!-- Top Floating Badges & Action Icons -->
        <div class="product-card-top">
          <div class="product-badges-wrap">
            ${badgeLabel ? `<span class="badge-tag ${product.isDeal ? 'badge-tag-deal' : 'badge-tag-flagship'}">${badgeLabel}</span>` : ''}
            ${discount > 0 ? `<span class="badge-discount-pill">-${discount}%</span>` : ''}
          </div>
          
          <div class="product-card-quick-actions">
            <button type="button" 
                    class="card-action-btn card-wishlist-btn ${isInWishlist ? 'active' : ''}" 
                    onclick="window.NexoraApp.toggleWishlist('${product.id}', this)" 
                    title="${isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}"
                    aria-label="Wishlist">
              <i class="fa-solid fa-heart"></i>
            </button>
            <button type="button" 
                    class="card-action-btn card-compare-btn ${isInCompare ? 'active' : ''}" 
                    onclick="window.NexoraApp.toggleCompare('${product.id}', this)" 
                    title="${isInCompare ? 'Remove from Compare' : 'Add to Compare'}"
                    aria-label="Compare">
              <i class="fa-solid fa-scale-balanced"></i>
            </button>
          </div>
        </div>

        <!-- Showroom Pedestal Stage Image Wrap with Quick View Overlay -->
        <div class="product-card-img-wrap">
          <a href="product.html?id=${product.id}" class="product-card-img-link" title="${product.name}">
            <img src="${product.thumbnail || (product.images && product.images[0]) || ''}" 
                 alt="${product.name}" 
                 class="product-card-img" 
                 loading="lazy" 
                 onerror="this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80'" />
          </a>
          <button type="button" class="product-quick-view-trigger" onclick="window.NexoraApp.openQuickView('${product.id}')" title="Quick Specs Preview">
            <i class="fa-solid fa-eye" style="margin-right:4px;"></i> Quick View
          </button>
        </div>

        <!-- Product Information Body -->
        <div class="product-card-info">
          <!-- Brand & In-Stock Indicator -->
          <div class="product-card-meta">
            <div class="product-brand-category">
              <span class="product-brand-chip">${product.brand || 'Premium'}</span>
              <span class="meta-dot">•</span>
              <span class="product-category-chip">${product.category || 'Tech'}</span>
            </div>
            <span class="stock-indicator-badge"><span class="stock-dot"></span> In Stock</span>
          </div>

          <!-- Product Title Link -->
          <h3 class="product-card-title">
            <a href="product.html?id=${product.id}" title="${product.name}">${product.name}</a>
          </h3>

          <!-- Star Rating & Review Metric -->
          <div class="product-card-rating">
            <div class="star-rating-badge">
              <i class="fa-solid fa-star"></i>
              <span>${product.rating || '4.8'}</span>
            </div>
            <span class="rating-count">(${product.reviewCount || '150'})</span>
            <span class="warranty-verified-pill"><i class="fa-solid fa-shield-halved"></i> Genuine</span>
          </div>

          <!-- Key Micro Tags -->
          ${tagsToShow.length ? `
            <div class="product-card-feature-tags">
              ${tagsToShow.map(t => `<span class="feature-tag-chip"><i class="fa-solid fa-check" style="font-size:0.65rem; color:var(--accent-cyan); margin-right:3px;"></i>${t}</span>`).join('')}
            </div>
          ` : ''}

          <!-- Pricing & Savings Block -->
          <div class="product-card-pricing-box">
            <div class="price-main-row">
              <span class="price-current">${formatPrice(product.price)}</span>
              ${product.originalPrice && product.originalPrice > product.price ? `
                <span class="price-original">${formatPrice(product.originalPrice)}</span>
                <span class="price-save">Save ${formatPrice(product.originalPrice - product.price)}</span>
              ` : ''}
            </div>
            <div class="price-emi-row">
              <i class="fa-solid fa-credit-card" style="font-size:0.75rem; color:var(--accent-gold); margin-right:4px;"></i>
              <span>0% No-Cost EMI from <strong>${formatPrice(emiPerMonth)}/mo</strong></span>
            </div>
          </div>

          <!-- Action Buttons Bar -->
          <div class="product-card-actions-bar">
            <button type="button" class="btn btn-primary btn-sm btn-card-cart" onclick="window.NexoraApp.addToCart('${product.id}', 1, this)">
              <i class="fa-solid fa-bag-shopping" style="margin-right:6px;"></i>
              <span>Add to Cart</span>
            </button>
            <button type="button" class="btn btn-wa-green btn-sm btn-card-wa" onclick="window.NexoraApp.directProductWhatsAppOrder('${product.id}')" title="Direct WhatsApp Concierge Inquiry">
              <i class="fa-brands fa-whatsapp" style="font-size:1.05rem;"></i>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  // 7. INTERACTIVE MODALS COMPONENT
  function renderModals() {
    const c = cfg();
    return `
      <!-- AI Tech Advisor Modal -->
      <div class="nexora-modal-backdrop" id="modal-advisor" onclick="if(event.target===this) window.NexoraApp.closeModal('modal-advisor')">
        <div class="nexora-modal-dialog">
          <div class="nexora-modal-header">
            <div class="modal-title-wrap">
              <span class="modal-title-icon" style="color:var(--accent-cyan);"><i class="fa-solid fa-robot"></i></span>
              <div>
                <h3 class="nexora-modal-title">AI Tech Concierge & Spec Matcher</h3>
                <p class="nexora-modal-sub">Answer 3 questions to find the engineered device matching your workflow & budget</p>
              </div>
            </div>
            <button class="nexora-modal-close" onclick="window.NexoraApp.closeModal('modal-advisor')">&times;</button>
          </div>
          <div class="nexora-modal-body" id="advisor-wizard-container">
            <!-- Rendered by NexoraApp.initAdvisorWizard() -->
          </div>
        </div>
      </div>

      <!-- Trade-In & Exchange Calculator Modal -->
      <div class="nexora-modal-backdrop" id="modal-exchange" onclick="if(event.target===this) window.NexoraApp.closeModal('modal-exchange')">
        <div class="nexora-modal-dialog">
          <div class="nexora-modal-header">
            <div class="modal-title-wrap">
              <span class="modal-title-icon" style="color:#34d399;"><i class="fa-solid fa-arrows-rotate"></i></span>
              <div>
                <h3 class="nexora-modal-title">Showroom Trade-In & Instant Exchange</h3>
                <p class="nexora-modal-sub">Calculate guaranteed spot valuation for your current device</p>
              </div>
            </div>
            <button class="nexora-modal-close" onclick="window.NexoraApp.closeModal('modal-exchange')">&times;</button>
          </div>
          <div class="nexora-modal-body" id="exchange-modal-body">
            <!-- Rendered dynamically by NexoraApp.initExchangeCalculator() -->
          </div>
        </div>
      </div>

      <!-- 0% No-Cost EMI Calculator Modal -->
      <div class="nexora-modal-backdrop" id="modal-emi" onclick="if(event.target===this) window.NexoraApp.closeModal('modal-emi')">
        <div class="nexora-modal-dialog">
          <div class="nexora-modal-header">
            <div class="modal-title-wrap">
              <span class="modal-title-icon" style="color:#fbbf24;"><i class="fa-solid fa-credit-card"></i></span>
              <div>
                <h3 class="nexora-modal-title">0% No-Cost EMI Calculator</h3>
                <p class="nexora-modal-sub">Transparent 3, 6, 9, 12, 18 & 24 month zero-interest finance plans</p>
              </div>
            </div>
            <button class="nexora-modal-close" onclick="window.NexoraApp.closeModal('modal-emi')">&times;</button>
          </div>
          <div class="nexora-modal-body" id="emi-modal-body">
            <!-- Rendered dynamically by NexoraApp.openEmiCalculator(amount) -->
          </div>
        </div>
      </div>

      <!-- Book VIP Showroom Demo Modal -->
      <div class="nexora-modal-backdrop" id="modal-booking" onclick="if(event.target===this) window.NexoraApp.closeModal('modal-booking')">
        <div class="nexora-modal-dialog">
          <div class="nexora-modal-header">
            <div class="modal-title-wrap">
              <span class="modal-title-icon" style="color:#818cf8;"><i class="fa-solid fa-calendar-check"></i></span>
              <div>
                <h3 class="nexora-modal-title">Reserve VIP Showroom Experience</h3>
                <p class="nexora-modal-sub">Schedule dedicated 1-on-1 engineer demo or 4K private acoustic suite session</p>
              </div>
            </div>
            <button class="nexora-modal-close" onclick="window.NexoraApp.closeModal('modal-booking')">&times;</button>
          </div>
          <div class="nexora-modal-body">
            <form id="vip-booking-form" onsubmit="window.NexoraApp.submitVipBooking(event)" class="modal-form-grid">
              <div class="form-group">
                <label class="form-label">Your Full Name *</label>
                <input type="text" class="form-input" id="book-name" required placeholder="e.g. Akhilesh R" />
              </div>
              <div class="form-group">
                <label class="form-label">WhatsApp Contact Number *</label>
                <input type="tel" class="form-input" id="book-phone" required placeholder="e.g. 9876543210" />
              </div>
              <div class="form-group">
                <label class="form-label">Preferred Session Type *</label>
                <select class="form-select" id="book-session" required>
                  <option value="Acoustic Audio Suite (Bose / Sony Dolby Atmos)">Acoustic Audio Suite (Bose / Sony Dolby Atmos)</option>
                  <option value="4K / 8K OLED Display Shootout (Sony BRAVIA vs Samsung Neo QLED)">4K / 8K OLED Display Shootout (Sony BRAVIA vs Samsung)</option>
                  <option value="Pro Creator & Mac / PC Workstation Benchmarking">Pro Creator & Mac / PC Workstation Benchmarking</option>
                  <option value="Gaming & Esports 240Hz Setup Trial">Gaming & Esports 240Hz Setup Trial</option>
                  <option value="Virtual Video Call Live Concierge Consultation">Virtual Video Call Live Concierge Consultation</option>
                </select>
              </div>
              <div class="form-row" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div class="form-group">
                  <label class="form-label">Preferred Date *</label>
                  <input type="date" class="form-input" id="book-date" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Time Slot *</label>
                  <select class="form-select" id="book-time" required>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="06:30 PM">06:30 PM</option>
                    <option value="07:30 PM">07:30 PM</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Specific Hardware You Want Pre-Loaded / Tested</label>
                <input type="text" class="form-input" id="book-devices" placeholder="e.g. iPhone 17 Pro Max, MacBook Air M3, Bose QC Ultra" />
              </div>
              <button type="submit" class="btn btn-primary btn-lg" style="width:100%; margin-top:8px;">
                <i class="fa-brands fa-whatsapp" style="margin-right:6px;"></i> Confirm VIP Showroom Reservation & Send to WhatsApp
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Live Order Tracking Modal -->
      <div class="nexora-modal-backdrop" id="modal-track" onclick="if(event.target===this) window.NexoraApp.closeModal('modal-track')">
        <div class="nexora-modal-dialog">
          <div class="nexora-modal-header">
            <div class="modal-title-wrap">
              <span class="modal-title-icon" style="color:var(--accent-cyan);"><i class="fa-solid fa-box-open"></i></span>
              <div>
                <h3 class="nexora-modal-title">Live Dispatch & Showroom Order Tracker</h3>
                <p class="nexora-modal-sub">Check live preparation status for Bengaluru delivery or pickup</p>
              </div>
            </div>
            <button class="nexora-modal-close" onclick="window.NexoraApp.closeModal('modal-track')">&times;</button>
          </div>
          <div class="nexora-modal-body">
            <div style="display:flex; gap:10px; margin-bottom:20px;">
              <input type="text" class="form-input" id="track-order-id" placeholder="Enter Order / Quotation ID (e.g. NX-98421)" />
              <button class="btn btn-primary" onclick="window.NexoraApp.queryOrderStatus()"><i class="fa-solid fa-magnifying-glass" style="margin-right:4px;"></i> Track</button>
            </div>
            <div id="track-order-result-box">
              <div class="track-timeline">
                <div class="track-step completed">
                  <div class="track-step-dot"><i class="fa-solid fa-check"></i></div>
                  <div class="track-step-content">
                    <strong>Order Verified & Serial Reserved</strong>
                    <p>Unit serial sealed and allocated in Commercial Street stockroom</p>
                  </div>
                </div>
                <div class="track-step completed">
                  <div class="track-step-dot"><i class="fa-solid fa-check"></i></div>
                  <div class="track-step-content">
                    <strong>Quality Inspection & Brand Warranty Registered</strong>
                    <p>Passed hardware engineer pre-flight check</p>
                  </div>
                </div>
                <div class="track-step active">
                  <div class="track-step-dot"><i class="fa-solid fa-truck-fast"></i></div>
                  <div class="track-step-content">
                    <strong>Ready for 30-Min Fast-Track Counter Pickup / Express Courier</strong>
                    <p>Available at 123 Commercial Street, Bengaluru Counter #2</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick View Modal -->
      <div class="nexora-modal-backdrop" id="modal-quickview" onclick="if(event.target===this) window.NexoraApp.closeModal('modal-quickview')">
        <div class="nexora-modal-dialog nexora-modal-lg">
          <div class="nexora-modal-header">
            <h3 class="nexora-modal-title" id="qv-title">Product Quick Look</h3>
            <button class="nexora-modal-close" onclick="window.NexoraApp.closeModal('modal-quickview')">&times;</button>
          </div>
          <div class="nexora-modal-body" id="qv-body">
            <!-- Rendered by NexoraApp.openQuickView(productId) -->
          </div>
        </div>
      </div>

      <!-- Product Compare Drawer / Modal -->
      <div class="nexora-modal-backdrop" id="modal-compare" onclick="if(event.target===this) window.NexoraApp.closeModal('modal-compare')">
        <div class="nexora-modal-dialog nexora-modal-xl">
          <div class="nexora-modal-header">
            <div class="modal-title-wrap">
              <span class="modal-title-icon" style="color:var(--accent-cyan);"><i class="fa-solid fa-scale-balanced"></i></span>
              <div>
                <h3 class="nexora-modal-title">Hardware Specification Shootout</h3>
                <p class="nexora-modal-sub">Side-by-side spec comparison across performance, battery, display & pricing</p>
              </div>
            </div>
            <div style="display:flex; gap:10px; align-items:center;">
              <button class="btn btn-outline btn-sm" onclick="window.NexoraApp.clearCompare()"><i class="fa-solid fa-trash-can" style="margin-right:4px;"></i> Clear All</button>
              <button class="nexora-modal-close" onclick="window.NexoraApp.closeModal('modal-compare')">&times;</button>
            </div>
          </div>
          <div class="nexora-modal-body" id="compare-modal-body">
            <!-- Dynamic Compare Matrix Rendered by NexoraApp.openCompareModal -->
          </div>
        </div>
      </div>
      <!-- Instagram Reel / Video Modal -->
      <div class="nexora-modal-backdrop" id="modal-reel" onclick="if(event.target===this) window.NexoraApp.closeModal('modal-reel')">
        <div class="nexora-modal-dialog nexora-modal-lg">
          <div class="nexora-modal-header" style="background:var(--accent-instagram); color:#ffffff;">
            <div class="modal-title-wrap">
              <span class="modal-title-icon" style="background:rgba(255,255,255,0.2); color:#ffffff;"><i class="fa-brands fa-instagram"></i></span>
              <div>
                <h3 class="nexora-modal-title" style="color:#ffffff;" id="reel-modal-title">Showroom Reel Video</h3>
                <p class="nexora-modal-sub" style="color:rgba(255,255,255,0.85);" id="reel-modal-author">@nexora_electronics • Bengaluru Showroom</p>
              </div>
            </div>
            <button class="nexora-modal-close" onclick="window.NexoraApp.closeModal('modal-reel')">&times;</button>
          </div>
          <div class="nexora-modal-body" id="reel-modal-body">
            <!-- Dynamic Reel Content Rendered by NexoraApp.openReelModal -->
          </div>
        </div>
      </div>
    `;
  }

  // 8. FLOATING CONCIERGE DOCK & COMPARE BAR
  function renderFloatingDock() {
    const c = cfg();
    return `
      <!-- Floating Bottom Dock -->
      <div class="nexora-floating-dock">
        <!-- Floating WhatsApp Concierge Button -->
        <a href="https://wa.me/${c.whatsappNumber}?text=Hi%20Nexora,%20I%20need%20assistance%20choosing%20electronics." 
           target="_blank" 
           rel="noopener noreferrer" 
           class="floating-wa-btn" 
           title="Chat with Showroom Concierge">
          <div class="wa-icon-pulse">
            <i class="fa-brands fa-whatsapp" style="font-size:1.6rem;"></i>
          </div>
          <span class="floating-wa-text">WhatsApp Order Desk</span>
        </a>

        <!-- Floating Compare Pill (Visible when 1+ items selected) -->
        <button type="button" class="floating-compare-dock" id="floating-compare-bar" onclick="window.NexoraApp.openCompareModal()" style="display:none;">
          <span class="compare-dock-icon"><i class="fa-solid fa-scale-balanced"></i></span>
          <span>Compare (<strong class="compare-counter-badge">0</strong>)</span>
        </button>

        <!-- Back to top button -->
        <button type="button" class="floating-top-btn" id="floating-back-top" onclick="window.scrollTo({top: 0, behavior: 'smooth'})" title="Back to Top">
          <i class="fa-solid fa-arrow-up"></i>
        </button>
      </div>
    `;
  }

  // 9. MOBILE NAVIGATION DRAWER
  function renderMobileDrawer(activePageKey = '') {
    const c = cfg();
    const cats = typeof NEXORA_CATEGORIES !== 'undefined' ? NEXORA_CATEGORIES : [];
    
    return `
      <div class="mobile-drawer-backdrop" id="mobile-drawer-backdrop" onclick="window.NexoraApp.toggleMobileDrawer(false)"></div>
      <div class="mobile-nav-drawer" id="mobile-nav-drawer">
        <div class="mobile-drawer-header">
          <div class="brand-logo-wrap">
            <div class="brand-icon-box"><i class="fa-solid fa-microchip"></i></div>
            <div class="brand-name-group">
              <span class="brand-title">${c.brandTitle}</span>
              <span class="brand-sub">${c.brandSub}</span>
            </div>
          </div>
          <button class="mobile-drawer-close" onclick="window.NexoraApp.toggleMobileDrawer(false)">&times;</button>
        </div>

        <div class="mobile-drawer-body">
          <div class="mobile-drawer-links">
            <a href="index.html" class="mobile-nav-link ${activePageKey === 'home' ? 'active' : ''}"><i class="fa-solid fa-house" style="width:20px;"></i> Home</a>
            <a href="shop.html" class="mobile-nav-link ${activePageKey === 'shop' ? 'active' : ''}"><i class="fa-solid fa-bag-shopping" style="width:20px;"></i> Full Catalogue (16 Depts)</a>
            <a href="shop.html?deal=true" class="mobile-nav-link" style="color:#ff4343;"><i class="fa-solid fa-fire" style="width:20px; color:#ff4343;"></i> Flash Deals</a>
            <a href="shop.html?occasion=gaming" class="mobile-nav-link"><i class="fa-solid fa-gamepad" style="width:20px;"></i> Gaming Zone</a>
            <a href="shop.html?occasion=work" class="mobile-nav-link"><i class="fa-solid fa-laptop-code" style="width:20px;"></i> Pro Workstations</a>
            <a href="wishlist.html" class="mobile-nav-link ${activePageKey === 'wishlist' ? 'active' : ''}">
              <i class="fa-solid fa-heart" style="width:20px; color:#f43f5e;"></i> Wishlist (<span class="wishlist-counter-badge">0</span>)
            </a>
            <a href="cart.html" class="mobile-nav-link ${activePageKey === 'cart' ? 'active' : ''}">
              <i class="fa-solid fa-cart-shopping" style="width:20px; color:var(--accent-cyan);"></i> Cart (<span class="cart-counter-badge">0</span>)
            </a>
            <a href="about.html" class="mobile-nav-link ${activePageKey === 'about' ? 'active' : ''}"><i class="fa-solid fa-store" style="width:20px;"></i> Showroom Story</a>
            <a href="contact.html" class="mobile-nav-link ${activePageKey === 'contact' ? 'active' : ''}"><i class="fa-solid fa-map-location-dot" style="width:20px;"></i> Location & Contact</a>
          </div>

          <div class="mobile-drawer-section-title">ALL 16 CATEGORIES</div>
          <div class="mobile-categories-grid">
            ${cats.map(cat => `
              <a href="shop.html?category=${encodeURIComponent(cat.name)}" class="mobile-cat-pill">
                <span style="color:var(--accent-cyan); font-size:0.9rem;">${cat.icon}</span>
                <span>${cat.name}</span>
              </a>
            `).join('')}
          </div>

          <div class="mobile-drawer-contacts">
            <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:8px;">SHOWROOM ASSISTANCE</div>
            <a href="tel:${c.phone.replace(/[^0-9+]/g, '')}" class="mobile-contact-row"><i class="fa-solid fa-phone" style="margin-right:6px;"></i> Call: ${c.phone}</a>
            <a href="https://wa.me/${c.whatsappNumber}" target="_blank" class="mobile-contact-row" style="color:#25d366;"><i class="fa-brands fa-whatsapp" style="margin-right:6px;"></i> WhatsApp Desk</a>
          </div>
        </div>
      </div>
    `;
  }

  // 10. UNIFIED MOUNTING FUNCTION
  function mountGlobalComponents(activePageKey = 'home', activeCategory = '') {
    // Top Bar
    const topBarMount = document.getElementById('nexora-topbar-mount');
    if (topBarMount) topBarMount.innerHTML = renderTopBar();

    // Main Header
    const headerMount = document.getElementById('nexora-header-mount');
    if (headerMount) headerMount.innerHTML = renderHeader();

    // Category Nav
    const catNavMount = document.getElementById('nexora-category-nav-mount');
    if (catNavMount) catNavMount.innerHTML = renderCategoryNav(activeCategory);

    // Sub Nav
    const subNavMount = document.getElementById('nexora-sub-nav-mount');
    if (subNavMount) subNavMount.innerHTML = renderSubNav(activePageKey);

    // Footer
    const footerMount = document.getElementById('nexora-footer-mount');
    if (footerMount) footerMount.innerHTML = renderFooter();

    // Modals
    let modalsMount = document.getElementById('nexora-modals-mount');
    if (!modalsMount) {
      modalsMount = document.createElement('div');
      modalsMount.id = 'nexora-modals-mount';
      document.body.appendChild(modalsMount);
    }
    modalsMount.innerHTML = renderModals();

    // Floating Dock
    let dockMount = document.getElementById('nexora-floating-dock-mount');
    if (!dockMount) {
      dockMount = document.createElement('div');
      dockMount.id = 'nexora-floating-dock-mount';
      document.body.appendChild(dockMount);
    }
    dockMount.innerHTML = renderFloatingDock();

    // Mobile Drawer
    let drawerMount = document.getElementById('nexora-mobile-drawer-mount');
    if (!drawerMount) {
      drawerMount = document.createElement('div');
      drawerMount.id = 'nexora-mobile-drawer-mount';
      document.body.appendChild(drawerMount);
    }
    drawerMount.innerHTML = renderMobileDrawer(activePageKey);
  }

  // 11. MINI PROMOTIONAL BANNERS GRID
  function renderMiniBannersGrid() {
    const banners = (typeof NEXORA_BANNERS !== 'undefined' && NEXORA_BANNERS.miniBanners) ? NEXORA_BANNERS.miniBanners : [];
    if (!banners.length) return '';

    return `
      <section class="promo-mini-banners-section" aria-label="Promotional Highlights">
        <div class="mini-banners-grid">
          ${banners.map(b => `
            <div class="mini-banner-card ${b.id}" style="background: ${b.bgGradient}; border-color: ${b.borderColor};">
              <div class="mini-banner-content">
                <div class="mini-banner-badges">
                  <span class="badge-tag ${b.accent === 'rose' ? 'badge-tag-deal' : 'badge-tag-flagship'}">${b.badge}</span>
                  <span class="mini-banner-tag">${b.tag}</span>
                </div>
                <h3 class="mini-banner-title">${b.title}</h3>
                <p class="mini-banner-sub">${b.sub}</p>
                <a href="${b.link}" class="btn btn-outline btn-sm mini-banner-cta">
                  <span>${b.btnText}</span>
                  <i class="fa-solid fa-arrow-right" style="font-size:0.75rem; margin-left:4px;"></i>
                </a>
              </div>
              <div class="mini-banner-media">
                <img src="${b.image}" alt="${b.title}" class="mini-banner-img" loading="lazy" />
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  // 12. FESTIVE FLASH COUNTDOWN BANNER
  function renderFestiveCountdownBanner() {
    const fb = (typeof NEXORA_BANNERS !== 'undefined' && NEXORA_BANNERS.festiveBanner) ? NEXORA_BANNERS.festiveBanner : {
      tag: "FESTIVE SHOWROOM EXCLUSIVE",
      badge: "LIMITED EDITION",
      title: "Bengaluru Cyber Tech Festival 2026",
      sub: "Up to 35% Showroom Discount • Extra 10% Instant Bank Cashback • Free 30-Min Fast-Track Pickup",
      couponCode: "FESTIVE2026",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80"
    };

    return `
      <section class="festive-promo-strip-section" aria-label="Festive Promotion">
        <div class="festive-banner-box">
          <div class="festive-banner-inner">
            <div class="festive-banner-text-col">
              <div class="festive-badges-row">
                <span class="badge-tag badge-tag-deal"><i class="fa-solid fa-bolt" style="margin-right:4px;"></i> ${fb.badge}</span>
                <span class="festive-tag-pill"><i class="fa-solid fa-wand-magic-sparkles" style="margin-right:4px;"></i> ${fb.tag}</span>
              </div>
              <h2 class="festive-banner-headline">${fb.title}</h2>
              <p class="festive-banner-desc">${fb.sub}</p>

              <!-- Live Countdown Clock Box -->
              <div class="countdown-clock-wrapper">
                <span class="countdown-label"><i class="fa-solid fa-stopwatch" style="color:var(--accent-cyan); margin-right:4px;"></i> SPECIAL RATES CLOSE IN:</span>
                <div class="countdown-timer-pills" id="festive-countdown-timer">
                  <div class="timer-pill"><span class="timer-num" id="timer-hours">08</span><span class="timer-unit">HRS</span></div>
                  <span class="timer-colon">:</span>
                  <div class="timer-pill"><span class="timer-num" id="timer-mins">42</span><span class="timer-unit">MINS</span></div>
                  <span class="timer-colon">:</span>
                  <div class="timer-pill"><span class="timer-num" id="timer-secs">19</span><span class="timer-unit">SECS</span></div>
                </div>
              </div>

              <!-- Action & Coupon Row -->
              <div class="festive-actions-row">
                <a href="shop.html?deal=true" class="btn btn-primary btn-lg">
                  <i class="fa-solid fa-bag-shopping" style="margin-right:6px;"></i> Shop Festival Deals
                </a>
                <div class="coupon-code-pill" onclick="navigator.clipboard.writeText('${fb.couponCode}'); if(window.NexoraApp) window.NexoraApp.showToast('Coupon code ${fb.couponCode} copied!');" title="Click to copy coupon">
                  <span class="coupon-label">PROMO CODE:</span>
                  <strong class="coupon-code-val">${fb.couponCode}</strong>
                  <i class="fa-solid fa-copy" style="font-size:0.8rem; margin-left:4px; color:var(--accent-cyan);"></i>
                </div>
              </div>
            </div>

            <div class="festive-banner-img-col">
              <img src="${fb.image}" alt="Cyber Tech Festival" class="festive-banner-art" loading="lazy" />
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // 13. AUTHORIZED BRAND PARTNERS STRIP
  function renderBrandPartnersStrip() {
    const brands = typeof NEXORA_BRANDS !== 'undefined' ? NEXORA_BRANDS : [];
    if (!brands.length) return '';

    return `
      <section class="brand-partners-showcase-section" aria-label="Authorized Brand Partners">
        <div class="brand-partners-header">
          <div>
            <h3 class="brand-partners-title">
              <i class="fa-solid fa-award" style="color:var(--accent-cyan); margin-right:6px;"></i> OFFICIAL AUTHORIZED BRAND PARTNERS
            </h3>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">100% Genuine Sealed Stock with Standard Manufacturer Serial Warranty</div>
          </div>
          <a href="shop.html" class="section-view-all-link">ALL BRANDS <i class="fa-solid fa-arrow-right" style="margin-left:4px;"></i></a>
        </div>
        <div class="brand-partners-grid">
          ${brands.map(b => `
            <a href="shop.html?brand=${encodeURIComponent(b.name)}" class="brand-card-item" title="${b.name} Authorized Store">
              <div class="brand-card-icon">${b.icon}</div>
              <div class="brand-card-name">${b.name}</div>
              <div class="brand-card-offer">${b.offer}</div>
            </a>
          `).join('')}
        </div>
      </section>
    `;
  }

  // 14. DYNAMIC CATEGORY SPOTLIGHT / HERO BANNER (FOR SHOP PAGE)
  function renderCategoryPromoBanner(categoryName = 'All Electronics') {
    return `
      <div class="category-promo-hero-banner">
        <div class="cat-promo-inner">
          <div>
            <span class="badge-tag badge-tag-flagship" style="margin-bottom:8px; display:inline-block;">
              <i class="fa-solid fa-layer-group" style="margin-right:4px;"></i> CURATED DEPARTMENT
            </span>
            <h1 class="cat-promo-title">${categoryName}</h1>
            <p class="cat-promo-desc">
              Explore authentic manufacturer sealed models with instant WhatsApp quotation, 0% EMI financing, and express same-day Bengaluru dispatch.
            </p>
          </div>
          <div class="cat-promo-badges">
            <div class="cat-stat-chip">
              <span class="stat-icon"><i class="fa-solid fa-shield-halved"></i></span>
              <div>
                <strong>Brand Sealed</strong>
                <small>Official Warranty</small>
              </div>
            </div>
            <div class="cat-stat-chip">
              <span class="stat-icon"><i class="fa-solid fa-truck-fast"></i></span>
              <div>
                <strong>30-Min Pickup</strong>
                <small>Commercial St.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 15. INSTAGRAM & REELS SHOWROOM VIDEO FEED COMPONENT
  function renderInstagramFeed() {
    const reels = typeof NEXORA_INSTAGRAM_FEED !== 'undefined' ? NEXORA_INSTAGRAM_FEED : [];
    if (!reels.length) return '';

    return `
      <section class="instagram-feed-section" aria-label="Showroom Instagram & Reels Feed">
        <div class="insta-header-wrap">
          <div class="insta-profile-block">
            <div class="insta-logo-avatar">
              <i class="fa-brands fa-instagram"></i>
            </div>
            <div>
              <div class="insta-handle-title">
                <span>nexora_electronics</span>
                <span class="insta-verified-badge" title="Verified Showroom"><i class="fa-solid fa-circle-check"></i></span>
              </div>
              <div class="insta-stats-text">
                <strong>28.5K</strong> Followers • <strong>450+</strong> Tech Reels & Unboxings • 123 Commercial St, Bengaluru
              </div>
            </div>
          </div>
          
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="insta-follow-btn">
            <i class="fa-brands fa-instagram" style="font-size:1rem;"></i>
            <span>Follow @nexora_electronics</span>
          </a>
        </div>

        <div class="insta-reels-grid">
          ${reels.map(r => `
            <article class="insta-reel-card" onclick="window.NexoraApp.openReelModal('${r.id}')" title="Watch ${r.title}">
              <div class="insta-reel-thumb-stage">
                <img src="${r.thumbnail}" alt="${r.title}" class="insta-reel-thumb-img" loading="lazy" />
                <div class="insta-reel-overlay">
                  <div class="insta-reel-top-row">
                    <span class="insta-badge-pill"><i class="fa-brands fa-instagram"></i> REEL</span>
                    <span class="insta-badge-pill" style="background:rgba(225,29,72,0.85);">${r.badge}</span>
                  </div>
                  <div class="insta-reel-play-btn">
                    <i class="fa-solid fa-play" style="margin-left:3px;"></i>
                  </div>
                  <div class="insta-reel-metrics">
                    <span><i class="fa-solid fa-play" style="font-size:0.7rem; margin-right:4px;"></i>${r.views}</span>
                    <span><i class="fa-solid fa-heart" style="font-size:0.7rem; margin-right:4px; color:#fb7185;"></i>${r.likes}</span>
                    <span style="margin-left:auto;"><i class="fa-solid fa-clock" style="font-size:0.7rem; margin-right:4px;"></i>${r.videoDuration}</span>
                  </div>
                </div>
              </div>
              <div class="insta-reel-content">
                <h4 class="insta-reel-title">${r.title}</h4>
                <div class="insta-reel-tag">
                  <i class="fa-solid fa-tag" style="font-size:0.7rem; margin-right:4px;"></i>${r.productTag}
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  // 16. HERO SLIDER CAROUSEL COMPONENT
  function renderHeroCarousel() {
    const slides = typeof NEXORA_HERO_SLIDES !== 'undefined' ? NEXORA_HERO_SLIDES : [];
    if (!slides.length) return '';

    return `
      <section class="hero-banner-section" aria-label="Featured Showroom Promotions">
        <div class="hero-banner-slider" id="nexora-hero-slider-wrap">
          ${slides.map((s, idx) => `
            <div class="hero-slide ${idx === 0 ? 'active' : ''}" data-slide-index="${idx}">
              <div>
                <span class="badge-tag badge-tag-flagship" style="margin-bottom: 12px; display:inline-block;">
                  <i class="fa-solid fa-fire" style="margin-right:4px;"></i> ${s.tag}
                </span>
                <h1 class="hero-slide-title">${s.title}</h1>
                <p class="hero-slide-sub">${s.sub}</p>
                <div style="display: flex; gap: 14px; flex-wrap: wrap;">
                  <a href="${s.btnPrimaryLink}" class="btn btn-primary btn-lg">
                    <i class="fa-solid fa-bag-shopping" style="margin-right:6px;"></i> ${s.btnPrimary}
                  </a>
                  ${s.btnSecondaryAction ? `
                    <button type="button" class="btn btn-outline btn-lg" onclick="${s.btnSecondaryAction}">
                      <i class="fa-solid fa-wand-magic-sparkles" style="margin-right:6px;"></i> ${s.btnSecondary}
                    </button>
                  ` : `
                    <a href="${s.btnSecondaryLink || 'shop.html'}" class="btn btn-outline btn-lg">
                      <i class="fa-solid fa-mobile-screen-button" style="margin-right:6px;"></i> ${s.btnSecondary}
                    </a>
                  `}
                </div>
              </div>
              <div style="text-align: center;">
                <img src="${s.image}" alt="Featured Tech" class="hero-slide-img" />
              </div>
            </div>
          `).join('')}

          <!-- Carousel Controls -->
          <div class="hero-carousel-controls">
            <button type="button" class="carousel-nav-btn" onclick="window.NexoraApp.prevHeroSlide()" aria-label="Previous Slide">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <div class="carousel-dots" id="hero-carousel-dots">
              ${slides.map((_, idx) => `
                <span class="carousel-dot ${idx === 0 ? 'active' : ''}" onclick="window.NexoraApp.goHeroSlide(${idx})"></span>
              `).join('')}
            </div>
            <button type="button" class="carousel-nav-btn" onclick="window.NexoraApp.nextHeroSlide()" aria-label="Next Slide">
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <!-- Bank Offers Banner Strip -->
        <div class="bank-offers-strip">
          <div class="bank-offer-item">
            <span style="font-size: 1.3rem; color:var(--accent-cyan);"><i class="fa-solid fa-credit-card"></i></span>
            <span><strong>HDFC / ICICI Bank:</strong> Flat 10% Instant Discount on Flagships</span>
          </div>
          <div class="bank-offer-item">
            <span style="font-size: 1.3rem; color:var(--accent-emerald);"><i class="fa-solid fa-truck-fast"></i></span>
            <span><strong>Bengaluru Express:</strong> Free Same-Day Delivery or 30-Min Pickup</span>
          </div>
          <div class="bank-offer-item">
            <span style="font-size: 1.3rem; color:var(--accent-violet);"><i class="fa-solid fa-shield-halved"></i></span>
            <span><strong>Official Warranty:</strong> 100% Brand Sealed with Serial Protection</span>
          </div>
        </div>
      </section>
    `;
  }

  // 17. CONTINUOUS MARQUEE TICKER COMPONENT
  function renderMarqueeStrip() {
    const brands = typeof NEXORA_BRANDS !== 'undefined' ? NEXORA_BRANDS : [];
    const items = [
      ...brands.map(b => ({ icon: b.icon, text: `${b.name} Authorized Showroom Partner` })),
      { icon: '<i class="fa-solid fa-bolt" style="color:#d97706;"></i>', text: "Festive Sale 2026 Live: Up to 35% Off" },
      { icon: '<i class="fa-solid fa-stopwatch" style="color:#0284c7;"></i>', text: "30-Minute Counter Pickup Desk in Commercial Street" },
      { icon: '<i class="fa-solid fa-arrows-rotate" style="color:#059669;"></i>', text: "Instant Trade-In Valuation Up to ₹65,000" },
      { icon: '<i class="fa-brands fa-whatsapp" style="color:#16a34a;"></i>', text: "Direct WhatsApp Concierge & Quotations" }
    ];

    return `
      <section class="marquee-ticker-section" style="margin: 16px 0;" aria-label="Showroom Ticker Announcements">
        <div class="marquee-container">
          <div class="marquee-content">
            ${items.concat(items).map(item => `
              <div class="marquee-item-chip">
                <span style="color:var(--accent-cyan);">${item.icon}</span>
                <span>${item.text}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  return {
    renderTopBar,
    renderHeader,
    renderCategoryNav,
    renderSubNav,
    renderFooter,
    renderProductCard,
    renderModals,
    renderFloatingDock,
    renderMobileDrawer,
    renderMiniBannersGrid,
    renderFestiveCountdownBanner,
    renderBrandPartnersStrip,
    renderCategoryPromoBanner,
    renderInstagramFeed,
    renderHeroCarousel,
    renderMarqueeStrip,
    mountGlobalComponents
  };
})();


