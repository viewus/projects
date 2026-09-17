<?php
/**
 * VintageSoulTheme - "In Our Culture" Story + Photo Split Section
 *
 * Content: data/content/culture.json (tag, title, body, image).
 * Pass a `culture` array to override the JSON.
 */

defined( 'ABSPATH' ) || exit;

use VintageSoul\DataProviders\JsonFileProvider;
use VintageSoul\Support\UrlHelper;
use VintageSoul\Support\View;

$culture_data = ! empty( $culture ) && is_array( $culture ) ? $culture : (array) JsonFileProvider::read( 'data/content/culture.json' );

$c_tag   = (string) ( $culture_data['tag'] ?? '' );
$c_title = (string) ( $culture_data['title'] ?? '' );
$c_body  = (string) ( $culture_data['body'] ?? '' );
$c_image = trim( (string) ( $culture_data['image'] ?? '' ) );

if ( '' === $c_title && '' === $c_body ) {
	return;
}
?>
<section class="section section--culture culture-section paper-rough" id="culture">
	<div class="container">
		<div class="culture-split<?php echo '' === $c_image ? ' culture-split--text-only' : ''; ?>">

			<div class="culture-split__copy">
				<?php
				View::component(
					'section-header/section-header',
					array(
						'tag'    => $c_tag,
						'title'  => $c_title,
						'align'  => 'left',
						'ribbon' => true,
					)
				);
				?>
				<?php if ( '' !== $c_body ) : ?>
					<p class="culture-split__body"><?php echo esc_html( $c_body ); ?></p>
				<?php endif; ?>
			</div>

			<?php if ( '' !== $c_image ) : ?>
				<figure class="culture-split__media photo--rough-cut">
					<img src="<?php echo esc_url( UrlHelper::resolve( $c_image ) ); ?>" alt="<?php echo esc_attr( wp_strip_all_tags( $c_title ) ); ?>" loading="lazy" decoding="async">
				</figure>
			<?php endif; ?>

		</div>
	</div>
</section>
