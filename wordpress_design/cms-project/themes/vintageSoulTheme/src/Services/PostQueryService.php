<?php
namespace VintageSoul\Services;

use VintageSoul\Support\UrlHelper;

defined( 'ABSPATH' ) || exit;

/**
 * PostQueryService — post and category lookups for the blog sidebar.
 *
 * single.php and archive.php were each running get_posts()/get_categories()
 * inline and normalising the results by hand. Templates are meant to render
 * prepared data, not query, so both now read from here instead.
 */
final class PostQueryService {

	/** Used when a post has no featured image of its own. */
	private const FALLBACK_THUMB = 'assets/images/sugarcane/story_moments.jpg';

	/**
	 * Recent published posts, ready to render.
	 *
	 * @param int              $limit
	 * @param array<int, int>  $exclude Post IDs to leave out (e.g. the one being read).
	 * @return array<int, array<string, string>>
	 */
	public static function recent( int $limit = 4, array $exclude = array() ): array {
		$args = array(
			'post_type'      => 'post',
			'post_status'    => 'publish',
			'posts_per_page' => max( 1, $limit ),
		);

		$exclude = array_values( array_filter( array_map( 'intval', $exclude ) ) );
		if ( ! empty( $exclude ) ) {
			$args['post__not_in'] = $exclude;
		}

		$posts  = get_posts( $args );
		$result = array();

		foreach ( (array) $posts as $post ) {
			$thumb = get_the_post_thumbnail_url( $post->ID, 'thumbnail' );

			$result[] = array(
				'id'        => (string) $post->ID,
				'title'     => (string) get_the_title( $post ),
				'permalink' => (string) get_permalink( $post ),
				'date'      => (string) get_the_date( 'j M Y', $post ),
				'thumb'     => $thumb ? (string) $thumb : UrlHelper::resolve( self::FALLBACK_THUMB ),
			);
		}

		return $result;
	}

	/**
	 * Categories that actually have posts, with their archive links.
	 *
	 * @return array<int, array<string, string>>
	 */
	public static function categories(): array {
		$categories = get_categories( array( 'hide_empty' => true ) );
		$result     = array();

		foreach ( (array) $categories as $category ) {
			$result[] = array(
				'name'  => (string) $category->name,
				'count' => (string) $category->count,
				'url'   => (string) get_category_link( $category->term_id ),
			);
		}

		return $result;
	}
}
