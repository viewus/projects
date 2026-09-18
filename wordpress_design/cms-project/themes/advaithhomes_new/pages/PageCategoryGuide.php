<?php
/**
 * Template Name: Category Guide
 *
 * pages/PageCategoryGuide.php - Generic category landing page.
 *
 * Handles any slug-based category (buying, selling, house-movers…).
 * The page slug drives which JSON is loaded via the service layer, so
 * no content is hardcoded here.  When the plugin is ready to take over,
 * replace adn_service_category_data() internals - nothing else changes.
 *
 * Architecture:
 *   data/json/{slug}.json
 *     → apis/services.php  adn_service_category_data($slug)
 *       → intermediate/page_category_logical.php  adn_category_get_context()
 *         → THIS FILE  (structure only)
 *           → components/sections/*  components/parts/*  components/cards/*
 *
 * RULE: No hardcoded content and no data reads here - only structure.
 */

defined( 'ABSPATH' ) || exit;

$ctx = \Adn\Theme\Feature\CategoryGuide\Controller\CategoryGuideController::getContext();

// CSS/JS now loaded centrally via AssetLoader (wp_enqueue_scripts hook)

/* ── SEO: register title, description, canonical, breadcrumb for this category page ──
   Must run BEFORE get_header(): adn_seo_head_output() is hooked to wp_head at
   priority 1, so anything registered afterwards never reaches <title>, og:*,
   canonical or the JSON-LD schema. */
$_seo_title = isset( $ctx['hero']['title'] ) ? (string) $ctx['hero']['title'] : '';
$_seo_desc  = '';
if ( ! empty( $ctx['meta']['meta_description'] ) ) {
	$_seo_desc = wp_strip_all_tags( (string) $ctx['meta']['meta_description'] );
} elseif ( ! empty( $ctx['hero']['description'] ) ) {
	$_seo_desc = wp_strip_all_tags( (string) $ctx['hero']['description'] );
}
$_seo_slug = isset( $ctx['slug'] ) ? sanitize_key( (string) $ctx['slug'] ) : '';

/* Resolve hero image URL for og:image / twitter:image */
$_seo_image_cat   = '';
$_cat_hero_img_id = ! empty( $ctx['hero']['image_id'] ) ? (int) $ctx['hero']['image_id'] : 0;
if ( $_cat_hero_img_id > 0 ) {
	$_cat_img_url   = wp_get_attachment_image_url( $_cat_hero_img_id, 'full' );
	$_seo_image_cat = $_cat_img_url ? (string) $_cat_img_url : '';
}

/* Keywords/tags: category title drives both the keyword meta and og:article:tag */
$_cat_keywords = array_values( array_filter( array( $_seo_title ) ) );

/* FAQPage schema — pass FAQ items registered via AH_Category_Settings → faqs */
$_cat_schema_faqs = array();
if ( ! empty( $ctx['faqs']['items'] ) && is_array( $ctx['faqs']['items'] ) ) {
	foreach ( $ctx['faqs']['items'] as $_faq ) {
		$_fq = trim( (string) ( $_faq['question'] ?? '' ) );
		$_fa = trim( wp_strip_all_tags( (string) ( $_faq['answer'] ?? '' ) ) );
		if ( '' !== $_fq && '' !== $_fa ) {
			$_cat_schema_faqs[] = array( 'question' => $_fq, 'answer' => $_fa );
		}
	}
}

/* CollectionPage items: child topic guide cards */
$_cat_col_items = array();
if ( ! empty( $ctx['guides']['items'] ) && is_array( $ctx['guides']['items'] ) ) {
	foreach ( $ctx['guides']['items'] as $_gi ) {
		$_gtitle = (string) ( $_gi['title'] ?? $_gi['name'] ?? '' );
		$_gurl   = (string) ( $_gi['url']   ?? '' );
		if ( '' !== $_gtitle && '' !== $_gurl ) {
			$_cat_col_items[] = array( 'title' => $_gtitle, 'url' => $_gurl );
		}
	}
}

