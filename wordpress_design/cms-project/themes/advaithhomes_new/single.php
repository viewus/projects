<?php
/**
 * single.php - WordPress single post template.
 *
 * Renders any standard WordPress post.
 * Content (title, body, date, author, excerpt) comes from the WP post system.
 * Extended fields (category tag, read time, key takeaways, article icon)
 * come from post meta written by the plugin or the WP editor.
 * Sidebar data (tools, newsletter) comes from data/json/post_sidebar.json.
 * Related guides and latest news are queried live via WP_Query.
 *
 * Post meta keys (all optional, theme provides sensible defaults):
 *   _adn_article_icon      string   emoji icon shown in the article header
 *   _adn_read_time         string   "12 min read"
 *   _adn_key_takeaways     string   JSON-encoded string[] for the takeaways box
 *   _adn_category_tag      string   display category name override
 *
 * Assets: single.css + single.js are auto-enqueued via ThemeHelpers.php
 * when is_single() is true - no Template Name comment needed here.
 *
 * RULE: No hardcoded content or data reads here - only structure.
 * RULE: Header/footer come from header.php / footer.php via get_header() / get_footer().
 */

defined( 'ABSPATH' ) || exit;

// CSS/JS now loaded centrally via AssetLoader (wp_enqueue_scripts hook)


/*
 * Set up the WP post loop so all template tags (the_title, the_content, etc.)
 * return the correct data. single.php always has exactly one post in the query.
 */
if ( have_posts() ) {
	the_post();
}

$ctx = \Adn\Theme\Feature\Article\Controller\ArticleController::getContext();

/*
 * Register SEO metadata (breadcrumbs, dates, article type) so SeoService emits complete schema.
 */
adn_seo_register( array(
	'title'       => get_the_title(),
	'description' => ! empty( $ctx['header']['description'] ) ? $ctx['header']['description'] : wp_strip_all_tags( get_the_excerpt() ),
	'canonical'   => get_permalink(),
	'breadcrumb'  => ! empty( $ctx['breadcrumb'] ) ? $ctx['breadcrumb'] : array(),
	'published'   => get_the_date( 'c' ),
	'modified'    => get_the_modified_date( 'c' ),
	'type'        => 'website',
) );

get_header();
?>

<?php adn_component( 'parts/main_header', array( 'chrome' => $ctx['chrome'] ) ); ?>

<div class="reading-progress-bar" id="readingProgress" aria-hidden="true"></div>

<?php /* ============================== BREADCRUMB ============================== */ ?>
<?php if ( ! empty( $ctx['breadcrumb'] ) ) : ?>
	<?php adn_component( 'sections/page_hero', array(
		'hero'       => $ctx['header'] ?? array(),
		'breadcrumb' => $ctx['breadcrumb'],
		'share'      => isset($ctx['share']) ? $ctx['share'] : null,
		'cms_terms'  => isset($ctx['cms_terms']) ? $ctx['cms_terms'] : null,
		'sidebar'    => isset($ctx['sidebar']) ? $ctx['sidebar'] : null,
	) ); ?>
<?php endif; ?>

<?php /* ── CMS Taxonomy Terms strip ── */ ?>
<?php if ( ! empty( $ctx['cms_terms'] ) ) : ?>
<div class="post-terms-bar">
	<div class="container">
		<?php foreach ( $ctx['cms_terms'] as $_pt ) : ?>
			<a href="<?php echo esc_url( $_pt['url'] ); ?>" class="post-term-pill">
				<?php if ( '' !== $_pt['emoji'] ) echo esc_html( $_pt['emoji'] ) . ' '; echo esc_html( $_pt['name'] ); ?>
			</a>
		<?php endforeach; ?>
	</div>
</div>
<?php endif; ?>

