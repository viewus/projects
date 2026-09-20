<?php
defined( 'ABSPATH' ) || exit;

/**
 * ADN_Theme_Rest_Routes - single source of truth for ALL theme REST endpoints.
 *
 * HOW TO ADD A NEW ROUTE
 * ──────────────────────
 *  1. Add one array entry to the $routes table inside register():
 *
 *       array(
 *           'route'      => '/your-path',              // appended to ADN_API_NS
 *           'methods'    => 'GET',                     // GET | POST | GET,POST …
 *           'callback'   => array( self::class, '_cb_your_path' ),
 *           'permission' => '__return_true',           // or a real cap check
 *       ),
 *
 *  2. Add the static callback method at the bottom of this file (prefix _cb_).
 *
 * HOW TO REMOVE A ROUTE
 * ─────────────────────
 *  Delete (or comment out) its entry in $routes. No other file needs touching.
 *
 * Namespace : ADN_API_NS  (defined in includes/core_settings.php, default "adn/v1")
 * URL prefix : /api/      (set by rest_url_prefix filter in functions.php)
 * Full base  : https://site.com/api/adn/v1/
 *
 * Route index (auto-kept in sync with $routes below):
 *   GET  /api/adn/v1/posts                  paginated WP blog posts
 *   GET  /api/adn/v1/posts/{id}             single post by ID
 *   GET  /api/adn/v1/posts/slug/{slug}      single post by slug
 *   GET  /api/adn/v1/news                   CMS / WP news
 *   GET  /api/adn/v1/topics                 guide parent terms
 *   GET  /api/adn/v1/topics/{slug}          single topic + articles
 *   GET  /api/adn/v1/guides                 paginated article list
 *   GET  /api/adn/v1/search                 full-text search
 *   GET  /api/adn/v1/tools                  calculators list
 *   GET  /api/adn/v1/faqs                   FAQ list
 *   GET  /api/adn/v1/home                   full home page data
 *   POST /api/adn/v1/contact                contact form → DB + rules engine
 *   POST /api/adn/v1/subscribe              newsletter signup → rules engine
 *   POST /api/adn/v1/guidance               guidance enquiry → rules engine
 */
class ADN_Theme_Rest_Routes {

	public static function register(): void {

		$routes = array(

			// ── Posts ────────────────────────────────────────────────────
			array( 'route' => '/posts',                              'methods' => 'GET',  'callback' => array( self::class, '_cb_posts' ),            'permission' => '__return_true' ),
			array( 'route' => '/posts/(?P<id>\d+)',                  'methods' => 'GET',  'callback' => array( self::class, '_cb_post_by_id' ),       'permission' => '__return_true' ),
			array( 'route' => '/posts/slug/(?P<slug>[a-z0-9-]+)',    'methods' => 'GET',  'callback' => array( self::class, '_cb_post_by_slug' ),     'permission' => '__return_true' ),

			// ── CMS content ──────────────────────────────────────────────
			array( 'route' => '/news',                               'methods' => 'GET',  'callback' => array( self::class, '_cb_news' ),             'permission' => '__return_true' ),
			array( 'route' => '/topics',                             'methods' => 'GET',  'callback' => array( self::class, '_cb_topics' ),           'permission' => '__return_true' ),
			array( 'route' => '/topics/(?P<slug>[a-z0-9-]+)',        'methods' => 'GET',  'callback' => array( self::class, '_cb_topic_single' ),    'permission' => '__return_true' ),
			array( 'route' => '/guides',                             'methods' => 'GET',  'callback' => array( self::class, '_cb_guides' ),           'permission' => '__return_true' ),
			array( 'route' => '/tools',                              'methods' => 'GET',  'callback' => array( self::class, '_cb_tools' ),            'permission' => '__return_true' ),
			array( 'route' => '/search',                             'methods' => 'GET',  'callback' => array( self::class, '_cb_search' ),           'permission' => '__return_true' ),
			array( 'route' => '/search/offline-index',               'methods' => 'GET',  'callback' => array( self::class, '_cb_search_offline_index' ), 'permission' => '__return_true' ),
			array( 'route' => '/faqs',                               'methods' => 'GET',  'callback' => array( self::class, '_cb_faqs' ),             'permission' => '__return_true' ),
			array( 'route' => '/home',                               'methods' => 'GET',  'callback' => array( self::class, '_cb_home' ),             'permission' => '__return_true' ),
			array( 'route' => '/home/section/(?P<section>[a-z_]+)',  'methods' => 'GET',  'callback' => array( self::class, '_cb_home_fragment' ),    'permission' => '__return_true' ),
			array( 'route' => '/fragment/home/(?P<section>[a-z_]+)', 'methods' => 'GET',  'callback' => array( self::class, '_cb_home_fragment' ),    'permission' => '__return_true' ),

			// ── Forms / write ────────────────────────────────────────────
			array( 'route' => '/contact',                            'methods' => 'POST', 'callback' => array( self::class, '_cb_contact' ),          'permission' => '__return_true' ),
			array( 'route' => '/subscribe',                          'methods' => 'POST', 'callback' => array( self::class, '_cb_subscribe' ),        'permission' => '__return_true' ),
			array( 'route' => '/guidance',                           'methods' => 'POST', 'callback' => array( self::class, '_cb_guidance' ),         'permission' => '__return_true' ),

			// ── Add new routes below this line ───────────────────────────
			// array(
			//     'route'      => '/your-path',
			//     'methods'    => 'GET',
			//     'callback'   => array( self::class, '_cb_your_path' ),
			//     'permission' => '__return_true',
			// ),

		);

		foreach ( $routes as $r ) {
			register_rest_route( ADN_API_NS, $r['route'], array(
				'methods'             => $r['methods'],
				'callback'            => $r['callback'],
				'permission_callback' => $r['permission'] ?? '__return_true',
			) );
		}
	}

