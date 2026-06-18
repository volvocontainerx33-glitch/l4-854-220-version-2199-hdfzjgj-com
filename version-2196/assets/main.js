(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
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

    if (prev) {
      prev.addEventListener('click', function () {
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupSearchForms() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        var url = new URL(form.getAttribute('action') || 'search.html', window.location.href);
        url.searchParams.set('q', input.value.trim());
        window.location.href = url.toString();
      });
    });
  }

  function setupPageFilter() {
    var scope = document.querySelector('[data-filter-scope]');
    var results = document.querySelector('[data-filter-results]');
    if (!scope || !results) {
      return;
    }

    var keywordInput = scope.querySelector('[data-filter-input]');
    var typeInput = scope.querySelector('[data-filter-type]');
    var yearInput = scope.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(results.querySelectorAll('.js-filter-card'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var type = normalize(typeInput && typeInput.value);
      var year = normalize(yearInput && yearInput.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));
        var typeValue = normalize(card.getAttribute('data-type'));
        var yearValue = normalize(card.getAttribute('data-year'));
        var visible = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          visible = false;
        }
        if (type && typeValue.indexOf(type) === -1) {
          visible = false;
        }
        if (year && yearValue.indexOf(year) === -1) {
          visible = false;
        }

        card.hidden = !visible;
      });
    }

    [keywordInput, typeInput, yearInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', applyFilter);
        input.addEventListener('change', applyFilter);
      }
    });
  }

  function setupImageFallbacks() {
    document.querySelectorAll('[data-fallback-image]').forEach(function (image) {
      image.addEventListener('error', function () {
        var frame = image.closest('.cover-frame');
        if (frame) {
          frame.classList.add('image-fallback');
        }
      }, { once: true });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupSearchForms();
    setupPageFilter();
    setupImageFallbacks();
  });
})();
