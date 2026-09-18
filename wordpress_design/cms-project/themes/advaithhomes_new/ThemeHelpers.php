<?php
function ahn_include_files() {
    // rules_conditions.php and the core_* files are already loaded early in functions.php.
    $files = array(
        '/common/common_functions.php',
        '/admin/SchemaInstaller.php', // ADN_Schema - needed at REST time too, not only wp-admin
        '/admin/Handlers/BaseHandler.php',        // ADN_Base_Handler - static utility methods only, no admin-only side effects at load time
        '/admin/Handlers/AdditionalsHandler.php', // ADN_Additionals_Handler - Random CTA enable/disable + per-message active/inactive logic lives here ONLY. MUST load on the frontend too (not just when is_admin()), otherwise AssetLoader::loadCoreJs() can't see this class and silently falls back to the raw, unfiltered ah_random_cta_messages option - showing disabled cards and ignoring the master toggle. DO NOT remove this line - see admin/Handlers/AdditionalsHandler.php and src/Service/AssetLoader.php.
        '/apis/services.php',          // data services (JSON today, real API later) + adn_link()
        '/apis/services_cms.php',      // read-only services backed by the CMS plugin DB (taxonomy tree + posts)
        '/calculators/calculators.php',// [ah_calculator] shortcode + isolated (iframe) calculator renderer
        '/apis/models/post.php',       // API models must load before the routes that use them
        '/apis/fetch_functions.php',   // REST route registration + callbacks
    );
    foreach ( $files as $file ) {
        $path = ADN_THEME_DIR . $file;
        if ( file_exists( $path ) ) {
            require_once $path;
        }
    }
}
/**
 * Append the daily cache-busting version to any local URL.
 *
 * Usage: adn_versioned_url( get_template_directory_uri() . '/assets/images/logo.png' )
 *
 * @param  string $url  The raw URL.
 * @return string       URL with ?v=LOCAL_CACHE_VERSION (or unchanged if already versioned).
 */
function adn_versioned_url( string $url ): string {
    if ( false !== strpos( $url, 'v=' ) ) {
        return $url;
    }
    $ver = defined( 'LOCAL_CACHE_VERSION' ) ? LOCAL_CACHE_VERSION : '';
    if ( '' === $ver ) {
        return $url;
    }
    $sep = ( false === strpos( $url, '?' ) ) ? '?v=' : '&v=';
    return $url . $sep . $ver;
}
/**
 * Does this URL point to a video file? Matches the admin media picker's own
 * extension check (plugins/cms-plugin/src/Admin/Components/AdminComponents.php).
 */
