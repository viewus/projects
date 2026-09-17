<?php
/**
 * VintageSoulTheme - Icon Card Grid
 *
 * The icon + title + description card grid that several sections were each
 * repeating inline (Events inclusions, Franchise pillars, Why Us, Packages).
 * One component now renders all of them; callers keep their own BEM block
 * name and grid class, so existing stylesheets keep applying unchanged.
 *
 * Props:
 *   items         (array)  - [ { icon, title, desc|text|note } ]
 *   block         (string) - BEM block for each card (default 'icon-card')
 *                            (deliberately not "base": View::include_file()
 *                             already declares $base, and extract() there
 *                             runs with EXTR_SKIP, so it would be dropped)
 *   grid_class    (string) - grid wrapper class (default 'icon-card-grid')
 *   card_extra    (string) - extra classes on each card, e.g. 'card--rough-cut'
 *   head_wrap     (bool)   - wrap the icon in a {base}__head div (default true)
 *   numbered      (bool)   - show an 01/02 step badge (default false)
 *   fallback_icon (string) - used when an item has no icon (default '✦')
 *   heading_level (int)    - 2-6, the card title tag (default 3)
 */

defined( 'ABSPATH' ) || exit;

$icg_items = isset( $items ) && is_array( $items ) ? $items : array();

if ( empty( $icg_items ) ) {
	return;
}

$icg_base       = isset( $block ) && '' !== trim( (string) $block ) ? sanitize_html_class( (string) $block ) : 'icon-card';
$icg_grid       = isset( $grid_class ) && '' !== trim( (string) $grid_class ) ? trim( (string) $grid_class ) : 'icon-card-grid';
$icg_extra      = isset( $card_extra ) ? trim( (string) $card_extra ) : '';
$icg_head       = ! isset( $head_wrap ) || false !== $head_wrap;
$icg_numbered   = isset( $numbered ) && true === $numbered;
$icg_fallback   = isset( $fallback_icon ) ? (string) $fallback_icon : '✦';
$icg_level      = isset( $heading_level ) ? min( 6, max( 2, (int) $heading_level ) ) : 3;
$icg_tag        = 'h' . $icg_level;
?>
<div class="<?php echo esc_attr( $icg_grid ); ?>">
	<?php foreach ( $icg_items as $icg_index => $icg_item ) :
		$icg_item = (array) $icg_item;

		$icg_title = trim( (string) ( $icg_item['title'] ?? ( $icg_item['label'] ?? '' ) ) );
		if ( '' === $icg_title ) {
			continue;
		}

		$icg_desc = trim(
			(string) ( $icg_item['desc'] ?? ( $icg_item['text'] ?? ( $icg_item['note'] ?? '' ) ) )
		);
		$icg_icon = trim( (string) ( $icg_item['icon'] ?? '' ) );
		if ( '' === $icg_icon ) {
			$icg_icon = $icg_fallback;
		}
	?>
		<div class="<?php echo esc_attr( trim( $icg_base . ' ' . $icg_extra ) ); ?>">

			<?php if ( $icg_numbered ) : ?>
				<span class="<?php echo esc_attr( $icg_base . '__step' ); ?>" aria-hidden="true"><?php echo esc_html( sprintf( '%02d', (int) $icg_index + 1 ) ); ?></span>
			<?php endif; ?>

			<?php if ( '' !== $icg_icon ) : ?>
				<?php if ( $icg_head ) : ?>
					<div class="<?php echo esc_attr( $icg_base . '__head' ); ?>">
						<span class="<?php echo esc_attr( $icg_base . '__icon' ); ?>"><?php echo esc_html( $icg_icon ); ?></span>
					</div>
				<?php else : ?>
					<span class="<?php echo esc_attr( $icg_base . '__icon' ); ?>" aria-hidden="true"><?php echo esc_html( $icg_icon ); ?></span>
				<?php endif; ?>
			<?php endif; ?>

			<<?php echo esc_attr( $icg_tag ); ?> class="<?php echo esc_attr( $icg_base . '__title' ); ?>"><?php echo esc_html( $icg_title ); ?></<?php echo esc_attr( $icg_tag ); ?>>

			<?php if ( '' !== $icg_desc ) : ?>
				<p class="<?php echo esc_attr( $icg_base . '__desc' ); ?>"><?php echo esc_html( $icg_desc ); ?></p>
			<?php endif; ?>
		</div>
	<?php endforeach; ?>
</div>
