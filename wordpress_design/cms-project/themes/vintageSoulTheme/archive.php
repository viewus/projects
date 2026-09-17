<?php
/**
 * VintageSoulTheme - Masterpiece Archive, Category & Tag Template
 */

use VintageSoul\Services\PostQueryService;
use VintageSoul\Services\RouteService;
use VintageSoul\Support\IconHelper;
use VintageSoul\Support\PostHelper;
use VintageSoul\Support\UrlHelper;
use VintageSoul\Support\View;

defined( 'ABSPATH' ) || exit;

get_header();

global $wp_query;
$total_posts = $wp_query->found_posts;
$archive_title = get_the_archive_title();
$archive_desc  = get_the_archive_description() ?: sprintf( __( 'Showing %d published chronicle(s) from our sugarcane archives.', 'vintagesoul' ), (int) $total_posts );
?>
<link rel="stylesheet" href="<?php echo esc_url( UrlHelper::resolve( 'assets/css/pages/search.css' ) ); ?>">
<link rel="stylesheet" href="<?php echo esc_url( UrlHelper::resolve( 'assets/css/pages/blog.css' ) ); ?>">

<main id="main" class="main archive-page-main">

	<!-- Subtle Botanical Background Particle Layer -->
	<?php View::component( 'background/parchment-botanical-bg', array( 'seed' => 77 ) ); ?>

	<!-- ═══════════ 1. ARCHIVE SUBPAGE HERO ═══════════ -->
	<?php
	View::component(
		'subpage-hero/subpage-hero',
		array(
			'id'    => 'archive-hero',
			'tag'   => '✦ THE CANE HOUSE CHRONICLES ✦',
			'title' => $archive_title,
			'sub'   => wp_strip_all_tags( $archive_desc ),
			'image' => 'assets/images/backgrounds/pure_sugarcane_forest_trees_engraving.jpg',
		)
	);
	?>

	<!-- ═══════════ 2. ARCHIVE GRID & SIDEBAR SECTION ═══════════ -->
	<div class="section single-article-section paper-rough">
		<div class="container single-article-layout">
			
			<!-- Main Archive Feed Column -->
			<div class="single-article-main-col">
				<?php if ( have_posts() ) : ?>
					<div class="search-results-grid">
						<?php while ( have_posts() ) : the_post();
							$post_id   = get_the_ID();
							$thumb_id  = get_post_thumbnail_id();
							$thumb_url = $thumb_id ? wp_get_attachment_image_url( $thumb_id, 'medium_large' ) : UrlHelper::resolve( 'assets/images/sugarcane/story_moments.jpg' );
							$cats      = get_the_category();
							$cat_name  = ! empty( $cats ) ? $cats[0]->name : 'Story';
						?>
							<article class="search-result-card frame--rough-cut" id="post-<?php the_ID(); ?>">
								<a class="search-result-card__media" href="<?php the_permalink(); ?>">
									<img src="<?php echo esc_url( $thumb_url ); ?>" alt="<?php the_title_attribute(); ?>" loading="lazy">
									<span class="search-result-card__type-badge"><?php echo esc_html( $cat_name ); ?></span>
								</a>
								<div class="search-result-card__body">
									<span class="search-result-card__date" style="font-family:'EB Garamond',serif; font-size:12px; color:#8e5f2b; margin-bottom:4px; display:block;">
										<?php echo esc_html( get_the_date( 'j F Y' ) ); ?>
									</span>
									<h2 class="search-result-card__title" style="font-size:17px; margin-bottom:8px;">
										<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
									</h2>
									<p class="search-result-card__excerpt" style="font-size:14px; line-height:1.5;">
										<?php echo esc_html( wp_trim_words( get_the_excerpt() ?: get_the_content(), 20, '...' ) ); ?>
									</p>
									<div class="search-result-card__footer" style="margin-top:auto;">
										<a class="search-result-card__link" href="<?php the_permalink(); ?>">
											<span><?php esc_html_e( 'READ CHRONICLE', 'vintagesoul' ); ?></span>
											<span class="link-arrow">→</span>
										</a>
									</div>
								</div>
							</article>
						<?php endwhile; ?>
					</div>

					<!-- Vintage Pagination -->
					<div class="search-pagination-wrap" style="margin-top: 40px; text-align: center;">
						<?php
						the_posts_pagination(
							array(
								'mid_size'           => 2,
								'prev_text'          => '← ' . __( 'PREVIOUS', 'vintagesoul' ),
								'next_text'          => __( 'NEXT', 'vintagesoul' ) . ' →',
								'screen_reader_text' => __( 'Chronicle Navigation', 'vintagesoul' ),
							)
						);
						?>
					</div>

				<?php else : ?>
					<div class="search-empty-card frame--ornate" style="text-align: center; padding: 48px 24px;">
						<span style="font-size: 38px; display: block; margin-bottom: 12px;">🌾</span>
						<h3 style="font-family: 'Cinzel', serif; font-size: 20px; color: #172b15; margin-bottom: 8px;">
							<?php esc_html_e( 'NO CHRONICLES FOUND IN THIS ARCHIVE', 'vintagesoul' ); ?>
						</h3>
						<p style="font-family: 'EB Garamond', serif; font-size: 16px; color: #4a3017; margin-bottom: 24px;">
							<?php esc_html_e( 'Explore our other botanical topics or return to the main parlour.', 'vintagesoul' ); ?>
						</p>
						<a href="<?php echo esc_url( RouteService::url( 'blog' ) ?: home_url( '/blog' ) ); ?>" class="btn btn--primary-vintage">
							<span><?php esc_html_e( 'ALL STORIES & ARTICLES', 'vintagesoul' ); ?></span>
						</a>
					</div>
				<?php endif; ?>
			</div>

			<!-- Sticky Sidebar Column -->
			<aside class="single-article__sidebar">
				<div class="single-article__sidebar-sticky">
					
					<!-- Sidebar Widget 1: Categories -->
					<?php
					View::component(
						'sidebar/category-tags-widget',
						array(
							'categories' => PostQueryService::categories(),
							'badge'      => '✦ TOPICS ✦',
							'title'      => __( 'EXPLORE TOPICS', 'vintagesoul' ),
						)
					);
					?>

					<!-- Sidebar Widget 2: Recent Chronicles -->
					<?php
					View::component(
						'sidebar/post-list-widget',
						array(
							'posts' => PostQueryService::recent( 4 ),
							'badge' => '✦ RECENT ✦',
							'title' => __( 'LATEST STORIES', 'vintagesoul' ),
						)
					);
					?>

					<!-- Sidebar Widget 3: London Parlour Concierge -->
					<div class="sidebar-widget sidebar-widget--concierge frame--ornate">
						<div class="sidebar-widget__header">
							<h3 class="sidebar-widget__title"><?php esc_html_e( 'BESPOKE ENQUIRIES', 'vintagesoul' ); ?></h3>
						</div>
						<p class="sidebar-concierge__text">
							<?php esc_html_e( 'Looking to feature fresh sugarcane drinks at your next private celebration or event?', 'vintagesoul' ); ?>
						</p>
						<a href="<?php echo esc_url( RouteService::url( 'contact' ) ?: home_url( '/contact' ) ); ?>" class="btn btn--secondary-vintage" style="width: 100%; text-align: center;">
							<span>GET IN TOUCH</span>
						</a>
					</div>

				</div>
			</aside>

		</div>
	</div>

</main>
<?php
get_footer();
