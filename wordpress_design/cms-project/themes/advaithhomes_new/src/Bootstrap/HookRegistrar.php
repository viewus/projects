<?php
namespace Adn\Theme\Bootstrap;

defined( 'ABSPATH' ) || exit;

class HookRegistrar {

	public static function register(): void {
		self::registerSetup();
		self::registerCache();
		self::registerFrontend();
		self::registerAdmin();
		self::registerDatabase();
		self::registerAjax();
		self::registerFilters();
		self::registerShortcodes();
		self::registerFeatureModules();
	}

	private static function registerSetup(): void {
		\add_action( 'after_setup_theme', 'ahn_include_files' );
		\add_action( 'after_setup_theme', 'adn_theme_register' );
	}

	private static function registerCache(): void {
		\add_action( 'admin_bar_menu', function( $wp_admin_bar ) {
			if ( ! \is_admin() || ! \current_user_can( 'manage_options' ) ) {
				return;
			}
			$clear_url = \add_query_arg(
				array( 'page' => 'adn-theme-admin-actions', 'subtab' => 'cache' ),
				\admin_url( 'admin.php' )
			);
			$wp_admin_bar->add_node( array(
				'id'    => 'adn-clear-cache',
				'title' => '⚡ Clear Cache',
				'href'  => $clear_url,
				'meta'  => array(
					'title' => 'Clear all theme filesystem and CMS caches',
				),
			) );
		}, 100 );
	}

	private static function registerFrontend(): void {
		\add_action( 'wp_footer', 'adn_render_site_notice_popup' );
		\add_action( 'wp_footer', 'adn_render_floating_contact' );
		\add_action( 'wp_footer', 'adn_render_page_modal' );
		\add_action( 'wp_head', 'adn_reveal_gate', 1 );
		\add_action( 'wp_footer', 'adn_reveal_runtime', 30 );
		\add_action( 'template_redirect', 'adn_expert_full_page_render', 0 );
		\add_action( 'template_redirect', 'adn_check_coming_soon' );
		\add_action( 'init', 'adn_set_language_cookie' );

		// Render FAQs attached to the current page's slug (from admin FAQ → attached_slug field)
		// NOTE: Moved to PageHelper::close() to render BEFORE footer, not after via wp_footer

		// Centralized asset loading (replaces scattered wp_enqueue calls in page templates)
		\add_action( 'wp_enqueue_scripts', [ \Adn\Theme\Service\AssetLoader::class, 'load' ] );
	}

	private static function registerAdmin(): void {
		if ( \is_admin() ) {
			// Theme admin loaded from functions.php via require_once
			\add_action( 'admin_enqueue_scripts', [ self::class, 'enqueueAdminDesignLayer' ] );
		}
	}

	/**
	 * Theme design layer for the CMS plugin's Page Builder screen.
	 *
	 * The plugin ships only structure (handle: ah-page-builder-base); this adds
	 * the brand colour/typography/motion on top. Declared as a dependency so it
	 * always loads AFTER the base and can override it, and it no-ops when the
	 * plugin isn't active - the theme must not style a screen that isn't there.
	 */
	public static function enqueueAdminDesignLayer( string $hook ): void {
		if ( \strpos( $hook, 'ah-page-builder' ) === false ) {
			return;
		}
		if ( ! \wp_style_is( 'ah-page-builder-base', 'registered' ) ) {
			return;
		}

		$rel  = '/assets/css/admin-page-builder.css';
		$path = \ADN_THEME_DIR . $rel;
		if ( ! \file_exists( $path ) ) {
			return;
		}

		\wp_enqueue_style(
			'adn-admin-page-builder',
			\ADN_THEME_URI . $rel,
			[ 'ah-page-builder-base' ],
			(string) \filemtime( $path )
		);
	}

	private static function registerDatabase(): void {
		\add_action( 'after_switch_theme', 'adn_create_default_pages' );
		\add_action( 'after_switch_theme', [ 'AH_Category_Settings', 'install' ] );
		\add_action( 'admin_init', [ 'AH_Category_Settings', 'maybe_install' ] );
		\add_action( 'after_switch_theme', [ 'AH_Calculator_DB', 'install' ] );
		\add_action( 'admin_init', [ 'AH_Calculator_DB', 'maybe_install' ] );
		\add_action( 'after_switch_theme', [ 'AH_Expert_DB', 'install' ] );
		\add_action( 'admin_init', [ 'AH_Expert_DB', 'maybe_install' ] );
		\add_action( 'after_switch_theme', [ 'AH_Enquiry_Model', 'install_table' ] );
		\add_action( 'admin_init', [ 'AH_Enquiry_Model', 'maybe_install' ] );
		\add_action( 'after_switch_theme', function() {
			\flush_rewrite_rules();
		} );
		\add_action( 'admin_init', function() {
			global $wp_rewrite;
			if ( $wp_rewrite->permalink_structure !== \get_option( 'adn_permalink_flushed' ) ) {
				\flush_rewrite_rules();
				\update_option( 'adn_permalink_flushed', $wp_rewrite->permalink_structure );
			}
		} );
	}