	/* ══════════════════════════════════════════════════════════════════
	   POSTS
	   ══════════════════════════════════════════════════════════════════ */

	/** GET /posts - paginated WP blog posts. ?page=&per_page= */
	public static function _cb_posts( WP_REST_Request $req ): WP_REST_Response {
		$page     = max( 1, (int) $req->get_param( 'page' ) );
		$per_page = (int) $req->get_param( 'per_page' );
		$per_page = $per_page > 0 ? min( $per_page, 50 ) : ADN_API_PER_PAGE;

		$q = new WP_Query( array(
			'post_type'      => 'post',
			'post_status'    => 'publish',
			'posts_per_page' => $per_page,
			'paged'          => $page,
		) );

		return new WP_REST_Response( array(
			'data'        => array_map( 'adn_model_post', $q->posts ),
			'total'       => (int) $q->found_posts,
			'total_pages' => (int) $q->max_num_pages,
			'page'        => $page,
		), 200 );
	}

	/** GET /posts/{id} - single post by ID. */
	public static function _cb_post_by_id( WP_REST_Request $req ): WP_REST_Response {
		$post = get_post( (int) $req->get_param( 'id' ) );
		if ( ! $post || 'post' !== $post->post_type || 'publish' !== $post->post_status ) {
			return new WP_REST_Response( array( 'error' => 'Not found.' ), 404 );
		}
		$model    = adn_model_post( $post );
		$redirect = adn_maybe_redirect( $model, 'rest' );
		return $redirect instanceof WP_REST_Response ? $redirect : new WP_REST_Response( $model, 200 );
	}

	/** GET /posts/slug/{slug} - single post by slug. */
	public static function _cb_post_by_slug( WP_REST_Request $req ): WP_REST_Response {
		$slug = sanitize_title( (string) $req->get_param( 'slug' ) );
		$post = get_page_by_path( $slug, OBJECT, 'post' );
		if ( ! $post || 'publish' !== $post->post_status ) {
			return new WP_REST_Response( array( 'error' => 'Not found.' ), 404 );
		}
		$model    = adn_model_post( $post );
		$redirect = adn_maybe_redirect( $model, 'rest' );
		return $redirect instanceof WP_REST_Response ? $redirect : new WP_REST_Response( $model, 200 );
	}

	/* ══════════════════════════════════════════════════════════════════
	   CMS CONTENT
	   ══════════════════════════════════════════════════════════════════ */

