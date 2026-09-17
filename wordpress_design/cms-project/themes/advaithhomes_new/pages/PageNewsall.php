<?php
/**
 * Template Name: News & Insights
 *
 * pages/PageNewsall.php - News listing page.
 *
 * All content comes from data/json/news.json via the service layer.
 * No content is hardcoded here - only structure.
 *
 * Architecture:
 *   data/json/news.json
 *     → apis/services.php  adn_service_news_data()
 *       → intermediate/page_news_logical.php  adn_news_get_context()
 *         → THIS FILE  (structure only)
 *
 * RULE: No hardcoded content and no data reads here - only structure.
 * RULE: Header/footer come from header.php / footer.php via get_header() / get_footer().
 */

defined( 'ABSPATH' ) || exit;

/* get_header() is called separately in each branch below, after that branch's
   adn_seo_register(): adn_seo_head_output() is hooked to wp_head at priority 1,
   so a title/canonical registered after the header never reaches the head. */

/* ── Single news item view ──────────────────────────────────────────────── */
/* /news/<slug>/ (set as the ah_news query var by adn_route_news_single_slug()
 * in includes/core_routing.php) is the canonical, readable URL. ?ah_news=<slug>
 * and the numeric ?ah_news_id=<id> form both still work too, for any links
 * already shared/indexed before pretty permalinks existed. */
$_ah_news_slug = get_query_var( 'ah_news' ) ? sanitize_title( get_query_var( 'ah_news' ) )
	: ( isset( $_GET['ah_news'] ) ? sanitize_title( wp_unslash( $_GET['ah_news'] ) ) : '' );
