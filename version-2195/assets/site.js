(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initializeMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initializeHero() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', carousel);
    var dots = selectAll('[data-hero-dot]', carousel);
    var previous = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initializeHeaderSearch() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    var keywordInput = document.querySelector('[data-filter-keyword]');

    if (query && keywordInput) {
      keywordInput.value = query;
    }
  }

  function initializeSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var list = document.querySelector('[data-search-list]');

    if (!form || !list) {
      return;
    }

    var cards = selectAll('.movie-card', list);
    var keyword = form.querySelector('[data-filter-keyword]');
    var region = form.querySelector('[data-filter-region]');
    var type = form.querySelector('[data-filter-type]');
    var year = form.querySelector('[data-filter-year]');
    var category = form.querySelector('[data-filter-category]');
    var meta = document.querySelector('[data-result-meta]');

    function applyFilters() {
      var keywordValue = normalize(keyword && keyword.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var categoryValue = normalize(category && category.value);
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute('data-search'));
        var matches = true;

        if (keywordValue && searchText.indexOf(keywordValue) === -1) {
          matches = false;
        }

        if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) {
          matches = false;
        }

        if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) {
          matches = false;
        }

        if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
          matches = false;
        }

        if (categoryValue && normalize(card.getAttribute('data-category')) !== categoryValue) {
          matches = false;
        }

        card.classList.toggle('is-hidden', !matches);
        if (matches) {
          visible += 1;
        }
      });

      if (meta) {
        meta.textContent = '当前显示 ' + visible + ' 条结果';
      }
    }

    form.addEventListener('input', applyFilters);
    form.addEventListener('change', applyFilters);
    form.addEventListener('reset', function () {
      window.setTimeout(applyFilters, 0);
    });

    applyFilters();
  }

  function initializeLocalFilters() {
    selectAll('[data-local-filter]').forEach(function (form) {
      var input = form.querySelector('[data-local-filter-input]');
      var list = document.querySelector('[data-filter-list]');

      if (!input || !list) {
        return;
      }

      var items = selectAll('.movie-card, .rank-row', list);

      function applyLocalFilter() {
        var value = normalize(input.value);

        items.forEach(function (item) {
          var searchText = normalize(item.getAttribute('data-search') || item.textContent);
          item.classList.toggle('is-hidden', value && searchText.indexOf(value) === -1);
        });
      }

      input.addEventListener('input', applyLocalFilter);
      applyLocalFilter();
    });
  }

  function initializePlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-toggle]');
      var status = player.querySelector('[data-player-status]');

      if (!video) {
        return;
      }

      var source = video.getAttribute('data-src');

      function setStatus(message, hidden) {
        if (!status) {
          return;
        }

        status.textContent = message || '';
        status.classList.toggle('is-hidden', Boolean(hidden));
      }

      function attachSource() {
        if (!source) {
          setStatus('未找到播放源');
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源已就绪，点击画面开始播放', false);
          });
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus('网络加载异常，正在重试');
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus('媒体解码异常，正在恢复');
              hls.recoverMediaError();
            } else {
              setStatus('播放源加载失败');
              hls.destroy();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setStatus('播放源已就绪，点击画面开始播放', false);
          });
        } else {
          video.src = source;
          setStatus('已绑定播放源，浏览器将尝试直接播放', false);
        }
      }

      function updateState() {
        player.classList.toggle('is-playing', !video.paused);

        if (!video.paused) {
          setStatus('', true);
        } else if (video.readyState > 0) {
          setStatus('点击画面继续播放', false);
        }
      }

      function togglePlay() {
        if (video.paused) {
          var playAttempt = video.play();

          if (playAttempt && typeof playAttempt.catch === 'function') {
            playAttempt.catch(function () {
              setStatus('浏览器阻止自动播放，请再次点击播放按钮');
            });
          }
        } else {
          video.pause();
        }
      }

      if (button) {
        button.addEventListener('click', togglePlay);
      }

      video.addEventListener('click', togglePlay);
      video.addEventListener('play', updateState);
      video.addEventListener('pause', updateState);
      video.addEventListener('waiting', function () {
        setStatus('正在缓冲');
      });
      video.addEventListener('canplay', function () {
        if (video.paused) {
          setStatus('播放源已就绪，点击画面开始播放', false);
        }
      });

      attachSource();
      updateState();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initializeMenu();
    initializeHero();
    initializeHeaderSearch();
    initializeSearchPage();
    initializeLocalFilters();
    initializePlayers();
  });
})();
