/**
 * VintageSoulTheme - Our Occasions: calendar + card list
 *
 * Progressive enhancement only. With JS off the page still works: every
 * month grid is visible (the "one month at a time" rule is scoped to
 * html.js in CSS) and each calendar day is a plain anchor to its card.
 * This adds month switching, category filtering, and highlight-on-jump.
 */
(function (window, document) {
	'use strict';

	var ACTIVE = 'is-active';

	function initCalendar(calendar) {
		var grids = calendar.querySelectorAll('[data-calendar-grid]');
		var pills = calendar.querySelectorAll('[data-calendar-month]');
		var label = calendar.querySelector('[data-calendar-label]');
		var prev = calendar.querySelector('[data-calendar-prev]');
		var next = calendar.querySelector('[data-calendar-next]');
		if (!grids.length) return;

		var index = parseInt(calendar.getAttribute('data-active') || '0', 10);
		if (isNaN(index) || index < 0 || index >= grids.length) index = 0;

		function show(target) {
			if (target < 0 || target >= grids.length) return;
			index = target;

			for (var g = 0; g < grids.length; g++) {
				grids[g].classList.toggle(ACTIVE, g === index);
			}
			for (var p = 0; p < pills.length; p++) {
				var on = p === index;
				pills[p].classList.toggle(ACTIVE, on);
				pills[p].setAttribute('aria-pressed', on ? 'true' : 'false');
			}

			var caption = grids[index].querySelector('caption');
			if (label && caption) label.textContent = caption.textContent;

			if (prev) prev.disabled = index === 0;
			if (next) next.disabled = index === grids.length - 1;
		}

		if (prev) {
			prev.addEventListener('click', function () {
				show(index - 1);
			});
		}

		if (next) {
			next.addEventListener('click', function () {
				show(index + 1);
			});
		}

		for (var i = 0; i < pills.length; i++) {
			(function (pill) {
				pill.addEventListener('click', function () {
					show(parseInt(pill.getAttribute('data-calendar-month') || '0', 10));
				});
			})(pills[i]);
		}

		show(index);
	}

	/** Jump to an occasion card and flash it, from a calendar day or the "next up" panel. */
	function initJumpLinks() {
		var links = document.querySelectorAll('[data-occasion-target]');
		if (!links.length) return;

		var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		for (var i = 0; i < links.length; i++) {
			links[i].addEventListener('click', function (event) {
				var id = this.getAttribute('data-occasion-target');
				if (!id) return;

				var card = document.getElementById('occasion-' + id);
				if (!card) return;

				event.preventDefault();

				// A filter may be hiding the target - clear it so the jump lands.
				var activeFilter = document.querySelector('.occasions-filter.' + ACTIVE);
				if (card.hasAttribute('hidden') && activeFilter) {
					var all = document.querySelector('[data-occasion-filter="all"]');
					if (all) all.click();
				}

				card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
				card.classList.add('is-flagged');
				card.focus({ preventScroll: true });

				window.setTimeout(function () {
					card.classList.remove('is-flagged');
				}, 2200);
			});
		}
	}

	function initFilters() {
		var groups = document.querySelectorAll('.occasions-list-section');

		for (var g = 0; g < groups.length; g++) {
			(function (section) {
				var buttons = section.querySelectorAll('[data-occasion-filter]');
				var cards = section.querySelectorAll('[data-occasion-id]');
				var empty = section.querySelector('[data-occasions-empty]');
				if (!buttons.length || !cards.length) return;

				for (var b = 0; b < buttons.length; b++) {
					(function (button) {
						button.addEventListener('click', function () {
							var filter = button.getAttribute('data-occasion-filter') || 'all';
							var shown = 0;

							for (var c = 0; c < cards.length; c++) {
								var match = filter === 'all' || cards[c].getAttribute('data-category') === filter;
								cards[c].hidden = !match;
								if (match) shown++;
							}

							for (var n = 0; n < buttons.length; n++) {
								var on = buttons[n] === button;
								buttons[n].classList.toggle(ACTIVE, on);
								buttons[n].setAttribute('aria-pressed', on ? 'true' : 'false');
							}

							if (empty) empty.hidden = shown !== 0;
						});
					})(buttons[b]);
				}
			})(groups[g]);
		}
	}

	function init() {
		var calendars = document.querySelectorAll('[data-vs-calendar]');
		for (var i = 0; i < calendars.length; i++) {
			initCalendar(calendars[i]);
		}

		initFilters();
		initJumpLinks();
	}

	if (window.VintageSoul && window.VintageSoul.app && typeof window.VintageSoul.app.register === 'function') {
		window.VintageSoul.app.register('occasions', init);
	} else if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})(window, document);
