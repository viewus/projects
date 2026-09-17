<?php
/**
 * VintageSoulTheme - Opening Hours Section (with live open/closed status)
 *
 * Content: data/content/opening-hours.json
 *   (tag, title, sub, note, days[] { label, day, open, close }).
 * `day` is 0-6 (Sunday-Saturday); omit open/close (or leave blank) to mark a day closed.
 *
 * "Today" and the open/closed badge are resolved through PluginBridgeService so they
 * follow the timezone set in CMS Global Settings, not the server's own clock.
 * Pass an `opening_hours` array to override the JSON.
 */

defined( 'ABSPATH' ) || exit;

use VintageSoul\DataProviders\JsonFileProvider;
use VintageSoul\Services\PluginBridgeService;
use VintageSoul\Support\View;

$oh_data = ! empty( $opening_hours ) && is_array( $opening_hours ) ? $opening_hours : (array) JsonFileProvider::read( 'data/content/opening-hours.json' );

$oh_tag   = (string) ( $oh_data['tag'] ?? '' );
$oh_title = (string) ( $oh_data['title'] ?? '' );
$oh_sub   = (string) ( $oh_data['sub'] ?? '' );
$oh_note  = (string) ( $oh_data['note'] ?? '' );
$oh_days  = (array) ( $oh_data['days'] ?? array() );

if ( empty( $oh_days ) ) {
	return;
}

$oh_today_dow = (int) PluginBridgeService::format_datetime( 'now', 'w' );
$oh_now       = (string) PluginBridgeService::format_datetime( 'now', 'H:i' );
$oh_is_open   = false;

/** Minutes since midnight for a HH:MM string, or null when unparseable. */
$oh_minutes = static function ( string $time ): ?int {
	$time = trim( $time );
	if ( ! preg_match( '/^(\d{1,2}):(\d{2})$/', $time, $m ) ) {
		return null;
	}
	return ( (int) $m[1] * 60 ) + (int) $m[2];
};

$oh_now_mins = $oh_minutes( $oh_now );
?>
<section class="section section--opening-hours opening-hours-section paper-rough" id="opening-hours">
	<div class="container container--narrow">
		<?php
		View::component(
			'section-header/section-header',
			array(
				'tag'    => $oh_tag,
				'title'  => $oh_title,
				'sub'    => $oh_sub,
				'ribbon' => true,
			)
		);
		?>

		<ul class="opening-hours-list frame--ornate-sm">
			<?php foreach ( $oh_days as $oh_day ) :
				$d_label = trim( (string) ( $oh_day['label'] ?? '' ) );
				$d_open  = trim( (string) ( $oh_day['open'] ?? '' ) );
				$d_close = trim( (string) ( $oh_day['close'] ?? '' ) );
				if ( '' === $d_label ) {
					continue;
				}

				$d_is_today = array_key_exists( 'day', $oh_day ) && (int) $oh_day['day'] === $oh_today_dow;
				$d_closed   = ( '' === $d_open || '' === $d_close );

				if ( $d_is_today && ! $d_closed && null !== $oh_now_mins ) {
					$open_mins  = $oh_minutes( $d_open );
					$close_mins = $oh_minutes( $d_close );
					if ( null !== $open_mins && null !== $close_mins ) {
						// A close time earlier than the open time runs past midnight.
						$oh_is_open = $close_mins > $open_mins
							? ( $oh_now_mins >= $open_mins && $oh_now_mins < $close_mins )
							: ( $oh_now_mins >= $open_mins || $oh_now_mins < $close_mins );
					}
				}
			?>
				<li class="opening-hours-row<?php echo $d_is_today ? ' opening-hours-row--today' : ''; ?>">
					<span class="opening-hours-row__day">
						<?php echo esc_html( $d_label ); ?>
						<?php if ( $d_is_today ) : ?>
							<span class="opening-hours-row__today-tag"><?php esc_html_e( 'Today', 'vintagesoul' ); ?></span>
						<?php endif; ?>
					</span>
					<span class="opening-hours-row__time<?php echo $d_closed ? ' opening-hours-row__time--closed' : ''; ?>">
						<?php
						echo $d_closed
							? esc_html__( 'Closed', 'vintagesoul' )
							: esc_html( $d_open . ' – ' . $d_close );
						?>
					</span>
				</li>
			<?php endforeach; ?>
		</ul>

		<p class="opening-hours-status">
			<span class="opening-hours-status__dot<?php echo $oh_is_open ? ' is-open' : ''; ?>" aria-hidden="true"></span>
			<strong><?php echo $oh_is_open ? esc_html__( 'Open now', 'vintagesoul' ) : esc_html__( 'Closed right now', 'vintagesoul' ); ?></strong>
		</p>

		<?php if ( '' !== $oh_note ) : ?>
			<p class="opening-hours-note"><?php echo esc_html( $oh_note ); ?></p>
		<?php endif; ?>
	</div>
</section>
