<?php
/**
 * components/sections/guides_grid.php - Toolbar + grid of guide cards + pagination + download CTA.
 *
 * Props:
 *   $guides { search_placeholder, sort_options[], items[], pagination { current, total }, download_cta { icon, title, description, button_label, button_url } }
 * Usage: adn_component( 'sections/guides_grid', array( 'guides' => $ctx['guides'] ) );
 */

defined( 'ABSPATH' ) || exit;

$guides       = isset( $guides ) && is_array( $guides ) ? $guides : array();
$items        = isset( $guides['items'] )        ? (array) $guides['items']        : array();
$sort_options = isset( $guides['sort_options'] ) ? (array) $guides['sort_options'] : array();
$pagination   = isset( $guides['pagination'] )   ? (array) $guides['pagination']   : array();
$dl_cta       = isset( $guides['download_cta'] ) ? (array) $guides['download_cta'] : array();
$placeholder  = isset( $guides['search_placeholder'] ) ? (string) $guides['search_placeholder'] : '';

$current_page = isset( $pagination['current'] ) ? (int) $pagination['current'] : 1;
$total_pages  = isset( $pagination['total'] )   ? (int) $pagination['total']   : 1;
?>
<div class="guides-main">

	<?php /* ── Toolbar: sort only ── */ ?>
	<?php if ( ! empty( $sort_options ) ) : ?>
	<div class="guides-toolbar">
		<div class="sort-select">
			<span class="sort-label"><?php esc_html_e( 'Sort by:', ADN_TEXT_DOMAIN ); ?></span>
			<select id="guidesSortSelect" aria-label="<?php esc_attr_e( 'Sort by', ADN_TEXT_DOMAIN ); ?>">
				<?php foreach ( $sort_options as $opt ) : ?>
					<option><?php echo esc_html( $opt ); ?></option>
				<?php endforeach; ?>
			</select>
		</div>
	</div>
	<?php endif; ?>

	<?php /* ── Guide cards grid ── */ ?>
	<?php if ( ! empty( $items ) ) : ?>
		<div class="guides-grid-listing" id="guidesGrid">
			<?php foreach ( $items as $item ) :
				adn_component( 'cards/guide_listing_card', array( 'item' => $item ) );
			endforeach; ?>
		</div>
	<?php endif; ?>

	<?php /* ── Pagination ── */ ?>
	<?php if ( $total_pages > 1 ) : ?>
		<nav class="pagination" role="navigation" aria-label="<?php echo esc_attr__( 'Pagination', ADN_TEXT_DOMAIN ); ?>">
			<?php for ( $p = 1; $p <= $total_pages; $p++ ) : ?>
				<button
					class="page-btn<?php echo $p === $current_page ? ' active' : ''; ?>"
					<?php echo $p === $current_page ? 'aria-current="page"' : ''; ?>
					data-page="<?php echo esc_attr( (string) $p ); ?>"
					type="button"
				><?php echo esc_html( (string) $p ); ?></button>
			<?php endfor; ?>
			<?php if ( $current_page < $total_pages ) : ?>
				<button class="page-btn page-btn-next" data-page="<?php echo esc_attr( (string) ( $current_page + 1 ) ); ?>" type="button" aria-label="<?php echo esc_attr__( 'Next page', ADN_TEXT_DOMAIN ); ?>">→</button>
			<?php endif; ?>
		</nav>
	<?php endif; ?>

	<?php /* ── Download CTA ── */ ?>
	<?php if ( ! empty( $dl_cta['title'] ) ) : ?>
		<div class="download-cta">
			<?php if ( ! empty( $dl_cta['icon'] ) ) : ?>
				<div class="download-cta-img" aria-hidden="true"><?php echo adn_icon( $dl_cta['icon'] ); ?></div>
			<?php endif; ?>
			<div class="download-cta-content">
				<h3><?php echo esc_html( $dl_cta['title'] ); ?></h3>
				<?php if ( ! empty( $dl_cta['description'] ) ) : ?>
					<p><?php echo esc_html( $dl_cta['description'] ); ?></p>
				<?php endif; ?>
				<?php if ( ! empty( $dl_cta['button_label'] ) ) : ?>
					<a
						href="<?php echo esc_url( adn_link( isset( $dl_cta['button_url'] ) ? $dl_cta['button_url'] : '' ) ); ?>"
						class="btn btn-primary"
					>
						<?php echo esc_html( $dl_cta['button_label'] ); ?>
					</a>
				<?php endif; ?>
			</div>
		</div>
	<?php endif; ?>

</div>