	/** GET /news - CMS newsbar items (newest first), WP posts as fallback. ?page=&per_page=&source=&label=&q= */
	public static function _cb_news( WP_REST_Request $req ): WP_REST_Response {
		$page     = max( 1, (int) $req->get_param( 'page' ) );
		$per_page = (int) $req->get_param( 'per_page' );
		$per_page = $per_page > 0 ? min( $per_page, 50 ) : ADN_API_PER_PAGE;
		$source   = sanitize_key( (string) $req->get_param( 'source' ) );

		// Filters (applied to every source).
		$label_raw = trim( (string) $req->get_param( 'label' ) );
		$label_key = ( '' !== $label_raw && 'all' !== strtolower( $label_raw ) ) ? sanitize_key( $label_raw ) : '';
		$q_raw     = trim( (string) $req->get_param( 'q' ) );
		$q_lc      = '' !== $q_raw ? strtolower( $q_raw ) : '';

		$items    = array();
		$labels   = array();

		if ( 'wp' !== $source && function_exists( 'adn_cms_newsbar_items' ) ) {
			foreach ( adn_cms_newsbar_items( 300 ) as $ni ) {
				$title = isset( $ni->text ) ? (string) $ni->text : '';
				if ( '' === $title ) { continue; }

				$lbl  = isset( $ni->label ) && '' !== trim( (string) $ni->label ) ? trim( (string) $ni->label ) : 'News';
				$lkey = sanitize_key( $lbl );

				// Track distinct labels (before filtering) for the filter tabs.
				if ( isset( $labels[ $lkey ] ) ) {
					$labels[ $lkey ]['count']++;
				} else {
					$labels[ $lkey ] = array( 'key' => $lkey, 'label' => $lbl, 'count' => 1 );
				}

				// Apply label + search filters.
				if ( '' !== $label_key && $lkey !== $label_key ) { continue; }
				if ( '' !== $q_lc && false === strpos( strtolower( $title ), $q_lc ) ) { continue; }

				$content = isset( $ni->content ) ? (string) $ni->content : '';
				$stamp   = ! empty( $ni->start_date ) ? $ni->start_date : ( isset( $ni->created_at ) ? $ni->created_at : '' );
				$img     = '';
				if ( ! empty( $ni->image_id ) ) {
					$t   = wp_get_attachment_image_url( (int) $ni->image_id, 'medium' );
					$img = $t ? (string) $t : '';
				}

				$items[] = array(
					'id'        => isset( $ni->id ) ? (int) $ni->id : 0,
					'title'     => $title,
					'excerpt'   => wp_trim_words( wp_strip_all_tags( $content ), 24, '…' ),
					'date'      => $stamp ? date_i18n( 'M j, Y', strtotime( $stamp ) ) : '',
					'date_raw'  => $stamp ? (string) $stamp : '',
					'label'     => $lbl,
					'cat_key'   => $lkey,
					'read_time' => function_exists( 'adn_cms_read_time' ) ? adn_cms_read_time( $content ) : '',
					'url'       => function_exists( 'adn_newsbar_item_url' ) ? adn_newsbar_item_url( (int) $ni->id, isset( $ni->slug ) ? (string) $ni->slug : '' ) : '#',
					'image'     => $img,
					'source'    => 'cms',
				);
			}
		}

		// Fallback: published WP posts (only when no CMS newsbar items exist).
		if ( empty( $items ) && empty( $labels ) ) {
			$q = new WP_Query( array( 'post_type' => 'post', 'post_status' => 'publish', 'posts_per_page' => 200, 'orderby' => 'date', 'order' => 'DESC' ) );
			foreach ( $q->posts as $p ) {
				$title = (string) $p->post_title;
				if ( '' !== $q_lc && false === strpos( strtolower( $title ), $q_lc ) ) { continue; }
				$items[] = array(
					'id'        => (int) $p->ID,
					'title'     => $title,
					'excerpt'   => $p->post_excerpt ?: wp_trim_words( wp_strip_all_tags( $p->post_content ), 24, '…' ),
					'date'      => date_i18n( 'M j, Y', strtotime( $p->post_date ) ),
					'date_raw'  => (string) $p->post_date,
					'label'     => 'News',
					'cat_key'   => 'news',
					'read_time' => function_exists( 'adn_cms_read_time' ) ? adn_cms_read_time( $p->post_content ) : '',
					'url'       => get_permalink( $p->ID ),
					'image'     => get_the_post_thumbnail_url( $p->ID, 'medium' ) ?: '',
					'source'    => 'wp',
				);
			}
			wp_reset_postdata();
		}

		// Sort label list by frequency (desc) for the tab strip.
		$labels = array_values( $labels );
		usort( $labels, static function ( $a, $b ) { return $b['count'] - $a['count']; } );

		$total = count( $items );
		$items = array_slice( $items, ( $page - 1 ) * $per_page, $per_page );

		return new WP_REST_Response( array(
			'success' => true,
			'data'    => $items,
			'labels'  => $labels,
			'meta'    => array(
				'total'       => $total,
				'page'        => $page,
				'per_page'    => $per_page,
				'total_pages' => (int) ceil( max( 1, $total ) / $per_page ),
			),
		), 200 );
	}