adn_seo_register( array(
	'title'             => $_seo_title,
	'description'       => $_seo_desc,
	'canonical'         => '' !== $_seo_slug ? home_url( '/' . $_seo_slug . '/' ) : '',
	'breadcrumb'        => isset( $ctx['breadcrumb'] ) ? $ctx['breadcrumb'] : array(),
	'image'             => $_seo_image_cat,
	'keywords'          => $_cat_keywords,
	'tags'              => $_cat_keywords,
	'article_section'   => $_seo_title,
	'schema_faqs'       => $_cat_schema_faqs,
	'schema_collection' => ! empty( $_cat_col_items ) ? array(
		'name'        => $_seo_title,
		'description' => $_seo_desc,
		'url'         => '' !== $_seo_slug ? home_url( '/' . $_seo_slug . '/' ) : '',
		'items'       => $_cat_col_items,
	) : array(),
) );

get_header(); // Loads wp_head() which triggers wp_enqueue_scripts hook

// Breadcrumb renders inside the hero banner - skip it from adn_page_open().
$_open_ctx                = $ctx;
$_open_ctx['breadcrumb']  = array();
adn_page_open( $_open_ctx );
?>

<?php /* ============================== HERO ============================== */ ?>
<?php 
if ( ! empty( $ctx['guides']['items'] ) ) {
	$services = array_slice( $ctx['guides']['items'], 0, 4 );
	
	// Default icons related to buying/property if the category data doesn't specify one
	$default_icons = array(
		'fa-solid fa-house-chimney',
		'fa-solid fa-magnifying-glass-location',
		'fa-solid fa-key',
		'fa-solid fa-file-signature'
	);
	
	foreach ( $services as $i => &$svc ) {
		if ( empty( $svc['icon'] ) ) {
			$svc['icon'] = $default_icons[ $i % count($default_icons) ];
		}
	}
	$ctx['hero']['services'] = $services;
}
adn_component( 'sections/page_hero', array(
	'hero'       => $ctx['hero'],
	'breadcrumb' => $ctx['breadcrumb'],
) ); ?>

<?php /* ============================== CONTROL CENTRE ============================== */ ?>
<?php if ( ! empty( $ctx['journey'] ) || ! empty( $ctx['spotlights']['terms'] ) ) : ?>
	<?php adn_component( 'sections/category_control_center', array(
		'journey'    => $ctx['journey'],
		'spotlights' => isset( $ctx['spotlights'] ) ? $ctx['spotlights'] : array(),
	) ); ?>
<?php endif; ?>

