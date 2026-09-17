<?php
/**
 * Cache Busting & Lazy Loading Filters — Thin wrappers delegating to OOP class.
 *
 * @package Adn\Theme\Common\Filters
 */
defined( 'ABSPATH' ) || exit;

function adn_add_img_lazy_attr( string $content ): string {
	return \Adn\Theme\Feature\Filters\CacheBustingFilter::addLazyAttr( $content );
}

function adn_cache_bust_attachment_url( $url ) {
	return \Adn\Theme\Feature\Filters\CacheBustingFilter::bustAttachmentUrl( $url );
}

function adn_cache_bust_attachment_image_src( $src ) {
	return \Adn\Theme\Feature\Filters\CacheBustingFilter::bustAttachmentImageSrc( $src );
}

function adn_cache_bust_content_images( $content ) {
	return \Adn\Theme\Feature\Filters\CacheBustingFilter::bustContentImages( $content );
}

function adn_cache_bust_content_bg_images( $content ) {
	return \Adn\Theme\Feature\Filters\CacheBustingFilter::bustContentBgImages( $content );
}

function adn_clean_article_tags( $content ) {
	if ( empty( $content ) || ! is_string( $content ) ) {
		return $content;
	}
	if ( false === stripos( $content, '<article' ) && false === stripos( $content, '</article' ) ) {
		return $content;
	}
	$content = preg_replace( '/<article\b([^>]*)>/is', '<div$1>', $content );
	$content = preg_replace( '/<\/article\s*>/is', '</div>', $content );
	return $content;
}
