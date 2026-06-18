(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initNav() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });
        start();
    }

    function initFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        if (!cards.length) {
            return;
        }
        var input = document.querySelector("[data-filter-input]");
        var region = document.querySelector("[data-filter-region]");
        var year = document.querySelector("[data-filter-year]");
        var empty = document.querySelector("[data-empty-state]");
        if (!input && !region && !year) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q && input) {
            input.value = q;
        }
        function apply() {
            var keyword = normalize(input ? input.value : "");
            var regionValue = normalize(region ? region.value : "");
            var yearValue = normalize(year ? year.value : "");
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(" "));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchRegion = !regionValue || normalize(card.dataset.region) === regionValue;
                var matchYear = !yearValue || normalize(card.dataset.year) === yearValue;
                var show = matchKeyword && matchRegion && matchYear;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        [input, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function initPlayer() {
        var shell = document.querySelector("[data-player-shell]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var button = shell.querySelector("[data-player-button]");
        if (!video || !button) {
            return;
        }
        var stream = video.getAttribute("data-stream");
        var attached = false;
        var hls = null;
        function attach() {
            if (attached || !stream) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
            attached = true;
        }
        function play() {
            attach();
            button.hidden = true;
            var attempt = video.play();
            if (attempt && attempt.catch) {
                attempt.catch(function () {
                    button.hidden = false;
                });
            }
        }
        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!attached) {
                play();
            }
        });
        video.addEventListener("play", function () {
            button.hidden = true;
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                button.hidden = false;
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initNav();
        initHero();
        initFilters();
        initPlayer();
    });
}());
