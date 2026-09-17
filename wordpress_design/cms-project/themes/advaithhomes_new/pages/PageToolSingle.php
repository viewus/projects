<?php
/**
 * Template Name: Tool Single
 *
 * pages/PageToolSingle.php - Individual tool detail page.
 *
 * Served by template_redirect for /calculators/{key}/ (or the legacy
 * ?ah_calc_page=KEY query string - adn_calculator_full_page_render() in
 * calculators.php normalises either form into $_GET before including this file).
 * Renders the full WP page (header + footer) with the tool widget,
 * guide link, help text, related tools, and the tools sidebar.
 *
 * RULE: No hardcoded content - only structure.
 */

defined( 'ABSPATH' ) || exit;

// CSS/JS now loaded centrally via AssetLoader (wp_enqueue_scripts hook)

/* get_header() runs after the SEO block below: adn_seo_head_output() is hooked to
   wp_head priority 1, so registering afterwards never reaches the head. It also
   keeps the header out of the not-found branch, which hands off to 404.php - and
   that template opens with its own get_header(). */
$_calc_key = sanitize_key( wp_unslash( isset( $_GET['ah_calc_page'] ) ? $_GET['ah_calc_page'] : '' ) );

$ctx = \Adn\Theme\Feature\Tools\Controller\ToolSingleController::getContext( $_calc_key );

if ( ! $ctx ) {
	status_header( 404 );
	$_404 = get_404_template();
	if ( $_404 ) {
		include $_404;
	} else {
		wp_die( esc_html__( 'Tool not found.', ADN_TEXT_DOMAIN ), '', array( 'response' => 404 ) );
	}
	return;
}

// ── SEO for calculator detail page ────────────────────────────────────────
$_calc_title = isset( $ctx['hero']['title'] )       ? (string) $ctx['hero']['title']       : '';
$_calc_desc  = isset( $ctx['hero']['description'] ) ? wp_strip_all_tags( (string) $ctx['hero']['description'] ) : '';
$_calc_url   = adn_calc_page_url( $_calc_key );
adn_seo_register( array(
	'title'       => $_calc_title,
	'description' => $_calc_desc,
	'canonical'   => $_calc_url,
	'breadcrumb'  => isset( $ctx['breadcrumb'] ) ? $ctx['breadcrumb'] : array(),
	'type'        => 'website',
	'schema_app'  => array(
		'name'        => $_calc_title,
		'description' => $_calc_desc,
		'url'         => $_calc_url,
	),
) );

get_header(); // Loads wp_head() which triggers wp_enqueue_scripts hook

// Breadcrumb renders inside the hero - suppress from adn_page_open.
$_open_ctx               = $ctx;
$_open_ctx['breadcrumb'] = array();
adn_page_open( $_open_ctx );
?>

<?php /* ============================== HERO ============================== */ ?>
<?php if ( ! empty( $ctx['hero'] ) ) : ?>
	<?php adn_component( 'sections/page_hero', array(
		'hero'       => $ctx['hero'],
		'breadcrumb' => $ctx['breadcrumb'],
	) ); ?>
<?php endif; ?>

<?php /* ── Highlight badge strip ── */ ?>
<?php if ( ! empty( $ctx['highlight'] ) ) : ?>
<div class="tool-highlight-strip">
	<div class="container">
		<span class="tool-badge tool-badge--large"><?php echo esc_html( $ctx['highlight'] ); ?></span>
	</div>
</div>
<?php endif; ?>

