<?php
/**
 * VintageSoulTheme - Decorative Section Divider
 *
 * The torn-paper and gold-wave rules that sat inline between sections on
 * every page (33 copies of the same three lines). One component now owns
 * the markup and the asset path, so a new divider style is a change here
 * rather than a find-and-replace across six page templates.
 *
 * Props:
 *   type (string) - 'deckled' (default) or 'gold-wave'
 *   flip (bool)   - mirror a deckled edge (see .deckled-divider--flip)
 */

defined( 'ABSPATH' ) || exit;

use VintageSoul\Support\UrlHelper;

$divider_styles = array(
	'deckled'   => array(
		'class' => 'deckled-divider',
		'image' => 'assets/images/textures/border/deckled-edge.svg',
	),
	'gold-wave' => array(
		'class' => 'gold-wave-divider',
		'image' => 'assets/images/textures/border/gold-wave.svg',
	),
);

$divider_type = isset( $type ) && isset( $divider_styles[ (string) $type ] ) ? (string) $type : 'deckled';
$divider      = $divider_styles[ $divider_type ];
$divider_flip = isset( $flip ) && true === $flip;

$divider_class = $divider['class'];
if ( $divider_flip ) {
	$divider_class .= ' ' . $divider['class'] . '--flip';
}
?>
<div class="<?php echo esc_attr( $divider_class ); ?>" aria-hidden="true">
	<img src="<?php echo esc_url( UrlHelper::resolve( $divider['image'] ) ); ?>" alt="" loading="lazy">
</div>