function adn_is_video_url( string $url ): bool {
    if ( '' === $url ) {
        return false;
    }
    $ext = strtolower( pathinfo( wp_parse_url( $url, PHP_URL_PATH ) ?: '', PATHINFO_EXTENSION ) );
    return in_array( $ext, array( 'mp4', 'webm', 'ogv', 'ogg', 'mov', 'avi' ), true );
}
function adn_enqueue_common_css() {

    $styles = array(
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
        'adn-contact-style'    => '/assets/css/contact.css',
        'adn-cookie-consent-style' => '/assets/css/cookie-consent.css',
        'adn-faqs-style'       => '/assets/css/faqs.css',
    );
    foreach ( $styles as $handle => $file ) {
        $path = ADN_THEME_DIR . $file;
        $ver  = defined( 'LOCAL_CACHE_VERSION' ) ? LOCAL_CACHE_VERSION : (file_exists( $path ) ? filemtime( $path ) : ADN_THEME_VERSION);
        wp_enqueue_style( $handle, ADN_THEME_URI . $file, array(), $ver );
    }
    // Font Awesome 6 (free) - powers adn_icon() across the theme.
    wp_enqueue_style( 'adn-fontawesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css', array(), '6.5.2' );
}
function adn_enqueue_common_js() {
    $scripts = array(
        'adn-utils-script'         => '/assets/js/common_utils.js',
        'adn-main-script'          => '/assets/js/main.js',
        'adn-common-script'        => '/assets/js/common.js',
        'adn-scroll-to-top-script' => '/assets/js/scroll-to-top.js',
        'adn-form-builder-script'   => '/assets/js/form-builder.js',
        'adn-cookie-consent-script' => '/assets/js/cookie-consent.js',
        'adn-premium-script'        => '/assets/js/premium.js',
        // Same reasoning as adn-faqs-style above - needed on every page now.
        'adn-faqs-script'           => '/assets/js/faqs.js',
    );
    foreach ( $scripts as $handle => $file ) {
        $path = ADN_THEME_DIR . $file;
        $ver  = defined( 'LOCAL_CACHE_VERSION' ) ? LOCAL_CACHE_VERSION : (file_exists( $path ) ? filemtime( $path ) : ADN_THEME_VERSION);
        wp_enqueue_script( $handle, ADN_THEME_URI . $file, array( 'jquery' ), $ver, true );
    }
    /* Pass cookie policy page URL + page context to the consent banner.
     * acceptVersion/rejectVersion bump when an admin re-asks consent (Theme →
     * Admin Actions → Cache) - a mismatch vs. the visitor's stored cookie
     * makes cookie-consent.js treat it as undecided and show the banner again. */
    wp_localize_script( 'adn-cookie-consent-script', 'adnConsentCfg', array(
        'policyUrl'          => home_url( '/cookie-policy/' ),
        'isCookiePolicyPage' => is_page( 'cookie-policy' ) ? 1 : 0,
        'acceptVersion'      => (string) get_option( 'adn_cookie_consent_accept_version', 1 ),
        'rejectVersion'      => (string) get_option( 'adn_cookie_consent_reject_version', 1 ),
    ) );
    wp_add_inline_script(
        'adn-utils-script',
        'window.adnSite=' . wp_json_encode( array(
            'visitorsUrl' => rest_url( 'adn/v1/visitors' ),
            'pingUrl'     => rest_url( 'adn/v1/visitors/ping' ),
            'ajaxUrl'     => admin_url( 'admin-ajax.php' ),
        ) ) . ';',
        'before'
    );

    /* Google Tag Manager / GA4 / Ads / AdSense - only enqueued when an ID is set
     * (Theme → Admin Actions → Tracking & Analytics). Each stays inert until the
     * visitor grants the matching cookie category (see analytics-consent.js). */
    $tracking   = get_option( 'adn_tracking_settings', array() );
    $gtm_id     = is_array( $tracking ) && ! empty( $tracking['gtm_id'] ) ? $tracking['gtm_id'] : '';
    $ga4_id     = is_array( $tracking ) && ! empty( $tracking['ga4_id'] ) ? $tracking['ga4_id'] : '';
    $ads_id     = is_array( $tracking ) && ! empty( $tracking['ads_id'] ) ? $tracking['ads_id'] : '';
    $adsense_id = is_array( $tracking ) && ! empty( $tracking['adsense_id'] ) ? $tracking['adsense_id'] : '';

    if ( $gtm_id || $ga4_id || $ads_id || $adsense_id ) {
        $path = ADN_THEME_DIR . '/assets/js/analytics-consent.js';
        $ver  = defined( 'LOCAL_CACHE_VERSION' ) ? LOCAL_CACHE_VERSION : ( file_exists( $path ) ? filemtime( $path ) : ADN_THEME_VERSION );
        wp_enqueue_script(
            'adn-analytics-consent-script',
            ADN_THEME_URI . '/assets/js/analytics-consent.js',
            array( 'adn-cookie-consent-script' ),
            $ver,
            true
        );
        wp_localize_script( 'adn-analytics-consent-script', 'adnTrackingCfg', array(
            'gtmId'     => $gtm_id,
            'ga4Id'     => $ga4_id,
            'adsId'     => $ads_id,
            'adsenseId' => $adsense_id,
        ) );
    }
}
function adn_enqueue_template_specific_assets() {
    // Keys must match the real page-template paths (the same ones used in adn_get_page_definitions()).
    $template_assets = array(
        'pages/PageHome.php' => array(
            'css' => '/assets/css/home.css',
            'js'  => '/assets/js/home.js',
        ),
        'pages/PageContact.php' => array(
            'css' => '/assets/css/contact.css',
            'js'  => '/assets/js/contact.js',
        ),
        'pages/PageNewsall.php' => array(
            'css' => '/assets/css/news.css',
            'js'  => '/assets/js/news.js',
        ),
        'pages/PageGuides.php' => array(
            'css' => '/assets/css/guides_listing.css',
            'js'  => '/assets/js/guides_listing.js',
        ),
        'pages/PageTools.php' => array(
            'css' => '/assets/css/tools.css',
            'js'  => '/assets/js/tools.js',
        ),
        'pages/PageGuidance.php' => array(
            'css' => '/assets/css/guidance.css',
            'js'  => '/assets/js/guidance.js',
        ),
        'pages/PageAskExpert.php' => array(
            'css' => '/assets/css/ask_expert.css',
            'js'  => '/assets/js/ask_expert.js',
        ),
        'pages/PageFaqs.php' => array(
            'css' => '/assets/css/faqs.css',
            'js'  => '/assets/js/faqs.js',
        ),
    );
    $virtual_tpl = (string) get_query_var( 'adn_virtual_template', '' );

    foreach ( $template_assets as $template => $assets ) {
        $base_name = basename( $template, '.php' );
        $is_active = is_page_template( $template ) || ( '' !== $virtual_tpl && $base_name === $virtual_tpl );
        if ( ! $is_active ) {
            continue;
        }
        $handle = 'adn-' . $base_name;
        // Only enqueue files that actually exist, so missing assets never 404.
        if ( ! empty( $assets['css'] ) && file_exists( ADN_THEME_DIR . $assets['css'] ) ) {
            $css_ver = defined('LOCAL_CACHE_VERSION') ? LOCAL_CACHE_VERSION : filemtime( ADN_THEME_DIR . $assets['css'] );
            wp_enqueue_style( $handle . '-style', ADN_THEME_URI . $assets['css'], array(), $css_ver );
        }
        if ( ! empty( $assets['js'] ) && file_exists( ADN_THEME_DIR . $assets['js'] ) ) {
            $js_ver = defined('LOCAL_CACHE_VERSION') ? LOCAL_CACHE_VERSION : filemtime( ADN_THEME_DIR . $assets['js'] );
            wp_enqueue_script( $handle . '-script', ADN_THEME_URI . $assets['js'], array( 'jquery' ), $js_ver, true );
        }
    }
    // Per-page nonce vars for legacy AJAX forms (contact, guidance still use admin-ajax.php).
    $current_template = get_page_template_slug();
    if ( in_array( $current_template, array( 'pages/PageContact.php', 'pages/PageGuidance.php' ), true ) ) {
        $enq_handle = 'adn-' . basename( $current_template, '.php' ) . '-script';
        wp_localize_script( $enq_handle, 'adnEnquiry', array(
            'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
            'nonce'     => wp_create_nonce( 'ah_enquiry_nonce' ),
            'restBase'  => rest_url( ADN_API_NS ),
            'restNonce' => wp_create_nonce( 'wp_rest' ),
        ) );
    }

    // News listing: REST config for AJAX-driven cards. Handles the virtual
    // template case (SITE_NEWS_URL) as well as a real page template assignment.
    $is_news_tpl = is_page_template( 'pages/PageNewsall.php' ) || ( '' !== $virtual_tpl && 'PageNewsall' === $virtual_tpl );
    $news_handle = wp_script_is( 'adn-PageNewsall-script', 'enqueued' ) ? 'adn-PageNewsall-script' : ( wp_script_is( 'adn-page-newsall-script', 'enqueued' ) ? 'adn-page-newsall-script' : '' );
    if ( $is_news_tpl && '' !== $news_handle ) {
        wp_localize_script( $news_handle, 'adnNews', array(
            'apiBase'   => rest_url( ADN_API_NS . '/news' ),
            'restNonce' => wp_create_nonce( 'wp_rest' ),
            'defaultImg'=> get_template_directory_uri() . THEME_DEFAULT_NEWS_IMG . '?v=' . LOCAL_CACHE_VERSION,
            'perPage'   => 8,
            'i18n'      => array(
                'empty'    => __( 'No news found. Try a different filter or search.', ADN_TEXT_DOMAIN ),
                'error'    => __( 'Could not load news right now. Please try again.', ADN_TEXT_DOMAIN ),
                'loading'  => __( 'Loading…', ADN_TEXT_DOMAIN ),
                'loadMore' => defined( 'SITE_BTN_LOAD_MORE' ) ? SITE_BTN_LOAD_MORE : __( 'Load More', ADN_TEXT_DOMAIN ),
                'readMore' => __( 'Read', ADN_TEXT_DOMAIN ),
            ),
        ) );
    }

    // Ask an Expert page: nonces must be localized here (inside wp_enqueue_scripts) because
    // the template calls wp_localize_script before this hook fires, so the handle isn't
    // registered yet and the call silently fails, leaving adnExpert undefined.
    if ( 'pages/PageAskExpert.php' === $current_template ) {
        wp_localize_script( 'adn-page-ask-expert-script', 'adnExpert', array(
            'ajaxUrl'     => admin_url( 'admin-ajax.php' ),
            'nonce'       => wp_create_nonce( 'adn_expert_contact' ),
            'unlockNonce' => wp_create_nonce( 'adn_expert_unlock' ),
        ) );
    }

    if ( is_single() ) {
        $v_single = defined('LOCAL_CACHE_VERSION') ? LOCAL_CACHE_VERSION : (file_exists( ADN_THEME_DIR . '/assets/css/single.css' ) ? filemtime( ADN_THEME_DIR . '/assets/css/single.css' ) : 1);
        if ( file_exists( ADN_THEME_DIR . '/assets/css/single.css' ) ) {
            wp_enqueue_style( 'adn-single-style', ADN_THEME_URI . '/assets/css/single.css', array(), $v_single );
        }
        $v_article = defined('LOCAL_CACHE_VERSION') ? LOCAL_CACHE_VERSION : (file_exists( ADN_THEME_DIR . '/assets/css/article.css' ) ? filemtime( ADN_THEME_DIR . '/assets/css/article.css' ) : 1);
        if ( file_exists( ADN_THEME_DIR . '/assets/css/article.css' ) ) {
            wp_enqueue_style( 'adn-article-style', ADN_THEME_URI . '/assets/css/article.css', array(), $v_article );
        }
        $v_cardner = defined('LOCAL_CACHE_VERSION') ? LOCAL_CACHE_VERSION : (file_exists( ADN_THEME_DIR . '/assets/css/article_cardner.css' ) ? filemtime( ADN_THEME_DIR . '/assets/css/article_cardner.css' ) : 1);
        if ( file_exists( ADN_THEME_DIR . '/assets/css/article_cardner.css' ) ) {
            wp_enqueue_style( 'adn-cardner-style', ADN_THEME_URI . '/assets/css/article_cardner.css', array(), $v_cardner );
        }
        $v_single_js = defined('LOCAL_CACHE_VERSION') ? LOCAL_CACHE_VERSION : (file_exists( ADN_THEME_DIR . '/assets/js/single.js' ) ? filemtime( ADN_THEME_DIR . '/assets/js/single.js' ) : 1);
        if ( file_exists( ADN_THEME_DIR . '/assets/js/single.js' ) ) {
            wp_enqueue_script( 'adn-single-script', ADN_THEME_URI . '/assets/js/single.js', array(), $v_single_js, true );
            wp_localize_script( 'adn-single-script', 'adnComments', array(
                'ajaxUrl'       => admin_url( 'admin-ajax.php' ),
                'submitNonce'   => wp_create_nonce( 'adn_comment_nonce' ),
                'loadNonce'     => wp_create_nonce( 'adn_load_comments' ),
                'postId'        => (int) get_queried_object_id(),
                'perPage'       => 10,
                'i18n'          => array(
                    'posting'   => __( 'Posting…', ADN_TEXT_DOMAIN ),
                    'loading'   => __( 'Loading…', ADN_TEXT_DOMAIN ),
                    'loadMore'  => __( 'Load more comments', ADN_TEXT_DOMAIN ),
                    'noMore'    => __( 'All comments loaded', ADN_TEXT_DOMAIN ),
                ),
            ) );
        }
    }
}
function adn_get_page_definitions() {
    return array(
        trim( SITE_HOME_URL, '/' ) ?: 'home' => array(
            'title'    => PAGE_TITLE_HOME,
            'template' => 'pages/PageHome.php',
        ),
        trim( SITE_CONTACT_URL, '/' ) => array(
            'title'    => PAGE_TITLE_CONTACT,
            'template' => 'pages/PageContact.php',
        ),
        trim( SITE_NEWS_URL, '/' ) => array(
            'title'    => PAGE_TITLE_NEWS,
            'template' => 'pages/PageNewsall.php',
        ),
        trim( SITE_GUIDES_URL, '/' ) => array(
            'title'    => PAGE_TITLE_GUIDES,
            'template' => 'pages/PageGuides.php',
        ),
        trim( SITE_TOOLS_URL, '/' ) => array(
            'title'    => PAGE_TITLE_TOOLS,
            'template' => 'pages/PageTools.php',
        ),
        trim( SITE_GUIDANCE_URL, '/' ) => array(
            'title'    => PAGE_TITLE_GUIDANCE,
            'template' => 'pages/PageGuidance.php',
        ),
        trim( SITE_HOW_IT_WORKS_URL, '/' ) => array(
            'title'    => PAGE_TITLE_HOW_IT_WORKS,
            'template' => 'pages/PageHowItWorks.php',
        ),
        trim( SITE_EXPERT_URL, '/' ) => array(
            'title'    => PAGE_TITLE_EXPERT,
            'template' => 'pages/PageAskExpert.php',
            'aliases'  => array( 'ask-an-expert' ),
        ),
        trim( SITE_FAQS_URL, '/' ) => array(
            'title'    => PAGE_TITLE_FAQS,
            'template' => 'pages/PageFaqs.php',
        ),
        trim( SITE_REVIEWS_URL, '/' ) => array(
            'title'    => PAGE_TITLE_REVIEWS,
            'template' => 'pages/PageReviews.php',
        ),
        // Slug must match COMING_SOON_PAGE_SLUG so the coming-soon redirect target exists.
        COMING_SOON_PAGE_SLUG => array(
            'title'    => adn_term( 'page_titles.coming_soon', '' ),
            'template' => 'pages/PageComing.php',
        ),
    );
}