<?php /* ============================== MAIN LAYOUT: CONTENT + SIDEBAR ============================== */ ?>
<div class="container">
	<div class="page-with-sidebar tool-single-layout">

		<div class="tool-main-content interactive-app-view">

			<?php /* ── Before-calculator content ── */ ?>
			<?php if ( ! empty( $ctx['before_content'] ) ) : ?>
			<div class="tool-single-page-content tool-single-page-content--before">
				<?php echo wp_kses_post( $ctx['before_content'] ); ?>
			</div>
			<?php endif; ?>

			<?php /* ── Tool widget (standalone iframe embed) ── */ ?>
			<?php echo do_shortcode( '[ah_calculator key="' . esc_attr( $ctx['key'] ) . '"]' ); ?>

			<?php /* ── After-calculator content ── */ ?>
			<?php if ( ! empty( $ctx['after_content'] ) ) : ?>
			<div class="tool-single-page-content tool-single-page-content--after">
				<?php echo wp_kses_post( $ctx['after_content'] ); ?>
			</div>
			<?php endif; ?>

			<?php /* ── Help text (outside iframe) ── */ ?>
			<?php if ( ! empty( $ctx['help_text'] ) ) : ?>
			<div class="tool-single-help">
				<?php echo wpautop( wp_kses_post( $ctx['help_text'] ) ); ?>
			</div>
			<?php endif; ?>

			<?php /* ── Share bar (same UI as single.php, no Helpful button) ── */ ?>
			<?php if ( ! empty( $ctx['share'] ) ) : ?>
				<?php adn_component( 'sections/post_feedback', array( 'share' => $ctx['share'], 'hide_helpful' => true ) ); ?>
			<?php endif; ?>

			<?php /* ── Guide link ── */ ?>
			<?php if ( ! empty( $ctx['guide']['url'] ) ) : ?>
			<div class="tool-single-guide-link">
				<a href="<?php echo esc_url( $ctx['guide']['url'] ); ?>" class="btn btn-outline">
					<?php echo esc_html( $ctx['guide']['label'] ); ?>
				</a>
			</div>
			<?php endif; ?>




		</div>

		<aside class="sidebar-col">

			<?php /* ── Browse tool categories ── */ ?>
			<?php if ( ! empty( $ctx['sidebar']['categories'] ) ) : ?>
				<?php
				adn_component( 'parts/tools_sidebar', array( 'sidebar' => array(
					'hl_heading'   => isset( $ctx['sidebar']['hl_heading'] ) ? $ctx['sidebar']['hl_heading'] : '',
					'hl_links'     => isset( $ctx['sidebar']['hl_links'] )   ? $ctx['sidebar']['hl_links']   : array(),
					'categories'   => $ctx['sidebar']['categories'],
					'help'         => array(),
				) ) );
				?>
			<?php endif; ?>

			<?php /* ── Contact for Help (from sidebar_cards.json) ── */ ?>
			<?php
			if ( class_exists( 'ADN_Real_Loader' ) ) {
				$_catalog = ADN_Real_Loader::json( 'sidebar_cards' );
				if ( isset( $_catalog['contact'] ) ) {
					$_card = $_catalog['contact'];
					$_c_icon = isset( $_card['icon'] ) ? (string) $_card['icon'] : 'fa-solid fa-envelope';
					$_c_head = isset( $_card['heading'] ) ? (string) $_card['heading'] : '';
					$_c_desc = isset( $_card['description'] ) ? (string) $_card['description'] : '';
					$_c_btn  = isset( $_card['button_label'] ) ? (string) $_card['button_label'] : '';
					$_c_url  = isset( $_card['url'] ) ? (string) $_card['url'] : '';
					$_c_cls  = isset( $_card['class'] ) ? (string) $_card['class'] : '';
					?>
					<div class="tools-sidebar-help<?php echo $_c_cls ? ' ' . esc_attr( $_c_cls ) : ''; ?>">
						<h4><i class="<?php echo esc_attr( $_c_icon ); ?>" style="margin-right:8px;"></i><?php echo esc_html( $_c_head ); ?></h4>
						<p><?php echo esc_html( $_c_desc ); ?></p>
						<a href="<?php echo esc_url( adn_link( $_c_url ) ); ?>" class="tools-help-btn">
							<?php echo esc_html( $_c_btn ); ?> &rarr;
						</a>
					</div>
					<?php
				}
			}
			?>

		</aside>

	</div>
</div>

<?php adn_page_close( $ctx );

get_footer(); ?>
