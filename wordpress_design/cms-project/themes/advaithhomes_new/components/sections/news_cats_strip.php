<?php
/**
 * components/sections/news_cats_strip.php - Sticky category tabs strip.
 *
 * Props: $categories[] { key, label, count }
 * The "all" tab is active by default; JS (news.js) handles switching.
 * Usage: adn_component( 'sections/news_cats_strip', array( 'categories' => $ctx['categories'] ) );
 */

defined( 'ABSPATH' ) || exit;

$categories = isset( $categories ) && is_array( $categories ) ? $categories : array();
?>
<div class="news-cats-strip" id="newsCatsStrip">
	<div class="news-cats-inner">
		<div class="news-cats-tabs">
			<?php foreach ( $categories as $cat ) :
				$key   = isset( $cat['key'] )   ? (string) $cat['key']   : '';
				$label = isset( $cat['label'] ) ? (string) $cat['label'] : '';
				$count = isset( $cat['count'] ) ? (int)    $cat['count'] : 0;
				$computed_key = '' !== $key ? $key : ( stripos( $label, 'all' ) !== false ? 'all' : sanitize_key( $label ) );
			?>
				<button
					type="button"
					class="news-cat-tab<?php echo 'all' === $computed_key ? ' active' : ''; ?>"
					data-cat="<?php echo esc_attr( $computed_key ); ?>"
					aria-pressed="<?php echo 'all' === $computed_key ? 'true' : 'false'; ?>"
				>
					<?php echo esc_html( $label ); ?>
					<?php if ( $count > 0 ) : ?>
						<span class="news-cat-count"><?php echo esc_html( (string) $count ); ?></span>
					<?php endif; ?>
				</button>
			<?php endforeach; ?>
		</div>
		<div class="news-cats-search-wrap">
			<i class="fa-solid fa-magnifying-glass news-cats-search-icon" aria-hidden="true"></i>
			<input
				type="search"
				id="newsSearchInput"
				class="news-cats-search-input"
				placeholder="<?php esc_attr_e( 'Search news…', ADN_TEXT_DOMAIN ); ?>"
				aria-label="<?php esc_attr_e( 'Search news', ADN_TEXT_DOMAIN ); ?>"
			/>
		</div>
	</div>
</div>
