<?php
/**
 * VintageSoulTheme - All About Sugarcane (History, Heritage & Botanical Science)
 *
 * Rich botanical storytelling, historical timeline, heirloom varieties,
 * nutritional science, zero-waste circular uses, and connoisseur freshness rules.
 */

use VintageSoul\Controllers\HistoryController;
use VintageSoul\Services\RouteService;
use VintageSoul\Support\IconHelper;
use VintageSoul\Support\View;

defined( 'ABSPATH' ) || exit;

$data = ( new HistoryController() )->prepare();

$hero                = (array) ( $data['hero'] ?? array() );
$accent              = (array) ( $data['accent'] ?? array() );
$intro               = (array) ( $data['intro'] ?? array() );
$why                 = (array) ( $data['why'] ?? array() );
$timeline            = (array) ( $data['timeline'] ?? array() );
$story               = (array) ( $data['story'] ?? array() );
$history             = (array) ( $data['history'] ?? array() );
$life_cycle          = (array) ( $data['life_cycle'] ?? array() );
$varieties           = (array) ( $data['varieties'] ?? array() );
$goodness            = (array) ( $data['goodness'] ?? array() );
$nutritional_alchemy = (array) ( $data['nutritional_alchemy'] ?? array() );
$benefits            = (array) ( $data['benefits'] ?? array() );
$uses                = (array) ( $data['uses'] ?? array() );
$culture             = (array) ( $data['culture'] ?? array() );
$storage_guide       = (array) ( $data['storage_guide'] ?? array() );
$why_everyone_loves  = (array) ( $data['why_everyone_loves'] ?? array() );
$faq                 = (array) ( $data['faq'] ?? array() );
$closing             = (array) ( $data['closing'] ?? array() );
?>

