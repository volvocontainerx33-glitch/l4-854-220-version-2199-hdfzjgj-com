(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");
    var search = document.querySelector(".header-search");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      if (search) {
        search.classList.toggle("is-open", open);
      }
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupGlobalSearch() {
    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var url = "./search.html";
        if (query) {
          url += "?q=" + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });
  }

  function setupHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        stop();
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    document.querySelectorAll("[data-movie-filter]").forEach(function (form) {
      var listId = form.getAttribute("data-movie-filter");
      var list = document.getElementById(listId);
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      var queryParams = new URLSearchParams(window.location.search);
      var queryInput = form.querySelector("input[name='q']");
      if (queryInput && queryParams.get("q")) {
        queryInput.value = queryParams.get("q");
      }

      function apply() {
        var query = normalize(queryInput ? queryInput.value : "");
        var region = normalize((form.querySelector("select[name='region']") || {}).value);
        var type = normalize((form.querySelector("select[name='type']") || {}).value);
        var year = normalize((form.querySelector("input[name='year']") || {}).value);

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
          ].join(" "));
          var match = true;
          if (query && haystack.indexOf(query) === -1) {
            match = false;
          }
          if (region && normalize(card.getAttribute("data-region")) !== region) {
            match = false;
          }
          if (type && normalize(card.getAttribute("data-type")) !== type) {
            match = false;
          }
          if (year && normalize(card.getAttribute("data-year")) !== year) {
            match = false;
          }
          card.classList.toggle("is-hidden", !match);
        });
      }

      form.addEventListener("input", apply);
      form.addEventListener("change", apply);
      form.addEventListener("reset", function () {
        window.setTimeout(apply, 0);
      });
      apply();
    });
  }

  function bindPlayer(videoId, overlayId, streamUrl) {
    ready(function () {
      var video = document.getElementById(videoId);
      var overlay = document.getElementById(overlayId);
      if (!video || !overlay || !streamUrl) {
        return;
      }
      var loaded = false;
      var hlsInstance = null;

      function attach() {
        if (loaded) {
          return;
        }
        loaded = true;
        video.controls = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          return;
        }
        video.src = streamUrl;
      }

      function play() {
        attach();
        overlay.classList.add("is-hidden");
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }

      overlay.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          play();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  window.StaticMovieSite = {
    bindPlayer: bindPlayer
  };

  ready(function () {
    setupMenu();
    setupGlobalSearch();
    setupHero();
    setupFilters();
  });
})();
