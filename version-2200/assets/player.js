(function () {
    function setupStaticPlayer(videoId, triggerId, posterId, source) {
        var video = document.getElementById(videoId);
        var trigger = document.getElementById(triggerId);
        var poster = document.getElementById(posterId);
        var attached = false;
        var hlsInstance = null;

        if (!video || !trigger || !poster || !source) {
            return;
        }

        function attachSource() {
            if (attached) {
                return Promise.resolve();
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                });
            }

            video.src = source;
            return Promise.resolve();
        }

        function startPlayback() {
            attachSource().then(function () {
                poster.classList.add("is-hidden");
                video.setAttribute("controls", "controls");
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        poster.classList.remove("is-hidden");
                    });
                }
            });
        }

        trigger.addEventListener("click", startPlayback);
        poster.addEventListener("click", startPlayback);
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.setupStaticPlayer = setupStaticPlayer;
})();