	/** GET /topics - all active guide parent terms. */
	public static function _cb_topics( WP_REST_Request $req ): WP_REST_Response {
		$items = array();
		if ( function_exists( 'adn_cms_guide_parents' ) ) {
			foreach ( adn_cms_guide_parents( 50 ) as $pt ) {
				$slug    = isset( $pt->slug ) ? (string) $pt->slug : '';
				$topics  = function_exists( 'adn_cms_topics' ) ? adn_cms_topics( (int) $pt->id, 200 ) : array();
				$items[] = array(
					'id'          => isset( $pt->id )          ? (int) $pt->id             : 0,
					'name'        => isset( $pt->name )        ? (string) $pt->name        : '',
					'slug'        => $slug,
					'description' => isset( $pt->description ) ? (string) $pt->description : '',
					'icon'        => isset( $pt->icon_emoji )  ? (string) $pt->icon_emoji  : '📚',
					'url'         => $slug ? home_url( '/' . $slug . '/' ) : '#',
					'topic_count' => count( $topics ),
				);
			}
		}
		return new WP_REST_Response( array( 'success' => true, 'data' => $items, 'meta' => array( 'total' => count( $items ) ) ), 200 );
	}

	/** GET /topics/{slug} - single topic + sub-topics + articles. ?page=&per_page= */
	public static function _cb_topic_single( WP_REST_Request $req ): WP_REST_Response {
		$slug     = sanitize_title( (string) $req->get_param( 'slug' ) );
		$page     = max( 1, (int) $req->get_param( 'page' ) );
		$per_page = (int) $req->get_param( 'per_page' );
		$per_page = $per_page > 0 ? min( $per_page, 50 ) : 12;

		if ( ! function_exists( 'adn_cms_parent_by_slug' ) ) {
			return new WP_REST_Response( array( 'success' => false, 'error' => 'CMS not available.' ), 503 );
		}
		$parent = adn_cms_parent_by_slug( $slug );
		if ( ! $parent ) {
			return new WP_REST_Response( array( 'success' => false, 'error' => 'Topic not found.' ), 404 );
		}

		$subtopics = array();
		foreach ( ( function_exists( 'adn_cms_topics' ) ? adn_cms_topics( (int) $parent->id, 100 ) : array() ) as $t ) {
			$ts          = isset( $t->slug ) ? (string) $t->slug : '';
			$subtopics[] = array(
				'id'          => isset( $t->id )          ? (int) $t->id            : 0,
				'name'        => isset( $t->name )        ? (string) $t->name       : '',
				'slug'        => $ts,
				'description' => isset( $t->description ) ? (string) $t->description : '',
				'icon'        => isset( $t->icon_emoji )  ? (string) $t->icon_emoji  : '📄',
				'url'         => $ts ? home_url( '/' . $ts . '/' ) : '#',
			);
		}

		$all      = function_exists( 'adn_cms_articles_for_parent' ) ? adn_cms_articles_for_parent( $slug, $per_page * 10 ) : array();
		$total    = count( $all );
		$articles = array();
		foreach ( array_slice( $all, ( $page - 1 ) * $per_page, $per_page ) as $a ) {
			$pid        = isset( $a->ID ) ? (int) $a->ID : 0;
			$articles[] = array(
				'id'       => $pid,
				'title'    => isset( $a->title )        ? (string) $a->title        : '',
				'slug'     => isset( $a->slug )         ? (string) $a->slug         : '',
				'excerpt'  => isset( $a->excerpt )      ? (string) $a->excerpt      : '',
				'date'     => isset( $a->published_at ) ? (string) $a->published_at : '',
				'url'      => $pid ? get_permalink( $pid ) : '#',
				'image'    => $pid ? ( get_the_post_thumbnail_url( $pid, 'medium_large' ) ?: '' ) : '',
				'category' => isset( $a->category_name ) ? (string) $a->category_name : '',
			);
		}

		return new WP_REST_Response( array(
			'success' => true,
			'data'    => array(
				'topic'     => array(
					'id'          => isset( $parent->id )          ? (int) $parent->id            : 0,
					'name'        => isset( $parent->name )        ? (string) $parent->name       : '',
					'slug'        => isset( $parent->slug )        ? (string) $parent->slug       : '',
					'description' => isset( $parent->description ) ? (string) $parent->description : '',
					'icon'        => isset( $parent->icon_emoji )  ? (string) $parent->icon_emoji  : '📚',
					'url'         => home_url( '/' . $slug . '/' ),
				),
				'subtopics' => $subtopics,
				'articles'  => $articles,
			),
			'meta' => array( 'total' => $total, 'page' => $page, 'per_page' => $per_page, 'total_pages' => (int) ceil( max( 1, $total ) / $per_page ) ),
		), 200 );
	}

