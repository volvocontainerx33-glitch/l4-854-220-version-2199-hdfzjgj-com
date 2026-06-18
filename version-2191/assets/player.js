function initMoviePlayer(streamUrl) {
    const video = document.querySelector('[data-player]');
    const cover = document.querySelector('[data-player-cover]');
    const startButtons = document.querySelectorAll('[data-player-start]');
    const message = document.querySelector('[data-player-message]');
    let attached = false;
    let hlsInstance = null;

    if (!video || !cover || !streamUrl) {
        return;
    }

    const showMessage = function () {
        if (message) {
            message.hidden = false;
        }
    };

    const attach = function () {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showMessage();
                }
            });
            return;
        }

        showMessage();
    };

    const start = function () {
        attach();
        cover.classList.add('is-hidden');
        video.controls = true;
        const playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                video.controls = true;
            });
        }
    };

    cover.addEventListener('click', start);

    startButtons.forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            start();
        });
    });

    video.addEventListener('click', function () {
        if (!attached) {
            start();
            return;
        }

        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
