<?php
namespace Adn\Theme\Service;

defined( 'ABSPATH' ) || exit;

/**
 * Centralized Asset Loader — Performance-Optimized
 *
 * CSS/JS is split into CORE (always loaded) and CONDITIONAL (loaded only when needed).
 * This reduces per-page weight from 15 CSS + 8 JS to ~10 CSS + 5 JS on most pages.
 */
class AssetLoader {

	/** Core CSS loaded on every page (layout, typography, chrome). */
	private const CORE_CSS = [
		'adn-fonts-style'      => '/assets/css/fonts.css',
		'adn-varaibles-style'  => '/assets/css/variables.css',
		'adn-chrome-style'     => '/assets/css/chrome.css',
		'adn-main-style'       => '/assets/css/main.css',
		'adn-common-style'     => '/assets/css/common.css',
		'adn-components-style' => '/assets/css/components.css',
		'adn-shared-style'     => '/assets/css/shared.css',
		'adn-builded-style'    => '/assets/css/builded.css',
		'adn-utils-style'      => '/assets/css/common_utils.css',
		'adn-fa-style'         => '/assets/css/fastyles.css',
		'adn-premium-style'    => '/assets/css/premium_styles.css',
		'adn-resources-style'  => '/assets/css/resources.css',
		'adn-faqs-style'       => '/assets/css/faqs.css',
		'adn-contact-style'    => '/assets/css/contact.css',
		'adn-article-style'    => '/assets/css/article.css',
		'adn-single-style'     => '/assets/css/single.css',

	];

	/** Core JS loaded on every page. */
	private const CORE_JS = [
		'adn-utils-script'         => '/assets/js/common_utils.js',
		'adn-main-script'          => '/assets/js/main.js',
		'adn-common-script'        => '/assets/js/common.js',
		'adn-scroll-to-top-script' => '/assets/js/scroll-to-top.js',
		'adn-premium-script'       => '/assets/js/premium.js',
		'adn-faqs-script'          => '/assets/js/faqs.js',
		'adn-form-builder-script'  => '/assets/js/form-builder.js',
		'adn-offline-search-script'=> '/assets/js/offline-search.js',
	];

	/** CSS loaded only on specific page templates. */
	private const PAGE_CSS = [
		'page-topic_category_guide' => [ 'adn-guidance-style'  => '/assets/css/guidance.css' ],
	];

	/** JS loaded only on specific page templates. */
	private const PAGE_JS = [
		'page-ask-expert'      => [ 'adn-form-builder-script'  => '/assets/js/form-builder.js' ],
	];

	/** JS loaded only on single posts. */
	private const SINGLE_CSS = [
		'adn-cardner-style' => '/assets/css/article_cardner.css',
	];

	public static function load(): void {
		self::loadCoreCss();
		self::loadCoreJs();
		self::loadConditionalAssets();
		self::loadPageSpecific();
		self::loadTracking();
		self::loadEmbedMode();
		self::loadBlockRenderer();
		self::loadReviewCards();
		self::loadBlockquoteFonts();
	}

	/**
	 * Review card design CSS — loaded on EVERY frontend page, not just the
	 * /reviews/ listing or Home carousel. [ah_review id="X"] is a real
	 * WordPress shortcode (AH_Review_Shortcode) that can be dropped into any
	 * page or post's content, so there's no single template to key this off
	 * the way loadBlockRenderer() keys off $GLOBALS['ah_builder_page'].
	 *
	 * Same two-file cascade as loadBlockRenderer(): the plugin's own
	 * theme-agnostic structural CSS first, then this theme's color/font
	 * design layer (review-cards-theme.css) on top of it.
	 */
	private static function loadReviewCards(): void {
		if ( \defined( 'AH_PLUGIN_URL' ) && \defined( 'AH_PLUGIN_DIR' ) ) {
			$base_path = \AH_PLUGIN_DIR . '/assets/css/review-cards-base.css';
			if ( \file_exists( $base_path ) ) {
				\wp_enqueue_style( 'ah-review-cards-base', \AH_PLUGIN_URL . '/assets/css/review-cards-base.css', [ 'adn-varaibles-style' ], self::version( $base_path ) );
			}
		}

		$theme_path = \ADN_THEME_DIR . '/assets/css/review-cards-theme.css';
		if ( \file_exists( $theme_path ) ) {
			\wp_enqueue_style( 'ah-review-cards-theme', \ADN_THEME_URI . '/assets/css/review-cards-theme.css', [ 'ah-review-cards-base' ], self::version( $theme_path ) );
		}
	}

