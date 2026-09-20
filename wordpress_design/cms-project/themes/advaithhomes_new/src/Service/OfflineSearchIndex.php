<?php
namespace Adn\Theme\Service;

defined( 'ABSPATH' ) || exit;

/**
 * OfflineSearchIndex - Compiles all site content into a lightweight,
 * tokenized client-side search index for instant offline search and filtering.
 */
class OfflineSearchIndex {

	private const CACHE_KEY = 'adn_offline_search_index_v1';
	private const CACHE_TTL = 7200; // 2 hours

	/**
	 * Get the complete offline index array.
	 *
	 * @return array
	 */
	public static function getIndex(): array {
		if ( class_exists( '\ADN_Cache' ) ) {
			$cached = \ADN_Cache::get( self::CACHE_KEY, 'search' );
			if ( false !== $cached && is_array( $cached ) ) {
				return $cached;
			}
		}

		$index = self::buildIndex();

		if ( class_exists( '\ADN_Cache' ) ) {
			\ADN_Cache::set( self::CACHE_KEY, $index, 'search', self::CACHE_TTL );
		}

		return $index;
	}

	/**
	 * Build the searchable items collection.
	 *
	 * @return array
	 */
	public static function buildIndex(): array {
		$items = array();

		// 1. Guides & Articles (CMS articles + WP Posts)
		$items = array_merge( $items, self::collectGuides() );

		// 2. Guide Parent Topics
		$items = array_merge( $items, self::collectTopics() );

		// 3. Calculators & Tools
		$items = array_merge( $items, self::collectTools() );

		// 4. News & Insights
		$items = array_merge( $items, self::collectNews() );

		// 5. FAQs
		$items = array_merge( $items, self::collectFaqs() );

		return array(
			'version'   => defined( 'LOCAL_CACHE_VERSION' ) ? LOCAL_CACHE_VERSION : time(),
			'generated' => current_time( 'mysql' ),
			'total'     => count( $items ),
			'items'     => $items,
		);
	}

	/**
	 * Collect Guides and Articles
	 */
	private static function collectGuides(): array {
		$list = array();
		$seen_ids = array();

		// CMS Articles
		if ( function_exists( 'adn_cms_articles' ) ) {
			$articles = adn_cms_articles( 200 );
			foreach ( $articles as $a ) {
				$id = isset( $a->ID ) ? (int) $a->ID : 0;
				if ( ! $id || isset( $seen_ids[ $id ] ) ) { continue; }
				$seen_ids[ $id ] = true;

				$title = isset( $a->title ) ? (string) $a->title : '';
				if ( '' === $title ) { continue; }

				$excerpt = isset( $a->excerpt ) ? (string) $a->excerpt : '';
				$cat     = isset( $a->category_name ) ? (string) $a->category_name : 'Guide';

				$list[] = array(
					'id'       => 'guide_' . $id,
					'type'     => 'guide',
					'badge'    => '📖 Guide',
					'title'    => $title,
					'desc'     => wp_trim_words( wp_strip_all_tags( $excerpt ), 16 ),
					'category' => $cat,
					'keywords' => self::extractKeywords( $title . ' ' . $cat . ' ' . $excerpt ),
					'url'      => get_permalink( $id ) ?: home_url( '/' . ( $a->slug ?? '' ) . '/' ),
				);
			}
		}

		// WP Posts fallback/merge
		$q = new \WP_Query( array(
			'post_type'      => 'post',
			'post_status'    => 'publish',
			'posts_per_page' => 100,
			'no_found_rows'  => true,
		) );

		foreach ( $q->posts as $p ) {
			if ( isset( $seen_ids[ $p->ID ] ) ) { continue; }
			$seen_ids[ $p->ID ] = true;

			$title   = (string) $p->post_title;
			$excerpt = (string) ( $p->post_excerpt ?: wp_trim_words( $p->post_content, 16 ) );
			$cats    = get_the_category( $p->ID );
			$cat     = ! empty( $cats[0]->name ) ? $cats[0]->name : 'Article';

			$list[] = array(
				'id'       => 'post_' . $p->ID,
				'type'     => 'article',
				'badge'    => '📄 Article',
				'title'    => $title,
				'desc'     => wp_trim_words( wp_strip_all_tags( $excerpt ), 16 ),
				'category' => $cat,
				'keywords' => self::extractKeywords( $title . ' ' . $cat . ' ' . $excerpt ),
				'url'      => get_permalink( $p->ID ),
			);
		}
		wp_reset_postdata();

		return $list;
	}

	/**
	 * Collect Topics
	 */
	private static function collectTopics(): array {
		$list = array();
		if ( ! function_exists( 'adn_cms_guide_parents' ) ) {
			return $list;
		}

		foreach ( adn_cms_guide_parents( 50 ) as $pt ) {
			$name = isset( $pt->name ) ? (string) $pt->name : '';
			$slug = isset( $pt->slug ) ? (string) $pt->slug : '';
			if ( '' === $name || '' === $slug ) { continue; }

			$desc = isset( $pt->description ) ? (string) $pt->description : '';

			$list[] = array(
				'id'       => 'topic_' . ( $pt->id ?? $slug ),
				'type'     => 'topic',
				'badge'    => '📚 Topic',
				'title'    => $name,
				'desc'     => wp_trim_words( wp_strip_all_tags( $desc ), 14 ),
				'category' => 'Topics',
				'keywords' => self::extractKeywords( $name . ' ' . $desc . ' topic category' ),
				'url'      => home_url( '/' . trim( $slug, '/' ) . '/' ),
			);
		}

		return $list;
	}