<?php /* ============================== MAIN + SIDEBAR ============================== */ ?>
<div class="container parent-term-category-list">
	<div class="page-with-sidebar">

		<div class="cat-guide-main">

			<?php /* ── Guides Grid ── */ ?>
			<?php if ( ! empty( $ctx['guides']['items'] ) ) { ?>
			<div class="category-section category-guides">
				<?php 
					$_guides_heading = isset( $ctx['guides']['heading'] ) ? $ctx['guides']['heading'] : array();
					unset( $_guides_heading['link_label'], $_guides_heading['link_url'] );
					adn_component( 'parts/section_headers/section_header', array(
					'heading' => $_guides_heading,
					'tag'     => 'h2',
				) ); ?>
				<div class="cat-guides-grid">
					<?php foreach ( (array) $ctx['guides']['items'] as $_cg_card ) : ?>
						<?php adn_component( 'cards/guide_card', array( 'card' => $_cg_card ) ); ?>
					<?php endforeach; ?>
				</div>
			</div>
			<?php } else{ ?>
				<div class="cat-no-results">
					<span class="cat-no-results-icon" aria-hidden="true"><i class="fa-regular fa-file-lines"></i></span>
					<h3 class="cat-no-results-title"><?php esc_html_e( 'No guides yet', ADN_TEXT_DOMAIN ); ?></h3>
					<p class="cat-no-results-sub"><?php esc_html_e( 'We\'re working on guides for this topic. Check back soon.', ADN_TEXT_DOMAIN ); ?></p>
				</div>
			<?php } ?>

			<?php /* ── Popular Posts (admin-curated) - Removed standalone section as it's now in the side column ── */ ?>

			<?php /* ── Resources (library items) ── */ ?>
			<?php if ( ! empty( $ctx['resources']['items'] ) ) : ?>
			<div class="category-section">
				<?php adn_component( 'sections/category_resources', array( 'resources' => $ctx['resources'] ) ); ?>
			</div>
			<?php endif; ?>

		</div>

		<aside class="sidebar-col">

			<?php /* ── Hot Topics ── */ ?>
			<?php if ( ! empty( $ctx['sidebar']['hot_topics'] ) ) : ?>
				<?php adn_component( 'parts/sidebar_hot_topics', array( 'hot_topics' => $ctx['sidebar']['hot_topics'] ) ); ?>
			<?php endif; ?>

			<?php /* ── Featured Topics ── */ ?>
			<?php if ( ! empty( $ctx['sidebar']['featured_topics'] ) ) : ?>
				<?php adn_component( 'parts/sidebar_featured_topics', array( 'featured_topics' => $ctx['sidebar']['featured_topics'] ) ); ?>
			<?php endif; ?>

			<?php /* ── Sidebar Cards (guides, experts, guidance, contact, news, calculators) ── */ ?>
			<?php if ( ! empty( $ctx['sidebar']['sidebar_cards'] ) ) : ?>
				<?php adn_component( 'parts/sidebar_cards', array( 'sidebar_cards' => $ctx['sidebar']['sidebar_cards'] ) ); ?>
			<?php endif; ?>

			<?php /* ── Quick Links ── */ ?>
			<?php
			$_cat_all  = class_exists( 'AH_Category_Settings' ) ? AH_Category_Settings::get_all( $ctx['slug'] ) : array();
			$_ql_d     = isset( $_cat_all['quick_links'] ) && is_array( $_cat_all['quick_links'] ) ? $_cat_all['quick_links'] : array();
			if ( ! empty( $_ql_d['items'] ) ) :
				adn_component( 'parts/quick_links_widget', array( 'quick_links' => $_ql_d ) );
			endif; ?>

		</aside>

	</div>
</div>

<?php /* ============================== TOOLS CAROUSEL (full-width) ============================== */ ?>
<?php if ( ! empty( $ctx['calculators']['items'] ) ) : ?>
<section class="cat-guide-tools-section">
	<div class="container">
		<?php adn_component( 'parts/section_headers/section_header', array(
			'heading' => isset( $ctx['calculators']['heading'] ) ? $ctx['calculators']['heading'] : array(),
			'tag'     => 'h2',
		) ); ?>
		<div class="cgt-carousel-wrap">
			<div class="cgt-track">
				<?php foreach ( (array) $ctx['calculators']['items'] as $_tc ) : ?>
					<?php adn_component( 'cards/tool_card', array( 'card' => $_tc ) ); ?>
				<?php endforeach; ?>
			</div>
			<button class="cgt-arrow cgt-arrow--prev" aria-label="<?php esc_attr_e( 'Previous', ADN_TEXT_DOMAIN ); ?>">
				<i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
			</button>
			<button class="cgt-arrow cgt-arrow--next" aria-label="<?php esc_attr_e( 'Next', ADN_TEXT_DOMAIN ); ?>">
				<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
			</button>
		</div>
	</div>
</section>
<script>
(function(){
	var wrap  = document.currentScript.previousElementSibling;
	var track = wrap.querySelector('.cgt-track');
	var prev  = wrap.querySelector('.cgt-arrow--prev');
	var next  = wrap.querySelector('.cgt-arrow--next');
	if(!track||!prev||!next){ return; }
	function cardW(){ var c=track.children[0]; return c ? c.offsetWidth + parseInt(getComputedStyle(track).gap||0) : 320; }
	function upd(){
		prev.classList.toggle('cgt-arrow--hidden', track.scrollLeft <= 2);
		next.classList.toggle('cgt-arrow--hidden', track.scrollLeft >= track.scrollWidth - track.clientWidth - 2);
	}
	prev.addEventListener('click', function(){ track.scrollBy({left:-cardW()*2, behavior:'smooth'}); });
	next.addEventListener('click', function(){ track.scrollBy({left: cardW()*2, behavior:'smooth'}); });
	track.addEventListener('scroll', upd, {passive:true});
	upd();
}());
</script>
<?php endif; ?>

