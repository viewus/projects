<?php

use VintageSoul\Controllers\FranchiseController;
use VintageSoul\Services\RouteService;
use VintageSoul\Support\View;

defined( 'ABSPATH' ) || exit;

$data = ( new FranchiseController() )->prepare();

$hero               = (array) ( $data['hero'] ?? array() );
$why                = (array) ( $data['why'] ?? array() );
$how                = (array) ( $data['how'] ?? array() );
$franchise_pillars  = (array) ( $data['pillars'] ?? array() );
$franchise_formats  = (array) ( $data['formats'] ?? array() );
$gallery            = (array) ( $data['gallery'] ?? array() );
$franchise_gallery  = (array) ( $gallery['items'] ?? array() );
$reviews_data       = (array) ( $data['reviews'] ?? array() );
$franchisee_reviews = (array) ( $reviews_data['items'] ?? array() );
$faqs               = (array) ( $data['faqs'] ?? array() );
$franchise_faqs     = (array) ( $faqs['items'] ?? array() );
$closing            = (array) ( $data['closing'] ?? array() );
?>

<!-- ═══════════ 1. COMMON LUXURY VINTAGE SUBPAGE HERO HEADER ═══════════ -->
<?php
View::component(
	'subpage-hero/subpage-hero',
	array(
		'id'    => 'franchise-hero',
		'tag'   => (string) ( $hero['tag'] ?? '' ),
		'title' => (string) ( $hero['title'] ?? '' ),
		'sub'   => (string) ( $hero['sub'] ?? '' ),
		'image' => (string) ( $hero['image'] ?? '' ),
		'video' => (string) ( $hero['video'] ?? '' ),
	)
);
?>

<?php View::component( 'background/parchment-botanical-bg', array( 'seed' => 45 ) ); ?>

<!-- ═══════════ 2. WHY PARTNER WITH US (4 Pillars Grid) ═══════════ -->
<section class="section section--alt" id="why-partner">
	<div class="container">
		<?php
		View::component(
			'section-header/section-header',
			array(
				'tag'   => (string) ( $why['tag'] ?? '' ),
				'title' => (string) ( $why['title'] ?? '' ),
				'sub'   => (string) ( $why['sub'] ?? '' ),
			)
		);
		?>

		<?php
		View::component(
			'icon-card-grid/icon-card-grid',
			array(
				'items'      => $franchise_pillars,
				'block'      => 'event-type-card',
				'grid_class' => 'events-types-grid',
				'card_extra' => 'card--rough-cut',
			)
		);
		?>
	</div>
</section>

<!-- ═══════════ 3. FRANCHISE MOVING CARD STREAMS ═══════════ -->
<section class="section section--franchise franchise-vintage-block torn-dark-block grain-dark" style="padding-top: 24px; padding-bottom: 30px;">
	<div class="container franchise-vintage__container">
		
		<?php if ( ! empty( $gallery['ribbon'] ) ) : ?>
			<div class="vintage-ribbon-tag vintage-ribbon-tag--gold">
				<span><?php echo esc_html( (string) $gallery['ribbon'] ); ?></span>
			</div>
		<?php endif; ?>
		<?php
		View::component( 'card-stream/card-stream', array(
			'items'      => $franchise_gallery,
			'card_type'  => 'gallery',
			'direction'  => 'ltr',
			'aria_label' => (string) ( $gallery['title'] ?? '' ),
		) );
		?>

		<?php if ( ! empty( $reviews_data['ribbon'] ) ) : ?>
			<div class="vintage-ribbon-tag">
				<span><?php echo esc_html( (string) $reviews_data['ribbon'] ); ?></span>
			</div>
		<?php endif; ?>
		<?php
		View::component( 'card-stream/card-stream', array(
			'items'      => $franchisee_reviews,
			'card_type'  => 'dark-review',
			'direction'  => 'rtl',
			'aria_label' => (string) ( $reviews_data['title'] ?? '' ),
		) );
		?>
	</div>
</section>

<!-- Deckled Border Divider -->
<?php View::component( 'divider/divider' ); ?>

<!-- ═══════════ 4. HOW IT WORKS (Step Chain) ═══════════ -->
<?php if ( ! empty( $how['items'] ) ) : ?>
	<section class="section" id="franchise-steps">
		<div class="container">
			<?php
			View::component(
				'section-header/section-header',
				array(
					'tag'   => (string) ( $how['tag'] ?? '' ),
					'title' => (string) ( $how['title'] ?? '' ),
					'sub'   => (string) ( $how['sub'] ?? '' ),
				)
			);
			View::component(
				'step-chain/step-chain',
				array( 'items' => (array) ( $how['items'] ?? array() ) )
			);
			?>
		</div>
	</section>
<?php endif; ?>

<!-- ═══════════ 4b. INVESTMENT PLANS & FORMATS (data/content/pricing-tiers.json) ═══════════ -->
<?php View::component( 'sections/pricing-tiers-section' ); ?>

<!-- ═══════════ 5. FEATURED TRUST STRIP ═══════════ -->
<?php View::component( 'sections/logo-strip-section' ); ?>

<!-- ═══════════ 6. DIRECT FRANCHISE APPLICATION & ENQUIRY ═══════════ -->
<div id="franchise-enquiry">
	<?php View::component( 'sections/contact-form-section', array( 'form_key' => 'franchise' ) ); ?>
</div>

<!-- ═══════════ 7. FRANCHISE FAQS ═══════════ -->
<?php if ( ! empty( $franchise_faqs ) ) : ?>
	<?php
	View::component(
		'faq/faq',
		array(
			'tag'     => (string) ( $faqs['tag'] ?? '' ),
			'heading' => (string) ( $faqs['title'] ?? '' ),
			'items'   => $franchise_faqs,
			'id'      => 'franchise-faqs',
		)
	);
	?>
<?php endif; ?>
