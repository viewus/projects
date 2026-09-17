<?php

defined( 'ABSPATH' ) || exit;

use VintageSoul\DataProviders\JsonFileProvider;
use VintageSoul\Services\RouteService;
use VintageSoul\Support\IconHelper;
use VintageSoul\Support\UrlHelper;
use VintageSoul\Support\View;

$hero     = (array) ( $hero ?? array() );
$slides   = (array) ( $hero['slides'] ?? array() );

if ( empty( $slides ) ) {
	// Fall back to the same content file BannerBridgeService reads, rather
	// than keeping a second copy of the slide deck hardcoded in this
	// template. Editors change hero.json (or the CMS Home Banners admin);
	// nothing here needs touching.
	$hero_fallback = (array) ( JsonFileProvider::read( 'data/content/hero.json' ) ?? array() );
	$slides        = (array) ( $hero_fallback['slides'] ?? array() );

	if ( empty( $hero['settings'] ) && ! empty( $hero_fallback['settings'] ) ) {
		$hero['settings'] = (array) $hero_fallback['settings'];
	}
}

// No CMS banners and no JSON slides: render nothing rather than invent copy.
if ( empty( $slides ) ) {
	return;
}

$first_slide = (array) $slides[0];
$first_content = (array) ( $first_slide['content'] ?? array() );

$video_url   = UrlHelper::resolve( 'assets/videos/hero_bg.mp4' );
$poster_url  = UrlHelper::resolve( 'assets/images/sugarcane/hero_juice.jpg' );

