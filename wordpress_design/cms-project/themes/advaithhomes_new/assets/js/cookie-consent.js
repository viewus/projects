/**
 * cookie-consent.js — Site-wide cookie consent banner + granular preferences.
 *
 * One cookie: 'adn_cookie_consent', JSON payload:
 *   '{"v":<version>,"analytics":0|1,"advertising":0|1,"ts":<unix-ms>}'
 *   - Fully accepted or partial (either category on) → expires in 365 days.
 *   - Fully rejected (both categories off)           → expires in 20 hours
 *     (banner shows again after that automatically).
 * "Necessary" cookies are not stored in the payload at all - they are always
 * on and never shown to the visitor as a toggle.
 *
 * Legacy pre-granular values ('accepted:<v>' / 'rejected:<v>:<ts>') are still
 * read and transparently mapped onto the new model (accepted → both
 * categories on, rejected → both off) so existing visitors aren't re-asked
 * just because this shipped.
 *
 * <v> is an admin-controlled version number (window.adnConsentCfg.acceptVersion /
 * .rejectVersion) - fully-accepted/partial payloads are checked against
 * acceptVersion, fully-rejected payloads against rejectVersion. A mismatch is
 * treated as undecided and the banner shows again - this is how "re-ask
 * everyone" / "re-ask people who rejected" (Theme → Admin Actions → Cache)
 * forces the banner back without the server being able to touch visitors'
 * browsers directly.
 *
 * Public API (window.adnCookieConsent):
 *   .getStatus()              → 'accepted' | 'rejected' | '' (not yet decided)
 *                                'accepted' means at least one optional category
 *                                is on (kept for existing consumers that only
 *                                care about a plain yes/no).
 *   .show(onAccept, onReject) → shows banner; optional ONE-TIME callbacks
 *   .accept()                 → programmatically Accept All
 *   .reject()                 → programmatically Reject All
 *   .onChange(onAccept, onReject) → fires once, immediately, if consent is already
 *                              decided; otherwise subscribes for the visitor's next
 *                              decision. Unlike .show(), never forces the banner to
 *                              display.
 *   .getPreferences()          → {analytics, advertising} (0|1 each), or null if undecided
 *   .getCategory(name)         → 0|1 for 'analytics' | 'advertising'; 1 for 'necessary'
 *   .savePreferences({analytics, advertising}) → custom per-category save (Manage
 *                              Preferences form) - same versioning/expiry rules as
 *                              Accept/Reject All.
 *   .onCategoryChange(name, onEnable, onDisable) → PERSISTENT subscription (unlike
 *                              .onChange(), fires every time that category's saved
 *                              value changes, not just once) - use this to gate
 *                              analytics/ads tags in real time as the visitor edits
 *                              their preferences, not only on first decision.
 *   .openPreferences()         → opens the "Manage Preferences" modal on demand.
 *   .reset()                   → immediately erases the consent cookie (no reload) -
 *                              for manual testing; the banner shows again on next
 *                              init() / page load, same as a version mismatch.
 */