<?php /* ============================== CTA BANNER (interruption after guides) ============================== */ ?>
<?php if ( ! empty( $ctx['cta_banner']['title'] ) ) : ?>
<div class="cat-cta-wrap cat-cta-wrap--inline">
	<?php adn_component( 'parts/cta_banner', array( 'cta_banner' => $ctx['cta_banner'] ) ); ?>
</div>
<?php endif; ?>

<?php /* ============================== LATEST UPDATES + POPULAR GUIDES (full-width, home-page hero style) ============================== */ ?>
<?php if ( ! empty( $ctx['regulations']['items'] ) ) : 

	// ── Remap popular_posts OR guides to hot_topics item format ──
	$_cat_ht_items  = array();
	$_cat_ht_source = ! empty( $ctx['popular_posts']['items'] )
		? array_slice( (array) $ctx['popular_posts']['items'], 0, 5 )
		: array_slice( (array) ( isset( $ctx['guides']['items'] ) ? $ctx['guides']['items'] : array() ), 0, 5 );

	foreach ( $_cat_ht_source as $_phi ) {
		$_ht_label = ! empty( $_phi['title'] )    ? (string) $_phi['title']
		           : ( ! empty( $_phi['category'] ) ? (string) $_phi['category'] : '' );
		if ( '' === $_ht_label ) { continue; }
		$_cat_ht_items[] = array(
			'text'      => $_ht_label,
			'url'       => ! empty( $_phi['url'] )   ? (string) $_phi['url']   : '#',
			'icon'      => '📚',
			'thumbnail' => ! empty( $_phi['image'] ) ? (string) $_phi['image'] : '',
		);
	}

	// ── Hot topics heading ──
	$_cat_ht_heading = ! empty( $ctx['popular_posts']['heading']['title'] )
		? (string) $ctx['popular_posts']['heading']['title']
		: adn_term( 'category_page.popular_guides', 'Popular Guides' );
?>
<section class="news-three-col cat-latest-updates-section">
	<div class="container">
		<?php adn_component( 'sections/news_three_col', array(
			'is_home_news' => true,
			'news' => array(
				'heading' => isset( $ctx['regulations']['heading'] )
					? $ctx['regulations']['heading']
					: array( 'title' => adn_term( 'category_page.latest_updates', 'Latest Updates' ), 'link_label' => adn_term( 'category_page.view_all', 'View all →' ), 'link_url' => SITE_NEWS_URL ),
				'items'   => $ctx['regulations']['items'],
			),
			'hot_topics' => ! empty( $_cat_ht_items ) ? array(
				'title' => $_cat_ht_heading,
				'items' => $_cat_ht_items,
				'cta'   => array(),
			) : array(),
		) ); ?>
	</div>
</section>
<?php endif; ?>

<?php /* ============================== FAQs ============================== */ ?>
<?php if ( ! empty( $ctx['faqs']['items'] ) ) : ?>
<div class="section-faqs">
	<?php adn_component( 'parts/faq_list', array(
		'faqs'    => $ctx['faqs']['items'],
		'heading' => $ctx['faqs']['heading'] ?? '',
	) ); ?>
</div>
<?php endif; ?>

<?php /* ============================== NEWSLETTER ============================== */ ?>
<?php if ( ! empty( $ctx['newsletter'] ) ) : ?>
<section class="newsletter-cta">
	<div class="container">
		<?php adn_component( 'sections/newsletter_cta', array( 'newsletter' => $ctx['newsletter'] ) ); ?>
	</div>
</section>
<?php endif; ?>

<?php
$_fi_cat_d   = isset( $ctx['slug'] ) ? AH_Category_Settings::get_all( sanitize_key( $ctx['slug'] ) ) : array();
$_fi_cat_sec = ( isset( $_fi_cat_d['featured_in']['section'] ) && '' !== $_fi_cat_d['featured_in']['section'] )
	? sanitize_key( $_fi_cat_d['featured_in']['section'] ) : '';
if ( ! empty( $_fi_cat_sec ) ) {
	adn_component( 'parts/featured_in', array( 'section' => $_fi_cat_sec ) );
}
?>

<?php adn_page_close( $ctx );

get_footer(); ?>
