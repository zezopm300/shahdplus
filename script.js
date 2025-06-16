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

    // Pagination related DOM element - عنصر DOM الخاص بالتقسيم لصفحات
    const paginationControls = document.getElementById('pagination-controls');
    const prevPageBtn = document.createElement('button'); // Added for direct access
    const nextPageBtn = document.createElement('button'); // Added for direct access
    const pageInfoSpan = document.createElement('span'); // Added for direct access

    // NEW: Suggested Movies DOM element - عنصر DOM للأفلام المقترحة
    const suggestedMovieGrid = document.getElementById('suggested-movie-grid');

    // Movie Details Specific elements - عناصر خاصة بتفاصيل الفيلم
    const movieTitleElem = movieDetailsSection.querySelector('.movie-title');
    const movieDirectorElem = movieDetailsSection.querySelector('.director');
    const movieStarsElem = movieDetailsSection.querySelector('.stars');
    const movieCategoryElem = movieDetailsSection.querySelector('.category');
    const movieYearElem = movieDetailsSection.querySelector('.year');
    const movieDescriptionElem = movieDetailsSection.querySelector('.movie-description');
    const moviePlayerContainer = movieDetailsSection.querySelector('.movie-player-container');

    // الرابط المباشر بتاع Adsterra اللي انت بعته
    const adsterraDirectLink = 'https://www.profitableratecpm.com/spqbhmyax?key=2469b039d4e7c471764bd04c57824cf2';

    // Store original meta and title for home page (SEO Improvement) - تخزين بيانات الميتا الأصلية للصفحة الرئيسية لتحسين SEO
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

    // **NEW: Flag to track if Adsterra link has been opened on first click** - علامة لتتبع ما إذا كان رابط Adsterra قد فُتح عند النقرة الأولى
    let adsterraOpenedOnFirstClick = false;
    let scrollTimeoutId = null; // To manage scroll timeouts

    // بيانات الأفلام (هنا يمكنك إضافة المزيد من الأفلام)
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
  "id": 8,
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
        // كرر الأفلام هنا لكي نصل لعدد كافٍ لاختبار التقسيم لصفحات (مثلا 60 فيلم)
        // ... يمكنك إضافة المزيد من الأفلام هنا لزيادة التنوع في السكشن الرئيسي
    ];

    // Duplicate movies to reach 40+ for pagination testing
    for (let i = 0; i < 6; i++) { // Duplicates 6 times, resulting in 42 movies total (6 original + 6*6 duplicates)
        moviesData = moviesData.concat(moviesData.map(movie => ({ ...movie, id: moviesData.length + movie.id })));
    }


    // Pagination state variables - متغيرات حالة تقسيم الصفحات
    let currentPage = 1;
    const moviesPerPage = 40; // عدد الأفلام المعروضة في كل صفحة
    let totalPages; // سيتم حسابه ديناميكيًا في init

    // Helper Function: Update Meta Tags for SEO and Social Sharing - دالة مساعدة: تحديث علامات الميتا لتحسين محركات البحث والمشاركة الاجتماعية
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
        ogImage.setAttribute('content', imageUrl || originalOgImage); // Fallback to original image

        let ogUrl = document.querySelector('meta[property="og:url"]');
        if (!ogUrl) {
            ogUrl = document.createElement('meta');
            ogUrl.property = "og:url";
            document.head.appendChild(ogUrl);
        }
        ogUrl.setAttribute('content', pageUrl || originalOgUrl); // Fallback to original URL

        let ogTypeMeta = document.querySelector('meta[property="og:type"]');
        if (!ogTypeMeta) {
            ogTypeMeta = document.createElement('meta');
            ogTypeMeta.property = "og:type";
            document.head.appendChild(ogTypeMeta);
        }
        ogTypeMeta.setAttribute('content', ogType);

        // Canonical URL for SEO - مهم جداً
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.rel = 'canonical';
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.href = pageUrl || window.location.origin + window.location.pathname;
    }

    // Helper Function: Add or Remove JSON-LD Schema Markup - دالة مساعدة: إضافة أو إزالة ترميز مخطط JSON-LD
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
                "actor": Array.isArray(movieData.stars) ? movieData.stars.map(star => ({ "@type": "Person", "name": star })) : [{ "@type": "Person", "name": movieData.stars }], // Ensure stars is array
                "datePublished": movieData.year + "-01-01",
                "trailer": {
                    "@type": "VideoObject",
                    "name": movieData.title + " Trailer",
                    "description": movieData.description,
                    "thumbnailUrl": movieData.poster,
                    "embedUrl": movieData.embed_url,
                    "uploadDate": movieData.year + "-01-01" // Use a generic date for now
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": String(movieData.rating || "7.0"), // Ensure string, fallback to 7.0
                    "bestRating": "10",
                    "worstRating": "1",
                    "ratingCount": "100" // Placeholder count - ideally dynamic
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

    // Toggle mobile menu - تبديل قائمة الجوال
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                }
            });
        });
    }

    // تحديث رابط URL مع تغيير الحالة (pushState) - Update URL with pushState
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

        // Avoid pushing identical states to prevent unnecessary history entries
        if (window.location.search !== `?${queryString}` || (!queryString && window.location.search !== '')) {
             history.pushState({ movieId: id, pageNumber: page }, null, newUrl);
        }
    }

    // Render Pagination Controls - عرض عناصر التحكم في التقسيم لصفحات
    function renderPaginationControls() {
        if (!paginationControls) return;

        paginationControls.innerHTML = ''; // Clear previous controls

        prevPageBtn.textContent = 'السابق';
        prevPageBtn.classList.add('pagination-btn', 'prev');
        prevPageBtn.disabled = currentPage === 1;
        paginationControls.appendChild(prevPageBtn);

        // Page number display - عرض رقم الصفحة
        pageInfoSpan.classList.add('page-info');
        pageInfoSpan.textContent = `صفحة ${currentPage} من ${totalPages}`;
        paginationControls.appendChild(pageInfoSpan);

        nextPageBtn.textContent = 'التالي';
        nextPageBtn.classList.add('pagination-btn', 'next');
        nextPageBtn.disabled = currentPage === totalPages;
        paginationControls.appendChild(nextPageBtn);
    }

    // Helper function to scroll to the top of a section - دالة مساعدة للتمرير إلى أعلى القسم
    function scrollToElement(element) {
        if (scrollTimeoutId) {
            clearTimeout(scrollTimeoutId); // Clear any pending scroll
        }
        scrollTimeoutId = setTimeout(() => {
            if (element && element.style.display !== 'none') {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            scrollTimeoutId = null; // Reset timeout ID
        }, 300); // Shorter delay for general scrolling
    }


    // عرض قائمة الأفلام (Homepage) - Display movie list (Homepage)
    function displayMovies() {
        movieDetailsSection.style.display = 'none';
        moviesListSection.style.display = 'block';
        heroSection.style.display = 'block';
        paginationControls.style.display = 'flex'; // Show pagination controls

        movieGrid.innerHTML = ''; // Clear previous movie cards

        // Calculate start and end index for current page - حساب مؤشر البداية والنهاية للصفحة الحالية
        const startIndex = (currentPage - 1) * moviesPerPage;
        const endIndex = startIndex + moviesPerPage;
        const moviesToDisplay = moviesData.slice(startIndex, endIndex);

        moviesToDisplay.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.setAttribute('role', 'listitem');

            const movieLink = document.createElement('a');
            // Do not set href directly, use data-id for internal routing
            movieLink.dataset.id = movie.id;

            movieLink.innerHTML = `
                <img loading="lazy" src="${movie.poster}" alt="بوستر فيلم ${movie.title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/260x380?text=Image+Not+Found';">
                <h3>${movie.title}</h3>
            `;

            movieCard.appendChild(movieLink);
            movieGrid.appendChild(movieCard);
        });

        // Update Hero Section with a random trending movie
        if (moviesData.length > 0) {
            const randomIndex = Math.floor(Math.random() * moviesData.length);
            const featuredMovie = moviesData[randomIndex];

            heroSection.querySelector('h2').textContent = featuredMovie.title;
            heroSection.querySelector('p').textContent = featuredMovie.description.substring(0, 150) + '...';

            heroBtn.dataset.id = featuredMovie.id;
            heroBtn.style.cursor = 'pointer';

            // IMPORTANT: Reassign onclick directly to prevent multiple listeners
            heroBtn.onclick = (event) => {
                event.preventDefault();
                if (!adsterraOpenedOnFirstClick) {
                    window.open(adsterraDirectLink, '_blank');
                    adsterraOpenedOnFirstClick = true;
                }
                displayMovieDetails(heroBtn.dataset.id);
                updateUrl(heroBtn.dataset.id);
                scrollToElement(movieDetailsSection);
            };
        }

        // SEO IMPROVEMENT: Revert meta tags to original home page values
        updateMetaTags(originalTitle, originalDescription, originalOgImage, originalOgUrl, 'website');
        // SEO IMPROVEMENT: Remove any specific movie schema
        addJsonLdSchema(null);

        renderPaginationControls();
    }

    // NEW FUNCTION: Display Suggested Movies - دالة جديدة: عرض الأفلام المقترحة
    function displaySuggestedMovies(currentMovieId) {
        if (!suggestedMovieGrid) return;

        suggestedMovieGrid.innerHTML = ''; // Clear previous suggested movies

        // Filter out the current movie - تصفية الفيلم الحالي
        const availableMovies = moviesData.filter(movie => movie.id !== currentMovieId);

        // Shuffle the available movies (Fisher-Yates shuffle) - خلط الأفلام المتاحة (خلط فيشر-ييتس)
        for (let i = availableMovies.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableMovies[i], availableMovies[j]] = [availableMovies[j], availableMovies[i]];
        }

        // Take up to 6 suggested movies - عرض ما يصل إلى 6 أفلام مقترحة
        const moviesToSuggest = availableMovies.slice(0, 6);

        moviesToSuggest.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.setAttribute('role', 'listitem');

            const movieLink = document.createElement('a');
            movieLink.dataset.id = movie.id;

            movieLink.innerHTML = `
                <img loading="lazy" src="${movie.poster}" alt="بوستر فيلم ${movie.title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/260x380?text=Image+Not+Found';">
                <h3>${movie.title}</h3>
            `;
            movieCard.appendChild(movieLink);
            suggestedMovieGrid.appendChild(movieCard);
        });
    }

    // عرض تفاصيل الفيلم - Display movie details
    function displayMovieDetails(id) {
        const movie = moviesData.find(m => m.id === parseInt(id));

        if (movie) {
            heroSection.style.display = 'none';
            moviesListSection.style.display = 'none';
            paginationControls.style.display = 'none'; // Hide pagination controls
            movieDetailsSection.style.display = 'block';

            movieTitleElem.textContent = movie.title;
            movieDirectorElem.textContent = `المخرج: ${movie.director}`;
            movieStarsElem.textContent = `بطولة: ${Array.isArray(movie.stars) ? movie.stars.join(', ') : movie.stars}`;
            movieCategoryElem.textContent = `النوع: ${movie.category}`;
            movieYearElem.textContent = `السنة: ${movie.year}`;
            movieDescriptionElem.textContent = movie.description;

            // عرض مشغل الفيديو - Display video player
            // Added message for ad-blockers / loading
            moviePlayerContainer.innerHTML = `
                <p class="video-loading-message">جارٍ تحميل الفيديو... قد تحتاج لتعطيل مانع الإعلانات إذا لم يظهر الفيديو.</p>
                <iframe src="${movie.embed_url}" frameborder="0" allowfullscreen 
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture" 
                    referrerpolicy="origin" sandbox="allow-scripts allow-same-origin allow-popups allow-forms">
                </iframe>
            `;

            // **إضافة الغطاء الشفاف (Video Overlay) لفتح إعلانات Adsterra**
            const videoOverlay = document.createElement('div');
            videoOverlay.classList.add('video-overlay'); // إضافة الكلاس لتطبيق الأنماط
            moviePlayerContainer.appendChild(videoOverlay);

            // إضافة Event Listener للغطاء لفتح الرابط المباشر
            videoOverlay.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event from bubbling up to parent click handlers
                window.open(adsterraDirectLink, '_blank'); // فتح الرابط في علامة تبويب جديدة
                // Optionally remove overlay after first click
                // videoOverlay.style.display = 'none';
                // or remove it completely
                // videoOverlay.remove();
            });

            // NEW: Display suggested movies
            displaySuggestedMovies(movie.id);

            // SEO Improvement: Update meta tags for specific movie page
            const moviePageUrl = `${window.location.origin}${window.location.pathname}?id=${movie.id}`;
            updateMetaTags(
                `${movie.title} - شاهد بلس`,
                movie.description,
                movie.poster,
                moviePageUrl,
                'video.movie'
            );

            // Add JSON-LD schema for this movie
            addJsonLdSchema(movie);

        } else {
            // إذا لم يتم العثور على الفيلم، العودة للصفحة الرئيسية
            console.warn('Movie not found for ID:', id);
            displayMovies();
            updateUrl(); // Clean up URL
            scrollToElement(document.body); // Scroll to top of home page
        }
    }

    // Handle clicks on movie cards (and no longer hero button directly here)
    document.addEventListener('click', (e) => {
        const movieLink = e.target.closest('.movie-card a'); // For movie cards

        if (movieLink && movieLink.dataset.id) {
            e.preventDefault(); // Prevent default link behavior

            // Open Adsterra link first if not opened before
            if (!adsterraOpenedOnFirstClick) {
                window.open(adsterraDirectLink, '_blank');
                adsterraOpenedOnFirstClick = true; // Set flag to true after opening
            }

            const movieId = movieLink.dataset.id;
            displayMovieDetails(movieId);
            updateUrl(movieId); // Update URL with movie ID

            scrollToElement(movieDetailsSection);
        }
    });

    // Handle pagination button clicks (delegated from renderPaginationControls)
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayMovies();
            updateUrl(null, currentPage);
            scrollToElement(moviesListSection);
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayMovies();
            updateUrl(null, currentPage);
            scrollToElement(moviesListSection);
        }
    });


    // Handle back button click
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            displayMovies();
            updateUrl(); // Revert URL to home page
            adsterraOpenedOnFirstClick = false; // Reset Adsterra flag when returning home
            scrollToElement(document.body); // Scroll to top of home page
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
        } else if (pageNumber) {
            currentPage = parseInt(pageNumber);
            displayMovies();
            scrollToElement(moviesListSection);
        } else {
            // Default to home page if no specific ID or page in URL
            currentPage = 1; // Ensure current page is reset to 1 for home
            displayMovies();
            adsterraOpenedOnFirstClick = false; // Reset Adsterra flag on home
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
            scrollToElement(movieDetailsSection); // Initial scroll for direct movie link
        } else if (pageNumber && parseInt(pageNumber) <= totalPages) {
            currentPage = parseInt(pageNumber);
            displayMovies();
            scrollToElement(moviesListSection); // Initial scroll for direct page link
        } else {
            displayMovies();
            scrollToElement(document.body); // Initial scroll for home page
        }
    }

    // Call init when DOM is fully loaded
    init();
});