( function () {
    'use strict';

    var CK_KEY       = 'adn_cookie_consent_v1';
    var ACCEPT_DAYS  = 30;
    var REJECT_HOURS = 20;
    var REJECT_DAYS  = REJECT_HOURS / 24;
    var REJECT_MS    = REJECT_HOURS * 3600000;

    function acceptVersion() {
        return ( window.adnConsentCfg && window.adnConsentCfg.acceptVersion ) || '1';
    }
    function rejectVersion() {
        return ( window.adnConsentCfg && window.adnConsentCfg.rejectVersion ) || '1';
    }

    var _onAccept = [];
    var _onReject = [];

    /* Persistent per-category listeners - {enable, disable} pairs, never spliced
       away, because (unlike the one-shot banner) Manage Preferences can be
       reopened and re-saved many times in one page view. */
    var _catListeners = { analytics: [], advertising: [] };

    /* ── Cookie helpers ───────────────────────────────────────── */

    function ckRead( name ) {
        var pairs = document.cookie.split( ';' );
        for ( var i = 0; i < pairs.length; i++ ) {
            var pair = pairs[ i ].trim();
            var eq   = pair.indexOf( '=' );
            if ( eq === -1 ) { continue; }
            if ( pair.slice( 0, eq ).trim() === name ) {
                return decodeURIComponent( pair.slice( eq + 1 ) );
            }
        }
        return '';
    }

    function ckWrite( name, value, days ) {
        var exp = new Date( Date.now() + days * 86400000 ).toUTCString();
        document.cookie = name + '=' + encodeURIComponent( value )
            + '; path=/; expires=' + exp + '; SameSite=Lax';
    }

    function ckErase( name ) {
        document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        try {
            localStorage.removeItem( 'adn_offline_search_cache' );
        } catch ( e ) {}
    }

    /* ── Preferences (granular) ───────────────────────────────── */

    /** Parse the stored cookie into {analytics, advertising} (0|1 each), or null if undecided/invalid/stale. */
    function parsePrefs( raw ) {
        if ( ! raw ) { return null; }

        /* Legacy cookie from before versioning existed - plain 'accepted', no version
           suffix. Honor it as "everything on" instead of erasing it. */
        if ( raw === 'accepted' ) { return { analytics: 1, advertising: 1 }; }

        if ( raw.indexOf( 'accepted:' ) === 0 ) {
            var av = raw.slice( 9 );
            if ( av === acceptVersion() ) { return { analytics: 1, advertising: 1 }; }
            ckErase( CK_KEY ); /* Admin re-asked everyone since this visitor last accepted. */
            return null;
        }

        /* Legacy rejection value "rejected:<v>:<unix-ms>" (or pre-versioning "rejected:<unix-ms>"). */
        if ( raw.indexOf( 'rejected:' ) === 0 ) {
            var parts = raw.slice( 9 ).split( ':' );
            var rv, ts;
            if ( parts.length >= 2 ) {
                rv = parts[ 0 ];
                ts = parseInt( parts[ 1 ], 10 );
            } else {
                rv = rejectVersion();
                ts = parseInt( parts[ 0 ], 10 );
            }
            if ( rv !== rejectVersion() ) {
                ckErase( CK_KEY ); /* Admin re-asked people who rejected. */
                return null;
            }
            if ( ! isNaN( ts ) && ( Date.now() - ts ) < REJECT_MS ) {
                return { analytics: 0, advertising: 0 };
            }
            ckErase( CK_KEY ); /* Timestamp missing, corrupt, or the reject window has passed. */
            return null;
        }

        /* Current format: JSON payload with independent per-category grants. */
        if ( raw.charAt( 0 ) === '{' ) {
            var parsed;
            try {
                parsed = JSON.parse( raw );
            } catch ( e ) {
                ckErase( CK_KEY );
                return null;
            }
            if ( ! parsed || typeof parsed !== 'object' ) {
                ckErase( CK_KEY );
                return null;
            }
            var analytics   = parsed.analytics ? 1 : 0;
            var advertising = parsed.advertising ? 1 : 0;
            var rejectedAll = ( 0 === analytics && 0 === advertising );
            var expected    = rejectedAll ? rejectVersion() : acceptVersion();

            if ( String( parsed.v ) !== String( expected ) ) {
                ckErase( CK_KEY );
                return null;
            }
            if ( rejectedAll ) {
                var elapsed = Date.now() - ( parseInt( parsed.ts, 10 ) || 0 );
                if ( isNaN( parsed.ts ) || elapsed >= REJECT_MS ) {
                    ckErase( CK_KEY );
                    return null;
                }
            }
            return { analytics: analytics, advertising: advertising };
        }

        return null;
    }

    function getPreferences() {
        return parsePrefs( ckRead( CK_KEY ) );
    }

    function getCategory( name ) {
        if ( 'necessary' === name ) { return 1; }
        var p = getPreferences();
        return ( p && p[ name ] ) ? 1 : 0;
    }

    /** Write the granular payload, choosing version/expiry by whether everything is off. */
    function writePrefs( prefs ) {
        var analytics   = prefs.analytics ? 1 : 0;
        var advertising = prefs.advertising ? 1 : 0;
        var rejectedAll = ( 0 === analytics && 0 === advertising );

        ckWrite( CK_KEY, JSON.stringify( {
            v          : rejectedAll ? rejectVersion() : acceptVersion(),
            analytics  : analytics,
            advertising: advertising,
            ts         : Date.now()
        } ), rejectedAll ? REJECT_DAYS : ACCEPT_DAYS );

        notifyCategory( 'analytics' );
        notifyCategory( 'advertising' );
    }

    /* ── Status (coarse, backward-compatible) ─────────────────── */

    function getStatus() {
        var p = getPreferences();
        if ( ! p ) { return ''; }
        /* "accepted" = at least one optional category is on - matches the old
           binary contract closely enough for existing consumers (e.g. the
           expert-unlock feature) that only need a plain yes/no. */
        return ( p.analytics || p.advertising ) ? 'accepted' : 'rejected';
    }

    /* ── Banner DOM ───────────────────────────────────────────── */

    var _banner = null;

    function policyUrl() {
        return ( window.adnConsentCfg && window.adnConsentCfg.policyUrl )
            ? window.adnConsentCfg.policyUrl
            : '/cookie-policy/';
    }

    function buildBanner() {
        var el       = document.createElement( 'div' );
        el.id        = 'adn-cookie-banner';
        el.className = 'adn-cookie-banner';
        el.setAttribute( 'role', 'region' );
        el.setAttribute( 'aria-label', 'Cookie consent' );
        el.innerHTML =
            '<div class="acb-inner">'
          +   '<div class="acb-text">'
          +     '<p class="acb-msg">We use cookies to remember your preferences and improve your experience on our site. '
          +     'Read our <a href="' + policyUrl() + '" target="_blank" rel="noopener noreferrer" class="acb-link">Cookie Policy</a> to learn more. '
          +     '<button type="button" id="adn-cookie-manage" class="acb-manage-link">Manage Preferences</button></p>'
          +   '</div>'
          +   '<div class="acb-actions">'
          +     '<button type="button" id="adn-cookie-reject" class="acb-btn acb-btn--reject">Reject</button>'
          +     '<button type="button" id="adn-cookie-accept" class="acb-btn acb-btn--accept">Accept All</button>'
          +   '</div>'
          + '</div>';
        return el;
    }

    function show( onAcceptCb, onRejectCb ) {
        if ( onAcceptCb ) { _onAccept.push( onAcceptCb ); }
        if ( onRejectCb ) { _onReject.push( onRejectCb ); }
        if ( _banner && document.body.contains( _banner ) ) { return; }
        _banner = buildBanner();
        document.body.appendChild( _banner );
        requestAnimationFrame( function () {
            requestAnimationFrame( function () { _banner.classList.add( 'is-visible' ); } );
        } );
        _banner.querySelector( '#adn-cookie-accept' ).addEventListener( 'click', doAccept );
        _banner.querySelector( '#adn-cookie-reject' ).addEventListener( 'click', doReject );
        _banner.querySelector( '#adn-cookie-manage' ).addEventListener( 'click', openPreferences );
    }

    function hide() {
        if ( ! _banner ) { return; }
        _banner.classList.remove( 'is-visible' );
        var el = _banner;
        _banner = null;
        setTimeout( function () {
            if ( el.parentNode ) { el.parentNode.removeChild( el ); }
        }, 420 );
    }

    /* ── Accept / Reject / custom preferences ─────────────────── */

    function doAccept() {
        writePrefs( { analytics: 1, advertising: 1 } );
        hide();
        var cbs = _onAccept.splice( 0 );
        cbs.forEach( function ( fn ) { try { fn(); } catch ( e ) {} } );
        _onReject = [];
    }

    function doReject() {
        writePrefs( { analytics: 0, advertising: 0 } );
        hide();
        var cbs = _onReject.splice( 0 );
        cbs.forEach( function ( fn ) { try { fn(); } catch ( e ) {} } );
        _onAccept = [];
    }

    /** Manage Preferences "Save" - independent per-category choice, not all-or-nothing. */
    function savePreferences( prefs ) {
        var analytics   = prefs && prefs.analytics ? 1 : 0;
        var advertising = prefs && prefs.advertising ? 1 : 0;
        writePrefs( { analytics: analytics, advertising: advertising } );
        hide();

        /* Mirror getStatus()'s own rule so .onChange() subscribers stay correct
           even when the visitor used Manage Preferences instead of Accept/Reject All. */
        var overallAccepted = !! ( analytics || advertising );
        var cbs = ( overallAccepted ? _onAccept : _onReject ).splice( 0 );
        cbs.forEach( function ( fn ) { try { fn(); } catch ( e ) {} } );
        if ( overallAccepted ) { _onReject = []; } else { _onAccept = []; }
    }

    /* ── Subscribe without forcing the banner open (coarse) ──────
       Consumers that only need to react to consent (analytics/ads tags)
       must NOT trigger .show() themselves, or an already-decided visitor
       would see the banner pop back up. This resolves immediately against
       whatever was already decided, and otherwise queues onto the same
       accept/reject callback arrays the real banner drains on click. */

    function onChange( onAcceptCb, onRejectCb ) {
        var status = getStatus();
        if ( status === 'accepted' ) { if ( onAcceptCb ) { onAcceptCb(); } return; }
        if ( status === 'rejected' ) { if ( onRejectCb ) { onRejectCb(); } return; }
        if ( onAcceptCb ) { _onAccept.push( onAcceptCb ); }
        if ( onRejectCb ) { _onReject.push( onRejectCb ); }
    }

    /* ── Subscribe per category (granular, persistent) ───────────
       Unlike onChange(), this fires every time the category's saved value
       changes - the visitor may open Manage Preferences and flip a toggle
       more than once in the same page view, and consumers gating a live
       script (e.g. Google Ads) need to react to every one of those, not
       just the first. */

    function onCategoryChange( name, onEnableCb, onDisableCb ) {
        if ( ! _catListeners[ name ] ) { return; }
        _catListeners[ name ].push( { enable: onEnableCb, disable: onDisableCb } );
        notifyOne( name, _catListeners[ name ][ _catListeners[ name ].length - 1 ] );
    }

    function notifyOne( name, listener ) {
        var enabled = !! getCategory( name );
        var fn = enabled ? listener.enable : listener.disable;
        if ( fn ) { try { fn(); } catch ( e ) {} }
    }

    function notifyCategory( name ) {
        var list = _catListeners[ name ] || [];
        for ( var i = 0; i < list.length; i++ ) { notifyOne( name, list[ i ] ); }
    }

    /* ── Manage Preferences form (shared by the modal AND any embedded
       page panel, e.g. the Cookie Policy page's [adn_cookie_preferences]
       shortcode) ─────────────────────────────────────────────── */

    function renderPreferencesForm( container, opts ) {
        opts = opts || {};
        var prefs = getPreferences() || { analytics: 0, advertising: 0 };

        container.innerHTML =
            '<div class="acp-row acp-row--locked">'
          +   '<div class="acp-row-head"><span class="acp-title">Necessary</span><span class="acp-always">Always Active</span></div>'
          +   '<p class="acp-desc">Required for the site to work - security, language choice, session handling. These cannot be turned off.</p>'
          + '</div>'
          + '<div class="acp-row">'
          +   '<div class="acp-row-head"><span class="acp-title">Analytics</span>'
          +     '<label class="acp-switch"><input type="checkbox" class="acp-toggle" data-cat="analytics"' + ( prefs.analytics ? ' checked' : '' ) + '><span class="acp-slider"></span></label>'
          +   '</div>'
          +   '<p class="acp-desc">Helps us understand how visitors use the site, so we can improve it.</p>'
          + '</div>'
          + '<div class="acp-row">'
          +   '<div class="acp-row-head"><span class="acp-title">Advertising</span>'
          +     '<label class="acp-switch"><input type="checkbox" class="acp-toggle" data-cat="advertising"' + ( prefs.advertising ? ' checked' : '' ) + '><span class="acp-slider"></span></label>'
          +   '</div>'
          +   '<p class="acp-desc">Used to measure and personalise the ads you may see.</p>'
          + '</div>'
          + '<div class="acp-actions">'
          +   '<button type="button" class="acp-btn acp-btn--reject" data-act="reject">Reject All</button>'
          +   '<button type="button" class="acp-btn acp-btn--save" data-act="save">Save Preferences</button>'
          +   '<button type="button" class="acp-btn acp-btn--accept" data-act="accept">Accept All</button>'
          + '</div>'
          + '<p class="acp-saved-msg" role="status" hidden>Preferences saved.</p>';

        function flashSaved() {
            var msg = container.querySelector( '.acp-saved-msg' );
            if ( ! msg ) { return; }
            msg.hidden = false;
            clearTimeout( msg._t );
            msg._t = setTimeout( function () { msg.hidden = true; }, 3000 );
        }

        function afterSave() {
            renderPreferencesForm( container, opts ); /* refresh toggle states */
            flashSaved();
            if ( opts.onDone ) { opts.onDone(); }
        }

        container.querySelector( '[data-act="accept"]' ).addEventListener( 'click', function () {
            doAccept();
            afterSave();
        } );
        container.querySelector( '[data-act="reject"]' ).addEventListener( 'click', function () {
            doReject();
            afterSave();
        } );
        container.querySelector( '[data-act="save"]' ).addEventListener( 'click', function () {
            savePreferences( {
                analytics  : container.querySelector( '[data-cat="analytics"]' ).checked,
                advertising: container.querySelector( '[data-cat="advertising"]' ).checked
            } );
            afterSave();
        } );
    }

    /* ── "Manage Preferences" modal (on-demand, from the banner or anywhere) ── */

    var _modal = null;

    function openPreferences() {
        if ( _modal && document.body.contains( _modal ) ) { return; }
        _modal = document.createElement( 'div' );
        _modal.id = 'adn-cookie-modal';
        _modal.className = 'adn-cookie-modal';
        _modal.innerHTML =
            '<div class="acm-backdrop"></div>'
          + '<div class="acm-wrap">'
          +   '<button type="button" class="acm-close" aria-label="Close">&times;</button>'
          +   '<div class="acm-dialog" role="dialog" aria-modal="true" aria-label="Cookie preferences">'
          +     '<h2 class="acm-heading">Cookie Preferences</h2>'
          +     '<p class="acm-intro">Choose which optional cookies we can use. Read our '
          +       '<a href="' + policyUrl() + '" target="_blank" rel="noopener noreferrer">Cookie Policy</a> for full details.</p>'
          +     '<div class="acm-body"></div>'
          +   '</div>'
          + '</div>';
        document.body.appendChild( _modal );
        renderPreferencesForm( _modal.querySelector( '.acm-body' ), { onDone: closePreferences } );
        _modal.querySelector( '.acm-close' ).addEventListener( 'click', closePreferences );
        _modal.querySelector( '.acm-backdrop' ).addEventListener( 'click', closePreferences );
        requestAnimationFrame( function () {
            requestAnimationFrame( function () { _modal.classList.add( 'is-visible' ); } );
        } );
    }

    function closePreferences() {
        if ( ! _modal ) { return; }
        _modal.classList.remove( 'is-visible' );
        var el = _modal;
        _modal = null;
        setTimeout( function () {
            if ( el.parentNode ) { el.parentNode.removeChild( el ); }
        }, 300 );
    }

    /* ── Embedded panel mount (e.g. Cookie Policy page shortcode) ─ */

    function mountEmbeds() {
        var nodes = document.querySelectorAll( '[data-adn-cookie-prefs="embed"]' );
        for ( var i = 0; i < nodes.length; i++ ) {
            renderPreferencesForm( nodes[ i ], {} );
        }
    }

    /* ── Auto-show on page load ───────────────────────────────── */

    function init() {
        /* Runs regardless of decision state - a returning visitor reaching the
           Cookie Policy page still needs to be able to change their mind. */
        mountEmbeds();

        var s = getStatus();

        /* Already decided (either way) — never show the BANNER again, on any
           page, including the cookie-policy page itself. */
        if ( s === 'accepted' || s === 'rejected' ) { return; }

        /* Undecided → show banner. */
        show();
    }

    if ( document.readyState === 'loading' ) {
        document.addEventListener( 'DOMContentLoaded', init );
    } else {
        init();
    }

    /* ── Public API ───────────────────────────────────────────── */

    window.adnCookieConsent = {
        getStatus       : getStatus,
        show            : show,
        accept          : doAccept,
        reject          : doReject,
        onChange        : onChange,
        getPreferences  : getPreferences,
        getCategory     : getCategory,
        savePreferences : savePreferences,
        onCategoryChange: onCategoryChange,
        openPreferences : openPreferences,
        reset           : function () { ckErase( CK_KEY ); },
    };

} )();
