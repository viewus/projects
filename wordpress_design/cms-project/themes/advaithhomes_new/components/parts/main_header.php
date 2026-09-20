<?php
/**
 * components/parts/main_header.php - Component: Site Header
 *
 * Renders: logo, primary navigation (with multi-level submenus / dropdowns),
 *          a live site-search panel (WordPress core ?s= search), the header
 *          CTA and the mobile menu (with collapsible submenu accordions).
 *
 * Props:
 *   $chrome (array, from adn_service_site_chrome()):
 *     - logo       { icon, name, sub, url }
 *     - search     { placeholder, submit_label }
 *     - nav        [ { label, url, children[ { label, url } ] } ]
 *     - header_cta { label, url }
 *
 * Data source: data/json/site_chrome.json today; the same shape is produced by
 * the plugin's AH_Nav_Model::get_items_tree() (parent_id → children), so the
 * service layer can be swapped to the plugin without touching this template.
 *
 * Usage: adn_component( 'parts/main_header', array( 'chrome' => $ctx['chrome'] ) );
 */

defined( 'ABSPATH' ) || exit;

$chrome = isset( $chrome ) && is_array( $chrome ) ? $chrome : array();

$logo   = isset( $chrome['logo'] ) ? (array) $chrome['logo'] : array();
$nav    = isset( $chrome['nav'] ) ? (array) $chrome['nav'] : array();
$cta    = isset( $chrome['header_cta'] ) ? (array) $chrome['header_cta'] : array();
$search = isset( $chrome['search'] ) ? (array) $chrome['search'] : array();

$search_action      = esc_url( home_url( '/' ) );
$search_placeholder = isset( $search['placeholder'] ) ? $search['placeholder'] : 'Search…';
$search_label       = isset( $search['submit_label'] ) ? $search['submit_label'] : 'Search';
$search_value       = get_search_query();

// Live type-ahead uses the WordPress core REST search endpoint (no plugin
// needed): returns published posts/pages matching the typed query. Passed as a
// data-attribute so the JS works under both pretty and plain permalinks.
$search_suggest = function_exists( 'rest_url' ) ? esc_url( rest_url( 'wp/v2/search' ) ) : '';

