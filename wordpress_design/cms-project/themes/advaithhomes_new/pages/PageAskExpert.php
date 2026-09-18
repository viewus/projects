<?php
/**
 * Template Name: Ask an Expert
 *
 * pages/PageAskExpert.php - Expert directory listing page.
 * Category filter tabs + expert cards grid + sidebar.
 *
 * Architecture:
 *   DB (AH_Expert_DB) + WP page + admin banner option
 *     → intermediate/page_ask_expert_logical.php  adn_ask_expert_get_context()
 *       → THIS FILE (structure only)
 *
 * RULE: No hardcoded content or data reads here - only structure.
 * RULE: Header/footer come from header.php / footer.php via get_header() / get_footer().
 */

defined( 'ABSPATH' ) || exit;

$ctx = \Adn\Theme\Feature\AskExpert\Controller\AskExpertController::getContext();

// Register SEO before get_header() - adn_seo_head_output() runs on wp_head priority 1.
adn_seo_register( array(
	'description' => isset( $ctx['meta_description'] ) ? (string) $ctx['meta_description'] : '',
) );

get_header();

$_open_ctx               = $ctx;
$_open_ctx['breadcrumb'] = array();
adn_page_open( $_open_ctx );
?>

<?php /* ============================== HERO ============================== */ ?>
<?php adn_component( 'sections/page_hero', array(
	'hero'       => $ctx['hero'],
	'breadcrumb' => $ctx['breadcrumb'],
	'stats'      => $ctx['stats'],
) ); ?>

<?php /* ============================== CATEGORY TABS STRIP ============================== */ ?>
<?php if ( ! empty( $ctx['categories'] ) ) : ?>
	<?php adn_component( 'sections/expert_cats_strip', array( 'categories' => $ctx['categories'] ) ); ?>
<?php endif; ?>

