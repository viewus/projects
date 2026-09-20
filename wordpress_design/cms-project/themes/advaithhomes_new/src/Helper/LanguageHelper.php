<?php

namespace Adn\Theme\Helper;

defined( 'ABSPATH' ) || exit;

class LanguageHelper {

	public static function getAllowedLanguages(): array {
		$langs = array(
			'en' => 'English',
			'te' => 'తెలుగు',
		);
		return apply_filters( 'adn_allowed_languages', $langs );
	}

	public static function getLanguageStrings( string $lang ): array {
		$lang_file = ADN_THEME_DIR . '/languages/' . $lang . '.php';
		if ( file_exists( $lang_file ) ) {
			$strings = array();
			require $lang_file;
			return $strings;
		}
		return array();
	}

	public static function translate( string $title, string $lang = '' ): string {
		if ( '' === $lang ) {
			$lang = self::getCurrentLanguage();
		}
		if ( 'en' === $lang || '' === $lang ) {
			return $title;
		}
		$strings = self::getLanguageStrings( $lang );
		return isset( $strings[ $title ] ) ? $strings[ $title ] : $title;
	}

	public static function getCurrentLanguage(): string {
		if ( isset( $_COOKIE['adn_lang'] ) ) {
			return sanitize_text_field( wp_unslash( $_COOKIE['adn_lang'] ) );
		}
		$lang = isset( $_GET['lang'] ) ? sanitize_text_field( wp_unslash( $_GET['lang'] ) ) : '';
		if ( '' !== $lang && in_array( $lang, array_keys( self::getAllowedLanguages() ), true ) ) {
			return $lang;
		}
		return 'en';
	}

	public static function setLanguageCookie(): void {
		if ( isset( $_GET['lang'] ) ) {
			$lang = sanitize_text_field( wp_unslash( $_GET['lang'] ) );
			if ( in_array( $lang, array_keys( self::getAllowedLanguages() ), true ) ) {
				setcookie( 'adn_lang', $lang, time() + ( 86400 * 365 ), '/' );
				$_COOKIE['adn_lang'] = $lang;
			}
		}
	}

	/**
	 * Check if GTranslate plugin is installed and active.
	 */
	public static function hasGTranslate(): bool {
		return shortcode_exists( 'gtranslate' )
			|| function_exists( 'gtranslate' )
			|| function_exists( 'do_gtranslate' )
			|| defined( 'GTRANSLATE_VERSION' )
			|| class_exists( 'GTranslate' );
	}

	/**
	 * Safely render GTranslate output if active.
	 */
	public static function renderGTranslate(): string {
		if ( ! self::hasGTranslate() ) {
			return '';
		}

		$output = '';
		if ( function_exists( 'do_gtranslate' ) ) {
			ob_start();
			do_gtranslate();
			$output = (string) ob_get_clean();
		} elseif ( function_exists( 'gtranslate' ) ) {
			ob_start();
			gtranslate();
			$output = (string) ob_get_clean();
		} elseif ( shortcode_exists( 'gtranslate' ) ) {
			$output = (string) do_shortcode( '[gtranslate]' );
		}

		// Verify that shortcode was actually processed and not returned as raw unparsed text
		$trimmed = trim( $output );
		if ( '' === $trimmed || false !== strpos( $trimmed, '[gtranslate]' ) ) {
			return '';
		}

		return $trimmed;
	}

	/**
	 * Get the list of languages enabled in GTranslate admin settings.
	 */
	public static function getGTranslateEnabledLanguages(): array {
		if ( ! self::hasGTranslate() ) {
			return array();
		}

		$codes = array();

		// 1. Check GTranslate plugin settings option
		$settings = get_option( 'gtranslate_settings', null );
		if ( is_array( $settings ) ) {
			if ( ! empty( $settings['fincl_langs'] ) && is_array( $settings['fincl_langs'] ) ) {
				$codes = $settings['fincl_langs'];
			} elseif ( ! empty( $settings['included_languages'] ) && is_array( $settings['included_languages'] ) ) {
				$codes = $settings['included_languages'];
			} elseif ( ! empty( $settings['languages'] ) && is_array( $settings['languages'] ) ) {
				$codes = $settings['languages'];
			}
		}

		// 2. Check gtranslate_included_languages option
		if ( empty( $codes ) ) {
			$incl = get_option( 'gtranslate_included_languages', null );
			if ( is_array( $incl ) && ! empty( $incl ) ) {
				$codes = $incl;
			} elseif ( is_string( $incl ) && '' !== trim( $incl ) ) {
				$codes = array_filter( array_map( 'trim', explode( ',', $incl ) ) );
			}
		}

		// 3. Fallback: Parse languages from rendered GTranslate HTML
		if ( empty( $codes ) ) {
			$html = self::renderGTranslate();
			if ( '' !== $html ) {
				// Match value="en|te" or value="te"
				if ( preg_match_all( '/value=[\'"](?:[a-zA-Z\-]+\|)?([a-zA-Z\-]+)[\'"]/i', $html, $m ) ) {
					$codes = array_merge( $codes, $m[1] );
				}
				// Match data-gt-lang="te"
				if ( preg_match_all( '/data-gt-lang=[\'"]([a-zA-Z\-]+)[\'"]/i', $html, $m ) ) {
					$codes = array_merge( $codes, $m[1] );
				}
				// Match doGTranslate('en|te') or googtrans(en|te)
				if ( preg_match_all( '/(?:doGTranslate|googtrans)\([\'"]?[a-zA-Z\-]+\|([a-zA-Z\-]+)[\'"]?\)/i', $html, $m ) ) {
					$codes = array_merge( $codes, $m[1] );
				}
			}
		}

		// Sanitize & lowercase
		$clean = array();
		foreach ( $codes as $code ) {
			$c = strtolower( trim( (string) $code ) );
			if ( '' !== $c && ! in_array( $c, $clean, true ) ) {
				$clean[] = $c;
			}
		}

		return $clean;
	}
}
