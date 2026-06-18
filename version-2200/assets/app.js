(function () {
    var menuButton = document.querySelector(".menu-button");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobilePanel.hasAttribute("hidden");
            if (isOpen) {
                mobilePanel.removeAttribute("hidden");
                menuButton.setAttribute("aria-expanded", "true");
            } else {
                mobilePanel.setAttribute("hidden", "");
                menuButton.setAttribute("aria-expanded", "false");
            }
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var index = 0;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
            });
        });

        window.setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderCard(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return "" +
            "<article class=\"movie-card\">" +
                "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
                    "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "在线观看封面\" loading=\"lazy\">" +
                    "<span class=\"poster-shade\"></span>" +
                    "<span class=\"play-mark\">▶</span>" +
                "</a>" +
                "<div class=\"card-body\">" +
                    "<div class=\"card-tags\">" + tags + "</div>" +
                    "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
                    "<p class=\"card-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</p>" +
                    "<p class=\"card-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
                "</div>" +
            "</article>";
    }

    var searchForm = document.getElementById("search-page-form");
    var searchInput = document.getElementById("search-input");
    var categoryFilter = document.getElementById("filter-category");
    var yearFilter = document.getElementById("filter-year");
    var resultsNode = document.getElementById("search-results");
    var summaryNode = document.getElementById("search-summary");

    if (searchForm && resultsNode && window.SITE_SEARCH_INDEX) {
        var params = new URLSearchParams(window.location.search);
        searchInput.value = params.get("q") || "";
        categoryFilter.value = params.get("category") || "";
        yearFilter.value = params.get("year") || "";

        function renderSearch() {
            var query = searchInput.value.trim().toLowerCase();
            var category = categoryFilter.value;
            var year = yearFilter.value;
            var results = window.SITE_SEARCH_INDEX.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.genre, movie.oneLine, movie.tags.join(" ")].join(" ").toLowerCase();
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchCategory = !category || movie.category === category;
                var matchYear = !year || String(movie.year) === year;
                return matchQuery && matchCategory && matchYear;
            });

            if (!query && !category && !year) {
                results = results.slice(0, 120);
            }

            summaryNode.textContent = "找到 " + results.length + " 部影片";
            resultsNode.innerHTML = results.map(renderCard).join("");
        }

        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            var url = new URL(window.location.href);
            url.searchParams.set("q", searchInput.value.trim());
            if (categoryFilter.value) {
                url.searchParams.set("category", categoryFilter.value);
            } else {
                url.searchParams.delete("category");
            }
            if (yearFilter.value) {
                url.searchParams.set("year", yearFilter.value);
            } else {
                url.searchParams.delete("year");
            }
            window.history.replaceState({}, "", url.toString());
            renderSearch();
        });

        categoryFilter.addEventListener("change", renderSearch);
        yearFilter.addEventListener("change", renderSearch);
        renderSearch();
    }
})();