<?php /* ============================== MAIN LAYOUT: CARDS + SIDEBAR ============================== */ ?>
<div class="expert-main-layout">

	<?php /* MAIN - expert cards */ ?>
	<div class="expert-cards-main">

		<?php /* Search bar */ ?>
		<div class="expert-search-row">
			<div class="search-input-wrap">
				<i class="fa-solid fa-magnifying-glass search-icon" aria-hidden="true"></i>
				<input type="search" id="expertSearch" autocomplete="off"
					placeholder="<?php esc_attr_e( 'Search by name or specialism…', ADN_TEXT_DOMAIN ); ?>"
					aria-label="<?php esc_attr_e( 'Search experts', ADN_TEXT_DOMAIN ); ?>">
				<button type="button" id="expertSearchClear" class="search-btn expert-search-clear"
					hidden aria-label="<?php esc_attr_e( 'Clear search', ADN_TEXT_DOMAIN ); ?>">
					<i class="fa-solid fa-xmark" aria-hidden="true"></i>
				</button>
			</div>
		</div>

		<?php /* ── Unlock bar: shown when there are locked profiles and visitor isn't unlocked ── */ ?>
		<?php if ( ! empty( $ctx['has_locked'] ) && empty( $ctx['is_unlocked'] ) ) : ?>
		<div class="expert-unlock-bar" id="expertUnlockBar" role="region" aria-label="<?php esc_attr_e( 'Unlock expert profiles', ADN_TEXT_DOMAIN ); ?>">
			<i class="fa-solid fa-lock eub-icon" aria-hidden="true"></i>
			<span class="eub-text"><?php esc_html_e( 'Enter the password to view all experts.', ADN_TEXT_DOMAIN ); ?></span>
			<div class="eub-form-row">
				<input type="text" id="expertUnlockPw" class="eub-input"
					placeholder="<?php esc_attr_e( 'Enter password…', ADN_TEXT_DOMAIN ); ?>"
					autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
					data-lpignore="true" data-1p-ignore
					aria-label="<?php esc_attr_e( 'Unlock password', ADN_TEXT_DOMAIN ); ?>">
				<button type="button" id="expertUnlockBtn" class="btn btn-primary eub-btn">
					<i class="fa-solid fa-unlock" aria-hidden="true"></i>
					<?php esc_html_e( 'Unlock', ADN_TEXT_DOMAIN ); ?>
				</button>
			</div>
			<p class="eub-error" id="expertUnlockError" hidden></p>
		</div>
		<?php endif; ?>

		<?php /* Loader - shown during search debounce */ ?>
		<div class="expert-grid-loader" id="expertGridLoader" hidden aria-hidden="true">
			<div class="egl-spinner"></div>
			<p><?php esc_html_e( 'Finding experts…', ADN_TEXT_DOMAIN ); ?></p>
		</div>

		<?php /* Empty state - shown when search/filter returns no results */ ?>
		<div class="expert-no-results" id="expertNoResults" hidden aria-live="polite">
			<i class="fa-solid fa-magnifying-glass enr-icon" aria-hidden="true"></i>
			<p class="enr-heading"><?php esc_html_e( 'No experts found', ADN_TEXT_DOMAIN ); ?></p>
			<p class="enr-sub"><?php esc_html_e( 'Try a different name or specialism, or clear your search to see all experts.', ADN_TEXT_DOMAIN ); ?></p>
			<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
				<button type="button" class="enr-reset" id="expertSearchReset"><?php esc_html_e( 'Clear Search', ADN_TEXT_DOMAIN ); ?></button>
				<a href="<?php echo esc_url( home_url( SITE_CONTACT_URL ) ); ?>" class="btn btn-primary" style="font-size:0.88rem;padding:9px 22px"><?php esc_html_e( 'Get Matched', ADN_TEXT_DOMAIN ); ?></a>
			</div>
		</div>

		<div class="expert-cards-grid" id="expertGrid">
			<?php
			$_locked_placeholder_shown = false;
			foreach ( $ctx['experts'] as $_expert ) :
				if ( ! empty( $_expert['is_locked'] ) ) {
					/* One placeholder shown so users know locked profiles exist. */
					if ( ! $_locked_placeholder_shown ) {
						$_locked_placeholder_shown = true;
						?>
						<div class="expert-card expert-card--locked-placeholder">
							<div class="elp-body">
								<div class="elp-icon-wrap" aria-hidden="true">
									<i class="fa-solid fa-lock elp-icon"></i>
								</div>
								<p class="elp-heading"><?php esc_html_e( 'Profiles are locked', ADN_TEXT_DOMAIN ); ?></p>
								<p class="elp-sub"><?php esc_html_e( 'Enter the password above to reveal restricted profiles.', ADN_TEXT_DOMAIN ); ?></p>
							</div>
						</div>
						<?php
					}
					/* Full card pre-rendered but hidden; JS reveals on unlock — no reload needed. */
					$_unlocked_expert               = (array) $_expert;
					$_unlocked_expert['is_locked']  = 0;
					$_unlocked_expert['unlockable'] = 1;
					adn_component( 'cards/expert_card', array( 'item' => $_unlocked_expert ) );
					?><?php
					continue;
				}
				adn_component( 'cards/expert_card', array( 'item' => (array) $_expert ) );
			endforeach;
			?>
		</div>

		<?php if ( ! empty( $ctx['cant_find_cta'] ) ) : ?>
			<div style="margin-top:28px;">
				<?php adn_component( 'sections/expert_cant_find', array( 'cant_find_cta' => $ctx['cant_find_cta'] ) ); ?>
			</div>
		<?php endif; ?>
	</div>

	<?php /* SIDEBAR */ ?>
	<?php if ( ! empty( $ctx['sidebar'] ) ) : ?>
		<?php adn_component( 'parts/expert_sidebar', array( 'sidebar' => $ctx['sidebar'] ) ); ?>
	<?php endif; ?>

</div>

<!-- <?php if ( ! empty( $ctx['latest_news']['items'] ) ) : ?>
<section class="page-latest-news">
	<div class="container">
		<?php adn_component( 'parts/news_widget', array( 'widget' => $ctx['latest_news'] ) ); ?>
	</div>
</section>
<?php endif; ?> -->

<?php
$_fi_exp     = get_option( 'adn_expert_banner', array() );
$_fi_exp_sec = ( is_array( $_fi_exp ) && ! empty( $_fi_exp['featured_in_section'] ) )
	? sanitize_key( $_fi_exp['featured_in_section'] ) : '';
if ( '' !== $_fi_exp_sec ) {
	adn_component( 'parts/featured_in', array( 'section' => $_fi_exp_sec ) );
}
?>

<?php adn_page_close( $ctx ); ?>

<?php get_footer(); ?>
