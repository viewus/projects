<?php
/**
 * Live Vintage Time, Weather & Location Widget
 *
 * Shows the visitor's local 24-hour time, live weather, and the shop
 * location. The location comes from CMS Site Settings (contact_address) so
 * it is editable in the admin rather than baked into this template; pass a
 * `location` prop to show a shorter form than the full address.
 *
 * Props:
 *   location (string) - overrides the CMS address for this instance
 *
 * @package VintageSoulTheme
 */

defined( 'ABSPATH' ) || exit;

use VintageSoul\Services\SettingsService;

$badge_location = isset( $location ) && '' !== trim( (string) $location )
	? trim( (string) $location )
	: SettingsService::address();
?>
<div class="vst-live-badge" id="vst-header-live-badge" title="<?php esc_attr_e( 'Live Local Time & Weather', 'vintagesoul' ); ?>">
	<div class="vst-live-badge__inner">
		<!-- Pulsing Live Ambient Dot -->
		<span class="vst-live-badge__pulse" aria-hidden="true"></span>

		<?php if ( '' !== $badge_location ) : ?>
			<!-- Location (CMS Site Settings) -->
			<span class="vst-live-badge__item vst-live-badge__location" id="vst-live-location">
				<span class="vst-live-badge__icon" aria-hidden="true">📍</span>
				<span class="vst-live-badge__text"><?php echo esc_html( $badge_location ); ?></span>
			</span>

			<span class="vst-live-badge__divider" aria-hidden="true">•</span>
		<?php endif; ?>

		<!-- Dynamic Weather -->
		<span class="vst-live-badge__item vst-live-badge__weather" id="vst-live-weather">
			<span class="vst-live-badge__icon" id="vst-weather-icon" aria-hidden="true">☀️</span>
			<span class="vst-live-badge__text" id="vst-weather-text">21°C</span>
		</span>

		<span class="vst-live-badge__divider" aria-hidden="true">•</span>

		<!-- 24-Hour Local Time (Hours & Minutes Only) -->
		<span class="vst-live-badge__item vst-live-badge__time-box">
			<span class="vst-live-badge__icon" aria-hidden="true">⏱️</span>
			<strong class="vst-live-badge__time" id="vst-live-time">00:00</strong>
		</span>
	</div>
</div>
