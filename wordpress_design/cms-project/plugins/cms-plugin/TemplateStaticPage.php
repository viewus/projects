<?php
/**
 * Template Name: Static HTML Page
 *
 * Serves raw HTML files from static/{slug}.html with full style isolation.
 * Append ?raw=1 to get the bare HTML - used internally as the iframe src.
 */
defined( 'ABSPATH' ) || exit;

$slug = get_post_field( 'post_name', get_the_ID() );

// Primary source: HTML stored in the database (wp_ah_static_pages).
$html = '';
if ( class_exists( 'AH_Static_Pages_Model' ) ) {
	$html = ( new AH_Static_Pages_Model() )->get_html( $slug );
}
// Legacy fallback: static/{slug}.html file (pre-migration pages).
if ( $html === '' ) {
	$file = get_template_directory() . '/static/' . sanitize_file_name( $slug ) . '.html';
	if ( file_exists( $file ) ) {
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_get_contents
		$html = (string) file_get_contents( $file );
	}
}

// ── Raw mode ──────────────────────────────────────────────────────────────────
// Returns bare HTML with no WordPress wrapper.
// Used as the iframe src for style isolation, or for direct embedding elsewhere.
if ( isset( $_GET['raw'] ) && '1' === $_GET['raw'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( $html !== '' ) {
		header( 'Content-Type: text/html; charset=UTF-8' );
		header( 'X-Frame-Options: SAMEORIGIN' );
		echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped - raw HTML component by design
	} else {
		status_header( 404 );
		echo '<!DOCTYPE html><html><body><p>Content not found.</p></body></html>';
	}
	exit;
}

// ── Normal mode: site nav + raw HTML + site footer (no hero, no breadcrumb) ───
$chrome = function_exists( 'adn_service_site_chrome' ) ? adn_service_site_chrome() : array();

if ( function_exists( 'adn_page_open' ) ) {
	adn_page_open( array( 'chrome' => $chrome ) );
} else {
	get_header();
}
?>
<div class="ah-static-page-outer">
	<?php if ( $html !== '' ) : ?>
		<?php
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- intentional raw HTML output
		echo $html;
		?>
	<?php else : ?>
		<div style="padding:40px 24px;text-align:center;color:#6b7280;">
			<p>No content found for <code><?php echo esc_html( $slug ); ?></code>.</p>
			<?php if ( current_user_can( 'manage_options' ) ) : ?>
			<p><a href="<?php echo esc_url( admin_url( 'admin.php?page=ah-static-pages&edit=' . rawurlencode( $slug ) ) ); ?>" class="button">Create it in the admin</a></p>
			<?php endif; ?>
		</div>
	<?php endif; ?>
</div>

<?php
if ( function_exists( 'adn_page_close' ) ) {
	adn_page_close( array( 'chrome' => $chrome ) );
} else {
	get_footer();
}
