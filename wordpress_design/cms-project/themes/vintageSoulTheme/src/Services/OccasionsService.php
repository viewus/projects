<?php
namespace VintageSoul\Services;

use DateTimeImmutable;
use DateTimeZone;
use Throwable;

defined( 'ABSPATH' ) || exit;

/**
 * OccasionsService — calendar business rules for the Our Occasions page.
 *
 * Deliberately interface-agnostic: plain arrays in, plain arrays out, no
 * WordPress or plugin calls. "Today" is passed in (the caller decides which
 * clock/timezone is authoritative), so the same logic can serve a web page,
 * a REST endpoint or an admin screen without change.
 */
final class OccasionsService {

	/** Calendar weeks start on Monday. */
	private const WEEK_START = 1;

	/**
	 * Normalise raw JSON occasion entries into render-ready items.
	 *
	 * @param array<int, mixed> $raw   Entries from data/content/occasions.json.
	 * @param string            $today Y-m-d in the site timezone.
	 * @return array<int, array<string, mixed>> Sorted oldest-first.
	 */
	public static function prepare_items( array $raw, string $today ): array {
		$today_dt = self::to_date( $today ) ?? new DateTimeImmutable( 'today', new DateTimeZone( 'UTC' ) );
		$items    = array();

		foreach ( $raw as $index => $entry ) {
			$entry = (array) $entry;
			$start = self::to_date( (string) ( $entry['date'] ?? '' ) );
			if ( null === $start ) {
				continue;
			}

			$end = self::to_date( (string) ( $entry['end_date'] ?? '' ) );
			if ( null === $end || $end < $start ) {
				$end = $start;
			}

			$title = trim( (string) ( $entry['title'] ?? '' ) );
			if ( '' === $title ) {
				continue;
			}

			$items[] = array(
				'id'          => self::slug( (string) ( $entry['id'] ?? ( $title . '-' . $index ) ) ),
				'title'       => $title,
				'date'        => $start->format( 'Y-m-d' ),
				'end_date'    => $end->format( 'Y-m-d' ),
				'ym'          => $start->format( 'Y-m' ),
				'day'         => (int) $start->format( 'j' ),
				'days'        => self::days_between( $start, $end ),
				'is_multiday' => $end > $start,
				'is_past'     => $end < $today_dt,
				'is_today'    => $start <= $today_dt && $end >= $today_dt,
				'date_label'  => self::range_label( $start, $end ),
				'short_label' => $start->format( 'j M' ),
				'weekday'     => $start->format( 'D' ),
				'time'        => trim( (string) ( $entry['time'] ?? '' ) ),
				'place'       => trim( (string) ( $entry['place'] ?? '' ) ),
				'address'     => trim( (string) ( $entry['address'] ?? '' ) ),
				'category'    => self::slug( (string) ( $entry['category'] ?? 'all' ) ),
				'badge'       => trim( (string) ( $entry['badge'] ?? '' ) ),
				'text'        => trim( (string) ( $entry['text'] ?? '' ) ),
				'image'       => trim( (string) ( $entry['image'] ?? '' ) ),
				'cta'         => (array) ( $entry['cta'] ?? array() ),
			);
		}

		usort(
			$items,
			static function ( array $a, array $b ): int {
				return strcmp( $a['date'], $b['date'] );
			}
		);

		return $items;
	}

	/**
	 * Build one calendar grid per month that actually has occasions.
	 *
	 * @param array<int, array<string, mixed>> $items Output of prepare_items().
	 * @param string                           $today Y-m-d in the site timezone.
	 * @return array<int, array<string, mixed>>
	 */
	public static function build_months( array $items, string $today ): array {
		$by_day = array();
		$by_ym  = array();

		foreach ( $items as $item ) {
			foreach ( (array) $item['days'] as $day_key ) {
				$by_day[ $day_key ][] = $item['id'];
				$by_ym[ substr( $day_key, 0, 7 ) ] = true;
			}
		}

		$months = array();

		foreach ( array_keys( $by_ym ) as $ym ) {
			$first = self::to_date( $ym . '-01' );
			if ( null === $first ) {
				continue;
			}

			$month_ids = self::ids_in_month( $items, $ym );

			$months[] = array(
				'ym'       => $ym,
				'label'    => $first->format( 'F Y' ),
				'short'    => $first->format( 'M Y' ),
				'weeks'    => self::build_weeks( $first, $by_day, $today ),
				'item_ids' => $month_ids,
				'count'    => count( $month_ids ),
			);
		}

		usort(
			$months,
			static function ( array $a, array $b ): int {
				return strcmp( $a['ym'], $b['ym'] );
			}
		);

		return $months;
	}