<?php /* ============================== ARTICLE LAYOUT ============================== */ ?>
<div class="article-outer">

	<?php /* Decorative animated background — scoped to post area */ ?>
	<div class="ah-bg-canvas" aria-hidden="true">

		<?php /* 1 — Classic family home with chimney + cross windows */ ?>
		<svg class="ah-shape ah-shape--1" viewBox="0 0 100 95" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect x="68" y="14" width="10" height="24" stroke="currentColor" stroke-width="2"/>
			<polygon points="5,48 50,6 95,48" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
			<rect x="14" y="48" width="72" height="44" stroke="currentColor" stroke-width="2"/>
			<rect x="37" y="65" width="26" height="27" rx="13" stroke="currentColor" stroke-width="1.8"/>
			<rect x="18" y="56" width="16" height="14" stroke="currentColor" stroke-width="1.5"/>
			<line x1="26" y1="56" x2="26" y2="70" stroke="currentColor" stroke-width="1"/>
			<line x1="18" y1="63" x2="34" y2="63" stroke="currentColor" stroke-width="1"/>
			<rect x="66" y="56" width="16" height="14" stroke="currentColor" stroke-width="1.5"/>
			<line x1="74" y1="56" x2="74" y2="70" stroke="currentColor" stroke-width="1"/>
			<line x1="66" y1="63" x2="82" y2="63" stroke="currentColor" stroke-width="1"/>
		</svg>

		<?php /* 2 — Modern flat-roof house with large glazing */ ?>
		<svg class="ah-shape ah-shape--2" viewBox="0 0 110 75" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect x="4" y="18" width="102" height="52" stroke="currentColor" stroke-width="2"/>
			<rect x="1" y="12" width="108" height="9" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
			<rect x="10" y="28" width="36" height="26" stroke="currentColor" stroke-width="1.8"/>
			<line x1="28" y1="28" x2="28" y2="54" stroke="currentColor" stroke-width="1.2"/>
			<line x1="10" y1="41" x2="46" y2="41" stroke="currentColor" stroke-width="1.2"/>
			<rect x="56" y="40" width="22" height="30" stroke="currentColor" stroke-width="1.8"/>
			<rect x="83" y="30" width="22" height="18" stroke="currentColor" stroke-width="1.5"/>
			<line x1="94" y1="30" x2="94" y2="48" stroke="currentColor" stroke-width="1"/>
		</svg>

		<?php /* 3 — Cosy cottage with steep roof + round attic window */ ?>
		<svg class="ah-shape ah-shape--3" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
			<polygon points="4,42 40,4 76,42" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
			<circle cx="40" cy="28" r="7" stroke="currentColor" stroke-width="1.5"/>
			<rect x="12" y="42" width="56" height="34" stroke="currentColor" stroke-width="2"/>
			<path d="M30 76 L30 58 Q30 50 40 50 Q50 50 50 58 L50 76" stroke="currentColor" stroke-width="1.8" fill="none"/>
			<rect x="14" y="50" width="13" height="11" stroke="currentColor" stroke-width="1.5"/>
			<rect x="53" y="50" width="13" height="11" stroke="currentColor" stroke-width="1.5"/>
		</svg>

		<?php /* 4 — Tall townhouse / apartment block */ ?>
		<svg class="ah-shape ah-shape--4" viewBox="0 0 70 110" fill="none" xmlns="http://www.w3.org/2000/svg">
			<polygon points="4,32 35,4 66,32" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
			<rect x="8" y="32" width="54" height="74" stroke="currentColor" stroke-width="2"/>
			<rect x="16" y="40" width="14" height="12" stroke="currentColor" stroke-width="1.4"/>
			<rect x="40" y="40" width="14" height="12" stroke="currentColor" stroke-width="1.4"/>
			<rect x="16" y="60" width="14" height="12" stroke="currentColor" stroke-width="1.4"/>
			<rect x="40" y="60" width="14" height="12" stroke="currentColor" stroke-width="1.4"/>
			<rect x="16" y="80" width="14" height="12" stroke="currentColor" stroke-width="1.4"/>
			<rect x="40" y="80" width="14" height="12" stroke="currentColor" stroke-width="1.4"/>
			<rect x="27" y="95" width="16" height="11" stroke="currentColor" stroke-width="1.5"/>
		</svg>

		<?php /* 5 — House + tree beside it */ ?>
		<svg class="ah-shape ah-shape--5" viewBox="0 0 110 80" fill="none" xmlns="http://www.w3.org/2000/svg">
			<polygon points="10,40 50,8 90,40" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
			<rect x="18" y="40" width="64" height="36" stroke="currentColor" stroke-width="2"/>
			<rect x="34" y="52" width="18" height="24" stroke="currentColor" stroke-width="1.6"/>
			<rect x="22" y="48" width="12" height="10" stroke="currentColor" stroke-width="1.4"/>
			<rect x="66" y="48" width="12" height="10" stroke="currentColor" stroke-width="1.4"/>
			<ellipse cx="100" cy="38" rx="10" ry="12" stroke="currentColor" stroke-width="1.6"/>
			<ellipse cx="97" cy="50" rx="7" ry="9" stroke="currentColor" stroke-width="1.4"/>
			<line x1="100" y1="50" x2="100" y2="76" stroke="currentColor" stroke-width="1.8"/>
		</svg>

		<?php /* 6 — House with garage */ ?>
		<svg class="ah-shape ah-shape--6" viewBox="0 0 120 85" fill="none" xmlns="http://www.w3.org/2000/svg">
			<polygon points="6,42 55,6 104,42" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
			<rect x="14" y="42" width="82" height="40" stroke="currentColor" stroke-width="2"/>
			<rect x="60" y="55" width="32" height="27" stroke="currentColor" stroke-width="1.8"/>
			<line x1="60" y1="63" x2="92" y2="63" stroke="currentColor" stroke-width="1"/>
			<line x1="60" y1="71" x2="92" y2="71" stroke="currentColor" stroke-width="1"/>
			<rect x="22" y="58" width="16" height="14" stroke="currentColor" stroke-width="1.5"/>
			<line x1="30" y1="58" x2="30" y2="72" stroke="currentColor" stroke-width="1"/>
			<line x1="22" y1="65" x2="38" y2="65" stroke="currentColor" stroke-width="1"/>
			<rect x="42" y="53" width="14" height="29" stroke="currentColor" stroke-width="1.6"/>
		</svg>

		<?php /* 7 — Small simple house (tiny floating) */ ?>
		<svg class="ah-shape ah-shape--7" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
			<polygon points="3,26 25,3 47,26" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
			<rect x="8" y="26" width="34" height="22" stroke="currentColor" stroke-width="1.8"/>
			<rect x="18" y="34" width="14" height="14" stroke="currentColor" stroke-width="1.4"/>
			<rect x="10" y="30" width="9" height="8" stroke="currentColor" stroke-width="1.2"/>
			<rect x="31" y="30" width="9" height="8" stroke="currentColor" stroke-width="1.2"/>
		</svg>

	</div>

	<div class="article-layout">

		<?php /* ── MAIN ARTICLE COLUMN ── */ ?>
		<div class="article-main interactive-app-view" id="main-content">

			<?php /* Key takeaways box (renders nothing when empty) */ ?>
			<?php adn_component( 'sections/post_key_takeaways', array( 'key_takeaways' => $ctx['key_takeaways'] ) ); ?>

			<?php /* WordPress post content - blocks / classic editor HTML */ ?>
			<div class="article-body">
				<?php
				$content_html = apply_filters( 'the_content', get_the_content() );
				$content_html = preg_replace( '/<h1\b([^>]*)>(.*?)<\/h1>/is', '<h2$1>$2</h2>', $content_html );
				$content_html = preg_replace( '/<article\b([^>]*)>/is', '<div$1>', $content_html );
				$content_html = preg_replace( '/<\/article\s*>/is', '</div>', $content_html );
				echo $content_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				?>
			</div>

			<?php /* Feedback row + social share */ ?>
			<?php adn_component( 'sections/post_feedback', array( 'share' => $ctx['share'] ?? array() ) ); ?>

			<?php /* Author box */ ?>
			<!-- <?php adn_component( 'sections/post_author', array( 'author' => $ctx['author'] ) ); ?> -->

			<?php /* Disclaimer */ ?>
			<!-- <?php adn_component( 'sections/post_disclaimer' ); ?> -->

			<?php /* Comments */ ?>
			<?php if ( comments_open() || get_comments_number() ) : ?>
				<?php comments_template(); ?>
			<?php endif; ?>

			<?php /* Expert + Contact block (closure scope mirrors adn_component without realpath check) */ ?>
			<?php
			( function ( $experts, $contact ) {
				$file = ADN_THEME_DIR . '/components/sections/post_expert_contact.php';
				if ( file_exists( $file ) ) {
					require $file;
				}
			} )(
				isset( $ctx['expert_contact']['experts'] ) ? $ctx['expert_contact']['experts'] : array(),
				isset( $ctx['expert_contact']['contact'] ) ? $ctx['expert_contact']['contact'] : array()
			);
			?>

		</div>

		<?php /* ── RIGHT COLUMN: TOC + Sidebar ── */ ?>
		<div class="article-right-col">

			<div class="article-toc-wrapper">
				<?php adn_component( 'parts/post_sidebar_toc' ); ?>
			</div>

			<aside class="article-sidebar" aria-label="<?php esc_attr_e( 'Article sidebar', ADN_TEXT_DOMAIN ); ?>">

			<?php /* Related guides (from WP_Query - same category, latest 4) */ ?>
			<?php if ( ! empty( $ctx['related_guides'] ) ) : ?>
				<div class="">
					<?php adn_component( 'parts/post_sidebar_related', array( 'related_guides' => $ctx['related_guides'] ) ); ?>
				</div>
			<?php endif; ?>

			<?php /* Highlight Links */ ?>
			<?php if ( ! empty( $ctx['highlight_links'] ) ) : ?>
				<div class="">
					<?php adn_component( 'parts/post_sidebar_highlights', array( 'highlight_links' => $ctx['highlight_links'] ) ); ?>
				</div>
			<?php endif; ?>

			<?php /* Related Content (Custom Links) */ ?>
			<?php if ( ! empty( $ctx['related_content'] ) ) : ?>
				<div class="container_post_sidebar_related_content" >
					<?php adn_component( 'parts/post_sidebar_related_content', array( 'related_content' => $ctx['related_content'] ) ); ?>
				</div>
			<?php endif; ?>


			<?php /* Reusable Cards from Catalog */ ?>
			<?php 
			$_catalog = array();
			if ( class_exists( 'ADN_Real_Loader' ) ) {
				$_catalog = ADN_Real_Loader::json( 'sidebar_cards' );
			}
			$_cards_to_show = array( 'guides', 'contact' );
			if ( ! empty( $_catalog ) ) :
				foreach ( $_cards_to_show as $_key ) :
					if ( ! isset( $_catalog[$_key] ) ) { continue; }
					adn_component( 'cards/sidebar_contact_card', array(
						'card'         => (array) $_catalog[$_key],
						'inline_style' => 'margin-bottom: 24px;'
					) );
			?>
			<?php 
				endforeach;
			endif; 
			?>

			<?php /* Newsletter signup */ ?>
			<?php if ( ! empty( $ctx['sidebar']['newsletter'] ) ) : ?>
				<div class="">
					<?php adn_component( 'parts/post_sidebar_newsletter', array( 'newsletter' => $ctx['sidebar']['newsletter'] ) ); ?>
				</div>
			<?php endif; ?>

		</aside>

		</div><!-- .article-right-col -->

	</div>