$_ah_news_id   = isset( $_GET['ah_news_id'] ) ? absint( $_GET['ah_news_id'] ) : 0;
if ( ( '' !== $_ah_news_slug || $_ah_news_id > 0 ) && function_exists( 'adn_cms_newsbar_items' ) ) {
	global $wpdb;
	$_nb_table = $wpdb->prefix . 'ah_news_bar_items';
	$_nb_item  = null;
	if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $_nb_table ) ) === $_nb_table ) {
		$_nb_item = '' !== $_ah_news_slug
			? $wpdb->get_row( $wpdb->prepare( "SELECT * FROM `{$_nb_table}` WHERE slug = %s LIMIT 1", $_ah_news_slug ) )
			: $wpdb->get_row( $wpdb->prepare( "SELECT * FROM `{$_nb_table}` WHERE id = %d LIMIT 1", $_ah_news_id ) );
	}
	if ( $_nb_item ) {
		$_ah_news_id = (int) $_nb_item->id; // normalise for the rest of this block (related-items exclusion, etc.)
	}

	if ( $_nb_item ) {
		// CSS/JS now loaded centrally via AssetLoader (wp_enqueue_scripts hook)
		$_nb_ctx               = \Adn\Theme\Feature\News\Controller\NewsController::getContext();
		$_nb_ctx['breadcrumb'] = array(); // suppressed from adn_page_open; passed to hero directly below
		if ( isset( $_nb_ctx['meta'] ) ) {
			$_nb_ctx['meta']['title'] = isset( $_nb_item->text ) ? (string) $_nb_item->text : '';
		}
		$_nb_stamp   = ! empty( $_nb_item->start_date ) ? $_nb_item->start_date : ( isset( $_nb_item->created_at ) ? $_nb_item->created_at : '' );
		$_nb_label   = isset( $_nb_item->label )   ? wp_unslash( (string) $_nb_item->label )   : '';
		$_nb_title   = isset( $_nb_item->text )    ? wp_unslash( (string) $_nb_item->text )    : '';
		$_nb_excerpt = isset( $_nb_item->excerpt ) ? wp_unslash( (string) $_nb_item->excerpt ) : '';
		$_nb_content = isset( $_nb_item->content ) ? wp_unslash( (string) $_nb_item->content ) : '';
		$_nb_url     = function_exists( 'adn_newsbar_item_url' ) ? adn_newsbar_item_url( $_nb_item->id, isset( $_nb_item->slug ) ? (string) $_nb_item->slug : '' ) : '';

		// Override hero with real news item data.
		$_nb_ctx['hero']['title']       = $_nb_title;
		$_nb_ctx['hero']['description'] = $_nb_excerpt;
		if ( ! empty( $_nb_item->image_id ) ) {
			$_nb_ctx['hero']['image_id'] = (int) $_nb_item->image_id;
		}

		$_nb_breadcrumb = array(
			array( 'label' => PAGE_TITLE_HOME, 'url' => home_url( '/' ) ),
			array( 'label' => SITE_NEWS_NOUN,  'url' => home_url( SITE_NEWS_URL ) ),
			array( 'label' => $_nb_title,      'url' => null ),
		);

		// Related news: other active items excluding current.
		$_nb_related = array();
		if ( function_exists( 'adn_cms_newsbar_items' ) && function_exists( 'adn_cms_gradient' ) ) {
			$_rni = 0;
			foreach ( adn_cms_newsbar_items( 10 ) as $_rn ) {
				if ( (int) $_rn->id === $_ah_news_id ) { continue; }
				if ( $_rni >= 4 ) { break; }
				$_rn_stamp     = ! empty( $_rn->start_date ) ? $_rn->start_date : ( isset( $_rn->created_at ) ? $_rn->created_at : '' );
				$_rn_label     = isset( $_rn->label ) && '' !== trim( (string) $_rn->label ) ? wp_unslash( trim( (string) $_rn->label ) ) : SITE_NEWS_NOUN;
				$_nb_related[] = array(
					'gradient' => adn_cms_gradient( $_rni ),
					'title'    => isset( $_rn->text ) ? wp_unslash( (string) $_rn->text ) : '',
					'date'     => $_rn_stamp ? date_i18n( 'M j, Y', strtotime( $_rn_stamp ) ) : '',
					'tag'      => $_rn_label,
					'url'      => function_exists( 'adn_newsbar_item_url' ) ? adn_newsbar_item_url( $_rn->id, isset( $_rn->slug ) ? (string) $_rn->slug : '' ) : '',
				);
				$_rni++;
			}
		}

		// ── SEO for single news item ───────────────────────────────────────────
		$_nb_img_url = '';
		if ( ! empty( $_nb_item->image_id ) ) {
			$_t = wp_get_attachment_image_url( (int) $_nb_item->image_id, 'large' );
			if ( $_t ) { $_nb_img_url = (string) $_t; }
		}
		adn_seo_register( array(
			'title'          => $_nb_title,
			'description'    => wp_strip_all_tags( $_nb_excerpt ),
			'canonical'      => '' !== $_nb_url ? $_nb_url : '',
			'image'          => $_nb_img_url,
			'breadcrumb'     => $_nb_breadcrumb,
			'type'           => 'website',
			'article_section'=> '' !== $_nb_label ? $_nb_label : 'News',
			'published'      => '' !== $_nb_stamp ? date( 'c', strtotime( $_nb_stamp ) ) : '',
			'schema_news'    => array(
				'title'   => $_nb_title,
				'excerpt' => wp_strip_all_tags( $_nb_excerpt ),
				'url'     => $_nb_url,
				'date'    => '' !== $_nb_stamp ? date( 'c', strtotime( $_nb_stamp ) ) : '',
				'image'   => $_nb_img_url,
				'label'   => $_nb_label,
			),
		) );

		get_header();

		adn_page_open( $_nb_ctx );
		?>

		<?php /* HERO */ ?>
		<?php if ( ! empty( $_nb_ctx['hero'] ) ) : ?>
			<?php adn_component( 'sections/page_hero', array(
				'hero'       => $_nb_ctx['hero'],
				'breadcrumb' => $_nb_breadcrumb,
			) ); ?>
		<?php endif; ?>

		<?php /* TWO-COLUMN LAYOUT */ ?>
		<div class="article-outer">
			<div class="article-layout">

				<div class="article-main interactive-app-view" id="main-content">
				<div class="news-single-article">

					<?php /* Meta bar: label + date */ ?>
					<div class="news-single-meta article-body">
						<?php if ( '' !== $_nb_label ) : ?>
							<span class="news-single-tag"><?php echo esc_html( $_nb_label ); ?></span>
						<?php endif; ?>
						<?php if ( $_nb_stamp ) : ?>
							<span class="news-single-date">
								<i class="fa-regular fa-calendar" aria-hidden="true"></i>
								<?php echo esc_html( date_i18n( 'F j, Y', strtotime( $_nb_stamp ) ) ); ?>
							</span>
						<?php endif; ?>
					</div>

					<?php /* Content */ ?>
					<?php if ( '' !== $_nb_content ) : ?>
						<div class="news-single-content article-body">
							<?php echo do_shortcode( wp_kses_post( $_nb_content ) ); ?>
						</div>
					<?php endif; ?>

					<?php /* Source link - excerpt used as the description text */ ?>
					<?php if ( ! empty( $_nb_item->link_url ) ) : ?>
						<div class="news-single-source">
							<span class="news-single-source-label">
								<?php if ( '' !== $_nb_excerpt ) : ?>
									<?php echo wp_kses_post( $_nb_excerpt ); ?>
								<?php else : ?>
									<?php esc_html_e( 'Read the original article at the source:', ADN_TEXT_DOMAIN ); ?>
								<?php endif; ?>
							</span>
							<a href="<?php echo esc_url( (string) $_nb_item->link_url ); ?>"
							   class="btn btn-outline"
							   target="<?php echo esc_attr( ! empty( $_nb_item->link_target ) ? (string) $_nb_item->link_target : '_blank' ); ?>"
							   rel="noopener noreferrer">
								<?php esc_html_e( 'Read Source', ADN_TEXT_DOMAIN ); ?> <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
							</a>
						</div>
					<?php endif; ?>

				</div><?php /* .news-single-article ends here */ ?>

				<?php /* Share bar - OUTSIDE the article box */ ?>
				<?php if ( $_nb_url ) : ?>
					<div class="news-single-share-out">
						<?php adn_component( 'sections/post_feedback', array(
							'share'        => array( 'url' => $_nb_url, 'title' => $_nb_title ),
							'hide_helpful' => true,
						) ); ?>
					</div>
				<?php endif; ?>

			</div>

			<div class="article-right-col">
				<aside class="article-sidebar">

					<?php /* Related news */ ?>
				<?php if ( ! empty( $_nb_related ) ) : ?>
				<div class="news-single-more">
					<?php adn_component( 'parts/news_widget', array( 'widget' => array(
						'heading' => array(
							'title'      => __( 'More News', ADN_TEXT_DOMAIN ),
							'link_label' => __( 'View all', ADN_TEXT_DOMAIN ) . ' →',
							'link_url'   => SITE_NEWS_URL,
						),
						'items'   => $_nb_related,
					) ) ); ?>
				</div>
				<?php endif; ?>

				<?php /* Browse topics */ ?>
				<?php if ( ! empty( $_nb_ctx['sidebar']['topics'] ) ) : ?>
					<?php adn_component( 'parts/sidebar_link_list', array( 'list' => array(
						'heading' => __( 'Browse Topics', ADN_TEXT_DOMAIN ),
						'items'   => $_nb_ctx['sidebar']['topics'],
					) ) ); ?>
				<?php endif; ?>

				<?php /* Newsletter */ ?>
				<?php if ( ! empty( $_nb_ctx['sidebar']['newsletter'] ) ) : ?>
					<?php adn_component( 'parts/sidebar_newsletter_signup', array( 'newsletter' => $_nb_ctx['sidebar']['newsletter'] ) ); ?>
				<?php endif; ?>

				<?php /* Contact / Guides Cards */ ?>
				<?php
				$_catalog = class_exists( 'ADN_Real_Loader' ) ? ADN_Real_Loader::json( 'sidebar_cards' ) : array();
				$_cards_to_show = array( 'guides', 'contact' );
				foreach ( $_cards_to_show as $_c ) {
					if ( ! empty( $_catalog[$_c] ) ) {
						adn_component( 'cards/sidebar_contact_card', array(
							'card' => (array) $_catalog[$_c]
						) );
					}
				}
				?>

				</aside>
			</div>

			</div><!-- .article-layout -->
		</div><!-- .article-outer -->
		<?php /* Bottom newsletter banner */ ?>
		<?php if ( ! empty( $_nb_ctx['bottom_newsletter'] ) ) : ?>
		<section class="newsletter-cta">
			<div class="container">
				<?php adn_component( 'sections/newsletter_cta', array( 'newsletter' => $_nb_ctx['bottom_newsletter'] ) ); ?>
			</div>
		</section>
		<?php endif; ?>

		<?php
		adn_page_close( $_nb_ctx );
		get_footer();
		return;
	}
}

