/**
 * language-modal.js - Dynamic Language Selection Modal, Custom Translation Dictionary Overrides & GTranslate Controller.
 *
 * Features:
 *  - Dynamically builds and injects the accessible #adnLangModal dialog into the DOM.
 *  - Reads enabled languages configured in WordPress Admin > GTranslate.
 *  - Custom word/phrase dictionary overrides per language loaded from assets/js/lang/{code}.json.
 *  - Real-time DOM MutationObserver to replace inaccurate machine translations with human-crafted vocabulary.
 *  - Multi-tier persistent translation via localStorage and cookies (adn_lang, googtrans).
 *  - Instant real-time language search and filtering with responsive 1-column mobile cards.
 */

( function () {
    'use strict';

    function ready( fn ) {
        if ( document.readyState !== 'loading' ) {
            fn();
        } else {
            document.addEventListener( 'DOMContentLoaded', fn );
        }
    }

    var ADN_ALL_LANGUAGES = [
        { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
        { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
        { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
        { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
        { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
        { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
        { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
        { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
        { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
        { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇮🇳' },
        { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
        { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
        { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
        { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
        { code: 'zh-CN', name: 'Chinese (Simplified)', native: '简体中文', flag: '🇨🇳' },
        { code: 'zh-TW', name: 'Chinese (Traditional)', native: '繁體中文', flag: '🇹🇼' },
        { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
        { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
        { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
        { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
        { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' },
        { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
        { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
        { code: 'nl', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
        { code: 'pl', name: 'Polish', native: 'Polski', flag: '🇵🇱' },
        { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩' },
        { code: 'ms', name: 'Malay', native: 'Bahasa Melayu', flag: '🇲🇾' },
        { code: 'th', name: 'Thai', native: 'ไทย', flag: '🇹🇭' },
        { code: 'sv', name: 'Swedish', native: 'Svenska', flag: '🇸🇪' },
        { code: 'el', name: 'Greek', native: 'Ελληνικά', flag: '🇬🇷' },
        { code: 'he', name: 'Hebrew', native: 'עברית', flag: '🇮🇱' }
    ];

    /* ---------- Custom Language Dictionary & Phrase Overrides Engine ---------- */
    var dictCache = {};
    var isReplacing = false;
    var observer = null;
    var overrideDebounceTimer = null;

    function getSavedLanguage() {
        try {
            var local = localStorage.getItem( 'adn_user_lang' );
            if ( local ) { return local; }
        } catch ( e ) {}

        var match = document.cookie.match( /(?:^|;\s*)googtrans=(?:\/auto\/|\/en\/)([^;]+)/ );
        if ( match && match[ 1 ] ) { return match[ 1 ]; }

        var matchAdn = document.cookie.match( /(?:^|;\s*)adn_lang=([^;]+)/ );
        if ( matchAdn && matchAdn[ 1 ] ) { return matchAdn[ 1 ]; }

        return 'en';
    }

    function getLangDictUrl( langCode ) {
        var base = ( window.adnSite && window.adnSite.langDir )
            ? window.adnSite.langDir.replace( /\/$/, '' )
            : '/assets/js/lang';
        return base + '/' + encodeURIComponent( ( langCode || '' ).toLowerCase() ) + '.json';
    }

    function fetchDictionary( langCode, callback ) {
        var code = ( langCode || '' ).toLowerCase().trim();
        if ( ! code || code === 'en' ) {
            if ( callback ) { callback( null ); }
            return;
        }

        if ( dictCache[ code ] ) {
            if ( callback ) { callback( dictCache[ code ] ); }
            return;
        }

        var url = getLangDictUrl( code );
        fetch( url )
            .then( function ( res ) {
                if ( ! res.ok ) { throw new Error( 'No dictionary found' ); }
                return res.json();
            } )
            .then( function ( json ) {
                dictCache[ code ] = json;
                if ( callback ) { callback( json ); }
            } )
            .catch( function () {
                dictCache[ code ] = null;
                if ( callback ) { callback( null ); }
            } );
    }

    function applyDictionaryOverrides( langCode ) {
        var code = ( langCode || getSavedLanguage() || '' ).toLowerCase().trim();
        if ( ! code || code === 'en' ) { return; }

        fetchDictionary( code, function ( dict ) {
            if ( ! dict || typeof dict !== 'object' ) { return; }
            var keys = Object.keys( dict );
            if ( ! keys.length ) { return; }

            // Sort keys by length descending to prevent partial substring collisions
            keys.sort( function ( a, b ) { return b.length - a.length; } );

            isReplacing = true;

            try {
                // 1. Walk Text Nodes
                var walker = document.createTreeWalker(
                    document.body,
                    NodeFilter.SHOW_TEXT,
                    {
                        acceptNode: function ( node ) {
                            if ( ! node || ! node.nodeValue || ! node.nodeValue.trim() ) {
                                return NodeFilter.FILTER_REJECT;
                            }
                            var parent = node.parentElement;
                            if ( ! parent ) { return NodeFilter.FILTER_REJECT; }
                            var tag = parent.tagName.toUpperCase();
                            if ( tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE' || tag === 'TEXTAREA' ) {
                                return NodeFilter.FILTER_REJECT;
                            }
                            if ( parent.closest( '.notranslate, [translate="no"], #adnLangModal, #adnGTranslateBackend' ) ) {
                                return NodeFilter.FILTER_REJECT;
                            }
                            return NodeFilter.FILTER_ACCEPT;
                        }
                    },
                    false
                );

                var currentNode;
                while ( ( currentNode = walker.nextNode() ) ) {
                    var val = currentNode.nodeValue;
                    var changed = false;
                    for ( var i = 0; i < keys.length; i++ ) {
                        var k = keys[ i ];
                        var r = dict[ k ];
                        if ( val.indexOf( k ) !== -1 ) {
                            val = val.split( k ).join( r );
                            changed = true;
                        }
                    }
                    if ( changed ) {
                        currentNode.nodeValue = val;
                    }
                }

                // 2. Walk Input/Textarea Placeholders & aria-labels
                var elements = document.querySelectorAll( 'input[placeholder], textarea[placeholder], button[aria-label], a[aria-label], [title]' );
                elements.forEach( function ( el ) {
                    if ( el.closest( '.notranslate, [translate="no"], #adnLangModal, #adnGTranslateBackend' ) ) {
                        return;
                    }
                    if ( el.hasAttribute( 'placeholder' ) ) {
                        var ph = el.getAttribute( 'placeholder' );
                        keys.forEach( function ( k ) {
                            if ( ph && ph.indexOf( k ) !== -1 ) {
                                ph = ph.split( k ).join( dict[ k ] );
                                el.setAttribute( 'placeholder', ph );
                            }
                        } );
                    }
                    if ( el.hasAttribute( 'aria-label' ) ) {
                        var al = el.getAttribute( 'aria-label' );
                        keys.forEach( function ( k ) {
                            if ( al && al.indexOf( k ) !== -1 ) {
                                al = al.split( k ).join( dict[ k ] );
                                el.setAttribute( 'aria-label', al );
                            }
                        } );
                    }
                } );
            } catch ( e ) {
            } finally {
                setTimeout( function () {
                    isReplacing = false;
                }, 50 );
            }
        } );
    }

    function setupTranslationObserver() {
        if ( typeof MutationObserver === 'undefined' || observer ) { return; }

        observer = new MutationObserver( function ( mutations ) {
            if ( isReplacing ) { return; }
            var currentLang = getSavedLanguage();
            if ( ! currentLang || currentLang === 'en' ) { return; }

            clearTimeout( overrideDebounceTimer );
            overrideDebounceTimer = setTimeout( function () {
                applyDictionaryOverrides( currentLang );
            }, 120 );
        } );

        observer.observe( document.body, {
            childList: true,
            subtree: true,
            characterData: true
        } );
    }

    // Expose global helper for manual trigger if required
    window.adnApplyLanguageOverrides = applyDictionaryOverrides;

    /* ---------- Modal & Translation Lifecycle Controller ---------- */
    function initLanguageModal() {
        var backend = document.getElementById( 'adnGTranslateBackend' );
        var triggerBtns = document.querySelectorAll( '.js-open-lang-modal, #btnTranslate' );
        if ( ! backend && ! triggerBtns.length && typeof window.doGTranslate === 'undefined' ) {
            return;
        }

        var modal = document.getElementById( 'adnLangModal' );
        if ( ! modal ) {
            modal = document.createElement( 'div' );
            modal.className = 'adn-lang-modal';
            modal.id = 'adnLangModal';
            modal.setAttribute( 'role', 'dialog' );
            modal.setAttribute( 'aria-modal', 'true' );
            modal.setAttribute( 'aria-labelledby', 'adnLangModalTitle' );
            modal.hidden = true;

            var enabledLangsAttr = backend ? ( backend.getAttribute( 'data-enabled-languages' ) || '' ) : '';
            if ( enabledLangsAttr ) {
                modal.setAttribute( 'data-enabled-languages', enabledLangsAttr );
            }

            modal.innerHTML =
                '<div class="adn-lang-modal__backdrop js-close-lang-modal"></div>' +
                '<div class="adn-lang-modal__dialog">' +
                    '<div class="adn-lang-modal__header">' +
                        '<div class="adn-lang-modal__title-group">' +
                            '<div class="adn-lang-modal__icon">' +
                                '<svg class="ah-ico ah-ico-translate" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>' +
                            '</div>' +
                            '<div>' +
                                '<h3 class="adn-lang-modal__title" id="adnLangModalTitle">Select <span class="adn-lang-modal__highlight">Language</span></h3>' +
                                '<p class="adn-lang-modal__subtitle">Choose your preferred language for instant auto-translation</p>' +
                            '</div>' +
                        '</div>' +
                        '<button type="button" class="adn-lang-modal__close js-close-lang-modal notranslate" translate="no" aria-label="Close">' +
                            '<i class="ah-ico fa-solid fa-xmark" aria-hidden="true"></i>' +
                        '</button>' +
                    '</div>' +
                    '<div class="adn-lang-modal__active-bar" id="adnLangActiveBar">' +
                        '<span class="adn-lang-modal__active-label">Current Language:</span>' +
                        '<span class="adn-lang-modal__active-pill notranslate" translate="no">' +
                            '<span class="adn-lang-modal__active-flag" id="adnLangActiveFlag">🇬🇧</span>' +
                            '<strong class="adn-lang-modal__active-name" id="adnLangActiveNative">English</strong>' +
                            '<span class="adn-lang-modal__active-sub" id="adnLangActiveSub">(English)</span>' +
                        '</span>' +
                    '</div>' +
                    '<div class="adn-lang-modal__search">' +
                        '<span class="adn-lang-modal__search-icon"><i class="ah-ico fa-solid fa-magnifying-glass" aria-hidden="true"></i></span>' +
                        '<input type="text" id="adnLangSearchInput" class="adn-lang-modal__search-input" placeholder="Search language (Telugu, Hindi, English...)..." autocomplete="off">' +
                        '<button type="button" id="adnLangSearchClear" class="adn-lang-modal__search-clear notranslate" translate="no" aria-label="Clear search" hidden>' +
                            '<i class="ah-ico fa-solid fa-xmark" aria-hidden="true"></i>' +
                        '</button>' +
                    '</div>' +
                    '<div class="adn-lang-modal__body">' +
                        '<div class="adn-lang-grid" id="adnLangGrid"></div>' +
                        '<div class="adn-lang-empty notranslate" id="adnLangEmpty" translate="no" hidden>' +
                            '<div class="adn-lang-empty__icon-wrap">' +
                                '<svg class="adn-lang-empty__icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                                    '<circle cx="11" cy="11" r="8"></circle>' +
                                    '<line x1="21" y1="21" x2="16.65" y2="16.65"></line>' +
                                    '<line x1="8" y1="11" x2="14" y2="11"></line>' +
                                '</svg>' +
                            '</div>' +
                            '<p class="adn-lang-empty__text">No matching language found.</p>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            document.body.appendChild( modal );
        }

        var searchInput = document.getElementById( 'adnLangSearchInput' );
        var searchClear = document.getElementById( 'adnLangSearchClear' );
        var grid = document.getElementById( 'adnLangGrid' );
        var empty = document.getElementById( 'adnLangEmpty' );

        function getEnabledLanguages() {
            var enabledCodes = [];

            // 1. Check data-enabled-languages from modal or backend
            var rawAttr = modal.getAttribute( 'data-enabled-languages' ) || ( backend ? backend.getAttribute( 'data-enabled-languages' ) : '' );
            if ( rawAttr ) {
                try {
                    var parsed = JSON.parse( rawAttr );
                    if ( Array.isArray( parsed ) && parsed.length > 0 ) {
                        parsed.forEach( function ( c ) {
                            var code = ( c || '' ).toString().trim().toLowerCase();
                            if ( code && enabledCodes.indexOf( code ) === -1 ) {
                                enabledCodes.push( code );
                            }
                        } );
                    }
                } catch ( e ) {}
            }

            // 2. Check GTranslate DOM backend
            if ( backend ) {
                // Check select options
                var options = backend.querySelectorAll( 'select option' );
                if ( options && options.length ) {
                    options.forEach( function ( opt ) {
                        var val = ( opt.value || '' ).trim();
                        if ( val ) {
                            var code = val.indexOf( '|' ) !== -1 ? val.split( '|' )[ 1 ] : val;
                            code = code.trim().toLowerCase();
                            if ( code && enabledCodes.indexOf( code ) === -1 ) {
                                enabledCodes.push( code );
                            }
                        }
                    } );
                }

                // Check anchor links
                var links = backend.querySelectorAll( 'a' );
                if ( links && links.length ) {
                    links.forEach( function ( a ) {
                        var lang = a.getAttribute( 'data-gt-lang' );
                        if ( ! lang ) {
                            var href = a.getAttribute( 'href' ) || '';
                            var onclick = a.getAttribute( 'onclick' ) || '';
                            var m = ( href + ' ' + onclick ).match( /(?:googtrans\(en\||doGTranslate\(['"]en\|)([a-zA-Z\-]+)/ );
                            if ( m && m[ 1 ] ) { lang = m[ 1 ]; }
                        }
                        if ( lang ) {
                            var code = lang.trim().toLowerCase();
                            if ( code && enabledCodes.indexOf( code ) === -1 ) {
                                enabledCodes.push( code );
                            }
                        }
                    } );
                }
            }

            // If specific enabled languages are found, filter strictly to them
            if ( enabledCodes.length > 0 ) {
                var list = [];
                enabledCodes.forEach( function ( code ) {
                    var found = null;
                    for ( var i = 0; i < ADN_ALL_LANGUAGES.length; i++ ) {
                        if ( ADN_ALL_LANGUAGES[ i ].code.toLowerCase() === code ) {
                            found = ADN_ALL_LANGUAGES[ i ];
                            break;
                        }
                    }
                    if ( found ) {
                        list.push( found );
                    } else {
                        list.push( { code: code, name: code.toUpperCase(), native: code.toUpperCase(), flag: '🌐' } );
                    }
                } );
                return list;
            }

            return ADN_ALL_LANGUAGES;
        }

        function getLangObj( code ) {
            var activeList = getEnabledLanguages();
            for ( var i = 0; i < activeList.length; i++ ) {
                if ( activeList[ i ].code.toLowerCase() === ( code || '' ).toLowerCase() ) {
                    return activeList[ i ];
                }
            }
            return { code: code || 'en', name: ( code || 'EN' ).toUpperCase(), native: ( code || 'EN' ).toUpperCase(), flag: '🌐' };
        }

        function updateBadges( code ) {
            var currentObj = getLangObj( code );

            var activeFlag = document.getElementById( 'adnLangActiveFlag' );
            if ( activeFlag ) { activeFlag.textContent = currentObj.flag; }
            var activeNative = document.getElementById( 'adnLangActiveNative' );
            if ( activeNative ) { activeNative.textContent = currentObj.native; }
            var activeSub = document.getElementById( 'adnLangActiveSub' );
            if ( activeSub ) { activeSub.textContent = '(' + currentObj.name + ')'; }

            var mobileCurrent = document.getElementById( 'mobileTranslateCurrent' );
            if ( mobileCurrent ) {
                mobileCurrent.textContent = currentObj.native + ' (' + currentObj.name + ')';
            }
        }

        function renderGrid( filterText ) {
            if ( ! grid ) { return; }
            var query = ( filterText || '' ).toLowerCase().trim();
            var currentLang = getSavedLanguage().toLowerCase();
            var activeLanguages = getEnabledLanguages();
            var matchedCount = 0;
            var html = '';

            activeLanguages.forEach( function ( lang ) {
                var match = ! query ||
                    lang.name.toLowerCase().indexOf( query ) !== -1 ||
                    lang.native.toLowerCase().indexOf( query ) !== -1 ||
                    lang.code.toLowerCase().indexOf( query ) !== -1;

                if ( match ) {
                    matchedCount++;
                    var isActive = ( lang.code.toLowerCase() === currentLang );
                    html += '<button type="button" class="adn-lang-card notranslate' + ( isActive ? ' is-active' : '' ) + '" translate="no" data-lang="' + lang.code + '" aria-pressed="' + ( isActive ? 'true' : 'false' ) + '"' + ( isActive ? ' disabled aria-disabled="true"' : '' ) + '>';
                    html += '  <span class="adn-lang-card__flag notranslate" translate="no">' + lang.flag + '</span>';
                    html += '  <span class="adn-lang-card__info notranslate" translate="no">';
                    html += '    <span class="adn-lang-card__native notranslate" translate="no">' + lang.native + '</span>';
                    html += '    <span class="adn-lang-card__name notranslate" translate="no">' + lang.name + '</span>';
                    html += '  </span>';
                    html += '  <span class="adn-lang-card__check notranslate" translate="no" aria-hidden="true"><i class="ah-ico fa-solid fa-check"></i></span>';
                    html += '</button>';
                }
            } );

            grid.innerHTML = html;
            if ( empty ) { empty.hidden = matchedCount > 0; }

            grid.querySelectorAll( '.adn-lang-card:not([disabled])' ).forEach( function ( card ) {
                card.addEventListener( 'click', function () {
                    if ( this.disabled || this.classList.contains( 'is-active' ) ) { return; }
                    var code = this.getAttribute( 'data-lang' );
                    if ( code ) { selectLanguage( code ); }
                } );
            } );
        }

        function openModal() {
            modal.removeAttribute( 'hidden' );
            document.body.classList.add( 'modal-open' );
            renderGrid( searchInput ? searchInput.value : '' );
            if ( searchInput ) {
                setTimeout( function () { searchInput.focus(); }, 80 );
            }
        }

        function closeModal() {
            modal.setAttribute( 'hidden', '' );
            document.body.classList.remove( 'modal-open' );
            if ( searchInput ) {
                searchInput.value = '';
                if ( searchClear ) { searchClear.hidden = true; }
            }
        }

        function applyTranslation( langCode ) {
            var langPair = 'en|' + langCode;

            if ( typeof window.doGTranslate === 'function' ) {
                try { window.doGTranslate( langPair ); } catch ( e ) {}
            }

            var selectors = document.querySelectorAll( '.gt_selector, select.goog-te-combo, #adnGTranslateBackend select' );
            selectors.forEach( function ( sel ) {
                try {
                    sel.value = langPair;
                    if ( ! sel.value ) { sel.value = langCode; }
                    sel.dispatchEvent( new Event( 'change', { bubbles: true } ) );
                } catch ( e ) {}
            } );

            var links = document.querySelectorAll( '#adnGTranslateBackend a[data-gt-lang="' + langCode + '"], #adnGTranslateBackend a[onclick*="' + langCode + '"]' );
            if ( links.length ) {
                try { links[ 0 ].click(); } catch ( e ) {}
            }

            // Trigger custom overrides for current language
            setTimeout( function () {
                applyDictionaryOverrides( langCode );
            }, 100 );
            setTimeout( function () {
                applyDictionaryOverrides( langCode );
            }, 400 );
            setTimeout( function () {
                applyDictionaryOverrides( langCode );
            }, 1000 );
        }

        function selectLanguage( langCode ) {
            try {
                localStorage.setItem( 'adn_user_lang', langCode );
            } catch ( e ) {}

            var oneYear = 31536000;
            document.cookie = 'adn_lang=' + langCode + '; path=/; max-age=' + oneYear + '; SameSite=Lax';
            document.cookie = 'googtrans=/en/' + langCode + '; path=/; max-age=' + oneYear + '; SameSite=Lax';
            document.cookie = 'googtrans=/auto/' + langCode + '; path=/; max-age=' + oneYear + '; SameSite=Lax';

            var host = window.location.hostname;
            if ( host && host.indexOf( '.' ) !== -1 && host !== 'localhost' ) {
                var domain = '.' + host.replace( /^www\./, '' );
                document.cookie = 'googtrans=/en/' + langCode + '; domain=' + domain + '; path=/; max-age=' + oneYear + '; SameSite=Lax';
                document.cookie = 'googtrans=/auto/' + langCode + '; domain=' + domain + '; path=/; max-age=' + oneYear + '; SameSite=Lax';
            }

            applyTranslation( langCode );
            updateBadges( langCode );
            renderGrid( searchInput ? searchInput.value : '' );

            var langObj = getLangObj( langCode );
            if ( typeof window.ADNToast === 'object' && window.ADNToast && window.ADNToast.show ) {
                window.ADNToast.show( {
                    type: 'info',
                    icon: '<span class="notranslate" translate="no" style="font-size:1.25rem;line-height:1;">' + ( langObj.flag || '🌐' ) + '</span>',
                    title: 'Language Changed',
                    message: 'Switched to ' + langObj.native + ( langObj.name !== langObj.native ? ' (' + langObj.name + ')' : '' ),
                    duration: 3500
                } );
            }

            setTimeout( function () {
                closeModal();
            }, 200 );
        }

        // Open triggers
        document.querySelectorAll( '.js-open-lang-modal, #btnTranslate' ).forEach( function ( btn ) {
            btn.addEventListener( 'click', function ( e ) {
                e.preventDefault();
                e.stopPropagation();
                openModal();
            } );
        } );

        // Close triggers
        modal.querySelectorAll( '.js-close-lang-modal' ).forEach( function ( btn ) {
            btn.addEventListener( 'click', function ( e ) {
                e.preventDefault();
                closeModal();
            } );
        } );

        document.addEventListener( 'keydown', function ( e ) {
            if ( e.key === 'Escape' && ! modal.hasAttribute( 'hidden' ) ) {
                closeModal();
            }
        } );

        // Search filtering
        if ( searchInput ) {
            searchInput.addEventListener( 'input', function () {
                var val = this.value;
                if ( searchClear ) { searchClear.hidden = ! val.length; }
                renderGrid( val );
            } );
        }
        if ( searchClear ) {
            searchClear.addEventListener( 'click', function () {
                if ( searchInput ) {
                    searchInput.value = '';
                    searchInput.focus();
                }
                this.hidden = true;
                renderGrid( '' );
            } );
        }

        // Setup live DOM translation observer for dynamic words
        setupTranslationObserver();

        // Check total enabled languages: if only 1 language exists, hide the switcher button completely
        var activeLanguages = getEnabledLanguages();
        if ( activeLanguages.length <= 1 ) {
            document.querySelectorAll( '.js-open-lang-modal, #btnTranslate' ).forEach( function ( btn ) {
                btn.hidden = true;
                btn.style.display = 'none';
            } );
        }

        // Initial restore of persistent language
        var savedLang = getSavedLanguage();
        updateBadges( savedLang );

        if ( savedLang && savedLang !== 'en' ) {
            applyDictionaryOverrides( savedLang );

            var maxWaitMs = 3000;
            var startTime = Date.now();

            function checkAndReveal() {
                var isTranslated = document.documentElement.classList.contains( 'translated-ltr' ) ||
                                   document.documentElement.classList.contains( 'translated-rtl' ) ||
                                   !!document.querySelector( 'font[dir="auto"], font[style*="vertical-align"], .goog-te-banner-frame' );

                if ( isTranslated || ( Date.now() - startTime > maxWaitMs ) ) {
                    applyDictionaryOverrides( savedLang );
                    setTimeout( function () {
                        applyDictionaryOverrides( savedLang );
                        document.documentElement.classList.remove( 'adn-lang-loading' );
                    }, 50 );
                } else {
                    setTimeout( checkAndReveal, 40 );
                }
            }

            var attempts = 0;
            var interval = setInterval( function () {
                attempts++;
                if ( typeof window.doGTranslate === 'function' || document.querySelector( '.goog-te-combo, .gt_selector, #adnGTranslateBackend select' ) ) {
                    applyTranslation( savedLang );
                    clearInterval( interval );
                    checkAndReveal();
                } else if ( attempts > 30 ) {
                    clearInterval( interval );
                    checkAndReveal();
                }
            }, 60 );
        } else {
            document.documentElement.classList.remove( 'adn-lang-loading' );
        }
    }

    ready( initLanguageModal );

} )();
