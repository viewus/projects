<?php
/**
 * VintageSoulTheme - Our Occasions page
 *
 * Everything on this page comes from data/content/occasions.json through
 * OccasionsController; the calendar grids come from OccasionsService.
 */

use VintageSoul\Controllers\OccasionsController;
use VintageSoul\Support\View;

defined( 'ABSPATH' ) || exit;

$data = ( new OccasionsController() )->prepare();

$hero       = (array) ( $data['hero'] ?? array() );
$intro      = (array) ( $data['intro'] ?? array() );
$months     = (array) ( $data['months'] ?? array() );
$upcoming   = (array) ( $data['upcoming'] ?? array() );
$past       = (array) ( $data['past'] ?? array() );
$categories = (array) ( $data['categories'] ?? array() );
$next_up    = $data['next'] ?? null;
$occ_cta    = (array) ( $data['cta'] ?? array() );

// id => occasion, for the calendar day tooltips (upcoming only, matching
// the days the calendar marks).
$lookup = array();
foreach ( $upcoming as $lookup_item ) {
	$lookup[ (string) $lookup_item['id'] ] = $lookup_item;
}
?>

<!-- ═══════════ 1. SUBPAGE HERO ═══════════ -->
<?php
View::component(
	'subpage-hero/subpage-hero',
	array(
		'id'    => 'occasions-hero',
		'tag'   => (string) ( $hero['tag'] ?? '' ),
		'title' => (string) ( $hero['title'] ?? '' ),
		'sub'   => (string) ( $hero['sub'] ?? '' ),
		'image' => (string) ( $hero['image'] ?? '' ),
		'video' => (string) ( $hero['video'] ?? '' ),
	)
);
?>

<?php View::component( 'background/parchment-botanical-bg', array( 'seed' => 44 ) ); ?>

<!-- ═══════════ 2. THE DIARY: CALENDAR + NEXT OCCASION ═══════════ -->
<section class="section occasions-diary-section paper-rough" id="diary">
	<div class="container">
		<?php
		View::component(
			'section-header/section-header',
			array(
				'tag'    => (string) ( $intro['tag'] ?? '' ),
				'title'  => (string) ( $intro['title'] ?? '' ),
				'sub'    => (string) ( $intro['body'] ?? '' ),
				'ribbon' => true,
			)
		);
		?>

		<div class="occasions-diary">
			<div class="occasions-diary__calendar">
				<?php
				View::component(
					'calendar/calendar',
					array(
						'id'       => 'occasions-calendar',
						'months'   => $months,
						'weekdays' => (array) ( $data['weekdays'] ?? array() ),
						'active'   => (int) ( $data['active_month'] ?? 0 ),
						'lookup'   => $lookup,
					)
				);
				?>
			</div>

			<?php if ( is_array( $next_up ) ) : ?>
				<aside class="occasions-next frame--rough-cut" aria-label="<?php esc_attr_e( 'Next occasion', 'vintagesoul' ); ?>">
					<span class="occasions-next__label"><?php esc_html_e( 'Next up', 'vintagesoul' ); ?></span>

					<p class="occasions-next__date"><?php echo esc_html( (string) ( $next_up['date_label'] ?? '' ) ); ?></p>
					<h3 class="occasions-next__title"><?php echo esc_html( (string) ( $next_up['title'] ?? '' ) ); ?></h3>

					<?php if ( '' !== (string) ( $next_up['place'] ?? '' ) ) : ?>
						<p class="occasions-next__place"><?php echo esc_html( (string) $next_up['place'] ); ?></p>
					<?php endif; ?>

					<?php if ( '' !== (string) ( $next_up['time'] ?? '' ) ) : ?>
						<p class="occasions-next__time"><?php echo esc_html( (string) $next_up['time'] ); ?></p>
					<?php endif; ?>

					<?php if ( '' !== (string) ( $next_up['text'] ?? '' ) ) : ?>
						<p class="occasions-next__text"><?php echo esc_html( (string) $next_up['text'] ); ?></p>
					<?php endif; ?>

					<a class="btn btn--primary-vintage btn--sm occasions-next__link" href="#occasion-<?php echo esc_attr( (string) ( $next_up['id'] ?? '' ) ); ?>" data-occasion-target="<?php echo esc_attr( (string) ( $next_up['id'] ?? '' ) ); ?>">
						<span><?php esc_html_e( 'See This Occasion', 'vintagesoul' ); ?></span>
					</a>
				</aside>
			<?php endif; ?>
		</div>
	</div>
</section>

<!-- ═══════════ 3. UPCOMING OCCASIONS ═══════════ -->
<?php
View::component(
	'sections/occasions-list-section',
	array(
		'id'         => 'occasions-list',
		'items'      => $upcoming,
		'categories' => $categories,
		'tag'        => __( 'Coming Up', 'vintagesoul' ),
		'title'      => __( 'Where We Will <em>Be Next</em>', 'vintagesoul' ),
		'empty_text' => (string) ( $data['empty_text'] ?? '' ),
	)
);
?>

<!-- ═══════════ 4. FEATURED TRUST STRIP ═══════════ -->
<?php View::component( 'sections/logo-strip-section' ); ?>

<!-- ═══════════ 5. CLOSING CTA ═══════════ -->
<?php if ( ! empty( $occ_cta ) ) : ?>
	<?php View::component( 'cta-banner/cta-banner', $occ_cta ); ?>
<?php endif; ?>
