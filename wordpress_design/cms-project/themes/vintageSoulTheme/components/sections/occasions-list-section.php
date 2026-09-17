<?php
/**
 * VintageSoulTheme - Occasions Card List
 *
 * The list half of the Our Occasions page: filter pills plus one card per
 * occasion. Cards carry data-occasion-id / data-category so the calendar
 * above can target a day and the pills can filter without a reload.
 *
 * Props:
 *   items      (array)  - prepared occasions from OccasionsController
 *   categories (array)  - filter pills { id, label, count }
 *   tag/title/sub (string)
 *   empty_text (string)
 *   id         (string) - section anchor id
 *   show_filters (bool) - default true
 */

defined( 'ABSPATH' ) || exit;

use VintageSoul\Support\IconHelper;
use VintageSoul\Support\View;

$oc_items      = isset( $items ) && is_array( $items ) ? $items : array();
$oc_categories = isset( $categories ) && is_array( $categories ) ? $categories : array();
$oc_tag        = isset( $tag ) ? (string) $tag : '';
$oc_title      = isset( $title ) ? (string) $title : '';
$oc_sub        = isset( $sub ) ? (string) $sub : '';
$oc_empty      = isset( $empty_text ) ? (string) $empty_text : '';
$oc_id         = ( isset( $id ) && '' !== trim( (string) $id ) ) ? sanitize_html_class( (string) $id ) : 'occasions-list';
$oc_filters    = ! isset( $show_filters ) || false !== $show_filters;

if ( empty( $oc_items ) ) {
	return;
}

$oc_icon_pin   = IconHelper::get( 'pin', '#a17036', 14 );
$oc_icon_clock = IconHelper::get( 'clock', '#a17036', 14 );
?>
<section class="section occasions-list-section paper-rough" id="<?php echo esc_attr( $oc_id ); ?>">
	<div class="container">
		<?php if ( '' !== $oc_tag || '' !== $oc_title ) : ?>
			<?php
			View::component(
				'section-header/section-header',
				array(
					'tag'    => $oc_tag,
					'title'  => $oc_title,
					'sub'    => $oc_sub,
					'ribbon' => true,
				)
			);
			?>
		<?php endif; ?>

		<?php if ( $oc_filters && count( $oc_categories ) > 1 ) : ?>
			<div class="occasions-filters" role="group" aria-label="<?php esc_attr_e( 'Filter occasions', 'vintagesoul' ); ?>">
				<?php foreach ( $oc_categories as $oc_index => $oc_cat ) : ?>
					<button
						type="button"
						class="occasions-filter<?php echo 0 === (int) $oc_index ? ' is-active' : ''; ?>"
						data-occasion-filter="<?php echo esc_attr( (string) $oc_cat['id'] ); ?>"
						aria-pressed="<?php echo 0 === (int) $oc_index ? 'true' : 'false'; ?>">
						<?php echo esc_html( (string) $oc_cat['label'] ); ?>
						<span class="occasions-filter__count"><?php echo esc_html( (string) (int) $oc_cat['count'] ); ?></span>
					</button>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>

		<div class="occasions-grid" data-occasions-grid>
			<?php foreach ( $oc_items as $oc_item ) :
				$o_id    = (string) ( $oc_item['id'] ?? '' );
				$o_cta   = (array) ( $oc_item['cta'] ?? array() );
				$o_past  = ! empty( $oc_item['is_past'] );
				$o_now   = ! empty( $oc_item['is_today'] );
				$o_image = (string) ( $oc_item['image'] ?? '' );
			?>
				<article
					class="occasion-card frame--rough-cut<?php echo $o_past ? ' occasion-card--past' : ''; ?><?php echo $o_now ? ' occasion-card--today' : ''; ?>"
					id="occasion-<?php echo esc_attr( $o_id ); ?>"
					data-occasion-id="<?php echo esc_attr( $o_id ); ?>"
					data-category="<?php echo esc_attr( (string) ( $oc_item['category'] ?? '' ) ); ?>"
					data-date="<?php echo esc_attr( (string) ( $oc_item['date'] ?? '' ) ); ?>"
					tabindex="-1">

					<?php if ( '' !== $o_image ) : ?>
						<figure class="occasion-card__media">
							<img src="<?php echo esc_url( $o_image ); ?>" alt="<?php echo esc_attr( (string) ( $oc_item['title'] ?? '' ) ); ?>" loading="lazy" decoding="async">
							<span class="occasion-card__date" aria-hidden="true">
								<span class="occasion-card__date-day"><?php echo esc_html( (string) (int) ( $oc_item['day'] ?? 0 ) ); ?></span>
								<span class="occasion-card__date-month"><?php echo esc_html( substr( (string) ( $oc_item['short_label'] ?? '' ), -3 ) ); ?></span>
							</span>
							<?php if ( '' !== (string) ( $oc_item['badge'] ?? '' ) ) : ?>
								<span class="occasion-card__badge"><?php echo esc_html( (string) $oc_item['badge'] ); ?></span>
							<?php endif; ?>
						</figure>
					<?php endif; ?>

					<div class="occasion-card__body">
						<p class="occasion-card__when">
							<?php echo esc_html( (string) ( $oc_item['date_label'] ?? '' ) ); ?>
							<?php if ( $o_now ) : ?>
								<span class="occasion-card__live"><?php esc_html_e( 'Happening today', 'vintagesoul' ); ?></span>
							<?php elseif ( $o_past ) : ?>
								<span class="occasion-card__done"><?php esc_html_e( 'Past', 'vintagesoul' ); ?></span>
							<?php endif; ?>
						</p>

						<h3 class="occasion-card__title"><?php echo esc_html( (string) ( $oc_item['title'] ?? '' ) ); ?></h3>

						<ul class="occasion-card__meta">
							<?php if ( '' !== (string) ( $oc_item['place'] ?? '' ) ) : ?>
								<li>
									<span class="occasion-card__icon" aria-hidden="true"><?php echo $oc_icon_pin; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- inline SVG from IconHelper ?></span>
									<span><?php echo esc_html( (string) $oc_item['place'] ); ?></span>
								</li>
							<?php endif; ?>
							<?php if ( '' !== (string) ( $oc_item['time'] ?? '' ) ) : ?>
								<li>
									<span class="occasion-card__icon" aria-hidden="true"><?php echo $oc_icon_clock; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- inline SVG from IconHelper ?></span>
									<span><?php echo esc_html( (string) $oc_item['time'] ); ?></span>
								</li>
							<?php endif; ?>
						</ul>

						<?php if ( '' !== (string) ( $oc_item['text'] ?? '' ) ) : ?>
							<p class="occasion-card__text"><?php echo esc_html( (string) $oc_item['text'] ); ?></p>
						<?php endif; ?>

						<?php if ( '' !== (string) ( $o_cta['label'] ?? '' ) && '' !== (string) ( $o_cta['url'] ?? '' ) ) : ?>
							<a class="btn btn--outline-vintage btn--sm occasion-card__cta"
								href="<?php echo esc_url( (string) $o_cta['url'] ); ?>"
								<?php echo ! empty( $o_cta['external'] ) ? ' target="_blank" rel="noopener noreferrer"' : ''; ?>>
								<span><?php echo esc_html( (string) $o_cta['label'] ); ?></span>
							</a>
						<?php endif; ?>
					</div>
				</article>
			<?php endforeach; ?>
		</div>

		<?php if ( '' !== $oc_empty ) : ?>
			<p class="occasions-empty" data-occasions-empty hidden><?php echo esc_html( $oc_empty ); ?></p>
		<?php endif; ?>
	</div>
</section>