	/**
	 * Decorative fonts (Edu VIC WA NT Hand, Fondamento) - loaded sitewide so
	 * any component can use them (currently .article-body blockquote).
	 * Loaded live from Google (not self-hosted like fonts.css) per explicit
	 * decision to accept the pre-consent third-party request for these two
	 * decorative faces.
	 */
	private static function loadBlockquoteFonts(): void {
		\add_action( 'wp_head', static function () {
			echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
			echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
		}, 1 );

		\wp_enqueue_style(
			'adn-blockquote-fonts',
			'https://fonts.googleapis.com/css2?family=Edu+VIC+WA+NT+Hand:wght@400..700&family=Fondamento:ital@0;1&display=swap',
			[],
			null
		);
	}

	/**
	 * Page Builder block-renderer CSS - loaded only on builder pages.
	 *
	 * $GLOBALS['ah_builder_page'] is set by AH_Builder_Page_Service::handleFrontend()
	 * on template_redirect (priority 5), well before wp_enqueue_scripts fires, so
	 * it's a reliable "this is a builder-rendered page" signal here.
	 *
	 * Two files, loaded in cascade order: the plugin's own theme-agnostic
	 * structural CSS first, then this theme's color/typography design layer
	 * (block-render-page-styles.css) on top of it.
	 */
	private static function loadBlockRenderer(): void {
		if ( empty( $GLOBALS['ah_builder_page'] ) ) {
			return;
		}

		if ( \defined( 'AH_PLUGIN_URL' ) && \defined( 'AH_PLUGIN_DIR' ) ) {
			$base_path = \AH_PLUGIN_DIR . '/assets/css/block-render-base.css';
			if ( \file_exists( $base_path ) ) {
				\wp_enqueue_style( 'ah-block-render-base', \AH_PLUGIN_URL . '/assets/css/block-render-base.css', [ 'adn-varaibles-style' ], self::version( $base_path ) );
			}
		}

		$page_path = \ADN_THEME_DIR . '/assets/css/block-render-page-styles.css';
		if ( \file_exists( $page_path ) ) {
			\wp_enqueue_style( 'ah-block-render-page-styles', \ADN_THEME_URI . '/assets/css/block-render-page-styles.css', [ 'ah-block-render-base' ], self::version( $page_path ) );
		}
	}

