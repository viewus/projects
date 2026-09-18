<?php
/**
 * 404.php - Theme 404 Error Template.
 *
 * Renders a premium, user-friendly 404 error page.
 * Includes search form, key destination quick-links, and contact CTA.
 */

defined( 'ABSPATH' ) || exit;

get_header();

$chrome = function_exists( 'adn_service_site_chrome' ) ? adn_service_site_chrome() : array();

adn_page_open( array( 'chrome' => $chrome, 'breadcrumb' => array() ) );
?>

<div class="adn-404-page">
	<div class="adn-404-container">
		<div class="adn-404-card">

			<!-- Heading -->
			<h1 class="adn-404-title"><?php echo esc_html( adn_term( 'page_404.title', 'Page Not Found' ) ); ?></h1>
			<p class="adn-404-text"><?php echo esc_html( adn_term( 'page_404.text', "Oops! The page you are looking for doesn't exist or has been moved. Let's get you back on track." ) ); ?></p>

			<!-- Search Form -->
			<div class="adn-404-search">
				<form role="search" method="get" class="adn-404-search-form" action="<?php echo esc_url( home_url( '/' ) ); ?>">
					<div class="adn-404-search-field-wrap">
						<input type="search" class="adn-404-search-input" placeholder="<?php echo esc_attr( adn_term( 'page_404.search_placeholder', 'Search guides, calculators, news...' ) ); ?>" value="" name="s" required />
						<button type="submit" class="adn-404-search-btn" aria-label="Submit Search">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
						</button>
					</div>
				</form>
			</div>

			<!-- Quick Navigation Links -->
			<div class="adn-404-links-title"><?php echo esc_html( adn_term( 'page_404.destinations_title', 'Popular Destinations' ) ); ?></div>
			<div class="adn-404-links-grid">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="adn-404-link-item">
					<span class="adn-404-link-icon"><?php echo esc_html( adn_term( 'brand.icon', '🏠' ) ); ?></span>
					<strong class="adn-404-link-label"><?php echo esc_html( PAGE_TITLE_HOME ); ?></strong>
					<span class="adn-404-link-desc"><?php echo esc_html( adn_term( 'page_404.home_desc', 'Start from the beginning' ) ); ?></span>
				</a>
				<a href="<?php echo esc_url( home_url( SITE_GUIDES_URL ) ); ?>" class="adn-404-link-item">
					<span class="adn-404-link-icon"><?php echo esc_html( adn_term( 'icons.guides', '📖' ) ); ?></span>
					<strong class="adn-404-link-label"><?php echo esc_html( SITE_CONTENT_PLURAL ); ?></strong>
					<span class="adn-404-link-desc"><?php echo esc_html( adn_term( 'page_404.guides_desc', 'Explore UK buying guides' ) ); ?></span>
				</a>
				<a href="<?php echo esc_url( home_url( SITE_TOOLS_URL ) ); ?>" class="adn-404-link-item">
					<span class="adn-404-link-icon"><?php echo esc_html( adn_term( 'icons.tools', '🧮' ) ); ?></span>
					<strong class="adn-404-link-label"><?php echo esc_html( SITE_TOOLS_PLURAL ); ?></strong>
					<span class="adn-404-link-desc"><?php echo esc_html( adn_term( 'page_404.tools_desc', 'Estimate mortgage & costs' ) ); ?></span>
				</a>
				<a href="<?php echo esc_url( home_url( SITE_EXPERT_URL ) ); ?>" class="adn-404-link-item">
					<span class="adn-404-link-icon"><?php echo esc_html( adn_term( 'icons.expert_hero', '🤝' ) ); ?></span>
					<strong class="adn-404-link-label"><?php echo esc_html( SITE_EXPERT_LABEL ); ?></strong>
					<span class="adn-404-link-desc"><?php echo esc_html( adn_term( 'page_404.expert_desc', 'Consult a UK professional' ) ); ?></span>
				</a>
			</div>

			<!-- Support CTA -->
			<div class="adn-404-cta">
				<p class="adn-404-cta-text"><?php echo esc_html( adn_term( 'page_404.cta_text', "Still lost? We're here to help." ) ); ?></p>
				<a href="<?php echo esc_url( home_url( SITE_CONTACT_URL ) ); ?>" class="adn-404-cta-btn"><?php echo esc_html( adn_term( 'page_404.cta_label', 'Contact Us' ) ); ?></a>
			</div>
		</div>
	</div>
</div>

<?php
adn_page_close( array( 'chrome' => $chrome ) );
get_footer();