	/** GET /guides - paginated article listing. ?page=&per_page=&topic= */
	public static function _cb_guides( WP_REST_Request $req ): WP_REST_Response {
		$page       = max( 1, (int) $req->get_param( 'page' ) );
		$per_page   = (int) $req->get_param( 'per_page' );
		$per_page   = $per_page > 0 ? min( $per_page, 50 ) : ADN_API_PER_PAGE;
		$topic_slug = sanitize_title( (string) $req->get_param( 'topic' ) );

		$all = array();
		if ( '' !== $topic_slug && function_exists( 'adn_cms_articles_for_parent' ) ) {
			$all = adn_cms_articles_for_parent( $topic_slug, $per_page * 20 );
		} elseif ( function_exists( 'adn_cms_articles' ) ) {
			$all = adn_cms_articles( $per_page * 20 );
		}

		if ( empty( $all ) ) {
			$q = new WP_Query( array( 'post_type' => 'post', 'post_status' => 'publish', 'posts_per_page' => $per_page, 'paged' => $page ) );
			foreach ( $q->posts as $p ) {
				$all[] = (object) array( 'ID' => $p->ID, 'title' => $p->post_title, 'slug' => $p->post_name, 'excerpt' => $p->post_excerpt, 'published_at' => $p->post_date, 'category_name' => '' );
			}
			wp_reset_postdata();
		}

		$total = count( $all );
		$data  = array();
		foreach ( array_slice( $all, ( $page - 1 ) * $per_page, $per_page ) as $a ) {
			$pid    = isset( $a->ID ) ? (int) $a->ID : 0;
			$data[] = array(
				'id'       => $pid,
				'title'    => isset( $a->title )        ? (string) $a->title        : '',
				'slug'     => isset( $a->slug )         ? (string) $a->slug         : '',
				'excerpt'  => isset( $a->excerpt )      ? (string) $a->excerpt      : '',
				'date'     => isset( $a->published_at ) ? (string) $a->published_at : '',
				'url'      => $pid ? get_permalink( $pid ) : '#',
				'image'    => $pid ? ( get_the_post_thumbnail_url( $pid, 'medium_large' ) ?: '' ) : '',
				'category' => isset( $a->category_name ) ? (string) $a->category_name : '',
			);
		}

		return new WP_REST_Response( array(
			'success' => true,
			'data'    => $data,
			'meta'    => array( 'total' => $total, 'page' => $page, 'per_page' => $per_page, 'total_pages' => (int) ceil( max( 1, $total ) / $per_page ) ),
		), 200 );
	}

	/** GET /tools - active calculators list. */
	public static function _cb_tools( WP_REST_Request $req ): WP_REST_Response {
		$items = array();
		if ( function_exists( 'adn_calculators' ) ) {
			$meta_all = get_option( 'adn_calculators_meta', array() );
			foreach ( adn_calculators() as $key => $reg ) {
				$meta = isset( $meta_all[ $key ] ) && is_array( $meta_all[ $key ] ) ? $meta_all[ $key ] : array();
				if ( array_key_exists( 'enabled', $meta ) && empty( $meta['enabled'] ) ) { continue; }
				if ( ! empty( $meta['hidden_from_listing'] ) ) { continue; }
				$items[] = array(
					'key'         => (string) $key,
					'name'        => ! empty( $meta['label'] )       ? (string) $meta['label']       : ( ! empty( $reg['title'] )       ? (string) $reg['title']       : $key ),
					'icon'        => ! empty( $reg['icon'] )         ? (string) $reg['icon']         : '🧮',
					'url'         => ! empty( $meta['card_url'] )    ? (string) $meta['card_url']    : adn_calc_page_url( $key ),
					'description' => ! empty( $meta['description'] ) ? (string) $meta['description'] : ( ! empty( $reg['description'] ) ? (string) $reg['description'] : '' ),
					'highlight'   => ! empty( $meta['highlight'] )   ? (string) $meta['highlight']   : '',
				);
			}
		}
		return new WP_REST_Response( array( 'success' => true, 'data' => $items, 'meta' => array( 'total' => count( $items ) ) ), 200 );
	}

