<?php
/**
 * VintageSoulTheme - "Why It Matters" Icon Reasons Section
 *
 * Content: data/content/why-us.json (tag, title, items[] { icon, title, text }).
 * Cards are rendered by the shared icon-card-grid component.
 * Pass a `why_us` array to override the JSON (e.g. from a Controller).
 */

defined( 'ABSPATH' ) || exit;

use VintageSoul\DataProviders\JsonFileProvider;
use VintageSoul\Support\View;

$why_data = ! empty( $why_us ) && is_array( $why_us ) ? $why_us : (array) JsonFileProvider::read( 'data/content/why-us.json' );

$why_tag   = (string) ( $why_data['tag'] ?? '' );
$why_title = (string) ( $why_data['title'] ?? '' );
$why_sub   = (string) ( $why_data['sub'] ?? '' );
$why_items = (array) ( $why_data['items'] ?? array() );

if ( empty( $why_items ) ) {
	return;
}
?>
<section class="section section--why-us why-us-section paper-rough" id="why-us">
	<div class="container">
		<?php
		View::component(
			'section-header/section-header',
			array(
				'tag'    => $why_tag,
				'title'  => $why_title,
				'sub'    => $why_sub,
				'ribbon' => true,
			)
		);

		View::component(
			'icon-card-grid/icon-card-grid',
			array(
				'items'      => $why_items,
				'block'      => 'why-us-card',
				'grid_class' => 'why-us-grid',
				'card_extra' => 'frame--ornate-sm',
				'head_wrap'  => false,
			)
		);
		?>
	</div>
</section>
