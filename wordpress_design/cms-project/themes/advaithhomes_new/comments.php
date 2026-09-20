<?php
/**
 * comments.php - Custom comments template for advaithhomes_new.
 *
 * Called via comments_template() from single.php.
 * Render callbacks live in includes/CommentCallbacks.php (loaded in functions.php)
 * so they are also available to the AJAX handlers.
 *
 * Initial page load: first 10 approved comments rendered server-side.
 * Additional comments: loaded on demand via AJAX (adn_load_comments).
 * Comment submission: AJAX (adn_submit_comment) - never redirects to wp-comments-post.php.
 */

defined( 'ABSPATH' ) || exit;

if ( post_password_required() ) {
	echo '<p class="adn-comments-protected">'
		. esc_html__( 'This post is password protected. Enter the password to view comments.', ADN_TEXT_DOMAIN )
		. '</p>';
	return;
}

$_post_id      = get_the_ID();
$_per_page     = 10;
$_total        = (int) get_comments( array(
	'post_id' => $_post_id,
	'status'  => 'approve',
	'count'   => true,
	'type'    => 'comment',
) );

/* First batch - newest first by default */
$_initial = get_comments( array(
	'post_id' => $_post_id,
	'status'  => 'approve',
	'number'  => $_per_page,
	'offset'  => 0,
	'orderby' => 'comment_date_gmt',
	'order'   => 'DESC',
	'type'    => 'comment',
) );

$_loaded   = count( $_initial );
$_has_more = $_loaded < $_total;

$_cb_args = array(
	'style'     => 'ol',
	'max_depth' => (int) get_option( 'thread_comments_depth', 5 ),
);
?>

