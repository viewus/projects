
(function (window, document) {
	'use strict';

	var SELECTOR = '.section-header, .banner, .card, .feature-row__item, .gallery__item, .step-chain__item, .process-steps__item, .stats__item, .photo-grid__item, .photo-stamp, .product-list__item, .testimonial-card, .video-testimonial-card, .faq__item, .memories__item, .intro-photo-card, .pillar-card, .sourcing-pillar-card, .sourcing-vintage__photo-frame, .sourcing-signboard, .cert-h-card, .certs-featured-logo-card, .order-product-card, .memory-card-vintage, .look-back-card, .variety-card, .mineral-card, .storage-step-card, .timeline-step-card, .event-type-card, .franchise-pillar-card, .franchise-step-card, .wholesale-card, .blog-card, .contact-home-info-card, .faq-accordion-item, .social-card, .why-us-card, .byproduct-card, .package-card, .pricing-tier-card, .location-card, .occasion-card, .occasions-next, .vs-calendar, .container > h1, .container > h2, .container > h3, .container > p, .container > .btn, .container > .btn--outline, .container > .badge, .site-footer';

	function init() {
		var items = window.VintageSoul.dom.qsa(SELECTOR);
		if (!items.length) return;

		var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduceMotion || !('IntersectionObserver' in window)) {
			items.forEach(function (el) {
				el.classList.add('is-revealed');
			});
			return;
		}

		var counts = new Map();
		items.forEach(function (el) {
			var parent = el.parentElement;
			var n = counts.get(parent) || 0;
			counts.set(parent, n + 1);
			el.style.transitionDelay = (Math.min(n, 4) * 35) + 'ms';
		});

		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-revealed');
					observer.unobserve(entry.target);
				}
			});
		}, { threshold: 0.01, rootMargin: '0px 0px 60px 0px' });

		items.forEach(function (el) {
			observer.observe(el);
		});
	}

	window.VintageSoul.app.register('reveal', init);
})(window, document);