$format_hero_title = static function ( $title ) {
	$words = explode( ' ', (string) $title );
	$html = '';
	$char_idx = 0;
	foreach ( $words as $w_idx => $word ) {
		if ( '' === $word ) {
			continue;
		}
		$html .= '<span class="hero-word" style="--word-idx:' . $w_idx . ';">';
		$chars = preg_split( '//u', $word, -1, PREG_SPLIT_NO_EMPTY );
		foreach ( $chars as $char ) {
			$html .= '<span class="hero-char" style="--char-idx:' . $char_idx . ';">' . esc_html( $char ) . '</span>';
			$char_idx++;
		}
		$html .= '</span> ';
	}
	return trim( $html );
};
?>
<section class="section section--hero hero-sugarcane" id="home-hero">
	
	<!-- Ambient Background Video (Very Light Opacity Canvas Blend) -->
	<div class="hero-ambient-bg" aria-hidden="true">
		<video class="hero-ambient-video" autoplay muted loop playsinline poster="<?php echo esc_url( $poster_url ); ?>">
			<source src="<?php echo esc_url( $video_url ); ?>" type="video/mp4">
		</video>
		<div class="hero-ambient-overlay"></div>
	</div>

	<!-- Foreground 2-Column Hero Stage -->
	<div class="container hero-sugarcane__container">
		
		<!-- Live Location, Weather & 24H Clock Badge (Outside Navigation Bar) -->
		<div class="hero-live-badge-bar">
			<?php View::component( 'header/header-live-badge' ); ?>
		</div>

		<div class="hero-sugarcane__header">
			
			<!-- Left Column: Editorial Story Information -->
			<div class="hero-sugarcane__content">
				<h1 class="hero-sugarcane__title" id="hero-title"><?php echo $format_hero_title( (string) ( $first_content['title'] ?? '' ) ); // phpcs:ignore ?></h1>
				<p class="hero-sugarcane__eyebrow" id="hero-eyebrow"><?php echo esc_html( (string) ( $first_content['eyebrow'] ?? '' ) ); ?></p>

				<ul class="hero-sugarcane__checklist" id="hero-checklist">
					<?php foreach ( (array) ( $first_content['checklist'] ?? array() ) as $item ) : ?>
						<li><span class="hero-sugarcane__check">✓</span> <?php echo esc_html( (string) $item ); ?></li>
					<?php endforeach; ?>
				</ul>

				<div class="hero-sugarcane__buttons" id="hero-buttons">
					<?php foreach ( (array) ( $first_content['buttons'] ?? array() ) as $idx => $btn ) :
						$btn       = (array) $btn;
						$btn_label = (string) ( $btn['label'] ?? '' );
						$btn_raw   = (string) ( $btn['url'] ?? ( $btn['route'] ?? 'contact' ) );
						$btn_url   = ( 0 === strpos( $btn_raw, '/' ) || 0 === strpos( $btn_raw, 'http' ) ) ? UrlHelper::resolve( $btn_raw ) : RouteService::url( $btn_raw );
						$btn_tgt   = (string) ( $btn['target'] ?? '_self' );
						$btn_icon  = (string) ( $btn['icon'] ?? '' );
						$btn_class = 0 === $idx ? 'btn--primary-vintage' : 'btn--secondary-vintage btn--outline-vintage';
					?>
						<a class="btn <?php echo esc_attr( $btn_class ); ?>" href="<?php echo esc_url( $btn_url ); ?>"<?php echo '_blank' === $btn_tgt ? ' target="_blank" rel="noopener"' : ''; ?>>
							<?php if ( '' !== $btn_icon ) : ?>
								<span class="btn__icon"><?php echo IconHelper::render( $btn_icon, '#f6d599', 15 ); // phpcs:ignore ?></span>
							<?php endif; ?>
							<span><?php echo esc_html( $btn_label ); ?></span>
						</a>
					<?php endforeach; ?>
				</div>
			</div>

			<!-- Right Column: 70% Width Frameless Media Stage with Seamless Left Gradient / SVG Cut Blend -->
			<div class="hero-sugarcane__media-wrap">
				<?php $autoplay_ms = (int) ( $hero['settings']['autoplay_delay'] ?? 5000 ); ?>
				<div class="hero-carousel-container" id="hero-image-carousel" data-autoplay="<?php echo esc_attr( (string) $autoplay_ms ); ?>">
					
					<!-- Slides Wrapper -->
					<div class="hero-carousel-slides">
						<?php foreach ( $slides as $idx => $slide ) :
							$slide_media     = (array) ( $slide['media'] ?? array() );
							$slide_type      = (string) ( $slide_media['type'] ?? 'image' );
							$slide_img       = UrlHelper::resolve( (string) ( $slide_media['src'] ?? ( $slide_media['poster'] ?? '' ) ) );
							$slide_video     = (string) ( $slide_media['video'] ?? ( 'video' === $slide_type ? ( $slide_media['src'] ?? '' ) : '' ) );
							$slide_video_url = '' !== $slide_video ? UrlHelper::resolve( $slide_video ) : '';
							$slide_content   = (array) ( $slide['content'] ?? array() );
							$slide_alt       = (string) ( $slide_media['alt'] ?? ( $slide_content['title'] ?? '' ) );
							$is_video        = 'video' === $slide_type || '' !== $slide_video_url;
						?>
							<div class="hero-carousel-slide<?php echo 0 === $idx ? ' is-active' : ''; ?>" 
								 data-index="<?php echo esc_attr( (string) $idx ); ?>"
								 data-title="<?php echo esc_attr( (string) ( $slide_content['title'] ?? '' ) ); ?>"
								 data-eyebrow="<?php echo esc_attr( (string) ( $slide_content['eyebrow'] ?? '' ) ); ?>"
								 data-checklist='<?php echo esc_attr( (string) wp_json_encode( (array) ( $slide_content['checklist'] ?? array() ) ) ); ?>'
								 data-buttons='<?php echo esc_attr( (string) wp_json_encode( (array) ( $slide_content['buttons'] ?? array() ) ) ); ?>'>
								<?php if ( $is_video ) : ?>
									<video class="hero-carousel-video" autoplay muted playsinline poster="<?php echo esc_url( $slide_img ); ?>">
										<source src="<?php echo esc_url( $slide_video_url ); ?>" type="video/mp4">
									</video>
								<?php else : ?>
									<img class="hero-carousel-image" src="<?php echo esc_url( $slide_img ); ?>" alt="<?php echo esc_attr( $slide_alt ); ?>" loading="<?php echo 0 === $idx ? 'eager' : 'lazy'; ?>">
								<?php endif; ?>
							</div>
						<?php endforeach; ?>
					</div>

					<!-- Bottom-Right Carousel Navigation Dots -->
					<div class="hero-carousel-dots" id="hero-dots" role="tablist" aria-label="Slide Indicators">
						<?php foreach ( $slides as $idx => $slide ) : ?>
							<button type="button" 
									class="hero-carousel-dot<?php echo 0 === $idx ? ' is-active' : ''; ?>" 
									data-index="<?php echo esc_attr( (string) $idx ); ?>"
									role="tab"
									aria-selected="<?php echo 0 === $idx ? 'true' : 'false'; ?>"
									aria-label="Slide <?php echo esc_attr( (string) ( $idx + 1 ) ); ?>">
							</button>
						<?php endforeach; ?>
					</div>

				</div>

				<!-- Decorative Vintage Torn Edge Cut Shading -->
				<div class="hero-media-cut-divider" aria-hidden="true"></div>
			</div>

		</div>
	</div>

