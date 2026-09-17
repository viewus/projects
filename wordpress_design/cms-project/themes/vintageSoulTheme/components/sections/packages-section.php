<?php
/**
 * VintageSoulTheme - Events & Hire Packages Section
 *
 * Content: data/content/packages.json (tag, title, sub, items[] { icon, title, desc },
 * button { label, route|url }). Cards come from the shared icon-card-grid component.
 * Pass a `packages` array to override the JSON.
 */

defined( 'ABSPATH' ) || exit;

use VintageSoul\DataProviders\JsonFileProvider;
use VintageSoul\Services\RouteService;
use VintageSoul\Support\View;

$pk_data = ! empty( $packages ) && is_array( $packages ) ? $packages : (array) JsonFileProvider::read( 'data/content/packages.json' );

$pk_tag    = (string) ( $pk_data['tag'] ?? '' );
$pk_title  = (string) ( $pk_data['title'] ?? '' );
$pk_sub    = (string) ( $pk_data['sub'] ?? '' );
$pk_items  = (array) ( $pk_data['items'] ?? array() );
$pk_button = (array) ( $pk_data['button'] ?? array() );

if ( empty( $pk_items ) ) {
	return;
}

$pk_btn_label = trim( (string) ( $pk_button['label'] ?? '' ) );
$pk_btn_url   = '';
if ( '' !== $pk_btn_label ) {
	$pk_btn_url = ! empty( $pk_button['url'] )
		? (string) $pk_button['url']
		: RouteService::url( (string) ( $pk_button['route'] ?? 'contact' ) );
}
?>
<section class="section section--packages packages-section paper-rough" id="packages">
	<div class="container">
		<?php
		View::component(
			'section-header/section-header',
			array(
				'tag'    => $pk_tag,
				'title'  => $pk_title,
				'sub'    => $pk_sub,
				'ribbon' => true,
			)
		);

		View::component(
			'icon-card-grid/icon-card-grid',
			array(
				'items'      => $pk_items,
				'block'      => 'package-card',
				'grid_class' => 'packages-grid',
				'card_extra' => 'frame--rough-cut',
				'head_wrap'  => false,
			)
		);
		?>

		<?php if ( '' !== $pk_btn_label && '' !== $pk_btn_url ) : ?>
			<div class="packages-section__actions">
				<a class="btn btn--primary-vintage" href="<?php echo esc_url( $pk_btn_url ); ?>">
					<span><?php echo esc_html( $pk_btn_label ); ?></span>
				</a>
			</div>
		<?php endif; ?>
	</div>
</section>
