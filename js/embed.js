(function() {
    'use strict';

    angular.module('embedApp')
        .directive('embedContent', embedContent);

    embedContent.$inject = ['$q', '$sce', '$http', '$timeout', '$window'];

    function embedContent($q, $sce, $http, $timeout, $window) {

        /**
         * Returns a function, that, as long as it continues to be invoked, will not
         * be triggered. The function will be called after it stops being called for
         * N milliseconds. If `immediate` is passed, trigger the function on the
         * leading edge, instead of the trailing.
         */
        function debounce(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this,
                    args = arguments;

                function later() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                }

                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) {
                    func.apply(context, args);
                }
            };
        }

        /**
         * Find object in array, by given key-value pairs.
         */
        function find(array, by) {
            var i, tmp, key;

            for (i = 0; i < array.length; ++i) {
                tmp = true;
                for (key in by) {
                    if (by[key] !== array[i][key]) {
                        tmp = false;
                        break;
                    }
                }

                if (tmp) {
                    return array[i];
                }
            }
        }

        /**
         * Calculate dimensions for embed.
         */
        function calcDimensions(dimensionsOption, dimensionsDefault) {
            var dimensions = {
                'width': dimensionsOption.width,
                'height': dimensionsOption.height
            };

            if (!dimensions.height && !dimensions.width) {
                dimensions.width = dimensionsDefault.width;
                dimensions.height = dimensionsDefault.height;
            } else if (!dimensions.width) {
                dimensions.width = ((dimensions.height) / dimensionsDefault.height) * dimensionsDefault.width;
            } else if (!dimensions.height) {
                dimensions.height = ((dimensions.width) / dimensionsDefault.width) * dimensionsDefault.height;
            }

            return dimensions;
        }

        var VIDEO_EMBED_PROCESS = {
            basic: function(url, source) {
                return $q(function(resolve, reject) {
                    resolve({
                        url: url,
                        srcUrl: $sce.trustAsResourceUrl(url),
                        dimensions: calcDimensions(source.options.dimensions, DEFAULT_DIMENSIONS.video)
                    });
                });
            },

            youtube: function(url, source) {
                if (!source.options.gdevAuth) {
                    throw new Error('Youtube authentication key is required to get data from youtube.');
                }

                var id = source.regex.exec(url)[1];

                return $http.get(
                    'https://www.googleapis.com/youtube/v3/videos?id=' + id +
                    '&key=' + source.options.gdevAuth +
                    '&part=snippet,statistics').then(
                    function(response) {
                        var ytData = response.data.items[0];

                        return {
                            url: $sce.trustAsResourceUrl(url),
                            srcUrl: $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + id +
                                '?autoplay=0'),
                            dimensions: calcDimensions(source.options.dimensions, DEFAULT_DIMENSIONS.video),
                            channelUrl: $sce.trustAsResourceUrl('https://www.youtube.com/channel/' +
                                ytData.snippet.channelId),

                            snippet: ytData.snippet,
                            statistics: ytData.statistics
                        };
                    }
                );
            },

            twitchtv: function(url, source) {
                return $q(function(resolve, reject) {
                    resolve({
                        url: url,
                        srcUrl: $sce.trustAsResourceUrl(
                            'http://player.twitch.tv/?channel=' + url.split('/')[1] +
                            '&autoplay=false'),
                        dimensions: calcDimensions(source.options.dimensions, DEFAULT_DIMENSIONS.video)
                    });
                });
            },

            dailymotion: function(url, source) {
                return $q(function(resolve, reject) {
                    resolve({
                        url: url,
                        srcUrl: $sce.trustAsResourceUrl(
                            'http://www.dailymotion.com/embed/video/' + url.split('/')[2] +
                            '&autoplay=0'),
                        dimensions: calcDimensions(source.options.dimensions, DEFAULT_DIMENSIONS.video)
                    });
                });
            },

            ted: function(url, source) {
                return $q(function(resolve, reject) {
                    resolve({
                        url: url,
                        srcUrl: $sce.trustAsResourceUrl(
                            'https://embed.ted.com/talks/' + url.split('/')[2] + '.html'),
                        dimensions: calcDimensions(source.options.dimensions, DEFAULT_DIMENSIONS.video)
                    });
                });
            },

            dotsub: function(url, source) {
                return $q(function(resolve, reject) {
                    resolve({
                        url: url,
                        srcUrl: $sce.trustAsResourceUrl(
                            'https://dotsub.com/media/' + url.split('/')[2] + '/embed/'),
                        dimensions: calcDimensions(source.options.dimensions, DEFAULT_DIMENSIONS.video)
                    });
                });
            },

            liveleak: function(url, source) {
                return $q(function(resolve, reject) {
                    resolve({
                        url: url,
                        srcUrl: $sce.trustAsResourceUrl(
                            'http://www.liveleak.com/e/' + url.split('=')[1]),
                        dimensions: calcDimensions(source.options.dimensions, DEFAULT_DIMENSIONS.video)
                    });
                });
            }
        };

        var AUDIO_EMBED_PROCESS = {
            basic: function(url, source) {
                return $q(function(resolve, reject) {
                    resolve({
                        url: url,
                        srcUrl: $sce.trustAsResourceUrl(url),
                        dimensions: calcDimensions(source.options.dimensions, DEFAULT_DIMENSIONS.audio)
                    });
                });
            },

            soundcloud: function(url, source) {
                return $q(function(resolve, reject) {
                    resolve({
                        url: url,
                        srcUrl: $sce.trustAsResourceUrl(
                            'https://w.soundcloud.com/player/?url=https://' + url +
                            '&auto_play=' + source.options.autoPlay +
                            '&buying=' + source.options.buying +
                            '&liking=' + source.options.liking +
                            '&download=' + source.options.download +
                            '&sharing=' + source.options.sharing +
                            '&show_artwork=' + source.options.showArtwork +
                            '&show_comments=' + source.options.showComments +
                            '&show_playcount=' + source.options.showPlaycount +
                            '&show_user=' + source.options.show_user +
                            '&start_track=' + source.options.start_track),
                        dimensions: calcDimensions(source.options.dimensions, DEFAULT_DIMENSIONS.audio)
                    });
                });
            }
        };

        var IMAGE_EMBED_PROCESS = {
            basic: function(url, source) {
                return $q(function(resolve, reject) {
                    resolve({
                        url: url,
                        srcUrl: $sce.trustAsResourceUrl(url),
                        dimensions: calcDimensions(source.options.dimensions, DEFAULT_DIMENSIONS.image)
                    });
                });
            }
        };

        var PDF_EMBED_PROCESS = {
            basic: function(url, source) {
                return $q(function(resolve, reject) {
                    resolve({
                        url: url,
                        srcUrl: $sce.trustAsResourceUrl(url),
                        dimensions: calcDimensions(source.options.dimensions, DEFAULT_DIMENSIONS.pdf)
                    });
                });
            }
        };

        var CODE_EMBED_PROCESS = {
            codepen: function(url, source) {
                return $q(function(resolve, reject) {
                    resolve({
                        url: url,
                        srcUrl: $sce.trustAsResourceUrl(url.replace(/\/pen\//, '/embed/')),
                        dimensions: calcDimensions(source.options.dimensions, DEFAULT_DIMENSIONS.code)
                    });
                });
            },

            jsfiddle: function(url, source) {
                return $q(function(resolve, reject) {
                    resolve({
                        url: url,
                        srcUrl: $sce.trustAsResourceUrl('http://' + url + '/embedded'),
                        dimensions: calcDimensions(source.options.dimensions, DEFAULT_DIMENSIONS.code)
                    });
                });
            },

            jsbin: function(url, source) {
                return $q(function(resolve, reject) {
                    resolve({
                        url: url,
                        srcUrl: $sce.trustAsResourceUrl('http://' + url + '/embed?html,js,output'),
                        dimensions: calcDimensions(source.options.dimensions, DEFAULT_DIMENSIONS.code)
                    });
                });
            },

            plunker: function(url, source) {
                return $q(function(resolve, reject) {
                    resolve({
                        url: url,
                        srcUrl: $sce.trustAsResourceUrl('http://embed.plnkr.co/' +
                            (url.indexOf('?') === -1 ?
                                url.split('/')[2] : url.split('/')[2].split('?')[0])),
                        dimensions: calcDimensions(source.options.dimensions, DEFAULT_DIMENSIONS.code)
                    });
                });
            },

            ideone: function(url, source) {
                return $q(function(resolve, reject) {
                    resolve({
                        url: url,
                        srcUrl: $sce.trustAsResourceUrl('http://ideone.com/embed/' + url.split('/')[1]),
                        dimensions: calcDimensions(source.options.dimensions, DEFAULT_DIMENSIONS.code)
                    });
                });
            }
        };

        var SOURCES = {
            basicVideo: {
                regex: /((?:https?):\/\/\S*\.(?:ogv|webm|mp4))/i,
                templateUrl: 'html/embed-video-basic.html',
                templateScopeCallback: VIDEO_EMBED_PROCESS.basic,
                options: {
                    dimensions: {
                        height: null,
                        width: 792
                    }
                }
            },
            youtube: {
                regex: /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/ytscreeningroom\?v=|\/feeds\/api\/videos\/|\/user\S*[^\w\-\s]|\S*[^\w\-\s]))([\w\-]{11})[?=&+%\w-]*/i,
                templateUrl: 'html/embed-video-youtube.html',
                templateScopeCallback: VIDEO_EMBED_PROCESS.youtube,
                options: {
                    gdevAuth: 'AIzaSyDp_FMaFxq1PKB357CXHPLE8OKc7yphoWk',
                    dimensions: {
                        height: null,
                        width: 772
                    }
                },
            },
            twitchtv: {
                regex: /www.twitch.tv\/[a-zA_Z0-9_]+/i,
                templateUrl: 'html/embed-video-iframe.html',
                templateScopeCallback: VIDEO_EMBED_PROCESS.twitchtv,
                options: {
                    dimensions: {
                        height: null,
                        width: 792
                    }
                }
            },
            dailymotion: {
                regex: /dailymotion.com\/video\/[a-zA-Z0-9-_]+/i,
                templateUrl: 'html/embed-video-iframe.html',
                templateScopeCallback: VIDEO_EMBED_PROCESS.dailymotion,
                options: {
                    dimensions: {
                        height: null,
                        width: 792
                    }
                }
            },
            ted: {
                regex: /ted.com\/talks\/[a-zA-Z0-9_]+/i,
                templateUrl: 'html/embed-video-iframe.html',
                templateScopeCallback: VIDEO_EMBED_PROCESS.ted,
                options: {
                    dimensions: {
                        height: null,
                        width: 792
                    }
                }
            },
            dotsub: {
                regex: /dotsub.com\/view\/[a-zA-Z0-9-]+/i,
                templateUrl: 'html/embed-video-iframe.html',
                templateScopeCallback: VIDEO_EMBED_PROCESS.dotsub,
                options: {
                    dimensions: {
                        height: null,
                        width: 792
                    }
                }
            },
            liveleak: {
                regex: /liveleak.com\/view\?i=[a-zA-Z0-9_]+/i,
                templateUrl: 'html/embed-video-iframe.html',
                templateScopeCallback: VIDEO_EMBED_PROCESS.liveleak,
                options: {
                    dimensions: {
                        height: null,
                        width: 792
                    }
                }
            },

            basicAudio: {
                regex: /((?:https?):\/\/\S*\.(?:wav|mp3|ogg))/i,
                templateUrl: 'html/embed-audio-basic.html',
                templateScopeCallback: AUDIO_EMBED_PROCESS.basic,
                options: {
                    dimensions: {
                        height: 30,
                        width: 792
                    }
                }
            },
            soundcloud: {
                regex: /soundcloud.com\/[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+/i,
                templateUrl: 'html/embed-audio-iframe.html',
                templateScopeCallback: AUDIO_EMBED_PROCESS.soundcloud,
                options: {
                    autoPlay: false,
                    /* Whether to start playing the widget after it’s loaded */
                    buying: true,
                    /* Show/hide buy buttons */
                    liking: true,
                    /* Show/hide like buttons */
                    download: true,
                    /* Show/hide download buttons */
                    sharing: true,
                    /* Show/hide share buttons/dialogues */
                    showArtwork: true,
                    /* Show/hide artwork */
                    showComments: true,
                    /* Show/hide comments */
                    showPlaycount: true,
                    /* Show/hide number of sound plays */
                    showUser: true,
                    /* Show/hide the uploader name */
                    startTrack: 0,
                    /* Preselects a track in the playlist, given a number between 0 and the length of the playlist. */
                    dimensions: {
                        height: 150,
                        width: 792
                    }
                }
            },

            image: {
                regex: /((?:https?):\/\/\S*\.(?:gif|jpg|jpeg|tiff|png|svg|webp))/i,
                templateUrl: 'html/embed-image.html',
                templateScopeCallback: IMAGE_EMBED_PROCESS.basic,
                options: {
                    dimensions: {
                        height: null,
                        width: 792
                    }
                }
            },

            pdf: {
                regex: /((?:https?):\/\/\S*\.(?:pdf|PDF))/i,
                templateUrl: 'html/embed-pdf.html',
                templateScopeCallback: PDF_EMBED_PROCESS.basic,
                options: {
                    dimensions: {
                        height: null,
                        width: 792
                    }
                }
            },

            codepen: {
                regex: /https:\/\/codepen.io\/([A-Za-z0-9_]+)\/pen\/([A-Za-z0-9_]+)/i,
                templateUrl: 'html/embed-code-iframe.html',
                templateScopeCallback: CODE_EMBED_PROCESS.codepen,
                options: {
                    dimensions: {
                        height: null,
                        width: 792
                    }
                }
            },
            jsfiddle: {
                regex: /jsfiddle.net\/[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+/i,
                templateUrl: 'html/embed-code-iframe.html',
                templateScopeCallback: CODE_EMBED_PROCESS.jsfiddle,
                options: {
                    dimensions: {
                        height: null,
                        width: 792
                    }
                }
            },
            jsbin: {
                regex: /jsbin.com\/[a-zA-Z0-9_]+\/[0-9_]+/i,
                templateUrl: 'html/embed-code-iframe.html',
                templateScopeCallback: CODE_EMBED_PROCESS.jsbin,
                options: {
                    dimensions: {
                        height: null,
                        width: 792
                    }
                }
            },
            plunker: {
                regex: /plnkr.co\/edit\/[a-zA-Z0-9\?=]+/i,
                templateUrl: 'html/embed-code-iframe.html',
                templateScopeCallback: CODE_EMBED_PROCESS.plunker,
                options: {
                    dimensions: {
                        height: null,
                        width: 792
                    }
                }
            },
            ideone: {
                regex: /ideone.com\/[a-zA-Z0-9]{6}/i,
                templateUrl: 'html/embed-code-iframe.html',
                templateScopeCallback: CODE_EMBED_PROCESS.ideone,
                options: {
                    dimensions: {
                        height: null,
                        width: 792
                    }
                }
            }
        };

        var EXTRA_OPTIONS = {
            limitPreviews: 0,
            debounce: 1000,
            animateLimiting: 1000
        };

        var DEFAULT_DIMENSIONS = {
            video: {
                height: 390,
                width: 640
            },

            audio: {
                height: null,
                width: 640
            },

            image: {
                height: null,
                width: null
            },

            pdf: {
                height: 390,
                width: 640
            },

            code: {
                height: 390,
                width: 640
            }
        };

        function getEmbeds(embeds, content) {
            var key, tmp1, tmp2;
            var presentStrings = (content || '').split(/\s+/);
            var presentEmbeds = [];

            /* get present urls  */
            angular.forEach(presentStrings, function(item) {
                for (key in SOURCES) {
                    if (SOURCES[key].regex.test(item)) {
                        tmp1 = SOURCES[key].regex.exec(item)[0];

                        /* make present embed urls unique */
                        tmp2 = find(presentEmbeds, { 'url': tmp1 });

                        if (tmp2 !== undefined) {
                            continue;
                        }

                        presentEmbeds.push({
                            templateScope: undefined,
                            url: tmp1,
                            source: SOURCES[key],
                        });
                    }
                }
            });

            /* update embed urls */
            angular.forEach(presentEmbeds, function(item) {
                tmp1 = find(embeds, { 'url': item.url });

                if (tmp1) {
                    /* embed url already exists - just copy pointer */
                    item.templateScope = tmp1.templateScope;
                } else {
                    /* new embed url - generate embed data */
                    item.source.templateScopeCallback(
                        item.url, item.source).then(
                        function(response) {
                            item.templateScope = response;
                        }
                    );
                }
            });

            return presentEmbeds;
        }

        return {
            restrict: 'E',
            replace: true,
            scope: {
                content: '=',
                limitPreviews: '=?',
                debounce: '=?',
                animateLimiting: '=?'
            },
            templateUrl: 'html/embed.html',
            link: function(scope, element, attributes) {
                scope.limitPreviews = scope.limitPreviews || EXTRA_OPTIONS.limitPreviews;
                scope.debounce = scope.debounce || EXTRA_OPTIONS.debounce;
                scope.animateLimiting = scope.animateLimiting || EXTRA_OPTIONS.animateLimiting;

                scope.embeds = [];

                scope._isLimited = true;
                scope.isCanLimit = isCanLimit;
                scope.getLimit = getLimit;
                scope.isLimited = isLimited;
                scope.clickLimit = clickLimit;

                function isCanLimit() {
                    return scope.limitPreviews > 0 && scope.embeds.length - scope.limitPreviews > 0;
                }

                function getLimit() {
                    if (scope.isCanLimit() && scope._isLimited) {
                        return scope.limitPreviews;
                    } else {
                        return scope.embeds.length;
                    }
                }

                function isLimited() {
                    return scope._isLimited;
                }

                function clickLimit() {
                    scope._isLimited = !scope._isLimited;
                }

                scope.$watch('content', debounce(function(newV, oldV) {
                    scope.$apply(function() {
                        scope.embeds = getEmbeds(scope.embeds, newV);
                    });
                }, scope.debounce));
            }
        };
    }
})();
