<?php
/**
 * VintageSoulTheme - Locations / Store Finder Section
 *
 * Content: data/content/locations.json
 *   (tag, title, sub, items[] { name, address, hours, phone, map_url }).
 * Pass a `locations` array to override the JSON.
 */

defined( 'ABSPATH' ) || exit;

use VintageSoul\DataProviders\JsonFileProvider;
use VintageSoul\Support\IconHelper;
use VintageSoul\Support\View;

$loc_data = ! empty( $locations ) && is_array( $locations ) ? $locations : (array) JsonFileProvider::read( 'data/content/locations.json' );

$loc_tag   = (string) ( $loc_data['tag'] ?? '' );
$loc_title = (string) ( $loc_data['title'] ?? '' );
$loc_sub   = (string) ( $loc_data['sub'] ?? '' );
$loc_items = (array) ( $loc_data['items'] ?? array() );

if ( empty( $loc_items ) ) {
	return;
}

$loc_icon_pin   = IconHelper::get( 'pin', '#caa06d', 14 );
$loc_icon_clock = IconHelper::get( 'clock', '#caa06d', 14 );
$loc_icon_phone = IconHelper::get( 'phone', '#caa06d', 14 );
?>
<section class="section section--locations locations-section paper-rough" id="locations">
	<div class="container">
		<?php
		View::component(
			'section-header/section-header',
			array(
				'tag'    => $loc_tag,
				'title'  => $loc_title,
				'sub'    => $loc_sub,
				'ribbon' => true,
			)
		);
		?>

		<div class="locations-grid">
			<?php foreach ( $loc_items as $loc_item ) :
				$l_name    = trim( (string) ( $loc_item['name'] ?? '' ) );
				$l_address = trim( (string) ( $loc_item['address'] ?? '' ) );
				$l_hours   = trim( (string) ( $loc_item['hours'] ?? '' ) );
				$l_phone   = trim( (string) ( $loc_item['phone'] ?? '' ) );
				$l_map     = trim( (string) ( $loc_item['map_url'] ?? '' ) );
				if ( '' === $l_name ) {
					continue;
				}
				$l_tel = preg_replace( '/[^0-9+]/', '', $l_phone );
			?>
				<article class="location-card frame--ornate-sm">
					<h3 class="location-card__name"><?php echo esc_html( $l_name ); ?></h3>

					<ul class="location-card__meta">
						<?php if ( '' !== $l_address ) : ?>
							<li class="location-card__row">
								<span class="location-card__icon" aria-hidden="true"><?php echo $loc_icon_pin; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- inline SVG from IconHelper ?></span>
								<span><?php echo esc_html( $l_address ); ?></span>
							</li>
						<?php endif; ?>

						<?php if ( '' !== $l_hours ) : ?>
							<li class="location-card__row">
								<span class="location-card__icon" aria-hidden="true"><?php echo $loc_icon_clock; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- inline SVG from IconHelper ?></span>
								<span><?php echo esc_html( $l_hours ); ?></span>
							</li>
						<?php endif; ?>

						<?php if ( '' !== $l_phone && '' !== $l_tel ) : ?>
							<li class="location-card__row">
								<span class="location-card__icon" aria-hidden="true"><?php echo $loc_icon_phone; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- inline SVG from IconHelper ?></span>
								<a class="location-card__link" href="<?php echo esc_url( 'tel:' . $l_tel ); ?>"><?php echo esc_html( $l_phone ); ?></a>
							</li>
						<?php endif; ?>
					</ul>

					<?php if ( '' !== $l_map ) : ?>
						<a class="btn btn--outline-vintage btn--sm location-card__map" href="<?php echo esc_url( $l_map ); ?>" target="_blank" rel="noopener noreferrer">
							<span><?php esc_html_e( 'Get Directions', 'vintagesoul' ); ?></span>
						</a>
					<?php endif; ?>
				</article>
			<?php endforeach; ?>
		</div>
	</div>
</section>