/* ── Short News Ticker (above header, home page only) ── */
$_sn_ticker_html = '';
if ( is_front_page() ) {
    $_sn_settings = get_option( 'adn_home_sections', array() );
    $_sn_raw      = isset( $_sn_settings['short_news_items'] ) ? (string) $_sn_settings['short_news_items'] : '';
    if ( '' !== trim( $_sn_raw ) ) {
        $_sn_items = array();
        foreach ( array_filter( array_map( 'trim', explode( "\n", $_sn_raw ) ) ) as $_line ) {
            $_parts   = explode( '|', $_line, 3 );
            $_sn_title = trim( $_parts[0] ?? '' );
            $_sn_url   = trim( $_parts[1] ?? '#' );
            $_sn_icon  = trim( $_parts[2] ?? '' );
            if ( '' !== $_sn_title ) {
                $_sn_items[] = array( 'title' => $_sn_title, 'url' => $_sn_url, 'icon' => $_sn_icon );
            }
        }
        if ( ! empty( $_sn_items ) ) {
            ob_start();
?>
<div class="short-news-ticker">
    <div class="">
        <div class="short-news-ticker__inner">
            <div class="short-news-ticker__track" id="shortNewsTicker">
                <?php foreach ( $_sn_items as $_sn ) : ?>
                    <a href="<?php echo esc_url( $_sn['url'] ); ?>" class="short-news-ticker__item">
                        <?php if ( '' !== $_sn['icon'] ) : ?>
                            <i class="<?php echo esc_attr( $_sn['icon'] ); ?>" aria-hidden="true"></i>
                        <?php endif; ?>
                        <span><?php echo wp_kses_post( $_sn['title'] ); ?></span>
                    </a>
                <?php endforeach; ?>
                <?php foreach ( $_sn_items as $_sn ) : ?>
                    <a href="<?php echo esc_url( $_sn['url'] ); ?>" class="short-news-ticker__item" aria-hidden="true">
                        <?php if ( '' !== $_sn['icon'] ) : ?>
                            <i class="<?php echo esc_attr( $_sn['icon'] ); ?>" aria-hidden="true"></i>
                        <?php endif; ?>
                        <span><?php echo wp_kses_post( $_sn['title'] ); ?></span>
                    </a>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>
<script>
(function(){
    var track = document.getElementById('shortNewsTicker');
    if (!track) return;
    var speed = 30, isPaused = false, pos = 0;
    function scroll() {
        if (isPaused) { requestAnimationFrame(scroll); return; }
        pos -= speed / 60;
        if (Math.abs(pos) >= track.scrollWidth / 2) pos = 0;
        track.style.transform = 'translateX(' + pos + 'px)';
        requestAnimationFrame(scroll);
    }
    track.addEventListener('mouseenter', function(){ isPaused = true; });
    track.addEventListener('mouseleave', function(){ isPaused = false; });
    track.addEventListener('touchstart', function(){ isPaused = true; }, {passive:true});
    track.addEventListener('touchend', function(){ isPaused = false; });
    scroll();
})();
</script>
<?php
            $_sn_ticker_html = ob_get_clean();
        }
    }
}
echo $_sn_ticker_html;
?>
<header class="site-header" id="siteHeader">
    <div class="container">
        <div class="header-inner">

            <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="logo">
                <img src="<?php echo esc_url( adn_versioned_url( get_template_directory_uri() . '/assets/images/logos/logo_with_text.png' ) ); ?>" alt="<?php echo esc_attr( defined( 'COMPANY_NAME' ) ? COMPANY_NAME : '' ); ?>" width="200" />
            </a>

            <nav class="main-nav" aria-label="Main navigation">
                <?php foreach ( $nav as $item ) : ?>
                    <?php
                    $item     = (array) $item;
                    $label    = isset( $item['label'] ) ? $item['label'] : '';
                    $url      = esc_url( adn_link( isset( $item['url'] ) ? $item['url'] : '' ) );
                    $children = isset( $item['children'] ) ? (array) $item['children'] : array();
                    ?>
                    <?php if ( ! empty( $children ) ) : ?>
                        <?php
                        $_nd  = isset( $item['description'] ) ? (string) $item['description'] : '';
                        $_img = isset( $item['panel_image'] ) ? (string) $item['panel_image'] : '';
                        $_ni  = isset( $item['icon'] )        ? (string) $item['icon']        : '';
                        $_cc  = isset( $item['css_class'] )   ? (string) $item['css_class']   : '';
                        $_has_rich = '' !== $_nd || '' !== $_img || '' !== $_ni;
                        ?>
                        <div class="nav-item has-dropdown<?php echo $_cc ? ' ' . esc_attr( $_cc ) : ''; ?>">
                            <a href="<?php echo $url; ?>" class="nav-link" aria-haspopup="true" aria-expanded="false">
                                <?php echo esc_html( $label ); ?>
                                <span class="nav-caret" aria-hidden="true">▾</span>
                            </a>
                            <div class="nav-dropdown<?php echo $_has_rich ? ' nav-dropdown--rich' : ''; ?>" role="menu" aria-label="<?php echo esc_attr( $label ); ?>">
                                <div class="nav-dropdown__links">
                                    <?php foreach ( $children as $child ) : ?>
                                        <?php $child = (array) $child; ?>
                                        <?php $_scc = isset( $child['css_class'] ) ? (string) $child['css_class'] : ''; ?>
                                        <a href="<?php echo esc_url( adn_link( isset( $child['url'] ) ? $child['url'] : '' ) ); ?>"
                                           class="nav-dropdown-link<?php echo ! empty( $child['highlight'] ) ? ' nav-link--highlight' : ''; ?><?php echo $_scc ? ' ' . esc_attr( $_scc ) : ''; ?>" role="menuitem"><?php echo esc_html( isset( $child['label'] ) ? $child['label'] : '' ); ?></a>
                                    <?php endforeach; ?>
                                </div>
                                <?php if ( '' !== $_img || '' !== $_nd ) : ?>
                                <div class="nav-dropdown__media">
                                    <?php if ( '' !== $_img ) : ?>
                                    <img src="<?php echo esc_url( $_img ); ?>" alt="<?php echo esc_attr( $label . ' banner' ); ?>" class="nav-dropdown__media-img" loading="lazy">
                                    <?php endif; ?>
                                    <?php if ( '' !== $_nd ) : ?>
                                    <div class="nav-dropdown__media-body">
                                        <?php if ( '' !== $_ni ) : ?>
                                        <span class="nav-dropdown__media-icon"><?php echo esc_html( $_ni ); ?></span>
                                        <?php endif; ?>
                                        <p class="nav-dropdown__media-desc"><?php echo esc_html( $_nd ); ?></p>
                                    </div>
                                    <?php endif; ?>
                                </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php else : ?>
                        <?php $_cc = isset( $item['css_class'] ) ? (string) $item['css_class'] : ''; ?>
                        <a href="<?php echo $url; ?>" class="nav-link<?php echo $_cc ? ' ' . esc_attr( $_cc ) : ''; ?>"><?php echo esc_html( $label ); ?></a>
                    <?php endif; ?>
                <?php endforeach; ?>
            </nav>

            <div class="header-actions">
                <?php
                $_gtranslate_html = function_exists( 'adn_render_gtranslate' ) ? adn_render_gtranslate() : '';
                $_enabled_langs   = function_exists( 'adn_get_gtranslate_enabled_languages' ) ? adn_get_gtranslate_enabled_languages() : array();
                // Only render language button if GTranslate is active and there are at least 2 languages
                if ( '' !== trim( $_gtranslate_html ) && ( empty( $_enabled_langs ) || count( $_enabled_langs ) > 1 ) ) :
                ?>
                <button type="button" class="btn-translate js-open-lang-modal notranslate" translate="no" id="btnTranslate" aria-label="<?php esc_attr_e( 'Change Language', 'advaithhomes' ); ?>" aria-haspopup="dialog" title="<?php esc_attr_e( 'Change Language', 'advaithhomes' ); ?>">
                    <?php echo adn_icon( 'translate' ); ?>
                </button>
                <?php endif; ?>

                <button type="button" class="btn-search" aria-label="Search" aria-expanded="false" aria-controls="headerSearch"><?php echo adn_icon( 'fa-magnifying-glass' ); ?></button>
                <?php if ( ! empty( $cta['label'] ) ) : ?>
                    <a href="<?php echo esc_url( adn_link( isset( $cta['url'] ) ? $cta['url'] : '' ) ); ?>" class="btn btn-primary btn-secondary btn-sm header-cta"><?php echo esc_html( $cta['label'] ); ?></a>
                <?php endif; ?>
                <button type="button" class="mobile-menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">☰</button>
            </div>
        </div>
    </div>

    <?php /* ---------- Site search panel (WordPress core search) ---------- */ ?>
    <div class="header-search" id="headerSearch" hidden>
        <div class="container">
            <div class="header-search-box">
                <form class="header-search-form" role="search" method="get" action="<?php echo $search_action; ?>" data-suggest="<?php echo $search_suggest; ?>">
                    <!-- <span class="header-search-icon" aria-hidden="true"><?php echo adn_icon( 'fa-magnifying-glass' ); ?></span> -->
                    <input type="search" name="s" class="header-search-input"
                           placeholder="<?php echo esc_attr( $search_placeholder ); ?>"
                           value="<?php echo esc_attr( $search_value ); ?>"
                           aria-label="<?php echo esc_attr( $search_placeholder ); ?>"
                           autocomplete="off" role="combobox" aria-expanded="false"
                           aria-controls="headerSearchSuggest" aria-autocomplete="list">
                    <button type="submit" class="btn btn-primary btn-sm"><?php echo adn_icon( 'fa-magnifying-glass' ); ?></button>
                    <button type="button" class="header-search-close" aria-label="Close search">✕</button>
                </form>
                <div class="search-suggest js-suggest" id="headerSearchSuggest" role="listbox" hidden></div>
            </div>
        </div>
    </div>


