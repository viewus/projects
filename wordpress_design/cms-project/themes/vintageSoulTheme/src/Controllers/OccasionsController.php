<?php
namespace VintageSoul\Controllers;

use VintageSoul\DataProviders\JsonFileProvider;
use VintageSoul\Services\OccasionsService;
use VintageSoul\Services\PluginBridgeService;
use VintageSoul\Services\Plugins\PageBridgeService;
use VintageSoul\Services\RouteService;
use VintageSoul\Support\UrlHelper;

defined( 'ABSPATH' ) || exit;

/**
 * OccasionsController — page data for Our Occasions (the dated diary).
 *
 * Content comes from data/content/occasions.json; the calendar grids come
 * from OccasionsService; "today" comes from the CMS Global Settings
 * timezone via PluginBridgeService, so the highlighted day matches the
 * site clock rather than the server one.
 */
final class OccasionsController {

	public function prepare(): array {
		$data  = JsonFileProvider::read( 'data/content/occasions.json' );
		$today = (string) PluginBridgeService::format_datetime( 'now', 'Y-m-d' );

		$items  = OccasionsService::prepare_items( (array) ( $data['items'] ?? array() ), $today );
		$items  = $this->resolve_links( $items );

		$hero_raw = (array) ( $data['hero'] ?? array() );
		if ( ! empty( $hero_raw['image'] ) ) {
			$hero_raw['image'] = UrlHelper::resolve( (string) $hero_raw['image'] );
		}

		$upcoming = array_values(
			array_filter(
				$items,
				static function ( array $item ): bool {
					return empty( $item['is_past'] );
				}
			)
		);

		$past = array_values(
			array_filter(
				$items,
				static function ( array $item ): bool {
					return ! empty( $item['is_past'] );
				}
			)
		);

		// The page only lists upcoming occasions, so the calendar marks only
		// those days too - a dot linking to a card that is not on the page
		// would be a dead end.
		$months = OccasionsService::build_months( $upcoming, $today );

		return array(
			'hero'         => PageBridgeService::resolve_hero( 'occasions', $hero_raw ),
			'intro'        => (array) ( $data['intro'] ?? array() ),
			'categories'   => $this->resolve_categories( (array) ( $data['categories'] ?? array() ), $items ),
			'items'        => $items,
			'upcoming'     => $upcoming,
			'past'         => array_reverse( $past ),
			'next'         => $upcoming[0] ?? null,
			'months'       => $months,
			'active_month' => OccasionsService::active_month_index( $months, $today ),
			'weekdays'     => OccasionsService::weekday_labels(),
			'today'        => $today,
			'empty_text'   => (string) ( $data['empty_text'] ?? '' ),
			'cta'          => (array) ( $data['cta'] ?? array() ),
		);
	}

	/**
	 * Turn each occasion's stored image path and CTA route into real URLs,
	 * so the template only ever prints values.
	 *
	 * @param array<int, array<string, mixed>> $items
	 * @return array<int, array<string, mixed>>
	 */
	private function resolve_links( array $items ): array {
		foreach ( $items as &$item ) {
			if ( '' !== (string) $item['image'] ) {
				$item['image'] = UrlHelper::resolve( (string) $item['image'] );
			}

			$cta       = (array) $item['cta'];
			$cta_label = trim( (string) ( $cta['label'] ?? '' ) );
			$cta_url   = '';

			if ( '' !== $cta_label ) {
				$cta_url = ! empty( $cta['url'] )
					? (string) $cta['url']
					: RouteService::url( (string) ( $cta['route'] ?? 'contact' ) );
			}

			$item['cta'] = array(
				'label'    => $cta_label,
				'url'      => $cta_url,
				'external' => '' !== $cta_url && 0 === strpos( $cta_url, 'http' ) && false === strpos( $cta_url, (string) wp_parse_url( home_url(), PHP_URL_HOST ) ),
			);
		}
		unset( $item );

		return $items;
	}

	/**
	 * Keep only the filter categories that actually have occasions, and
	 * attach a count to each - an empty filter pill is just noise.
	 *
	 * @param array<int, mixed>                $categories
	 * @param array<int, array<string, mixed>> $items
	 * @return array<int, array<string, mixed>>
	 */
	private function resolve_categories( array $categories, array $items ): array {
		$counts = array();
		foreach ( $items as $item ) {
			$key            = (string) $item['category'];
			$counts[ $key ] = ( $counts[ $key ] ?? 0 ) + 1;
		}

		$resolved = array();
		foreach ( $categories as $category ) {
			$category = (array) $category;
			$id       = trim( (string) ( $category['id'] ?? '' ) );
			$label    = trim( (string) ( $category['label'] ?? '' ) );
			if ( '' === $id || '' === $label ) {
				continue;
			}

			$count = 'all' === $id ? count( $items ) : (int) ( $counts[ $id ] ?? 0 );
			if ( 0 === $count ) {
				continue;
			}

			$resolved[] = array(
				'id'    => $id,
				'label' => $label,
				'count' => $count,
			);
		}

		return $resolved;
	}
}