<section class="adn-comments-section" id="comments"
         data-post-id="<?php echo esc_attr( (string) $_post_id ); ?>"
         data-total="<?php echo esc_attr( (string) $_total ); ?>"
         data-loaded="<?php echo esc_attr( (string) $_loaded ); ?>"
         data-per-page="<?php echo esc_attr( (string) $_per_page ); ?>">

	<?php /* ── Comment list ── */ ?>
	<?php if ( $_total > 0 ) : ?>

		<?php /* Header row: count + filter tabs */ ?>
		<div class="adn-comments-header">
			<h2 class="adn-comments-heading">
				<span class="adn-comments-count"><?php echo esc_html( number_format_i18n( $_total ) ); ?></span>
				<?php echo esc_html( 1 === $_total ? __( 'Comment', ADN_TEXT_DOMAIN ) : __( 'Comments', ADN_TEXT_DOMAIN ) ); ?>
			</h2>
			<div class="adn-filter-tabs" role="group" aria-label="<?php esc_attr_e( 'Sort comments', ADN_TEXT_DOMAIN ); ?>">
				<button type="button" class="adn-filter-btn is-active" data-order="desc" data-status="approve">
					<?php esc_html_e( 'Latest', ADN_TEXT_DOMAIN ); ?>
				</button>
				<button type="button" class="adn-filter-btn" data-order="asc" data-status="approve">
					<?php esc_html_e( 'Oldest', ADN_TEXT_DOMAIN ); ?>
				</button>
				<?php if ( current_user_can( 'moderate_comments' ) ) : ?>
				<button type="button" class="adn-filter-btn" data-order="desc" data-status="hold">
					<?php esc_html_e( 'Pending', ADN_TEXT_DOMAIN ); ?>
				</button>
				<?php endif; ?>
			</div>
		</div>

		<?php /* Spinner overlay */ ?>
		<div class="adn-comments-wrap" id="adn-comments-wrap">
			<div class="adn-comments-spinner" id="adn-comments-spinner" hidden>
				<span class="adn-spinner-icon" aria-hidden="true">⟳</span>
			</div>
			<ol class="adn-comment-list" id="adn-comment-list">
				<?php foreach ( $_initial as $_c ) :
					adn_comment_callback( $_c, $_cb_args, 1 );
					adn_comment_end_callback( $_c, $_cb_args, 1 );
				endforeach; ?>
			</ol>
		</div>

		<?php /* Pagination - replace mode */ ?>
		<?php $_total_pages = (int) ceil( $_total / $_per_page ); ?>
		<div class="adn-comments-pagination" id="adn-comments-pagination"
		     data-page="1" data-total-pages="<?php echo esc_attr( (string) $_total_pages ); ?>">
			<button type="button" class="adn-page-btn adn-page-prev" aria-label="<?php esc_attr_e( 'Previous page', ADN_TEXT_DOMAIN ); ?>" <?php echo 1 >= $_total_pages ? 'hidden' : 'disabled'; ?>>
				&#8592; <?php esc_html_e( 'Prev', ADN_TEXT_DOMAIN ); ?>
			</button>
			<span class="adn-page-info">
				<?php printf( esc_html__( 'Page %1$s of %2$s', ADN_TEXT_DOMAIN ),
					'<span id="adn-page-current">1</span>',
					'<span id="adn-page-total">' . esc_html( (string) $_total_pages ) . '</span>'
				); ?>
			</span>
			<button type="button" class="adn-page-btn adn-page-next" aria-label="<?php esc_attr_e( 'Next page', ADN_TEXT_DOMAIN ); ?>" <?php echo $_total_pages <= 1 ? 'hidden' : ''; ?>>
				<?php esc_html_e( 'Next', ADN_TEXT_DOMAIN ); ?> &#8594;
			</button>
		</div>

	<?php elseif ( ! comments_open() ) : ?>

		<p class="adn-comments-closed">
			<?php esc_html_e( 'Comments are closed.', ADN_TEXT_DOMAIN ); ?>
		</p>

	<?php endif; ?>

	<?php /* ── Inline status message (AJAX feedback) ── */ ?>
	<div class="adn-comment-status" id="adn-comment-status" role="alert" aria-live="polite" hidden></div>

	<?php /* ── Comment form ── */ ?>
	<?php if ( comments_open() ) :
		$commenter = wp_get_current_commenter();
		$user      = wp_get_current_user();
		$user_id   = get_current_user_id();
		$req       = get_option( 'require_name_email' );
		$req_mark  = $req ? ' <span class="adn-required notranslate">*</span>' : '';

		$fields = array(
			'author' => '<div class="adn-form-row">'
				. '<label for="author">' . esc_html__( 'Name', ADN_TEXT_DOMAIN ) . $req_mark . '</label>'
				. '<input id="author" name="author" type="text" value="' . esc_attr( $commenter['comment_author'] ) . '" placeholder="' . esc_attr__( 'Your name', ADN_TEXT_DOMAIN ) . '" autocomplete="name"' . ( $req ? ' aria-required="true"' : '' ) . '>'
				. '</div>',
			'email'  => '<div class="adn-form-row">'
				. '<label for="email">' . esc_html__( 'Email', ADN_TEXT_DOMAIN ).'</label>'
				. '<input id="email" name="email" type="email" value="' . esc_attr( $commenter['comment_author_email'] ) . '" placeholder="' . esc_attr__( 'your@email.com', ADN_TEXT_DOMAIN ) . '" autocomplete="email">'
				. '</div>',
			/* AJAX nonce - verified server-side before wp_handle_comment_submission() */
			'adn_nonce' => '<input type="hidden" name="adn_nonce" value="' . esc_attr( wp_create_nonce( 'adn_comment_nonce' ) ) . '">',
		);

		comment_form( array(
			'title_reply'          => esc_html__( 'Leave a Comment', ADN_TEXT_DOMAIN ),
			'title_reply_to'       => esc_html__( 'Reply to %s', ADN_TEXT_DOMAIN ),
			'title_reply_before'   => '<h2 id="reply-title" class="adn-form-heading">',
			'title_reply_after'    => '</h2>',
			'cancel_reply_before'  => ' <span class="adn-cancel-reply">',
			'cancel_reply_after'   => '</span>',
			'cancel_reply_link'    => esc_html__( 'Cancel reply', ADN_TEXT_DOMAIN ),
			'label_submit'         => esc_html__( 'Post Comment', ADN_TEXT_DOMAIN ),
			'submit_button'        => '<button name="%1$s" type="submit" id="%2$s" class="%3$s btn btn-primary">%4$s</button>',
			'submit_field'         => '<div class="adn-form-submit">%1$s %2$s</div>',
			'comment_field'        => '<div class="adn-form-row adn-form-row--full">'
				. '<label for="comment">' . esc_html__( 'Comment', ADN_TEXT_DOMAIN ) . ' <span class="adn-required notranslate">*</span></label>'
				. '<textarea id="comment" name="comment" rows="5" placeholder="' . esc_attr__( 'Share your thoughts…', ADN_TEXT_DOMAIN ) . '" required></textarea>'
				. '</div>',
			'must_log_in'          => '<p class="adn-must-login">' . sprintf(
				esc_html__( 'You must be %s to post a comment.', ADN_TEXT_DOMAIN ),
				'<a href="' . esc_url( wp_login_url( get_permalink() ) ) . '">' . esc_html__( 'logged in', ADN_TEXT_DOMAIN ) . '</a>'
			) . '</p>',
			'logged_in_as'         => $user_id ? '<p class="adn-logged-in">' . sprintf(
				esc_html__( 'Logged in as %1$s. %2$s', ADN_TEXT_DOMAIN ),
				'<strong>' . esc_html( $user->display_name ) . '</strong>',
				'<a href="' . esc_url( wp_logout_url( get_permalink() ) ) . '">' . esc_html__( 'Log out?', ADN_TEXT_DOMAIN ) . '</a>'
			) . '</p>' : '',
			'comment_notes_before' => '<p class="adn-comment-note">'
				. esc_html__( 'Your email address will not be published.', ADN_TEXT_DOMAIN )
				. ( $req ? ' ' . esc_html__( 'Required fields are marked', ADN_TEXT_DOMAIN ) . ' <span class="adn-required notranslate">*</span>' : '' )
				. '</p>',
			'comment_notes_after'  => '',
			'fields'               => $fields,
			'class_form'           => 'adn-comment-form',
			'class_container'      => 'adn-comment-form-wrap',
			'id_form'              => 'adn-comment-form',
		) );
	endif; ?>

