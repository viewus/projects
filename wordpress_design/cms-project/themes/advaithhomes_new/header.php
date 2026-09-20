<?php
/**
 * header.php - HTML document opener.
 *
 * Called via get_header() from every page template.
 * Contains ONLY the generic document wrapper: DOCTYPE, <html>, <head>,
 * <body>, wp_body_open(). Site navigation is NOT here because it needs
 * page-level context ($ctx['chrome']); page templates load it themselves.
 */

defined( 'ABSPATH' ) || exit;

$_adn_embed = ! empty( $_GET['embed'] ) || ! empty( $_GET['dialog'] ); // phpcs:ignore WordPress.Security.NonceVerification
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="format-detection" content="telephone=no">
	<?php wp_head(); ?>
	<?php if ( $_adn_embed ) : ?>
	<style>
		.site-header, .site-nav, .main-header, .main-nav,
		.site-footer, .main-footer, .footer-section,
		.scroll-to-top, .scroll-progress,
		.adn-preheader, #adn-page-loader,
		.whatsapp-float, .floating-contact,
		.site-notice-bar, .cookie-banner,
		.tools-hero-section, .page-hero,
		.adn-newsbar, .newsbar { display: none !important; }
		body { margin: 0; padding: 16px; background: #fff; }
		.container { max-width: 100%; padding: 0; }
	</style>
	<?php endif; ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<div id="adn-lang-curtain" class="adn-lang-curtain notranslate" translate="no" aria-hidden="true">
	<div class="adn-lang-curtain__box">
		<div class="adn-lang-curtain__spinner"></div>
	</div>
</div>
<?php if ( ! $_adn_embed ) : ?>
<?php
// ── Pre-header bar (home page only) ─────────────────────────────────────────
if ( is_front_page() ) {
	global $wpdb;
	$_pht   = $wpdb->prefix . 'ah_site_settings';
	$_phtxt = '';
	if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $_pht ) ) ) {
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- table from $wpdb->prefix
		$_phtxt = (string) $wpdb->get_var( $wpdb->prepare(
			"SELECT setting_val FROM `{$_pht}` WHERE setting_key = %s LIMIT 1",
			'preheader_text'
		) );
	}
	if ( '' !== trim( $_phtxt ) ) :
?>
<div class="adn-preheader" id="adn-preheader">
	<span class="adn-preheader-text" id="adn-preheader-text"><?php echo esc_html( $_phtxt ); ?></span>
</div>
<?php
	endif;
}
?>
<?php if ( is_front_page() ) : ?>
<div id="adn-page-loader" class="adn-page-loader" aria-hidden="true">
	<div class="adn-loader-inner">
		<img src="<?php echo esc_url( adn_versioned_url( get_template_directory_uri() . '/assets/images/logos/logo_with_text.png' ) ); ?>"
			alt="<?php echo esc_attr( defined( 'COMPANY_NAME' ) ? COMPANY_NAME : '' ); ?>"
			class="adn-loader-logo">
		<div class="adn-loader-bar-track">
			<div class="adn-loader-bar"></div>
		</div>
	</div>
</div>
<?php endif; ?>
<div class="scroll-progress"></div>
<?php endif; ?>
