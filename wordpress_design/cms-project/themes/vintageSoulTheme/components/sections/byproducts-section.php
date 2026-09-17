<?php
/**
 * VintageSoulTheme - "From One Source, Many Goods" By-Products Section
 *
 * Content: data/content/byproducts.json (tag, title, body, items[] { icon, title, text }).
 * Cards are rendered by the shared icon-card-grid component, numbered so the
 * four outputs read as a flow rather than an unordered set.
 * Pass a `byproducts` array to override the JSON.
 */

defined( 'ABSPATH' ) || exit;

use VintageSoul\DataProviders\JsonFileProvider;
use VintageSoul\Support\View;

$bp_data = ! empty( $byproducts ) && is_array( $byproducts ) ? $byproducts : (array) JsonFileProvider::read( 'data/content/byproducts.json' );

$bp_tag   = (string) ( $bp_data['tag'] ?? '' );
$bp_title = (string) ( $bp_data['title'] ?? '' );
$bp_body  = (string) ( $bp_data['body'] ?? ( $bp_data['sub'] ?? '' ) );
$bp_items = (array) ( $bp_data['items'] ?? array() );

if ( empty( $bp_items ) ) {
	return;
}
?>
<section class="section section--dark-botanical byproducts-section grain-dark" id="byproducts">
	<div class="container">
		<?php
		View::component(
			'section-header/section-header',
			array(
				'tag'     => $bp_tag,
				'title'   => $bp_title,
				'sub'     => $bp_body,
				'variant' => 'dark',
				'ribbon'  => true,
			)
		);

		View::component(
			'icon-card-grid/icon-card-grid',
			array(
				'items'      => $bp_items,
				'block'      => 'byproduct-card',
				'grid_class' => 'byproducts-flow',
				'card_extra' => 'frame--rough-cut',
				'head_wrap'  => false,
				'numbered'   => true,
			)
		);
		?>
	</div>
</section>