<?php /* ============================== MOBILE MENU ============================== */ ?>
<div class="mobile-menu-overlay" id="mobileMenu" role="dialog" aria-modal="true" aria-label="Mobile navigation">

    <div class="mobile-search-box">
        <form class="mobile-search-form" role="search" method="get" action="<?php echo $search_action; ?>" data-suggest="<?php echo $search_suggest; ?>">
            <input type="search" name="s" class="mobile-search-input"
                   placeholder="<?php echo esc_attr( $search_placeholder ); ?>"
                   value="<?php echo esc_attr( $search_value ); ?>"
                   aria-label="<?php echo esc_attr( $search_placeholder ); ?>"
                   autocomplete="off" role="combobox" aria-expanded="false" aria-autocomplete="list">
            <button type="submit" class="mobile-search-btn" aria-label="<?php echo esc_attr( $search_label ); ?>"><?php echo adn_icon( 'fa-magnifying-glass' ); ?></button>
        </form>
        <div class="search-suggest search-suggest--mobile js-suggest" role="listbox" hidden></div>
    </div>

    <?php if ( ! empty( $cta['label'] ) ) : ?>
        <div class="mobile-menu-cta mobile-menu-cta--top">
            <a href="<?php echo esc_url( adn_link( isset( $cta['url'] ) ? $cta['url'] : '' ) ); ?>" class="btn btn-primary btn-lg"><?php echo esc_html( $cta['label'] ); ?></a>
        </div>
    <?php endif; ?>

    <?php foreach ( $nav as $item ) : ?>
        <?php
        $item     = (array) $item;
        $label    = isset( $item['label'] ) ? $item['label'] : '';
        $url      = esc_url( adn_link( isset( $item['url'] ) ? $item['url'] : '' ) );
        $children = isset( $item['children'] ) ? (array) $item['children'] : array();
        $_mcc     = isset( $item['css_class'] ) ? (string) $item['css_class'] : '';
        ?>
        <?php if ( ! empty( $children ) ) : ?>
            <div class="mobile-nav-group<?php echo $_mcc ? ' ' . esc_attr( $_mcc ) : ''; ?>">
                <button type="button" class="mobile-nav-toggle" aria-expanded="false">
                    <span><?php echo esc_html( $label ); ?></span>
                    <span class="mobile-nav-caret" aria-hidden="true">▾</span>
                </button>
                <div class="mobile-submenu" hidden>
                    <?php foreach ( $children as $child ) : ?>
                        <?php $child = (array) $child; ?>
                        <?php $_scc = isset( $child['css_class'] ) ? (string) $child['css_class'] : ''; ?>
                        <a href="<?php echo esc_url( adn_link( isset( $child['url'] ) ? $child['url'] : '' ) ); ?>"
                           class="mobile-subnav-link<?php echo ! empty( $child['highlight'] ) ? ' nav-link--highlight' : ''; ?><?php echo $_scc ? ' ' . esc_attr( $_scc ) : ''; ?>"><?php echo esc_html( isset( $child['label'] ) ? $child['label'] : '' ); ?></a>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php else : ?>
            <a href="<?php echo $url; ?>" class="mobile-nav-link<?php echo $_mcc ? ' ' . esc_attr( $_mcc ) : ''; ?>"><?php echo esc_html( $label ); ?></a>
        <?php endif; ?>
    <?php endforeach; ?>

    <!-- <?php if ( ! empty( $cta['label'] ) ) : ?>
        <div class="mobile-menu-cta">
            <a href="<?php echo esc_url( adn_link( isset( $cta['url'] ) ? $cta['url'] : '' ) ); ?>" class="btn btn-primary btn-lg"><?php echo esc_html( $cta['label'] ); ?></a>
        </div>
    <?php endif; ?> -->
</div>

<?php if ( '' !== trim( $_gtranslate_html ) ) : ?>
    <?php
    $_enabled_langs = function_exists( 'adn_get_gtranslate_enabled_languages' ) ? adn_get_gtranslate_enabled_languages() : array();
    ?>
    <?php /* Hidden native backend for GTranslate engine with enabled languages metadata */ ?>
    <div class="adn-gtranslate-backend notranslate" id="adnGTranslateBackend" translate="no" aria-hidden="true" data-enabled-languages="<?php echo esc_attr( wp_json_encode( $_enabled_langs ) ); ?>" style="position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;visibility:hidden;width:1px;height:1px;overflow:hidden;">
        <?php echo $_gtranslate_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
    </div>
<?php endif; ?>
</header>
