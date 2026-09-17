<?php
/**
 * VintageSoulTheme - Sidebar Post List Widget
 *
 * The thumbnail + date + title list that single.php ("Related Chronicles")
 * and archive.php ("Latest Stories") were each carrying inline, with the
 * query run in the template. Posts now arrive prepared from
 * PostQueryService; this file only renders them.
 *
 * Props:
 *   posts      (array)  - from PostQueryService::recent()
 *   title      (string) - widget heading
 *   badge      (string) - optional ribbon above the heading
 *   empty_text (string) - shown when there are no posts (widget hidden if blank)
 */

defined( 'ABSPATH' ) || exit;

$plw_posts = isset( $posts ) && is_array( $posts ) ? $posts : array();
$plw_title = isset( $title ) ? trim( (string) $title ) : '';
$plw_badge = isset( $badge ) ? trim( (string) $badge ) : '';
$plw_empty = isset( $empty_text ) ? trim( (string) $empty_text ) : '';

if ( empty( $plw_posts ) && '' === $plw_empty ) {
	return;
}
?>
<div class="sidebar-widget frame--ornate">
	<?php if ( '' !== $plw_title || '' !== $plw_badge ) : ?>
		<div class="sidebar-widget__header">
			<?php if ( '' !== $plw_badge ) : ?>
				<span class="sidebar-widget__badge"><?php echo esc_html( $plw_badge ); ?></span>
			<?php endif; ?>
			<?php if ( '' !== $plw_title ) : ?>
				<h3 class="sidebar-widget__title"><?php echo esc_html( $plw_title ); ?></h3>
			<?php endif; ?>
		</div>
	<?php endif; ?>

	<div class="sidebar-widget__list">
		<?php if ( ! empty( $plw_posts ) ) : ?>
			<?php foreach ( $plw_posts as $plw_post ) : ?>
				<a href="<?php echo esc_url( (string) ( $plw_post['permalink'] ?? '#' ) ); ?>" class="sidebar-post-item">
					<div class="sidebar-post-item__thumb">
						<img src="<?php echo esc_url( (string) ( $plw_post['thumb'] ?? '' ) ); ?>" alt="<?php echo esc_attr( (string) ( $plw_post['title'] ?? '' ) ); ?>" loading="lazy">
					</div>
					<div class="sidebar-post-item__meta">
						<span class="sidebar-post-item__date"><?php echo esc_html( (string) ( $plw_post['date'] ?? '' ) ); ?></span>
						<h4 class="sidebar-post-item__title"><?php echo esc_html( (string) ( $plw_post['title'] ?? '' ) ); ?></h4>
					</div>
				</a>
			<?php endforeach; ?>
		<?php else : ?>
			<p class="sidebar-empty-msg"><?php echo esc_html( $plw_empty ); ?></p>
		<?php endif; ?>
	</div>
</div>
