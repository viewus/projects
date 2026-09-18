<?php
// Redirect to home if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	header( 'Location: ../' );
	exit;
}
// WordPress will use this as the fallback template when no more-specific template is found.
get_header();
?>
<div class="ah-main interactive-app-view" id="main-content">
  <div class="ah-container">
    <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
      <div id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
        <h1><?php the_title(); ?></h1>
        <div><?php the_content(); ?></div>
      </div>
    <?php endwhile; else : ?>
      <p><?php esc_html_e( 'No content found.', 'ah-theme' ); ?></p>
    <?php endif; ?>
  </div>
</div>
<?php
get_footer();
