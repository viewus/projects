<?php
/**
 * VintageSoulTheme - Franchise Investment Plans / Tiers Section
 *
 * Content: data/content/pricing-tiers.json
 *   (tag, title, sub, tiers[] { name, note, price, badge, features[] }, offer_title, offers[]).
 * Pass a `tiers_data` array to override the JSON.
 */

defined( 'ABSPATH' ) || exit;

use VintageSoul\DataProviders\JsonFileProvider;
use VintageSoul\Support\IconHelper;
use VintageSoul\Support\View;

$pt_data = ! empty( $tiers_data ) && is_array( $tiers_data ) ? $tiers_data : (array) JsonFileProvider::read( 'data/content/pricing-tiers.json' );

$pt_tag         = (string) ( $pt_data['tag'] ?? '' );
$pt_title       = (string) ( $pt_data['title'] ?? '' );
$pt_sub         = (string) ( $pt_data['sub'] ?? '' );
$pt_tiers       = (array) ( $pt_data['tiers'] ?? array() );
$pt_offer_title = (string) ( $pt_data['offer_title'] ?? '' );
$pt_offers      = array_values( array_filter( array_map( 'strval', (array) ( $pt_data['offers'] ?? array() ) ) ) );

if ( empty( $pt_tiers ) ) {
	return;
}

$pt_check = IconHelper::get( 'check', '#0c6434', 14 );
?>
<section class="section section--pricing-tiers pricing-tiers-section paper-rough" id="investment-plans">
	<div class="container">
		<?php
		View::component(
			'section-header/section-header',
			array(
				'tag'    => $pt_tag,
				'title'  => $pt_title,
				'sub'    => $pt_sub,
				'ribbon' => true,
			)
		);
		?>

		<div class="pricing-tiers-grid">
			<?php foreach ( $pt_tiers as $pt_tier ) :
				$t_name     = trim( (string) ( $pt_tier['name'] ?? '' ) );
				$t_note     = trim( (string) ( $pt_tier['note'] ?? '' ) );
				$t_price    = trim( (string) ( $pt_tier['price'] ?? '' ) );
				$t_badge    = trim( (string) ( $pt_tier['badge'] ?? '' ) );
				$t_features = array_values( array_filter( array_map( 'strval', (array) ( $pt_tier['features'] ?? array() ) ) ) );
				if ( '' === $t_name ) {
					continue;
				}
			?>
				<article class="pricing-tier-card frame--ornate-sm<?php echo '' !== $t_badge ? ' pricing-tier-card--featured' : ''; ?>">
					<?php if ( '' !== $t_badge ) : ?>
						<span class="pricing-tier-card__badge"><?php echo esc_html( $t_badge ); ?></span>
					<?php endif; ?>

					<?php if ( '' !== $t_note ) : ?>
						<span class="pricing-tier-card__note"><?php echo esc_html( $t_note ); ?></span>
					<?php endif; ?>

					<h3 class="pricing-tier-card__name"><?php echo esc_html( $t_name ); ?></h3>

					<?php if ( '' !== $t_price ) : ?>
						<p class="pricing-tier-card__price"><?php echo esc_html( $t_price ); ?></p>
					<?php endif; ?>

					<?php if ( ! empty( $t_features ) ) : ?>
						<ul class="pricing-tier-card__features">
							<?php foreach ( $t_features as $t_feature ) : ?>
								<li>
									<span class="pricing-tier-card__mark" aria-hidden="true"><?php echo $pt_check; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- inline SVG from IconHelper ?></span>
									<?php echo esc_html( $t_feature ); ?>
								</li>
							<?php endforeach; ?>
						</ul>
					<?php endif; ?>
				</article>
			<?php endforeach; ?>
		</div>

		<?php if ( ! empty( $pt_offers ) ) : ?>
			<div class="pricing-offers frame--rough-cut">
				<?php if ( '' !== $pt_offer_title ) : ?>
					<h3 class="pricing-offers__title"><?php echo esc_html( $pt_offer_title ); ?></h3>
				<?php endif; ?>
				<ul class="pricing-offers__list">
					<?php foreach ( $pt_offers as $pt_offer ) : ?>
						<li class="pricing-offers__item"><?php echo esc_html( $pt_offer ); ?></li>
					<?php endforeach; ?>
				</ul>
			</div>
		<?php endif; ?>
	</div>
</section>