</section>

<!-- Inline script for smooth auto-rotating Hero Carousel (Video Completion + Configured Duration) -->
<script>
(function() {
	function initHeroCarousel() {
		var heroSection = document.getElementById('home-hero');
		var container = document.getElementById('hero-image-carousel');
		if (!container) return;

		var slides = container.querySelectorAll('.hero-carousel-slide');
		var dotsContainer = document.getElementById('hero-dots');
		var dots = dotsContainer ? dotsContainer.querySelectorAll('.hero-carousel-dot') : [];
		var currentIndex = 0;
		var autoTimer = null;
		var isHovered = false;
		var IMAGE_DURATION = parseInt(container.getAttribute('data-autoplay'), 10) || 5000;

		if (slides.length <= 1) return;

		function clearCurrentTimer() {
			if (autoTimer) {
				clearTimeout(autoTimer);
				autoTimer = null;
			}
		}

		function scheduleNext(delay) {
			clearCurrentTimer();
			if (isHovered) return;
			autoTimer = setTimeout(function() {
				goToSlide(currentIndex + 1);
			}, delay);
		}

		function goToSlide(index) {
			clearCurrentTimer();
			if (index < 0) index = slides.length - 1;
			if (index >= slides.length) index = 0;
			currentIndex = index;

			var activeSlide = slides[currentIndex];
			var activeVideo = null;

			slides.forEach(function(s, idx) {
				var isActive = idx === currentIndex;
				s.classList.toggle('is-active', isActive);
				var vid = s.querySelector('video');
				if (vid) {
					if (isActive) {
						activeVideo = vid;
						vid.currentTime = 0;
						vid.play().catch(function() {});
					} else {
						vid.pause();
					}
				}
			});

			// Update dots
			if (dots && dots.length > 0) {
				dots.forEach(function(d, idx) {
					var isActive = idx === currentIndex;
					d.classList.toggle('is-active', isActive);
					d.setAttribute('aria-selected', isActive ? 'true' : 'false');
				});
			}

			// Synchronize Left Story Headline, Eyebrow & Checklist with smooth crossfade
			if (activeSlide) {
				var titleEl = document.getElementById('hero-title');
				var eyebrowEl = document.getElementById('hero-eyebrow');
				var checklistEl = document.getElementById('hero-checklist');

				var titleText = activeSlide.getAttribute('data-title');
				var eyebrowText = activeSlide.getAttribute('data-eyebrow');
				var checklistRaw = activeSlide.getAttribute('data-checklist');

				function formatAnimatedTitle(text) {
					var words = text.split(/\s+/);
					var html = '';
					var charIdx = 0;
					words.forEach(function(word, wIdx) {
						if (!word) return;
						html += '<span class="hero-word" style="--word-idx:' + wIdx + ';">';
						var chars = word.split('');
						chars.forEach(function(char) {
							html += '<span class="hero-char" style="--char-idx:' + charIdx + ';">' + char + '</span>';
							charIdx++;
						});
						html += '</span> ';
					});
					return html.trim();
				}

				if (titleEl && titleText) {
					titleEl.style.opacity = '0';
					setTimeout(function() {
						titleEl.innerHTML = formatAnimatedTitle(titleText);
						titleEl.style.opacity = '1';
					}, 200);
				}
				if (eyebrowEl && eyebrowText && eyebrowEl.textContent !== eyebrowText) {
					eyebrowEl.style.opacity = '0';
					setTimeout(function() {
						eyebrowEl.textContent = eyebrowText;
						eyebrowEl.style.opacity = '1';
					}, 200);
				}
				if (checklistEl && checklistRaw) {
					try {
						var items = JSON.parse(checklistRaw);
						if (Array.isArray(items) && items.length > 0) {
							checklistEl.style.opacity = '0';
							setTimeout(function() {
								checklistEl.innerHTML = items.map(function(item) {
									return '<li><span class="hero-sugarcane__check">✓</span> ' + item + '</li>';
								}).join('');
								checklistEl.style.opacity = '1';
							}, 200);
						}
					} catch(e) {}
				}

				var buttonsEl = document.getElementById('hero-buttons');
				var buttonsRaw = activeSlide.getAttribute('data-buttons');
				if (buttonsEl && buttonsRaw) {
					try {
						var btns = JSON.parse(buttonsRaw);
						if (Array.isArray(btns) && btns.length > 0) {
							buttonsEl.style.opacity = '0';
							setTimeout(function() {
								buttonsEl.innerHTML = btns.map(function(btn, bIdx) {
									var bClass = bIdx === 0 ? 'btn--primary-vintage' : 'btn--secondary-vintage btn--outline-vintage';
									var bUrl = btn.url || (btn.route ? '/' + btn.route : '/contact');
									var bTgt = btn.target === '_blank' ? ' target="_blank" rel="noopener"' : '';
									return '<a class="btn ' + bClass + '" href="' + bUrl + '"' + bTgt + '><span>' + (btn.label || 'Learn More') + '</span></a>';
								}).join('');
								buttonsEl.style.opacity = '1';
							}, 200);
						}
					} catch(e) {}
				}
			}

			// If active slide has a video, listen for video completion ('ended')
			if (activeVideo) {
				var onVideoEnded = function() {
					activeVideo.removeEventListener('ended', onVideoEnded);
					goToSlide(currentIndex + 1);
				};
				activeVideo.addEventListener('ended', onVideoEnded);

				// Safety fallback if video hangs or autoplay is blocked
				var fallbackDuration = (activeVideo.duration && !isNaN(activeVideo.duration) && activeVideo.duration > 0)
					? Math.ceil(activeVideo.duration * 1000) + 500
					: 8500;
				scheduleNext(fallbackDuration);
			} else {
				// Static image: exact 4 seconds duration
				scheduleNext(IMAGE_DURATION);
			}
		}

		// Connect interactive dot clicks
		if (dots && dots.length > 0) {
			dots.forEach(function(dot) {
				dot.addEventListener('click', function(e) {
					e.preventDefault();
					var idx = parseInt(this.getAttribute('data-index'), 10);
					if (!isNaN(idx)) {
						goToSlide(idx);
					}
				});
			});
		}

		// Pause auto-rotation on mouse hover over hero stage, resume on leave
		if (heroSection) {
			heroSection.addEventListener('mouseenter', function() {
				isHovered = true;
				clearCurrentTimer();
			});
			heroSection.addEventListener('mouseleave', function() {
				isHovered = false;
				var currentSlide = slides[currentIndex];
				var currentVid = currentSlide ? currentSlide.querySelector('video') : null;
				if (!currentVid || currentVid.ended || currentVid.paused) {
					scheduleNext(IMAGE_DURATION);
				}
			});
		}

		// Start on slide 0
		goToSlide(0);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initHeroCarousel);
	} else {
		initHeroCarousel();
	}
})();
</script>
