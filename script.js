document.addEventListener('DOMContentLoaded', async () => {
    console.log('🏁 DOM Content Loaded. Script execution started.');

    // --- 1. DOM Element References ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    // Using specific IDs for navbar links for robust targeting
    const homeNavLink = document.getElementById('nav-home-link');
    const moviesNavLink = document.getElementById('nav-movies-link');
    const navLinks = document.querySelectorAll('.main-nav ul li a'); // Still useful for general menu closing

    const heroSection = document.getElementById('hero-section');
    const watchNowBtn = document.getElementById('watch-now-btn');
    const movieGridSection = document.getElementById('movie-grid-section');
    const movieDetailsSection = document.getElementById('movie-details-section');
    const movieGrid = document.getElementById('movie-grid');
    const suggestedMovieGrid = document.getElementById('suggested-movie-grid');
    const suggestedMoviesSection = document.getElementById('suggested-movies-section');
    const backToHomeBtn = document.getElementById('back-to-home-btn');
    const moviePlayer = document.getElementById('movie-player'); // This is the iframe for video playback
    const videoOverlay = document.getElementById('video-overlay'); // Ad overlay
    const homeLogoLink = document.getElementById('home-logo-link');
    const videoLoadingSpinner = document.getElementById('video-loading-spinner');
    const movieDetailsPoster = document.getElementById('movie-details-poster');

    // Movie Details Specific Elements
    const movieDetailsTitle = document.getElementById('movie-details-title');
    const movieDetailsDescription = document.getElementById('movie-details-description');
    const movieDetailsReleaseDate = document.getElementById('movie-details-release-date');
    const movieDetailsGenre = document.getElementById('movie-details-genre');
    const movieDetailsDirector = document.getElementById('movie-details-director');
    const movieDetailsCast = document.getElementById('movie-details-cast');
    const movieDetailsDuration = document.getElementById('movie-details-duration');
    const movieDetailsRating = document.getElementById('movie-details-rating');


    // Pagination elements
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const moviesPerPage = 30;
    let currentPage = 1;

    // Search DOM Elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const sectionTitleElement = movieGridSection ? movieGridSection.querySelector('h2') : null;

    // --- 1.1. Critical DOM Element Verification (تأكيد وجود العناصر الضرورية) ---
    const requiredElements = {
        '#movie-grid': movieGrid,
        '#movie-grid-section': movieGridSection,
        '#movie-details-section': movieDetailsSection,
        '#hero-section': heroSection,
        '#movie-player': moviePlayer,
        '#video-overlay': videoOverlay,
        '#suggested-movie-grid': suggestedMovieGrid,
        '#suggested-movies-section': suggestedMoviesSection,
        '#video-loading-spinner': videoLoadingSpinner,
        '#movie-details-poster': movieDetailsPoster,
        // Add all critical details elements
        '#movie-details-title': movieDetailsTitle,
        '#movie-details-description': movieDetailsDescription,
        '#movie-details-release-date': movieDetailsReleaseDate,
        '#movie-details-genre': movieDetailsGenre,
        '#movie-details-director': movieDetailsDirector,
        '#movie-details-cast': movieDetailsCast,
        '#movie-details-duration': movieDetailsDuration,
        '#movie-details-rating': movieDetailsRating
    };

    let criticalError = false;
    for (const [id, element] of Object.entries(requiredElements)) {
        if (!element) {
            console.error(`❌ CRITICAL ERROR: Element with ID "${id}" not found. Please check your HTML.`);
            criticalError = true;
        }
    }
    if (criticalError) {
        console.error('🛑 Script will not execute fully due to missing critical DOM elements. Fix your HTML!');
        return; // توقف عن التنفيذ إذا كانت هناك أخطاء حرجة
    } else {
        console.log('✅ All critical DOM elements found.');
    }

    // --- 2. Adsterra Configuration (تم الاحتفاظ بها كما هي لعمل إعلانات الفيديو والبوستر) ---
    // هذه الأكواد لم يتم لمسها بناءً على طلبك
    const ADSTERRA_DIRECT_LINK_URL = 'https://www.profitableratecpm.com/spqbhmyax?key=2469b039d4e7c471764bd04c57824cf2';

    const DIRECT_LINK_COOLDOWN_MOVIE_CARD = 3 * 60 * 1000; // 3 minutes for movie cards and details poster
    const DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY = 4 * 1000; // 4 seconds for video overlay

    let lastDirectLinkClickTimeMovieCard = 0;
    let lastDirectLinkClickTimeVideoOverlay = 0;

    // --- 3. Movie Data (سيتم تحميلها الآن من ملف JSON) ---
    let moviesData = []; // متغير لتخزين البيانات التي سيتم جلبها
    let moviesDataForPagination = []; // سيتم ترتيب هذه المصفوفة عشوائيًا عند تحميل الصفحة وفي كل مرة نعود فيها للصفحة الرئيسية

    // --- جلب بيانات الأفلام من ملف JSON في بداية التحميل ---
    try {
        console.log('📡 [Data Load] Attempting to fetch movie data from movies.json...');
        const response = await fetch('movies.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        moviesData = await response.json();
        console.log('✅ [Data Load] Movie data loaded successfully from movies.json', moviesData.length, 'movies found.');

        if (moviesData.length === 0) {
            console.warn('⚠️ No movie data found in movies.json. Displaying empty grid.');
            // يمكنك هنا عرض رسالة للمستخدم بأنه لا توجد بيانات لعرضها
        }
    } catch (error) {
        console.error('❌ [Data Load] Error loading movie data from movies.json:', error);
        alert('حدث خطأ أثناء تحميل بيانات الأفلام. يرجى المحاولة لاحقًا.');
        return; // توقف عن تنفيذ بقية السكربت إذا فشل تحميل البيانات بشكل حرج
    }

    // --- 4. Functions ---

    function openAdLink(cooldownDuration, type) {
        let lastClickTime;
        let setLastClickTime;

        if (type === 'movieCard') {
            lastClickTime = lastDirectLinkClickTimeMovieCard;
            setLastClickTime = (time) => lastDirectLinkClickTimeMovieCard = time;
        } else if (type === 'videoOverlay') {
            lastClickTime = lastDirectLinkClickTimeVideoOverlay;
            setLastClickTime = (time) => lastDirectLinkClickTimeVideoOverlay = time;
        } else if (type === 'movieDetailsPoster') {
            lastClickTime = lastDirectLinkClickTimeMovieCard; // Use same cooldown as movieCard
            setLastClickTime = (time) => lastDirectLinkClickTimeMovieCard = time;
        } else {
            console.error('Invalid ad type provided for openAdLink:', type);
            return false;
        }

        const currentTime = Date.now();
        if (currentTime - lastClickTime > cooldownDuration) {
            const newWindow = window.open(ADSTERRA_DIRECT_LINK_URL, '_blank');
            if (newWindow) {
                newWindow.focus();
                setLastClickTime(currentTime);
                console.log(`💰 [Ad Click - ${type}] Direct Link opened successfully.`);
                return true;
            } else {
                console.warn(`⚠️ [Ad Click - ${type}] Pop-up blocked or failed to open direct link. Ensure pop-ups are allowed.`);
                return false;
            }
        } else {
            const timeLeft = (cooldownDuration - (currentTime - lastClickTime)) / 1000;
            console.log(`⏳ [Ad Click - ${type}] Direct Link cooldown active. Not opening new tab. Time remaining: ${timeLeft.toFixed(1)}s`);
            return false;
        }
    }

    function createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <img data-src="${movie.poster}" alt="${movie.title}" class="lazyload">
            <h3>${movie.title}</h3>
        `;
        movieCard.addEventListener('click', () => {
            console.log(`⚡ [Interaction] Movie card clicked for ID: ${movie.id}`);
            openAdLink(DIRECT_LINK_COOLDOWN_MOVIE_CARD, 'movieCard');
            showMovieDetails(movie.id);
        });
        return movieCard;
    }

    // --- Enhanced Lazy Loading for images and iframes ---
    function initializeLazyLoad() {
        if ('IntersectionObserver' in window) {
            // استهدف فقط العناصر التي لم يتم تحميلها بعد
            let lazyLoadElements = document.querySelectorAll('.lazyload:not([src]):not([data-src=""])');
            let observerOptions = {
                root: null, // viewport
                rootMargin: '0px',
                threshold: 0.01 // Load iframes and images very early (1% visible)
            };

            let elementObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        let element = entry.target;
                        if (element.tagName === 'IMG') {
                            element.src = element.dataset.src;
                            console.log(`🖼️ [Lazy Load] Image loaded: ${element.src}`);
                        } else if (element.tagName === 'IFRAME') {
                            element.src = element.dataset.src;
                            // Ensure all critical iframe attributes are set here too
                            element.setAttribute('allowfullscreen', '');
                            // Re-evaluated sandbox for VK/video players:
                            // These permissions are generally needed for full functionality (fullscreen, scripts, popups by player)
                            // 'allow-top-navigation' is crucial for some fullscreen implementations that change the top window URL, use with caution.
                            element.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock allow-presentation allow-top-navigation');
                            element.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
                            element.setAttribute('title', `Video player for ${element.alt || element.getAttribute('title') || 'movie'}`); // Use title if available, fallback to alt
                            // Try to autoplay muted to ensure video loading starts
                            element.setAttribute('autoplay', '1');
                            element.setAttribute('muted', '1');
                            // **تحسين جديد: إضافة loading="eager" للتحميل السريع بعد ظهور الـ iframe**
                            element.setAttribute('loading', 'eager');
                            console.log(`🎥 [Lazy Load] Iframe loaded: ${element.src} with autoplay/muted and eager loading.`);
                        }
                        element.classList.remove('lazyload');
                        observer.unobserve(element);
                    }
                });
            }, observerOptions);

            lazyLoadElements.forEach(function(element) {
                elementObserver.observe(element);
            });
            console.log('🖼️ [Lazy Load] Initialized IntersectionObserver for images and iframes.');
        } else {
            // Fallback for browsers without IntersectionObserver
            let lazyLoadElements = document.querySelectorAll('.lazyload:not([src]):not([data-src=""])');
            lazyLoadElements.forEach(function(element) {
                if (element.tagName === 'IMG') {
                    element.src = element.dataset.src;
                } else if (element.tagName === 'IFRAME') {
                    element.src = element.dataset.src;
                    element.setAttribute('allowfullscreen', '');
                    element.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock allow-presentation allow-top-navigation');
                    element.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
                    element.setAttribute('title', `Video player for ${element.alt || element.getAttribute('title') || 'movie'}`);
                    element.setAttribute('autoplay', '1');
                    element.setAttribute('muted', '1');
                    // **تحسين جديد: إضافة loading="eager" للتحميل السريع بعد ظهور الـ iframe**
                    element.setAttribute('loading', 'eager');
                }
                element.classList.remove('lazyload');
            });
            console.log('🖼️ [Lazy Load] Fallback lazy load executed for images and iframes (no IntersectionObserver).');
        }
    }

    function displayMovies(moviesToDisplay, targetGridElement) {
        if (!targetGridElement) {
            console.error('❌ displayMovies: Target grid element is null or undefined.');
            return;
        }
        targetGridElement.innerHTML = '';

        if (moviesToDisplay.length === 0) {
            targetGridElement.innerHTML = '<p style="text-align: center; color: var(--text-muted);">لا توجد أفلام مطابقة للبحث أو مقترحة.</p>';
            console.log(`🎬 [Display] No movies to display in ${targetGridElement.id}.`);
            return;
        }

        moviesToDisplay.forEach(movie => {
            targetGridElement.appendChild(createMovieCard(movie));
        });
        console.log(`🎬 [Display] Displayed ${moviesToDisplay.length} movies in ${targetGridElement.id}.`);

        initializeLazyLoad(); // Initialize lazy load after elements are added to DOM
    }

    function paginateMovies(moviesArray, page) {
        const startIndex = (page - 1) * moviesPerPage;
        const endIndex = startIndex + moviesPerPage;
        const paginatedMovies = moviesArray.slice(startIndex, endIndex);

        displayMovies(paginatedMovies, movieGrid);
        updatePaginationButtons(moviesArray.length);
        console.log(`➡️ [Pagination] Displaying page ${page}. Movies from index ${startIndex} to ${Math.min(endIndex, moviesArray.length)-1}.`);
    }

    function updatePaginationButtons(totalMovies) {
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = currentPage * moviesPerPage >= totalMovies;
        console.log(`🔄 [Pagination] Buttons updated. Current page: ${currentPage}, Total Movies: ${totalMovies}`);
    }

    function performSearch() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        let filteredMovies = [];
        if (query) {
            filteredMovies = moviesData.filter(movie =>
                movie.title.toLowerCase().includes(query) ||
                (movie.director && movie.director.toLowerCase().includes(query)) ||
                (Array.isArray(movie.cast) ? movie.cast.some(actor => actor.toLowerCase().includes(query)) : (movie.cast && movie.cast.toLowerCase().includes(query))) ||
                (movie.genre && movie.genre.toLowerCase().includes(query))
            );
            if (sectionTitleElement) {
                sectionTitleElement.textContent = `نتائج البحث عن "${query}"`;
            }
            console.log(`🔍 [Search] Performed search for "${query}". Found ${filteredMovies.length} results.`);
        } else {
            filteredMovies = [...moviesData].sort(() => 0.5 - Math.random());
            if (sectionTitleElement) {
                sectionTitleElement.textContent = 'أحدث الأفلام';
            }
            console.log('🔍 [Search] Search query empty, showing all movies (randomized).');
        }
        currentPage = 1;
        moviesDataForPagination = filteredMovies;
        paginateMovies(moviesDataForPagination, currentPage);
    }

    function showMovieDetails(movieId) {
        console.log(`🔍 [Routing] Showing movie details for ID: ${movieId}`);
        const movie = moviesData.find(m => m.id === movieId);

        if (movie) {
            if (heroSection) heroSection.style.display = 'none';
            if (movieGridSection) movieGridSection.style.display = 'none';

            if (movieDetailsSection) movieDetailsSection.style.display = 'block';
            if (suggestedMoviesSection) suggestedMoviesSection.style.display = 'block';

            window.scrollTo({ top: 0, behavior: 'smooth' });
            console.log('[Routing] Scrolled to top.');

            movieDetailsTitle.textContent = movie.title;
            movieDetailsDescription.textContent = movie.description;
            const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير متوفر';
            movieDetailsReleaseDate.textContent = releaseDate;

            movieDetailsGenre.textContent = movie.genre || 'غير محدد';
            movieDetailsDirector.textContent = movie.director || 'غير متوفر';
            movieDetailsCast.textContent = Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || 'غير متوفر';
            movieDetailsDuration.textContent = movie.duration || 'غير متوفر';
            movieDetailsRating.textContent = movie.rating || 'N/A';

            if (movieDetailsPoster) {
                movieDetailsPoster.src = movie.poster;
                movieDetailsPoster.alt = movie.title;
                console.log(`[Details] Poster set for ${movie.title}`);
            }

            if (moviePlayer) {
                // **مهم: إعادة تعيين معالجات الأحداث لمنع التراكم**
                moviePlayer.onload = null;
                moviePlayer.onerror = null;

                moviePlayer.src = '';
                moviePlayer.removeAttribute('src');
                moviePlayer.removeAttribute('data-src'); // Ensure data-src is also reset

                // Set iframe properties for the video player
                moviePlayer.setAttribute('allowfullscreen', '');
                // Comprehensive sandbox permissions for VK player stability
                // 'allow-top-navigation' is included for robust fullscreen, but be aware of its implications.
                moviePlayer.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock allow-presentation allow-top-navigation');
                moviePlayer.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
                moviePlayer.setAttribute('title', `Video player for ${movie.title}`);
                // Try to autoplay muted to ensure video loading starts immediately
                moviePlayer.setAttribute('autoplay', '1');
                moviePlayer.setAttribute('muted', '1');
                // **التحسين الجديد: إخبار المتصفح بأن هذا الـ iframe يحتاج إلى تحميل سريع**
                moviePlayer.setAttribute('loading', 'eager');


                // Set data-src for lazy loading and add lazyload class
                moviePlayer.setAttribute('data-src', movie.embed_url);
                moviePlayer.classList.add('lazyload');

                if (videoLoadingSpinner) {
                    videoLoadingSpinner.style.display = 'block';
                    console.log('[Video Player] Loading spinner shown.');
                }

                // Re-initialize lazy load specifically for the video player iframe
                // This ensures the IntersectionObserver starts observing the iframe immediately.
                initializeLazyLoad(); // هذا سيقوم بتعيين moviePlayer.src من data-src

                // Onload/onerror handlers will now fire when the iframe loads its src from lazyload
                moviePlayer.onload = () => {
                    if (videoLoadingSpinner) {
                        videoLoadingSpinner.style.display = 'none';
                        console.log('[Video Player] Loading spinner hidden (iframe loaded).');
                    }
                    if (videoOverlay) {
                        videoOverlay.classList.remove('inactive');
                        videoOverlay.style.pointerEvents = 'auto'; // Re-enable clicks
                        console.log('[Video Overlay] Active and clickable after video loaded.');
                    }
                };
                moviePlayer.onerror = () => {
                    if (videoLoadingSpinner) {
                        videoLoadingSpinner.style.display = 'none';
                        console.warn('[Video Player] Iframe failed to load. Spinner hidden.');
                    }
                    if (videoOverlay) {
                        videoOverlay.classList.remove('inactive');
                        videoOverlay.style.pointerEvents = 'auto'; // Re-enable clicks
                        console.log('[Video Overlay] Active even after iframe load error.');
                    }
                };
            }

            const newUrl = new URL(window.location.origin);
            newUrl.searchParams.set('view', 'details');
            newUrl.searchParams.set('id', movieId);
            history.pushState({ view: 'details', id: movieId }, movie.title, newUrl.toString());
            console.log(`🔗 [URL] URL updated to ${newUrl.toString()}`);

            updateMetaTags(movie);
            addJsonLdSchema(movie);
            displaySuggestedMovies(movieId);
            console.log(`✨ [Suggestions] Calling displaySuggestedMovies for ID: ${movieId}`);

        } else {
            console.error('❌ [Routing] Movie not found for ID:', movieId, 'Redirecting to home page.');
            showHomePage();
        }
    }

    function updateMetaTags(movie) {
        document.title = `${movie.title} - مشاهدة أونلاين`;
        document.querySelector('meta[name="description"]')?.setAttribute('content', movie.description);
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', movie.title);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', movie.description);
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', movie.poster);
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.href);
        document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'video.movie');
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', movie.title);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', movie.description);
        document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', movie.poster);
        // Canonical URL for SEO
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute('href', window.location.href.split('?')[0]); // Use base URL without query params for canonical
        console.log('📄 [SEO] Meta tags updated, including canonical.');
    }

    function addJsonLdSchema(movie) {
        let formattedUploadDate;
        if (movie.release_date) {
            try {
                const date = new Date(movie.release_date);
                if (!isNaN(date.getTime())) {
                    formattedUploadDate = date.toISOString();
                } else {
                    console.warn(`⚠️ Invalid date format for release_date: ${movie.release_date}. Using current date for uploadDate.`);
                    formattedUploadDate = new Date().toISOString();
                }
            } catch (e) {
                console.warn(`⚠️ Error parsing release_date: ${movie.release_date}. Using current date for uploadDate.`);
                formattedUploadDate = new Date().toISOString();
            }
        } else {
            formattedUploadDate = new Date().toISOString();
        }

        let schemaDuration = movie.duration;
        if (typeof movie.duration === 'string' && movie.duration.match(/(\d+)\s*(hour|hr|h)?\s*(\d+)?\s*(minute|min|m)?/i)) {
            const parts = movie.duration.match(/(\d+)\s*(hour|hr|h)?\s*(\d+)?\s*(minute|min|m)?/i);
            let hours = 0;
            let minutes = 0;
            if (parts[2] && parts[2].toLowerCase().startsWith('h')) {
                hours = parseInt(parts[1]);
                if (parts[3] && parts[4] && parts[4].toLowerCase().startsWith('m')) {
                    minutes = parseInt(parts[3]);
                }
            } else if (parts[2] && parts[2].toLowerCase().startsWith('m')) {
                minutes = parseInt(parts[1]);
            } else if (!parts[2] && parts[1]) {
                const num = parseInt(parts[1]);
                if (num >= 60) { // Assume if value is 60 or more without unit, it's minutes
                    hours = Math.floor(num / 60);
                    minutes = num % 60;
                } else { // Otherwise, assume it's minutes
                    minutes = num;
                }
            }
            if (hours > 0 || minutes > 0) {
                schemaDuration = `PT${hours ? hours + 'H' : ''}${minutes ? minutes + 'M' : ''}`;
            }
        }


        const schema = {
            "@context": "http://schema.org",
            "@type": "VideoObject", // Use VideoObject for individual videos
            "name": movie.title,
            "description": movie.description,
            "thumbnailUrl": movie.poster,
            "uploadDate": formattedUploadDate,
            "embedUrl": movie.embed_url,
            "duration": schemaDuration,
            "contentUrl": movie.embed_url, // For direct video file (if applicable)
            "interactionStatistic": { // Adding interaction statistic for SEO
                "@type": "InteractionCounter",
                "interactionType": "http://schema.org/WatchAction",
                "userInteractionCount": Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000 // Placeholder, ideally dynamic
            },
            "publisher": {
                "@type": "Organization",
                "name": "أفلام عربية", // Replace with your actual site name
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://yourwebsite.com/path/to/your/logo.png", // Replace with your actual logo URL
                    "width": 600,
                    "height": 60
                }
            },
            // Add Movie specific properties if it's a "Movie" rather than just a "VideoObject"
            // If you have a separate type for Movie, you can change @type to "Movie" here
            // And add properties like:
            // "director": { "@type": "Person", "name": movie.director.trim() },
            // "actor": movie.cast.map(actor => ({ "@type": "Person", "name": actor }))
            // For now, sticking with VideoObject as it covers embedded videos well.
        };

        // Add director, cast, genre, rating if they exist and are useful for VideoObject
        if (movie.director && typeof movie.director === 'string' && movie.director.trim() !== '') {
            schema.director = {
                "@type": "Person",
                "name": movie.director.trim()
            };
        }
        if (movie.cast) {
            const castArray = Array.isArray(movie.cast) ? movie.cast : String(movie.cast).split(',').map(s => s.trim()).filter(s => s !== '');
            if (castArray.length > 0) {
                schema.actor = castArray.map(actor => ({
                    "@type": "Person",
                    "name": actor
                }));
            }
        }
        if (movie.genre) {
            const genreArray = Array.isArray(movie.genre) ? movie.genre : String(movie.genre).split(',').map(s => s.trim()).filter(s => s !== '');
            if (genreArray.length > 0) {
                schema.genre = genreArray;
            }
        }
        if (movie.rating && typeof movie.rating === 'string' && movie.rating.includes('/')) {
            const ratingValue = parseFloat(movie.rating.split('/')[0]);
            if (!isNaN(ratingValue)) {
                schema.aggregateRating = {
                    "@type": "AggregateRating",
                    "ratingValue": ratingValue.toFixed(1),
                    "bestRating": "10",
                    "ratingCount": "10000"
                };
            }
        }

        let oldScript = document.querySelector('script[type="application/ld+json"]');
        if (oldScript) {
            oldScript.remove();
            console.log('📄 [SEO] Old JSON-LD schema removed.');
        }

        let script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
        console.log('📄 [SEO] New JSON-LD schema added/updated.');
    }


    function displaySuggestedMovies(currentMovieId) {
        if (!suggestedMovieGrid) {
            console.error('❌ displaySuggestedMovies: suggestedMovieGrid element not found. Cannot display suggested movies.');
            return;
        }

        const otherMovies = moviesData.filter(movie => movie.id !== currentMovieId);
        const shuffled = otherMovies.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 15);

        if (selected.length === 0) {
            suggestedMovieGrid.innerHTML = '<p style="text-align: center; color: var(--text-muted);">لا توجد أفلام مقترحة حالياً.</p>';
            console.log('✨ [Suggestions] No suggested movies available after filtering.');
            return;
        }

        displayMovies(selected, suggestedMovieGrid);
        console.log(`✨ [Suggestions] Displayed ${selected.length} suggested movies in ${suggestedMovieGrid.id}.`);
    }

    function showHomePage() {
        console.log('🏠 [Routing] Showing home page.');
        if (movieDetailsSection) movieDetailsSection.style.display = 'none';
        if (suggestedMoviesSection) suggestedMoviesSection.style.display = 'none';

        if (heroSection) heroSection.style.display = 'flex';
        if (movieGridSection) movieGridSection.style.display = 'block';

        if (searchInput) searchInput.value = '';
        if (sectionTitleElement) sectionTitleElement.textContent = 'أحدث الأفلام';

        moviesDataForPagination = [...moviesData].sort(() => 0.5 - Math.random());
        paginateMovies(moviesDataForPagination, 1);

        if (videoOverlay) {
            videoOverlay.classList.add('inactive');
            videoOverlay.style.pointerEvents = 'none';
            console.log('[Video Overlay] Inactive on home page.');
        }
        if (videoLoadingSpinner) {
            videoLoadingSpinner.style.display = 'none';
        }
        if (moviePlayer) {
            // **مهم: إعادة تعيين معالجات الأحداث لمنع التراكم**
            moviePlayer.onload = null;
            moviePlayer.onerror = null;

            moviePlayer.src = '';
            moviePlayer.removeAttribute('src');
            moviePlayer.removeAttribute('data-src'); // Remove data-src as well
            moviePlayer.classList.remove('lazyload'); // Remove lazyload class
            // Reset iframe attributes when returning to homepage
            moviePlayer.removeAttribute('allowfullscreen');
            moviePlayer.removeAttribute('sandbox');
            moviePlayer.removeAttribute('referrerpolicy');
            moviePlayer.removeAttribute('title');
            moviePlayer.removeAttribute('autoplay');
            moviePlayer.removeAttribute('muted');
            // **إزالة سمة loading="eager" عند العودة للصفحة الرئيسية**
            moviePlayer.removeAttribute('loading');
        }

        const newUrl = new URL(window.location.origin);
        history.pushState({ view: 'home' }, 'أفلام عربية - الصفحة الرئيسية', newUrl.toString());
        console.log(`🔗 [URL] URL updated to ${newUrl.toString()}`);

        document.title = 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية.');
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين');
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أônلاين بجودة عالية.');
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.href);
        document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'website');
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين');
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية.');
        // Update canonical URL for home page
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute('href', window.location.origin);

        let script = document.querySelector('script[type="application/ld+json"]');
        if (script) {
            script.remove();
            console.log('📄 [SEO] JSON-LD schema removed on home page.');
        }
    }

    // --- 5. Event Listeners ---
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('nav-open');
            console.log('📱 [Interaction] Menu toggle clicked.');
        });
    }

    // New specific event listeners for Navbar links
    if (homeNavLink) {
        homeNavLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('[Interaction] Navbar Home link clicked.');
            showHomePage();
            if (mainNav && mainNav.classList.contains('nav-open')) {
                mainNav.classList.remove('nav-open');
            }
        });
    }

    if (moviesNavLink) { // Assuming 'أفلام' link has id="nav-movies-link"
        moviesNavLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('[Interaction] Navbar Movies link clicked.');
            showHomePage(); // 'أفلام' link often points to the main movie grid which is usually the homepage view
            // You might want to scroll to the movie grid section if it's below the fold on homepage
            // movieGridSection.scrollIntoView({ behavior: 'smooth' });
            if (mainNav && mainNav.classList.contains('nav-open')) {
                mainNav.classList.remove('nav-open');
            }
        });
    }

    // Still useful for closing menu for any other links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav && mainNav.classList.contains('nav-open')) {
                mainNav.classList.remove('nav-open');
                console.log('📱 [Interaction] Nav link clicked, menu closed.');
            }
        });
    });

    if (watchNowBtn && movieGridSection) {
        watchNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🎬 [Interaction] Watch Now button clicked.');
            movieGridSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', () => {
            console.log('🔙 [Interaction] Back to home button clicked.');
            showHomePage();
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
        console.log('🔍 [Event] Search button listener attached.');
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
                searchInput.blur();
            }
        });
        console.log('🔍 [Event] Search input keypress listener attached.');
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                paginateMovies(moviesDataForPagination, currentPage);
            }
            console.log(`⬅️ [Pagination] Previous page clicked. Current page: ${currentPage}`);
        });
    }
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(moviesDataForPagination.length / moviesPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                paginateMovies(moviesDataForPagination, currentPage);
            }
            console.log(`➡️ [Pagination] Next page clicked. Current page: ${currentPage}`);
        });
    }

    if (homeLogoLink) {
        homeLogoLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🏠 [Interaction] Home logo clicked.');
            showHomePage();
        });
    }

    if (movieDetailsPoster) {
        movieDetailsPoster.addEventListener('click', () => {
            console.log('🖼️ [Ad Click] Movie details poster clicked. Attempting to open Direct Link.');
            openAdLink(DIRECT_LINK_COOLDOWN_MOVIE_CARD, 'movieDetailsPoster');
        });
        console.log('[Event] Movie details poster click listener attached.');
    }

    if (videoOverlay) {
        videoOverlay.addEventListener('click', (e) => {
            // This is crucial to prevent the video from pausing.
            // It stops the click event from bubbling up to the iframe or its parent.
            e.stopPropagation();
            e.preventDefault(); // Also prevent default behavior for the overlay itself

            console.log('⏯️ [Ad Click] Video overlay clicked. Attempting to open Direct Link.');
            const adOpened = openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY, 'videoOverlay');

            if (adOpened) {
                // Temporarily disable clicks on the overlay if an ad was opened
                videoOverlay.style.pointerEvents = 'none';
                console.log(`[Video Overlay] Temporarily disabled clicks for ${DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY / 1000} seconds.`);
                setTimeout(() => {
                    videoOverlay.style.pointerEvents = 'auto';
                    console.log('[Video Overlay] Clicks re-enabled.');
                }, DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY);
            }
        });
        console.log('[Video Overlay] Click listener attached for ad interaction (with cooldown logic).');
    }

    // --- 6. Initial Page Load Logic (Routing) ---
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    const idParam = urlParams.get('id');

    if (viewParam === 'details' && idParam) {
        const movieId = parseInt(idParam);
        if (!isNaN(movieId)) {
            console.log(`🚀 [Initial Load] Attempting to load movie details from URL: ID ${movieId}`);
            showMovieDetails(movieId);
        } else {
            console.warn('⚠️ [Initial Load] Invalid movie ID in URL. Showing home page.');
            showHomePage();
        }
    } else {
        console.log('🚀 [Initial Load] No specific view in URL. Showing home page.');
        showHomePage();
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
        console.log('History popstate event triggered.', event.state);
        if (event.state && event.state.view === 'details' && event.state.id) {
            showMovieDetails(event.state.id);
        } else {
            showHomePage();
        }
    });
});
