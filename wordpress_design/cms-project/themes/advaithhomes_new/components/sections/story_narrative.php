<?php
/**
 * components/sections/story_narrative.php
 *
 * Cinematic 7-chapter story section. Each chapter is a full-bleed split card:
 *   left/right  — cartoon illustration (alternates sides)
 *   other side  — chapter label eyebrow, italic lede headline, body paragraph,
 *                 optional CTA + trust note
 *
 * New in v3:
 *  - chapter_label  — small eyebrow above each lede ("The Wondering" etc.)
 *  - subheading     — section intro subheading beneath the main heading
 *  - mood badge     — colour-coded visual cue per emotional arc stage
 *  - 7 illustrations (ch0–ch6) mapped by index
 *  - Fully self-contained reveal (own IntersectionObserver, no .adn-reveal dependency)
 *
 * Props: $story {
 *   eyebrow, heading, subheading?,
 *   chapters[] {
 *     chapter_label?, lede, body, mood?, cta?{ label, url }
 *   }
 * }
 */
defined( 'ABSPATH' ) || exit;

$_s        = isset( $story ) && is_array( $story ) ? $story : array();
$_chapters = isset( $_s['chapters'] ) && is_array( $_s['chapters'] ) ? $_s['chapters'] : array();
if ( empty( $_chapters ) ) return;

$_eyb   = isset( $_s['eyebrow'] )    ? (string) $_s['eyebrow']    : '';
$_hdg   = isset( $_s['heading'] )    ? (string) $_s['heading']    : '';
$_sub   = isset( $_s['subheading'] ) ? (string) $_s['subheading'] : '';

// All 7 illustrations — index matches chapter index in JSON.
$_img_base = get_template_directory_uri() . '/assets/images/story/';
$_imgs = array(
    0 => $_img_base . 'ch0-wondering.jpg',
    1 => $_img_base . 'ch1-question.jpg',
    2 => $_img_base . 'ch2-reach-out.jpg',
    3 => $_img_base . 'ch3-listened.jpg',
    4 => $_img_base . 'ch4-clarity.jpg',
    5 => $_img_base . 'ch5-keys.jpg',
    6 => $_img_base . 'ch6-celebration.jpg',
);

// Mood → CSS modifier map.
$_mood_class = array(
    'contemplative' => 'sn-chapter--mood-warm',
    'overwhelmed'   => 'sn-chapter--mood-muted',
    'hopeful'       => 'sn-chapter--mood-hopeful',
    'relief'        => 'sn-chapter--mood-relief',
    'clarity'       => 'sn-chapter--mood-clarity',
    'achievement'   => 'sn-chapter--mood-gold',
    'invitation'    => 'sn-chapter--mood-gold',
);