	/** GET /search - full-text WP search. ?q=&type=&page=&per_page= */
	public static function _cb_search( WP_REST_Request $req ): WP_REST_Response {
		$q        = sanitize_text_field( (string) $req->get_param( 'q' ) );
		$type     = sanitize_key( (string) $req->get_param( 'type' ) ) ?: 'post';
		$page     = max( 1, (int) $req->get_param( 'page' ) );
		$per_page = (int) $req->get_param( 'per_page' );
		$per_page = $per_page > 0 ? min( $per_page, 50 ) : 12;

		if ( '' === $q ) {
			return new WP_REST_Response( array( 'success' => false, 'error' => 'Query parameter "q" is required.' ), 422 );
		}

		$query = new WP_Query( array(
			's'              => $q,
			'post_type'      => 'any' === $type ? array( 'post', 'page' ) : $type,
			'post_status'    => 'publish',
			'posts_per_page' => $per_page,
			'paged'          => $page,
		) );

		$data = array();
		foreach ( $query->posts as $p ) {
			$data[] = array(
				'id'      => (int) $p->ID,
				'title'   => $p->post_title,
				'excerpt' => $p->post_excerpt ?: wp_trim_words( wp_strip_all_tags( $p->post_content ), 20 ),
				'type'    => $p->post_type,
				'date'    => $p->post_date,
				'url'     => get_permalink( $p->ID ),
				'image'   => get_the_post_thumbnail_url( $p->ID, 'medium' ) ?: '',
			);
		}
		wp_reset_postdata();

		return new WP_REST_Response( array(
			'success' => true,
			'data'    => $data,
			'meta'    => array( 'query' => $q, 'total' => (int) $query->found_posts, 'page' => $page, 'per_page' => $per_page, 'total_pages' => (int) $query->max_num_pages ),
		), 200 );
	}

	/** GET /search/offline-index - full precompiled client-side search index. */
	public static function _cb_search_offline_index( WP_REST_Request $req ): WP_REST_Response {
		$index = class_exists( '\Adn\Theme\Service\OfflineSearchIndex' )
			? \Adn\Theme\Service\OfflineSearchIndex::getIndex()
			: array( 'version' => 1, 'items' => array() );

		$res = new WP_REST_Response( array(
			'success' => true,
			'data'    => $index,
		), 200 );

		$res->header( 'Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400' );
		return $res;
	}

	/** GET /faqs - global FAQ list from CMS DB. */
	public static function _cb_faqs( WP_REST_Request $req ): WP_REST_Response {
		$faqs = array();
		if ( class_exists( 'AH_Faqs_Model' ) ) {
			try {
				$m    = new AH_Faqs_Model();
				$faqs = is_array( $m->get_global() ) ? $m->get_global() : array();
			} catch ( Throwable $e ) {
				$faqs = array();
			}
		}
		return new WP_REST_Response( array( 'data' => $faqs, 'total' => count( $faqs ) ), 200 );
	}

	/** GET /home - full home page data (same payload as the rendered page). */
	public static function _cb_home( WP_REST_Request $req ): WP_REST_Response {
		$logical = ADN_THEME_DIR . '/intermediate/PageHomeLogical.php';
		if ( file_exists( $logical ) && ! function_exists( 'adn_home_get_context' ) ) {
			require_once $logical;
		}
		if ( function_exists( 'adn_home_get_context' ) ) {
			$ctx = adn_home_get_context();
			unset( $ctx['chrome'] );
			return new WP_REST_Response( array( 'success' => true, 'data' => $ctx ), 200 );
		}
		$data = function_exists( 'adn_service_home_data' ) ? adn_service_home_data() : array();
		return empty( $data )
			? new WP_REST_Response( array( 'success' => false, 'error' => 'Home content not found.' ), 404 )
			: new WP_REST_Response( array( 'success' => true,  'data'  => $data ), 200 );
	}

