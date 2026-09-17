<?php
/**
 * components/sections/guides_parent_group.php
 *
 * Premium split-panel parent group card.
 * Left: dark gradient — icon, name, desc, topic count, "Explore All" CTA.
 * Right: light — topic pills + 3 latest guide rows.
 *
 * Props: $group { name, slug, icon, desc, url, gradient, image_url,
 *                 topics[]{ icon, title, url }, latest_posts[]{ title, url, date, tag } }
 */

defined( 'ABSPATH' ) || exit;

$group        = isset( $group ) && is_array( $group ) ? $group : array();
$topics       = isset( $group['topics'] )       && is_array( $group['topics'] )       ? $group['topics']       : array();
$latest_posts = isset( $group['latest_posts'] ) && is_array( $group['latest_posts'] ) ? $group['latest_posts'] : array();

$name     = isset( $group['name'] )     ? (string) $group['name']     : '';
if ( '' === $name ) { return; }

$icon      = isset( $group['icon'] )      ? (string) $group['icon']      : '📚';
$desc      = isset( $group['desc'] )      ? (string) $group['desc']      : '';
$url       = isset( $group['url'] )       ? (string) $group['url']       : '';
$slug      = isset( $group['slug'] )      ? (string) $group['slug']      : '';
$gradient  = isset( $group['gradient'] )  ? (string) $group['gradient']  : 'linear-gradient(150deg,#1a3d2b 0%,#2d5a44 100%)';
$image_url = isset( $group['image_url'] ) ? (string) $group['image_url'] : '';

$topic_count = count( $topics );
?>
<div class="phg" id="phg-<?php echo esc_attr( $slug ); ?>">

	<?php /* ── Left dark panel ─────────────────────────────────────── */ ?>
	<div class="phg-left" style="<?php if ( '' !== $image_url ) : ?>background-image:linear-gradient(150deg,rgba(0,0,0,0.60),rgba(0,0,0,0.52)),url(<?php echo esc_url( $image_url ); ?>);background-size:cover;background-position:center<?php else : ?>background:<?php echo esc_attr( $gradient ); ?><?php endif; ?>">
		<div class="phg-left-overlay"></div>
		<div class="phg-left-body">

			<div class="phg-icon-wrap" aria-hidden="true">
				<?php echo adn_icon( $icon, 'phg-ico' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>

			<div class="phg-left-text">
				<?php if ( $topic_count > 0 ) : ?>
					<span class="phg-topic-count">
						<?php echo esc_html( $topic_count ); ?> <?php echo esc_html( $topic_count === 1 ? __( 'Topic', ADN_TEXT_DOMAIN ) : __( 'Topics', ADN_TEXT_DOMAIN ) ); ?>
					</span>
				<?php endif; ?>
				<h2 class="phg-name"><?php echo esc_html( $name ); ?></h2>
				<?php if ( '' !== $desc ) : ?>
					<p class="phg-desc"><?php echo esc_html( $desc ); ?></p>
				<?php endif; ?>
			</div>

			<?php if ( '' !== $url ) : ?>
				<a href="<?php echo esc_url( adn_link( $url ) ); ?>" class="phg-cta">
					<?php esc_html_e( 'Explore All', ADN_TEXT_DOMAIN ); ?>
					<span aria-hidden="true">›</span>
				</a>
			<?php endif; ?>

		</div>
	</div>

	<?php /* ── Right light panel ──────────────────────────────────────── */ ?>
	<div class="phg-right">

		<?php /* Topics pills */ ?>
		<?php if ( ! empty( $topics ) ) : ?>
		<div class="phg-topics-wrap">
			<span class="phg-row-label"><?php esc_html_e( 'Browse Topics', ADN_TEXT_DOMAIN ); ?></span>
			<div class="phg-topics">
				<?php foreach ( $topics as $topic ) :
					$t_title = isset( $topic['title'] ) ? (string) $topic['title'] : '';
					$t_url   = isset( $topic['url'] )   ? (string) $topic['url']   : '';
					if ( '' === $t_title ) { continue; }
				?>
					<a href="<?php echo esc_url( adn_link( $t_url ) ); ?>" class="phg-pill">
						<i class="fa-solid fa-tag" aria-hidden="true"></i>
						<?php echo esc_html( $t_title ); ?>
					</a>
				<?php endforeach; ?>
			</div>
		</div>
		<?php endif; ?>

		<?php /* Latest 3 guides */ ?>
		<?php if ( ! empty( $latest_posts ) ) : ?>
		<div class="phg-posts-wrap">
			<span class="phg-row-label"><?php esc_html_e( 'Latest Guides', ADN_TEXT_DOMAIN ); ?></span>
			<ul class="phg-posts">
				<?php foreach ( $latest_posts as $_lp ) :
					$_t = isset( $_lp['title'] ) ? (string) $_lp['title'] : '';
					$_u = isset( $_lp['url'] )   ? (string) $_lp['url']   : '';
					$_d = isset( $_lp['date'] )  ? (string) $_lp['date']  : '';
					$_g = isset( $_lp['tag'] )   ? (string) $_lp['tag']   : '';
					if ( '' === $_t ) { continue; }
				?>
				<li>
					<a href="<?php echo esc_url( adn_link( $_u ) ); ?>" class="phg-post-row">
						<span class="phg-post-dot" aria-hidden="true"></span>
						<span class="phg-post-body">
							<span class="phg-post-title"><?php echo esc_html( $_t ); ?></span>
							<?php if ( '' !== $_g || '' !== $_d ) : ?>
							<span class="phg-post-meta">
								<?php if ( '' !== $_g ) : ?>
									<span class="phg-post-tag"><?php echo esc_html( $_g ); ?></span>
								<?php endif; ?>
								<?php if ( '' !== $_d ) : echo esc_html( $_d ); endif; ?>
							</span>
							<?php endif; ?>
						</span>
						<span class="phg-post-arrow" aria-hidden="true">›</span>
					</a>
				</li>
				<?php endforeach; ?>
			</ul>
		</div>
		<?php endif; ?>

	</div>

</div>
