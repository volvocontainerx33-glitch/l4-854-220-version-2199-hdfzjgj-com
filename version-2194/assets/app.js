document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.getElementById('menuButton');
  var mainNav = document.getElementById('mainNav');
  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });
  if (slides.length > 1) {
    showSlide(0);
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-movie-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var noResults = document.querySelector('.no-results');
  function applySearch() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var shown = 0;
    cards.forEach(function (card) {
      var source = (card.getAttribute('data-search') || '').toLowerCase();
      var visible = !query || source.indexOf(query) !== -1;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        shown += 1;
      }
    });
    if (noResults) {
      noResults.style.display = shown ? 'none' : 'block';
    }
  }
  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
  }
});