</div>

<?php /* ============================== RELATED ARTICLES ============================== */ ?>
<section class="post-related-articles" id="postRelatedArticles"
	data-post="<?php echo esc_attr( get_the_ID() ); ?>"
	data-ajax="<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>"
	hidden>
	<div class="container">
		<h3 class="pra-heading"><?php echo esc_html( adn_term( 'labels.also_viewed_articles', 'Also View' ) ); ?></h3>
		<div class="pra-row" id="praRow"></div>
	</div>
</section>
<script>
( function () {
	var sec  = document.getElementById( 'postRelatedArticles' );
	var row  = document.getElementById( 'praRow' );
	if ( ! sec || ! row ) { return; }

	var postId = sec.dataset.post;
	var ajax   = sec.dataset.ajax;
	if ( ! postId || ! ajax ) { return; }

	var xhr = new XMLHttpRequest();
	xhr.open( 'POST', ajax, true );
	xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8' );
	xhr.onreadystatechange = function () {
		if ( xhr.readyState !== 4 ) { return; }
		try {
			var res = JSON.parse( xhr.responseText );
			if ( res && res.success && res.data && res.data.articles && res.data.articles.length ) {
				render( res.data.articles );
				sec.removeAttribute( 'hidden' );
			}
		} catch ( e ) {}
	};
	xhr.send( 'action=adn_post_related_articles&post_id=' + encodeURIComponent( postId ) );

	function x( s ) {
		return String( s ).replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' ).replace( /"/g, '&quot;' );
	}

	function render( articles ) {
		var html = '';
		articles.forEach( function ( a ) {
			html += '<a href="' + x( a.url ) + '" class="pra-card">';
			var defaultThumb = "<?php echo esc_js( esc_url( get_template_directory_uri() . THEME_DEFAULT_TOPIC_IMG . '?v=' . LOCAL_CACHE_VERSION ) ); ?>";
			var thumb = a.thumbnail || defaultThumb;
			html += '<div class="pra-thumb"><img src="' + x( thumb ) + '" alt="" loading="lazy" onerror="this.onerror=null;this.src=\'' + defaultThumb + '\';"></div>';
			html += '<div class="pra-body">';
			html += '<p class="pra-title">' + x( a.title ) + '</p>';
			if ( a.excerpt ) {
				html += '<p class="pra-excerpt">' + x( a.excerpt ) + '</p>';
			}
			html += '<span class="pra-read">Read more <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
			html += '</div></a>';
		} );
		row.innerHTML = html;
	}
} () );
</script>

<?php /* ============================== FOOTER ============================== */ ?>
<?php
if ( function_exists( 'adn_render_slug_attached_faqs' ) ) {
	adn_render_slug_attached_faqs();
}
adn_component( 'parts/pre_footer' );
adn_component( 'parts/main_footer', array( 'footer' => isset( $ctx['chrome']['footer'] ) ? $ctx['chrome']['footer'] : array() ) );
adn_component( 'parts/post_footer' );
adn_component( 'parts/post_footer_notice' );

get_footer();
?>
