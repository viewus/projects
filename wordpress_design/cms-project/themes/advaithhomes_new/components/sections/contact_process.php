<?php
/**
 * components/sections/contact_process.php
 * Props: $process_steps[] { number, icon, title, description }
 */
defined( 'ABSPATH' ) || exit;

$_steps = ( isset( $process_steps ) && is_array( $process_steps ) ) ? $process_steps : array();
if ( empty( $_steps ) ) return;
?>
<section class="contact-process-section">
	<div class="container">
		<div class="contact-process-header">
			<span class="contact-process-eyebrow"><?php esc_html_e( 'Simple & Transparent', ADN_TEXT_DOMAIN ); ?></span>
			<h2 class="contact-section-heading"><?php esc_html_e( 'What happens after you submit?', ADN_TEXT_DOMAIN ); ?></h2>
			<p class="contact-process-subheading"><?php esc_html_e( 'Here is how our team guides you from your first message to dedicated property advice.', ADN_TEXT_DOMAIN ); ?></p>
		</div>
		<div class="contact-process-grid">
			<?php foreach ( $_steps as $_i => $_s ) :
				$_raw_num = isset( $_s['number'] ) ? (int) $_s['number'] : ( $_i + 1 );
				$_num     = sprintf( '%02d', $_raw_num > 0 ? $_raw_num : ( $_i + 1 ) );
				$_ico     = adn_icon( isset( $_s['icon'] ) ? (string) $_s['icon'] : '' );
				$_ttl     = esc_html( isset( $_s['title'] ) ? (string) $_s['title'] : '' );
				$_dsc     = esc_html( isset( $_s['description'] ) ? (string) $_s['description'] : '' );
			?>
				<div class="contact-process-card">
					<div class="cpc-header">
						<div class="cpc-icon-wrap">
							<span class="cpc-icon" aria-hidden="true"><?php echo $_ico; ?></span>
						</div>
						<span class="cpc-step-badge"><?php echo esc_html( sprintf( __( 'Step %s', ADN_TEXT_DOMAIN ), $_num ) ); ?></span>
					</div>
					<div class="cpc-body">
						<h3 class="cpc-title"><?php echo $_ttl; ?></h3>
						<p class="cpc-desc"><?php echo $_dsc; ?></p>
					</div>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</section>