</section>

<?php if ( current_user_can( 'moderate_comments' ) ) : ?>
<script>
(function(){
'use strict';
var AJAX = '<?php echo esc_js( admin_url( 'admin-ajax.php' ) ); ?>';
document.querySelectorAll('.adn-mod-actions').forEach(function(wrap){
    wrap.addEventListener('click', function(e){
        var btn = e.target.closest('.adn-mod-btn');
        if (!btn) return;
        var action  = btn.dataset.action;
        var cid     = wrap.dataset.comment;
        var nonce   = wrap.dataset.nonce;
        var comment = document.getElementById('comment-' + cid);
        btn.disabled = true;
        var fd = new FormData();
        fd.append('action','adn_moderate_comment');
        fd.append('nonce', nonce);
        fd.append('comment_id', cid);
        fd.append('mod_action', action);
        fetch(AJAX, {method:'POST', body:fd})
            .then(function(r){return r.json();})
            .then(function(d){
                if (!d.success) { btn.disabled = false; return; }
                if (action === 'trash' || action === 'spam') {
                    if (comment) { comment.style.transition='opacity .4s'; comment.style.opacity='0'; setTimeout(function(){comment.remove();},420); }
                } else if (action === 'approve') {
                    if (comment) {
                        comment.classList.remove('adn-comment--pending');
                        var p = comment.querySelector('.adn-comment-pending'); if(p) p.remove();
                        btn.dataset.action='unapprove'; btn.className='adn-mod-btn adn-mod-unapprove'; btn.textContent='⏸ Unapprove';
                    }
                } else if (action === 'unapprove') {
                    if (comment) {
                        comment.classList.add('adn-comment--pending');
                        btn.dataset.action='approve'; btn.className='adn-mod-btn adn-mod-approve'; btn.textContent='✓ Approve';
                    }
                }
                btn.disabled = false;
            })
            .catch(function(){ btn.disabled = false; });
    });
});
}());
</script>
<?php endif; ?>
