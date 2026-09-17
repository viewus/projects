/**
 * NEXORA ELECTRONICS — APPLICATION STATE & CONTROLLERS ENGINE
 * Cyber-Luxury Dark Glassmorphic Showroom Architecture
 * Single Source of Truth • Zero Hardcoded Gaps • Component Integrated
 * Enhanced with FontAwesome 6 Icons
 */

(function () {
  'use strict';

  // Master App State
  const state = {
    products: typeof NEXORA_PRODUCTS !== 'undefined' ? NEXORA_PRODUCTS : [],
    categories: typeof NEXORA_CATEGORIES !== 'undefined' ? NEXORA_CATEGORIES : [],
    occasions: typeof NEXORA_OCCASIONS !== 'undefined' ? NEXORA_OCCASIONS : [],
    cart: [],
    wishlist: [],
    compare: [],
    recentlyViewed: [],
    appliedCoupon: null,
    tradeInDiscount: 0,
    shippingMode: 'delivery',
    selectedOccasion: 'all',
    activeFilters: {
      category: 'all',
      occasion: 'all',
      brands: [],
      tags: [],
      priceMax: 300000,
      minRating: 0,
      inStockOnly: false,
      search: '',
      sort: 'featured'
    },
    currentProduct: null,
    selectedColor: '',
    selectedStorage: ''
  };

  // Format INR Currency
  function formatINR(amount) {
    if (isNaN(amount)) return '₹0';
    return '₹' + Number(amount).toLocaleString('en-IN');
  }

  // Persistent State Sync & Auto-Repair
  function loadPersistedData() {
    try {
      const savedCart = localStorage.getItem('nexora_cart');
      if (savedCart) {
        const rawCart = JSON.parse(savedCart);
        if (Array.isArray(rawCart)) {
          state.cart = rawCart.map(item => {
            if (!item || !item.id || item.id === 'undefined') return null;
            const fullProduct = state.products.find(p => p.id === item.id);
            if (!fullProduct && (!item.name || item.name === 'undefined')) return null;
            return {
              id: item.id,
              name: item.name && item.name !== 'undefined' ? item.name : (fullProduct ? fullProduct.name : 'Showroom Device'),
              price: typeof item.price === 'number' && !isNaN(item.price) && item.price > 0 ? item.price : (fullProduct ? fullProduct.price : 0),
              originalPrice: item.originalPrice || (fullProduct ? fullProduct.originalPrice : 0),
              thumbnail: item.thumbnail && item.thumbnail !== 'undefined' ? item.thumbnail : (fullProduct ? (fullProduct.thumbnail || (fullProduct.images && fullProduct.images[0])) : ''),
              category: item.category || (fullProduct ? fullProduct.category : 'Electronics'),
              brand: item.brand || (fullProduct ? fullProduct.brand : 'Nexora'),
              quantity: Math.max(1, parseInt(item.quantity) || 1),
              selectedColor: item.selectedColor || '',
              selectedStorage: item.selectedStorage || ''
            };
          }).filter(Boolean);
        }
      }

      const savedWishlist = localStorage.getItem('nexora_wishlist');
      if (savedWishlist) {
        const rawW = JSON.parse(savedWishlist);
        if (Array.isArray(rawW)) {
          state.wishlist = rawW.filter(id => typeof id === 'string' && id && id !== 'undefined');
        }
      }

      const savedCompare = localStorage.getItem('nexora_compare');
      if (savedCompare) {
        const rawC = JSON.parse(savedCompare);
        if (Array.isArray(rawC)) {
          state.compare = rawC.filter(id => typeof id === 'string' && id && id !== 'undefined');
        }
      }

      const savedRecent = localStorage.getItem('nexora_recent');
      if (savedRecent) {
        const rawR = JSON.parse(savedRecent);
        if (Array.isArray(rawR)) state.recentlyViewed = rawR.filter(Boolean);
      }

      const savedCoupon = localStorage.getItem('nexora_coupon');
      if (savedCoupon) state.appliedCoupon = JSON.parse(savedCoupon);
    } catch (e) {
      console.warn('LocalStorage load error:', e);
      state.cart = [];
    }
    // Automatically persist sanitized data
    savePersistedData();
  }

  function savePersistedData() {
    try {
      localStorage.setItem('nexora_cart', JSON.stringify(state.cart));
      localStorage.setItem('nexora_wishlist', JSON.stringify(state.wishlist));
      localStorage.setItem('nexora_compare', JSON.stringify(state.compare));
      localStorage.setItem('nexora_recent', JSON.stringify(state.recentlyViewed));
      if (state.appliedCoupon) {
        localStorage.setItem('nexora_coupon', JSON.stringify(state.appliedCoupon));
      } else {
        localStorage.removeItem('nexora_coupon');
      }
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    updateHeaderCounters();
    updateCompareFloatingBar();
  }

  // Toast Alerts with FontAwesome
  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.position = 'fixed';
      container.style.bottom = '24px';
      container.style.left = '24px';
      container.style.zIndex = '999999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '8px';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);
    }

    const iconHtml = type === 'wa' 
      ? '<i class="fa-brands fa-whatsapp" style="color:#25d366; font-size:1.1rem;"></i>' 
      : (type === 'error' ? '<i class="fa-solid fa-triangle-exclamation" style="color:#f43f5e; font-size:1rem;"></i>' : '<i class="fa-solid fa-bolt" style="color:var(--accent-cyan); font-size:1rem;"></i>');

    const toast = document.createElement('div');
    toast.style.background = 'rgba(11, 15, 29, 0.95)';
    toast.style.backdropFilter = 'blur(16px)';
    toast.style.color = '#ffffff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '12px';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(0, 240, 255, 0.25)';
    toast.style.fontSize = '0.88rem';
    toast.style.fontWeight = '600';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.pointerEvents = 'auto';
    toast.style.border = '1px solid rgba(255, 255, 255, 0.12)';
    toast.style.borderLeft = '4px solid ' + (type === 'wa' ? '#25d366' : (type === 'error' ? '#f43f5e' : '#00f0ff'));
    toast.innerHTML = `<span>${iconHtml}</span> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Update Header Badges
  function updateHeaderCounters() {
    const totalCartItems = state.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    document.querySelectorAll('.cart-counter-badge').forEach(el => el.textContent = totalCartItems);
    document.querySelectorAll('.wishlist-counter-badge').forEach(el => el.textContent = state.wishlist.length);
    document.querySelectorAll('.compare-counter-badge').forEach(el => el.textContent = state.compare.length);
  }

  function updateCompareFloatingBar() {
    const bar = document.getElementById('floating-compare-bar');
    if (!bar) return;
    if (state.compare.length > 0) {
      bar.style.display = 'flex';
      bar.classList.add('active');
    } else {
      bar.style.display = 'none';
      bar.classList.remove('active');
    }
  }

  // -------------------------------------------------------------
  // CART CONTROLLER
  // -------------------------------------------------------------
  function addToCart(productId, quantity = 1, btnEl = null, selectedOptions = {}) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = state.cart.findIndex(item => 
      item.id === productId && 
      item.selectedColor === (selectedOptions.color || '') &&
      item.selectedStorage === (selectedOptions.storage || '')
    );

    if (existingIndex > -1) {
      state.cart[existingIndex].quantity += quantity;
    } else {
      state.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        thumbnail: product.thumbnail || (product.images && product.images[0]) || '',
        category: product.category,
        brand: product.brand,
        quantity: quantity,
        selectedColor: selectedOptions.color || (product.variants && product.variants.color ? product.variants.color[0] : ''),
        selectedStorage: selectedOptions.storage || (product.variants && product.variants.storage ? product.variants.storage[0] : '')
      });
    }

    savePersistedData();
    showToast(`Added ${product.name} to Cart!`);

    if (btnEl) {
      const originalHtml = btnEl.innerHTML;
      btnEl.innerHTML = `<i class="fa-solid fa-check" style="margin-right:4px;"></i><span>Added!</span>`;
      btnEl.style.background = '#10b981';
      btnEl.style.borderColor = '#10b981';
      setTimeout(() => {
        btnEl.innerHTML = originalHtml;
        btnEl.style.background = '';
        btnEl.style.borderColor = '';
      }, 1500);
    }
  }

  function removeFromCart(productId, color = '', storage = '') {
    state.cart = state.cart.filter(item => !(item.id === productId && item.selectedColor === color && item.selectedStorage === storage));
    savePersistedData();
    showToast('Item removed from cart');
    if (window.location.pathname.includes('cart.html')) {
      renderCartPage();
    }
  }

  function updateCartQuantity(productId, color = '', storage = '', newQty = 1) {
    const item = state.cart.find(item => item.id === productId && item.selectedColor === color && item.selectedStorage === storage);
    if (item) {
      item.quantity = Math.max(1, parseInt(newQty) || 1);
      savePersistedData();
      if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
      }
    }
  }

  function clearCart() {
    state.cart = [];
    state.appliedCoupon = null;
    state.tradeInDiscount = 0;
    savePersistedData();
    showToast('Cart cleared');
    if (window.location.pathname.includes('cart.html')) {
      renderCartPage();
    }
  }

  function applyCoupon(codeStr) {
    if (!codeStr || !codeStr.trim()) return false;
    const code = codeStr.trim().toUpperCase();
    const configCoupons = (typeof NEXORA_CONFIG !== 'undefined' && NEXORA_CONFIG.coupons) ? NEXORA_CONFIG.coupons : [];
    const coupon = configCoupons.find(c => c.code === code);

    if (!coupon) {
      showToast('Invalid Coupon Code! Try NEXORA10 or FESTIVE2026', 'error');
      return false;
    }

    const subtotal = state.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    if (coupon.minCart && subtotal < coupon.minCart) {
      showToast(`Coupon requires minimum cart value of ${formatINR(coupon.minCart)}`, 'error');
      return false;
    }

    state.appliedCoupon = coupon;
    savePersistedData();
    showToast(`Coupon "${coupon.code}" applied successfully!`);
    if (window.location.pathname.includes('cart.html')) {
      renderCartPage();
    }
    return true;
  }

  function removeCoupon() {
    state.appliedCoupon = null;
    savePersistedData();
    showToast('Coupon removed');
    if (window.location.pathname.includes('cart.html')) {
      renderCartPage();
    }
  }

  function calculateCartTotals() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;

    if (state.appliedCoupon) {
      if (state.appliedCoupon.discountPercent) {
        discount = Math.min((subtotal * state.appliedCoupon.discountPercent) / 100, state.appliedCoupon.maxDiscount || Infinity);
      } else if (state.appliedCoupon.flatDiscount) {
        discount = state.appliedCoupon.flatDiscount;
      }
    }

    const tradeIn = state.tradeInDiscount || 0;
    const totalDiscount = Math.min(subtotal, discount + tradeIn);
    const estimatedTax = 0;
    const shipping = 0;
    const finalTotal = Math.max(0, subtotal - totalDiscount);

    return {
      subtotal,
      discount,
      tradeIn,
      totalDiscount,
      estimatedTax,
      shipping,
      finalTotal
    };
  }

  // -------------------------------------------------------------
  // WHATSAPP CHECKOUT & ORDER GENERATORS
  // -------------------------------------------------------------
  function generateWhatsAppOrderMessage(cartItems, customerInfo = null) {
    const totals = calculateCartTotals();
    const orderId = 'NX-' + Math.floor(10000 + Math.random() * 90000);

    let msg = `*🚀 NEXORA ELECTRONICS — SHOWROOM ORDER REQUEST*\n`;
    msg += `*Order ID:* #${orderId}\n`;
    msg += `*Date:* ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n`;
    msg += `------------------------------------\n`;

    cartItems.forEach((item, index) => {
      msg += `*${index + 1}. ${item.name}*\n`;
      if (item.selectedColor || item.selectedStorage) {
        msg += `   Variant: ${item.selectedColor || ''} ${item.selectedStorage ? '• ' + item.selectedStorage : ''}\n`;
      }
      msg += `   Qty: ${item.quantity} × ${formatINR(item.price)} = ${formatINR(item.price * item.quantity)}\n\n`;
    });

    msg += `------------------------------------\n`;
    msg += `*Subtotal:* ${formatINR(totals.subtotal)}\n`;
    if (totals.discount > 0) {
      msg += `*Promo Discount:* -${formatINR(totals.discount)} (${state.appliedCoupon ? state.appliedCoupon.code : ''})\n`;
    }
    if (totals.tradeIn > 0) {
      msg += `*Trade-In Deduction:* -${formatINR(totals.tradeIn)}\n`;
    }
    msg += `*Final Amount Due:* *${formatINR(totals.finalTotal)}*\n`;
    msg += `*Delivery Mode:* ${state.shippingMode === 'pickup' ? 'Fast-Track Showroom Pickup (123 Commercial St, Bengaluru)' : 'Same-Day Express Bengaluru Delivery'}\n`;

    if (customerInfo) {
      msg += `------------------------------------\n`;
      msg += `*Customer Details:*\n`;
      msg += `• Name: ${customerInfo.name || 'Showroom VIP'}\n`;
      msg += `• Phone: ${customerInfo.phone || ''}\n`;
      msg += `• Address: ${customerInfo.address || 'Bengaluru'}\n`;
      if (customerInfo.paymentMode) {
        msg += `• Preferred Payment: ${customerInfo.paymentMode}\n`;
      }
    }

    msg += `\n*Please confirm stock availability and dispatch invoice.*`;
    return encodeURIComponent(msg);
  }

  function directCartWhatsAppOrder() {
    if (state.cart.length === 0) {
      showToast('Your cart is empty! Add products first.', 'error');
      return;
    }
    const num = (typeof NEXORA_CONFIG !== 'undefined' && NEXORA_CONFIG.whatsappNumber) ? NEXORA_CONFIG.whatsappNumber : "919000000000";
    const encodedMsg = generateWhatsAppOrderMessage(state.cart);
    window.open(`https://wa.me/${num}?text=${encodedMsg}`, '_blank');
  }

  function directProductWhatsAppOrder(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    const num = (typeof NEXORA_CONFIG !== 'undefined' && NEXORA_CONFIG.whatsappNumber) ? NEXORA_CONFIG.whatsappNumber : "919000000000";
    
    let msg = `*⚡ NEXORA ELECTRONICS — DIRECT PRODUCT INQUIRY & ORDER*\n`;
    msg += `*Product:* ${product.name}\n`;
    msg += `*SKU:* ${product.sku || 'N/A'}\n`;
    msg += `*Showroom Price:* ${formatINR(product.price)}\n`;
    msg += `*Brand Warranty:* ${product.warranty || '1 Year Brand Warranty'}\n`;
    msg += `*Showroom:* 123 Commercial Street, Bengaluru\n\n`;
    msg += `Hi Nexora Concierge, I would like to purchase or test this product at the showroom today.`;

    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // -------------------------------------------------------------
  // WISHLIST CONTROLLER
  // -------------------------------------------------------------
  function toggleWishlist(productId, btnEl = null) {
    const index = state.wishlist.indexOf(productId);

    if (index > -1) {
      state.wishlist.splice(index, 1);
      showToast(`Removed from Wishlist`);
      if (btnEl) btnEl.classList.remove('active');
    } else {
      state.wishlist.push(productId);
      showToast(`Added to Wishlist! ❤️`);
      if (btnEl) btnEl.classList.add('active');
    }

    savePersistedData();
    if (window.location.pathname.includes('wishlist.html')) {
      renderWishlistPage();
    }
  }

  function isInWishlist(productId) {
    return state.wishlist.includes(productId);
  }

  function moveAllWishlistToCart() {
    if (state.wishlist.length === 0) {
      showToast('Wishlist is empty', 'error');
      return;
    }
    state.wishlist.forEach(id => {
      addToCart(id, 1);
    });
    state.wishlist = [];
    savePersistedData();
    showToast('All Wishlist items moved to Cart!');
    if (window.location.pathname.includes('wishlist.html')) {
      renderWishlistPage();
    }
  }

  function clearWishlist() {
    state.wishlist = [];
    savePersistedData();
    showToast('Wishlist cleared');
    if (window.location.pathname.includes('wishlist.html')) {
      renderWishlistPage();
    }
  }

  // -------------------------------------------------------------
  // COMPARE CONTROLLER
  // -------------------------------------------------------------
  function toggleCompare(productId, btnEl = null) {
    const index = state.compare.indexOf(productId);
    if (index > -1) {
      state.compare.splice(index, 1);
      showToast('Removed from Compare');
      if (btnEl) btnEl.classList.remove('active');
    } else {
      if (state.compare.length >= 4) {
        showToast('You can compare up to 4 devices simultaneously', 'error');
        return;
      }
      state.compare.push(productId);
      showToast('Added to Hardware Comparison!');
      if (btnEl) btnEl.classList.add('active');
    }
    savePersistedData();
  }

  function isInCompare(productId) {
    return state.compare.includes(productId);
  }

  function clearCompare() {
    state.compare = [];
    savePersistedData();
    closeModal('modal-compare');
    showToast('Comparison cleared');
  }

  function openCompareModal() {
    if (state.compare.length === 0) {
      showToast('Add 1 or more devices to comparison shootout first!', 'error');
      return;
    }
    renderCompareTable();
    openModal('modal-compare');
  }

  function renderCompareTable() {
    const container = document.getElementById('compare-modal-body') || document.getElementById('compare-modal-content');
    if (!container) return;

    const comparedProducts = state.compare.map(id => state.products.find(p => p.id === id)).filter(Boolean);

    if (comparedProducts.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px; color:var(--text-muted);">
          <i class="fa-solid fa-scale-balanced" style="font-size:2.5rem; color:var(--accent-cyan); margin-bottom:12px; display:block;"></i>
          No products selected for comparison. Add devices using the balance scale icon on product cards.
        </div>
      `;
      return;
    }

    let html = `
      <div style="overflow-x:auto;">
        <table class="compare-table" style="width:100%; border-collapse:collapse; text-align:left;">
          <thead>
            <tr>
              <th style="padding:16px; width:180px; color:var(--accent-cyan); font-family:var(--font-mono); font-size:0.8rem; border-bottom:2px solid var(--border-subtle); background:#f8fafc;">SPECIFICATION</th>
              ${comparedProducts.map(p => `
                <th style="padding:16px; min-width:220px; border-bottom:2px solid var(--border-subtle); background:#ffffff;">
                  <div style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:8px;">
                    <div style="width:90px; height:90px; border-radius:12px; background:radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f5f9 100%); border:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:center; padding:6px;">
                      <img src="${p.thumbnail || (p.images && p.images[0])}" alt="${p.name}" style="max-width:100%; max-height:100%; object-fit:contain;" />
                    </div>
                    <div style="font-weight:800; font-size:0.95rem; color:var(--text-heading); font-family:var(--font-heading);">${p.name}</div>
                    <div style="font-size:1.15rem; font-weight:900; color:var(--accent-cyan); font-family:var(--font-heading);">${formatINR(p.price)}</div>
                    <button class="btn btn-primary btn-sm" onclick="window.NexoraApp.addToCart('${p.id}', 1, this)" style="width:100%;">
                      <i class="fa-solid fa-cart-plus" style="margin-right:4px;"></i> Add to Cart
                    </button>
                  </div>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:12px 16px; font-weight:800; color:var(--text-muted); font-size:0.82rem; font-family:var(--font-mono); border-bottom:1px solid var(--border-subtle); background:#f8fafc;">DEPARTMENT</td>
              ${comparedProducts.map(p => `<td style="padding:12px 16px; color:var(--text-heading); font-weight:600; border-bottom:1px solid var(--border-subtle);">${p.category}</td>`).join('')}
            </tr>
            <tr>
              <td style="padding:12px 16px; font-weight:800; color:var(--text-muted); font-size:0.82rem; font-family:var(--font-mono); border-bottom:1px solid var(--border-subtle); background:#f8fafc;">BRAND</td>
              ${comparedProducts.map(p => `<td style="padding:12px 16px; color:var(--text-heading); font-weight:700; border-bottom:1px solid var(--border-subtle);">${p.brand}</td>`).join('')}
            </tr>
            <tr>
              <td style="padding:12px 16px; font-weight:800; color:var(--text-muted); font-size:0.82rem; font-family:var(--font-mono); border-bottom:1px solid var(--border-subtle); background:#f8fafc;">RATING</td>
              ${comparedProducts.map(p => `<td style="padding:12px 16px; color:#d97706; font-weight:700; border-bottom:1px solid var(--border-subtle);"><i class="fa-solid fa-star" style="margin-right:3px;"></i>${p.rating} (${p.reviewCount} verified)</td>`).join('')}
            </tr>
            <tr>
              <td style="padding:12px 16px; font-weight:800; color:var(--text-muted); font-size:0.82rem; font-family:var(--font-mono); border-bottom:1px solid var(--border-subtle); background:#f8fafc;">WARRANTY</td>
              ${comparedProducts.map(p => `<td style="padding:12px 16px; color:var(--text-heading); border-bottom:1px solid var(--border-subtle);"><i class="fa-solid fa-shield-halved" style="color:#059669; margin-right:4px;"></i>${p.warranty || '1 Year Brand Warranty'}</td>`).join('')}
            </tr>
            <tr>
              <td style="padding:12px 16px; font-weight:800; color:var(--text-muted); font-size:0.82rem; font-family:var(--font-mono); border-bottom:1px solid var(--border-subtle); background:#f8fafc;">TECHNICAL SPECS</td>
              ${comparedProducts.map(p => `
                <td style="padding:12px 16px; color:var(--text-main); font-size:0.85rem; line-height:1.6; border-bottom:1px solid var(--border-subtle);">
                  ${p.specifications ? Object.entries(p.specifications).map(([k, v]) => `<div style="margin-bottom:3px;"><strong style="color:var(--text-heading);">${k}:</strong> ${v}</div>`).join('') : p.shortDescription}
                </td>
              `).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    `;
    container.innerHTML = html;
  }

  // -------------------------------------------------------------
  // MODALS & DRAWER CONTROLLER
  // -------------------------------------------------------------
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function toggleMobileDrawer(forceState = null) {
    const drawer = document.getElementById('mobile-nav-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    if (!drawer || !backdrop) return;

    const isOpen = drawer.classList.contains('active');
    const newState = forceState !== null ? forceState : !isOpen;

    if (newState) {
      drawer.classList.add('active');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      drawer.classList.remove('active');
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Instagram Reel / Video Modal
  function openReelModal(reelId) {
    const feeds = typeof NEXORA_INSTAGRAM_FEED !== 'undefined' ? NEXORA_INSTAGRAM_FEED : [];
    const reel = feeds.find(r => r.id === reelId) || feeds[0];
    if (!reel) return;

    const titleEl = document.getElementById('reel-modal-title');
    const authorEl = document.getElementById('reel-modal-author');
    const bodyEl = document.getElementById('reel-modal-body');

    if (titleEl) titleEl.textContent = reel.title;
    if (authorEl) authorEl.textContent = `${reel.author} • Showroom Video Reel`;

    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:24px; align-items:center;">
          <div style="position:relative; border-radius:14px; overflow:hidden; background:#0f172a; box-shadow:0 10px 30px rgba(15,23,42,0.2);">
            <img src="${reel.thumbnail}" alt="${reel.title}" style="width:100%; height:380px; object-fit:cover; display:block;" />
            <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%); display:flex; flex-direction:column; justify-content:space-between; padding:16px;">
              <span class="badge-tag badge-tag-deal" style="width:fit-content;"><i class="fa-brands fa-instagram"></i> ${reel.badge}</span>
              <div style="display:flex; justify-content:center; align-items:center; flex:1;">
                <div style="width:60px; height:60px; border-radius:50%; background:rgba(255,255,255,0.95); color:#e11d48; display:flex; align-items:center; justify-content:center; font-size:1.5rem; box-shadow:0 4px 20px rgba(0,0,0,0.4); cursor:pointer;" onclick="window.NexoraApp.showToast('Playing showroom demo video clip...')">
                  <i class="fa-solid fa-play" style="margin-left:4px;"></i>
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; color:#ffffff; font-size:0.8rem; font-weight:700;">
                <span><i class="fa-solid fa-eye" style="margin-right:4px;"></i> ${reel.views} Views</span>
                <span><i class="fa-solid fa-heart" style="color:#fb7185; margin-right:4px;"></i> ${reel.likes} Likes</span>
                <span><i class="fa-solid fa-clock" style="margin-right:4px;"></i> ${reel.videoDuration}</span>
              </div>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:14px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:44px; height:44px; border-radius:50%; background:var(--accent-instagram); color:#ffffff; display:flex; align-items:center; justify-content:center; font-size:1.3rem;">
                <i class="fa-brands fa-instagram"></i>
              </div>
              <div>
                <strong style="color:var(--text-heading); font-size:1rem; display:flex; align-items:center; gap:4px;">
                  ${reel.author}
                  <i class="fa-solid fa-circle-check" style="color:var(--accent-cyan); font-size:0.85rem;"></i>
                </strong>
                <span style="display:block; font-size:0.75rem; color:var(--text-muted);">Official Authorized Electronics Showroom</span>
              </div>
            </div>

            <p style="font-size:0.9rem; color:var(--text-main); line-height:1.5;">
              ${reel.caption}
            </p>

            <div style="background:#f8fafc; border:1px solid var(--border-subtle); padding:14px; border-radius:12px;">
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.04em;">Featured Showroom Tech</div>
              <div style="font-size:1rem; font-weight:900; color:var(--text-heading);">${reel.productTag}</div>
            </div>

            <div style="display:flex; gap:10px; margin-top:8px;">
              <button type="button" class="btn btn-primary" onclick="window.NexoraApp.directProductWhatsAppOrder('${reel.productId}'); window.NexoraApp.closeModal('modal-reel');" style="flex:1;">
                <i class="fa-brands fa-whatsapp" style="margin-right:6px;"></i> Inquire on WhatsApp
              </button>
              <a href="product.html?id=${reel.productId}" class="btn btn-outline" onclick="window.NexoraApp.closeModal('modal-reel')" title="View Tech Specifications">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            </div>
          </div>
        </div>
      `;
    }

    openModal('modal-reel');
  }

  // Hero Slider Carousel Controller
  let currentHeroSlide = 0;
  let heroSlideTimer = null;

  function goHeroSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    if (!slides.length) return;

    currentHeroSlide = (index + slides.length) % slides.length;
    slides.forEach((s, idx) => {
      if (idx === currentHeroSlide) s.classList.add('active');
      else s.classList.remove('active');
    });
    dots.forEach((d, idx) => {
      if (idx === currentHeroSlide) d.classList.add('active');
      else d.classList.remove('active');
    });
  }

  function nextHeroSlide() {
    goHeroSlide(currentHeroSlide + 1);
  }

  function prevHeroSlide() {
    goHeroSlide(currentHeroSlide - 1);
  }

  function initHeroCarousel() {
    const sliderWrap = document.getElementById('nexora-hero-slider-wrap');
    if (!sliderWrap) return;

    goHeroSlide(0);

    if (heroSlideTimer) clearInterval(heroSlideTimer);
    heroSlideTimer = setInterval(() => {
      nextHeroSlide();
    }, 5000);

    sliderWrap.addEventListener('mouseenter', () => {
      if (heroSlideTimer) clearInterval(heroSlideTimer);
    });
    sliderWrap.addEventListener('mouseleave', () => {
      heroSlideTimer = setInterval(() => {
        nextHeroSlide();
      }, 5000);
    });
  }

  // AI Tech Advisor Wizard
  function openAdvisorModal() {
    initAdvisorWizard();
    openModal('modal-advisor');
  }

  function initAdvisorWizard() {
    const container = document.getElementById('advisor-wizard-container');
    if (!container) return;

    let step = 1;
    let selectedDept = 'smartphones';
    let selectedBudget = 'any';
    let selectedPriority = 'performance';

    function renderStep() {
      if (step === 1) {
        container.innerHTML = `
          <div style="margin-bottom:20px;">
            <div style="font-size:0.85rem; color:var(--accent-cyan); font-weight:800; font-family:var(--font-mono); margin-bottom:6px;">STEP 1 OF 3</div>
            <h4 style="font-size:1.15rem; color:#ffffff; margin-bottom:14px;">What category of hardware are you looking for?</h4>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:10px;">
              ${[
                { id: 'Smartphones', icon: '<i class="fa-solid fa-mobile-screen"></i>', label: 'Smartphones' },
                { id: 'Laptops', icon: '<i class="fa-solid fa-laptop"></i>', label: 'Laptops' },
                { id: 'Televisions', icon: '<i class="fa-solid fa-tv"></i>', label: '4K OLED TVs' },
                { id: 'Audio', icon: '<i class="fa-solid fa-headphones"></i>', label: 'Studio Audio' },
                { id: 'Gaming', icon: '<i class="fa-solid fa-gamepad"></i>', label: 'Gaming Rigs' },
                { id: 'Cameras', icon: '<i class="fa-solid fa-camera"></i>', label: 'Mirrorless' }
              ].map(item => `
                <button type="button" class="btn ${selectedDept === item.id ? 'btn-primary' : 'btn-outline'}" 
                        onclick="window._advSelDept('${item.id}')" 
                        style="padding:14px 10px; display:flex; flex-direction:column; align-items:center; gap:6px;">
                  <span style="font-size:1.4rem;">${item.icon}</span>
                  <span style="font-size:0.85rem;">${item.label}</span>
                </button>
              `).join('')}
            </div>
            <button class="btn btn-primary" onclick="window._advNext()" style="width:100%; margin-top:20px;">Continue to Budget →</button>
          </div>
        `;
      } else if (step === 2) {
        container.innerHTML = `
          <div style="margin-bottom:20px;">
            <div style="font-size:0.85rem; color:var(--accent-cyan); font-weight:800; font-family:var(--font-mono); margin-bottom:6px;">STEP 2 OF 3</div>
            <h4 style="font-size:1.15rem; color:#ffffff; margin-bottom:14px;">What is your target investment budget?</h4>
            <div style="display:flex; flex-direction:column; gap:10px;">
              ${[
                { id: 'budget', label: 'Under ₹50,000 (Value Flagships)' },
                { id: 'mid', label: '₹50,000 – ₹1,20,000 (Executive Pro)' },
                { id: 'high', label: '₹1,20,000+ (Ultra-Enthusiast & Studio Grade)' },
                { id: 'any', label: 'No Budget Limit — Best Performance' }
              ].map(b => `
                <button type="button" class="btn ${selectedBudget === b.id ? 'btn-primary' : 'btn-outline'}" 
                        onclick="window._advSelBudget('${b.id}')" 
                        style="text-align:left; justify-content:flex-start; padding:12px 16px;">
                  ${b.label}
                </button>
              `).join('')}
            </div>
            <div style="display:flex; gap:10px; margin-top:20px;">
              <button class="btn btn-outline" onclick="window._advBack()">← Back</button>
              <button class="btn btn-primary" onclick="window._advNext()" style="flex:1;">Next: Primary Use-Case →</button>
            </div>
          </div>
        `;
      } else if (step === 3) {
        container.innerHTML = `
          <div style="margin-bottom:20px;">
            <div style="font-size:0.85rem; color:var(--accent-cyan); font-weight:800; font-family:var(--font-mono); margin-bottom:6px;">STEP 3 OF 3</div>
            <h4 style="font-size:1.15rem; color:#ffffff; margin-bottom:14px;">What is your top technical priority?</h4>
            <div style="display:flex; flex-direction:column; gap:10px;">
              ${[
                { id: 'performance', icon: '<i class="fa-solid fa-bolt" style="margin-right:6px; color:var(--accent-cyan);"></i>', label: 'Maximum Raw Speed, Ray Tracing & Compute' },
                { id: 'creator', icon: '<i class="fa-solid fa-video" style="margin-right:6px; color:var(--accent-cyan);"></i>', label: 'Pro Color Accuracy, Cameras & 4K Recording' },
                { id: 'battery', icon: '<i class="fa-solid fa-battery-full" style="margin-right:6px; color:#10b981;"></i>', label: 'All-Day Battery & Lightweight Mobility' },
                { id: 'acoustics', icon: '<i class="fa-solid fa-headphones" style="margin-right:6px; color:var(--accent-gold);"></i>', label: 'Studio Fidelity, ANC & Immersive Dolby Atmos' }
              ].map(p => `
                <button type="button" class="btn ${selectedPriority === p.id ? 'btn-primary' : 'btn-outline'}" 
                        onclick="window._advSelPriority('${p.id}')" 
                        style="text-align:left; justify-content:flex-start; padding:12px 16px;">
                  ${p.icon} ${p.label}
                </button>
              `).join('')}
            </div>
            <div style="display:flex; gap:10px; margin-top:20px;">
              <button class="btn btn-outline" onclick="window._advBack()">← Back</button>
              <button class="btn btn-primary" onclick="window._advFinish()" style="flex:1;"><i class="fa-solid fa-wand-magic-sparkles" style="margin-right:4px;"></i> Find My Perfect Match</button>
            </div>
          </div>
        `;
      } else {
        // Recommendations Result
        let matches = state.products.filter(p => p.category.toLowerCase().includes(selectedDept.toLowerCase()));
        if (selectedBudget === 'budget') matches = matches.filter(p => p.price <= 50000);
        else if (selectedBudget === 'mid') matches = matches.filter(p => p.price > 50000 && p.price <= 120000);
        else if (selectedBudget === 'high') matches = matches.filter(p => p.price > 120000);

        if (matches.length === 0) matches = state.products.slice(0, 3);
        else matches = matches.slice(0, 3);

        container.innerHTML = `
          <div>
            <div style="text-align:center; margin-bottom:18px;">
              <span style="font-size:2rem; color:var(--accent-cyan);"><i class="fa-solid fa-bullseye"></i></span>
              <h4 style="font-size:1.2rem; color:#ffffff; margin:6px 0 2px;">AI Matched Hardware Recommendations</h4>
              <p style="font-size:0.82rem; color:#94a3b8;">Engineered for your criteria in Bengaluru stock</p>
            </div>
            <div style="display:grid; grid-template-columns:1fr; gap:12px;">
              ${matches.map(p => window.NexoraComponents.renderProductCard(p)).join('')}
            </div>
            <button class="btn btn-outline" onclick="window.NexoraApp.openAdvisorModal()" style="width:100%; margin-top:16px;"><i class="fa-solid fa-arrows-rotate" style="margin-right:4px;"></i> Restart AI Advisor</button>
          </div>
        `;
      }
    }

    window._advSelDept = (d) => { selectedDept = d; renderStep(); };
    window._advSelBudget = (b) => { selectedBudget = b; renderStep(); };
    window._advSelPriority = (p) => { selectedPriority = p; renderStep(); };
    window._advNext = () => { step++; renderStep(); };
    window._advBack = () => { step--; renderStep(); };
    window._advFinish = () => { step = 4; renderStep(); };

    renderStep();
  }

  // Trade-In Exchange Calculator
  function openExchangeModal() {
    initExchangeCalculator();
    openModal('modal-exchange');
  }

  function initExchangeCalculator() {
    const container = document.getElementById('exchange-modal-body');
    if (!container) return;

    container.innerHTML = `
      <form id="tradein-calculator-form" onsubmit="window.NexoraApp.calculateTradeInValue(event)">
        <div class="modal-form-grid">
          <div class="form-group">
            <label class="form-label">Old Device Type *</label>
            <select class="form-select" id="tradein-type" required>
              <option value="smartphone">Smartphone</option>
              <option value="laptop">Laptop / MacBook</option>
              <option value="tablet">iPad / Tablet</option>
              <option value="smartwatch">Smartwatch</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Brand *</label>
            <select class="form-select" id="tradein-brand" required>
              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="OnePlus">OnePlus</option>
              <option value="Dell">Dell</option>
              <option value="Sony">Sony</option>
              <option value="Other">Other Premium Brand</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Model Name / Year *</label>
            <input type="text" class="form-input" id="tradein-model" required placeholder="e.g. iPhone 14 Pro 128GB" />
          </div>
          <div class="form-group">
            <label class="form-label">Device Working Condition *</label>
            <select class="form-select" id="tradein-condition" required>
              <option value="flawless">Flawless (No scratches, 100% functional, original box)</option>
              <option value="good">Good (Minor cosmetic wear, fully working screen & battery)</option>
              <option value="fair">Fair (Scratches/dents, functional screen)</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary btn-lg" style="width:100%; margin-top:10px;">
            <i class="fa-solid fa-bolt" style="margin-right:4px;"></i> Calculate Instant Trade-In Discount
          </button>
        </div>
      </form>
      <div id="tradein-result-box" style="margin-top:20px; display:none;"></div>
    `;
  }

  function calculateTradeInValue(e) {
    if (e) e.preventDefault();
    const type = document.getElementById('tradein-type').value;
    const brand = document.getElementById('tradein-brand').value;
    const model = document.getElementById('tradein-model').value;
    const condition = document.getElementById('tradein-condition').value;

    let baseVal = 25000;
    if (brand === 'Apple') baseVal = 42000;
    else if (brand === 'Samsung') baseVal = 32000;
    else if (brand === 'OnePlus') baseVal = 22000;

    let multiplier = 1;
    if (condition === 'flawless') multiplier = 1.15;
    else if (condition === 'good') multiplier = 0.9;
    else if (condition === 'fair') multiplier = 0.65;

    const estimatedVal = Math.round(baseVal * multiplier);
    state.tradeInDiscount = estimatedVal;

    const resultBox = document.getElementById('tradein-result-box');
    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div style="background:rgba(16, 185, 129, 0.12); border:1px solid rgba(16, 185, 129, 0.35); border-radius:12px; padding:20px; text-align:center;">
          <div style="font-size:0.8rem; font-weight:800; color:#34d399; font-family:var(--font-mono);">ESTIMATED SPOT VALUATION</div>
          <div style="font-size:2rem; font-weight:900; color:#ffffff; margin:6px 0;">${formatINR(estimatedVal)}</div>
          <p style="font-size:0.82rem; color:#cbd5e1; margin-bottom:14px;">Guaranteed showroom discount for your ${brand} ${model}</p>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-primary" onclick="window.NexoraApp.applyTradeInDiscount(${estimatedVal})" style="flex:1;">Apply to Cart Discount</button>
            <button class="btn btn-wa-green" onclick="window.NexoraApp.shareTradeInOnWhatsApp('${brand}', '${model}', ${estimatedVal})"><i class="fa-brands fa-whatsapp" style="margin-right:4px;"></i> Inquire on WhatsApp</button>
          </div>
        </div>
      `;
    }
  }

  function applyTradeInDiscount(val) {
    state.tradeInDiscount = val;
    savePersistedData();
    closeModal('modal-exchange');
    showToast(`Trade-in voucher of ${formatINR(val)} applied to order!`);
    if (window.location.pathname.includes('cart.html')) {
      renderCartPage();
    }
  }

  function shareTradeInOnWhatsApp(brand, model, val) {
    const num = (typeof NEXORA_CONFIG !== 'undefined' && NEXORA_CONFIG.whatsappNumber) ? NEXORA_CONFIG.whatsappNumber : "919000000000";
    let msg = `*🔄 NEXORA ELECTRONICS — SHOWROOM TRADE-IN VALUATION*\n`;
    msg += `• Device: ${brand} ${model}\n`;
    msg += `• Estimated Valuation: ${formatINR(val)}\n`;
    msg += `Hi Nexora, I would like to exchange this device at the Bengaluru showroom for instant upgrade credit.`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // 0% No-Cost EMI Calculator
  function openEmiCalculator(amount = 99900) {
    const container = document.getElementById('emi-modal-body');
    if (!container) return;

    const tenures = [
      { months: 3, rate: 0, partner: 'HDFC / ICICI No-Cost EMI' },
      { months: 6, rate: 0, partner: 'Bajaj Finserv / Axis 0%' },
      { months: 9, rate: 0, partner: 'Standard Chartered 0%' },
      { months: 12, rate: 0, partner: 'Kotak / SBI Card 0%' },
      { months: 18, rate: 12, partner: 'Standard Low-Interest' },
      { months: 24, rate: 13.5, partner: 'Standard Low-Interest' }
    ];

    container.innerHTML = `
      <div>
        <div style="margin-bottom:18px;">
          <label class="form-label">Order Total to Finance</label>
          <div style="display:flex; gap:10px;">
            <input type="number" class="form-input" id="emi-calc-amt" value="${amount}" min="5000" step="1000" oninput="window._recalcEmi(this.value)" />
            <button class="btn btn-primary" onclick="window._recalcEmi(document.getElementById('emi-calc-amt').value)">Calculate</button>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;" id="emi-plans-list">
          <!-- Rendered by window._recalcEmi -->
        </div>
      </div>
    `;

    window._recalcEmi = (amt) => {
      const parsed = Math.max(1000, Number(amt) || 1000);
      const listEl = document.getElementById('emi-plans-list');
      if (!listEl) return;

      listEl.innerHTML = tenures.map(t => {
        const monthly = Math.round(parsed / t.months);
        return `
          <div style="background:rgba(15, 23, 42, 0.7); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:14px 18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div>
              <div style="font-weight:800; font-size:1rem; color:#ffffff;">${t.months} Months ${t.rate === 0 ? '<span style="color:#10b981; font-size:0.75rem; border:1px solid #10b981; padding:2px 6px; border-radius:4px; margin-left:6px;">0% NO-COST</span>' : ''}</div>
              <div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">${t.partner}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:1.15rem; font-weight:900; color:var(--accent-cyan); font-family:var(--font-mono);">${formatINR(monthly)} / mo</div>
              <div style="font-size:0.75rem; color:#64748b;">Total: ${formatINR(parsed)}</div>
            </div>
          </div>
        `;
      }).join('');
    };

    window._recalcEmi(amount);
    openModal('modal-emi');
  }

  // VIP Booking
  function openBookingModal() {
    openModal('modal-booking');
  }

  function submitVipBooking(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('book-name').value;
    const phone = document.getElementById('book-phone').value;
    const session = document.getElementById('book-session').value;
    const date = document.getElementById('book-date').value;
    const time = document.getElementById('book-time').value;
    const devices = document.getElementById('book-devices').value;

    const num = (typeof NEXORA_CONFIG !== 'undefined' && NEXORA_CONFIG.whatsappNumber) ? NEXORA_CONFIG.whatsappNumber : "919000000000";
    let msg = `*📅 NEXORA SHOWROOM — VIP DEMO RESERVATION*\n`;
    msg += `• Name: ${name}\n`;
    msg += `• WhatsApp: ${phone}\n`;
    msg += `• Session Type: ${session}\n`;
    msg += `• Date & Time: ${date} at ${time}\n`;
    if (devices) msg += `• Requested Hardware to Test: ${devices}\n`;
    msg += `\nPlease confirm my VIP showroom time slot at 123 Commercial Street, Bengaluru.`;

    closeModal('modal-booking');
    showToast('VIP Booking submitted! Opening WhatsApp confirmation...', 'wa');
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // Live Track Order
  function openTrackOrderModal() {
    openModal('modal-track');
  }

  function queryOrderStatus() {
    const input = document.getElementById('track-order-id');
    const orderId = input ? input.value.trim() : '';
    if (!orderId) {
      showToast('Please enter an order ID', 'error');
      return;
    }
    showToast(`Retrieved live tracking for ${orderId}!`);
  }

  // Quick View Product Modal
  function openQuickView(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const titleEl = document.getElementById('qv-title');
    const bodyEl = document.getElementById('qv-body');
    if (titleEl) titleEl.textContent = product.name;
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:start;">
          <div>
            <img src="${product.thumbnail || product.images[0]}" alt="${product.name}" style="width:100%; border-radius:12px; background:rgba(255,255,255,0.03); max-height:280px; object-fit:contain;" />
          </div>
          <div>
            <div style="display:flex; gap:8px; margin-bottom:8px;">
              <span class="badge-tag badge-tag-flagship">${product.brand}</span>
              <span class="badge-tag">${product.category}</span>
            </div>
            <h4 style="font-size:1.3rem; color:#ffffff; font-weight:800; margin-bottom:8px;">${product.name}</h4>
            <div style="font-size:1.4rem; font-weight:900; color:var(--accent-cyan); margin-bottom:12px; font-family:var(--font-heading);">
              ${formatINR(product.price)}
              ${product.originalPrice ? `<span style="font-size:0.9rem; color:#64748b; text-decoration:line-through; margin-left:8px;">${formatINR(product.originalPrice)}</span>` : ''}
            </div>
            <p style="font-size:0.85rem; color:#94a3b8; line-height:1.6; margin-bottom:16px;">
              ${product.description || product.shortDescription}
            </p>
            <div style="display:flex; gap:10px;">
              <button class="btn btn-primary" onclick="window.NexoraApp.addToCart('${product.id}', 1, this); window.NexoraApp.closeModal('modal-quickview');"><i class="fa-solid fa-cart-plus" style="margin-right:4px;"></i> Add to Cart</button>
              <a href="product.html?id=${product.id}" class="btn btn-outline">Full Specs Page →</a>
            </div>
          </div>
        </div>
      `;
    }
    openModal('modal-quickview');
  }

  // -------------------------------------------------------------
  // UNIVERSAL LIVE SEARCH AUTOCOMPLETE
  // -------------------------------------------------------------
  function setupLiveSearch() {
    const input = document.getElementById('global-search-input');
    const autoBox = document.getElementById('global-search-autocomplete');
    const btn = document.getElementById('global-search-btn');

    if (!input || !autoBox) return;

    input.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!query || query.length < 2) {
        autoBox.classList.remove('active');
        autoBox.innerHTML = '';
        return;
      }

      const matchedProducts = state.products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(query)))
      ).slice(0, 6);

      if (matchedProducts.length === 0) {
        autoBox.innerHTML = `<div style="padding:14px; text-align:center; color:#94a3b8; font-size:0.85rem;"><i class="fa-solid fa-magnifying-glass" style="margin-right:6px;"></i> No direct matching tech found. Press enter to search full catalogue.</div>`;
      } else {
        autoBox.innerHTML = matchedProducts.map(p => `
          <div class="search-suggestion-item" onclick="window.location.href='product.html?id=${p.id}'">
            <img src="${p.thumbnail || p.images[0]}" alt="${p.name}" class="search-suggestion-thumb" />
            <div class="search-suggestion-details">
              <div class="search-suggestion-title">${p.name}</div>
              <div class="search-suggestion-meta">
                <span>${p.brand}</span> • <span>${p.category}</span>
              </div>
            </div>
            <div class="search-suggestion-price">${formatINR(p.price)}</div>
          </div>
        `).join('');
      }

      autoBox.classList.add('active');
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = input.value.trim();
        if (query) {
          window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
        }
      }
    });

    if (btn) {
      btn.addEventListener('click', () => {
        const query = input.value.trim();
        if (query) {
          window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
        }
      });
    }

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !autoBox.contains(e.target)) {
        autoBox.classList.remove('active');
      }
    });
  }

  // -------------------------------------------------------------
  // PAGE INITIALIZERS
  // -------------------------------------------------------------

  function startFestiveCountdown() {
    function updateClock() {
      const now = new Date();
      const target = new Date();
      target.setHours(23, 59, 59, 999);
      const diff = Math.max(0, target - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const hEl = document.getElementById('timer-hours');
      const mEl = document.getElementById('timer-mins');
      const sEl = document.getElementById('timer-secs');
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(mins).padStart(2, '0');
      if (sEl) sEl.textContent = String(secs).padStart(2, '0');
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  // 1. HOME PAGE
  function initHomePage() {
    // Mount Hero Carousel
    const heroMount = document.getElementById('nexora-hero-carousel-mount');
    if (heroMount && window.NexoraComponents) {
      heroMount.innerHTML = window.NexoraComponents.renderHeroCarousel();
      initHeroCarousel();
    }

    // Mount Marquee Strip
    const marqueeMount = document.getElementById('nexora-marquee-mount');
    if (marqueeMount && window.NexoraComponents) {
      marqueeMount.innerHTML = window.NexoraComponents.renderMarqueeStrip();
    }

    // Mount Mini Banners
    const miniMount = document.getElementById('nexora-mini-banners-mount');
    if (miniMount && window.NexoraComponents) {
      miniMount.innerHTML = window.NexoraComponents.renderMiniBannersGrid();
    }

    // Mount Festive Banner & Start Timer
    const festiveMount = document.getElementById('nexora-festive-banner-mount');
    if (festiveMount && window.NexoraComponents) {
      festiveMount.innerHTML = window.NexoraComponents.renderFestiveCountdownBanner();
      startFestiveCountdown();
    }

    // Mount Instagram / Showroom Video Reels Feed
    const instaMount = document.getElementById('nexora-instagram-feed-mount');
    if (instaMount && window.NexoraComponents) {
      instaMount.innerHTML = window.NexoraComponents.renderInstagramFeed();
    }

    // Mount Authorized Brand Partners Strip
    const brandsMount = document.getElementById('nexora-brands-mount');
    if (brandsMount && window.NexoraComponents) {
      brandsMount.innerHTML = window.NexoraComponents.renderBrandPartnersStrip();
    }

    const occasionTabsMount = document.getElementById('home-occasion-tabs');
    const occasionGridMount = document.getElementById('home-occasion-products-grid');

    if (occasionTabsMount && occasionGridMount) {
      const renderOccasionProducts = (occId) => {
        let prods = state.products;
        if (occId !== 'all') {
          prods = prods.filter(p => p.occasions && p.occasions.includes(occId));
        }
        occasionGridMount.innerHTML = prods.slice(0, 4).map(p => window.NexoraComponents.renderProductCard(p)).join('');
      };

      occasionTabsMount.innerHTML = state.occasions.map((occ, idx) => `
        <button type="button" 
                class="btn ${idx === 0 ? 'btn-primary' : 'btn-outline'} occasion-tab-btn" 
                data-occasion="${occ.id}" 
                onclick="window._selectOccasion('${occ.id}', this)"
                style="white-space:nowrap; padding:8px 16px; font-size:0.85rem;">
          <span style="margin-right:6px;">${occ.icon}</span> ${occ.name}
        </button>
      `).join('');

      window._selectOccasion = (occId, btn) => {
        document.querySelectorAll('.occasion-tab-btn').forEach(b => {
          b.className = 'btn btn-outline occasion-tab-btn';
        });
        btn.className = 'btn btn-primary occasion-tab-btn';
        renderOccasionProducts(occId);
      };

      renderOccasionProducts('all');
    }

    const flashGrid = document.getElementById('home-flash-deals-grid');
    if (flashGrid) {
      const dealProducts = state.products.filter(p => p.isDeal || p.discount >= 10).slice(0, 4);
      flashGrid.innerHTML = dealProducts.map(p => window.NexoraComponents.renderProductCard(p)).join('');
    }

    const phoneGrid = document.getElementById('home-smartphones-grid');
    if (phoneGrid) {
      const phoneProds = state.products.filter(p => p.category === 'Smartphones').slice(0, 4);
      phoneGrid.innerHTML = phoneProds.map(p => window.NexoraComponents.renderProductCard(p)).join('');
    }

    const laptopGrid = document.getElementById('home-laptops-grid');
    if (laptopGrid) {
      const laptopProds = state.products.filter(p => p.category === 'Laptops' || p.category === 'Laptops & Computing').slice(0, 4);
      laptopGrid.innerHTML = laptopProds.map(p => window.NexoraComponents.renderProductCard(p)).join('');
    }

    const trendGrid = document.getElementById('home-trending-grid');
    if (trendGrid) {
      const trendProds = state.products.filter(p => p.isBestSeller || p.isFeatured).slice(0, 4);
      trendGrid.innerHTML = trendProds.map(p => window.NexoraComponents.renderProductCard(p)).join('');
    }
  }

  // 2. SHOP / CATALOGUE PAGE
  function initShopPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('category') || 'all';
    const occParam = urlParams.get('occasion') || 'all';
    const dealParam = urlParams.get('deal') === 'true';
    const tagParam = urlParams.get('tag') || '';
    const searchParam = urlParams.get('search') || '';

    state.activeFilters.category = catParam;
    state.activeFilters.occasion = occParam;
    state.activeFilters.search = searchParam;
    if (dealParam) state.activeFilters.dealOnly = true;
    if (tagParam) state.activeFilters.tags = [tagParam];

    renderShopFilters();
    applyShopFilters();
  }

  function renderShopFilters() {
    const brandFilterContainer = document.getElementById('filter-brands-list');
    if (brandFilterContainer) {
      const allBrands = [...new Set(state.products.map(p => p.brand))].filter(Boolean);
      brandFilterContainer.innerHTML = allBrands.map(b => `
        <label class="filter-check-item">
          <input type="checkbox" value="${b}" onchange="window.NexoraApp.onBrandFilterChange(this)" />
          <span>${b}</span>
        </label>
      `).join('');
    }

    const catFilterContainer = document.getElementById('filter-categories-list');
    if (catFilterContainer) {
      catFilterContainer.innerHTML = `
        <label class="filter-check-item">
          <input type="radio" name="shop-category-radio" value="all" ${state.activeFilters.category === 'all' ? 'checked' : ''} onchange="window.NexoraApp.onCategoryFilterChange('all')" />
          <span>All Departments</span>
        </label>
        ${state.categories.map(c => `
          <label class="filter-check-item">
            <input type="radio" name="shop-category-radio" value="${c.name}" ${state.activeFilters.category.toLowerCase() === c.name.toLowerCase() ? 'checked' : ''} onchange="window.NexoraApp.onCategoryFilterChange('${c.name}')" />
            <span><span style="color:var(--accent-cyan); width:16px; display:inline-block;">${c.icon}</span> ${c.name}</span>
          </label>
        `).join('')}
      `;
    }
  }

  function onBrandFilterChange(checkbox) {
    if (checkbox.checked) {
      state.activeFilters.brands.push(checkbox.value);
    } else {
      state.activeFilters.brands = state.activeFilters.brands.filter(b => b !== checkbox.value);
    }
    applyShopFilters();
  }

  function onCategoryFilterChange(categoryName) {
    state.activeFilters.category = categoryName;
    applyShopFilters();
  }

  function onPriceFilterChange(maxVal) {
    state.activeFilters.priceMax = Number(maxVal);
    const label = document.getElementById('price-slider-value');
    if (label) label.textContent = formatINR(maxVal);
    applyShopFilters();
  }

  function onSortChange(sortVal) {
    state.activeFilters.sort = sortVal;
    applyShopFilters();
  }

  function resetAllFilters() {
    state.activeFilters = {
      category: 'all',
      occasion: 'all',
      brands: [],
      tags: [],
      priceMax: 300000,
      minRating: 0,
      inStockOnly: false,
      search: '',
      sort: 'featured'
    };
    renderShopFilters();
    applyShopFilters();
  }

  function applyShopFilters() {
    let filtered = [...state.products];

    if (state.activeFilters.category && state.activeFilters.category !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase().includes(state.activeFilters.category.toLowerCase()));
    }

    if (state.activeFilters.occasion && state.activeFilters.occasion !== 'all') {
      filtered = filtered.filter(p => p.occasions && p.occasions.includes(state.activeFilters.occasion));
    }

    if (state.activeFilters.dealOnly) {
      filtered = filtered.filter(p => p.isDeal || p.discount >= 10);
    }

    if (state.activeFilters.brands.length > 0) {
      filtered = filtered.filter(p => state.activeFilters.brands.includes(p.brand));
    }

    if (state.activeFilters.tags.length > 0) {
      filtered = filtered.filter(p => p.tags && p.tags.some(t => state.activeFilters.tags.includes(t)));
    }

    if (state.activeFilters.search) {
      const q = state.activeFilters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(q))
      );
    }

    if (state.activeFilters.priceMax) {
      filtered = filtered.filter(p => p.price <= state.activeFilters.priceMax);
    }

    if (state.activeFilters.inStockOnly) {
      filtered = filtered.filter(p => p.stockStatus === 'In Stock');
    }

    if (state.activeFilters.sort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (state.activeFilters.sort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (state.activeFilters.sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (state.activeFilters.sort === 'discount') {
      filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }

    const shopHeroMount = document.getElementById('nexora-shop-hero-mount');
    if (shopHeroMount && window.NexoraComponents) {
      let heroTitle = 'All Electronics Catalogue';
      if (state.activeFilters.category !== 'all') {
        heroTitle = state.activeFilters.category;
      } else if (state.activeFilters.dealOnly) {
        heroTitle = '⚡ Festive Flash Deals of the Day';
      } else if (state.activeFilters.occasion !== 'all') {
        const occObj = state.occasions.find(o => o.id === state.activeFilters.occasion);
        heroTitle = occObj ? occObj.name : 'Curated Hardware Occasion';
      } else if (state.activeFilters.search) {
        heroTitle = `Search Results: "${state.activeFilters.search}"`;
      }
      shopHeroMount.innerHTML = window.NexoraComponents.renderCategoryPromoBanner(heroTitle);
    }

    const countEl = document.getElementById('shop-results-count');
    if (countEl) countEl.textContent = `Showing ${filtered.length} of ${state.products.length} Products`;

    const gridEl = document.getElementById('shop-products-grid');
    if (gridEl) {
      if (filtered.length === 0) {
        gridEl.innerHTML = `
          <div style="grid-column: 1 / -1; text-align:center; padding:60px 24px; background:#ffffff; border-radius:20px; border:1px solid var(--border-subtle); box-shadow:var(--shadow-sm);">
            <div style="width:76px; height:76px; border-radius:50%; background:var(--accent-cyan-light); color:var(--accent-cyan); display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 18px;">
              <i class="fa-solid fa-magnifying-glass"></i>
            </div>
            <h3 style="font-size:1.4rem; color:var(--text-heading); font-family:var(--font-heading); font-weight:800; margin-bottom:8px;">No Matching Electronics Found</h3>
            <p style="color:var(--text-muted); max-width:440px; margin:0 auto 20px; font-size:0.92rem;">Try loosening filter criteria, adjusting price ranges, or searching for other flagship brands.</p>
            <button class="btn btn-primary" onclick="window.NexoraApp.resetAllFilters()"><i class="fa-solid fa-arrows-rotate" style="margin-right:6px;"></i> Reset All Filters</button>
          </div>
        `;
      } else {
        gridEl.innerHTML = filtered.map(p => window.NexoraComponents.renderProductCard(p)).join('');
      }
    }
  }

  // 3. PRODUCT DETAIL PAGE
  function initProductDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 'iphone-17-pro';
    const product = state.products.find(p => p.id === productId) || state.products[0];

    if (!product) return;
    state.currentProduct = product;

    if (!state.recentlyViewed.includes(product.id)) {
      state.recentlyViewed.unshift(product.id);
      if (state.recentlyViewed.length > 8) state.recentlyViewed.pop();
      savePersistedData();
    }

    state.selectedColor = (product.variants && product.variants.color) ? product.variants.color[0] : '';
    state.selectedStorage = (product.variants && product.variants.storage) ? product.variants.storage[0] : '';

    renderProductDetailView(product);
  }

  function renderProductDetailView(product) {
    document.title = `${product.name} | NEXORA Showroom`;

    const bcContainer = document.getElementById('pdp-breadcrumbs');
    if (bcContainer) {
      bcContainer.innerHTML = `
        <a href="index.html">Home</a> <span>›</span>
        <a href="shop.html?category=${encodeURIComponent(product.category)}">${product.category}</a> <span>›</span>
        <span style="color:#ffffff; font-weight:600;">${product.name}</span>
      `;
    }

    const galleryMain = document.getElementById('pdp-main-image');
    if (galleryMain) {
      galleryMain.src = product.images && product.images[0] ? product.images[0] : product.thumbnail;
      galleryMain.alt = product.name;
    }

    const thumbsContainer = document.getElementById('pdp-gallery-thumbs');
    if (thumbsContainer && product.images) {
      thumbsContainer.innerHTML = product.images.map((img, idx) => `
        <button type="button" class="pdp-thumb-btn ${idx === 0 ? 'active' : ''}" onclick="window._switchPdpImage('${img}', this)">
          <img src="${img}" alt="${product.name} angle ${idx+1}" />
        </button>
      `).join('');

      window._switchPdpImage = (src, btn) => {
        if (galleryMain) galleryMain.src = src;
        document.querySelectorAll('.pdp-thumb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
    }

    const titleEl = document.getElementById('pdp-title');
    if (titleEl) titleEl.textContent = product.name;

    const brandEl = document.getElementById('pdp-brand');
    if (brandEl) brandEl.textContent = product.brand;

    const skuEl = document.getElementById('pdp-sku');
    if (skuEl) skuEl.textContent = `SKU: ${product.sku || 'NX-PREM-01'}`;

    const ratingEl = document.getElementById('pdp-rating-stars');
    if (ratingEl) {
      ratingEl.innerHTML = `
        <span class="star-pill"><i class="fa-solid fa-star" style="font-size:0.7rem; margin-right:3px;"></i>${product.rating || '4.9'}</span>
        <span style="color:#94a3b8; font-size:0.85rem; margin-left:8px;">${product.reviewCount || 150} Verified Showroom Ratings</span>
      `;
    }

    const priceCurrent = document.getElementById('pdp-price-current');
    if (priceCurrent) priceCurrent.textContent = formatINR(product.price);

    const priceOriginal = document.getElementById('pdp-price-original');
    if (priceOriginal && product.originalPrice) {
      priceOriginal.textContent = formatINR(product.originalPrice);
    }

    const discountPill = document.getElementById('pdp-discount-pill');
    if (discountPill && product.discount) {
      discountPill.textContent = `${product.discount}% OFF`;
    }

    const descEl = document.getElementById('pdp-desc');
    if (descEl) descEl.textContent = product.description || product.shortDescription;

    const colorContainer = document.getElementById('pdp-color-variants');
    if (colorContainer && product.variants && product.variants.color) {
      colorContainer.innerHTML = product.variants.color.map((col, idx) => `
        <button type="button" class="variant-chip-btn ${idx === 0 ? 'active' : ''}" onclick="window._selectPdpColor('${col}', this)">
          ${col}
        </button>
      `).join('');

      window._selectPdpColor = (col, btn) => {
        state.selectedColor = col;
        document.querySelectorAll('#pdp-color-variants .variant-chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
    }

    const storageContainer = document.getElementById('pdp-storage-variants');
    if (storageContainer && product.variants && product.variants.storage) {
      storageContainer.innerHTML = product.variants.storage.map((st, idx) => `
        <button type="button" class="variant-chip-btn ${idx === 0 ? 'active' : ''}" onclick="window._selectPdpStorage('${st}', this)">
          ${st}
        </button>
      `).join('');

      window._selectPdpStorage = (st, btn) => {
        state.selectedStorage = st;
        document.querySelectorAll('#pdp-storage-variants .variant-chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
    }

    const addCartBtn = document.getElementById('pdp-add-cart-btn');
    if (addCartBtn) {
      addCartBtn.onclick = () => {
        const qtyInput = document.getElementById('pdp-qty-input');
        const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
        addToCart(product.id, qty, addCartBtn, { color: state.selectedColor, storage: state.selectedStorage });
      };
    }

    const buyWaBtn = document.getElementById('pdp-buy-wa-btn');
    if (buyWaBtn) {
      buyWaBtn.onclick = () => {
        directProductWhatsAppOrder(product.id);
      };
    }

    const wishBtn = document.getElementById('pdp-wishlist-btn');
    if (wishBtn) {
      if (isInWishlist(product.id)) wishBtn.classList.add('active');
      wishBtn.onclick = () => toggleWishlist(product.id, wishBtn);
    }

    const specsContainer = document.getElementById('pdp-specs-table');
    if (specsContainer && product.specifications) {
      const getSpecIcon = (label) => {
        const l = label.toLowerCase();
        if (l.includes('display') || l.includes('screen')) return 'fa-tv';
        if (l.includes('processor') || l.includes('chip') || l.includes('cpu')) return 'fa-microchip';
        if (l.includes('camera')) return 'fa-camera';
        if (l.includes('battery') || l.includes('charge')) return 'fa-battery-full';
        if (l.includes('ram') || l.includes('memory')) return 'fa-memory';
        if (l.includes('storage') || l.includes('ssd')) return 'fa-hard-drive';
        if (l.includes('os') || l.includes('software')) return 'fa-terminal';
        if (l.includes('connectivity') || l.includes('ports') || l.includes('wireless')) return 'fa-wifi';
        if (l.includes('audio') || l.includes('sound')) return 'fa-volume-high';
        if (l.includes('weight') || l.includes('dimension')) return 'fa-weight-scale';
        return 'fa-gears';
      };

      specsContainer.innerHTML = Object.entries(product.specifications).map(([key, val]) => `
        <div class="spec-card-item">
          <div class="spec-card-key">
            <i class="fa-solid ${getSpecIcon(key)}" style="color:var(--accent-cyan); margin-right:6px;"></i>
            <span>${key.toUpperCase()}</span>
          </div>
          <div class="spec-card-val">${val}</div>
        </div>
      `).join('');
    }

    const bundleContainer = document.getElementById('pdp-bundle-box');
    if (bundleContainer && product.frequentlyBoughtTogether && product.frequentlyBoughtTogether.length > 0) {
      const bundledProds = product.frequentlyBoughtTogether.map(id => state.products.find(p => p.id === id)).filter(Boolean);
      if (bundledProds.length > 0) {
        const allItems = [product, ...bundledProds];
        const rawTotal = allItems.reduce((sum, item) => sum + item.price, 0);
        const bundleDiscount = product.bundleDiscount || 2000;
        const bundlePrice = rawTotal - bundleDiscount;

        bundleContainer.innerHTML = `
          <div class="bundle-card">
            <div class="bundle-header">
              <h4 class="bundle-title">
                <i class="fa-solid fa-gift" style="color:var(--accent-cyan); margin-right:8px;"></i>
                Frequently Bought Together <span class="badge-tag badge-tag-flagship" style="margin-left:8px;">Save ${formatINR(bundleDiscount)}</span>
              </h4>
              <p class="bundle-sub">Curated matching showroom accessories calibrated for maximum performance</p>
            </div>
            
            <div class="bundle-items-row">
              ${allItems.map((item, idx) => `
                <div class="bundle-single-item">
                  <div class="bundle-img-box">
                    <img src="${item.thumbnail || item.images[0]}" alt="${item.name}" />
                  </div>
                  <div class="bundle-item-info">
                    <div class="bundle-item-name">${item.name}</div>
                    <div class="bundle-item-price">${formatINR(item.price)}</div>
                  </div>
                </div>
                ${idx < allItems.length - 1 ? '<div class="bundle-plus-badge">+</div>' : ''}
              `).join('')}
            </div>

            <div class="bundle-checkout-bar">
              <div class="bundle-pricing-summary">
                <div class="bundle-total-label">Combo Bundle Price:</div>
                <div class="bundle-price-val">${formatINR(bundlePrice)} <span class="bundle-original-val">${formatINR(rawTotal)}</span></div>
                <div class="bundle-save-pill"><i class="fa-solid fa-circle-check" style="margin-right:4px;"></i> Instant ₹${bundleDiscount.toLocaleString('en-IN')} Combo Savings Applied</div>
              </div>
              <button class="btn btn-primary btn-lg bundle-cta-btn" onclick="window.NexoraApp.addBundleToCart(['${allItems.map(i => i.id).join("','")}'])">
                <i class="fa-solid fa-cart-plus" style="margin-right:8px;"></i> Add All ${allItems.length} Items to Cart
              </button>
            </div>
          </div>
        `;
      }
    }

    const relatedGrid = document.getElementById('pdp-related-grid');
    if (relatedGrid) {
      const related = state.products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
      relatedGrid.innerHTML = related.map(p => window.NexoraComponents.renderProductCard(p)).join('');
    }
  }

  function addBundleToCart(productIds) {
    productIds.forEach(id => addToCart(id, 1));
    showToast('Complete hardware bundle added to cart!');
  }

  // 4. CART PAGE
  function initCartPage() {
    renderCartPage();
  }

  function renderCartPage() {
    const listContainer = document.getElementById('cart-items-container');
    const summaryContainer = document.getElementById('cart-summary-container');

    if (!listContainer) return;

    if (state.cart.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align:center; padding:60px 24px; background:#ffffff; border-radius:20px; border:1px solid var(--border-subtle); box-shadow:var(--shadow-sm);">
          <div style="width:76px; height:76px; border-radius:50%; background:var(--accent-cyan-light); color:var(--accent-cyan); display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 18px;">
            <i class="fa-solid fa-cart-shopping"></i>
          </div>
          <h3 style="font-size:1.5rem; color:var(--text-heading); font-family:var(--font-heading); font-weight:800; margin-bottom:8px;">Your Showroom Cart is Empty</h3>
          <p style="color:var(--text-muted); max-width:440px; margin:0 auto 24px; font-size:0.92rem;">Explore Bengaluru's premier showroom collection for smartphones, OLED TVs, computing workstations, and audio gear.</p>
          <a href="shop.html" class="btn btn-primary btn-lg"><i class="fa-solid fa-bag-shopping" style="margin-right:8px;"></i> Explore Live Catalogue</a>
        </div>
      `;
      if (summaryContainer) summaryContainer.innerHTML = '';
      return;
    }

    listContainer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
        <h3 style="font-size:1.3rem; color:var(--text-heading); font-weight:800; font-family:var(--font-heading);">
          Items in Cart <span style="font-size:0.9rem; color:var(--accent-cyan); font-weight:700;">(${state.cart.reduce((s, i) => s + i.quantity, 0)} Units)</span>
        </h3>
        <button class="btn btn-outline btn-sm" onclick="window.NexoraApp.clearCart()" style="color:#e11d48; border-color:rgba(225,29,72,0.3); background:#ffffff;">
          <i class="fa-solid fa-trash-can" style="margin-right:6px;"></i> Clear Cart
        </button>
      </div>
      <div style="display:flex; flex-direction:column; gap:14px;">
        ${state.cart.map(item => `
          <div class="cart-item-row" style="background:#ffffff; border:1px solid var(--border-subtle); border-radius:16px; padding:18px 20px; display:flex; gap:18px; align-items:center; flex-wrap:wrap; box-shadow:var(--shadow-xs); transition:all 0.2s ease;">
            <div style="width:80px; height:80px; border-radius:12px; background:radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f5f9 100%); border:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:center; padding:6px; flex-shrink:0;">
              <img src="${item.thumbnail || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80'}" alt="${item.name}" style="max-width:100%; max-height:100%; object-fit:contain;" onerror="this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80'" />
            </div>
            <div style="flex:1; min-width:200px;">
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                <span class="product-brand-chip" style="font-size:0.7rem;">${item.brand || 'PREMIUM'}</span>
                <span style="font-size:0.75rem; color:#94a3b8;">•</span>
                <span style="font-size:0.75rem; color:#64748b;">${item.category || 'Tech'}</span>
              </div>
              <h4 style="font-size:1.05rem; color:var(--text-heading); font-weight:800; margin-bottom:4px; font-family:var(--font-heading);">
                <a href="product.html?id=${item.id}" style="color:var(--text-heading);">${item.name}</a>
              </h4>
              <div style="font-size:0.82rem; color:var(--text-muted); font-weight:600;">
                ${item.selectedColor ? `Finish: <strong style="color:var(--text-heading);">${item.selectedColor}</strong>` : ''} 
                ${item.selectedStorage ? `• Spec: <strong style="color:var(--text-heading);">${item.selectedStorage}</strong>` : ''}
              </div>
              <div style="font-size:1.1rem; font-weight:900; color:var(--accent-cyan); font-family:var(--font-heading); margin-top:6px;">
                ${formatINR(item.price)}
              </div>
            </div>
            <!-- Quantity Stepper -->
            <div style="display:flex; align-items:center; gap:8px; background:#f8fafc; padding:6px 10px; border-radius:10px; border:1px solid var(--border-light);">
              <button type="button" class="btn btn-outline btn-sm" onclick="window.NexoraApp.updateCartQuantity('${item.id}', '${item.selectedColor || ''}', '${item.selectedStorage || ''}', ${item.quantity - 1})" style="width:28px; height:28px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:6px; background:#ffffff;">-</button>
              <span style="font-weight:800; font-size:0.95rem; width:28px; text-align:center; color:var(--text-heading);">${item.quantity}</span>
              <button type="button" class="btn btn-outline btn-sm" onclick="window.NexoraApp.updateCartQuantity('${item.id}', '${item.selectedColor || ''}', '${item.selectedStorage || ''}', ${item.quantity + 1})" style="width:28px; height:28px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:6px; background:#ffffff;">+</button>
            </div>
            <!-- Subtotal & Remove -->
            <div style="text-align:right; min-width:120px;">
              <div style="font-size:1.25rem; font-weight:900; color:var(--text-heading); font-family:var(--font-heading);">${formatINR(item.price * item.quantity)}</div>
              <button type="button" class="btn-text" onclick="window.NexoraApp.removeFromCart('${item.id}', '${item.selectedColor || ''}', '${item.selectedStorage || ''}')" style="color:#e11d48; font-size:0.82rem; font-weight:700; cursor:pointer; background:none; border:none; margin-top:6px; display:inline-flex; align-items:center; gap:4px;">
                <i class="fa-solid fa-trash-can"></i> Remove
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    const totals = calculateCartTotals();
    if (summaryContainer) {
      summaryContainer.innerHTML = `
        <div class="cart-summary-card" style="background:#ffffff; border:1px solid var(--border-subtle); border-radius:20px; padding:28px; box-shadow:var(--shadow-sm); position:sticky; top:90px;">
          <h4 style="font-size:1.3rem; font-weight:900; color:var(--text-heading); margin-bottom:20px; font-family:var(--font-heading); display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-file-invoice-dollar" style="color:var(--accent-cyan);"></i> Showroom Quotation
          </h4>
          
          <div style="margin-bottom:20px;">
            <label class="form-label" style="font-size:0.75rem;">SHOWROOM PROMO COUPON</label>
            <div style="display:flex; gap:8px;">
              <input type="text" class="form-input" id="cart-coupon-input" placeholder="e.g. NEXORA10" value="${state.appliedCoupon ? state.appliedCoupon.code : ''}" style="text-transform:uppercase;" />
              <button class="btn btn-primary btn-sm" onclick="window.NexoraApp.applyCoupon(document.getElementById('cart-coupon-input').value)">Apply</button>
            </div>
            ${state.appliedCoupon ? `
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; color:#059669; font-weight:700; margin-top:8px;">
                <span><i class="fa-solid fa-circle-check" style="margin-right:4px;"></i> Coupon "${state.appliedCoupon.code}" Applied</span>
                <button onclick="window.NexoraApp.removeCoupon()" style="background:none; border:none; color:#e11d48; cursor:pointer; font-size:0.78rem; font-weight:800;">Remove</button>
              </div>
            ` : ''}
          </div>

          <div style="margin-bottom:20px; padding:14px; background:var(--accent-cyan-light); border:1px dashed rgba(2,132,199,0.3); border-radius:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.84rem; color:var(--text-main); font-weight:600;">Trade-in old smartphone / laptop?</span>
              <button class="btn-text" onclick="window.NexoraApp.openExchangeModal()" style="color:var(--accent-cyan); font-size:0.84rem; font-weight:800; background:none; border:none; cursor:pointer;"><i class="fa-solid fa-arrows-rotate" style="margin-right:4px;"></i> Trade-In Valuator</button>
            </div>
            ${state.tradeInDiscount > 0 ? `
              <div style="font-size:0.82rem; color:#059669; font-weight:800; margin-top:6px;">
                <i class="fa-solid fa-circle-check" style="margin-right:4px;"></i> Trade-in voucher credit: -${formatINR(state.tradeInDiscount)}
              </div>
            ` : ''}
          </div>

          <div style="display:flex; flex-direction:column; gap:12px; padding:18px 0; border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle); margin-bottom:20px;">
            <div style="display:flex; justify-content:space-between; color:var(--text-muted); font-size:0.92rem;">
              <span>Subtotal (${state.cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span style="color:var(--text-heading); font-weight:700; font-family:var(--font-mono);">${formatINR(totals.subtotal)}</span>
            </div>
            ${totals.discount > 0 ? `
              <div style="display:flex; justify-content:space-between; color:#059669; font-size:0.92rem; font-weight:700;">
                <span>Promo Coupon Discount</span>
                <span>-${formatINR(totals.discount)}</span>
              </div>
            ` : ''}
            ${totals.tradeIn > 0 ? `
              <div style="display:flex; justify-content:space-between; color:#059669; font-size:0.92rem; font-weight:700;">
                <span>Old Device Trade-In Credit</span>
                <span>-${formatINR(totals.tradeIn)}</span>
              </div>
            ` : ''}
            <div style="display:flex; justify-content:space-between; color:var(--text-muted); font-size:0.92rem;">
              <span>Express Delivery / Pickup</span>
              <span style="color:#059669; font-weight:800;">FREE</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:baseline; color:var(--text-heading); font-size:1.4rem; font-weight:900; margin-top:6px; font-family:var(--font-heading); padding-top:8px; border-top:1px dashed var(--border-subtle);">
              <span>Final Total</span>
              <span style="color:var(--accent-cyan); font-size:1.6rem;">${formatINR(totals.finalTotal)}</span>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px;">
            <button type="button" class="btn btn-wa-green btn-lg" onclick="window.NexoraApp.directCartWhatsAppOrder()" style="width:100%; justify-content:center; box-shadow:0 4px 16px rgba(22,163,74,0.3);">
              <i class="fa-brands fa-whatsapp" style="font-size:1.25rem; margin-right:8px;"></i>
              <span>Instant WhatsApp Showroom Checkout</span>
            </button>
            <a href="checkout.html" class="btn btn-primary btn-lg" style="width:100%; text-align:center; justify-content:center;">
              Proceed to Showroom Checkout →
            </a>
          </div>

          <div style="margin-top:18px; display:flex; justify-content:space-around; font-size:0.75rem; color:var(--text-muted); font-weight:600;">
            <span><i class="fa-solid fa-shield-halved" style="color:#059669; margin-right:4px;"></i> Brand Sealed</span>
            <span><i class="fa-solid fa-truck-fast" style="color:var(--accent-cyan); margin-right:4px;"></i> Same-Day Dispatch</span>
            <span><i class="fa-solid fa-credit-card" style="color:var(--accent-gold); margin-right:4px;"></i> 0% EMI</span>
          </div>
        </div>
      `;
    }
  }

  // 5. CHECKOUT PAGE
  function initCheckoutPage() {
    renderCheckoutPage();
  }

  function renderCheckoutPage() {
    const itemsReview = document.getElementById('checkout-items-review');
    const totals = calculateCartTotals();

    if (itemsReview) {
      if (state.cart.length === 0) {
        itemsReview.innerHTML = `
          <div style="color:var(--text-muted); padding:30px 0; text-align:center;">
            <p>Your showroom cart is empty.</p>
            <a href="shop.html" class="btn btn-primary btn-sm" style="margin-top:10px;"><i class="fa-solid fa-bag-shopping" style="margin-right:6px;"></i> Shop Catalogue</a>
          </div>
        `;
      } else {
        itemsReview.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:16px;">
            ${state.cart.map(item => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--border-subtle);">
                <div style="display:flex; align-items:center; gap:12px;">
                  <img src="${item.thumbnail || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=100&q=80'}" alt="${item.name}" style="width:48px; height:48px; object-fit:contain; border-radius:8px; background:#f8fafc; border:1px solid var(--border-subtle); padding:4px;" />
                  <div>
                    <div style="font-weight:800; color:var(--text-heading); font-size:0.92rem; font-family:var(--font-heading);">${item.name}</div>
                    <div style="font-size:0.78rem; color:var(--text-muted); font-weight:600;">
                      Qty: ${item.quantity} ${item.selectedColor ? `• ${item.selectedColor}` : ''} ${item.selectedStorage ? `• ${item.selectedStorage}` : ''}
                    </div>
                  </div>
                </div>
                <div style="font-weight:900; color:var(--text-heading); font-family:var(--font-heading); font-size:1.05rem;">
                  ${formatINR(item.price * item.quantity)}
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display:flex; flex-direction:column; gap:8px; padding:14px 0; border-top:1px solid var(--border-subtle);">
            <div style="display:flex; justify-content:space-between; font-size:0.88rem; color:var(--text-muted);">
              <span>Subtotal</span>
              <span style="font-weight:700; color:var(--text-heading);">${formatINR(totals.subtotal)}</span>
            </div>
            ${totals.discount > 0 ? `
              <div style="display:flex; justify-content:space-between; font-size:0.88rem; color:#059669; font-weight:700;">
                <span>Coupon Discount</span>
                <span>-${formatINR(totals.discount)}</span>
              </div>
            ` : ''}
            ${totals.tradeIn > 0 ? `
              <div style="display:flex; justify-content:space-between; font-size:0.88rem; color:#059669; font-weight:700;">
                <span>Trade-In Voucher Credit</span>
                <span>-${formatINR(totals.tradeIn)}</span>
              </div>
            ` : ''}
            <div style="display:flex; justify-content:space-between; font-size:0.88rem; color:var(--text-muted);">
              <span>Delivery / Showroom Pickup</span>
              <span style="font-weight:800; color:#059669;">FREE</span>
            </div>
          </div>

          <div style="padding-top:14px; font-size:1.35rem; font-weight:900; color:var(--text-heading); display:flex; justify-content:space-between; align-items:baseline; border-top:2px solid var(--border-subtle); font-family:var(--font-heading);">
            <span>Total Payable:</span>
            <span style="color:var(--accent-cyan); font-size:1.6rem;">${formatINR(totals.finalTotal)}</span>
          </div>
        `;
      }
    }
  }

  function submitCheckoutOrder(e) {
    if (e) e.preventDefault();
    if (state.cart.length === 0) {
      showToast('Cart is empty!', 'error');
      return;
    }

    const name = document.getElementById('checkout-name').value;
    const phone = document.getElementById('checkout-phone').value;
    const address = document.getElementById('checkout-address') ? document.getElementById('checkout-address').value : '';
    const paymentMode = document.querySelector('input[name="checkout-payment"]:checked') ? document.querySelector('input[name="checkout-payment"]:checked').value : 'WhatsApp Confirmation';

    const customerInfo = {
      name,
      phone,
      address,
      paymentMode
    };

    const num = (typeof NEXORA_CONFIG !== 'undefined' && NEXORA_CONFIG.whatsappNumber) ? NEXORA_CONFIG.whatsappNumber : "919000000000";
    const encodedMsg = generateWhatsAppOrderMessage(state.cart, customerInfo);

    state.cart = [];
    state.appliedCoupon = null;
    state.tradeInDiscount = 0;
    savePersistedData();

    showToast('Order generated! Opening WhatsApp invoice dispatch...', 'wa');
    setTimeout(() => {
      window.open(`https://wa.me/${num}?text=${encodedMsg}`, '_blank');
      window.location.href = 'index.html';
    }, 1200);
  }

  // 6. WISHLIST PAGE
  function initWishlistPage() {
    renderWishlistPage();
  }

  function renderWishlistPage() {
    const grid = document.getElementById('wishlist-products-grid');
    if (!grid) return;

    if (state.wishlist.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1 / -1; text-align:center; padding:60px 24px; background:#ffffff; border-radius:20px; border:1px solid var(--border-subtle); box-shadow:var(--shadow-sm);">
          <div style="width:76px; height:76px; border-radius:50%; background:rgba(225,29,72,0.1); color:#e11d48; display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 18px;">
            <i class="fa-solid fa-heart"></i>
          </div>
          <h3 style="font-size:1.5rem; color:var(--text-heading); font-family:var(--font-heading); font-weight:800; margin-bottom:8px;">Your Wishlist is Empty</h3>
          <p style="color:var(--text-muted); max-width:440px; margin:0 auto 24px; font-size:0.92rem;">Explore our 16 departments and tap the heart icon on any device to save it for easy showroom comparison.</p>
          <a href="shop.html" class="btn btn-primary btn-lg"><i class="fa-solid fa-bag-shopping" style="margin-right:8px;"></i> Explore Live Catalogue</a>
        </div>
      `;
      return;
    }

    const wishlistProds = state.wishlist.map(id => state.products.find(p => p.id === id)).filter(Boolean);
    grid.innerHTML = wishlistProds.map(p => window.NexoraComponents.renderProductCard(p)).join('');
  }

  function shareWishlistOnWhatsApp() {
    if (state.wishlist.length === 0) {
      showToast('Wishlist is empty!', 'error');
      return;
    }
    const num = (typeof NEXORA_CONFIG !== 'undefined' && NEXORA_CONFIG.whatsappNumber) ? NEXORA_CONFIG.whatsappNumber : "919000000000";
    const wishlistProds = state.wishlist.map(id => state.products.find(p => p.id === id)).filter(Boolean);

    let msg = `*❤️ NEXORA ELECTRONICS — SAVED WISHLIST INQUIRY*\n`;
    wishlistProds.forEach((p, idx) => {
      msg += `*${idx + 1}. ${p.name}* — ${formatINR(p.price)}\n`;
    });
    msg += `\nHi Nexora Showroom, please check stock availability for my wishlist.`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // 7. ABOUT & CONTACT INITIALIZERS
  function initAboutPage() {
    const faqContainer = document.getElementById('about-faq-accordion');
    if (faqContainer && typeof NEXORA_CONFIG !== 'undefined' && NEXORA_CONFIG.faqs) {
      faqContainer.innerHTML = NEXORA_CONFIG.faqs.map((faq, idx) => `
        <div class="faq-accordion-item" style="background:#ffffff; border:1px solid var(--border-subtle); border-radius:12px; margin-bottom:12px; overflow:hidden; box-shadow:var(--shadow-xs);">
          <button type="button" class="faq-question-btn" onclick="window._toggleFaq(this)" style="width:100%; text-align:left; padding:18px 20px; font-weight:800; color:var(--text-heading); font-family:var(--font-heading); background:none; border:none; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
            <span>${faq.q}</span>
            <span class="faq-icon" style="color:var(--accent-cyan); font-size:1rem;"><i class="fa-solid fa-chevron-down"></i></span>
          </button>
          <div class="faq-answer-box" style="padding:0 20px 18px; color:var(--text-main); font-size:0.92rem; line-height:1.6; display:none; border-top:1px solid var(--border-subtle); padding-top:12px;">
            ${faq.a}
          </div>
        </div>
      `).join('');

      window._toggleFaq = (btn) => {
        const ans = btn.nextElementSibling;
        const icon = btn.querySelector('.faq-icon');
        if (ans.style.display === 'block') {
          ans.style.display = 'none';
          icon.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
        } else {
          ans.style.display = 'block';
          icon.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
        }
      };
    }
  }

  function initContactPage() {
    const pinChecker = document.getElementById('pincode-check-btn');
    if (pinChecker) {
      pinChecker.onclick = () => {
        const pinInput = document.getElementById('pincode-input');
        const pin = pinInput ? pinInput.value.trim() : '';
        const resEl = document.getElementById('pincode-result');
        if (!pin || pin.length !== 6) {
          showToast('Enter a valid 6-digit PIN code', 'error');
          return;
        }
        if (pin.startsWith('560')) {
          if (resEl) {
            resEl.style.display = 'block';
            resEl.innerHTML = `<span style="color:#10b981; font-weight:700;"><i class="fa-solid fa-truck-fast" style="margin-right:4px;"></i> Eligible for Free Same-Day Express Delivery in Bengaluru (Pincode: ${pin})</span>`;
          }
        } else {
          if (resEl) {
            resEl.style.display = 'block';
            resEl.innerHTML = `<span style="color:var(--accent-cyan); font-weight:700;"><i class="fa-solid fa-store" style="margin-right:4px;"></i> Eligible for 24-48 Hr Express Delivery or Same-Day Showroom Pickup</span>`;
          }
        }
      };
    }
  }

  // -------------------------------------------------------------
  // MASTER DOM INITIALIZER
  // -------------------------------------------------------------
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      loadPersistedData();

      const path = window.location.pathname.toLowerCase();
      let pageKey = 'home';
      if (path.includes('shop.html')) pageKey = 'shop';
      else if (path.includes('product.html')) pageKey = 'product';
      else if (path.includes('cart.html')) pageKey = 'cart';
      else if (path.includes('checkout.html')) pageKey = 'checkout';
      else if (path.includes('wishlist.html')) pageKey = 'wishlist';
      else if (path.includes('about.html')) pageKey = 'about';
      else if (path.includes('contact.html')) pageKey = 'contact';

      if (window.NexoraComponents) {
        window.NexoraComponents.mountGlobalComponents(pageKey);
      }

      updateHeaderCounters();
      updateCompareFloatingBar();
      setupLiveSearch();

      if (pageKey === 'home') initHomePage();
      else if (pageKey === 'shop') initShopPage();
      else if (pageKey === 'product') initProductDetailPage();
      else if (pageKey === 'cart') initCartPage();
      else if (pageKey === 'checkout') initCheckoutPage();
      else if (pageKey === 'wishlist') initWishlistPage();
      else if (pageKey === 'about') initAboutPage();
      else if (pageKey === 'contact') initContactPage();
    });
  }

  // Export Public NexoraApp API
  window.NexoraApp = {
    state,
    formatINR,
    showToast,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    calculateCartTotals,
    directCartWhatsAppOrder,
    directProductWhatsAppOrder,
    toggleWishlist,
    isInWishlist,
    moveAllWishlistToCart,
    clearWishlist,
    shareWishlistOnWhatsApp,
    toggleCompare,
    isInCompare,
    clearCompare,
    openCompareModal,
    openModal,
    closeModal,
    toggleMobileDrawer,
    openAdvisorModal,
    openExchangeModal,
    calculateTradeInValue,
    applyTradeInDiscount,
    shareTradeInOnWhatsApp,
    openEmiCalculator,
    openBookingModal,
    submitVipBooking,
    openTrackOrderModal,
    queryOrderStatus,
    openQuickView,
    openReelModal,
    goHeroSlide,
    nextHeroSlide,
    prevHeroSlide,
    initHeroCarousel,
    addBundleToCart,
    onBrandFilterChange,
    onCategoryFilterChange,
    onPriceFilterChange,
    onSortChange,
    resetAllFilters,
    submitCheckoutOrder
  };

})();
