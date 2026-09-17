<?php
/**
 * Theme-level override template for Page Builder pages.
 *
 * The plugin (plugins/cms-plugin/ah-cms.php) checks for this file via
 * locate_template('templates/AhBuilderPage.php') and uses it in preference
 * to its own generic fallback template.
 *
 * Requires (guaranteed by the plugin routing before this file is included):
 *   $GLOBALS['ah_builder_page']  - DB row from ah_builder_pages
 *   ah_render_builder_block()    - from plugins/cms-plugin/inc/builder-block-renderer.php
 *   adn_page_open()              - from themes/advaithhomes_new/common/common_functions.php
 *   adn_page_close()             - from themes/advaithhomes_new/common/common_functions.php
 *   adn_component()              - from themes/advaithhomes_new/common/common_functions.php
 */
defined( 'ABSPATH' ) || exit;

$pg        = $GLOBALS['ah_builder_page'];
$blocks    = json_decode( $pg->blocks ?: '[]', true ) ?: array();
$title     = $pg->meta_title ?: $pg->title;
$desc      = $pg->meta_description ?: '';
$page_opts = (array) get_option( 'ah_bp_' . (int) $pg->id . '_opts', array() );

// Site chrome - nav, footer data, social links, settings.
$chrome = function_exists( 'adn_service_site_chrome' ) ? adn_service_site_chrome() : array();

// Header / footer visibility (URL params override DB settings for embed / preview mode).
$bare      = ! empty( $_GET['bare'] ) || ! empty( $_GET['dialog'] ) || ( ! empty( $_GET['content'] ) && 'true' === (string) $_GET['content'] );
$no_header = $bare || ! empty( $_GET['no_header'] ) || ( isset( $page_opts['show_header'] ) && ! $page_opts['show_header'] );
$no_footer = $bare || ! empty( $_GET['no_footer'] ) || ( isset( $page_opts['show_footer'] ) && ! $page_opts['show_footer'] );

// Override <title> and meta description for this virtual page.
add_filter( 'pre_get_document_title', fn() => esc_html( $title ) . ' | ' . get_bloginfo( 'name' ) );
add_action( 'wp_head', function () use ( $desc ) {
	if ( $desc ) {
		echo '<meta name="description" content="' . esc_attr( $desc ) . '">' . "\n";
	}
} );

// A hero block (first position or anywhere else) is no longer pulled out into
// the native page_hero component - every block, hero included, renders
// through the normal loop below via BlockRenderer::renderHero(), using the
// theme's block-render-page-styles.css design.
$body_blocks = $blocks;

// ── Open: header only ───────────────────────────────────────────────────────
if ( ! $no_header ) {

	// get_header() outputs the DOCTYPE/<head>/wp_head()/<body> shell (that's where
	// enqueued CSS/JS actually print) - adn_page_open() only renders the nav
	// component, it does NOT include get_header(). Both are required.
	get_header();

	adn_page_open( array( 'chrome' => $chrome, 'breadcrumb' => array() ) );

} else {
	// Bare / embedded mode: emit a minimal HTML shell so styles and scripts still load.
	?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width,initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class( 'ah-builder-bare' ); ?>>
	<?php
}
?>

<?php /* ── Main content ─────────────────────────────────────────────────────────── */ ?>
<div id="ah-builder-page" class="ah-builder-main interactive-app-view" style="min-height:40vh;">

<?php foreach ( $body_blocks as $_block ) :
	$_t = $_block['type'] ?? '';
	$_d = $_block['data'] ?? array();
	ah_render_builder_block( $_t, $_d );
endforeach; ?>

<?php if ( empty( $body_blocks ) ) : ?>
	<div style="text-align:center;padding:80px 20px;color:#9ca3af;">
		<p>This page has no content yet.</p>
	</div>
<?php endif; ?>

<?php
// Bottom CTA from page-level settings (configured in the builder admin panel).
if ( ! empty( $page_opts['cta_enabled'] ) && ! empty( $page_opts['cta_heading'] ) ) :
	ah_render_builder_block( 'cta_banner', array(
		'heading'   => $page_opts['cta_heading'],
		'text'      => $page_opts['cta_text']      ?? '',
		'btn1_text' => $page_opts['cta_btn1_text'] ?? '',
		'btn1_url'  => $page_opts['cta_btn1_url']  ?? '#',
		'btn2_text' => $page_opts['cta_btn2_text'] ?? '',
		'btn2_url'  => $page_opts['cta_btn2_url']  ?? '#',
		'theme'     => $page_opts['cta_theme']     ?? 'dark',
		'layout'    => 'centered',
	) );
endif;
?>

</div>

<script>
/* Builder page interactive JS ─ FAQ accordion, tabs, dismissible alerts, steps scroll animation */
document.querySelectorAll('.faq__q').forEach(function(btn){
	btn.addEventListener('click',function(){
		var e=btn.getAttribute('aria-expanded')==='true';
		btn.setAttribute('aria-expanded',e?'false':'true');
		var p=btn.nextElementSibling;
		if(p)p.classList.toggle('is-open',!e);
	});
});
document.querySelectorAll('.ah-tabs__btn').forEach(function(btn){
	btn.addEventListener('click',function(){
		var w=btn.closest('.ah-tabs');
		w.querySelectorAll('.ah-tabs__btn').forEach(function(b){b.classList.remove('is-active');b.setAttribute('aria-selected','false');});
		w.querySelectorAll('.ah-tabs__panel').forEach(function(p){p.classList.remove('is-active');});
		btn.classList.add('is-active');btn.setAttribute('aria-selected','true');
		var p=document.getElementById(btn.dataset.tab);
		if(p)p.classList.add('is-active');
	});
});
document.querySelectorAll('.ah-alert[data-dismissible="1"]').forEach(function(el){
	var b=document.createElement('button');
	b.className='ah-alert__close';b.innerHTML='&times;';b.setAttribute('aria-label','Close');
	b.addEventListener('click',function(){el.closest('.container').style.display='none';});
	el.appendChild(b);
});
(function(){
	var obs=new IntersectionObserver(function(entries){
		entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('spine-visible');obs.unobserve(e.target);}});
	},{threshold:.15});
	document.querySelectorAll('.ah-steps').forEach(function(el){obs.observe(el);});
})();
</script>

<?php
// ── Close: footer ─────────────────────────────────────────────────────────────
if ( ! $no_footer ) {
	// adn_page_close() only renders the footer component - get_footer() is what
	// prints wp_footer() (enqueued JS) plus the closing </body></html> tags.
	adn_page_close( array( 'chrome' => $chrome ) );
	get_footer();
} else {
	wp_footer();
	?>
</body>
</html>
	<?php
}
