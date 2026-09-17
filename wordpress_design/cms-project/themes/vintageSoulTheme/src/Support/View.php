<?php
namespace VintageSoul\Support;

defined( 'ABSPATH' ) || exit;

final class View {

	public static function component( string $name, array $data = array() ): void {
		self::include_file( VINTAGESOUL_DIR . '/components/' . $name . '.php', VINTAGESOUL_DIR . '/components', $data );
	}

	public static function part( string $name, array $data = array() ): void {
		self::include_file( VINTAGESOUL_DIR . '/template-parts/' . $name . '.php', VINTAGESOUL_DIR . '/template-parts', $data );
	}

	/**
	 * Include a view file with the caller's data extracted into its scope.
	 *
	 * Every local here is deliberately prefixed. extract() runs with
	 * EXTR_SKIP, so any prop sharing a name with a local of this method would
	 * be silently dropped and the component would read this method's value
	 * instead - a prop named "base" or "file" used to do exactly that, with
	 * no error, just wrong output. The prefix makes every prop name safe.
	 */
	private static function include_file( string $vs_view_path, string $vs_view_allowed_base, array $vs_view_data ): void {
		$vs_view_base = realpath( $vs_view_allowed_base );
		$vs_view_file = realpath( $vs_view_path );

		if ( ! $vs_view_base || ! $vs_view_file || 0 !== strpos( $vs_view_file, $vs_view_base ) || ! is_file( $vs_view_file ) ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( '[VintageSoul] View file not found: ' . $vs_view_path );
			}
			return;
		}

		extract( $vs_view_data, EXTR_SKIP ); // phpcs:ignore WordPress.PHP.DontExtract.extract_extract -- view props, guarded by the prefixed locals above
		require $vs_view_file;
	}
}
