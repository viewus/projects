<?php

use VintageSoul\Controllers\ContactController;
use VintageSoul\Support\IconHelper;
use VintageSoul\Support\View;

defined( 'ABSPATH' ) || exit;

$data = ( new ContactController() )->prepare();

$hero          = (array) ( $data['hero'] ?? array() );
$contact_info  = (array) ( $data['contact_info'] ?? array() );
$event_bar     = (array) ( $data['event_bar'] ?? array() );
$enquiry_types = (array) ( $data['enquiry_types'] ?? array() );
$faqs          = (array) ( $data['faqs'] ?? array() );

$phone   = (string) ( $contact_info['phone'] ?? '' );
$email   = (string) ( $contact_info['email'] ?? '' );
$address = (string) ( $contact_info['address'] ?? '' );
$hours   = (string) ( $contact_info['hours'] ?? '' );
$socials = (array) ( $contact_info['socials'] ?? array() );
?>

<div class="contact-page">
	<?php View::component( 'background/parchment-botanical-bg', array( 'seed' => 61 ) ); ?>
	<!-- 1. Master Subpage Hero -->
	<?php
	View::component(
		'subpage-hero/subpage-hero',
		array(
			'id'    => 'contact-hero',
			'tag'   => (string) ( $hero['tag'] ?? '' ),
			'title' => (string) ( $hero['title'] ?? '' ),
			'sub'   => (string) ( $hero['sub'] ?? '' ),
			'image' => (string) ( $hero['image'] ?? '' ),
			'video' => (string) ( $hero['video'] ?? '' ),
		)
	);
	?>

	<!-- 2. Side-by-Side Main Contact Stage -->
	<section class="section contact-stage-section paper-rough">
		<div class="container contact-stage-container">
			<div class="contact-stage-grid">
				
				<!-- Left Column: Contact & Booking Form (Powered by CMS Plugin Form Builder) -->
				<div class="contact-form-card frame--rough-cut">
					<div class="contact-card-header">
						<h2 class="contact-card-header__title"><?php echo wp_kses_post( (string) ( $data['form']['title'] ?? 'SEND US A <em>Message</em>' ) ); ?></h2>
						<p class="contact-card-header__sub"><?php echo esc_html( (string) ( $data['form']['sub'] ?? 'Fill out the form below and we will respond promptly.' ) ); ?></p>
					</div>

					<?php
					$rendered_form = (string) ( $data['rendered_form'] ?? '' );
					$form_agr      = (array) ( $data['form']['agreement'] ?? array() );

					if ( ! empty( $rendered_form ) ) :
						echo $rendered_form; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					else :
					?>
						<form class="vintage-form" method="post" action="#">
							<div class="form-row form-row--duo">
								<div class="form-group">
									<label class="form-label" for="contact-name">YOUR FULL NAME <span class="required">*</span></label>
									<input class="form-input" type="text" id="contact-name" name="name" placeholder="e.g. Ramesh Patel" required>
								</div>
								<div class="form-group">
									<label class="form-label" for="contact-phone">PHONE / WHATSAPP <span class="required">*</span></label>
									<input class="form-input" type="tel" id="contact-phone" name="phone" placeholder="+44 7770 000 000" required>
								</div>
							</div>

							<div class="form-row form-row--duo">
								<div class="form-group">
									<label class="form-label" for="contact-email">EMAIL ADDRESS <span class="required">*</span></label>
									<input class="form-input" type="email" id="contact-email" name="email" placeholder="you@example.com" required>
								</div>
								<div class="form-group">
									<label class="form-label" for="contact-type">ENQUIRY TYPE</label>
									<select class="form-select" id="contact-type" name="enquiry_type">
										<?php foreach ( $enquiry_types as $type ) : ?>
											<option value="<?php echo esc_attr( (string) ( $type['value'] ?? '' ) ); ?>">
												<?php echo esc_html( (string) ( $type['label'] ?? '' ) ); ?>
											</option>
										<?php endforeach; ?>
									</select>
								</div>
							</div>

							<div class="form-group">
								<label class="form-label" for="contact-date">EVENT DATE (IF APPLICABLE)</label>
								<input class="form-input" type="date" id="contact-date" name="event_date">
							</div>

							<div class="form-group">
								<label class="form-label" for="contact-message">YOUR MESSAGE / EVENT REQUIREMENTS <span class="required">*</span></label>
								<textarea class="form-textarea" id="contact-message" name="message" rows="4" placeholder="Tell us about your event, location, flavor preferences, or any questions..." required></textarea>
							</div>

							<?php if ( ! empty( $form_agr['enabled'] ) ) : ?>
								<div class="form-group form-group--agree">
									<label class="form-checkbox-label" for="contact-agree">
										<input type="checkbox" class="form-checkbox" id="contact-agree" name="agree" required checked>
										<span class="form-checkbox-text">
											<?php echo esc_html( (string) ( $form_agr['before'] ?? 'I agree to the' ) ); ?>
											<a href="<?php echo esc_url( (string) ( $form_agr['url'] ?? '/privacy-policy' ) ); ?>" target="_blank" rel="noopener">
												<?php echo esc_html( (string) ( $form_agr['link_text'] ?? 'Terms & Conditions' ) ); ?>
											</a>
											<?php echo esc_html( (string) ( $form_agr['after'] ?? '' ) ); ?>
										</span>
									</label>
								</div>
							<?php endif; ?>

							<div class="form-actions">
								<button class="btn btn--primary-vintage btn--submit" type="submit">
									<span><?php echo esc_html( (string) ( $data['form']['submit_label'] ?? 'SEND MESSAGE / ENQUIRY' ) ); ?></span>
									<span class="btn__arrow">➔</span>
								</button>
								<span class="form-note">🔒 We respect your privacy. Zero spam guaranteed.</span>
							</div>
						</form>
					<?php endif; ?>
				</div>

				<!-- Right Column: Side Contact Details & Cards -->
				<div class="contact-details-col">
					
					<!-- Card 1: Direct Contact Info -->
					<div class="side-info-card frame--rough-cut">
						<h3 class="side-info-card__title">🌿 DIRECT CONTACT DETAILS</h3>
						<ul class="side-info-list">
							<?php
							$clean_phone = preg_replace( '/[^\d+]/', '', $phone );
							$wa_num      = (string) ( $contact_info['whatsapp'] ?? $phone );
							$clean_wa    = preg_replace( '/[^\d+]/', '', $wa_num );
							$wa_url      = (string) ( $contact_info['whatsapp_url'] ?? \VintageSoul\Services\SettingsService::whatsapp_url() );
							$is_same_num = ( '' !== $clean_phone && $clean_phone === $clean_wa );
							?>
							<?php if ( $is_same_num ) : ?>
								<li class="side-info-item">
									<span class="side-info-item__icon"><?php echo IconHelper::get( 'phone', '#172b15', 18 ); // phpcs:ignore ?></span>
									<div class="side-info-item__text">
										<strong>Phone &amp; WhatsApp:</strong>
										<a href="tel:<?php echo esc_attr( $clean_phone ); ?>"><?php echo esc_html( $phone ); ?></a>
									</div>
								</li>
							<?php else : ?>
								<?php if ( '' !== $phone ) : ?>
									<li class="side-info-item">
										<span class="side-info-item__icon"><?php echo IconHelper::get( 'phone', '#172b15', 18 ); // phpcs:ignore ?></span>
										<div class="side-info-item__text">
											<strong>Direct Phone:</strong>
											<a href="tel:<?php echo esc_attr( $clean_phone ); ?>"><?php echo esc_html( $phone ); ?></a>
										</div>
									</li>
								<?php endif; ?>
								<?php if ( '' !== $wa_num ) : ?>
									<li class="side-info-item">
										<span class="side-info-item__icon"><?php echo IconHelper::get( 'whatsapp', '#172b15', 18 ); // phpcs:ignore ?></span>
										<div class="side-info-item__text">
											<strong>WhatsApp Chat:</strong>
											<a href="<?php echo esc_url( $wa_url ); ?>" target="_blank" rel="noopener"><?php echo esc_html( $wa_num ); ?></a>
										</div>
									</li>
								<?php endif; ?>
							<?php endif; ?>
							<?php if ( '' !== $email ) : ?>
								<li class="side-info-item">
									<span class="side-info-item__icon"><?php echo IconHelper::get( 'mail', '#172b15', 18 ); // phpcs:ignore ?></span>
									<div class="side-info-item__text">
										<strong>Email Us:</strong>
										<a href="mailto:<?php echo esc_attr( $email ); ?>"><?php echo esc_html( $email ); ?></a>
									</div>
								</li>
							<?php endif; ?>
							<?php if ( '' !== $address ) : ?>
								<li class="side-info-item">
									<span class="side-info-item__icon"><?php echo IconHelper::get( 'stall', '#172b15', 18 ); // phpcs:ignore ?></span>
									<div class="side-info-item__text">
										<strong>Main Hub &amp; Stall:</strong>
										<span><?php echo esc_html( $address ); ?></span>
									</div>
								</li>
							<?php endif; ?>
							<?php if ( '' !== $hours ) : ?>
								<li class="side-info-item">
									<span class="side-info-item__icon"><?php echo IconHelper::get( 'growth', '#172b15', 18 ); // phpcs:ignore ?></span>
									<div class="side-info-item__text">
										<strong>Opening Hours:</strong>
										<span><?php echo esc_html( $hours ); ?></span>
									</div>
								</li>
							<?php endif; ?>
						</ul>
					</div>

					<!-- Card 2: Social Connect Links -->
					<div class="social-connect-card frame--rough-cut">
						<h4 class="social-connect-card__title">FOLLOW OUR <em>Journey</em></h4>
						<p class="social-connect-card__sub">Stay updated with our weekend stall locations & seasonal juices.</p>
						<div class="social-pills-row">
							<a class="social-pill" href="<?php echo esc_url( \VintageSoul\Services\SettingsService::social_url( 'facebook', 'https://facebook.com/thecanehouseuk' ) ); ?>" target="_blank" rel="noopener">Facebook</a>
							<a class="social-pill" href="<?php echo esc_url( \VintageSoul\Services\SettingsService::social_url( 'instagram', 'https://instagram.com/thecanehouseuk' ) ); ?>" target="_blank" rel="noopener">Instagram</a>
							<a class="social-pill" href="<?php echo esc_url( \VintageSoul\Services\SettingsService::whatsapp_url() ); ?>" target="_blank" rel="noopener">WhatsApp</a>
						</div>
					</div>

				</div>

			</div>
		</div>
	</section>

	<!-- Gold Wave Divider -->
	<?php View::component( 'divider/divider', array( 'type' => 'gold-wave' ) ); ?>

	<!-- 2b. Locations / Store Finder (data/content/locations.json) -->
	<?php View::component( 'sections/locations-section' ); ?>

	<!-- 2c. Opening Hours, with live open/closed status (data/content/opening-hours.json) -->
	<?php View::component( 'sections/opening-hours-section' ); ?>

	<!-- 3. FAQs Section -->
	<?php if ( ! empty( $faqs ) ) : ?>
		<section class="section contact-faq-section paper-rough">
			<div class="container container--narrow">
				<h2 class="contact-faq__title">FREQUENTLY ASKED <em>Questions</em></h2>
				<div class="faq-accordion">
					<?php foreach ( $faqs as $idx => $f ) :
						$q      = (string) ( $f['question'] ?? '' );
						$a      = (string) ( $f['answer'] ?? '' );
						$faq_id = 'faq-' . sanitize_title( $q );
					?>
						<details class="faq-accordion__item frame--ornate-sm" id="<?php echo esc_attr( $faq_id ); ?>" name="contact-faq">
							<summary class="faq-accordion__summary">
								<span class="faq-accordion__question"><?php echo esc_html( $q ); ?></span>
								<span class="faq-accordion__icon" aria-hidden="true">+</span>
							</summary>
							<div class="faq-accordion__content">
								<p><?php echo esc_html( $a ); ?></p>
							</div>
						</details>
					<?php endforeach; ?>
				</div>
			</div>
		</section>
	<?php endif; ?>
</div>
