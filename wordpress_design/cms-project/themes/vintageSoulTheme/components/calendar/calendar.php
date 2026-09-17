<?php
/**
 * VintageSoulTheme - Vintage Month Calendar
 *
 * Renders one grid per month supplied. Days that carry occasions are real
 * anchors to the matching card below, so the whole calendar works with
 * JavaScript switched off (every month is visible in that case); the
 * calendar script only adds month switching, smooth scroll and highlight.
 *
 * Props:
 *   months   (array) - from OccasionsService::build_months()
 *   weekdays (array) - column headers, Monday first
 *   active   (int)   - index of the month shown first
 *   lookup   (array) - id => occasion, used for day tooltips
 *   id       (string)- unique instance id
 */

defined( 'ABSPATH' ) || exit;

$cal_months   = isset( $months ) && is_array( $months ) ? $months : array();
$cal_weekdays = isset( $weekdays ) && is_array( $weekdays ) ? $weekdays : array();
$cal_lookup   = isset( $lookup ) && is_array( $lookup ) ? $lookup : array();
$cal_active   = isset( $active ) ? max( 0, (int) $active ) : 0;
$cal_id       = ( isset( $id ) && '' !== trim( (string) $id ) ) ? sanitize_html_class( (string) $id ) : 'vs-calendar';

if ( empty( $cal_months ) ) {
	return;
}

$cal_active = min( $cal_active, count( $cal_months ) - 1 );
?>
<div class="vs-calendar frame--ornate-sm" id="<?php echo esc_attr( $cal_id ); ?>" data-vs-calendar data-active="<?php echo esc_attr( (string) $cal_active ); ?>">

	<!-- Month bar: prev / label / next -->
	<div class="vs-calendar__bar">
		<button type="button" class="vs-calendar__nav vs-calendar__nav--prev" data-calendar-prev aria-label="<?php esc_attr_e( 'Previous month', 'vintagesoul' ); ?>">
			<span aria-hidden="true">&larr;</span>
		</button>

		<p class="vs-calendar__label" data-calendar-label aria-live="polite">
			<?php echo esc_html( (string) ( $cal_months[ $cal_active ]['label'] ?? '' ) ); ?>
		</p>

		<button type="button" class="vs-calendar__nav vs-calendar__nav--next" data-calendar-next aria-label="<?php esc_attr_e( 'Next month', 'vintagesoul' ); ?>">
			<span aria-hidden="true">&rarr;</span>
		</button>
	</div>

	<!-- Jump straight to any month that has occasions -->
	<div class="vs-calendar__months" role="group" aria-label="<?php esc_attr_e( 'Months with occasions', 'vintagesoul' ); ?>">
		<?php foreach ( $cal_months as $m_index => $cal_month ) : ?>
			<button
				type="button"
				class="vs-calendar__month-pill<?php echo (int) $m_index === $cal_active ? ' is-active' : ''; ?>"
				data-calendar-month="<?php echo esc_attr( (string) $m_index ); ?>"
				aria-pressed="<?php echo (int) $m_index === $cal_active ? 'true' : 'false'; ?>">
				<?php echo esc_html( (string) ( $cal_month['short'] ?? '' ) ); ?>
				<span class="vs-calendar__month-count"><?php echo esc_html( (string) (int) ( $cal_month['count'] ?? 0 ) ); ?></span>
			</button>
		<?php endforeach; ?>
	</div>

	<!-- One grid per month -->
	<?php foreach ( $cal_months as $g_index => $cal_month ) : ?>
		<table class="vs-calendar__grid<?php echo (int) $g_index === $cal_active ? ' is-active' : ''; ?>" data-calendar-grid="<?php echo esc_attr( (string) $g_index ); ?>">
			<caption class="screen-reader-text"><?php echo esc_html( (string) ( $cal_month['label'] ?? '' ) ); ?></caption>
			<thead>
				<tr>
					<?php foreach ( $cal_weekdays as $cal_weekday ) : ?>
						<th scope="col"><abbr title="<?php echo esc_attr( (string) $cal_weekday ); ?>"><?php echo esc_html( mb_substr( (string) $cal_weekday, 0, 1 ) ); ?></abbr></th>
					<?php endforeach; ?>
				</tr>
			</thead>
			<tbody>
				<?php foreach ( (array) ( $cal_month['weeks'] ?? array() ) as $cal_week ) : ?>
					<tr>
						<?php foreach ( (array) $cal_week as $cal_cell ) :
							$c_day   = (int) ( $cal_cell['day'] ?? 0 );
							$c_ids   = (array) ( $cal_cell['item_ids'] ?? array() );
							$c_count = count( $c_ids );
							$c_first = (string) ( $c_ids[0] ?? '' );

							$c_classes = array( 'vs-calendar__cell' );
							if ( 0 === $c_day ) {
								$c_classes[] = 'vs-calendar__cell--blank';
							}
							if ( $c_count > 0 ) {
								$c_classes[] = 'has-occasion';
							}
							if ( ! empty( $cal_cell['is_today'] ) ) {
								$c_classes[] = 'is-today';
							}
							if ( ! empty( $cal_cell['is_past'] ) ) {
								$c_classes[] = 'is-past';
							}

							$c_title = '';
							if ( $c_count > 0 ) {
								$c_names = array();
								foreach ( $c_ids as $c_id ) {
									$c_names[] = (string) ( $cal_lookup[ $c_id ]['title'] ?? '' );
								}
								$c_title = implode( ' · ', array_filter( $c_names ) );
							}
						?>
							<td class="<?php echo esc_attr( implode( ' ', $c_classes ) ); ?>">
								<?php if ( 0 === $c_day ) : ?>
									<span class="vs-calendar__day vs-calendar__day--blank" aria-hidden="true"></span>
								<?php elseif ( $c_count > 0 ) : ?>
									<a class="vs-calendar__day"
										href="#occasion-<?php echo esc_attr( $c_first ); ?>"
										data-calendar-day="<?php echo esc_attr( (string) ( $cal_cell['date'] ?? '' ) ); ?>"
										data-occasion-target="<?php echo esc_attr( $c_first ); ?>"
										title="<?php echo esc_attr( $c_title ); ?>">
										<span class="vs-calendar__num"><?php echo esc_html( (string) $c_day ); ?></span>
										<span class="vs-calendar__dots" aria-hidden="true">
											<?php for ( $d = 0; $d < min( $c_count, 3 ); $d++ ) : ?>
												<span class="vs-calendar__dot"></span>
											<?php endfor; ?>
										</span>
										<span class="screen-reader-text"><?php echo esc_html( $c_title ); ?></span>
									</a>
								<?php else : ?>
									<span class="vs-calendar__day vs-calendar__day--empty"><?php echo esc_html( (string) $c_day ); ?></span>
								<?php endif; ?>
							</td>
						<?php endforeach; ?>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	<?php endforeach; ?>

	<p class="vs-calendar__legend">
		<span class="vs-calendar__legend-key"><span class="vs-calendar__dot" aria-hidden="true"></span><?php esc_html_e( 'Occasion booked', 'vintagesoul' ); ?></span>
		<span class="vs-calendar__legend-key"><span class="vs-calendar__legend-today" aria-hidden="true"></span><?php esc_html_e( 'Today', 'vintagesoul' ); ?></span>
	</p>
</div>
