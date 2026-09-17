/**
 * single.js - WordPress single post interactions.
 *
 * Features:
 *  - TOC generation: scans .article-body h2 headings, assigns ids,
 *    injects anchor links into #tocNav; hides #tocBox when no headings exist
 *  - TOC scroll-spy: highlights the active section link as the user scrolls
 *  - Feedback buttons: toggle aria-pressed, show a brief thank-you state
 *  - Save guide button: toggles saved state (presentational, no persistence yet)
 */

( function () {
    'use strict';

    /* ── TOC generation ──────────────────────────────────────── */

    function buildToc() {
        var nav = document.getElementById( 'tocNav' );
        var box = document.getElementById( 'tocBox' );
        if ( ! nav || ! box ) return;

        var body = document.querySelector( '.article-body' );
        if ( ! body ) { box.hidden = true; return; }

        var headings = body.querySelectorAll( 'h2, h3' );
        if ( ! headings.length ) { box.hidden = true; return; }

        headings.forEach( function ( h, i ) {
            if ( ! h.id ) {
                h.id = 'article-section-' + ( i + 1 );
            }
            var a        = document.createElement( 'a' );
            a.href       = '#' + h.id;
            a.textContent = h.textContent;
            a.className  = 'toc-link' + ( h.tagName === 'H3' ? ' toc-link--h3' : '' );
            nav.appendChild( a );
        } );

        initScrollSpy( headings, nav );
    }

    /* ── Scroll-spy ──────────────────────────────────────────── */

    function initScrollSpy( headings, nav ) {
        if ( ! ( 'IntersectionObserver' in window ) ) return;

        var links = nav.querySelectorAll( '.toc-link' );

        function setActive( id ) {
            var activeLink = null;
            links.forEach( function ( l ) {
                var on = l.getAttribute( 'href' ) === '#' + id;
                l.classList.toggle( 'toc-active', on );
                if ( on ) { activeLink = l; }
            } );
            if ( activeLink ) { scrollTocIntoView( nav, activeLink ); }
        }

        var observer = new IntersectionObserver(
            function ( entries ) {
                entries.forEach( function ( entry ) {
                    if ( ! entry.isIntersecting ) return;
                    setActive( entry.target.id );
                } );
            },
            {
                rootMargin: '-10% 0px -80% 0px',
                threshold:  0,
            }
        );

        headings.forEach( function ( h ) { observer.observe( h ); } );

        /* Activate first link immediately */
        if ( links.length ) {
            links[0].classList.add( 'toc-active' );
        }
    }

    /**
     * Keep the active TOC link visible inside the scrollable TOC list.
     * Only scrolls the TOC container itself (never the page), and only when
     * the active link has drifted near/past an edge — so it feels natural.
     */
    function scrollTocIntoView( nav, link ) {
        if ( ! nav || nav.scrollHeight <= nav.clientHeight + 4 ) return; // not scrollable
        var navRect  = nav.getBoundingClientRect();
        var linkRect = link.getBoundingClientRect();
        var pad      = 28; // keep a little breathing room above/below

        if ( linkRect.top < navRect.top + pad ) {
            nav.scrollTo( {
                top: nav.scrollTop + ( linkRect.top - navRect.top ) - pad,
                behavior: 'smooth'
            } );
        } else if ( linkRect.bottom > navRect.bottom - pad ) {
            nav.scrollTo( {
                top: nav.scrollTop + ( linkRect.bottom - navRect.bottom ) + pad,
                behavior: 'smooth'
            } );
        }
    }

    /* ── Feedback buttons ────────────────────────────────────── */

    function bindFeedback() {
        var btns = document.querySelectorAll( '.feedback-btn' );
        if ( ! btns.length ) return;

        btns.forEach( function ( btn ) {
            btn.addEventListener( 'click', function () {
                /* Toggle off if already pressed */
                var nowPressed = btn.getAttribute( 'aria-pressed' ) === 'true';
                btns.forEach( function ( b ) { b.setAttribute( 'aria-pressed', 'false' ); } );
                if ( ! nowPressed ) {
                    btn.setAttribute( 'aria-pressed', 'true' );
                }
            } );
        } );
    }

    /* ── Save guide ──────────────────────────────────────────── */

    function bindSaveGuide() {
        var btn = document.querySelector( '.save-guide-btn' );
        if ( ! btn ) return;

        btn.addEventListener( 'click', function () {
            var saved = btn.getAttribute( 'aria-pressed' ) === 'true';
            btn.setAttribute( 'aria-pressed', saved ? 'false' : 'true' );
            btn.textContent = saved ? '🔖 Save Guide' : '✅ Saved';
        } );
    }

    /* ── AJAX comment submit ─────────────────────────────────── */

    function initCommentForm() {
        var cfg = window.adnComments;
        if ( ! cfg ) { return; }

        var form    = document.getElementById( 'adn-comment-form' );
        var status  = document.getElementById( 'adn-comment-status' );
        var list    = document.getElementById( 'adn-comment-list' );
        var section = document.getElementById( 'comments' );
        if ( ! form ) { return; }

        form.addEventListener( 'submit', function ( e ) {
            e.preventDefault();

            var submit = form.querySelector( '[type="submit"]' );
            var orig   = submit ? submit.textContent : '';
            if ( submit ) { submit.disabled = true; submit.textContent = cfg.i18n.posting; }

            if ( status ) { status.hidden = true; status.className = 'adn-comment-status'; }

            var fd = new FormData( form );
            fd.set( 'action',   'adn_submit_comment' );
            fd.set( 'adn_nonce', cfg.submitNonce );

            fetch( cfg.ajaxUrl, { method: 'POST', body: fd } )
                .then( function ( r ) { return r.json(); } )
                .then( function ( d ) {
                    if ( submit ) { submit.disabled = false; submit.textContent = orig; }

                    if ( ! d.success ) {
                        showStatus( d.data && d.data.message ? d.data.message : 'An error occurred.', 'error' );
                        return;
                    }

                    /* Inject the new comment */
                    if ( list && d.data.html ) {
                        var tmp = document.createElement( 'ol' );
                        tmp.innerHTML = d.data.html;
                        while ( tmp.firstChild ) { list.appendChild( tmp.firstChild ); }
                    } else if ( ! list && d.data.html ) {
                        /* No list yet - build it */
                        var heading = section ? section.querySelector( '.adn-comments-heading' ) : null;
                        var newList = document.createElement( 'ol' );
                        newList.id        = 'adn-comment-list';
                        newList.className = 'adn-comment-list';
                        newList.innerHTML = d.data.html;
                        if ( heading ) {
                            heading.insertAdjacentElement( 'afterend', newList );
                        } else if ( section ) {
                            section.insertBefore( newList, section.firstChild );
                        }
                    }

                    /* Update total counter */
                    if ( section ) {
                        var totalEl = section.querySelector( '#adn-total-count' );
                        var cntEl   = section.querySelector( '.adn-comments-count' );
                        if ( totalEl ) { totalEl.textContent = parseInt( totalEl.textContent, 10 ) + 1; }
                        if ( cntEl )   { cntEl.textContent   = parseInt( cntEl.textContent, 10 )   + 1; }
                    }

                    showStatus( d.data.message, d.data.approved ? 'success' : 'pending' );
                    form.reset();

                    /* Scroll to new comment */
                    if ( list && list.lastElementChild ) {
                        list.lastElementChild.scrollIntoView( { behavior: 'smooth', block: 'nearest' } );
                    }
                } )
                .catch( function () {
                    if ( submit ) { submit.disabled = false; submit.textContent = orig; }
                    showStatus( 'Network error. Please try again.', 'error' );
                } );
        } );

        function showStatus( msg, type ) {
            if ( ! status ) { return; }
            status.innerHTML  = msg;
            status.className   = 'adn-comment-status adn-comment-status--' + type;
            status.hidden      = false;
            status.scrollIntoView( { behavior: 'smooth', block: 'nearest' } );
        }
    }

    /* ── Filter tabs + replace-mode pagination ──────────────── */

    function initCommentsFilter() {
        var cfg = window.adnComments;
        if ( ! cfg ) { return; }

        var section = document.getElementById( 'comments' );
        if ( ! section ) { return; }

        var pager   = document.getElementById( 'adn-comments-pagination' );
        var spinner = document.getElementById( 'adn-comments-spinner' );

        var state = { page: 1, order: 'desc', status: 'approve' };

        function setLoading( on ) {
            if ( spinner ) { spinner.hidden = ! on; }
            if ( pager ) {
                pager.querySelectorAll( '.adn-page-btn' ).forEach( function ( b ) {
                    b.disabled = on;
                } );
            }
        }

        function updatePager( page, totalPages ) {
            if ( ! pager ) { return; }
            var cur   = document.getElementById( 'adn-page-current' );
            var total = document.getElementById( 'adn-page-total' );
            var prev  = pager.querySelector( '.adn-page-prev' );
            var next  = pager.querySelector( '.adn-page-next' );
            if ( cur )   { cur.textContent   = page; }
            if ( total ) { total.textContent = totalPages; }
            if ( prev ) {
                prev.disabled = ( page <= 1 );
                prev.hidden   = ( totalPages <= 1 );
            }
            if ( next ) {
                next.disabled = ( page >= totalPages );
                next.hidden   = ( totalPages <= 1 );
            }
            pager.dataset.page       = String( page );
            pager.dataset.totalPages = String( totalPages );
        }

        function loadComments() {
            setLoading( true );
            var fd = new FormData();
            fd.append( 'action',  'adn_load_comments' );
            fd.append( 'nonce',   cfg.loadNonce );
            fd.append( 'post_id', cfg.postId );
            fd.append( 'page',    state.page );
            fd.append( 'order',   state.order );
            fd.append( 'status',  state.status );

            fetch( cfg.ajaxUrl, { method: 'POST', body: fd } )
                .then( function ( r ) { return r.json(); } )
                .then( function ( d ) {
                    setLoading( false );
                    if ( ! d.success ) { return; }

                    var list = document.getElementById( 'adn-comment-list' );
                    if ( list ) {
                        var tmp = document.createElement( 'ol' );
                        tmp.innerHTML = d.data.html || '';
                        list.innerHTML = '';
                        while ( tmp.firstChild ) { list.appendChild( tmp.firstChild ); }
                        list.scrollIntoView( { behavior: 'smooth', block: 'nearest' } );
                    }

                    updatePager( d.data.page, d.data.total_pages );
                    state.page = d.data.page;
                } )
                .catch( function () { setLoading( false ); } );
        }

        /* Filter tab clicks */
        section.addEventListener( 'click', function ( e ) {
            var btn = e.target.closest( '.adn-filter-btn' );
            if ( ! btn ) { return; }
            section.querySelectorAll( '.adn-filter-btn' ).forEach( function ( b ) {
                b.classList.remove( 'is-active' );
            } );
            btn.classList.add( 'is-active' );
            state.order  = btn.dataset.order  || 'desc';
            state.status = btn.dataset.status || 'approve';
            state.page   = 1;
            loadComments();
        } );

        /* Prev / Next */
        if ( pager ) {
            pager.addEventListener( 'click', function ( e ) {
                var btn = e.target.closest( '.adn-page-btn' );
                if ( ! btn || btn.disabled || btn.hidden ) { return; }
                var totalPages = parseInt( pager.dataset.totalPages, 10 ) || 1;
                if ( btn.classList.contains( 'adn-page-prev' ) && state.page > 1 ) {
                    state.page--;
                } else if ( btn.classList.contains( 'adn-page-next' ) && state.page < totalPages ) {
                    state.page++;
                } else {
                    return;
                }
                loadComments();
            } );
        }
    }

    /* ── Scroll-reveal for article elements ─────────────────── */

    function initScrollReveal() {
        var body = document.querySelector( '.article-body' );
        if ( ! body || ! window.IntersectionObserver ) { return; }

        /* prefers-reduced-motion: skip animations */
        if ( window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) { return; }

        var sel = [
            'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'table',
            'blockquote', 'figure', 'img', 'details',
            '.article-tip-box', '.article-note-box', '.article-stat-row',
            '.article-steps', '.article-checklist', '.article-key-point',
            '.article-quick-facts', '.article-warning', '.article-example-box',
            '.article-promo', '.article-card-grid', '.compare-table-wrap',
            '.acard-grid', '.acard-bento', '.acard-row', '.acard-procon',
            '.acard-timeline', '.acard-insight', '.acard-stat'
        ].map( function ( s ) { return ':is(.article-body, .article-body section, .article-body div) > ' + s; } ).join( ', ' );

        var els;
        try {
            els = body.querySelectorAll( sel );
        } catch ( _e ) {
            /* Fallback for browsers without :is() */
            els = body.querySelectorAll(
                'h2,h3,h4,p,ul,ol,table,blockquote,figure,img,details,' +
                '.article-tip-box,.article-note-box,.article-stat-row,' +
                '.article-steps,.article-checklist,.article-key-point,' +
                '.article-quick-facts,.article-warning,.article-example-box,' +
                '.article-promo,.article-card-grid,.compare-table-wrap,' +
                '.acard-grid,.acard-bento,.acard-row,.acard-procon,' +
                '.acard-timeline,.acard-insight,.acard-stat'
            );
        }
        if ( ! els.length ) { return; }

        /* Mark body so CSS hides children (no flash without JS) */
        body.classList.add( 'adn-reveal-ready' );

        var io = new IntersectionObserver( function ( entries ) {
            entries.forEach( function ( entry ) {
                if ( ! entry.isIntersecting ) { return; }
                entry.target.classList.add( 'adn-visible' );
                io.unobserve( entry.target );
            } );
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' } );

        els.forEach( function ( el ) { io.observe( el ); } );
    }

    /* ── Reading progress bar ───────────────────────────────── */

    function initScrollUI() {
        var bar = document.getElementById( 'readingProgress' );
        if ( ! bar ) { return; }

        window.addEventListener( 'scroll', function () {
            var doc = document.documentElement;
            var pct = doc.scrollTop / ( doc.scrollHeight - doc.clientHeight ) * 100;
            bar.style.width = Math.min( pct, 100 ) + '%';
        }, { passive: true } );
    }

    /* ── Bootstrap ───────────────────────────────────────────── */

    function init() {
        buildToc();
        bindFeedback();
        bindSaveGuide();
        initCommentForm();
        initCommentsFilter();
        initScrollReveal();
        initScrollUI();
    }

    if ( document.readyState === 'loading' ) {
        document.addEventListener( 'DOMContentLoaded', init );
    } else {
        init();
    }

} )();
