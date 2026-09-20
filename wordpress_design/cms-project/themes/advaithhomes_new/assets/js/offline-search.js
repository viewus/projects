/**
 * offline-search.js - High-performance Client-Side & Offline Search Index Engine.
 *
 * Features:
 *  - Automatically fetches & caches the searchable index in localStorage / memory.
 *  - 0ms response time for instant live search suggestions without server lag.
 *  - Multi-token keyword matching, relevance scoring & categorized results.
 *  - Works completely offline once loaded.
 */

( function () {
    'use strict';

    var STORAGE_KEY = 'adn_offline_search_cache';
    var CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 24 hours

    var indexData = null;
    var isFetching = false;
    var fetchQueue = [];

    var ENDPOINT = ( window.adnSite && window.adnSite.visitorsUrl )
        ? window.adnSite.visitorsUrl.replace( '/visitors', '/search/offline-index' )
        : '/api/adn/v1/search/offline-index';

    /* ── Index Management ───────────────────────────────────── */

    function clearCache() {
        indexData = null;
        try {
            localStorage.removeItem( STORAGE_KEY );
        } catch ( e ) {}
    }

    function checkConsentAndBypass() {
        // Clear cache if URL bypass/clear query param is present
        if ( /[?&](clear_cache|cache_clear|nocache|reset_cookies)=1/i.test( window.location.search ) ) {
            clearCache();
            return;
        }

        // Hook into Cookie Consent decisions
        if ( window.adnCookieConsent ) {
            if ( typeof window.adnCookieConsent.getStatus === 'function' && window.adnCookieConsent.getStatus() === 'rejected' ) {
                clearCache();
            }
            if ( typeof window.adnCookieConsent.onChange === 'function' ) {
                window.adnCookieConsent.onChange( null, function () {
                    clearCache();
                } );
            }
        }
    }

    function loadCachedIndex() {
        checkConsentAndBypass();
        try {
            var raw = localStorage.getItem( STORAGE_KEY );
            if ( raw ) {
                var cached = JSON.parse( raw );
                if ( cached && cached.items && ( Date.now() - ( cached.timestamp || 0 ) < CACHE_TTL_MS ) ) {
                    indexData = cached.items;
                    return true;
                }
            }
        } catch ( e ) {
            // localStorage not available or invalid
        }
        return false;
    }

    function saveCachedIndex( items, version ) {
        indexData = items;

        // If user rejected cookies, keep only in temporary memory (never persist in localStorage)
        if ( window.adnCookieConsent && typeof window.adnCookieConsent.getStatus === 'function' && window.adnCookieConsent.getStatus() === 'rejected' ) {
            return;
        }

        try {
            localStorage.setItem( STORAGE_KEY, JSON.stringify( {
                timestamp: Date.now(),
                version: version || 1,
                items: items
            } ) );
        } catch ( e ) {
            // Storage full or disabled
        }
    }

    function fetchIndex( callback ) {
        if ( indexData ) {
            if ( callback ) { callback( indexData ); }
            return;
        }

        if ( callback ) { fetchQueue.push( callback ); }
        if ( isFetching ) { return; }

        isFetching = true;
        fetch( ENDPOINT, { credentials: 'same-origin' } )
            .then( function ( res ) {
                if ( ! res.ok ) { throw new Error( 'HTTP ' + res.status ); }
                return res.json();
            } )
            .then( function ( json ) {
                var payload = ( json && json.data ) || {};
                var items = payload.items || [];
                saveCachedIndex( items, payload.version );
                isFetching = false;
                while ( fetchQueue.length ) {
                    var cb = fetchQueue.shift();
                    try { cb( indexData ); } catch ( err ) {}
                }
            } )
            .catch( function () {
                isFetching = false;
                while ( fetchQueue.length ) {
                    var cb = fetchQueue.shift();
                    try { cb( [] ); } catch ( err ) {}
                }
            } );
    }

    /* ── Search Engine & Scoring ────────────────────────────── */

    function tokenize( str ) {
        return ( str || '' ).toLowerCase()
            .replace( /[^a-z0-9\s]/g, ' ' )
            .trim()
            .split( /\s+/ )
            .filter( function ( w ) { return w.length >= 2; } );
    }

    function search( query, options ) {
        options = options || {};
        var limit = options.limit || 8;
        var filterType = options.type || 'all';

        if ( ! indexData || ! query ) { return []; }

        var qTokens = tokenize( query );
        if ( ! qTokens.length ) { return []; }

        var results = [];

        for ( var i = 0; i < indexData.length; i++ ) {
            var item = indexData[i];
            if ( filterType !== 'all' && item.type !== filterType ) { continue; }

            var score = 0;
            var titleLower = ( item.title || '' ).toLowerCase();
            var descLower  = ( item.desc || '' ).toLowerCase();
            var catLower   = ( item.category || '' ).toLowerCase();
            var kws        = item.keywords || [];

            var matchedAll = true;

            for ( var j = 0; j < qTokens.length; j++ ) {
                var token = qTokens[j];
                var tokenScore = 0;

                // Exact phrase/word matches in title
                if ( titleLower.indexOf( token ) !== -1 ) {
                    tokenScore += 10;
                    if ( titleLower.indexOf( query.toLowerCase() ) !== -1 ) {
                        tokenScore += 15;
                    }
                }

                // Category match
                if ( catLower.indexOf( token ) !== -1 ) {
                    tokenScore += 6;
                }

                // Keyword list match
                for ( var k = 0; k < kws.length; k++ ) {
                    if ( kws[k].indexOf( token ) === 0 ) {
                        tokenScore += 5;
                        break;
                    }
                }

                // Description match
                if ( descLower.indexOf( token ) !== -1 ) {
                    tokenScore += 2;
                }

                if ( tokenScore === 0 ) {
                    matchedAll = false;
                    break;
                }

                score += tokenScore;
            }

            if ( matchedAll && score > 0 ) {
                results.push( { item: item, score: score } );
            }
        }

        results.sort( function ( a, b ) { return b.score - a.score; } );
        return results.slice( 0, limit ).map( function ( r ) { return r.item; } );
    }

    /* ── Live Search UI Dropdown Attacher ───────────────────── */

    function attachOfflineLiveSearch( input, container ) {
        if ( ! input ) { return; }

        var dropdown = document.createElement( 'div' );
        dropdown.className = 'adn-offline-search-dropdown';
        dropdown.hidden = true;
        dropdown.setAttribute( 'role', 'listbox' );

        var parent = container || input.parentNode;
        if ( getComputedStyle( parent ).position === 'static' ) {
            parent.style.position = 'relative';
        }
        parent.appendChild( dropdown );

        var activeIndex = -1;
        var debounceTimer = null;

        input.addEventListener( 'focus', function () {
            fetchIndex(); // ensure index is warm
            if ( input.value.trim().length >= 2 ) {
                renderResults( input.value.trim() );
            }
        } );

        input.addEventListener( 'input', function () {
            clearTimeout( debounceTimer );
            debounceTimer = setTimeout( function () {
                var val = input.value.trim();
                if ( val.length >= 2 ) {
                    fetchIndex( function () {
                        renderResults( val );
                    } );
                } else {
                    hideDropdown();
                }
            }, 60 );
        } );

        input.addEventListener( 'keydown', function ( e ) {
            if ( dropdown.hidden ) { return; }
            var items = dropdown.querySelectorAll( '.adn-search-res-item' );
            if ( ! items.length ) { return; }

            if ( e.key === 'ArrowDown' ) {
                e.preventDefault();
                activeIndex = ( activeIndex + 1 ) % items.length;
                updateActive( items );
            } else if ( e.key === 'ArrowUp' ) {
                e.preventDefault();
                activeIndex = ( activeIndex - 1 + items.length ) % items.length;
                updateActive( items );
            } else if ( e.key === 'Enter' && activeIndex >= 0 ) {
                e.preventDefault();
                items[ activeIndex ].click();
            } else if ( e.key === 'Escape' ) {
                hideDropdown();
            }
        } );

        document.addEventListener( 'click', function ( e ) {
            if ( ! parent.contains( e.target ) ) {
                hideDropdown();
            }
        } );

        function renderResults( q ) {
            var matches = search( q, { limit: 6 } );
            if ( ! matches.length ) {
                dropdown.innerHTML = '<div class="adn-search-no-match">No matches found for "<strong>' + escapeHtml( q ) + '</strong>"</div>';
                dropdown.hidden = false;
                return;
            }

            var html = '';
            matches.forEach( function ( m, idx ) {
                html += '<a href="' + escapeHtml( m.url ) + '" class="adn-search-res-item" role="option" data-idx="' + idx + '">'
                    + '<div class="adn-search-res-badge">' + escapeHtml( m.badge || 'Article' ) + '</div>'
                    + '<div class="adn-search-res-main">'
                    + '<div class="adn-search-res-title">' + highlight( m.title, q ) + '</div>'
                    + ( m.desc ? '<div class="adn-search-res-desc">' + escapeHtml( m.desc ) + '</div>' : '' )
                    + '</div>'
                    + '</a>';
            } );

            dropdown.innerHTML = html;
            dropdown.hidden = false;
            activeIndex = -1;
        }

        function updateActive( items ) {
            items.forEach( function ( el, idx ) {
                el.classList.toggle( 'active', idx === activeIndex );
            } );
            if ( activeIndex >= 0 && items[ activeIndex ] ) {
                items[ activeIndex ].scrollIntoView( { block: 'nearest' } );
            }
        }

        function hideDropdown() {
            dropdown.hidden = true;
            activeIndex = -1;
        }
    }

    function highlight( text, q ) {
        if ( ! text || ! q ) { return escapeHtml( text ); }
        var tokens = tokenize( q );
        var escaped = escapeHtml( text );
        tokens.forEach( function ( tok ) {
            if ( tok.length >= 2 ) {
                var reg = new RegExp( '(' + tok + ')', 'gi' );
                escaped = escaped.replace( reg, '<mark>$1</mark>' );
            }
        } );
        return escaped;
    }

    function escapeHtml( str ) {
        return ( str || '' )
            .replace( /&/g, '&amp;' )
            .replace( /</g, '&lt;' )
            .replace( />/g, '&gt;' )
            .replace( /"/g, '&quot;' );
    }

    /* ── Auto Initialization ────────────────────────────────── */

    function init() {
        loadCachedIndex();

        // Header search input
        var headerSearchInput = document.querySelector( '#headerSearch .header-search-input' );
        if ( headerSearchInput ) {
            attachOfflineLiveSearch( headerSearchInput );
        }

        // Search page refinement input
        var refineInput = document.querySelector( '.search-refine-input' );
        if ( refineInput ) {
            attachOfflineLiveSearch( refineInput );
        }

        // Generic inputs tagged with data-offline-search
        document.querySelectorAll( 'input[data-offline-search]' ).forEach( function ( inp ) {
            attachOfflineLiveSearch( inp );
        } );

        // Warm up index on idle / background
        if ( 'requestIdleCallback' in window ) {
            window.requestIdleCallback( function () { fetchIndex(); } );
        } else {
            setTimeout( function () { fetchIndex(); }, 2000 );
        }
    }

    // Public API
    window.AdnOfflineSearch = {
        search: search,
        fetchIndex: fetchIndex,
        attach: attachOfflineLiveSearch,
        isReady: function () { return !! indexData; },
        getIndex: function () { return indexData; }
    };

    if ( document.readyState === 'loading' ) {
        document.addEventListener( 'DOMContentLoaded', init );
    } else {
        init();
    }

} )();
