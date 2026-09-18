<?php
/**
 * Frontend renderer for pages created in the Page Builder.
 * Loaded by the template_redirect hook in ah-cms.php.
 * $GLOBALS['ah_builder_page'] is the DB row from ah_builder_pages.
 */
defined( 'ABSPATH' ) || exit;

$pg        = $GLOBALS['ah_builder_page'];
$blocks    = json_decode( $pg->blocks ?: '[]', true ) ?: array();
$title     = $pg->meta_title ?: $pg->title;
$desc      = $pg->meta_description ?: '';
$page_opts = (array) get_option( 'ah_bp_' . (int) $pg->id . '_opts', array() );

// Load site chrome (nav + footer data) from the theme service layer.
$chrome = function_exists( 'adn_service_site_chrome' ) ? adn_service_site_chrome() : array();

// URL parameter support for bare/embedded rendering.
// DB opts default both header and footer ON (1) unless explicitly set to 0.
$bare      = ! empty( $_GET['bare'] );
$no_header = $bare || ! empty( $_GET['no_header'] ) || ( isset( $page_opts['show_header'] ) && ! $page_opts['show_header'] );
$no_footer = $bare || ! empty( $_GET['no_footer'] ) || ( isset( $page_opts['show_footer'] ) && ! $page_opts['show_footer'] );

// Override <title> and meta description
add_filter( 'pre_get_document_title', fn() => esc_html( $title ) . ' | ' . get_bloginfo( 'name' ) );
add_action( 'wp_head', function() use ( $desc ) {
	if ( $desc ) {
		echo '<meta name="description" content="' . esc_attr( $desc ) . '">' . "\n";
	}
} );


if ( ! $no_header ) {
	// get_header() prints the DOCTYPE/<head>/wp_head()/<body> shell (where enqueued
	// CSS/JS actually output) - adn_page_open() only renders the nav component, it
	// does NOT include get_header(). Both are needed, not either/or.
	get_header();
	if ( function_exists( 'adn_page_open' ) ) {
		adn_page_open( array( 'chrome' => $chrome ) );
	}
} else {
	// Bare mode: skip theme chrome but still emit wp_head() so styles/scripts load.
	?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width,initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
	<?php
}
?>

<div id="ah-builder-page" style="min-height:60vh;">

<?php foreach ( $blocks as $block ) :
	$t = $block['type'] ?? '';
	$d = $block['data'] ?? array();
	ah_render_builder_block( $t, $d );
endforeach;

if ( empty( $blocks ) ) : ?>
	<div style="text-align:center;padding:80px 20px;color:#9ca3af;">
		<p>This page has no content yet.</p>
	</div>
<?php endif; ?>

<?php
// Bottom CTA from page settings (if enabled and heading is set)
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
document.querySelectorAll('.faq__q').forEach(function(btn){
	btn.addEventListener('click',function(){
		var expanded=btn.getAttribute('aria-expanded')==='true';
		btn.setAttribute('aria-expanded',expanded?'false':'true');
		var panel=btn.nextElementSibling;
		if(panel)panel.classList.toggle('is-open',!expanded);
	});
});
document.querySelectorAll('.ah-tabs__btn').forEach(function(btn){
	btn.addEventListener('click',function(){
		var wrap=btn.closest('.ah-tabs');
		wrap.querySelectorAll('.ah-tabs__btn').forEach(function(b){b.classList.remove('is-active');b.setAttribute('aria-selected','false');});
		wrap.querySelectorAll('.ah-tabs__panel').forEach(function(p){p.classList.remove('is-active');});
		btn.classList.add('is-active');btn.setAttribute('aria-selected','true');
		var panel=document.getElementById(btn.dataset.tab);
		if(panel)panel.classList.add('is-active');
	});
});
document.querySelectorAll('.ah-alert[data-dismissible="1"]').forEach(function(el){
	var btn=document.createElement('button');
	btn.className='ah-alert__close';btn.innerHTML='&times;';btn.setAttribute('aria-label','Close');
	btn.addEventListener('click',function(){el.closest('.container').style.display='none';});
	el.appendChild(btn);
});
(function(){
var obs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('spine-visible');obs.unobserve(e.target);}});
},{threshold:.15});
document.querySelectorAll('.ah-steps').forEach(function(el){obs.observe(el);});
})();</script>

<?php
if ( ! $no_footer ) {
	// adn_page_close() only renders the footer component - get_footer() is what
	// prints wp_footer() (enqueued JS) plus the closing </body></html> tags.
	if ( function_exists( 'adn_page_close' ) ) {
		adn_page_close( array( 'chrome' => $chrome ) );
	}
	get_footer();
} else {
	// Bare mode: skip theme chrome but still emit wp_footer() so scripts load.
	wp_footer();
	?>
</body>
</html>
	<?php
}