$_uniq = 'sn-' . substr( md5( uniqid( '', true ) ), 0, 6 );
?>
<section class="sn-section" id="<?php echo esc_attr( $_uniq ); ?>">

    <?php /* ── ambient drifting story & video visual glyphs ──────────── */ ?>
    <div class="sn-bg" aria-hidden="true">
        <svg class="sn-bg-shape sn-bg-shape--house" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 60 L60 22 L105 60" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M27 52v46h66V52" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
            <path d="M50 98V72h20v26" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
            <rect x="72" y="62" width="14" height="20" rx="2" stroke="currentColor" stroke-width="4"/>
        </svg>
        <svg class="sn-bg-shape sn-bg-shape--key" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="38" cy="42" r="22" stroke="currentColor" stroke-width="5"/>
            <path d="M55 55 L96 96 M96 96v-16 M96 96h-16 M80 80h-10" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="38" cy="42" r="9" fill="currentColor" fill-opacity="0.12"/>
        </svg>
        <svg class="sn-bg-shape sn-bg-shape--doc" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="10" width="80" height="100" rx="6" stroke="currentColor" stroke-width="5"/>
            <line x1="36" y1="40" x2="84" y2="40" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
            <line x1="36" y1="58" x2="84" y2="58" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
            <line x1="36" y1="76" x2="64" y2="76" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
        </svg>
        <div class="sn-bg-glyph sn-bg-glyph--compass" aria-hidden="true"><?php echo adn_icon( 'fa-solid fa-compass' ); ?></div>
        <div class="sn-bg-glyph sn-bg-glyph--shield" aria-hidden="true"><?php echo adn_icon( 'fa-solid fa-shield-halved' ); ?></div>
        <div class="sn-bg-glyph sn-bg-glyph--star" aria-hidden="true"><?php echo adn_icon( 'fa-solid fa-sparkles' ); ?></div>
    </div>

    <div class="container">

        <?php /* ── Section header ─────────────────────────────────── */ ?>
        <?php adn_component( 'parts/section_headers/eyebrow_heading', array(
            'eyebrow'       => $_eyb,
            'heading'       => $_hdg,
            'subheading'    => $_sub,
            'wrapper_class' => 'sn-header',
        ) ); ?>

        <?php /* ── Chapter cards ──────────────────────────────────── */ ?>
        <div class="sn-chapters" id="<?php echo esc_attr( $_uniq ); ?>-list">
            <?php foreach ( $_chapters as $_i => $_ch ) :
                $_lede  = isset( $_ch['lede'] )          ? (string) $_ch['lede']          : '';
                $_body  = isset( $_ch['body'] )           ? (string) $_ch['body']           : '';
                $_cta   = isset( $_ch['cta'] ) && is_array( $_ch['cta'] ) ? $_ch['cta'] : array();
                $_label    = isset( $_ch['chapter_label'] ) ? (string) $_ch['chapter_label'] : '';
                $_step_ref = isset( $_ch['step_ref'] )      ? (string) $_ch['step_ref']      : '';
                $_mood     = isset( $_ch['mood'] )           ? (string) $_ch['mood']           : '';
                $_img      = isset( $_imgs[ $_i ] )          ? $_imgs[ $_i ]                   : '';
                $_num      = str_pad( (string) ( $_i + 1 ), 2, '0', STR_PAD_LEFT );
                $_last     = ( $_i === count( $_chapters ) - 1 );
                $_flip     = ( 0 !== $_i % 2 ) ? ' sn-chapter--flip' : '';
                $_mcls     = ( '' !== $_mood && isset( $_mood_class[ $_mood ] ) ) ? ' ' . $_mood_class[ $_mood ] : '';
            ?>
            <div class="sn-chapter<?php echo $_flip . $_mcls . ( $_last ? ' sn-chapter--last' : '' ); ?>"
                     data-sn-idx="<?php echo (int) $_i; ?>">

                <span class="sn-num" aria-hidden="true"><?php echo esc_html( $_num ); ?></span>

                <?php /* ── Illustration panel ─────────────────────── */ ?>
                <?php if ( '' !== $_img ) : ?>
                <div class="sn-img-col">
                    <div class="sn-img-frame">
                        <img
                            src="<?php echo esc_url( $_img ); ?>"
                            alt="<?php echo esc_attr( $_label ); ?>"
                            class="sn-img"
                            loading="lazy"
                            decoding="async"
                            width="800" height="450"
                        >
                        <div class="sn-img-vignette" aria-hidden="true"></div>
                        <div class="sn-cine-flare" aria-hidden="true"></div>

                        <?php /* Elegant chapter story badge */ ?>
                        <span class="sn-chapter-badge" aria-hidden="true">
                            <span class="sn-chapter-badge-dot"></span>
                            <span>Chapter <?php echo esc_html( $_num ); ?> &bull; <?php echo esc_html( $_label ); ?></span>
                        </span>
                    </div>
                    <?php if ( '' !== $_mood ) : ?>
                    <span class="sn-mood-pip sn-mood-pip--<?php echo esc_attr( $_mood ); ?>" aria-hidden="true"></span>
                    <?php endif; ?>
                </div>
                <?php endif; ?>

                <?php /* ── Text panel ───────────────────────────────── */ ?>
                <div class="sn-text-col">
                    <div class="sn-text-inner">
                        <?php if ( '' !== $_step_ref ) : ?>
                        <div class="sn-step-ref" aria-label="<?php echo esc_attr( $_step_ref ); ?>">
                            <span class="sn-step-ref-icon" aria-hidden="true"><?php echo adn_icon( 'fa-solid fa-route' ); ?></span>
                            <span class="sn-step-ref-text"><?php echo esc_html( $_step_ref ); ?></span>
                        </div>
                        <?php endif; ?>
                        <?php if ( '' !== $_label ) : ?>
                        <span class="sn-chapter-label"><?php echo esc_html( $_label ); ?></span>
                        <?php endif; ?>
                        <?php if ( '' !== $_lede ) : ?>
                        <p class="sn-lede"><?php echo esc_html( $_lede ); ?></p>
                        <?php endif; ?>
                        <?php if ( '' !== $_body ) : ?>
                        <p class="sn-body"><?php echo esc_html( $_body ); ?></p>
                        <?php endif; ?>
                        <?php if ( ! empty( $_cta['url'] ) ) : ?>
                        <a href="<?php echo esc_url( adn_link( $_cta['url'] ) ); ?>"
                           class="btn btn-accent btn-lg sn-cta">
                            <?php echo esc_html( isset( $_cta['label'] ) ? (string) $_cta['label'] : 'Get started' ); ?>&nbsp;<span aria-hidden="true">&rarr;</span>
                        </a>
                        <?php endif; ?>
                    </div>
                </div>

            </div>
            <?php endforeach; ?>
        </div>

    </div>
</section>

<script>
/* Story narrative — self-contained IntersectionObserver reveal.
   No .adn-reveal/.adn-in dependency.
   sn-js class on the list enables CSS hidden-state (progressive enhancement). */
(function() {
    'use strict';
    var section  = document.getElementById('<?php echo esc_js( $_uniq ); ?>');
    var list     = document.getElementById('<?php echo esc_js( $_uniq ); ?>-list');
    if (!section || !list) return;

    var chapters = list.querySelectorAll('.sn-chapter');

    /* Enable JS-powered animations (chapters start hidden via .sn-js CSS) */
    list.classList.add('sn-js');

    /* --- Fallback: no IntersectionObserver -------------------------------- */
    if (!('IntersectionObserver' in window)) {
        chapters.forEach(function(c) { c.classList.add('sn-in'); });
        return;
    }

    /* --- Cinematic reveal: chapter slides in from its image side --------- */
    var revealIO = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
            if (!e.isIntersecting) return;
            var chapter = e.target;
            chapter.classList.add('sn-in');
            revealIO.unobserve(chapter);
        });
    }, { threshold: 0.10, rootMargin: '0px 0px -50px 0px' });

    chapters.forEach(function(c) {
        revealIO.observe(c);
    });
})();
</script>
