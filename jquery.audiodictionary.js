(function ($) {
    var categories = {
        opening: {
            hu: 'Könyvtárnyitás',
            en: 'Library Opening'
        },
        entry: {
            hu: 'Belépés',
            en: 'Entry'
        }
    };


    var defaultUI = {
        controllerSelector: 'a',
        createPlayController: function () {
            return $('<span>')
                .addClass('glyphicon')
                .addClass('glyphicon-play')
        },
        setAsStopped: function ($playController) {
            $playController.removeClass('glyphicon-stop').addClass('glyphicon-play');
        },
        setAsPlaying: function ($playController) {
            $playController.removeClass('glyphicon-play').addClass('glyphicon-stop')
        },
        create: function ($target, audios) {
            var categorized = {};

            $.each(audios, function (audioKey, audio){
                $.each(audio.categories, function (categoryKey, category) {
                    if (categorized[category] === undefined) {
                        categorized[category] = [];
                    }
                    categorized[category].push(audio);
                });
            });

            $.each(categorized, function (categoryKey, category) {
                var $panel = $('<div class="panel panel-default">');
                var $panelHeading = $('<div class="panel-heading">');
                var $table = $('<table class="table table-striped">');
                var $tBody = $('<tbody>');

                $panelHeading.text(categories[categoryKey].en + ' | ' + categories[categoryKey].hu);
                $table.append($tBody);
                $panel.append($panelHeading).append($table);

                $.each(category, function (audioKey, audio) {
                    var $tr = $('<tr>');

                    var $enLink = $('<a href="javascript:" data-audio="' + audio.sources.en.file + '">');
                    if (audio.sources.en.formats) {
                        $enLink.attr('data-audio-formats', audio.sources.en.formats instanceof Array ? audio.sources.en.formats.join(',') : audio.sources.en.formats);
                    }
                    var $enTd = $('<td>')
                        .append($enLink)
                        .append($('<span>').text(' ' + audio.sources.en.text));

                    var $huLink = $('<a href="javascript:" data-audio="' + audio.sources.hu.file + '">');
                    if (audio.sources.hu.formats) {
                        $enLink.attr('data-audio-formats', audio.sources.hu.formats instanceof Array ? audio.sources.hu.formats.join(',') : audio.sources.hu.formats);
                    }
                    var $huTd = $('<td>')
                        .append($huLink)
                        .append($('<span>').text(' ' + audio.sources.hu.text));

                    $tr.append($enTd).append($huTd);
                    $tBody.append($tr);
                });
                $target.append($panel);

            });
        }
    };

    $.fn.audiodictionary = function (options, parameter) {
        var $target = this;

        var PLAY_CONTROLLER_CLASS = 'audiodictionary-controller-play';

        var play = function (audio) {
            setAsPlaying(audio);
            audio.play();
        };

        var stop = function (audio) {
            audio.load();
            setAsStopped(audio);
        };

        var getController = function (audio) {
            return $target.find(settings.ui.controllerSelector + '[data-audio-id="' + $(audio).attr('data-audio-id') + '"]');
        };

        var createPlayController = function () {
            return settings.ui.createPlayController().addClass(PLAY_CONTROLLER_CLASS);
        };

        var statusInit = function (audio) {
            var $controller = getController(audio);
            if ($controller.find('.' + PLAY_CONTROLLER_CLASS).length === 0) {
                $controller.append(createPlayController());
            }
        };

        var setAsStopped = function (audio) {
            statusInit(audio);
            settings.ui.setAsStopped(getController(audio).find('.' + PLAY_CONTROLLER_CLASS));
        };

        var setAsPlaying = function (audio) {
            statusInit(audio);
            settings.ui.setAsPlaying(getController(audio).find('.' + PLAY_CONTROLLER_CLASS));
        };

        var create = function () {
            var $controllers = $target.find(settings.ui.controllerSelector + '[data-audio]');

            $controllers.each(function (i, controller) {
                var $controller = $(controller);
                var dFormats = $controller.attr('data-audio-formats') || 'ogg,mp3';
                var dAudio = $controller.attr('data-audio');
                var formats = dFormats.split(',');
                var $audio = $('<audio>');
                $audio.on('ended', function () {
                    setAsStopped($audio);
                });
                $audio.on('play', function () {
                    setAsPlaying($audio);
                });
                $audio.attr('data-audio', dAudio);
                $controller.attr('data-audio-id', 'audio-' + i);
                $audio.attr('data-audio-id', 'audio-' + i);
                setAsStopped($audio)

                $.each(formats, function (index, format) {
                    var $source = $('<source>');
                    var sourceSrc = dAudio + '.' + format;
                    var sourceType = settings.formats[format];
                    $source.attr({src: sourceSrc, type: sourceType});
                    $audio.append($source);
                });

                $target.append($audio);
                $controller.on('click', function (event) {
                    event.preventDefault();
                    var audio = $audio[0];
                    if (audio.ended || audio.paused) {
                        play(audio);
                    } else {
                        stop(audio);
                    }
                });
            });

        };


        if (options === undefined || typeof options.valueOf() !== 'string') {
            var settings = {
                formats: {
                    ogg: 'audio/ogg',
                    mp3: 'audio/mpeg',
                    wav: 'audio/wav'
                },
                ui: defaultUI,
                autocreate: true,
                audios: null
            };
            settings = $.extend(settings, options);
            if (typeof settings.audios === "function") {
                var audios = settings.audios($target, settings.ui);
                if (settings.autocreate) {
                    settings.ui.create($target, audios);
                }
            } else if (typeof settings.audios === 'object' && settings.audios !== null) {
                settings.ui.create($target, settings.audios);
            }
            $target.data('audio-settings', settings);
            create();
        } else {
            var settings = $target.data('audio-settings');
            switch (options) {
                case 'create':
                    $target.data('audio-settings').ui.create($target, parameter);
                    create();
                    break;
                default:
                    throw new Error('Unknown operation: ' + JSON.stringify(options));
                    break;
            }
        }
    };
})(jQuery);