	/**
	 * Index of the month to show first: the current month when it has
	 * occasions, otherwise the next upcoming month, otherwise the last one.
	 *
	 * @param array<int, array<string, mixed>> $months
	 */
	public static function active_month_index( array $months, string $today ): int {
		if ( empty( $months ) ) {
			return 0;
		}

		$current_ym = substr( $today, 0, 7 );

		foreach ( $months as $index => $month ) {
			if ( $month['ym'] >= $current_ym ) {
				return (int) $index;
			}
		}

		return count( $months ) - 1;
	}

	/** Weekday column headers, Monday first. */
	public static function weekday_labels(): array {
		return array( 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' );
	}

	/**
	 * @param array<string, array<int, string>> $by_day
	 * @return array<int, array<int, array<string, mixed>>>
	 */
	private static function build_weeks( DateTimeImmutable $first, array $by_day, string $today ): array {
		$days_in_month = (int) $first->format( 't' );
		$lead_blanks   = ( (int) $first->format( 'N' ) ) - self::WEEK_START;
		$cells         = array_fill( 0, max( 0, $lead_blanks ), array( 'day' => 0 ) );

		for ( $day = 1; $day <= $days_in_month; $day++ ) {
			$date_key = $first->format( 'Y-m-' ) . str_pad( (string) $day, 2, '0', STR_PAD_LEFT );
			$ids      = array_values( array_unique( (array) ( $by_day[ $date_key ] ?? array() ) ) );

			$cells[] = array(
				'day'      => $day,
				'date'     => $date_key,
				'item_ids' => $ids,
				'count'    => count( $ids ),
				'is_today' => $date_key === $today,
				'is_past'  => $date_key < $today,
			);
		}

		// Pad the final row so every week is a full seven columns.
		while ( 0 !== count( $cells ) % 7 ) {
			$cells[] = array( 'day' => 0 );
		}

		return array_chunk( $cells, 7 );
	}

	/**
	 * @param array<int, array<string, mixed>> $items
	 * @return array<int, string>
	 */
	private static function ids_in_month( array $items, string $ym ): array {
		$ids = array();
		foreach ( $items as $item ) {
			foreach ( (array) $item['days'] as $day_key ) {
				if ( 0 === strpos( $day_key, $ym ) ) {
					$ids[] = $item['id'];
					break;
				}
			}
		}
		return $ids;
	}

	/** @return array<int, string> Every Y-m-d the occasion covers. */
	private static function days_between( DateTimeImmutable $start, DateTimeImmutable $end ): array {
		$days   = array();
		$cursor = $start;

		// Guard against a runaway range from bad data.
		for ( $i = 0; $i < 366 && $cursor <= $end; $i++ ) {
			$days[] = $cursor->format( 'Y-m-d' );
			$cursor = $cursor->modify( '+1 day' );
		}

		return $days;
	}

	private static function range_label( DateTimeImmutable $start, DateTimeImmutable $end ): string {
		if ( $start->format( 'Y-m-d' ) === $end->format( 'Y-m-d' ) ) {
			return $start->format( 'D j F Y' );
		}

		if ( $start->format( 'Y-m' ) === $end->format( 'Y-m' ) ) {
			return $start->format( 'j' ) . ' - ' . $end->format( 'j F Y' );
		}

		return $start->format( 'j M' ) . ' - ' . $end->format( 'j M Y' );
	}

	private static function to_date( string $value ): ?DateTimeImmutable {
		$value = trim( $value );
		if ( '' === $value ) {
			return null;
		}

		try {
			$date = new DateTimeImmutable( $value, new DateTimeZone( 'UTC' ) );
		} catch ( Throwable $e ) {
			return null;
		}

		return $date->setTime( 0, 0, 0 );
	}

	private static function slug( string $value ): string {
		$value = strtolower( trim( $value ) );
		$value = preg_replace( '/[^a-z0-9]+/', '-', $value );
		return trim( (string) $value, '-' );
	}
}
