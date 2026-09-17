<?php
/**
 * VintageSoulTheme - Generic Checklist / Highlights Section
 *
 * One component, several content files - each is the same shape
 * (tag, title, sub, items[] of plain strings):
 *   data/content/benefits-list.json      - health reasons
 *   data/content/uses.json               - everyday uses
 *   data/content/why-everyone-loves.json - broader appeal
 *
 * Props:
 *   source  (string) - content file under data/content/ (default: benefits-list.json)
 *   variant (string) - 'light' (default) or 'dark'
 *   id      (string) - anchor id, defaults to the file's own slug
 *   items / tag / title / sub - optional direct overrides of the file
 */

defined( 'ABSPATH' ) || exit;

use VintageSoul\DataProviders\JsonFileProvider;
use VintageSoul\Support\IconHelper;
use VintageSoul\Support\View;

$hl_source = isset( $source ) ? basename( (string) $source ) : 'benefits-list.json';
$hl_data   = (array) JsonFileProvider::read( 'data/content/' . $hl_source );

$hl_tag   = (string) ( $tag ?? ( $hl_data['tag'] ?? '' ) );
$hl_title = (string) ( $title ?? ( $hl_data['title'] ?? '' ) );
$hl_sub   = (string) ( $sub ?? ( $hl_data['sub'] ?? '' ) );

$hl_items = ( isset( $items ) && is_array( $items ) ) ? $items : (array) ( $hl_data['items'] ?? array() );
$hl_items = array_values( array_filter( array_map( static function ( $entry ) {
	// Accepts both a plain string and a { text|label|title } object.
	if ( is_array( $entry ) ) {
		$entry = $entry['text'] ?? ( $entry['label'] ?? ( $entry['title'] ?? '' ) );
	}
	return trim( (string) $entry );
}, $hl_items ) ) );

if ( empty( $hl_items ) ) {
	return;
}

$hl_is_dark = isset( $variant ) && 'dark' === $variant;
$hl_id      = isset( $id ) && '' !== trim( (string) $id )
	? sanitize_html_class( (string) $id )
	: 'highlights-' . sanitize_html_class( str_replace( '.json', '', $hl_source ) );
$hl_check   = IconHelper::get( 'check', $hl_is_dark ? '#f6d599' : '#0c6434', 15 );
?>
<section class="section highlights-section<?php echo $hl_is_dark ? ' section--dark-botanical grain-dark' : ' paper-rough'; ?>" id="<?php echo esc_attr( $hl_id ); ?>">
	<div class="container container--narrow">
		<?php
		View::component(
			'section-header/section-header',
			array(
				'tag'     => $hl_tag,
				'title'   => $hl_title,
				'sub'     => $hl_sub,
				'variant' => $hl_is_dark ? 'dark' : '',
				'ribbon'  => true,
			)
		);
		?>

		<ul class="highlights-list<?php echo $hl_is_dark ? ' highlights-list--dark' : ''; ?>">
			<?php foreach ( $hl_items as $hl_item ) : ?>
				<li class="highlights-list__item">
					<span class="highlights-list__mark" aria-hidden="true"><?php echo $hl_check; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- inline SVG from IconHelper ?></span>
					<span class="highlights-list__text"><?php echo esc_html( $hl_item ); ?></span>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>