	private static function registerAjax(): void {
		\add_action( 'wp_ajax_adn_expert_contact', 'adn_expert_contact_ajax' );
		\add_action( 'wp_ajax_nopriv_adn_expert_contact', 'adn_expert_contact_ajax' );
		\add_action( 'wp_ajax_adn_expert_unlock', 'adn_expert_unlock_ajax' );
		\add_action( 'wp_ajax_nopriv_adn_expert_unlock', 'adn_expert_unlock_ajax' );
		\add_action( 'wp_ajax_adn_post_related_articles', 'adn_post_related_articles_ajax' );
		\add_action( 'wp_ajax_nopriv_adn_post_related_articles', 'adn_post_related_articles_ajax' );
		\add_action( 'wp_ajax_adn_post_helpful', 'adn_post_helpful_ajax' );
		\add_action( 'wp_ajax_nopriv_adn_post_helpful', 'adn_post_helpful_ajax' );
		\add_action( 'wp_ajax_adn_moderate_comment', 'adn_moderate_comment_ajax' );
		\add_action( 'wp_ajax_adn_submit_comment', 'adn_ajax_submit_comment' );
		\add_action( 'wp_ajax_nopriv_adn_submit_comment', 'adn_ajax_submit_comment' );
		\add_action( 'wp_ajax_adn_load_comments', 'adn_ajax_load_comments' );
		\add_action( 'wp_ajax_nopriv_adn_load_comments', 'adn_ajax_load_comments' );
		\add_action( 'init', [ 'ADN_Form_Ajax', 'init' ] );
		\add_action( 'init', [ 'ADN_Form_Ajax', 'init_public' ] );
	}

	private static function registerFilters(): void {
		\add_filter( 'rest_url_prefix', function() { return 'api'; } );
		// Ensure $wp_rewrite is initialized before REST API tries to use it
		\add_action( 'init', function() {
			global $wp_rewrite;
			if ( ! $wp_rewrite instanceof \WP_Rewrite ) {
				$wp_rewrite = new \WP_Rewrite();
			}
		}, 1 );
		\add_filter( 'wp_lazy_loading_enabled', '__return_true' );
		\add_filter( 'the_content', 'adn_add_img_lazy_attr', 10 );
		\add_filter( 'adn_calculators', 'adn_merge_db_calculators' );
		/*
		 * Cache-busting (?v=LOCAL_CACHE_VERSION). All four delegate to
		 * CacheBustingFilter, which is careful about things a naive string
		 * append/replace gets wrong: it keeps the version INSIDE the quotes,
		 * picks ?/& correctly when the URL already has a query string, skips
		 * URLs that are already versioned, and leaves EXTERNAL URLs alone
		 * (versioning a third-party embed can break it).
		 *
		 * Content images only - never a blanket rewrite of every src= in the
		 * content, which would corrupt <iframe>/<script>/<video> embeds too.
		 */
		\add_filter( 'wp_get_attachment_url', 'adn_cache_bust_attachment_url' );
		\add_filter( 'wp_get_attachment_image_src', 'adn_cache_bust_attachment_image_src' );
		\add_filter( 'the_content', 'adn_cache_bust_content_images' );
		\add_filter( 'the_content', 'adn_cache_bust_content_bg_images' );
		\add_filter( 'the_content', 'adn_clean_article_tags', 20 );
		\add_filter( 'pre_get_posts', function( $query ) {
			if ( $query->is_search() && ! \is_admin() ) {
				$query->set( 'posts_per_page', 12 );
			}
		} );
	}

	private static function registerShortcodes(): void {
		\add_shortcode( 'adn_cat_calculators', 'adn_shortcode_cat_calculators' );
		\add_shortcode( 'adn_cookie_preferences', 'adn_shortcode_cookie_preferences' );
	}

	private static function registerFeatureModules(): void {
		// Feature hooks registered via after_setup_theme → setup()
	}
}
