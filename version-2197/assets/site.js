(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function() {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function(dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
      });
    }
    dots.forEach(function(dot, current) {
      dot.addEventListener("click", function() {
        show(current);
      });
    });
    window.setInterval(function() {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function(scope) {
      var input = scope.querySelector("[data-filter-input]");
      var region = scope.querySelector("[data-filter-region]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var list = document.querySelector("[data-filter-list]");
      var empty = document.querySelector("[data-empty]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
      var params = new URLSearchParams(window.location.search);
      if (input && params.get("q")) {
        input.value = params.get("q");
      }

      function includesValue(text, value) {
        return !value || text.indexOf(value.toLowerCase()) !== -1;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value.trim().toLowerCase() : "";
        var typeValue = type ? type.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function(card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
          var cardType = (card.getAttribute("data-type") || "").toLowerCase();
          var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
          var matched = includesValue(text, keyword) &&
            includesValue(cardRegion, regionValue) &&
            includesValue(cardType, typeValue) &&
            includesValue(cardYear, yearValue);
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, region, type, year].forEach(function(control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  window.createMoviePlayer = function(videoUrl) {
    var root = document.querySelector("[data-player]");
    if (!root) {
      return;
    }
    var video = root.querySelector("video");
    var button = root.querySelector("[data-play-button]");
    var attached = false;
    var hls = null;

    function attach() {
      if (attached || !video) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
    }

    function play() {
      attach();
      root.classList.add("is-playing");
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function() {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    root.addEventListener("click", function(event) {
      if (event.target === video && video.paused) {
        play();
      }
    });
    video.addEventListener("play", function() {
      root.classList.add("is-playing");
    });
    window.addEventListener("beforeunload", function() {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function() {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
