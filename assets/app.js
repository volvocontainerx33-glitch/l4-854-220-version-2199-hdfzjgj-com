(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupMobileMenu() {
        var button = document.querySelector(".mobile-toggle");
        var menu = document.querySelector(".mobile-menu");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupFilters() {
        var panels = document.querySelectorAll(".filter-panel");
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var input = panel.querySelector(".filter-input");
            var chips = panel.querySelectorAll(".filter-chip");
            var activeRegion = "全部";
            var cards = scope.querySelectorAll(".movie-card, .ranking-card");

            function apply() {
                var keyword = normalize(input ? input.value : "");
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var region = card.getAttribute("data-region") || "";
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchRegion = activeRegion === "全部" || region === activeRegion;
                    card.classList.toggle("is-hidden", !(matchKeyword && matchRegion));
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    activeRegion = chip.getAttribute("data-filter-region") || "全部";
                    chips.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    chip.classList.add("is-active");
                    apply();
                });
            });
            if (chips.length) {
                chips[0].classList.add("is-active");
            }
            apply();
        });
    }

    function setupSearchQuery() {
        var input = document.querySelector(".search-page-input");
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
            input.value = q;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    function bindPlayer(box) {
        var video = box.querySelector("video");
        var button = box.querySelector(".player-start");
        var source = box.getAttribute("data-hls");
        if (!video || !source) {
            return;
        }
        var Hls = window.Hls;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            var hls = new Hls({ enableWorker: true, lowLatencyMode: false });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }

        function start() {
            box.classList.add("is-playing");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    box.classList.remove("is-playing");
                });
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("play", function () {
            box.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            box.classList.remove("is-playing");
        });
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    }

    function setupPlayers() {
        document.querySelectorAll(".player-box").forEach(bindPlayer);
    }

    ready(function () {
        setupMobileMenu();
        setupFilters();
        setupSearchQuery();
        setupPlayers();
    });
})();
