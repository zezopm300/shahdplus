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

    // Element for the transparent overlay above the video player
    // This element will be created dynamically and re-attached each time a movie detail page is opened
    let videoOverlay = null;

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
            "embed_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", // مثال لرابط YouTube صالح
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
            "embed_url": "https://player.vimeo.com/video/1091276533", // هذا رابط Vimeo جيد ويعمل عادة
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
            "embed_url": "https://vide0.net/e/smo8970rj5gh", // هذا الرابط سيسبب مشاكل - يجب استبداله!
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
            "embed_url": "https://www.youtube.com/embed/YOUR_YOUTUBE_VIDEO_ID_HERE" // مثال على رابط YouTube
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
            "embed_url": "https://streamtape.com/e/7kbx78RR8VtAXD1/", // هذا الرابط سيسبب مشاكل - يجب استبداله!
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
            "embed_url": "https://streamtape.com/e/7b7rqXvk7DT8Ap/", // هذا الرابط سيسبب مشاكل - يجب استبداله!
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
            "embed_url": "https://streamtape.com/e/KXbbjrOM6Lc080L/", // هذا الرابط سيسبب مشاكل - يجب استبداله!
            "rating": "7.8"
        },
        // هنا يمكنك إضافة المزيد من الأفلام يدويًا
    ];

    // Adsterra Configuration
    // استبدل هذا الرابط برابط الـ Direct Link الخاص بك من Adsterra
    const adsterraDirectLink = "https://www.profitableratecpm.com/spqbhmyax?key=2469b039d4e7c471764bd04c57824cf2";

    // أكواد الـ Pop-under/Direct Link من Adsterra (للتشغيل مرة واحدة عند أول تفاعل)
    const adsterraPopUnderScripts = [
        "//pl26877671.profitableratecpm.com/7f/c2/f9/7fc2f9f201b6ffe0f5e3ed54d7bae23c.js",
        "//pl26877663.profitableratecpm.com/75/c8/81/75c8819f64c2df144a5ddf1eabd34e6f.js"
    ];

    // Flag to track if Pop-under has been opened in the current session
    let popUnderAlreadyOpenedInSession = false;
    let userInteracted = false;

    // Pagination state variables
    let currentPage = 1;
    const moviesPerPage = 8; // عدد الأفلام في كل صفحة (تم التعديل لـ 8 بدلاً من 40 لتحسين العرض المبدئي)
    let totalPages; // Will be calculated dynamically in init

    // --- Core Functions ---

    /**
     * Handles the first user interaction on the page to trigger Adsterra Pop-under.
     * This ensures ads don't open immediately on page load, improving user experience.
     */
    function handleFirstUserInteraction() {
        if (!userInteracted) {
            openAdsterraPopUnder();
            userInteracted = true;
            // Remove listeners after first interaction to prevent multiple pop-unders
            document.removeEventListener('click', handleFirstUserInteraction);
            document.removeEventListener('scroll', handleFirstUserInteraction);
            document.removeEventListener('keydown', handleFirstUserInteraction);
        }
    }

    /**
     * Dynamically loads Adsterra Pop-under scripts.
     * This function is designed to be called only once per user session.
     */
    function openAdsterraPopUnder() {
        if (!popUnderAlreadyOpenedInSession) {
            adsterraPopUnderScripts.forEach(scriptUrl => {
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = scriptUrl;
                script.async = true;
                document.body.appendChild(script);
            });
            popUnderAlreadyOpenedInSession = true;
        }
    }

    // Attach first interaction listeners
    document.addEventListener('click', handleFirstUserInteraction, { once: true });
    document.addEventListener('scroll', handleFirstUserInteraction, { once: true });
    document.addEventListener('keydown', handleFirstUserInteraction, { once: true });

    /**
     * Helper Function: Update Meta Tags for SEO and Social Sharing
     * @param {string} title - The page title.
     * @param {string} description - The page description.
     * @param {string} imageUrl - URL of the image for social sharing.
     * @param {string} pageUrl - Canonical URL of the page.
     * @param {string} [ogType='website'] - Open Graph type (e.g., 'website', 'video.movie').
     */
    function updateMetaTags(title, description, imageUrl, pageUrl, ogType = 'website') {
        document.title = title;

        const setMetaContent = (selector, attribute, content) => {
            let element = document.querySelector(selector);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute.startsWith('og:') ? 'property' : 'name', attribute);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        setMetaContent('meta[name="description"]', 'description', description);
        setMetaContent('meta[property="og:title"]', 'og:title', title);
        setMetaContent('meta[property="og:description"]', 'og:description', description);
        setMetaContent('meta[property="og:image"]', 'og:image', imageUrl || originalOgImage);
        setMetaContent('meta[property="og:url"]', 'og:url', pageUrl || originalOgUrl);
        setMetaContent('meta[property="og:type"]', 'og:type', ogType);

        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.rel = 'canonical';
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.href = pageUrl || window.location.origin + window.location.pathname;
    }

    /**
     * Helper Function: Add or Remove JSON-LD Schema Markup for Movies.
     * @param {object|null} movieData - The movie data object, or null to remove schema.
     */
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
                "trailer": { // Using main embed_url as trailer for simplicity
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
                "url": window.location.href // This URL should ideally point to the specific movie's permalink
            };

            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = 'movie-schema-ld';
            script.textContent = JSON.stringify(schema);
            document.head.appendChild(script);
        }
    }

    /**
     * Helper function to scroll to an element with a smooth behavior.
     * @param {HTMLElement} element - The DOM element to scroll to.
     * @param {number} delay - Delay in milliseconds before scrolling.
     */
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

    /**
     * Updates the browser's URL using pushState for better navigation and SEO.
     * @param {number|null} id - Movie ID if navigating to a movie details page.
     * @param {number|null} page - Page number if navigating to a paginated list.
     */
    function updateUrl(id = null, page = null) {
        const currentPath = window.location.pathname;
        let newUrl = currentPath;
        const params = new URLSearchParams();

        if (id) {
            params.set('id', id);
        }
        // Only add page param if it's greater than 1 AND not viewing a specific movie
        if (page && page > 1 && !id) {
            params.set('page', page);
        }

        const queryString = params.toString();
        if (queryString) {
            newUrl += `?${queryString}`;
        }

        // Only push state if the URL actually changes
        if (window.location.search !== `?${queryString}` || (!queryString && window.location.search !== '')) {
            history.pushState({ movieId: id, pageNumber: page }, null, newUrl);
        }
    }

    /**
     * Renders the pagination controls (Previous, Next buttons and page info).
     */
    function renderPaginationControls() {
        if (!paginationControls || !prevPageBtn || !nextPageBtn || !pageInfoSpan) return;

        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
        pageInfoSpan.textContent = `صفحة ${currentPage} من ${totalPages}`;
    }

    /**
     * Displays the main list of movies based on the current page.
     */
    function displayMovies() {
        if (!movieDetailsSection || !moviesListSection || !heroSection || !movieGrid || !paginationControls || !heroBtn) {
            console.error("Critical DOM elements for homepage are missing. Cannot display movies.");
            return;
        }

        movieDetailsSection.style.display = 'none';
        moviesListSection.style.display = 'block';
        heroSection.style.display = 'block'; // Ensure hero section is visible on homepage
        paginationControls.style.display = 'flex';

        movieGrid.innerHTML = ''; // Clear existing movie cards

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

        // Update meta tags for homepage
        updateMetaTags(originalTitle, originalDescription, originalOgImage, originalOgUrl, 'website');
        addJsonLdSchema(null); // Remove movie specific schema on homepage

        renderPaginationControls();
        scrollToElement(moviesListSection, 0); // Scroll to movies list when displaying them
    }

    /**
     * Displays the detailed view of a single movie.
     * @param {number} movieId - The ID of the movie to display.
     */
    function displayMovieDetails(movieId) {
        if (!movieDetailsSection || !moviesListSection || !heroSection || !paginationControls || !movieTitleElem || !movieDirectorElem || !movieStarsElem || !movieCategoryElem || !movieYearElem || !movieDescriptionElem || !moviePlayerContainer) {
            console.error("Critical DOM elements for movie details are missing. Cannot display movie details.");
            return;
        }

        const movie = moviesData.find(m => m.id == movieId);

        if (movie) {
            movieTitleElem.textContent = movie.title;
            movieDirectorElem.textContent = movie.director;
            movieStarsElem.textContent = Array.isArray(movie.stars) ? movie.stars.join(', ') : movie.stars;
            movieCategoryElem.textContent = movie.category;
            movieYearElem.textContent = movie.year;
            movieDescriptionElem.textContent = movie.description;

            // Clear previous iframe and create a new one
            moviePlayerContainer.innerHTML = ''; // Clear existing content
            const iframe = document.createElement('iframe');
            iframe.src = movie.embed_url;
            iframe.allowFullscreen = true;
            // Add important attributes for smooth playback and security
            iframe.setAttribute('allow', "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
            iframe.setAttribute('referrerpolicy', "no-referrer"); // Improved security and prevents some redirects

            // Add an error handler for the iframe
            iframe.onerror = () => {
                console.error(`خطأ في تحميل الفيديو: ${movie.title}. قد يكون الرابط غير صالح أو محظورًا من قبل المتصفح.`);
                moviePlayerContainer.innerHTML = '<p style="color: red; text-align: center;">عذرًا، حدث خطأ أثناء تحميل الفيديو. يرجى المحاولة لاحقًا أو التواصل مع الدعم.</p>';
            };

            // Set a timeout to remove focus from the iframe after it loads
            // This can prevent some immediate pop-ups on certain embed types by not giving them initial focus
            iframe.onload = () => {
                setTimeout(() => {
                    if (document.activeElement === iframe) {
                        iframe.blur(); // Remove focus
                    }
                }, 100);
            };

            moviePlayerContainer.appendChild(iframe);

            // Create and append the transparent video overlay
            // This is crucial for capturing the first click for Adsterra Direct Link
            videoOverlay = document.createElement('div');
            videoOverlay.classList.add('video-overlay');
            videoOverlay.style.display = 'block'; // Ensure it's visible initially
            // Reset clicked state if returning to same movie
            videoOverlay.classList.remove('clicked');
            // The click listener is added here with `{ once: true }` to ensure it only fires once per video view
            videoOverlay.addEventListener('click', handleVideoOverlayClick, { once: true });
            moviePlayerContainer.appendChild(videoOverlay);

            // Generate Suggested Movies
            const suggestedMovies = moviesData
                .filter(m => m.id !== movie.id)
                .sort(() => 0.5 - Math.random()) // Randomize order
                .slice(0, 4); // Get 4 random suggestions

            if (suggestedMovieGrid) {
                suggestedMovieGrid.innerHTML = '';
                suggestedMovies.forEach(suggestedMovie => {
                    const suggestedCard = document.createElement('div');
                    suggestedCard.classList.add('movie-card');
                    suggestedCard.setAttribute('role', 'listitem');

                    const suggestedLink = document.createElement('a');
                    suggestedLink.dataset.id = suggestedMovie.id;
                    suggestedLink.title = `شاهد فيلم ${suggestedMovie.title}`;
                    suggestedLink.setAttribute('aria-label', `شاهد فيلم ${suggestedMovie.title}`);

                    suggestedLink.innerHTML = `
                        <img loading="lazy" src="${suggestedMovie.poster}" alt="بوستر فيلم ${suggestedMovie.title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/260x380?text=Image+Not+Found';">
                        <h3>${suggestedMovie.title}</h3>
                    `;
                    suggestedCard.appendChild(suggestedLink);
                    suggestedMovieGrid.appendChild(suggestedCard);
                });
            }

            // Show movie details section and hide others
            movieDetailsSection.style.display = 'block';
            moviesListSection.style.display = 'none';
            heroSection.style.display = 'none';
            paginationControls.style.display = 'none';

            // Update meta tags for movie details page
            const movieUrl = window.location.origin + window.location.pathname + `?id=${movie.id}`;
            updateMetaTags(movie.title + " - شاهد بلس", movie.description, movie.poster, movieUrl, 'video.movie');
            addJsonLdSchema(movie); // Add movie specific schema

            scrollToElement(movieDetailsSection, 0); // Scroll to movie details when displayed
            updateUrl(movie.id);

        } else {
            console.error('Movie not found:', movieId);
            // Fallback to home if movie not found
            displayMovies();
            updateUrl();
        }
    }

    /**
     * Handles the click event on the transparent video overlay.
     * Opens the Adsterra Direct Link and then disables the overlay.
     */
    function handleVideoOverlayClick() {
        // 1. Open Adsterra Direct Link in a new tab
        window.open(adsterraDirectLink, '_blank');

        // 2. Hide or disable the transparent overlay after the first click
        // Add 'clicked' class to video-overlay to apply CSS (opacity: 0; pointer-events: none;)
        if (videoOverlay) {
            videoOverlay.classList.add('clicked');
        }
    }


    // --- Event Listeners ---

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

    // Event Delegation for Movie Cards (both main and suggested grids)
    document.addEventListener('click', (event) => {
        const movieCardLink = event.target.closest('.movie-card a');
        if (movieCardLink && movieCardLink.dataset.id) {
            event.preventDefault();
            displayMovieDetails(movieCardLink.dataset.id);
        }
    });

    // Event Listener for "Back to Home" Button
    if (backBtn) {
        backBtn.addEventListener('click', (event) => {
            event.preventDefault();
            displayMovies();
            updateUrl();
        });
    }

    // Event Listener for Hero Section Button (Scroll to movies list)
    if (heroBtn) {
        heroBtn.addEventListener('click', (event) => {
            event.preventDefault();
            scrollToElement(moviesListSection);
        });
    }

    // Pagination Event Listeners
    if (prevPageBtn && nextPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayMovies();
                updateUrl(null, currentPage);
            }
        });

        nextPageBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayMovies();
                updateUrl(null, currentPage);
            }
        });
    }

    // Handle Browser Back/Forward Buttons
    window.addEventListener('popstate', (event) => {
        const state = event.state;
        if (state && state.movieId) {
            displayMovieDetails(state.movieId);
        } else if (state && state.pageNumber) {
            currentPage = state.pageNumber;
            displayMovies();
        } else {
            // Default to homepage if no specific state or if a direct link to root was accessed
            displayMovies();
            updateUrl(); // Ensure URL reflects home state without params
        }
    });

    /**
     * Dynamically loads Adsterra banner ad scripts.
     * @param {string} containerId - The ID of the HTML element where the ad will be placed.
     * @param {number} placementId - The Adsterra Placement ID for the banner unit.
     *
     * **IMPORTANT:** Replace placeholder `placementId` values with your actual Adsterra IDs.
     * Ensure these are "Banner" type units from your Adsterra dashboard.
     */
    function loadAdsterraBannerAd(containerId, placementId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = ''; // Clear any existing content in the container

            // Create script for Adsterra Placement ID
            const script1 = document.createElement('script');
            script1.type = 'text/javascript';
            script1.textContent = `var adsterra_placement_id = ${placementId};`;

            // Create script for Adsterra ad loading
            const script2 = document.createElement('script');
            script2.type = 'text/javascript';
            script2.src = '//pl2.adsterra.com/ads.js'; // Adsterra script source
            script2.async = true; // Load asynchronously

            // Append scripts to the container
            container.appendChild(script1);
            container.appendChild(script2);
        }
    }

    // --- Initialization ---

    function init() {
        totalPages = Math.ceil(moviesData.length / moviesPerPage);

        // Load Adsterra Banners on page load
        // Replace these placeholder IDs with your actual Adsterra Placement IDs!
        loadAdsterraBannerAd('ad-banner-hero', 12345); // Banner for Hero section (e.g., 728x90 or 468x60)
        loadAdsterraBannerAd('ad-banner-below-grid', 67890); // Banner below movie grid (e.g., 728x90 or 468x60)
        loadAdsterraBannerAd('ad-banner-below-player', 54321); // Banner below video player (e.g., 728x90 or 468x60)
        loadAdsterraBannerAd('ad-banner-below-suggested', 98765); // Banner below suggested movies (e.g., 728x90 or 468x60)

        // Parse URL parameters to determine initial view
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const pageNum = parseInt(urlParams.get('page'));

        if (movieId) {
            displayMovieDetails(movieId);
        } else if (pageNum && pageNum > 1 && pageNum <= totalPages) {
            currentPage = pageNum;
            displayMovies();
        } else {
            displayMovies();
        }
    }

    // Run the initialization
    init();
});