/* ── Default: news listing view ─────────────────────────────────────────── */
$ctx = \Adn\Theme\Feature\News\Controller\NewsController::getContext();

adn_seo_register( array(
	'title'       => isset( $ctx['hero']['title'] )       ? (string) $ctx['hero']['title']       : '',
	'description' => isset( $ctx['hero']['description'] ) ? wp_strip_all_tags( (string) $ctx['hero']['description'] ) : '',
	'canonical'   => defined( 'SITE_NEWS_URL' ) ? home_url( SITE_NEWS_URL ) : '',
	'breadcrumb'  => isset( $ctx['breadcrumb'] )          ? $ctx['breadcrumb']                   : array(),
	'noindex'     => isset( $_GET['paged'] ) && (int) $_GET['paged'] > 1,
) );

get_header();

$_open_ctx               = $ctx;
$_open_ctx['breadcrumb'] = array();
adn_page_open( $_open_ctx );
?>

<?php /* ============================== HERO ============================== */ ?>
<?php if ( ! empty( $ctx['hero'] ) ) : ?>
	<?php adn_component( 'sections/page_hero', array(
		'hero'       => $ctx['hero'],
		'breadcrumb' => $ctx['breadcrumb'],
	) ); ?>
<?php endif; ?>

<?php /* ============================== CATEGORY TABS ============================== */ ?>
<?php if ( ! empty( $ctx['categories'] ) ) : ?>
	<?php adn_component( 'sections/news_cats_strip', array( 'categories' => $ctx['categories'] ) ); ?>
