/* Detect-zoom
 * -----------
 * Cross Browser Zoom and Pixel Ratio Detector
 * Version 1.0.4 | Apr 1 2013
 * dual-licensed under the WTFPL and MIT license
 * Maintained by https://github/tombigel
 * Original developer https://github.com/yonran
 */

//AMD and CommonJS initialization copied from https://github.com/zohararad/audio5js
(function (root, ns, factory) {
    "use strict";

    if (typeof (module) !== 'undefined' && module.exports) { // CommonJS
        module.exports = factory(ns, root);
    } else if (typeof (define) === 'function' && define.amd) { // AMD
        define("detect-zoom", function () {
            return factory(ns, root);
        });
    } else {
        root[ns] = factory(ns, root);
    }

}(window, 'detectZoom', function () {

    /**
     * Use devicePixelRatio if supported by the browser
     * @return {Number}
     * @private
     */
    var devicePixelRatio = function () {
        return Math.round(window.devicePixelRatio * 100) / 100 || 1;
    };

    // Detect the font (text) zoom ratio, i.e. how many `px` go into an `em`? 
    var zoomText = function () {
        // Hidden DIV's CSS:
        var hideCSS = 'position:absolute;left:-2000px;height:1px;',
        // With the width in unit px
        pxBlock = document.createElement('div'),
        // While the text itself is measured in ems
        emBlockWrapper = document.createElement('div'),
        emBlock = document.createElement('div'),
        // Fixed and variable width DIV
        pxBlockWidth,
        emBlockWidth,
        // zoom
        z;

        pxBlock.style.cssText = 'width:16px;' + hideCSS;
        document.body.appendChild(pxBlock);

        emBlockWrapper.style.fontSize = 'medium';
        emBlock.style.cssText = 'width:1em;' + hideCSS;
        emBlockWrapper.appendChild(emBlock);
        document.body.appendChild(emBlockWrapper);

        pxBlockWidth = pxBlock.offsetWidth;
        emBlockWidth = emBlock.offsetWidth;
        z = emBlockWidth / pxBlockWidth;

        document.body.removeChild(pxBlock);
        document.body.removeChild(emBlockWrapper);

        return z;
    };

    /**
     * Fallback function to set default values
     * @return {Object}
     * @private
     */
    var fallback = function () {
        return {
            zoom: 1,
            devicePxPerCssPx: 1,
            fallback: true,
            name: 'fallback'
        };
    };

    /**
     * IE 8 and 9: no trick needed!
     * @return {Object}
     * @private
     **/
    var ie8 = function () {
        var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio(),
            name: 'IE8/9'
        };
    };

    /**
     * IE7:
     * the trick: body's offsetWidth was in CSS pixels, while
     * getBoundingClientRect() was in system pixels in IE7.
     * Thanks to http://help.dottoro.com/ljgshbne.php
     */
    var ie7 = function () {
        var rect = document.body.getBoundingClientRect(),
        zoom = (rect.right - rect.left) / document.body.offsetWidth;        
        zoom = Math.round(zoom * 100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio(),
            name: 'IE7'
        };
    };

    /**
     * For IE10 we need to change our technique again...
     * thanks https://github.com/stefanvanburen
     * @return {Object}
     * @private
     */
    var ie10 = function () {
        var zoom = Math.round((document.documentElement.offsetHeight / window.innerHeight) * 100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio(),
            name: 'IE10+'
        };
    };

    /**
     * Mobile WebKit
     * Use CSS media query
     * @return {Object}
     * @private
     */
    var webkitMobile = function () {
        var screenWidth = mediaQuerySearch(linearSearch, 'max-width', 'px', 1, 5000, 1);
        var viewportWidth = window.innerWidth;

        var zoom = Math.round(100 * screenWidth / viewportWidth) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: devicePixelRatio(),
            name: 'Webkit Mobile'
        };
    };

    /**
     * Desktop Webkit
     * While the SVG.currentScale trick turned out to be a total failure when you run on touchscreen-enabled hardware,
     * e.g. a modern Windows 8.1/64+Chrome laptop, as it would only register the zoom level induced by Ctrl+/-/0 while
     * utterly neglecting zoom-by-pinch (touch), it turns out that this little monster actually got it right all the time.
     * @return {Object}
     * @private
     */
    var webkit = function () {
        // Based on answer from @jeum at http://stackoverflow.com/questions/1713771/how-to-detect-page-zoom-level-in-all-modern-browsers/5078596#5078596
        //
        // We are 'clever' enough to counter the 'developer panel' argument against this one by measuring both horizontal and vertical zoom nd
        // picking the very best fit.
        var snap = function (r, snaps, ratios) {
            var i;
            for (i = 0; i < 16; i++) { 
                if (r < snaps[i]) {
                    return ratios[i]; 
                }
            }
        };
        var w = window.outerWidth;
        var l = window.innerWidth;
        var r1 = (w - 16) / l;
        
        var o = window.outerHeight;
        var i = window.innerHeight;
        var r2 = (o - 16) / i;
        // does not matter where the dev panel is: bottom or side. We pick the best ratio anyway.
        var r = Math.min(r1, r2);
        var zoom = snap(r,
                    [ 0.29, 0.42, 0.58, 0.71, 0.83, 0.95, 1.05, 1.18, 1.38, 1.63, 1.88, 2.25, 2.75, 3.5, 4.5, 100 ],
                    [ 0.25, 1/3, 0.5, 2/3, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5 ]
        );
        return {
            zoom: zoom,
            devicePxPerCssPx: devicePixelRatio(),
            name: 'Webkit Desktop'
        };
    };

    /**
     * no real trick; device-pixel-ratio is the ratio of device dpi / css dpi.
     * (Note that this is a different interpretation than Webkit's device
     * pixel ratio, which is the ratio device dpi / system dpi).
     *
     * Also, for Mozilla, there is no difference between the zoom factor and the device ratio.
     *
     * @return {Object}
     * @private
     */
    var firefox4 = function () {
        var zoom = mediaQuerySearch(binarySearch, 'min--moz-device-pixel-ratio', '', 0, 10, 20, 0.0001);
        zoom = Math.round(zoom * 100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom,
            name: 'FireFox 4-17'
        };
    };

    /**
     * Firefox 18.x
     * Mozilla added support for devicePixelRatio to Firefox 18,
     * but it is affected by the zoom level, so, like in older
     * Firefox we can't tell if we are in zoom mode or in a device
     * with a different pixel ratio
     * @return {Object}
     * @private
     */
    var firefox18 = function () {
        return {
            zoom: firefox4().zoom,
            devicePxPerCssPx: devicePixelRatio(),
            name: 'FireFox 18+'
        };
    };

    /**
     * works starting Opera 11.11
     * the trick: outerWidth is the viewport width including scrollbars in
     * system px, while innerWidth is the viewport width including scrollbars
     * in CSS px
     * @return {Object}
     * @private
     */
    var opera11 = function () {
        var zoom = window.top.outerWidth / window.top.innerWidth;
        zoom = Math.round(zoom * 100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio(),
            name: 'Opera 11.11'
        };
    };

    /**
     * Use a search function to match a media query
     * @param searchFunction: The search function to call
     * @param property: The media property to match against
     * @param unit: The CSS unit of the property (e.g. px)
     * @param a: The lower bound of the search
     * @param b: The upper bound of the search
     * @param maxIter: The maximum number of iterations
     * @param epsilon: The max step size
     * @return {Number}
     * @private
     */
    function mediaQuerySearch (searchFunction, property, unit, a, b, maxIter, epsilon) {
        // Set up matchMedia function
        var matchMedia;
        var head, style, div;
        if (window.matchMedia) {
            matchMedia = window.matchMedia;
        } else {
            head = document.getElementsByTagName('head')[0];
            style = document.createElement('style');
            head.appendChild(style);

            div = document.createElement('div');
            div.className = 'mediaQueryBinarySearch';
            div.style.display = 'none';
            document.body.appendChild(div);

            matchMedia = function (query) {
                style.sheet.insertRule('@media ' + query + '{.mediaQueryBinarySearch ' + '{text-decoration: underline} }', 0);
                var matched = getComputedStyle(div, null).textDecoration == 'underline';
                style.sheet.deleteRule(0);
                return {
                    matches: matched
                };
            };
        }

        // Call search function
        var result = searchFunction(property, unit, matchMedia, a, b, maxIter, epsilon);

        // Cleanup if necessary
        if (div) {
            head.removeChild(style);
            document.body.removeChild(div);
        }

        return result;
    }

    /**
     * Binary search to match a media query
     * @param property: Media property to test
     * @param unit: CSS unit for the property (e.g. px)
     * @param matchMedia: The matchMedia function to use
     * @param a: The lower bound of the binary search
     * @param b: The upper bound of the binary search
     * @param maxIter: The maximum number of iterations
     * @return {Number}
     * @private
     */
    function binarySearch (property, unit, matchMedia, a, b, maxIter, epsilon) {
        var mid = (a + b) / 2;
        if (maxIter <= 0 || b - a < epsilon) {
            return mid;
        }
        var query = "(" + property + ":" + mid + unit + ")";
        if (matchMedia(query).matches) {
            return binarySearch(property, unit, matchMedia, mid, b, maxIter - 1, epsilon);
        } else {
            return binarySearch(property, unit, matchMedia, a, mid, maxIter - 1, epsilon);
        }
    }

    /**
     * Linear search to match a media query
     * @param property: Media property to test
     * @param unit: CSS unit for the property (e.g. px)
     * @param matchMedia: The matchMedia function to use
     * @param a: The lower bound of the linear search
     * @param b: The upper bound of the linear search
     * @return {Number}
     * @private
     */
    function linearSearch (property, unit, matchMedia, a, b) {
        for (var i = a; i < b; i++) {
            var query = "(" + property + ":" + i + unit + ")";
            if (matchMedia(query).matches) {
                return i;
            }
        }
    }

    /**
     * Generate detection function
     * @return {Function}
     * @private
     */
    var detectFunction = function () {
        var func = fallback;
        var ua = navigator.userAgent.toLowerCase();

        //IE8+
        if (!isNaN(screen.deviceXDPI) && !isNaN(screen.logicalXDPI)) {
            func = ie8;
        }
        // IE7
        else if (-1 !== ua.indexOf("msie 7.")) {
            func = ie7;
        }
        // IE10+ / Touch
        else if (window.navigator.msMaxTouchPoints) {
            func = ie10;
        }
        // Mobile Webkit
        else if ('orientation' in window && 'webkitRequestAnimationFrame' in window) {
            func = webkitMobile;
        }
        // WebKit
        else if ('webkitRequestAnimationFrame' in window) {
            func = webkit;
        }
        // Opera
        else if (-1 !== ua.indexOf('opera')) {
            func = opera11;
        }
        // Last one is Firefox
        // FF 18.x
        else if (-1 !== ua.indexOf('firefox') && window.devicePixelRatio) {
            func = firefox18;
        }
        // FF 4.0 - 17.x
        else if (firefox4().zoom > 0.001) {
            func = firefox4;
        }

        return func;
    };

    /**
     * Cached detectFunction to prevent double calls
     */
    var cachedDetectFunction;

    /**
     * Script tag for detect-zoom.js can now be included in head
     * or before the closing body tag.
     * @return {Function}
     * @private
     */
    var detect = (function () {
        return document.body ? detectFunction() : function () {
            if (typeof cachedDetectFunction === 'undefined') {
                cachedDetectFunction = detectFunction();
            }
            return cachedDetectFunction();
        }
    }());


    return {
        /**
         * initial state
         * @return {Object}
         */
        initial: detect(),
	
        /**
         * detect
         * @return {Object}
         */
        detect: detect,

        /**
         * Ratios.zoom shorthand
         * @return {Number} Zoom level
         */
        zoom: function () {
            return detect().zoom;
        },

        /**
         * Ratios.devicePxPerCssPx shorthand
         * @return {Number} devicePxPerCssPx level
         */
        device: function () {
            return detect().devicePxPerCssPx;
        },

        zoomText: function () {
            return zoomText();
        }
    };
}));