function adn_create_default_pages() {

    if ( ! is_admin() ) {
        return 0;
    }

    $pages   = adn_get_page_definitions();
    $created = 0;

    foreach ( $pages as $slug => $page ) {

        // Only the primary slug gets a real WP Page row. An alias is never a
        // second canonical page - adn_route_page_definitions() 301s it to the
        // primary slug (as a virtual 404-intercept when no page exists there,
        // or by redirecting away from an old real page a past run already
        // created), so creating one here would just recreate the duplicate.
        if ( get_page_by_path( $slug ) ) {
            continue; // already exists
        }

        $page_id = wp_insert_post( array(
            'post_title'   => $page['title'],
            'post_name'    => $slug,
            'post_status'  => 'publish',
            'post_type'    => 'page',
            'post_content' => '',
        ) );

        if ( $page_id && ! is_wp_error( $page_id ) ) {
            update_post_meta( $page_id, '_wp_page_template', $page['template'] );
            $created++;
        }
    }

    // Make the Home page the site's default landing page (static front page).
    adn_set_home_as_front_page();

    return $created;
}

/**
 * Set the "Home" page as the WordPress static front page, so visiting the site
 * root ("/") shows it (rendered with its pages/PageHome.php template) instead
 * of the latest-posts blog index.
 *
 * Idempotent: only writes the reading options when they are not already set,
 * so it is safe to call on every theme (re)activation.
 */