	/**
	 * Collect Calculators & Tools
	 */
	private static function collectTools(): array {
		$list = array();
		if ( ! function_exists( 'adn_calculators' ) ) {
			return $list;
		}

		$meta_all = get_option( 'adn_calculators_meta', array() );
		foreach ( adn_calculators() as $key => $reg ) {
			$meta = isset( $meta_all[ $key ] ) && is_array( $meta_all[ $key ] ) ? $meta_all[ $key ] : array();
			if ( ! empty( $meta['hidden_from_listing'] ) || ( array_key_exists( 'enabled', $meta ) && empty( $meta['enabled'] ) ) ) {
				continue;
			}

			$title = ! empty( $meta['label'] ) ? (string) $meta['label'] : ( ! empty( $reg['title'] ) ? (string) $reg['title'] : $key );
			$desc  = ! empty( $meta['description'] ) ? (string) $meta['description'] : ( ! empty( $reg['description'] ) ? (string) $reg['description'] : '' );
			$url   = ! empty( $meta['card_url'] ) ? (string) $meta['card_url'] : ( function_exists( 'adn_calc_page_url' ) ? adn_calc_page_url( $key ) : home_url( '/tools/' ) );

			$list[] = array(
				'id'       => 'tool_' . $key,
				'type'     => 'tool',
				'badge'    => '🧮 Tool',
				'title'    => $title,
				'desc'     => wp_trim_words( wp_strip_all_tags( $desc ), 14 ),
				'category' => 'Calculators & Tools',
				'keywords' => self::extractKeywords( $title . ' ' . $desc . ' calculator tool finance mortgage rate' ),
				'url'      => $url,
			);
		}

		return $list;
	}

	/**
	 * Collect News Items
	 */
	private static function collectNews(): array {
		$list = array();
		if ( ! function_exists( 'adn_cms_newsbar_items' ) ) {
			return $list;
		}

		foreach ( adn_cms_newsbar_items( 60 ) as $ni ) {
			$title = isset( $ni->text ) ? (string) $ni->text : '';
			if ( '' === $title ) { continue; }

			$content = isset( $ni->content ) ? (string) $ni->content : '';
			$lbl     = isset( $ni->label ) && '' !== trim( (string) $ni->label ) ? trim( (string) $ni->label ) : 'News';
			$url     = function_exists( 'adn_newsbar_item_url' ) ? adn_newsbar_item_url( (int) $ni->id, isset( $ni->slug ) ? (string) $ni->slug : '' ) : '#';

			$list[] = array(
				'id'       => 'news_' . ( $ni->id ?? 0 ),
				'type'     => 'news',
				'badge'    => '📰 News',
				'title'    => $title,
				'desc'     => wp_trim_words( wp_strip_all_tags( $content ), 14 ),
				'category' => $lbl,
				'keywords' => self::extractKeywords( $title . ' ' . $lbl . ' ' . $content ),
				'url'      => $url,
			);
		}

		return $list;
	}

	/**
	 * Collect FAQs
	 */
	private static function collectFaqs(): array {
		$list = array();
		if ( ! class_exists( '\AH_Faqs_Model' ) ) {
			return $list;
		}

		try {
			$m = new \AH_Faqs_Model();
			$faqs = is_array( $m->get_global() ) ? $m->get_global() : array();
			foreach ( $faqs as $i => $faq ) {
				$q = isset( $faq['question'] ) ? (string) $faq['question'] : ( isset( $faq['q'] ) ? (string) $faq['q'] : '' );
				$a = isset( $faq['answer'] ) ? (string) $faq['answer'] : ( isset( $faq['a'] ) ? (string) $faq['a'] : '' );
				if ( '' === $q ) { continue; }

				$list[] = array(
					'id'       => 'faq_' . $i,
					'type'     => 'faq',
					'badge'    => '❓ FAQ',
					'title'    => $q,
					'desc'     => wp_trim_words( wp_strip_all_tags( $a ), 14 ),
					'category' => 'FAQs',
					'keywords' => self::extractKeywords( $q . ' ' . $a . ' faq help question' ),
					'url'      => home_url( '/faqs/' ),
				);
			}
		} catch ( \Throwable $e ) {
			// Fail gracefully
		}

		return $list;
	}

	/**
	 * Helper to tokenize string into unique search keyword tokens.
	 */
	private static function extractKeywords( string $text ): array {
		$clean = strtolower( wp_strip_all_tags( $text ) );
		$words = preg_split( '/[^a-z0-9]+/i', $clean, -1, PREG_SPLIT_NO_EMPTY );
		if ( ! is_array( $words ) ) {
			return array();
		}

		// Filter stop words and tiny words (< 3 chars)
		$stop_words = array( 'and', 'the', 'for', 'with', 'that', 'this', 'from', 'have', 'your', 'about', 'what', 'when', 'where', 'which', 'will', 'are', 'was' );
		$filtered = array_filter( $words, static function ( $w ) use ( $stop_words ) {
			return strlen( $w ) >= 3 && ! in_array( $w, $stop_words, true );
		} );

		return array_values( array_unique( $filtered ) );
	}
}
