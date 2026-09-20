<?php

namespace Adn\Theme\Helper;

defined( 'ABSPATH' ) || exit;

class IconHelper {

	public static function render( string $icon, string $class = '' ): string {
		$icon = trim( $icon );
		if ( '' === $icon ) {
			return '';
		}

		$icon_lower = strtolower( $icon );
		if ( 'translate' === $icon_lower || 'language' === $icon_lower ) {
			return '<svg class="ah-ico ah-ico-translate ' . esc_attr( $class ) . '" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>';
		}

		if ( false !== strpos( $icon, 'fa-' ) ) {
			$has_style = ( false !== strpos( $icon, 'fa-solid' ) || false !== strpos( $icon, 'fa-regular' ) || false !== strpos( $icon, 'fa-brands' ) );
			$cls       = $has_style ? $icon : 'fa-solid ' . $icon;
			return '<i class="ah-ico ' . esc_attr( trim( $cls . ' ' . $class ) ) . '" aria-hidden="true"></i>';
		}

		$map = self::emojiMap();
		if ( isset( $map[ $icon ] ) ) {
			return '<i class="ah-ico ' . esc_attr( trim( $map[ $icon ] . ' ' . $class ) ) . '" aria-hidden="true"></i>';
		}

		static $text_map = null;
		if ( null === $text_map ) {
			$text_map = array(
				'home'       => 'fa-solid fa-house',
				'house'      => 'fa-solid fa-house',
				'search'     => 'fa-solid fa-magnifying-glass',
				'key'        => 'fa-solid fa-key',
				'star'       => 'fa-solid fa-star',
				'money'      => 'fa-solid fa-coins',
				'coins'      => 'fa-solid fa-coins',
				'phone'      => 'fa-solid fa-phone',
				'email'      => 'fa-solid fa-envelope',
				'envelope'   => 'fa-solid fa-envelope',
				'calendar'   => 'fa-solid fa-calendar-days',
				'location'   => 'fa-solid fa-location-dot',
				'pin'        => 'fa-solid fa-location-dot',
				'building'   => 'fa-solid fa-building-columns',
				'bank'       => 'fa-solid fa-building-columns',
				'check'      => 'fa-solid fa-circle-check',
				'tick'       => 'fa-solid fa-circle-check',
				'info'       => 'fa-solid fa-circle-info',
				'user'       => 'fa-solid fa-user',
				'users'      => 'fa-solid fa-users',
				'people'     => 'fa-solid fa-users',
				'document'   => 'fa-solid fa-file-lines',
				'file'       => 'fa-solid fa-file-lines',
				'clipboard'  => 'fa-solid fa-clipboard',
				'shield'     => 'fa-solid fa-shield-halved',
				'handshake'  => 'fa-solid fa-handshake',
				'deal'       => 'fa-solid fa-handshake',
				'chart'      => 'fa-solid fa-chart-line',
				'graph'      => 'fa-solid fa-chart-line',
				'lightbulb'  => 'fa-solid fa-lightbulb',
				'idea'       => 'fa-solid fa-lightbulb',
				'truck'      => 'fa-solid fa-truck',
				'move'       => 'fa-solid fa-truck',
				'pen'        => 'fa-solid fa-pen-to-square',
				'edit'       => 'fa-solid fa-pen-to-square',
				'clock'      => 'fa-solid fa-clock',
				'time'       => 'fa-solid fa-clock',
				'calculator' => 'fa-solid fa-calculator',
				'calc'       => 'fa-solid fa-calculator',
				'fire'       => 'fa-solid fa-fire',
				'gift'       => 'fa-solid fa-gift',
				'tag'        => 'fa-solid fa-tag',
				'map'        => 'fa-solid fa-map',
				'ruler'      => 'fa-solid fa-ruler-combined',
				'newspaper'  => 'fa-solid fa-newspaper',
				'news'       => 'fa-solid fa-newspaper',
				'box'        => 'fa-solid fa-box',
				'credit'     => 'fa-solid fa-credit-card',
				'card'       => 'fa-solid fa-credit-card',
				'mobile'     => 'fa-solid fa-mobile-screen',
				'globe'      => 'fa-solid fa-earth-europe',
				'world'      => 'fa-solid fa-earth-europe',
				'helmet'     => 'fa-solid fa-helmet-safety',
				'construct'  => 'fa-solid fa-helmet-safety',
				'scale'      => 'fa-solid fa-scale-balanced',
				'law'        => 'fa-solid fa-scale-balanced',
			);
		}
		$icon_lower = strtolower( $icon );
		if ( isset( $text_map[ $icon_lower ] ) ) {
			return '<i class="ah-ico ' . esc_attr( trim( $text_map[ $icon_lower ] . ' ' . $class ) ) . '" aria-hidden="true"></i>';
		}

		return $icon;
	}

	public static function emojiMap(): array {
		static $map = null;
		if ( null !== $map ) {
			return $map;
		}
		$map = apply_filters( 'adn_icon_emoji_map', array(
			'🏠'  => 'fa-solid fa-house',
			'🏡'  => 'fa-solid fa-house-chimney',
			'🏢'  => 'fa-solid fa-building',
			'👤'  => 'fa-solid fa-user',
			'👥'  => 'fa-solid fa-users',
			'🤝'  => 'fa-solid fa-handshake',
			'🧮'  => 'fa-solid fa-calculator',
			'💳'  => 'fa-solid fa-credit-card',
			'💰'  => 'fa-solid fa-coins',
			'📋'  => 'fa-solid fa-clipboard',
			'📝'  => 'fa-solid fa-pen-to-square',
			'📄'  => 'fa-solid fa-file-lines',
			'📰'  => 'fa-solid fa-newspaper',
			'✉️'  => 'fa-solid fa-envelope',
			'📧'  => 'fa-solid fa-envelope',
			'🔔'  => 'fa-solid fa-bell',
			'💡'  => 'fa-solid fa-lightbulb',
			'🚗'  => 'fa-solid fa-car',
			'✈️'  => 'fa-solid fa-plane',
			'🏥'  => 'fa-solid fa-hospital',
			'💊'  => 'fa-solid fa-pills',
			'🌍'  => 'fa-solid fa-earth-europe',
			'🌳'  => 'fa-solid fa-tree',
			'🔥'  => 'fa-solid fa-fire',
			'🔧'  => 'fa-solid fa-wrench',
			'🔑'  => 'fa-solid fa-key',
			'📅'  => 'fa-solid fa-calendar-days',
			'🕐'  => 'fa-solid fa-clock',
			'📊'  => 'fa-solid fa-chart-column',
			'🔍'  => 'fa-solid fa-magnifying-glass',
			'⭐'  => 'fa-solid fa-star',
			'🏆'  => 'fa-solid fa-trophy',
			'📚'  => 'fa-solid fa-book',
			'✅'  => 'fa-solid fa-circle-check',
			'⏱'  => 'fa-solid fa-stopwatch',
			'✓'   => 'fa-solid fa-check',
			'◎'   => 'fa-brands fa-instagram',
			'≡'   => 'fa-solid fa-bars',
			'f'   => 'fa-brands fa-facebook-f',
			'in'  => 'fa-brands fa-linkedin-in',
			'▶'   => 'fa-brands fa-youtube',
		) );
		return $map;
	}
}