function adn_set_home_as_front_page() {
    $home = get_page_by_path( 'home' );
    if ( ! ( $home instanceof WP_Post ) ) {
        return;
    }
    if ( 'page' !== get_option( 'show_on_front' ) ) {
        update_option( 'show_on_front', 'page' );
    }
    if ( (int) get_option( 'page_on_front' ) !== (int) $home->ID ) {
        update_option( 'page_on_front', (int) $home->ID );
    }
}

function adn_theme_register() {
    $supports = array(
        'title-tag',
        'post-thumbnails',
        'custom-logo',
    );
    foreach ( $supports as $feature ) {
        add_theme_support( $feature );
    }
    add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ) );
    $menus = array(
        'primary' => __( 'Primary Menu', ADN_TEXT_DOMAIN ),
        'footer'  => __( 'Footer Menu', ADN_TEXT_DOMAIN ),
    );
    register_nav_menus( $menus );
    $image_sizes = array(
        'adn-thumbnail' => array( 400, 300, true ),
    );
    foreach ( $image_sizes as $name => $size ) {
        add_image_size( $name, $size[0], $size[1], $size[2] );
    }
}

function adn_check_coming_soon() {
    if ( ! defined( 'COMING_SOON' ) || COMING_SOON !== true ) {
        return;
    }
    if ( is_user_logged_in() && current_user_can( 'manage_options' ) ) {
        return;
    }

    if ( is_admin() || wp_doing_ajax() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
        return;
    }
    $coming_soon_url = home_url( '/' . COMING_SOON_PAGE_SLUG . '/' );
    if ( is_page( COMING_SOON_PAGE_SLUG ) ) {
        return;
    }
    wp_redirect( $coming_soon_url, 302 );
    exit;
}
