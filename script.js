document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Element References - مراجع عناصر DOM
    const movieGrid = document.querySelector('.movie-grid');
    const movieDetailsSection = document.getElementById('movie-details');
    const heroSection = document.getElementById('hero-section');
    const moviesListSection = document.getElementById('movies-list');
    const backBtn = document.getElementById('back-to-home-btn');
    const heroBtn = document.getElementById('hero-btn');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.main-nav .nav-link');

    // Pagination related DOM elements - عناصر DOM الخاصة بالتقسيم لصفحات
    const paginationControls = document.getElementById('pagination-controls');
    const prevPageBtn = paginationControls ? paginationControls.querySelector('.prev') : null;
    const nextPageBtn = paginationControls ? paginationControls.querySelector('.next') : null;
    const pageInfoSpan = paginationControls ? paginationControls.querySelector('.page-info') : null;

    // Suggested Movies DOM element - عنصر DOM للأفلام المقترحة
    const suggestedMovieGrid = document.getElementById('suggested-movie-grid');

    // Movie Details Specific elements - عناصر خاصة بتفاصيل الفيلم
    const movieTitleElem = movieDetailsSection ? movieDetailsSection.querySelector('.movie-title') : null;
    const movieDirectorElem = movieDetailsSection ? movieDetailsSection.querySelector('.director') : null;
    const movieStarsElem = movieDetailsSection ? movieDetailsSection.querySelector('.stars') : null;
    const movieCategoryElem = movieDetailsSection ? movieDetailsSection.querySelector('.category') : null;
    const movieYearElem = movieDetailsSection ? movieDetailsSection.querySelector('.year') : null;
    const movieDescriptionElem = movieDetailsSection ? movieDetailsSection.querySelector('.movie-description') : null;
    const moviePlayerContainer = movieDetailsSection ? movieDetailsSection.querySelector('.movie-player-container') : null;

    // Store original meta and title for home page (SEO Improvement)
    const originalTitle = document.title;
    const originalDescriptionMeta = document.querySelector('meta[name="description"]');
    const originalDescription = originalDescriptionMeta ? originalDescriptionMeta.content : '';
    const originalOgTitleMeta = document.querySelector('meta[property="og:title"]');
    const originalOgTitle = originalOgTitleMeta ? originalOgTitleMeta.content : '';
    const originalOgDescriptionMeta = document.querySelector('meta[property="og:description"]');
    const originalOgDescription = originalOgDescriptionMeta ? originalOgDescriptionMeta.content : '';
    const originalOgImageMeta = document.querySelector('meta[property="og:image"]');
    const originalOgImage = originalOgImageMeta ? originalOgImageMeta.content : '';
    const originalOgUrlMeta = document.querySelector('meta[property="og:url"]');
    const originalOgUrl = originalOgUrlMeta ? originalOgUrlMeta.content : window.location.href;

    // Movie Data (IMPORTANT: Update embed_url for reliable playback)
    // ****** الرجاء التأكد من استبدال روابط embed_url بروابط صالحة تسمح بالتضمين ******
    // ****** استخدم روابط YouTube Embed أو Vimeo Embed التي تحصل عليها مباشرة من هذه المنصات ******
    // ****** الروابط مثل streamtape.com أو vide0.net غالبًا ما تكون مشكلة وتسبب الإعلانات المزعجة أو الحظر ******
    let moviesData = [
           {
            "id": 1,
            "title": "فيلم Purity Falls 2019",
            "description": " القصّة : بعد مرور عام على فقدان زوجها، تستقر نيكول مع أبنائها الصغار جاستين وجيسون في بيوريتي فولز. في البداية، يتم الترحيب بالعائلة بحفاوة. وخاصة جارتهم الغنية كورتني التي تبدو لطيفة للغاية، حيث توفر لجيسون بسرعة وظائف غريبة لدعم دخل الأسرة. ومع ذلك، سرعان ما تلاحظ نيكول أن هناك شيئًا ما ليس على ما يرام، حيث يغادر ابنها ويعود في ساعات متأخرة بشكل مريب. عندما تغرق جارتها الشابة في حمام السباحة، تبدأ الأمور في أن تصبح خطيرة. هناك شيء غير صحيح مع كورتني الودودة للغاية، والتي يبدو أنها تسيطر على ابنها.",
            "poster": "https://tinyurl.com/mrynn3au",
            "year": "2019",
            "category": "رومنسي , إثارة جنسية ساخنة/تشويق / للبالغين فقط +18",
            "director": "Trevor Stines",
            "stars": ["Kristanna Loken"],
            "embed_url": "https://vide0.net/e/smo8970rj5gh",
            "rating": "6.2"
        },
        {
            "id": 2,
            "title": "A Nice Girl Like You 2020",
            "description": "القصّة : لوسي نيل عازفة كمان، تكتشف إدمان صديقها جيف لمشاهدة المواد الإباحية، فتتشاجر معه، وينفصلا، وتصاب بصدمة عصبية، وتقرر على هذا الاساس تعزيز نفسيها، واكتشاف ذاتها خاصة بعد علاقة الصداقة التي تنشأ بينها وبين جرانت، حيث يساعدها على التغلب على مشاكلها السابقة مع صديقها جيف",
            "poster": "https://i.ibb.co/k2jg6TSd/photo-5852675531542218174-y.jpg",
            "year": "2020",
            "category": "رومنسي , إثارة جنسية ساخنة/تشويق / للبالغين فقط ",
            "director": "Chris Riedell",
            "stars": ["Lucy Hale"],
            "embed_url": "https://streamtape.com/e/gopa76QkOpuqM8P/",
            "rating": "5.5"
        },
        {
            "id": 3,
            "title": "Sleeping with the Enemy 1991",
            "description": " تزوجت (لورا) منذ أربع سنوات بالرجل الوسيم (مارتن). يبدو زواجهما مثاليًا في أعين الجميع، ولكن الحقيقة تختلف تمامًا عن هذه الصورة. يعامل مارتن المتسلط لورا بعنف ووحشية ويعتدي عليها، لتصل الزوجة لنقطة تستعد فيها لفعل أي شيء مقابل التخلص من حياتها البائسة. تضع لورا خطة النجاة، والتي تتلخص في قيامها بادعاء الوفاة، وتلفيق كل شيء؛ بحيث تنطلي الخدعة على مارتن. يسير كل شيء حسب الخطة، وتبدأ لورا في العيش بسعادة بهويتها الجديدة، ولكن السعادة لا تدوم طويلًا بعدما تتطور الأحداث بغتة.",
            "poster": "https://i.ibb.co/d4Jmp73r/photo-5852675531542218154-y.jpg",
            "year": "1991",
            "category": "رومنسي , إثارة جنسية ساخنة/تشويق / للبالغين فقط ",
            "director": "Joseph Ruben",
            "stars": ["Julia Roberts"],
            "embed_url": "https://streamtape.com/e/v9KrVBVJVAIYjA/",
            "rating": "6.3"
        },



        {
  "id": 7,
  "title": "اغنيه العيد ",
  "description": "اغانيه رومانسيه ",
  "poster": "https://zaaednews.com/wp-content/uploads/2024/09/%D8%AD%D9%81%D9%84-%D8%A3%D9%86%D8%BA%D8%A7%D9%85-%D9%84%D9%8A%D8%A7%D9%84%D9%8A-%D9%85%D8%B5%D8%B1-%D9%81%D9%8A-%D8%A7%D9%84%D9%85%D8%AA%D8%AD%D9%81-%D8%A7%D9%84%D9%85%D8%B5%D8%B1%D9%8A-%D8%A7%D9%84%D9%83%D8%A8%D9%8A%D8%B1.jpg0_.jpg",
  "year": "2024",
  "category": "رومانسي",
  "director": "انغام",
  "stars": ["ممثل 1", "ممثل 2"],
  "embed_url": "https://player.vimeo.com/video/1091276533"

}
,

  
        {
            "id": 4,
            "title": "Moms Friends 2024",
            "description": " القصّة : فيلم رومانسي جديد حول الرغبات الجنسية والعلاقات الحميمة الساخنة بين الشباب والعلاقات الجنسية التي يمارسونها",
            "poster": "https://i.postimg.cc/dtHdLMNL/photo-5838945848241800438-y.jpg",
            "year": "2024",
            "category": "رومنسي , إثارة جنسية ساخنة/تشويق / للبالغين فقط ",
            "director": "Yoo Je‑won.",
            "stars": ["Choi Seung‑hyo"],
            "embed_url": "https://streamtape.com/e/7kbx78RR8VtAXD1/",
            "rating": "7.0"
        },
        {
            "id": 5,
            "title": "Blood Pay 2025",
            "description": "فيلم إثارة خيال علمي تدور أحداثه في الجنة، وهي مدينة خيالية يسيطر فيها الذكاء الاصطناعي على القوى العاملة ويقود العزلة الاجتماعية.",
            "poster": "https://i.ibb.co/v6d90zjN/photo-5789391950099630510-w.jpg",
            "year": "2025",
            "category": "رعب / خيال علمي☯️ .. ",
            "director": "Brace Beltempo.",
            "stars": ["Gianluca Busani"],
            "embed_url": "https://streamtape.com/e/7b7rqXvk7DT8Ap/",
            "rating": "7.5"
        },
        {
            "id": 6,
            "title": "Twisters",
            "description": "القصة: مع اشتداد موسم العواصف، تتصادم مسارات مطارد العواصف السابق كيت كوبر ونجم وسائل التواصل الاجتماعي المتهور تايلر أوينز عندما يتم إطلاق العنان لظواهر مرعبة لم يسبق لها مثيل. يجد الزوجان وفرقهما المتنافسة أنفسهم مباشرة في مسارات أنظمة العواصف المتعددة المتقاربة فوق وسط أوكلاهوما في معركة حياتهم.",
            "poster": "https://i.ibb.co/Zp7BnYS3/Untitled.jpg",
            "year": "2024",
            "category": "اثارة/ اكشن ☯️ .. ",
            "director": "Lee Isaac Chung",
            "stars": ["Daisy Edgar-Jones"],
            "embed_url": "https://streamtape.com/e/KXbbjrOM6Lc080L/",
            "rating": "7.8"
        },
        // هنا يمكنك إضافة المزيد من الأفلام يدويًا
    ];

    // Pagination state variables
    let currentPage = 1;
    const moviesPerPage = 40; // Number of movies displayed per page
    let totalPages; // Will be calculated dynamically in init

    // Helper Function: Update Meta Tags for SEO and Social Sharing
    function updateMetaTags(title, description, imageUrl, pageUrl, ogType = 'website') {
        document.title = title;

        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = "description";
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description);

        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (!ogTitle) {
            ogTitle = document.createElement('meta');
            ogTitle.property = "og:title";
            document.head.appendChild(ogTitle);
        }
        ogTitle.setAttribute('content', title);

        let ogDescription = document.querySelector('meta[property="og:description"]');
        if (!ogDescription) {
            ogDescription = document.createElement('meta');
            ogDescription.property = "og:description";
            document.head.appendChild(ogDescription);
        }
        ogDescription.setAttribute('content', description);

        let ogImage = document.querySelector('meta[property="og:image"]');
        if (!ogImage) {
            ogImage = document.createElement('meta');
            ogImage.property = "og:image";
            document.head.appendChild(ogImage);
        }
        ogImage.setAttribute('content', imageUrl || originalOgImage);

        let ogUrl = document.querySelector('meta[property="og:url"]');
        if (!ogUrl) {
            ogUrl = document.createElement('meta');
            ogUrl.property = "og:url";
            document.head.appendChild(ogUrl);
        }
        ogUrl.setAttribute('content', pageUrl || originalOgUrl);

        let ogTypeMeta = document.querySelector('meta[property="og:type"]');
        if (!ogTypeMeta) {
            ogTypeMeta = document.createElement('meta');
            ogTypeMeta.property = "og:type";
            document.head.appendChild(ogTypeMeta);
        }
        ogTypeMeta.setAttribute('content', ogType);

        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.rel = 'canonical';
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.href = pageUrl || window.location.origin + window.location.pathname;
    }

    // Helper Function: Add or Remove JSON-LD Schema Markup
    function addJsonLdSchema(movieData = null) {
        let existingSchema = document.getElementById('movie-schema-ld');
        if (existingSchema) {
            existingSchema.remove();
        }

        if (movieData) {
            const schema = {
                "@context": "http://schema.org",
                "@type": "Movie",
                "name": movieData.title,
                "description": movieData.description,
                "image": movieData.poster,
                "director": {
                    "@type": "Person",
                    "name": movieData.director
                },
                "actor": Array.isArray(movieData.stars) ? movieData.stars.map(star => ({ "@type": "Person", "name": star })) : [{ "@type": "Person", "name": movieData.stars }],
                "datePublished": movieData.year + "-01-01",
                "trailer": {
                    "@type": "VideoObject",
                    "name": movieData.title + " Trailer",
                    "description": movieData.description,
                    "thumbnailUrl": movieData.poster,
                    "embedUrl": movieData.embed_url,
                    "uploadDate": movieData.year + "-01-01"
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": String(movieData.rating || "7.0"),
                    "bestRating": "10",
                    "worstRating": "1",
                    "ratingCount": "100"
                },
                "url": window.location.href
            };

            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = 'movie-schema-ld';
            script.textContent = JSON.stringify(schema);
            document.head.appendChild(script);
        }
    }

    // Toggle mobile menu
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
            mainNav.setAttribute('aria-hidden', !isExpanded);
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    mainNav.setAttribute('aria-hidden', 'true');
                }
            });
        });
    }

    // Update URL with pushState
    function updateUrl(id = null, page = null) {
        const currentPath = window.location.pathname;
        let newUrl = currentPath;
        const params = new URLSearchParams();

        if (id) {
            params.set('id', id);
        }
        if (page && page > 1 && !id) {
            params.set('page', page);
        }

        const queryString = params.toString();
        if (queryString) {
            newUrl += `?${queryString}`;
        }

        if (window.location.search !== `?${queryString}` || (!queryString && window.location.search !== '')) {
            history.pushState({ movieId: id, pageNumber: page }, null, newUrl);
        }
    }

    // Render Pagination Controls
    function renderPaginationControls() {
        if (!paginationControls || !prevPageBtn || !nextPageBtn || !pageInfoSpan) return;

        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
        pageInfoSpan.textContent = `صفحة ${currentPage} من ${totalPages}`;
    }

    // Helper function to scroll to the top of a section
    let scrollTimeoutId = null;
    function scrollToElement(element, delay = 300) {
        if (scrollTimeoutId) {
            clearTimeout(scrollTimeoutId);
        }
        scrollTimeoutId = setTimeout(() => {
            if (element && element.offsetParent !== null) { // Check if element is in DOM and visible
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top of page if element not found
            }
            scrollTimeoutId = null;
        }, delay);
    }

    // Display movie list (Homepage)
    function displayMovies() {
        if (!movieDetailsSection || !moviesListSection || !heroSection || !movieGrid || !paginationControls || !heroBtn) {
            console.error("Critical DOM elements for homepage are missing. Cannot display movies.");
            return;
        }

        movieDetailsSection.style.display = 'none';
        moviesListSection.style.display = 'block';
        heroSection.style.display = 'block';
        paginationControls.style.display = 'flex';

        movieGrid.innerHTML = '';

        const startIndex = (currentPage - 1) * moviesPerPage;
        const endIndex = startIndex + moviesPerPage;
        const moviesToDisplay = moviesData.slice(startIndex, endIndex);

        if (moviesToDisplay.length === 0) {
            movieGrid.innerHTML = '<p class="no-movies-found">لا توجد أفلام لعرضها في هذه الصفحة.</p>';
        }

        moviesToDisplay.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.setAttribute('role', 'listitem');

            const movieLink = document.createElement('a');
            movieLink.dataset.id = movie.id;
            movieLink.title = `شاهد فيلم ${movie.title}`;
            movieLink.setAttribute('aria-label', `شاهد فيلم ${movie.title}`);

            movieLink.innerHTML = `
                <img loading="lazy" src="${movie.poster}" alt="بوستر فيلم ${movie.title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/260x380?text=Image+Not+Found';">
                <h3>${movie.title}</h3>
            `;

            movieCard.appendChild(movieLink);
            movieGrid.appendChild(movieCard);
        });

        if (moviesData.length > 0) {
            const randomIndex = Math.floor(Math.random() * moviesData.length);
            const featuredMovie = moviesData[randomIndex];

            const heroTitle = heroSection.querySelector('h2');
            const heroDescription = heroSection.querySelector('p');

            if (heroTitle) heroTitle.textContent = featuredMovie.title;
            if (heroDescription) heroDescription.textContent = featuredMovie.description.substring(0, 150) + '...';

            heroBtn.dataset.id = featuredMovie.id;
            heroBtn.style.cursor = 'pointer';

            heroBtn.onclick = (event) => {
                event.preventDefault();
                displayMovieDetails(heroBtn.dataset.id);
                updateUrl(heroBtn.dataset.id);
                scrollToElement(movieDetailsSection, 750);
            };
        }

        updateMetaTags(originalTitle, originalDescription, originalOgImage, originalOgUrl, 'website');
        addJsonLdSchema(null);
        renderPaginationControls();
    }

    // Display Suggested Movies
    function displaySuggestedMovies(currentMovieId) {
        if (!suggestedMovieGrid) return;

        suggestedMovieGrid.innerHTML = '';

        const availableMovies = moviesData.filter(movie => movie.id !== parseInt(currentMovieId));

        for (let i = availableMovies.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableMovies[i], availableMovies[j]] = [availableMovies[j], availableMovies[i]];
        }

        const moviesToSuggest = availableMovies.slice(0, 6);

        if (moviesToSuggest.length === 0) {
            suggestedMovieGrid.innerHTML = '<p class="no-suggestions">لا توجد اقتراحات أفلام متاحة حالياً.</p>';
            return;
        }

        moviesToSuggest.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.setAttribute('role', 'listitem');

            const movieLink = document.createElement('a');
            movieLink.dataset.id = movie.id;
            movieLink.title = `شاهد فيلم ${movie.title}`;
            movieLink.setAttribute('aria-label', `شاهد فيلم ${movie.title}`);

            movieLink.innerHTML = `
                <img loading="lazy" src="${movie.poster}" alt="بوستر فيلم ${movie.title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/260x380?text=Image+Not+Found';">
                <h3>${movie.title}</h3>
            `;
            movieCard.appendChild(movieLink);
            suggestedMovieGrid.appendChild(movieCard);
        });
    }

    // Display movie details
    function displayMovieDetails(id) {
        const movie = moviesData.find(m => m.id === parseInt(id));

        if (movie && movieDetailsSection && heroSection && moviesListSection && paginationControls && movieTitleElem && movieDirectorElem && movieStarsElem && movieCategoryElem && movieYearElem && movieDescriptionElem && moviePlayerContainer) {
            heroSection.style.display = 'none';
            moviesListSection.style.display = 'none';
            paginationControls.style.display = 'none';
            movieDetailsSection.style.display = 'block';

            movieTitleElem.textContent = movie.title;
            movieDirectorElem.textContent = `المخرج: ${movie.director}`;
            movieStarsElem.textContent = `بطولة: ${Array.isArray(movie.stars) ? movie.stars.join(', ') : movie.stars}`;
            movieCategoryElem.textContent = `النوع: ${movie.category}`;
            movieYearElem.textContent = `السنة: ${movie.year}`;
            movieDescriptionElem.textContent = movie.description;

            // Display video player
            // تم إزالة الغطاء الشفاف. سيعرض الفيديو مباشرة.
            moviePlayerContainer.innerHTML = `
                <iframe src="${movie.embed_url}" frameborder="0" allowfullscreen
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    referrerpolicy="origin" sandbox="allow-scripts allow-same-origin allow-popups allow-forms">
                </iframe>
            `;

            displaySuggestedMovies(movie.id);

            const moviePageUrl = `${window.location.origin}${window.location.pathname}?id=${movie.id}`;
            updateMetaTags(
                `${movie.title} - شاهد بلس`,
                movie.description,
                movie.poster,
                moviePageUrl,
                'video.movie'
            );

            addJsonLdSchema(movie);

        } else {
            console.warn('Movie not found for ID:', id);
            displayMovies();
            updateUrl();
            scrollToElement(document.body);
        }
    }

    // Handle clicks on movie cards (event delegation)
    document.addEventListener('click', (e) => {
        const movieLink = e.target.closest('.movie-card a');

        if (movieLink && movieLink.dataset.id) {
            e.preventDefault();
            const movieId = movieLink.dataset.id;
            displayMovieDetails(movieId);
            updateUrl(movieId);
            scrollToElement(movieDetailsSection, 750);
        }
    });

    // Handle pagination button clicks
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayMovies();
                updateUrl(null, currentPage);
                scrollToElement(moviesListSection);
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayMovies();
                updateUrl(null, currentPage);
                scrollToElement(moviesListSection);
            }
        });
    }

    // Handle back button click
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            displayMovies();
            updateUrl();
            // لا حاجة لإعادة تعيين adsterraOpenedThisSession لأننا لم نعد نستخدمه بنفس الطريقة
            scrollToElement(document.body);
        });
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const pageNumber = urlParams.get('page');

        if (movieId) {
            displayMovieDetails(movieId);
            scrollToElement(movieDetailsSection);
        } else if (pageNumber && parseInt(pageNumber) <= totalPages) {
            currentPage = parseInt(pageNumber);
            displayMovies();
            scrollToElement(moviesListSection);
        } else {
            currentPage = 1;
            displayMovies();
            // لا حاجة لإعادة تعيين adsterraOpenedThisSession هنا
            scrollToElement(document.body);
        }
    });

    // Initial page load logic
    function init() {
        totalPages = Math.ceil(moviesData.length / moviesPerPage);
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const pageNumber = urlParams.get('page');

        if (movieId) {
            displayMovieDetails(movieId);
            scrollToElement(movieDetailsSection, 1000); // Scroll with a slight delay to ensure content is rendered
        } else if (pageNumber && parseInt(pageNumber) <= totalPages) {
            currentPage = parseInt(pageNumber);
            displayMovies();
            scrollToElement(moviesListSection);
        } else {
            displayMovies();
            scrollToElement(document.body); // Scroll to top for initial home view
        }
    }

    // Call init when DOM is fully loaded
    init();
});
