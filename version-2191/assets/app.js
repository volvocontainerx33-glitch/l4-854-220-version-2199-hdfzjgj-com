(function () {
    const toggle = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let activeIndex = 0;

        const showSlide = function (index) {
            activeIndex = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide((activeIndex + 1) % slides.length);
            }, 5200);
        }
    }

    document.querySelectorAll('[data-filter-area]').forEach(function (panel) {
        const input = panel.querySelector('[data-search-input]');
        const pageSection = panel.closest('.catalog-section') || document;
        const cards = Array.from(pageSection.querySelectorAll('[data-movie-card]'));
        const noResults = panel.querySelector('[data-no-results]');
        const selects = Array.from(panel.querySelectorAll('[data-filter-select]'));

        const apply = function () {
            const query = input ? input.value.trim().toLowerCase() : '';
            const filterValues = {};
            selects.forEach(function (select) {
                filterValues[select.getAttribute('data-filter-select')] = select.value;
            });

            let visible = 0;
            cards.forEach(function (card) {
                const matchQuery = !query || (card.getAttribute('data-keywords') || '').includes(query);
                const matchYear = !filterValues.year || card.getAttribute('data-year') === filterValues.year;
                const matchRegion = !filterValues.region || card.getAttribute('data-region') === filterValues.region;
                const matchType = !filterValues.type || card.getAttribute('data-type') === filterValues.type;
                const shouldShow = matchQuery && matchYear && matchRegion && matchType;

                card.classList.toggle('is-hidden', !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (noResults) {
                noResults.hidden = visible !== 0;
            }
        };

        if (input) {
            input.addEventListener('input', apply);
        }

        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
    });
})();