<?php endif; ?>

<?php /* ============================== MAIN LAYOUT ============================== */ ?>
<div class="news-layout">

	<main class="news-main" id="newsMain">

		<?php /* API-driven grid: news.js fetches /api/v1/news and renders normal cards here. */ ?>
		<div class="news-grid" id="newsGrid" aria-live="polite" aria-busy="true"></div>

		<?php /* Loading skeleton / spinner */ ?>
		<div class="news-state news-state--loading" id="newsLoading">
			<span class="news-spinner" aria-hidden="true"></span>
			<span><?php esc_html_e( 'Loading…', ADN_TEXT_DOMAIN ); ?></span>
		</div>

		<?php /* Empty result */ ?>
		<div class="news-state news-state--empty" id="newsEmpty" hidden>
			<i class="fa-regular fa-newspaper" aria-hidden="true"></i>
			<p><?php esc_html_e( 'No news found. Try a different filter or search.', ADN_TEXT_DOMAIN ); ?></p>
		</div>

		<?php /* Load more */ ?>
		<div class="load-more-wrap" id="loadMoreWrap" hidden>
			<button class="load-more-btn" id="loadMoreBtn" type="button">
				<?php echo esc_html( SITE_BTN_LOAD_MORE ); ?>
			</button>
		</div>

		<noscript>
			<div class="news-state news-state--empty">
				<p><?php esc_html_e( 'Please enable JavaScript to view the latest news.', ADN_TEXT_DOMAIN ); ?></p>
			</div>
		</noscript>

	</main>

	<aside class="news-sidebar">

		<?php /* Browse topics */ ?>
		<?php if ( ! empty( $ctx['sidebar']['topics'] ) ) : ?>
			<?php adn_component( 'parts/sidebar_link_list', array( 'list' => array(
				'heading' => __( 'Browse Topics', ADN_TEXT_DOMAIN ),
				'items'   => $ctx['sidebar']['topics'],
			) ) ); ?>
		<?php endif; ?>

		<?php if ( ! empty( $ctx['sidebar']['newsletter'] ) ) : ?>
			<?php adn_component( 'parts/sidebar_newsletter_signup', array( 'newsletter' => $ctx['sidebar']['newsletter'] ) ); ?>
		<?php endif; ?>

		<?php /* Contact / Guides Cards */ ?>
		<?php
		$_catalog = class_exists( 'ADN_Real_Loader' ) ? ADN_Real_Loader::json( 'sidebar_cards' ) : array();
		$_cards_to_show = array( 'guides', 'contact' );
		foreach ( $_cards_to_show as $_c ) {
			if ( ! empty( $_catalog[$_c] ) ) {
				adn_component( 'cards/sidebar_contact_card', array(
					'card' => (array) $_catalog[$_c]
				) );
			}
		}
		?>

	</aside>

</div>

<?php /* ============================== BOTTOM NEWSLETTER BANNER ============================== */ ?>
<?php if ( ! empty( $ctx['bottom_newsletter'] ) ) : ?>
<section class="newsletter-cta">
	<div class="container">
		<?php adn_component( 'sections/newsletter_cta', array( 'newsletter' => $ctx['bottom_newsletter'] ) ); ?>
	</div>
</section>
<?php endif; ?>

<?php adn_page_close( $ctx ); ?>

<?php get_footer(); ?>
