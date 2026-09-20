<?php
/**
 * Common Functions — Thin wrappers delegating to OOP classes.
 *
 * All functions in this file are backward-compatible wrappers.
 * New code should use the classes directly:
 *   - Adn\Theme\Helper\RequestHelper
 *   - Adn\Theme\Helper\MediaHelper
 *   - Adn\Theme\Service\SiteChromeService
 *   - Adn\Theme\Service\CmsDataService
 *   - Adn\Theme\Helper\ComponentRenderer
 *   - Adn\Theme\Helper\IconHelper
 *   - Adn\Theme\Helper\UrlHelper
 *   - Adn\Theme\Helper\LanguageHelper
 *   - Adn\Theme\Helper\PageHelper
 *
 * Note: Functions that exist in apis/services.php or apis/services_cms.php
 * are NOT duplicated here. Those files are included separately.
 */
defined( 'ABSPATH' ) || exit;

// ── Request Helpers ────────────────────────────────────────────────────────
function getRequestParameter( $title = '', $default_value = '' ) {
	return \Adn\Theme\Helper\RequestHelper::get( $title, $default_value );
}

function getJsonParameter( $title = '', $default_value = '' ) {
	return \Adn\Theme\Helper\RequestHelper::getJson( $title, $default_value );
}

function getJsonData() {
	return \Adn\Theme\Helper\RequestHelper::getJsonBody();
}

// ── Component Helpers ─────────────────────────────────────────────────────
function adn_component( $name, $context = array() ) {
	\Adn\Theme\Helper\ComponentRenderer::render( $name, $context );
}

function adn_render_form( $config ) {
	\Adn\Theme\Helper\ComponentRenderer::renderForm( $config );
}

function adn_random_mini_cta( array $context = array() ) {
	\Adn\Theme\Helper\ComponentRenderer::render( 'parts/random_mini_cta', $context );
}

// ── Media Helpers ─────────────────────────────────────────────────────────
function adn_settings_media_url_type( $value ): array {
	return \Adn\Theme\Helper\MediaHelper::resolveUrlType( $value );
}

// ── Icon Helpers ──────────────────────────────────────────────────────────
function adn_icon( $icon, $class = '' ) {
	return \Adn\Theme\Helper\IconHelper::render( $icon, $class );
}

function adn_icon_emoji_map() {
	return \Adn\Theme\Helper\IconHelper::getEmojiMap();
}

// ── Page Helpers ──────────────────────────────────────────────────────────
function adn_page_open( array $ctx ) {
	\Adn\Theme\Helper\PageHelper::open( $ctx );
}

function adn_page_close( array $ctx ) {
	\Adn\Theme\Helper\PageHelper::close( $ctx );
}

// ── Language Helpers ──────────────────────────────────────────────────────
function adn_get_allowed_languages() {
	return \Adn\Theme\Helper\LanguageHelper::getAllowedLanguages();
}

function getLanguageStrings( $lang ) {
	return \Adn\Theme\Helper\LanguageHelper::getLanguageStrings( $lang );
}

function lang_translate( $title, $lang = '' ) {
	return \Adn\Theme\Helper\LanguageHelper::translate( $title, $lang );
}

function adn_get_current_language() {
	return \Adn\Theme\Helper\LanguageHelper::getCurrentLanguage();
}

function adn_set_language_cookie() {
	\Adn\Theme\Helper\LanguageHelper::setLanguageCookie();
}

function adn_has_gtranslate() {
	return \Adn\Theme\Helper\LanguageHelper::hasGTranslate();
}

function adn_render_gtranslate() {
	return \Adn\Theme\Helper\LanguageHelper::renderGTranslate();
}

function adn_get_gtranslate_enabled_languages() {
	return \Adn\Theme\Helper\LanguageHelper::getGTranslateEnabledLanguages();
}

function adn_visitor_has_cookie_category( $category ) {
	return isset( $_COOKIE[ 'adn_cat_' . $category ] ) && '1' === $_COOKIE[ 'adn_cat_' . $category ];
}

// ── URL Helpers ───────────────────────────────────────────────────────────
function adn_pretty_path_slug( $base_url ) {
	return \Adn\Theme\Helper\UrlHelper::prettyPathSlug( $base_url );
}

function adn_expert_profile_url( $slug ) {
	return \Adn\Theme\Helper\UrlHelper::expertProfileUrl( $slug );
}

function adn_calc_page_url( $key ) {
	return \Adn\Theme\Helper\UrlHelper::calcPageUrl( $key );
}

// ── Site Chrome & CMS Data ────────────────────────────────────────────────
// Note: adn_service_site_chrome(), adn_get_contact_setting(), adn_get_social_setting()
// are defined in apis/services.php
// Note: adn_cms_table(), adn_cms_available(), adn_cms_guide_parents(), etc.
// are defined in apis/services_cms.php
