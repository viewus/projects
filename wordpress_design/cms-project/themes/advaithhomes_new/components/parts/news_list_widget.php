<?php
/**
 * components/parts/list_widget.php - Reusable headed list widget.
 *
 * Accepts a heading (with optional "view all" link), a list of mini_card
 * items, and an optional bottom CTA button. Works as a drop-in for any
 * "title + item list" pattern across the site.
 *
 * Props via $widget array:
 *   heading  array  { title, link_label?, link_url? }
 *   items    array  - each entry is a mini_card $card array:
 *                     { icon|badge|img, title, meta?, tag?, url? }
 *   cta      array  { label, url }  - optional bottom link button
 *   tag      string - heading HTML tag: 'h2' | 'h3' (default) | 'h4'
 *
 * Usage:
 *   adn_component( 'parts/list_widget', array( 'widget' => array(
 *       'heading' => array(
 *           'title'      => 'Latest News',
 *           'link_label' => 'View all →',
 *           'link_url'   => '/news/',
 *       ),
 *       'items' => array(
 *           array( 'img' => 'linear-gradient(135deg,#1d5c8e,#2d7dd2)', 'title' => 'Article title', 'meta' => 'Jan 12 2026', 'url' => '/news/article/' ),
 *           array( 'icon' => '🏠', 'title' => 'First-time buyer guide', 'url' => '/guides/first-time-buyer/' ),
 *       ),
 *       'cta' => array( 'label' => 'See all guides', 'url' => '/guides/' ),
 *   ) ) );
 */

defined( 'ABSPATH' ) || exit;

$widget  = isset( $widget ) && is_array( $widget ) ? $widget : array();
$heading = isset( $widget['heading'] ) && is_array( $widget['heading'] ) ? $widget['heading'] : array();
$items   = isset( $widget['items'] )   && is_array( $widget['items'] )   ? $widget['items']   : array();
$cta     = isset( $widget['cta'] )     && is_array( $widget['cta'] )     ? $widget['cta']     : array();

$allowed_tags = array( 'h2', 'h3', 'h4' );
$htag         = isset( $widget['tag'] ) && in_array( $widget['tag'], $allowed_tags, true ) ? $widget['tag'] : 'h3';

$title      = isset( $heading['title'] )      ? (string) $heading['title']      : '';
$link_label = isset( $heading['link_label'] ) ? (string) $heading['link_label'] : '';
$link_url   = isset( $heading['link_url'] )   ? (string) $heading['link_url']   : '';
$cta_label  = isset( $cta['label'] )          ? (string) $cta['label']          : '';
$cta_url    = isset( $cta['url'] )            ? (string) $cta['url']            : '';

// Promote CTA to header "View all" link when no explicit link_label is set.
if ( '' === $link_label && '' !== $cta_label && '' !== $cta_url ) {
	$link_label = $cta_label;
	$link_url   = $cta_url;
	$cta_label  = '';
	$cta_url    = '';
}

if ( empty( $items ) && '' === $title ) { return; }
?>
<div class="list-widget">

	<?php if ( '' !== $title || ( '' !== $link_label && '' !== $link_url ) ) : ?>
	<div class="list-widget-header list-widget-header--news">
		<?php if ( '' !== $title ) : ?>
			<div class="list-widget-header__title-wrap">
				<div class="list-widget-header__icon">
					<?php echo adn_icon( 'newspaper' ); ?>
				</div>
				<<?php echo $htag; ?>><?php echo esc_html( $title ); ?></<?php echo $htag; ?>>
			</div>
		<?php endif; ?>
		<?php if ( '' !== $link_label && '' !== $link_url ) : ?>
			<a href="<?php echo esc_url( adn_link( $link_url ) ); ?>" class="list-widget-view-all">
				<?php echo esc_html( $link_label ); ?>
			</a>
		<?php endif; ?>
	</div>
	<?php endif; ?>

	<?php if ( ! empty( $items ) ) : ?>
	<div class="list-widget-items list-widget-items--news">
		<?php
		$first_item = array_shift( $items );
		// Ensure tags is array for multiple badges
		$tag = ! empty( $first_item['tag'] ) ? (string) $first_item['tag'] : '';
		?>
		<div class="news-hero-and-list">
			<div class="news-hero-card <?php echo empty( $first_item['img_url'] ) ? 'news-hero-card--no-image' : ''; ?>">
				<a href="<?php echo esc_url( adn_link( isset( $first_item['url'] ) ? $first_item['url'] : '' ) ); ?>" class="news-hero-card__link">
					<?php if ( ! empty( $first_item['img_url'] ) ) : ?>
					<div class="news-hero-card__img-wrap">
						<?php 
							$fallback = esc_url( get_template_directory_uri() . THEME_DEFAULT_NEWS_IMG . '?v=' . LOCAL_CACHE_VERSION );
							$alt_text = esc_attr( isset( $first_item['title'] ) ? $first_item['title'] : '' );
						?>
						<img src="<?php echo esc_url( $first_item['img_url'] ); ?>" alt="<?php echo $alt_text; ?>" onerror="this.onerror=null;this.src='<?php echo $fallback; ?>';" class="news-hero-card__img" />
						<div class="news-hero-card__read-time-top" style="position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.95); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; color: var(--color-text); font-weight: 600; display: flex; align-items: center; gap: 4px; z-index: 2; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
							<?php echo adn_icon( 'clock' ); ?> <span>5 min read</span>
						</div>
						<div class="news-hero-card__tags">
							<?php if ( '' !== $tag ) : ?>
								<span class="news-hero-card__tag"><?php echo esc_html( $tag ); ?></span>
							<?php endif; ?>
						</div>
					</div>
					<?php else : ?>
					<div class="news-hero-card__no-image-header">
						<?php if ( '' !== $tag ) : ?>
							<span class="news-hero-card__tag"><?php echo esc_html( $tag ); ?></span>
						<?php else: ?>
							<div class="news-hero-card__icon-wrap">
								<span aria-hidden="true" style="font-size: 1.8rem;">
									<?php echo adn_icon( ! empty( $first_item['icon'] ) ? $first_item['icon'] : 'news' ); ?>
								</span>
							</div>
						<?php endif; ?>
						<div class="news-hero-card__read-time-top">
							<?php echo adn_icon( 'clock' ); ?> <span>5 min read</span>
						</div>
					</div>
					<?php endif; ?>
					<div class="news-hero-card__content">
						<div class="news-hero-card__meta">
							<span class="news-hero-card__date"><?php echo esc_html( ! empty( $first_item['meta_full'] ) ? $first_item['meta_full'] : ( isset( $first_item['meta'] ) ? $first_item['meta'] : '' ) ); ?></span>
						</div>
						<h3 class="news-hero-card__title"><?php echo esc_html( isset( $first_item['title'] ) ? $first_item['title'] : '' ); ?></h3>
						<?php if ( ! empty( $first_item['description'] ) ) : ?>
							<p class="news-hero-card__excerpt"><?php echo esc_html( $first_item['description'] ); ?></p>
						<?php endif; ?>
					</div>
				</a>
			</div>

			<div class="news-list-remaining">
			<?php foreach ( $items as $_card ) : ?>
				<?php adn_component( 'cards/mini_card', array( 'card' => (array) $_card ) ); ?>
			<?php endforeach; ?>
			</div>
		</div>
	</div>
	<?php endif; ?>

</div>
