<?php
/**
 * The main template file.
 *
 * This is the ultimate fallback in the WordPress template hierarchy and is
 * REQUIRED for the theme to be valid. Specific templates (page, single, etc.)
 * override it when they exist.
 *
 * @package Advaith_Homes
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

get_header();
?>

<div id="primary" class="site-main interactive-app-view">
<?php
if ( have_posts() ) :
    while ( have_posts() ) :
        the_post();
        ?>
        <div <?php post_class(); ?>>
            <header class="entry-header">
                <?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>
            </header>
            <div class="entry-content">
                <?php the_content(); ?>
            </div>
    </div>
        <?php
    endwhile;

    the_posts_pagination();
else :
    ?>
    <p><?php esc_html_e( 'Nothing found.', ADN_TEXT_DOMAIN ); ?></p>
    <?php
endif;
?>
</div>

<?php get_footer(); ?>