<div class="history-page">
	
	<!-- Subtle Botanical Background Particle Layer -->
	<?php View::component( 'background/parchment-botanical-bg', array( 'seed' => 47 ) ); ?>

	<!-- ═══════════ 1. MASTER SUBPAGE HERO ═══════════ -->
	<?php if ( ! empty( $hero ) ) : ?>
		<?php
		View::component(
			'subpage-hero/subpage-hero',
			array(
				'id'    => 'history-hero',
				'tag'   => (string) ( $hero['tag'] ?? '' ),
				'title' => (string) ( $hero['title'] ?? '' ),
				'sub'   => (string) ( $hero['sub'] ?? '' ),
				'image' => (string) ( $hero['image'] ?? 'assets/images/backgrounds/pure_sugarcane_forest_trees_engraving.jpg' ),
				'video' => (string) ( $hero['video'] ?? '' ),
			)
		);
		?>
	<?php endif; ?>

	<!-- ═══════════ 2. INTRO: BOTANICAL HERITAGE BANNER ═══════════ -->
	<?php if ( ! empty( $intro ) ) : ?>
		<section class="section history-intro-section paper-rough">
			<div class="container container--narrow">
				<?php
				View::component(
					'banner/banner',
					array(
						'tag'   => (string) ( $intro['tag'] ?? '' ),
						'title' => (string) ( $intro['title'] ?? '' ),
						'sub'   => (string) ( $intro['sub'] ?? '' ),
						'image' => (string) ( $intro['image'] ?? '' ),
					)
				);
				?>
			</div>
		</section>
		<?php View::component( 'divider/divider' ); ?>
	<?php endif; ?>

	<!-- ═══════════ 3. WHY SUGARCANE: 4 FOUNDATIONAL PILLARS ═══════════ -->
	<?php if ( ! empty( $why['items'] ) ) : ?>
		<section class="section history-why-section">
			<div class="container">
				<?php
				View::component(
					'section-header/section-header',
					array(
						'tag'   => (string) ( $why['tag'] ?? '' ),
						'title' => (string) ( $why['title'] ?? '' ),
					)
				);
				View::component(
					'feature-row/feature-row',
					array( 'items' => (array) ( $why['items'] ?? array() ) )
				);
				?>
			</div>
		</section>
		<?php View::component( 'divider/divider' ); ?>
	<?php endif; ?>

	<!-- ═══════════ 4. CHRONICLES OF SWEETNESS: HISTORICAL TIMELINE ═══════════ -->
	<?php if ( ! empty( $timeline['milestones'] ) ) : ?>
		<section class="section history-timeline-section paper-rough" id="timeline">
			<div class="container">
				<?php
				View::component(
					'section-header/section-header',
					array(
						'tag'   => (string) ( $timeline['tag'] ?? '' ),
						'title' => (string) ( $timeline['title'] ?? '' ),
						'sub'   => (string) ( $timeline['sub'] ?? '' ),
					)
				);
				View::component(
					'timeline-roadmap/timeline-roadmap',
					array(
						'milestones' => (array) ( $timeline['milestones'] ?? array() ),
					)
				);
				?>
			</div>
		</section>
		<?php View::component( 'divider/divider' ); ?>
	<?php endif; ?>

	<!-- ═══════════ 5. HEIRLOOM CANE VARIETIES SHOWCASE ═══════════ -->
	<?php if ( ! empty( $varieties['items'] ) ) : ?>
		<section class="section history-varieties-section" id="varieties">
			<div class="container">
				<?php
				View::component(
					'section-header/section-header',
					array(
						'tag'   => (string) ( $varieties['tag'] ?? '' ),
						'title' => (string) ( $varieties['title'] ?? '' ),
						'sub'   => (string) ( $varieties['sub'] ?? '' ),
					)
				);
				View::component(
					'variety-grid/variety-grid',
					array(
						'items' => (array) ( $varieties['items'] ?? array() ),
					)
				);
				?>
			</div>
		</section>
		<?php View::component( 'divider/divider' ); ?>
	<?php endif; ?>

	<!-- ═══════════ 6. 7-STAGE BOTANICAL LIFE CYCLE ═══════════ -->
	<?php if ( ! empty( $life_cycle['items'] ) ) : ?>
		<section class="section history-lifecycle-section paper-rough" id="lifecycle">
			<div class="container">
				<?php
				View::component(
					'section-header/section-header',
					array(
						'tag'   => (string) ( $life_cycle['tag'] ?? '' ),
						'title' => (string) ( $life_cycle['title'] ?? '' ),
						'sub'   => (string) ( $life_cycle['sub'] ?? '' ),
					)
				);
				View::component(
					'lifecycle-stepper/lifecycle-stepper',
					array(
						'items' => (array) ( $life_cycle['items'] ?? array() ),
					)
				);
				?>
			</div>
		</section>
		<?php View::component( 'divider/divider' ); ?>
	<?php endif; ?>

	<!-- ═══════════ 7. MINERAL ALCHEMY & NUTRITIONAL SCIENCE ═══════════ -->
	<?php if ( ! empty( $nutritional_alchemy['minerals'] ) ) :
		$spotlight_data = (array) ( $nutritional_alchemy['spotlight'] ?? array(
			'badge'   => 'RAW BOTANICAL SCIENCE',
			'title'   => '100% LIVING PLANT WATER',
			'metrics' => array(
				array( 'val' => '420', 'unit' => 'mg', 'label' => 'Bio-Potassium per 330ml' ),
				array( 'val' => '~43', 'unit' => '', 'label' => 'Low Glycemic Index (GI)' ),
				array( 'val' => '0%', 'unit' => '', 'label' => 'Refined Sugar or Syrups' ),
			),
			'summary' => 'Unlike processed table sugar that causes rapid insulin spikes, raw sugarcane delivers organic glucose and fructose naturally bound to bioavailable plant minerals, phenolic flavonoids, and soluble fibers for sustained cellular hydration.',
		) );
	?>
		<section class="section history-minerals-section" id="nutrition">
			<div class="container">
				<?php
				View::component(
					'section-header/section-header',
					array(
						'tag'   => (string) ( $nutritional_alchemy['tag'] ?? '' ),
						'title' => (string) ( $nutritional_alchemy['title'] ?? '' ),
						'sub'   => (string) ( $nutritional_alchemy['sub'] ?? '' ),
					)
				);
				?>

				<div class="nutrition-apothecary-layout">
					<!-- Left Side: Reusable Master Electrolyte Spotlight Card -->
					<?php View::component( 'spotlight-card/spotlight-card', $spotlight_data ); ?>

					<!-- Right Side: Reusable Periodic Mineral Grid -->
					<?php
					View::component(
						'mineral-grid/mineral-grid',
						array(
							'minerals' => (array) ( $nutritional_alchemy['minerals'] ?? array() ),
						)
					);
					?>
				</div>
			</div>
		</section>
		<?php View::component( 'divider/divider' ); ?>
	<?php endif; ?>

	<!-- ═══════════ 8. THE WHOLE-CANE ZERO-WASTE ECOSYSTEM: TRADITION, FOOD, BIOFUEL & MATERIALS ═══════════ -->
	<?php if ( ! empty( $uses['items'] ) ) : ?>
		<section class="section history-uses-section paper-rough" id="uses">
			<div class="container">
				<?php
				View::component(
					'section-header/section-header',
					array(
						'tag'   => (string) ( $uses['tag'] ?? '' ),
						'title' => (string) ( $uses['title'] ?? '' ),
						'sub'   => (string) ( $uses['sub'] ?? '' ),
					)
				);
				View::component(
					'uses-ecosystem/uses-ecosystem',
					array(
						'categories' => (array) ( $uses['categories'] ?? array() ),
						'items'      => (array) ( $uses['items'] ?? array() ),
					)
				);
				?>
			</div>
		</section>
		<?php View::component( 'divider/divider' ); ?>
	<?php endif; ?>

	<!-- ═══════════ 9. CONNOISSEUR STORAGE & FRESHNESS GUIDE ═══════════ -->
	<?php if ( ! empty( $storage_guide['tips'] ) ) : ?>
		<section class="section history-storage-section" id="storage-guide">
			<div class="container">
				<?php
				View::component(
					'section-header/section-header',
					array(
						'tag'   => (string) ( $storage_guide['tag'] ?? '' ),
						'title' => (string) ( $storage_guide['title'] ?? '' ),
						'sub'   => (string) ( $storage_guide['sub'] ?? '' ),
					)
				);
				View::component(
					'storage-steps/storage-steps',
					array(
						'steps' => (array) ( $storage_guide['tips'] ?? array() ),
					)
				);
				?>
			</div>
		</section>
		<?php View::component( 'divider/divider' ); ?>
	<?php endif; ?>

	<!-- ═══════════ 9b. EVERYDAY USES (data/content/uses.json) ═══════════ -->
	<?php View::component( 'sections/highlights-section', array( 'source' => 'uses.json' ) ); ?>

	<!-- ═══════════ 9c. WHY EVERYONE LOVES IT (data/content/why-everyone-loves.json) ═══════════ -->
	<?php View::component( 'sections/highlights-section', array( 'source' => 'why-everyone-loves.json', 'variant' => 'dark' ) ); ?>

	<!-- ═══════════ 10. FREQUENTLY ASKED QUESTIONS ═══════════ -->
	<?php if ( ! empty( $faq['items'] ) ) : ?>
		<?php
		View::component(
			'faq/faq',
			array(
				'tag'     => (string) ( $faq['tag'] ?? '' ),
				'heading' => (string) ( $faq['title'] ?? '' ),
				'items'   => (array) ( $faq['items'] ?? array() ),
				'id'      => 'history-faq',
			)
		);
		?>
	<?php endif; ?>

	<!-- ═══════════ 11. CLOSING HERITAGE CTA ═══════════ -->
	<?php if ( ! empty( $closing ) ) : ?>
		<?php View::component( 'cta-banner/cta-banner', (array) $closing ); ?>
	<?php endif; ?>

</div>
