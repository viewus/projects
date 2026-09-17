<?php

use VintageSoul\Controllers\AboutController;
use VintageSoul\DataProviders\JsonFileProvider;
use VintageSoul\Support\UrlHelper;
use VintageSoul\Support\View;

defined( 'ABSPATH' ) || exit;

$data = ( new AboutController() )->prepare();

$hero   = (array) ( $data['hero'] ?? array() );
$intro  = (array) ( $data['intro'] ?? array() );
$values = (array) ( $data['values'] ?? array() );
$story  = (array) ( $data['story'] ?? array() );

$team       = (array) JsonFileProvider::read( 'data/content/team.json' );
$milestones = (array) JsonFileProvider::read( 'data/content/milestones.json' );

$team_members   = (array) ( $team['items'] ?? array() );
$milestone_items = (array) ( $milestones['items'] ?? array() );
?>

<div class="about-page">
	<?php View::component( 'background/parchment-botanical-bg', array( 'seed' => 23 ) ); ?>
	
	<!-- ═══════════ 1. MASTER VINTAGE HERO ═══════════ -->
	<?php
	View::component(
		'subpage-hero/subpage-hero',
		array(
			'id'    => 'about-hero',
			'tag'   => (string) ( $hero['tag'] ?? '' ),
			'title' => (string) ( $hero['title'] ?? '' ),
			'sub'   => (string) ( $hero['sub'] ?? '' ),
			'image' => (string) ( $hero['image'] ?? '' ),
			'video' => (string) ( $hero['video'] ?? '' ),
		)
	);
	?>

	<!-- ═══════════ 2. INTRO: MORE THAN JUST A CROP ═══════════ -->
	<?php View::component( 'sections/about-intro-section', array( 'intro' => $intro ) ); ?>

	<!-- Gold Wave Divider -->
	<?php View::component( 'divider/divider', array( 'type' => 'gold-wave' ) ); ?>

	<!-- ═══════════ 3. OUR SERVICES ═══════════ -->
	<?php View::component( 'sections/about-services-section', array( 'intro' => $intro ) ); ?>

	<!-- Deckled Edge Divider -->
	<?php View::component( 'divider/divider' ); ?>

	<!-- ═══════════ 4. FOUR PILLARS (Dark Botanical) ═══════════ -->
	<?php View::component( 'sections/pillars-section', array( 'story' => $story ) ); ?>

	<!-- Gold Wave Divider -->
	<?php View::component( 'divider/divider', array( 'type' => 'gold-wave' ) ); ?>

	<!-- ═══════════ 6. OUR MILESTONES TIMELINE ═══════════ -->
	<?php if ( ! empty( $milestone_items ) ) : ?>
		<?php
		View::component(
			'timeline/timeline',
			array(
				'tag'   => (string) ( $milestones['tag'] ?? '' ),
				'title' => (string) ( $milestones['title'] ?? '' ),
				'sub'   => (string) ( $milestones['sub'] ?? '' ),
				'items' => $milestone_items,
			)
		);
		?>
	<?php endif; ?>

	<!-- Deckled Edge Divider -->
	<?php View::component( 'divider/divider' ); ?>

	<!-- ═══════════ 7. MEET THE CANE FAMILY (Dark Botanical Stream) ═══════════ -->
	<?php if ( ! empty( $team_members ) ) : ?>
		<section class="section section--dark-botanical about-team-section" id="team" style="padding-top: 36px; padding-bottom: 44px;">
			<div class="container">
				<?php
				View::component(
					'section-header/section-header',
					array(
						'tag'     => (string) ( $team['tag'] ?? '' ),
						'title'   => (string) ( $team['title'] ?? '' ),
						'sub'     => (string) ( $team['sub'] ?? '' ),
						'variant' => 'dark',
						'ribbon'  => true,
					)
				);

				View::component( 'card-stream/card-stream', array(
					'items'      => $team_members,
					'card_type'  => 'team',
					'direction'  => 'ltr',
					'aria_label' => (string) ( $team['aria_label'] ?? ( $team['title'] ?? '' ) ),
				) );
				?>
			</div>
		</section>
	<?php endif; ?>

	<!-- Deckled Edge Divider -->
	<?php View::component( 'divider/divider' ); ?>

	<!-- ═══════════ 7b. ORIGIN STORY (data/content/origin-history.json) ═══════════ -->
	<?php View::component( 'sections/origin-story-section' ); ?>

	<!-- ═══════════ 7c. IN OUR CULTURE (data/content/culture.json) ═══════════ -->
	<?php View::component( 'sections/culture-section' ); ?>

	<!-- ═══════════ 7d. WHY IT MATTERS (data/content/why-us.json) ═══════════ -->
	<?php View::component( 'sections/why-us-section' ); ?>

	<!-- ═══════════ 7e. HEALTH BENEFITS CHECKLIST (data/content/benefits-list.json) ═══════════ -->
	<?php View::component( 'sections/highlights-section', array( 'source' => 'benefits-list.json' ) ); ?>

	<!-- ═══════════ 7f. FROM ONE SOURCE, MANY GOODS (data/content/byproducts.json) ═══════════ -->
	<?php View::component( 'sections/byproducts-section' ); ?>

	<!-- ═══════════ 8. QUALITY & CERTIFICATIONS (Food Safety Registered) ═══════════ -->
	<?php View::component( 'sections/certifications-section' ); ?>

	<!-- Gold Wave Divider -->
	<?php View::component( 'divider/divider', array( 'type' => 'gold-wave' ) ); ?>

	<!-- ═══════════ 9. PHOTO GALLERY ARCHIVE ═══════════ -->
	<?php View::component( 'sections/gallery-section' ); ?>

	<!-- Gold Wave Divider -->
	<?php View::component( 'divider/divider', array( 'type' => 'gold-wave' ) ); ?>

	<!-- ═══════════ 10. LOGO STRIP / PARTNERS ═══════════ -->
	<?php View::component( 'sections/logo-strip-section' ); ?>

	<!-- ═══════════ 11. CLOSING CTA BANNER ═══════════ -->
	<?php if ( ! empty( $intro['closing'] ) ) : ?>
		<?php View::component( 'cta-banner/cta-banner', (array) $intro['closing'] ); ?>
	<?php endif; ?>
</div>
