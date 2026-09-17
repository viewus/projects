<?php
/**
 * VintageSoulTheme - Sidebar Category Tags Widget
 *
 * The "Explore Topics" tag cloud that single.php and archive.php each
 * carried inline, each calling get_categories() itself. Categories now
 * arrive prepared from PostQueryService::categories().
 *
 * Props:
 *   categories (array)  - from PostQueryService::categories()
 *   title      (string) - widget heading
 *   badge      (string) - optional ribbon above the heading
 */

defined( 'ABSPATH' ) || exit;

$ctw_items = isset( $categories ) && is_array( $categories ) ? $categories : array();
$ctw_title = isset( $title ) ? trim( (string) $title ) : '';
$ctw_badge = isset( $badge ) ? trim( (string) $badge ) : '';

if ( empty( $ctw_items ) ) {
	return;
}
?>
<div class="sidebar-widget frame--ornate">
	<?php if ( '' !== $ctw_title || '' !== $ctw_badge ) : ?>
		<div class="sidebar-widget__header">
			<?php if ( '' !== $ctw_badge ) : ?>
				<span class="sidebar-widget__badge"><?php echo esc_html( $ctw_badge ); ?></span>
			<?php endif; ?>
			<?php if ( '' !== $ctw_title ) : ?>
				<h3 class="sidebar-widget__title"><?php echo esc_html( $ctw_title ); ?></h3>
			<?php endif; ?>
		</div>
	<?php endif; ?>

	<div class="sidebar-category-tags">
		<?php foreach ( $ctw_items as $ctw_cat ) : ?>
			<a href="<?php echo esc_url( (string) ( $ctw_cat['url'] ?? '#' ) ); ?>" class="sidebar-cat-tag">
				<span class="cat-tag__name"><?php echo esc_html( (string) ( $ctw_cat['name'] ?? '' ) ); ?></span>
				<span class="cat-tag__count"><?php echo esc_html( (string) ( $ctw_cat['count'] ?? '' ) ); ?></span>
			</a>
		<?php endforeach; ?>
	</div>
</div>
