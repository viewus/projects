/**
 * toast.js - Standalone, Accessible & Reusable Toast Notification System.
 *
 * Exposes window.ADNToast and window.ADN.Toast with rich options:
 *  - ADNToast.show({ title, message, type, icon, duration, onClick })
 *  - ADNToast.success(message, title, options)
 *  - ADNToast.info(message, title, options)
 *  - ADNToast.warning(message, title, options)
 *  - ADNToast.error(message, title, options)
 *  - ADNToast.dismiss(toastElement)
 *  - ADNToast.clearAll()
 */

( function ( window, document ) {
    'use strict';

    var container = null;

    function getOrCreateContainer() {
        if ( ! container || ! document.body.contains( container ) ) {
            container = document.querySelector( '.adn-toast-container' );
            if ( ! container ) {
                container = document.createElement( 'div' );
                container.className = 'adn-toast-container notranslate';
                container.setAttribute( 'translate', 'no' );
                container.setAttribute( 'aria-live', 'polite' );
                container.setAttribute( 'aria-atomic', 'false' );
                document.body.appendChild( container );
            }
        }
        return container;
    }

    var ICONS = {
        success: '<svg class="adn-toast__icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
        info:    '<svg class="adn-toast__icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
        warning: '<svg class="adn-toast__icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        error:   '<svg class="adn-toast__icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
    };

    function escapeHtml( str ) {
        if ( str === null || str === undefined ) { return ''; }
        var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String( str ).replace( /[&<>"']/g, function ( m ) { return map[ m ]; } );
    }

    var ADNToast = {
        show: function ( options ) {
            options = options || {};
            if ( typeof options === 'string' ) {
                options = { message: options };
            }

            var type       = options.type || 'info';
            var title      = options.title || '';
            var message    = options.message || '';
            var duration   = options.duration !== undefined ? options.duration : 3800;
            var customIcon = options.icon || '';
            var className  = options.className || '';
            var onClick    = options.onClick || null;

            var toast = document.createElement( 'div' );
            toast.className = 'adn-toast adn-toast--' + type + ( className ? ' ' + className : '' ) + ' notranslate';
            toast.setAttribute( 'translate', 'no' );
            toast.setAttribute( 'role', 'status' );

            var iconHtml = customIcon || ICONS[ type ] || ICONS.info;

            var html = '';
            html += '<div class="adn-toast__icon notranslate" translate="no">' + iconHtml + '</div>';
            html += '<div class="adn-toast__content notranslate" translate="no">';
            if ( title ) {
                html += '<div class="adn-toast__title notranslate" translate="no">' + escapeHtml( title ) + '</div>';
            }
            if ( message ) {
                html += '<div class="adn-toast__message notranslate" translate="no">' + ( options.isHtml ? message : escapeHtml( message ) ) + '</div>';
            }
            html += '</div>';
            html += '<button type="button" class="adn-toast__close notranslate" translate="no" aria-label="Close notification"><i class="ah-ico fa-solid fa-xmark" aria-hidden="true"></i></button>';

            if ( duration > 0 ) {
                html += '<div class="adn-toast__progress"><div class="adn-toast__progress-bar"></div></div>';
            }

            toast.innerHTML = html;

            var cont = getOrCreateContainer();
            cont.appendChild( toast );

            // Trigger smooth slide/fade in
            requestAnimationFrame( function () {
                toast.classList.add( 'is-visible' );
            } );

            var timer = null;
            var startTime = Date.now();
            var remaining = duration;
            var progressBar = toast.querySelector( '.adn-toast__progress-bar' );

            function startTimer() {
                if ( duration <= 0 ) { return; }
                startTime = Date.now();
                if ( progressBar ) {
                    progressBar.style.transition = 'width ' + remaining + 'ms linear';
                    progressBar.style.width = '0%';
                }
                timer = setTimeout( function () {
                    ADNToast.dismiss( toast );
                }, remaining );
            }

            function pauseTimer() {
                if ( duration <= 0 ) { return; }
                clearTimeout( timer );
                remaining -= ( Date.now() - startTime );
                if ( progressBar ) {
                    var computedWidth = window.getComputedStyle( progressBar ).width;
                    progressBar.style.transition = 'none';
                    progressBar.style.width = computedWidth;
                }
            }

            startTimer();

            toast.addEventListener( 'mouseenter', pauseTimer );
            toast.addEventListener( 'mouseleave', function () {
                if ( remaining > 0 ) {
                    startTimer();
                } else {
                    ADNToast.dismiss( toast );
                }
            } );

            var closeBtn = toast.querySelector( '.adn-toast__close' );
            if ( closeBtn ) {
                closeBtn.addEventListener( 'click', function ( e ) {
                    e.stopPropagation();
                    ADNToast.dismiss( toast );
                } );
            }

            if ( typeof onClick === 'function' ) {
                toast.addEventListener( 'click', function () {
                    onClick( toast );
                } );
            }

            return toast;
        },

        dismiss: function ( toast ) {
            if ( ! toast || ! toast.parentNode ) { return; }
            toast.classList.remove( 'is-visible' );
            toast.classList.add( 'is-leaving' );
            setTimeout( function () {
                if ( toast && toast.parentNode ) {
                    toast.parentNode.removeChild( toast );
                }
            }, 280 );
        },

        clearAll: function () {
            if ( ! container ) { return; }
            var toasts = container.querySelectorAll( '.adn-toast' );
            toasts.forEach( function ( t ) {
                ADNToast.dismiss( t );
            } );
        },

        success: function ( msg, title, opts ) {
            opts = opts || {};
            opts.type = 'success';
            opts.message = msg;
            opts.title = title || opts.title;
            return this.show( opts );
        },

        info: function ( msg, title, opts ) {
            opts = opts || {};
            opts.type = 'info';
            opts.message = msg;
            opts.title = title || opts.title;
            return this.show( opts );
        },

        warning: function ( msg, title, opts ) {
            opts = opts || {};
            opts.type = 'warning';
            opts.message = msg;
            opts.title = title || opts.title;
            return this.show( opts );
        },

        error: function ( msg, title, opts ) {
            opts = opts || {};
            opts.type = 'error';
            opts.message = msg;
            opts.title = title || opts.title;
            return this.show( opts );
        }
    };

    window.ADNToast = ADNToast;
    if ( typeof window.ADN === 'object' && window.ADN ) {
        window.ADN.Toast = ADNToast;
    }

} )( window, document );