	/**
	 * GET /home/section/{section} - server-rendered HTML for one deferred
	 * home-page section (banners | news_row | tools | guides | resources).
	 */
	public static function _cb_home_fragment( WP_REST_Request $req ): WP_REST_Response {
		// Timing: each phase reported as X-ADN-Timing-* response header.
		$t_req   = isset( $_SERVER['REQUEST_TIME_FLOAT'] ) ? $_SERVER['REQUEST_TIME_FLOAT'] : microtime( true );
		$t0      = microtime( true );
		$timings = array();
		$t       = static function ( string $k ) use ( &$timings, $t_req ) {
			$timings[ $k ] = round( ( microtime( true ) - $t_req ) * 1000, 1 );
		};

		$section = sanitize_key( (string) $req->get_param( 'section' ) );
		if ( ! in_array( $section, array( 'banners', 'news_row', 'tools', 'guides', 'resources' ), true ) ) {
			return new WP_REST_Response( array( 'success' => false, 'error' => 'Unknown section.' ), 404 );
		}
		$t( '01_wp_boot_ms' );

		// ── Check WordPress transient cache (always works, zero config needed) ──
		if ( function_exists( 'adn_home_frag_get' ) ) {
			$cached = adn_home_frag_get( $section );
			if ( false !== $cached && is_string( $cached ) ) {
				$t( '02_cache_hit_ms' );
				$res = new WP_REST_Response( array( 'success' => true, 'html' => $cached ), 200 );
				$res->header( 'Cache-Control', 'public, max-age=300, stale-while-revalidate=600' );
				$res->header( 'X-ADN-Cache', 'HIT' );
				foreach ( $timings as $k => $v ) { $res->header( 'X-ADN-Timing-' . $k, $v . 'ms' ); }
				return $res;
			}
		}
		$t( '02_cache_miss_ms' );

		// ── Cache miss: render HTML and store in transient ────────────────────
		$html = function_exists( 'adn_home_frag_render' )
			? adn_home_frag_render( $section, true )
			: self::_render_section_html( $section );
		$t( '03_render_ms' );

		$res = new WP_REST_Response( array( 'success' => true, 'html' => $html ), 200 );
		$res->header( 'Cache-Control', 'public, max-age=300, stale-while-revalidate=600' );
		$res->header( 'X-ADN-Cache', 'MISS' );
		foreach ( $timings as $k => $v ) { $res->header( 'X-ADN-Timing-' . $k, $v . 'ms' ); }
		return $res;
	}

	/** Fallback render used when HomeFragmentCache.php is unavailable. */
	private static function _render_section_html( string $section ): string {
		$logical = ADN_THEME_DIR . '/intermediate/PageHomeLogical.php';
		if ( ! function_exists( 'adn_home_get_fragment_context' ) && file_exists( $logical ) ) {
			require_once $logical;
		}
		if ( ! function_exists( 'adn_home_get_fragment_context' ) || ! function_exists( 'adn_component' ) ) {
			return new WP_REST_Response( array( 'success' => false, 'error' => 'Renderer unavailable.' ), 503 );
		}

		$ctx = adn_home_get_fragment_context( $section );

		ob_start();
		adn_component( 'sections/home_deferred_section', array(
			'section' => $section,
			'ctx'     => $ctx,
		) );
		$html = trim( (string) ob_get_clean() );

		if ( $cache_enabled && method_exists( 'AH_Cache', 'temp_set' ) ) {
			AH_Cache::temp_set( $cache_id, array( 'html' => $html ), 'home_frag', CACHE_PERMANENT );
		}

		$res = new WP_REST_Response( array( 'success' => true, 'html' => $html ), 200 );
		$res->header( 'Cache-Control', 'public, max-age=300, stale-while-revalidate=600' );
		return $res;
	}

	/* ══════════════════════════════════════════════════════════════════
	   FORMS / WRITE
	   ══════════════════════════════════════════════════════════════════ */

