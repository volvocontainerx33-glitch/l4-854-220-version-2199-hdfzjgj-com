(function () {
  'use strict';

  var allMovies = window.MOVIE_INDEX || [];
  var form = document.querySelector('[data-advanced-search]');
  var results = document.querySelector('[data-search-results]');
  var summary = document.querySelector('[data-search-summary]');
  var loadMore = document.querySelector('[data-load-more]');
  var visibleCount = 48;
  var currentMatches = allMovies.slice(0, 48);

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function matches(movie, filters) {
    var text = normalize([
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      (movie.genres || []).join(' '),
      (movie.tags || []).join(' '),
      movie.oneLine
    ].join(' '));

    if (filters.q && text.indexOf(filters.q) === -1) {
      return false;
    }
    if (filters.region && normalize(movie.region).indexOf(filters.region) === -1) {
      return false;
    }
    if (filters.type && normalize(movie.type).indexOf(filters.type) === -1) {
      return false;
    }
    if (filters.year && normalize(movie.year).indexOf(filters.year) === -1) {
      return false;
    }
    return true;
  }

  function card(movie) {
    var tags = escapeHtml((movie.genres || []).slice(0, 3).join(' ') || movie.genre);
    return [
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
      '  <figure class="cover-frame" data-title="' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-fallback-image>',
      '    <span class="play-chip" aria-hidden="true">▶</span>',
      '  </figure>',
      '  <div class="card-body">',
      '    <p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.type) + '</p>',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p class="card-summary">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="card-tags"><span>' + tags + '</span></div>',
      '  </div>',
      '</a>'
    ].join('\n');
  }

  function render() {
    if (!results) {
      return;
    }
    results.innerHTML = currentMatches.slice(0, visibleCount).map(card).join('\n');
    if (loadMore) {
      loadMore.hidden = visibleCount >= currentMatches.length;
    }
    document.querySelectorAll('[data-fallback-image]').forEach(function (image) {
      image.addEventListener('error', function () {
        var frame = image.closest('.cover-frame');
        if (frame) {
          frame.classList.add('image-fallback');
        }
      }, { once: true });
    });
  }

  function getFiltersFromForm() {
    var data = new FormData(form);
    return {
      q: normalize(data.get('q')),
      region: normalize(data.get('region')),
      type: normalize(data.get('type')),
      year: normalize(data.get('year'))
    };
  }

  function applyFilters(pushState) {
    var filters = getFiltersFromForm();
    currentMatches = allMovies
      .filter(function (movie) { return matches(movie, filters); })
      .sort(function (a, b) { return b.heat - a.heat; });
    visibleCount = 48;

    if (summary) {
      var words = [filters.q, filters.region, filters.type, filters.year].filter(Boolean).join(' / ');
      summary.textContent = '找到 ' + currentMatches.length + ' 部内容' + (words ? '：' + words : '。');
    }

    if (pushState) {
      var params = new URLSearchParams();
      Object.keys(filters).forEach(function (key) {
        if (filters[key]) {
          params.set(key, filters[key]);
        }
      });
      var query = params.toString();
      window.history.replaceState(null, '', query ? ('?' + query) : window.location.pathname);
    }

    render();
  }

  function fillFromUrl() {
    if (!form) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    ['q', 'region', 'type', 'year'].forEach(function (key) {
      var field = form.elements[key];
      if (field && params.has(key)) {
        field.value = params.get(key);
      }
    });
  }

  if (form && results) {
    fillFromUrl();
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilters(true);
    });
    form.addEventListener('input', function () {
      applyFilters(true);
    });
    if (loadMore) {
      loadMore.addEventListener('click', function () {
        visibleCount += 48;
        render();
      });
    }
    applyFilters(false);
  }
})();
