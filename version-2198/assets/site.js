(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-mobile-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("open");
        document.body.classList.toggle("menu-open", mobileMenu.classList.contains("open"));
      });
    }

    document.querySelectorAll(".hero-carousel").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
      var prev = hero.querySelector(".hero-prev");
      var next = hero.querySelector(".hero-next");
      var active = slides.findIndex(function (slide) {
        return slide.classList.contains("active");
      });
      if (active < 0) {
        active = 0;
      }

      function show(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === active);
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(active - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(active + 1);
        });
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }
      show(active);
    });

    document.querySelectorAll("[data-search-area]").forEach(function (area) {
      var input = area.querySelector("[data-search-input]");
      var filterButtons = Array.prototype.slice.call(area.querySelectorAll("[data-filter-value]"));
      var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));
      var empty = area.querySelector(".empty-state");
      var currentFilter = "all";

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var shown = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var type = card.getAttribute("data-type") || "";
          var region = card.getAttribute("data-region") || "";
          var year = card.getAttribute("data-year") || "";
          var passQuery = !query || text.indexOf(query) !== -1;
          var passFilter = currentFilter === "all" || type.indexOf(currentFilter) !== -1 || region.indexOf(currentFilter) !== -1 || year.indexOf(currentFilter) !== -1;
          var visible = passQuery && passFilter;
          card.style.display = visible ? "" : "none";
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.style.display = shown ? "none" : "block";
        }
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }
      filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          filterButtons.forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          currentFilter = button.getAttribute("data-filter-value") || "all";
          applyFilter();
        });
      });
      applyFilter();
    });
  });

  window.initMoviePlayer = function (url) {
    var panel = document.querySelector("[data-player]");
    if (!panel) {
      return;
    }
    var video = panel.querySelector("video");
    var cover = panel.querySelector(".player-cover");
    var loaded = false;
    var hls = null;

    function attach() {
      if (loaded || !video) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
    video.addEventListener("ended", function () {
      if (cover) {
        cover.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
