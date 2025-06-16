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
                "trailer": { // Consider if you truly have a trailer or if this is just using the main embed_url
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

        // Only push state if the URL actually changes
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

        // Update meta tags for homepage
        updateMetaTags(originalTitle, originalDescription, originalOgImage, originalOgUrl, 'website');
        addJsonLdSchema(null); // Remove movie specific schema on homepage

        renderPaginationControls();
        scrollToElement(moviesListSection, 0); // Scroll to movies list when displaying them
    }

    // Display single movie details
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
            iframe.allow = "autoplay; fullscreen; picture-in-picture";
            iframe.referrerPolicy = "no-referrer"; // هذا هو التعديل الجديد

            // Add an error handler for the iframe (basic)
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

    // Event Listener for Hero Section Button
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
            displayMovies();
            updateUrl(); // Ensure URL reflects home state without params
        }
    });

    // Initialization Function
    function init() {
        totalPages = Math.ceil(moviesData.length / moviesPerPage);

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