	/**
	 * Load embed-mode CSS when ?embed=1 is on contact/guidance pages.
	 */
	private static function loadEmbedMode(): void {
		if ( empty( $_GET['embed'] ) && empty( $_GET['dialog'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			return;
		}
		$template = self::getCurrentTemplate();
		if ( ! in_array( $template, [ 'PageContact', 'PageGuidance' ], true ) ) {
			return;
		}
		$path = \ADN_THEME_DIR . '/assets/css/embed-mode.css';
		if ( \file_exists( $path ) ) {
			\wp_enqueue_style( 'adn-embed-mode-style', \ADN_THEME_URI . '/assets/css/embed-mode.css', [], self::version( $path ) );
		}
	}

	/**
	 * Core CSS — loaded on every page (11 files).
	 */
	private static function loadCoreCss(): void {
		foreach ( self::CORE_CSS as $handle => $file ) {
			$path = \ADN_THEME_DIR . $file;
			$ver  = self::version( $path );
			\wp_enqueue_style( $handle, \ADN_THEME_URI . $file, [], $ver );
		}
		\wp_enqueue_style( 'adn-cookie-consent-style', \ADN_THEME_URI . '/assets/css/cookie-consent.css', [], self::version( \ADN_THEME_DIR . '/assets/css/cookie-consent.css' ) );
		\wp_enqueue_style( 'adn-fontawesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css', [], '6.5.2' );
	}

	/**
	 * Core JS — loaded on every page (5 files).
	 */
	private static function loadCoreJs(): void {
		foreach ( self::CORE_JS as $handle => $file ) {
			$path = \ADN_THEME_DIR . $file;
			if ( ! \file_exists( $path ) || \filesize( $path ) === 0 ) {
				continue;
			}
			$ver  = self::version( $path );
			\wp_enqueue_script( $handle, \ADN_THEME_URI . $file, [ 'jquery' ], $ver, true );
		}
		// Cookie consent — always needed (banner on all pages)
		$path_cc = \ADN_THEME_DIR . '/assets/js/cookie-consent.js';
		\wp_enqueue_script( 'adn-cookie-consent-script', \ADN_THEME_URI . '/assets/js/cookie-consent.js', [ 'jquery' ], self::version( $path_cc ), true );

		// Localize cookie consent config
		\wp_localize_script( 'adn-cookie-consent-script', 'adnConsentCfg', [
			'policyUrl'         => \home_url( '/cookie-policy/' ),
			'isCookiePolicyPage' => \is_page( 'cookie-policy' ) ? 1 : 0,
			'acceptVersion'     => (string) \get_option( 'adn_cookie_consent_accept_version', 1 ),
			'rejectVersion'     => (string) \get_option( 'adn_cookie_consent_reject_version', 1 ),
		] );

		// Localize visitor/ajax URLs on utils script
		\wp_add_inline_script(
			'adn-utils-script',
			'window.adnSite=' . \wp_json_encode( [
				'visitorsUrl' => \rest_url( 'adn/v1/visitors' ),
				'pingUrl'     => \rest_url( 'adn/v1/visitors/ping' ),
				'ajaxUrl'     => \admin_url( 'admin-ajax.php' ),
			] ) . ';',
			'before'
		);

		// Localize random CTA messages for dynamic random placement (100% DB-driven)
		// Skip entirely if in 404, search, embed, or preview mode
		$is_disabled_context = \is_404() || \is_search() || \is_embed() || ! empty( $_GET['embed'] ) || ! empty( $_GET['preview_mode'] );
		$ctas_data = [];
		if ( ! $is_disabled_context ) {
			if ( class_exists( 'ADN_Additionals_Handler' ) ) {
				$ctas_data = \ADN_Additionals_Handler::get_active_ctas();
			} else {
				$saved = \get_option( 'ah_random_cta_messages', [] );
				$ctas_data = \is_array( $saved ) ? $saved : [];
			}
		}

		\wp_add_inline_script(
			'adn-common-script',
			'window.ADN_RANDOM_CTAS=' . \wp_json_encode( $ctas_data ) . ';',
			'before'
		);
	}

	/**
	 * Load page-specific conditional CSS/JS based on current template.
	 */
	private static function loadConditionalAssets(): void {
		$template = self::getCurrentTemplate();

		// Conditional CSS
		if ( isset( self::PAGE_CSS[ $template ] ) ) {
			foreach ( self::PAGE_CSS[ $template ] as $handle => $file ) {
				$path = \ADN_THEME_DIR . $file;
				if ( \file_exists( $path ) ) {
					\wp_enqueue_style( $handle, \ADN_THEME_URI . $file, [], self::version( $path ) );
				}
			}
		}

		// Conditional JS
		if ( isset( self::PAGE_JS[ $template ] ) ) {
			$loaded = [];
			foreach ( self::PAGE_JS[ $template ] as $handle => $file ) {
				if ( \in_array( $handle, $loaded, true ) ) {
					continue; // don't enqueue same handle twice
				}
				$path = \ADN_THEME_DIR . $file;
				if ( \file_exists( $path ) ) {
					\wp_enqueue_script( $handle, \ADN_THEME_URI . $file, [ 'jquery' ], self::version( $path ), true );
					$loaded[] = $handle;
				}
			}
		}

		// Single post assets
		if ( \is_single() ) {
			foreach ( self::SINGLE_CSS as $handle => $file ) {
				$path = \ADN_THEME_DIR . $file;
				if ( \file_exists( $path ) ) {
					\wp_enqueue_style( $handle, \ADN_THEME_URI . $file, [], self::version( $path ) );
				}
			}
			$single_js = \ADN_THEME_DIR . '/assets/js/single.js';
			if ( \file_exists( $single_js ) ) {
				\wp_enqueue_script( 'adn-single-script', \ADN_THEME_URI . '/assets/js/single.js', [], self::version( $single_js ), true );
				\wp_localize_script( 'adn-single-script', 'adnComments', [
					'ajaxUrl'     => \admin_url( 'admin-ajax.php' ),
					'submitNonce' => \wp_create_nonce( 'adn_comment_nonce' ),
					'loadNonce'   => \wp_create_nonce( 'adn_load_comments' ),
					'postId'      => (int) \get_queried_object_id(),
					'perPage'     => 10,
					'i18n'        => [
						'posting'  => \__( 'Posting…', ADN_TEXT_DOMAIN ),
						'loading'  => \__( 'Loading…', ADN_TEXT_DOMAIN ),
						'loadMore' => \__( 'Load more comments', ADN_TEXT_DOMAIN ),
						'noMore'   => \__( 'All comments loaded', ADN_TEXT_DOMAIN ),
					],
				] );
			}
		}
	}

	/**
	 * Load page-specific CSS/JS + localized data per template.
	 */
	private static function loadPageSpecific(): void {
		$template_assets = [
			'PageHome'         => [ 'css' => '/assets/css/home.css',         'js' => '/assets/js/home.js' ],
			'PageContact'      => [ 'css' => '/assets/css/contact.css',      'js' => '/assets/js/contact.js' ],
			'PageNewsall'      => [ 'css' => '/assets/css/news.css',         'js' => '/assets/js/news.js' ],
			'PageGuides'       => [ 'css' => '/assets/css/guides_listing.css', 'js' => '/assets/js/guides_listing.js' ],
			'PageGuidesListing' => [ 'css' => '/assets/css/guides_listing.css', 'js' => '/assets/js/guides_listing.js' ],
			'PageTools'        => [ 'css' => '/assets/css/tools.css',        'js' => '/assets/js/tools.js' ],
			'PageToolSingle'  => [ 'css' => '/assets/css/tools.css',        'js' => '/assets/js/tools.js' ],
			'PageGuidance'     => [ 'css' => '/assets/css/guidance.css',     'js' => '/assets/js/guidance.js' ],
			'PageHowItWorks'   => [ 'css' => '/assets/css/how-it-works.css' ],
			'PageAskExpert'   => [ 'css' => '/assets/css/ask_expert.css',   'js' => '/assets/js/ask_expert.js' ],
			'PageExpertSingle' => [ 'css' => '/assets/css/ask_expert.css',  'js' => '/assets/js/ask_expert.js' ],
			'PageCategoryGuide' => [ 'css' => '/assets/css/guidance.css',   'js' => '/assets/js/guidance.js' ],
			'PageTopicCategoryGuide' => [ 'css' => '/assets/css/guidance.css', 'js' => '/assets/js/guidance.js' ],
			'PageFaqs'         => [ 'css' => '/assets/css/faqs.css',         'js' => '/assets/js/faqs.js' ],
			'PageReviews'      => [ 'css' => '/assets/css/reviews.css' ],
		];

		$template = self::getCurrentTemplate();

		foreach ( $template_assets as $tpl => $assets ) {
			if ( $template !== $tpl ) {
				continue;
			}
			$handle = 'adn-' . $tpl;
			if ( ! empty( $assets['css'] ) && \file_exists( \ADN_THEME_DIR . $assets['css'] ) ) {
				\wp_enqueue_style( $handle . '-style', \ADN_THEME_URI . $assets['css'], [], self::version( \ADN_THEME_DIR . $assets['css'] ) );
			}
			if ( ! empty( $assets['js'] ) && \file_exists( \ADN_THEME_DIR . $assets['js'] ) ) {
				\wp_enqueue_script( $handle . '-script', \ADN_THEME_URI . $assets['js'], [ 'jquery' ], self::version( \ADN_THEME_DIR . $assets['js'] ), true );
			}
		}

		// Per-page nonce/localized vars
		if ( \in_array( $template, [ 'PageContact', 'PageGuidance' ], true ) ) {
			\wp_localize_script( 'adn-' . $template . '-script', 'adnEnquiry', [
				'ajaxUrl'   => \admin_url( 'admin-ajax.php' ),
				'nonce'     => \wp_create_nonce( 'ah_enquiry_nonce' ),
				'restBase'  => \rest_url( ADN_API_NS ),
				'restNonce' => \wp_create_nonce( 'wp_rest' ),
			] );
		}

		if ( $template === 'PageNewsall' ) {
			\wp_localize_script( 'adn-PageNewsall-script', 'adnNews', [
				'apiBase'    => \rest_url( ADN_API_NS . '/news' ),
				'restNonce'  => \wp_create_nonce( 'wp_rest' ),
				'defaultImg' => \get_template_directory_uri() . THEME_DEFAULT_NEWS_IMG . '?v=' . LOCAL_CACHE_VERSION,
				'perPage'    => 8,
				'i18n'       => [
					'empty'    => \__( 'No news found. Try a different filter or search.', ADN_TEXT_DOMAIN ),
					'error'    => \__( 'Could not load news right now. Please try again.', ADN_TEXT_DOMAIN ),
					'loading'  => \__( 'Loading…', ADN_TEXT_DOMAIN ),
					'loadMore' => \defined( 'SITE_BTN_LOAD_MORE' ) ? SITE_BTN_LOAD_MORE : \__( 'Load More', ADN_TEXT_DOMAIN ),
					'readMore' => \__( 'Read', ADN_TEXT_DOMAIN ),
				],
			] );
		}

		if ( $template === 'PageAskExpert' ) {
			\wp_localize_script( 'adn-PageAskExpert-script', 'adnExpert', [
				'ajaxUrl'     => \admin_url( 'admin-ajax.php' ),
				'nonce'       => \wp_create_nonce( 'adn_expert_contact' ),
				'unlockNonce' => \wp_create_nonce( 'adn_expert_unlock' ),
			] );
		}
	}

	/**
	 * Load tracking scripts (GTM/GA4/Ads/AdSense) if configured.
	 */
	private static function loadTracking(): void {
		$tracking   = \get_option( 'adn_tracking_settings', [] );
		$gtm_id     = \is_array( $tracking ) && ! empty( $tracking['gtm_id'] ) ? $tracking['gtm_id'] : '';
		$ga4_id     = \is_array( $tracking ) && ! empty( $tracking['ga4_id'] ) ? $tracking['ga4_id'] : '';
		$ads_id     = \is_array( $tracking ) && ! empty( $tracking['ads_id'] ) ? $tracking['ads_id'] : '';
		$adsense_id = \is_array( $tracking ) && ! empty( $tracking['adsense_id'] ) ? $tracking['adsense_id'] : '';

		if ( $gtm_id || $ga4_id || $ads_id || $adsense_id ) {
			$path = \ADN_THEME_DIR . '/assets/js/analytics-consent.js';
			\wp_enqueue_script(
				'adn-analytics-consent-script',
				\ADN_THEME_URI . '/assets/js/analytics-consent.js',
				[ 'adn-cookie-consent-script' ],
				self::version( $path ),
				true
			);
			\wp_localize_script( 'adn-analytics-consent-script', 'adnTrackingCfg', [
				'gtmId'     => $gtm_id,
				'ga4Id'     => $ga4_id,
				'adsId'     => $ads_id,
				'adsenseId' => $adsense_id,
			] );
		}
	}

	/**
	 * Get the current page template name.
	 */
	private static function getCurrentTemplate(): string {
		$virtual_tpl = (string) \get_query_var( 'adn_virtual_template', '' );
		if ( '' !== $virtual_tpl ) {
			return $virtual_tpl;
		}

		$template = \get_page_template_slug();
		if ( $template ) {
			$base = \basename( $template, '.php' );
			return $base;
		}

		if ( \is_singular( 'post' ) ) {
			return 'single';
		}

		if ( \is_page() ) {
			$page_id = \get_the_ID();
			$slug = (string) \get_post_field( 'post_name', $page_id );
			if ( function_exists( 'adn_get_page_definitions' ) ) {
				$defs = \adn_get_page_definitions();
				if ( isset( $defs[ $slug ]['template'] ) ) {
					return \basename( $defs[ $slug ]['template'], '.php' );
				}
				foreach ( $defs as $def_slug => $def ) {
					if ( ! empty( $def['aliases'] ) && in_array( $slug, (array) $def['aliases'], true ) && ! empty( $def['template'] ) ) {
						return \basename( $def['template'], '.php' );
					}
				}
			}
			return 'page-' . $slug;
		}

		if ( function_exists( 'adn_get_page_definitions' ) ) {
			$raw  = isset( $_SERVER['REQUEST_URI'] ) ? \sanitize_text_field( \wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
			$path = trim( (string) parse_url( $raw, PHP_URL_PATH ), '/' );
			$defs = \adn_get_page_definitions();
			if ( isset( $defs[ $path ]['template'] ) ) {
				return \basename( $defs[ $path ]['template'], '.php' );
			}
			foreach ( $defs as $def_slug => $def ) {
				if ( ! empty( $def['aliases'] ) && in_array( $path, (array) $def['aliases'], true ) && ! empty( $def['template'] ) ) {
					return \basename( $def['template'], '.php' );
				}
			}
		}

		return '';
	}

	/**
	 * Get file version for cache busting.
	 */
	private static function version( string $path ): int {
		if ( \file_exists( $path ) ) {
			return \filemtime( $path );
		}
		if ( \defined( 'LOCAL_CACHE_VERSION' ) ) {
			return LOCAL_CACHE_VERSION;
		}
		return \defined( 'ADN_THEME_VERSION' ) ? \ADN_THEME_VERSION : 1;
	}
}
