document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Element References
    const movieGrid = document.querySelector('.movie-grid');
    const movieDetailsSection = document.getElementById('movie-details');
    const heroSection = document.getElementById('hero-section');
    const moviesListSection = document.getElementById('movies-list');
    const backBtn = document.getElementById('back-to-home-btn');
    const heroBtn = document.getElementById('hero-btn');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.main-nav .nav-link');

    // Pagination related DOM element
    const paginationControls = document.getElementById('pagination-controls');

    // NEW: Suggested Movies DOM element
    const suggestedMovieGrid = document.getElementById('suggested-movie-grid');

    // Movie Details Specific elements
    const movieTitleElem = movieDetailsSection.querySelector('.movie-title');
    const movieDirectorElem = movieDetailsSection.querySelector('.director');
    const movieStarsElem = movieDetailsSection.querySelector('.stars');
    const movieCategoryElem = movieDetailsSection.querySelector('.category');
    const movieYearElem = movieDetailsSection.querySelector('.year');
    const movieDescriptionElem = movieDetailsSection.querySelector('.movie-description');
    const moviePlayerContainer = movieDetailsSection.querySelector('.movie-player-container');

    // الرابط المباشر بتاع Adsterra اللي انت بعته
    const adsterraDirectLink = 'https://www.profitableratecpm.com/spqbhmyax?key=2469b039d4e7c471764bd04c57824cf2';

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

    // **NEW: Flag to track if Adsterra link has been opened on first click**
    let adsterraOpenedOnFirstClick = false;

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
        // هذا مجرد مثال، يمكنك إضافة أفلام حقيقية أو تكرار الموجودة للاختبار
        /*   { "id": 7, "title": "فيلم Purity Falls 2019 (مكرر 1)", "description": "وصف مكرر", "poster": "https://tinyurl.com/mrynn3au", "year": "2019", "category": "رومنسي", "director": "مخرج", "stars": ["نجم"], "embed_url": "https://vide0.net/e/smo8970rj5gh", "rating": "6.0" },
        { "id": 8, "title": "فيلم Purity Falls 2019 (مكرر 2)", "description": "وصف مكرر", "poster": "https://tinyurl.com/mrynn3au", "year": "2019", "category": "رومنسي", "director": "مخرج", "stars": ["نجم"], "embed_url": "https://vide0.net/e/smo8970rj5gh", "rating": "6.0" },
        { "id": 9, "title": "فيلم Purity Falls 2019 (مكرر 3)", "description": "وصف مكرر", "poster": "https://tinyurl.com/mrynn3au", "year": "2019", "category": "رومنسي", "director": "مخرج", "stars": ["نجم"], "embed_url": "https://vide0.net/e/smo8970rj5gh", "rating": "6.0" },
        */
    ]; 

    // Pagination state variables
    let currentPage = 1;
    const moviesPerPage = 40; // عرض 50 فيلم في كل صفحة
    let totalPages; // سيتم حسابه ديناميكيًا في init

    // Helper Function: Update Meta Tags for SEO and Social Sharing
    function updateMetaTags(title, description, imageUrl, pageUrl, ogType = 'website') {
        document.title = title;
        document.querySelector('meta[name="description"]').setAttribute('content', description);

        document.querySelector('meta[property="og:title"]').setAttribute('content', title);
        document.querySelector('meta[property="og:description"]').setAttribute('content', description);
        if (imageUrl) {
            document.querySelector('meta[property="og:image"]').setAttribute('content', imageUrl);
        }
        if (pageUrl) {
            document.querySelector('meta[property="og:url"]').setAttribute('content', pageUrl);
        }
        document.querySelector('meta[property="og:type"]').setAttribute('content', ogType);
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

    // Toggle mobile menu
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

    // تحديث رابط URL مع تغيير الحالة (pushState)
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

        history.pushState({ movieId: id, pageNumber: page }, null, newUrl);
    }

    // Render Pagination Controls
    function renderPaginationControls() {
        if (!paginationControls) return;

        paginationControls.innerHTML = ''; // Clear previous controls

        const prevButton = document.createElement('button');
        prevButton.textContent = 'السابق';
        prevButton.classList.add('pagination-btn', 'prev');
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayMovies(); // Redisplay movies for new page
                updateUrl(null, currentPage); // Update URL, only page param for home
                window.scrollTo({ top: moviesListSection.offsetTop, behavior: 'smooth' }); // Scroll to top of list
            }
        });
        paginationControls.appendChild(prevButton);

        // Page number display
        const pageInfo = document.createElement('span');
        pageInfo.classList.add('page-info');
        pageInfo.textContent = `صفحة ${currentPage} من ${totalPages}`;
        paginationControls.appendChild(pageInfo);


        const nextButton = document.createElement('button');
        nextButton.textContent = 'التالي';
        nextButton.classList.add('pagination-btn', 'next');
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayMovies(); // Redisplay movies for new page
                updateUrl(null, currentPage); // Update URL, only page param for home
                window.scrollTo({ top: moviesListSection.offsetTop, behavior: 'smooth' }); // Scroll to top of list
            }
        });
        paginationControls.appendChild(nextButton);
    }

    // عرض قائمة الأفلام (Homepage)
    function displayMovies() {
        movieDetailsSection.style.display = 'none';
        moviesListSection.style.display = 'block';
        heroSection.style.display = 'block';
        paginationControls.style.display = 'flex'; // Show pagination controls

        movieGrid.innerHTML = ''; // Clear previous movie cards

        // Calculate start and end index for current page
        const startIndex = (currentPage - 1) * moviesPerPage;
        const endIndex = startIndex + moviesPerPage;
        const moviesToDisplay = moviesData.slice(startIndex, endIndex);

        moviesToDisplay.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.setAttribute('role', 'listitem');

            const movieLink = document.createElement('a');
            movieLink.href = `?id=${movie.id}`; // Keep ?id= for SEO
            movieLink.dataset.id = movie.id;

            movieLink.innerHTML = `
                <img loading="lazy" src="${movie.poster}" alt="بوستر فيلم ${movie.title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/260x380?text=Image+Not+Found';">
                <h3>${movie.title}</h3>
            `;

            movieCard.appendChild(movieLink);
            movieGrid.appendChild(movieCard);
        });

        // تحديث قسم الفيلم المميز (أول فيلم أو الذي id=1)
        const featuredMovie = moviesData.find(m => m.id === 1) || moviesData[0];
        if (featuredMovie) {
            // heroSection.style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%), url('${featuredMovie.poster}')`;
            heroSection.querySelector('h2').textContent = featuredMovie.title;
            heroSection.querySelector('p').textContent = featuredMovie.description.substring(0, 150) + '...'; // Snippet for hero section
            // **ربط زر البطل (Hero Button) برابط Adsterra المباشر**
            heroBtn.href = adsterraDirectLink;
            heroBtn.target = "_blank"; // لفتح الرابط في علامة تبويب جديدة
            // لا نستخدم heroBtn.dataset.id هنا لأننا نوجه إلى إعلان مباشر وليس صفحة فيلم
        }

        // SEO IMPROVEMENT: Revert meta tags to original home page values
        updateMetaTags(originalTitle, originalDescription, originalOgImage, originalOgUrl, 'website');
        // SEO IMPROVEMENT: Remove any specific movie schema
        addJsonLdSchema(null);

        // Render pagination controls after movies are displayed
        renderPaginationControls();
    }

    // NEW FUNCTION: Display Suggested Movies
    function displaySuggestedMovies(currentMovieId) {
        if (!suggestedMovieGrid) return;

        suggestedMovieGrid.innerHTML = ''; // Clear previous suggested movies

        // Filter out the current movie
        const availableMovies = moviesData.filter(movie => movie.id !== currentMovieId);

        // Shuffle the available movies (Fisher-Yates shuffle)
        for (let i = availableMovies.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableMovies[i], availableMovies[j]] = [availableMovies[j], availableMovies[i]];
        }

        // Take up to 6 suggested movies
        const moviesToSuggest = availableMovies.slice(0, 6); // You can change this number

        moviesToSuggest.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card'); // Use movie-card class for consistency
            movieCard.setAttribute('role', 'listitem');

            const movieLink = document.createElement('a');
            movieLink.href = `?id=${movie.id}`;
            movieLink.dataset.id = movie.id;

            movieLink.innerHTML = `
                <img loading="lazy" src="${movie.poster}" alt="بوستر فيلم ${movie.title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/260x380?text=Image+Not+Found';">
                <h3>${movie.title}</h3>
            `;
            movieCard.appendChild(movieLink);
            suggestedMovieGrid.appendChild(movieCard);
        });
    }

    // عرض تفاصيل الفيلم
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
            movieDescriptionElem.textContent = movie.description; // تحديث وصف الفيلم

            // عرض مشغل الفيديو
            moviePlayerContainer.innerHTML = `<iframe src="${movie.embed_url}" frameborder="0" allowfullscreen allow="encrypted-media" referrerpolicy="origin" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"></iframe>`;

            // **إضافة الغطاء الشفاف (Video Overlay) لفتح إعلانات Adsterra**
            const videoOverlay = document.createElement('div');
            videoOverlay.classList.add('video-overlay'); // إضافة الكلاس لتطبيق الأنماط
            moviePlayerContainer.appendChild(videoOverlay);

            // إضافة Event Listener للغطاء لفتح الرابط المباشر
            videoOverlay.addEventListener('click', () => {
                window.open(adsterraDirectLink, '_blank'); // فتح الرابط في علامة تبويب جديدة
            });

            // NEW: Display suggested movies
            displaySuggestedMovies(movie.id);

            // SEO Improvement: Update meta tags for specific movie page
            const moviePageUrl = `${window.location.origin}${window.location.pathname}?id=${movie.id}`;
            updateMetaTags(
                `${movie.title} - شاهد بلس`,
                movie.description, // Use full description for meta tag
                movie.poster,
                moviePageUrl,
                'video.movie' // Specific OG type for movies
            );

            // Add JSON-LD schema for this movie
            addJsonLdSchema(movie);

        } else {
            // إذا لم يتم العثور على الفيلم، العودة للصفحة الرئيسية
            console.warn('Movie not found for ID:', id);
            displayMovies();
            updateUrl(); // Clean up URL
        }
    }

    // Handle clicks on movie cards and hero button
    document.addEventListener('click', (e) => {
        const movieLink = e.target.closest('.movie-card a'); // لبطاقات الأفلام
        const heroButton = e.target.closest('#hero-btn'); // لزر Hero

        if (heroButton) {
            // إذا كان الضغط على زر Hero، يجب أن يفتح الرابط المباشر فقط
            // الرابط المباشر لـ Adsterra مضبوط مباشرة في الـ href في دالة displayMovies
            // والتفاصيل الأخرى مضبوطة في HTML
            return; 
        }

        if (movieLink && movieLink.dataset.id) {
            e.preventDefault(); // منع سلوك الرابط الافتراضي

            // **افتح رابط Adsterra أولاً إذا لم يتم فتحه من قبل**
            if (!adsterraOpenedOnFirstClick) {
                window.open(adsterraDirectLink, '_blank');
                adsterraOpenedOnFirstClick = true; // تعيين العلامة إلى صحيح بعد الفتح
            }
            
            const movieId = movieLink.dataset.id;
            displayMovieDetails(movieId);
            updateUrl(movieId); // تحديث URL مع معرف الفيلم
            window.scrollTo({ top: 0, behavior: 'smooth' }); // التمرير لأعلى الصفحة
        }
    });

    // Handle back button click
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            displayMovies();
            updateUrl(); // Revert URL to home page
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        });
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const pageNumber = urlParams.get('page');

        if (movieId) {
            displayMovieDetails(movieId);
        } else if (pageNumber) {
            currentPage = parseInt(pageNumber);
            displayMovies();
        }
        else {
            displayMovies();
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
        } else if (pageNumber) {
            currentPage = parseInt(pageNumber);
            displayMovies();
        } else {
            displayMovies();
        }
    }

    // Call init when DOM is fully loaded
    init();

});
