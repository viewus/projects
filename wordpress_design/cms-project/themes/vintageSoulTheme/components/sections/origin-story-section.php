<?php
/**
 * VintageSoulTheme - "Where It All Began" Origin Narrative Section
 *
 * Content: data/content/origin-history.json (tag, title, paragraphs[], image).
 * Pass an `origin` array to override the JSON.
 */

defined( 'ABSPATH' ) || exit;

use VintageSoul\DataProviders\JsonFileProvider;
use VintageSoul\Support\UrlHelper;
use VintageSoul\Support\View;

$origin_data = ! empty( $origin ) && is_array( $origin ) ? $origin : (array) JsonFileProvider::read( 'data/content/origin-history.json' );

$o_tag        = (string) ( $origin_data['tag'] ?? '' );
$o_title      = (string) ( $origin_data['title'] ?? '' );
$o_paragraphs = array_values( array_filter( array_map( 'strval', (array) ( $origin_data['paragraphs'] ?? array() ) ) ) );
$o_image      = trim( (string) ( $origin_data['image'] ?? '' ) );

if ( empty( $o_paragraphs ) ) {
	return;
}
?>
<section class="section section--origin origin-story-section paper-rough" id="origin-story">
	<div class="container">
		<?php
		View::component(
			'section-header/section-header',
			array(
				'tag'    => $o_tag,
				'title'  => $o_title,
				'ribbon' => true,
			)
		);
		?>

		<div class="origin-story<?php echo '' === $o_image ? ' origin-story--text-only' : ''; ?>">
			<?php if ( '' !== $o_image ) : ?>
				<figure class="origin-story__media frame--ornate-sm">
					<img src="<?php echo esc_url( UrlHelper::resolve( $o_image ) ); ?>" alt="<?php echo esc_attr( wp_strip_all_tags( $o_title ) ); ?>" loading="lazy" decoding="async">
				</figure>
			<?php endif; ?>

			<div class="origin-story__copy">
				<?php foreach ( $o_paragraphs as $o_idx => $o_para ) : ?>
					<p class="origin-story__para<?php echo 0 === $o_idx ? ' origin-story__para--lead' : ''; ?>"><?php echo esc_html( $o_para ); ?></p>
				<?php endforeach; ?>
			</div>
		</div>
	</div>
</section>