	/**
	 * POST /contact - contact form.
	 * Validates name + email + message, stores in DB, fires rules engine.
	 * Body: { name, email, phone?, topic?, message, adn_hp? }
	 */
	public static function _cb_contact( WP_REST_Request $req ): WP_REST_Response {
		// Honeypot: bots fill adn_hp, real users never do.
		if ( '' !== (string) $req->get_param( 'adn_hp' ) ) {
			return new WP_REST_Response( array( 'success' => true, 'message' => 'Thanks!' ), 200 );
		}

		$name    = sanitize_text_field( (string) $req->get_param( 'name' ) );
		$email   = sanitize_email( (string) $req->get_param( 'email' ) );
		$phone   = sanitize_text_field( (string) $req->get_param( 'phone' ) );
		$topic   = sanitize_key( (string) $req->get_param( 'topic' ) );
		$message = sanitize_textarea_field( (string) $req->get_param( 'message' ) );

		if ( '' === $name || ! is_email( $email ) || '' === $message ) {
			return new WP_REST_Response( array(
				'success' => false,
				'error'   => 'Please provide a valid name, email and message.',
			), 422 );
		}

		// Store submission in DB.
		ADN_Schema::create_all();
		global $wpdb;
		$inserted = $wpdb->insert(
			ADN_Schema::contact_table(),
			array(
				'name'       => $name,
				'email'      => $email,
				'phone'      => $phone,
				'topic'      => $topic ?: 'general',
				'message'    => $message,
				'ip_address' => sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ?? '' ) ),
				'status'     => 'new',
				'created_at' => current_time( 'mysql' ),
			),
			array( '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s' )
		);

		if ( false === $inserted ) {
			return new WP_REST_Response( array( 'success' => false, 'error' => 'Sorry, your message could not be saved. Please try again.' ), 500 );
		}

		// Fire rules engine (admins attach email/WhatsApp actions here).
		if ( class_exists( 'AH_Workflow_Manager' ) && class_exists( 'ADN_Rules' ) ) {
			AH_Workflow_Manager::evaluate( ADN_Rules::CONTACT_FORM, array(
				'submission_id' => (int) $wpdb->insert_id,
				'name'          => $name,
				'email'         => $email,
				'phone'         => $phone,
				'topic'         => $topic ?: 'general',
				'message'       => $message,
				'site_url'      => home_url(),
				'submitted_at'  => current_time( 'Y-m-d H:i:s' ),
			), true );
		}

		return new WP_REST_Response( array( 'success' => true, 'message' => 'Thanks! Your message has been received.' ), 200 );
	}

	/**
	 * POST /subscribe - newsletter signup.
	 * Body: { email, name?, adn_hp? }
	 */
	public static function _cb_subscribe( WP_REST_Request $req ): WP_REST_Response {
		if ( '' !== (string) $req->get_param( 'adn_hp' ) ) {
			return new WP_REST_Response( array( 'success' => true, 'message' => 'Thanks!' ), 200 );
		}

		$email = sanitize_email( (string) $req->get_param( 'email' ) );
		$name  = sanitize_text_field( (string) $req->get_param( 'name' ) );

		if ( ! is_email( $email ) ) {
			return new WP_REST_Response( array( 'success' => false, 'error' => 'Please provide a valid email address.' ), 422 );
		}

		if ( class_exists( 'AH_Workflow_Manager' ) && class_exists( 'ADN_Rules' ) ) {
			AH_Workflow_Manager::evaluate( ADN_Rules::NEWSLETTER_SIGNUP, array(
				'email'        => $email,
				'name'         => $name,
				'site_url'     => home_url(),
				'submitted_at' => current_time( 'Y-m-d H:i:s' ),
			), true );
		}

		return new WP_REST_Response( array( 'success' => true, 'message' => "You're subscribed! We'll keep you updated." ), 200 );
	}

	/**
	 * POST /guidance - guidance enquiry form.
	 * Body: { name, email, phone?, help_with?, requirement?, time_frame?, adn_hp? }
	 */
	public static function _cb_guidance( WP_REST_Request $req ): WP_REST_Response {
		if ( '' !== (string) $req->get_param( 'adn_hp' ) ) {
			return new WP_REST_Response( array( 'success' => true, 'message' => 'Thanks!' ), 200 );
		}

		$name        = sanitize_text_field( (string) $req->get_param( 'name' ) );
		$email       = sanitize_email( (string) $req->get_param( 'email' ) );
		$phone       = sanitize_text_field( (string) $req->get_param( 'phone' ) );
		$help_with   = sanitize_key( (string) $req->get_param( 'help_with' ) );
		$requirement = sanitize_textarea_field( (string) $req->get_param( 'requirement' ) );
		$time_frame  = sanitize_text_field( (string) $req->get_param( 'time_frame' ) );

		if ( '' === $name || ! is_email( $email ) ) {
			return new WP_REST_Response( array( 'success' => false, 'error' => 'Please provide a valid name and email address.' ), 422 );
		}

		if ( class_exists( 'AH_Workflow_Manager' ) && class_exists( 'ADN_Rules' ) ) {
			AH_Workflow_Manager::evaluate( ADN_Rules::GUIDANCE_FORM, array(
				'name'         => $name,
				'email'        => $email,
				'phone'        => $phone,
				'help_with'    => $help_with,
				'requirement'  => $requirement,
				'time_frame'   => $time_frame,
				'site_url'     => home_url(),
				'submitted_at' => current_time( 'Y-m-d H:i:s' ),
			), true );
		}

		return new WP_REST_Response( array( 'success' => true, 'message' => "Thanks! We'll connect you with the right expert shortly." ), 200 );
	}

	/* ══════════════════════════════════════════════════════════════════
	   ADD NEW CALLBACKS BELOW
	   ══════════════════════════════════════════════════════════════════ */

}
