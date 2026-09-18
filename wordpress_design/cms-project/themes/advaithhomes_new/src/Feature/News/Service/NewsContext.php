<?php
namespace Adn\Theme\Service;

defined( 'ABSPATH' ) || exit;

/**
 * NewsContext - Builds context for the news listing page.
 * Split into small focused methods.
 */
class NewsContext {

	// ── Cache helpers ───────────────────────────────────────────
	private static function cacheGet( string $key ) {
		if ( class_exists( 'ADN_Cache' ) ) {
			return \ADN_Cache::get( $key, 'pages' );
		}
		return false;
	}

	private static function cacheSet( string $key, array $ctx ): void {
		if ( class_exists( 'ADN_Cache' ) ) {
			\ADN_Cache::set( $key, $ctx, 'pages', get_option( 'ah_cache_expiry', 3600 ) );
		}
	}

	// ── Hero section ────────────────────────────────────────────
	public static function buildHero( array $data ): array {
		return $data['hero'] ?? array();
	}

	// ── Categories section ──────────────────────────────────────
	public static function buildCategories( array $nb_rows ): array {
		$categories = array(
			array( 'key' => 'all', 'label' => sprintf( SITE_LABEL_ALL_PREFIX, SITE_NEWS_NOUN ), 'count' => '' ),
		);
		$_seen = array();
		foreach ( $nb_rows as $_li ) {
			$_lbl = trim( (string) ( $_li->label ?? '' ) );
			if ( '' === $_lbl ) { continue; }
			$_key = sanitize_key( $_lbl );
			if ( isset( $_seen[ $_key ] ) ) {
				$_seen[ $_key ]['count']++;
			} else {
				$_seen[ $_key ] = array( 'key' => $_key, 'label' => $_lbl, 'count' => 1 );
			}
		}
		uasort( $_seen, static function ( $a, $b ) {
			return ( $b['count'] ?? 0 ) <=> ( $a['count'] ?? 0 );
		} );
		foreach ( $_seen as $_ldata ) {
			$categories[] = $_ldata;
		}
		return $categories;
	}

	// ── Featured section ────────────────────────────────────────
	public static function buildFeatured( array $nb_rows ): array {
		if ( empty( $nb_rows ) ) { return array(); }
		return self::newsbarFeatured( $nb_rows[0] );
	}

	// ── News grid sections ──────────────────────────────────────
	public static function buildSections( array $nb_rows ): array {
		$sections = array();
		if ( count( $nb_rows ) > 1 ) {
			$rest = array_slice( $nb_rows, 1 );
			$sections[] = array(
				'type'       => 'grid',
				'heading'    => sprintf( SITE_LABEL_ALL_PREFIX, SITE_NEWS_NOUN ),
				'link_label' => '',
				'link_url'   => '',
				'items'      => self::newsbarGridItems( $rest ),
			);
		}
		return $sections;
	}

	// ── Main getContext ─────────────────────────────────────────
	/**
	 * @param string|null $sidebar_builder SidebarBuilder class name or null for default.
	 */
	public static function getContext( $sidebar_builder = null ) {
		$sidebar_builder = $sidebar_builder ?: \Adn\Theme\Shared\SidebarBuilder::class;
		$cache_key = 'page_news_context_v2';
		$cached = self::cacheGet( $cache_key );
		if ( false !== $cached ) {
			return $cached;
		}

		$data   = function_exists( 'adn_service_news_data' )   ? adn_service_news_data()   : array();
		$chrome = function_exists( 'adn_service_site_chrome' ) ? adn_service_site_chrome() : array();

		$nb_rows = array();
		if ( function_exists( 'adn_cms_newsbar_items' ) ) {
			$nb_rows = adn_cms_newsbar_items( 100 );
		}

		$ctx = array(
			'meta'              => $data['meta'] ?? array(),
			'breadcrumb'        => $data['breadcrumb'] ?? array(),
			'hero'              => self::buildHero( $data ),
			'categories'        => self::buildCategories( $nb_rows ),
			'featured'          => self::buildFeatured( $nb_rows ),
			'sections'          => self::buildSections( $nb_rows ),
			'sidebar'           => $data['sidebar'] ?? array(),
			'bottom_newsletter' => $data['bottom_newsletter'] ?? array(),
			'chrome'            => $chrome,
		);

		$ctx['sidebar']['topics']       = $sidebar_builder::browseTopics( 12 );
		$ctx['sidebar']['recent_news'] = $sidebar_builder::sidebarRecentNews( 5 );

		self::cacheSet( $cache_key, $ctx );
		return $ctx;
	}

	// ── Newsbar item thumbnail helper ───────────────────────────
	public static function newsbarItemThumb( $image_id, $size = 'medium' ) {
		if ( empty( $image_id ) ) { return ''; }
		$_u = wp_get_attachment_image_url( (int) $image_id, $size );
		return $_u ? (string) $_u : '';
	}

	// ── Newsbar featured item ───────────────────────────────────
	public static function newsbarFeatured( $item ) {
		if ( empty( $item ) ) { return array(); }
		$_thumb = '';
		if ( ! empty( $item->image_id ) ) {
			$_tu = wp_get_attachment_image_url( (int) $item->image_id, 'large' );
			$_thumb = $_tu ? (string) $_tu : '';
		}
		return array(
			'title'       => $item->text ?? '',
			'description' => wp_strip_all_tags( (string) ( $item->content ?? '' ) ),
			'date'        => ! empty( $item->created_at ) ? date_i18n( 'M jS, Y', strtotime( $item->created_at ) ) : '',
			'tag'         => (string) ( $item->label ?? '' ),
			'thumbnail'   => $_thumb,
			'url'         => function_exists( 'adn_newsbar_item_url' ) ? adn_newsbar_item_url( $item->id, $item->slug ?? '' ) : '#',
		);
	}

	// ── Newsbar grid items ──────────────────────────────────────
	public static function newsbarGridItems( array $items ) {
		$result = array();
		foreach ( $items as $i => $item ) {
			$title = $item->text ?? '';
			if ( '' === $title ) { continue; }
			$_thumb = '';
			if ( ! empty( $item->image_id ) ) {
				$_tu = wp_get_attachment_image_url( (int) $item->image_id, 'medium' );
				$_thumb = $_tu ? (string) $_tu : '';
			}
			$stamp = $item->created_at ?? '';
			$result[] = array(
				'title'       => $title,
				'description' => wp_strip_all_tags( (string) ( $item->content ?? '' ) ),
				'date'        => $stamp ? date_i18n( 'M jS', strtotime( $stamp ) ) : '',
				'date_full'   => $stamp ? date_i18n( 'M jS, Y', strtotime( $stamp ) ) : '',
				'tag'         => (string) ( $item->label ?? '' ),
				'gradient'    => function_exists( 'adn_cms_gradient' ) ? adn_cms_gradient( $i ) : '',
				'thumbnail'   => $_thumb,
				'url'         => function_exists( 'adn_newsbar_item_url' ) ? adn_newsbar_item_url( $item->id, $item->slug ?? '' ) : '#',
			);
		}
		return $result;
	}
}
