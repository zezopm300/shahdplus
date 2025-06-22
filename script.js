document.addEventListener('DOMContentLoaded', async () => {
    console.log('🏁 DOM Content Loaded. Script execution started.');

    // --- 1. DOM Element References ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.main-nav ul li a');
    const heroSection = document.getElementById('hero-section');
    const watchNowBtn = document.getElementById('watch-now-btn');
    const movieGridSection = document.getElementById('movie-grid-section');
    const moviePlayerContainer = document.getElementById('movie-player-container');
    const movieDetailsSection = document.getElementById('movie-details-section');
    const movieGrid = document.getElementById('movie-grid');
    const suggestedMovieGrid = document.getElementById('suggested-movie-grid');
    const suggestedMoviesSection = document.getElementById('suggested-movies-section');
    const backToHomeBtn = document.getElementById('back-to-home-btn');
    const videoOverlay = document.getElementById('video-overlay');
    const homeLogoLink = document.getElementById('home-logo-link');
    const videoLoadingSpinner = document.getElementById('video-loading-spinner');
    const movieDetailsPoster = document.getElementById('movie-details-poster');

    const navMoviesLink = document.getElementById('nav-movies-link');

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
        '#movie-player-container': moviePlayerContainer,
        '#video-overlay': videoOverlay,
        '#suggested-movie-grid': suggestedMovieGrid,
        '#suggested-movies-section': suggestedMoviesSection,
        '#video-loading-spinner': videoLoadingSpinner,
        '#movie-details-poster': movieDetailsPoster,
        '#nav-movies-link': navMoviesLink
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
        return;
    } else {
        console.log('✅ All critical DOM elements found.');
    }

    // --- 2. Adsterra Configuration (تم الاحتفاظ بها كما هي لعمل إعلانات الفيديو والبوستر) ---
    const ADSTERRA_DIRECT_LINK_URL = 'https://www.profitableratecpm.com/spqbhmyax?key=2469b039d4e7c471764bd04c57824cf2';

    const DIRECT_LINK_COOLDOWN_MOVIE_CARD = 3 * 60 * 1000;
    const DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY = 4 * 1000;

    let lastDirectLinkClickTimeMovieCard = 0;
    let lastDirectLinkClickTimeVideoOverlay = 0;

    // --- 3. Movie Data (سيتم تحميلها الآن من ملف JSON) ---
    let moviesData = [];
    let moviesDataForPagination = []; // This array will hold the current set of movies to be paginated (e.g., all movies, or search results)
    let activeMoviePlayer = null; // Stores the currently active iframe for video playback
    let currentMoviePlayingId = null; // Stores the ID of the movie currently playing

    async function fetchMoviesData() {
        try {
            console.log('📡 [Data Load] Attempting to fetch movie data from movies.json...');
            const response = await fetch('movies.json');
            if (!response.ok) {
                console.error(`❌ [Data Load] HTTP error! Status: ${response.status}, Status Text: ${response.statusText}, URL: ${response.url}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            moviesData = await response.json();
            console.log('✅ [Data Load] Movie data loaded successfully from movies.json', moviesData.length, 'movies found.');

            if (moviesData.length === 0) {
                console.warn('⚠️ No movie data found in movies.json. Displaying empty grid message.');
                movieGrid.innerHTML = '<p style="text-align: center; color: var(--text-muted);">عذراً، لا توجد أفلام لعرضها حالياً. يرجى التأكد من ملف movies.json.</p>';
                if (prevPageBtn) prevPageBtn.style.display = 'none';
                if (nextPageBtn) nextPageBtn.style.display = 'none';
                return false;
            }
            
            // --- هذا الجزء حيوي: تعبئة moviesDataForPagination فوراً بعد التحميل ---
            // Shuffle moviesData once after loading for initial display
            moviesDataForPagination = [...moviesData].sort(() => 0.5 - Math.random());
            console.log('✅ [Data Init] moviesDataForPagination initialized with', moviesDataForPagination.length, 'movies.');

            if (prevPageBtn) prevPageBtn.style.display = 'inline-block';
            if (nextPageBtn) nextPageBtn.style.display = 'inline-block';
            return true;
        } catch (error) {
            console.error('❌ [Data Load] Error loading movie data from movies.json:', error);
            alert('حدث خطأ أثناء تحميل بيانات الأفلام. يرجى المحاولة لاحقًا.');
            movieGrid.innerHTML = '<p style="text-align: center; color: var(--text-error);">تعذر تحميل الأفلام. يرجى التحقق من اتصال الإنترنت أو مسار ملف movies.json.</p>';
            if (prevPageBtn) prevPageBtn.style.display = 'none';
            if (nextPageBtn) nextPageBtn.style.display = 'none';
            return false;
        }
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
            lastClickTime = lastDirectLinkClickTimeMovieCard; // Using same cooldown as movieCard
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

    function initializeLazyLoad() {
        if ('IntersectionObserver' in window) {
            let lazyLoadImages = document.querySelectorAll('.lazyload');
            let imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        let image = entry.target;
                        image.src = image.dataset.src;
                        image.classList.remove('lazyload');
                        observer.unobserve(image);
                    }
                });
            });

            lazyLoadImages.forEach(function(image) {
                imageObserver.observe(image);
            });
        } else {
            // Fallback for browsers that do not support IntersectionObserver
            let lazyLoadImages = document.querySelectorAll('.lazyload');
            lazyLoadImages.forEach(function(image) {
                image.src = image.dataset.src;
            });
        }
        console.log('🖼️ [Lazy Load] Initialized IntersectionObserver for images.');
    }

    function displayMovies(moviesToDisplay, targetGridElement) {
        if (!targetGridElement) {
            console.error('❌ displayMovies: Target grid element is null or undefined.');
            return;
        }
        targetGridElement.innerHTML = ''; // Clear previous content

        if (moviesToDisplay.length === 0) {
            targetGridElement.innerHTML = '<p style="text-align: center; color: var(--text-muted);">لا توجد أفلام مطابقة للبحث أو مقترحة.</p>';
            console.log(`🎬 [Display] No movies to display in ${targetGridElement.id}.`);
            return;
        }

        moviesToDisplay.forEach(movie => {
            targetGridElement.appendChild(createMovieCard(movie));
        });
        console.log(`🎬 [Display] Displayed ${moviesToDisplay.length} movies in ${targetGridElement.id}.`);

        initializeLazyLoad();
    }

    function paginateMovies(moviesArray, page) {
        if (!moviesArray || moviesArray.length === 0) {
            displayMovies([], movieGrid);
            updatePaginationButtons(0);
            return;
        }

        const startIndex = (page - 1) * moviesPerPage;
        const endIndex = startIndex + moviesPerPage;
        const paginatedMovies = moviesArray.slice(startIndex, endIndex);

        displayMovies(paginatedMovies, movieGrid);
        updatePaginationButtons(moviesArray.length);
        console.log(`➡️ [Pagination] Displaying page ${page}. Movies from index ${startIndex} to ${Math.min(endIndex, moviesArray.length)-1}.`);
    }

    function updatePaginationButtons(totalMovies) {
        const totalPages = Math.ceil(totalMovies / moviesPerPage);
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages;

        if (prevPageBtn && nextPageBtn) {
            if (totalMovies <= moviesPerPage) {
                prevPageBtn.style.display = 'none';
                nextPageBtn.style.display = 'none';
            } else {
                prevPageBtn.style.display = 'inline-block';
                nextPageBtn.style.display = 'inline-block';
            }
        }
        console.log(`🔄 [Pagination] Buttons updated. Current page: ${currentPage}, Total Movies: ${totalMovies}, Total Pages: ${totalPages}`);
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
            // If query is empty, show all movies randomized
            filteredMovies = [...moviesData].sort(() => 0.5 - Math.random());
            if (sectionTitleElement) {
                sectionTitleElement.textContent = 'أحدث الأفلام';
            }
            console.log('🔍 [Search] Search query empty, showing all movies (randomized).');
        }
        currentPage = 1;
        moviesDataForPagination = filteredMovies; // Update the array used for pagination
        paginateMovies(moviesDataForPagination, currentPage);
    }

    function createVideoPlayer(embedUrl) {
        if (!moviePlayerContainer) {
            console.error('moviePlayerContainer not found. Cannot create video player.');
            return null;
        }

        // Remove any existing iframe player
        if (activeMoviePlayer) {
            activeMoviePlayer.remove();
            activeMoviePlayer = null;
            console.log('[Video Player] Existing iframe removed.');
        }
        moviePlayerContainer.innerHTML = ''; // Clear container

        if (videoLoadingSpinner) {
            videoLoadingSpinner.style.display = 'block';
            console.log('[Video Player] Loading spinner shown.');
        }

        const newIframe = document.createElement('iframe');
        newIframe.classList.add('movie-player');
        newIframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
        newIframe.setAttribute('allowfullscreen', '');
        newIframe.setAttribute('frameborder', '0');
        newIframe.src = embedUrl;

        newIframe.onload = () => {
            if (videoLoadingSpinner) {
                videoLoadingSpinner.style.display = 'none';
                console.log('[Video Player] Loading spinner hidden (iframe loaded).');
            }
            // Ensure overlay is active if video is loaded and ready for interaction
            if (videoOverlay) {
                videoOverlay.classList.remove('inactive');
                videoOverlay.style.pointerEvents = 'auto'; // Re-enable clicks on overlay after video loads
                console.log('[Video Overlay] Active and clickable after video loaded.');
            }
        };

        newIframe.onerror = () => {
            if (videoLoadingSpinner) {
                videoLoadingSpinner.style.display = 'none';
                console.warn('[Video Player] Iframe failed to load. Spinner hidden.');
            }
            if (videoOverlay) {
                videoOverlay.classList.remove('inactive');
                videoOverlay.style.pointerEvents = 'auto'; // Keep active even if load fails for ad interaction
                console.warn('[Video Overlay] Active even after iframe load error.');
            }
            moviePlayerContainer.innerHTML = '<p class="error-message" style="text-align: center; color: var(--text-error);">تعذر تحميل الفيديو. يرجى التأكد من الرابط أو المحاولة لاحقًا.</p>';
            console.error(`❌ [Video Player] Failed to load iframe from: ${embedUrl}`);
        };

        moviePlayerContainer.appendChild(newIframe);
        activeMoviePlayer = newIframe;
        console.log(`[Video Player] New iframe created and set src to: ${embedUrl}`);

        return newIframe;
    }


    function showMovieDetails(movieId) {
        console.log(`🔍 [Routing] Showing movie details for ID: ${movieId}`);
        const movie = moviesData.find(m => m.id === movieId);

        if (movie) {
            // Update currentMoviePlayingId
            currentMoviePlayingId = movieId;

            // Hide home sections and show details sections
            if (heroSection) heroSection.style.display = 'none';
            if (movieGridSection) movieGridSection.style.display = 'none';

            if (movieDetailsSection) movieDetailsSection.style.display = 'block';
            if (suggestedMoviesSection) suggestedMoviesSection.style.display = 'block';

            window.scrollTo({ top: 0, behavior: 'smooth' });
            console.log('[Routing] Scrolled to top.');

            document.getElementById('movie-details-title').textContent = movie.title;
            document.getElementById('movie-details-description').textContent = movie.description;
            const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير متوفر';
            document.getElementById('movie-details-release-date').textContent = releaseDate;

            document.getElementById('movie-details-genre').textContent = movie.genre || 'غير محدد';
            document.getElementById('movie-details-director').textContent = movie.director || 'غير متوفر';
            document.getElementById('movie-details-cast').textContent = Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || 'غير متوفر';
            document.getElementById('movie-details-duration').textContent = movie.duration || 'غير متوفر';
            document.getElementById('movie-details-rating').textContent = movie.rating || 'N/A';

            if (movieDetailsPoster) {
                movieDetailsPoster.src = movie.poster;
                movieDetailsPoster.alt = movie.title;
                console.log(`[Details] Poster set for ${movie.title}`);
            }

            // Create and play video
            createVideoPlayer(movie.embed_url);

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
        console.log('📄 [SEO] Meta tags updated.');
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

        const schema = {
            "@context": "http://schema.org",
            "@type": "VideoObject",
            "name": movie.title,
            "description": movie.description,
            "thumbnailUrl": movie.poster,
            "uploadDate": formattedUploadDate,
            "embedUrl": movie.embed_url,
            "duration": movie.duration,
            "contentUrl": movie.embed_url
        };

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
                    "ratingCount": "10000" // Placeholder, as real rating count is not available
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
        const selected = shuffled.slice(0, 15); // Display up to 15 suggested movies

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
        // Show home sections and hide details sections
        if (heroSection) heroSection.style.display = 'flex'; // Or 'block' based on your CSS
        if (movieGridSection) movieGridSection.style.display = 'block';

        if (movieDetailsSection) movieDetailsSection.style.display = 'none';
        if (suggestedMoviesSection) suggestedMoviesSection.style.display = 'none';

        if (searchInput) searchInput.value = ''; // Clear search input
        if (sectionTitleElement) sectionTitleElement.textContent = 'أحدث الأفلام'; // Reset section title

        // Reset moviesDataForPagination to all movies, randomized, and paginate
        moviesDataForPagination = [...moviesData].sort(() => 0.5 - Math.random());
        currentPage = 1; // Reset current page to 1
        paginateMovies(moviesDataForPagination, currentPage);

        // Hide and disable video overlay and remove player
        if (videoOverlay) {
            videoOverlay.classList.add('inactive');
            videoOverlay.style.pointerEvents = 'none';
            console.log('[Video Overlay] Inactive on home page.');
        }
        if (videoLoadingSpinner) {
            videoLoadingSpinner.style.display = 'none';
        }
        if (activeMoviePlayer) {
            activeMoviePlayer.remove();
            activeMoviePlayer = null;
            console.log('[Video Player] Iframe removed on home page transition.');
        }
        if (moviePlayerContainer) {
            moviePlayerContainer.innerHTML = '';
        }
        currentMoviePlayingId = null; // Reset playing movie ID

        const newUrl = new URL(window.location.origin);
        history.pushState({ view: 'home' }, 'أفلام عربية - الصفحة الرئيسية', newUrl.toString());
        console.log(`🔗 [URL] URL updated to ${newUrl.toString()}`);

        // Reset default meta tags for home page
        document.title = 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية.');
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين');
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية.');
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.href);
        document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'website');
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين');
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية.');

        // Remove JSON-LD schema if present
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
                searchInput.blur(); // Hide keyboard on mobile
            }
        });
        console.log('🔍 [Event] Search input keypress listener attached.');
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                paginateMovies(moviesDataForPagination, currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
                window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // New/Improved Listener for "Movies" link in Navbar
    if (navMoviesLink) {
        navMoviesLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🎬 [Interaction] Nav "Movies" link clicked.');
            showHomePage(); // Always go to home page (which displays paginated movies)
            if (mainNav && mainNav.classList.contains('nav-open')) {
                mainNav.classList.remove('nav-open'); // Close mobile nav
            }
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
        videoOverlay.addEventListener('click', () => {
            console.log('⏯️ [Ad Click] Video overlay clicked. Attempting to open Direct Link.');
            const adOpened = openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY, 'videoOverlay');

            if (adOpened) {
                // IMPORTANT: Remove the current player immediately when an ad is opened
                if (activeMoviePlayer) {
                    activeMoviePlayer.remove();
                    activeMoviePlayer = null;
                    console.log('[Video Player] Video iframe removed due to ad click.');
                    if (moviePlayerContainer) {
                        moviePlayerContainer.innerHTML = '';
                    }
                }

                videoOverlay.style.pointerEvents = 'none'; // Temporarily disable overlay clicks
                console.log(`[Video Overlay] Temporarily disabled clicks for ${DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY / 1000} seconds.`);

                // Re-enable clicks and attempt to recreate player after cooldown
                setTimeout(() => {
                    videoOverlay.style.pointerEvents = 'auto'; // Re-enable clicks
                    console.log('[Video Overlay] Clicks re-enabled after cooldown.');

                    // Only recreate player if still on movie details page AND currentMoviePlayingId is set
                    if (movieDetailsSection && movieDetailsSection.style.display === 'block' && currentMoviePlayingId !== null) {
                        const movie = moviesData.find(m => m.id === currentMoviePlayingId);
                        if (movie) {
                            console.log('[Video Player] Recreating iframe after ad cooldown for movie:', movie.title);
                            createVideoPlayer(movie.embed_url);
                        } else {
                            console.warn('[Video Player] Movie data not found for ID to recreate player after ad:', currentMoviePlayingId);
                        }
                    } else {
                        console.log('[Video Player] Not on movie details page or no current movie playing, not recreating player after ad.');
                    }
                }, DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY + 500); // Add a small buffer
            }
        });
        console.log('[Video Overlay] Click listener attached for ad interaction (with cooldown logic).');
    }

    // --- 6. Initial Page Load Logic (Routing) ---
    const isDataLoaded = await fetchMoviesData(); // هنا بننتظر تحميل البيانات أولاً

    if (isDataLoaded) {
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
            showHomePage(); // This will paginate the moviesDataForPagination that was initialized in fetchMoviesData
        }
    } else {
        console.error('🛑 Initial movie data load failed. Cannot display content.');
        // fetchMoviesData() already handled displaying an error message in movieGrid
    }

    // Event listener for browser's back/forward buttons
    window.addEventListener('popstate', (event) => {
        console.log('↩️ [History] Popstate event triggered.', event.state);
        // Important: Ensure moviesData is loaded before attempting to route
        if (moviesData.length === 0) {
            console.warn('⚠️ [Popstate] No movie data available, attempting to reload home.');
            showHomePage(); // Try to show home even if data isn't ideal
            return;
        }

        if (event.state && event.state.view === 'details' && event.state.id) {
            showMovieDetails(event.state.id);
        } else {
            showHomePage();
        }
    });
});
