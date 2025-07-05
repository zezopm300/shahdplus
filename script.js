document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOM Content Loaded. Script execution started.');

    // --- 1. DOM Element References ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.main-nav ul li a');
    const heroSection = document.getElementById('hero-section');
    const watchNowBtn = document.getElementById('watch-now-btn');
    const movieGridSection = document.getElementById('movie-grid-section');
    const movieDetailsSection = document.getElementById('movie-details-section');
    const movieGrid = document.getElementById('movie-grid');
    const suggestedMovieGrid = document.getElementById('suggested-movie-grid');
    const suggestedMoviesSection = document.getElementById('suggested-movies-section');
    const backToHomeBtn = document.getElementById('back-to-home-btn');
    const videoContainer = document.getElementById('movie-player-container');
    const videoOverlay = document.getElementById('video-overlay');
    const homeLogoLink = document.getElementById('home-logo-link');
    const videoLoadingSpinner = document.getElementById('video-loading-spinner');
    const movieDetailsPoster = document.getElementById('movie-details-poster');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const moviesPerPage = 30;
    let currentPage = 1;
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const sectionTitleElement = movieGridSection ? movieGridSection.querySelector('h2') : null;

    // --- 1.1. Critical DOM Element Verification ---
    // هذا الجزء ضروري للتأكد من وجود العناصر الأساسية في HTML.
    const requiredElements = {
        '#movie-grid': movieGrid,
        '#movie-grid-section': movieGridSection,
        '#movie-details-section': movieDetailsSection,
        '#hero-section': heroSection,
        '#movie-player-container': videoContainer,
        '#video-overlay': videoOverlay,
        '#suggested-movie-grid': suggestedMovieGrid,
        '#suggested-movies-section': suggestedMoviesSection,
        '#video-loading-spinner': videoLoadingSpinner,
        '#movie-details-title': document.getElementById('movie-details-title'),
        '#movie-details-description': document.getElementById('movie-details-description'),
        '#movie-details-release-date': document.getElementById('movie-details-release-date'),
        '#movie-details-genre': document.getElementById('movie-details-genre'),
        '#movie-details-director': document.getElementById('movie-details-director'),
        '#movie-details-cast': document.getElementById('movie-details-cast'),
        '#movie-details-duration': document.getElementById('movie-details-duration'),
        '#movie-details-rating': document.getElementById('movie-details-rating')
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
        document.body.innerHTML = '<div style="text-align: center; margin-top: 100px; color: #f44336; font-size: 20px;">' +
                                  'عذرًا، حدث خطأ فني. يرجى تحديث الصفحة أو المحاولة لاحقًا.' +
                                  '<p style="font-size: 14px; color: #ccc;">(Missing page elements)</p></div>';
        return;
    } else {
        console.log('✅ All critical DOM elements found.');
    }

    // --- 2. Adsterra Configuration ---
    const ADSTERRA_DIRECT_LINK_URL = 'https://www.profitableratecpm.com/spqbhmyax?key=2469b039d4e7c471764bd04c57824cf2';
    const DIRECT_LINK_COOLDOWN_MOVIE_CARD = 3 * 60 * 1000; // 3 minutes for movie cards
    const DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION = 10 * 1000; // 10 seconds for video overlay/player interactions

    let lastDirectLinkClickTimeMovieCard = 0;
    let lastDirectLinkClickTimeVideoInteraction = 0;

    function openAdLink(cooldownDuration, type) {
        let lastClickTime;
        let setLastClickTime;

        if (type === 'movieCard' || type === 'movieDetailsPoster') {
            lastClickTime = lastDirectLinkClickTimeMovieCard;
            setLastClickTime = (time) => lastDirectLinkClickTimeMovieCard = time;
        } else if (type === 'videoOverlay' || type === 'videoSeek' || type === 'videoPause' || type === 'videoEndedRestart') {
            lastClickTime = lastDirectLinkClickTimeVideoInteraction;
            setLastClickTime = (time) => lastDirectLinkClickTimeVideoInteraction = time;
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

    // --- 3. Movie Data & Video URL Decoding ---
    let moviesData = [];
    let moviesDataForPagination = [];
    let currentDetailedMovie = null;
    // Video.js Player Instance
    let videoJsPlayerInstance = null;

    // Function to decode Base64 strings (for video URLs)
    function decodeBase64(encodedString) {
        try {
            if (!encodedString || typeof encodedString !== 'string') {
                console.warn('Attempted to decode an invalid Base64 string:', encodedString);
                return '';
            }
            // Add padding if missing, as atob requires valid Base64
            while (encodedString.length % 4 !== 0) {
                encodedString += '=';
            }
            return atob(encodedString);
        } catch (e) {
            console.error('Error decoding Base64 string:', e);
            return '';
        }
    }

    async function fetchMoviesData() {
        try {
            console.log('📡 Fetching movie data from movies.json...');
            const response = await fetch('movies.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} - Could not load movies.json. Check file path and server configuration.`);
            }
            moviesData = await response.json();
            if (!Array.isArray(moviesData)) {
                console.error('❌ Fetched data is not an array. Please check movies.json format. Expected an array of movie objects.');
                moviesData = [];
            } else if (moviesData.length === 0) {
                console.warn('⚠️ movies.json loaded, but it is empty.');
            }
            console.log('✅ Movie data loaded successfully from movies.json', moviesData.length, 'movies found.');
            initialPageLoadLogic();
        } catch (error) {
            console.error('❌ Failed to load movie data:', error.message);
            if (movieGrid) {
                movieGrid.innerHTML = '<p style="text-align: center; color: var(--text-color); margin-top: 50px;">عذرًا، لم نتمكن من تحميل بيانات الأفلام. يرجى المحاولة مرة أخرى لاحقًا أو التحقق من ملف movies.json.</p>';
            }
            if (sectionTitleElement) {
                sectionTitleElement.textContent = 'خطأ في تحميل الأفلام';
            }
        }
    }

    // Updated createMovieCard for responsive images (requires HTML setup)
    function createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        // For responsive images, you'd typically define srcset in HTML
        // Example:
        // <img data-src="${movie.poster_default}"
        //      data-srcset="${movie.poster_small} 480w, ${movie.poster_medium} 800w, ${movie.poster_large} 1200w"
        //      sizes="(max-width: 600px) 480px, (max-width: 1200px) 800px, 1200px"
        //      alt="${movie.title}" class="lazyload" width="200" height="300">
        // For simplicity and compatibility with existing JSON, we keep data-src for lazyload.
        // You can add srcset/sizes attributes if your JSON provides multiple poster URLs.
        movieCard.innerHTML = `
            <img data-src="${movie.poster}" alt="${movie.title}" class="lazyload" width="200" height="300">
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
                        if (image.dataset.src && (!image.src || image.src !== image.dataset.src)) {
                            image.src = image.dataset.src;
                            // If using srcset/sizes with lazyload, you'd also transfer data-srcset to srcset here
                            if (image.dataset.srcset) {
                                image.srcset = image.dataset.srcset;
                            }
                        }
                        image.classList.remove('lazyload');
                        observer.unobserve(image);
                    }
                });
            }, {
                rootMargin: '0px 0px 100px 0px' // Load images 100px before they enter viewport
            });

            lazyLoadImages.forEach(function(image) {
                imageObserver.observe(image);
            });
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            let lazyLoadImages = document.querySelectorAll('.lazyload');
            lazyLoadImages.forEach(function(image) {
                if (image.dataset.src) {
                    image.src = image.dataset.src;
                    if (image.dataset.srcset) {
                        image.srcset = image.dataset.srcset;
                    }
                }
            });
        }
        console.log('🖼️ [Lazy Load] Initialized IntersectionObserver for images (or fallback).');
    }

    function displayMovies(moviesToDisplay, targetGridElement) {
        if (!targetGridElement) {
            console.error('❌ displayMovies: Target grid element is null or undefined.');
            return;
        }
        targetGridElement.innerHTML = '';

        if (!moviesToDisplay || moviesToDisplay.length === 0) {
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
        if (!Array.isArray(moviesArray) || moviesArray.length === 0) {
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- Video Player Enhancements & URL Decoding (HLS/DASH Support) ---
    async function showMovieDetails(movieId) {
        console.log(`🔍 [Routing] Showing movie details for ID: ${movieId}`);
        const movie = moviesData.find(m => m.id === movieId);

        if (movie) {
            currentDetailedMovie = movie;

            if (heroSection) heroSection.style.display = 'none';
            if (movieGridSection) movieGridSection.style.display = 'none';

            // Dispose existing Video.js player instance
            if (videoJsPlayerInstance) {
                console.log('[Video.js] Disposing existing player instance before showing new details.');
                videoJsPlayerInstance.dispose();
                videoJsPlayerInstance = null;
            }

            // Rebuild the video element for a clean state
            if (videoContainer) {
                videoContainer.innerHTML = '';
                const newVideoElement = document.createElement('video');
                newVideoElement.id = 'movie-player';
                newVideoElement.classList.add('video-js', 'vjs-default-skin');
                newVideoElement.controls = true;
                newVideoElement.preload = 'auto';
                newVideoElement.setAttribute('playsinline', '');
                newVideoElement.setAttribute('poster', movie.poster);
                videoContainer.appendChild(newVideoElement);
                console.log('[Video Player] Recreated movie-player element.');
            } else {
                console.error('❌ CRITICAL ERROR: movie-player-container not found. Cannot create video player.');
                return;
            }

            // Show movie details sections
            if (movieDetailsSection) movieDetailsSection.style.display = 'block';
            if (suggestedMoviesSection) suggestedMoviesSection.style.display = 'block';

            window.scrollTo({ top: 0, behavior: 'smooth' });
            console.log('[Routing] Scrolled to top.');

            // Update movie details
            document.getElementById('movie-details-title').textContent = movie.title || 'غير متوفر';
            document.getElementById('movie-details-description').textContent = movie.description || 'لا يوجد وصف متاح.';
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
                movieDetailsPoster.setAttribute('width', '300');
                movieDetailsPoster.setAttribute('height', '450');
                console.log(`[Details] Poster set for ${movie.title}`);
            }

            // Get reference to the newly created player element
            const moviePlayerElement = document.getElementById('movie-player');

            // Decode the video URL from Base64
            const decodedVideoUrl = decodeBase64(movie.embed_url_encoded); // Assumed to be HLS/DASH or MP4

            if (!decodedVideoUrl) {
                console.error(`❌ Failed to get decoded video URL for movie ID: ${movieId}. Cannot initialize player.`);
                if (videoContainer) {
                    videoContainer.innerHTML = '<p style="text-align: center; color: var(--text-color); margin-top: 20px;">عذرًا، لا يمكن تشغيل الفيديو حاليًا (خطأ في فك التشفير).</p>';
                }
                return;
            }

            if (moviePlayerElement) {
                await new Promise(resolve => {
                    const checkVisibility = () => {
                        if (moviePlayerElement.offsetParent !== null) {
                            console.log('[Video Player] moviePlayer is now connected and visible. Resolving promise.');
                            resolve();
                        } else {
                            requestAnimationFrame(checkVisibility);
                        }
                    };
                    setTimeout(() => requestAnimationFrame(checkVisibility), 50);
                });

                console.log('[Video Player] moviePlayer is ready. Proceeding with Video.js initialization.');

                // Determine video type (HLS, DASH, or MP4)
                let videoType = 'video/mp4'; // Default to MP4
                if (decodedVideoUrl.includes('.m3u8')) {
                    videoType = 'application/x-mpegURL'; // HLS
                } else if (decodedVideoUrl.includes('.mpd')) {
                    videoType = 'application/dash+xml'; // DASH
                }

                videoJsPlayerInstance = videojs(moviePlayerElement, {
                    autoplay: false,
                    controls: true,
                    responsive: true,
                    fluid: true,
                    techOrder: ['html5'], // Prioritize native HTML5 video
                    html5: {
                        nativeControlsForTouch: true, // Use native controls on touch devices for better compatibility
                        vhs: { // Video.js HTTP Streaming (for HLS/DASH)
                            limitRenditionByPlayerDimensions: false,
                            enableLowInitialPlaylist: true, // Start with lower quality to reduce initial buffer
                            fastQualityChange: true, // Allow quick quality switching
                            maxBufferLength: 60, // Max buffer in seconds
                            maxMaxBufferLength: 120, // Max buffer when idle
                        }
                    },
                    playbackRates: [0.5, 1, 1.5, 2],
                    sources: [{
                        src: decodedVideoUrl,
                        type: videoType // Dynamically set based on URL extension
                    }],
                    crossOrigin: 'anonymous' // Important for CDN/cross-domain video
                }, function() {
                    console.log(`[Video.js] Player initialized callback for source: ${decodedVideoUrl} (Type: ${videoType})`);
                    if (videoLoadingSpinner && !this.hasStarted() && !this.paused() && !this.ended()) {
                        videoLoadingSpinner.style.display = 'block';
                    }
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'auto';
                        videoOverlay.classList.remove('hidden');
                    }

                    this.ready(function() {
                        const player = this;
                        // Prevent download button if exists
                        const downloadButton = player.controlBar.getChild('DownloadButton') || player.controlBar.getChild('DownloadToggle');
                        if (downloadButton) {
                            player.controlBar.removeChild(downloadButton);
                            console.log('[Video.js] Download button removed from control bar.');
                        } else {
                            console.log('[Video.js] No default download button found to remove.');
                        }
                        // Overriding the context menu to prevent right-click download
                        player.tech_.el_.addEventListener('contextmenu', function(e) {
                            e.preventDefault();
                            console.log('🚫 [Video Player] Right-click disabled on video element.');
                        });
                    });
                });

                // --- Video Player Event Listeners for Ads and Overlay ---
                videoJsPlayerInstance.on('loadstart', () => {
                    console.log('[Video.js] Video loadstart event fired.');
                    if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'block';
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'auto';
                        videoOverlay.classList.remove('hidden');
                    }
                });

                videoJsPlayerInstance.on('playing', () => {
                    console.log('[Video.js] Video playing event fired.');
                    if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'none';
                        videoOverlay.classList.add('hidden');
                    }
                });

                videoJsPlayerInstance.on('waiting', () => {
                    console.log('[Video.js] Video waiting (buffering).');
                    if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'block';
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'auto';
                        videoOverlay.classList.remove('hidden');
                    }
                });

                videoJsPlayerInstance.on('pause', () => {
                    console.log('[Video.js] Video paused.');
                    if (!videoJsPlayerInstance.ended()) {
                        openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION, 'videoPause');
                        if (videoOverlay) {
                            videoOverlay.style.pointerEvents = 'auto';
                            videoOverlay.classList.remove('hidden');
                        }
                    }
                });

                videoJsPlayerInstance.on('seeked', () => {
                    console.log('[Video.js] Video seeked.');
                    openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION, 'videoSeek');
                });

                videoJsPlayerInstance.on('error', (e) => {
                    const error = videoJsPlayerInstance.error();
                    console.error('[Video.js] Player Error:', error ? error.message : 'Unknown error', error);
                    if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'auto';
                        videoOverlay.classList.remove('hidden');
                    }
                    const errorDisplay = document.createElement('div');
                    errorDisplay.className = 'vjs-error-display';
                    errorDisplay.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.8); color: white; text-align: center; font-size: 1.2em; z-index: 10; padding: 20px;';
                    errorDisplay.innerHTML = `<p>حدث خطأ أثناء تشغيل الفيديو: ${error ? error.message : 'خطأ غير معروف'}. يرجى المحاولة لاحقًا.</p><button onclick="window.location.reload()" style="background-color: var(--primary-color); color: white; border: none; padding: 10px 20px; margin-top: 15px; cursor: pointer; border-radius: 5px;">إعادة تحميل الصفحة</button>`;
                    if (videoContainer && !videoContainer.querySelector('.vjs-error-display')) {
                        videoContainer.appendChild(errorDisplay);
                    }
                });

                videoJsPlayerInstance.on('ended', () => {
                    console.log('[Video.js] Video ended.');
                    openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION, 'videoEndedRestart');
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'auto';
                        videoOverlay.classList.remove('hidden');
                    }
                    videoJsPlayerInstance.currentTime(0);
                });

            } else {
                console.warn('⚠️ [Video Player] moviePlayer element not found or not ready after attempts. Skipping Video.js initialization.');
                if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                if (videoOverlay) {
                    videoOverlay.style.display = 'flex';
                    videoOverlay.style.pointerEvents = 'auto';
                    videoOverlay.classList.remove('hidden');
                }
            }

            // --- Update URL and SEO ---
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

    // --- SEO Functions (Enhanced for maximum impact) ---
    function updateMetaTags(movie) {
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute('href', window.location.href);

        document.title = `${movie.title} - مشاهدة أونلاين على شاهد بلس بجودة عالية 4K`;
        document.querySelector('meta[name="description"]')?.setAttribute('content', `شاهد فيلم ${movie.title} أونلاين بجودة عالية ${movie.rating ? `تقييم ${movie.rating}` : ''}. ${movie.description || 'استمتع بأحدث الأفلام والمسلسلات العربية والأجنبية بجودة 4K فائقة الوضوح على شاهد بلس.'} اكتشف المزيد من الأفلام في تصنيف ${movie.genre || 'متنوع'}.`);

        document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${movie.title} - مشاهدة أونلاين على شاهد بلس`);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', `شاهد فيلم ${movie.title} أونلاين بجودة عالية ${movie.rating ? `تقييم ${movie.rating}` : ''}. ${movie.description || 'استمتع بأحدث الأفلام والمسلسلات العربية والأجنبية بجودة 4K فائقة الوضوح على شاهد بلس.'}`);
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', movie.poster);
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.href);
        document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'video.movie');
        document.querySelector('meta[property="og:locale"]')?.setAttribute('content', 'ar_AR');
        document.querySelector('meta[property="og:site_name"]')?.setAttribute('content', 'شاهد بلس');

        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', `${movie.title} - مشاهدة أونلاين على شاهد بلس`);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', `شاهد فيلم ${movie.title} أونلاين بجودة عالية ${movie.rating ? `تقييم ${movie.rating}` : ''}. ${movie.description || 'استمتع بأحدث الأفلام والمسلسلات العربية والأجنبية بجودة 4K فائقة الوضوح على شاهد بلس.'}`);
        document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', movie.poster);
        document.querySelector('meta[name="twitter:card"]')?.setAttribute('content', 'summary_large_image');

        console.log('📄 [SEO] Meta tags updated for movie details.');
    }

    function addJsonLdSchema(movie) {
        let formattedUploadDate;
        if (movie.release_date) {
            try {
                const date = new Date(movie.release_date);
                if (!isNaN(date.getTime())) {
                    formattedUploadDate = date.toISOString();
                } else {
                    formattedUploadDate = new Date().toISOString();
                }
            } catch (e) {
                formattedUploadDate = new Date().toISOString();
            }
        } else {
            formattedUploadDate = new Date().toISOString();
        }

        // Determine video type for JSON-LD contentUrl
        let contentUrlType = 'video/mp4';
        const decodedVideoUrl = decodeBase64(movie.embed_url_encoded);
        if (decodedVideoUrl.includes('.m3u8')) {
            contentUrlType = 'application/x-mpegURL';
        } else if (decodedVideoUrl.includes('.mpd')) {
            contentUrlType = 'application/dash+xml';
        }

        const schema = {
            "@context": "http://schema.org",
            "@type": "VideoObject",
            "name": movie.title,
            "description": movie.description || `مشاهدة وتحميل فيلم ${movie.title} بجودة عالية على شاهد بلس.`,
            "thumbnailUrl": movie.poster,
            "uploadDate": formattedUploadDate,
            "embedUrl": decodedVideoUrl,
            "duration": movie.duration || "PT1H30M", // Default duration if not provided
            "contentUrl": decodedVideoUrl, // Use decoded URL here
            "encodingFormat": contentUrlType, // Specify the format
            "publisher": {
                "@type": "Organization",
                "name": "شاهد بلس",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://example.com/images/shahed-plus-logo.png", // *** UPDATE THIS TO YOUR ACTUAL LOGO URL ***
                    "width": 200,
                    "height": 50
                }
            },
            "potentialAction": {
                "@type": "WatchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": window.location.href,
                    "inLanguage": "ar",
                    "actionPlatform": [
                        "http://schema.org/DesktopWebPlatform",
                        "http://schema.org/MobileWebPlatform"
                    ]
                },
                "expectsAcceptanceOf": {
                    "@type": "Offer",
                    "name": "مشاهدة الفيلم"
                }
            }
        };

        if (movie.director && typeof movie.director === 'string' && movie.director.trim() !== '') {
            schema.director = { "@type": "Person", "name": movie.director.trim() };
        }
        if (movie.cast) {
            const castArray = Array.isArray(movie.cast) ? movie.cast : String(movie.cast).split(',').map(s => s.trim()).filter(s => s !== '');
            if (castArray.length > 0) {
                schema.actor = castArray.map(actor => ({ "@type": "Person", "name": actor }));
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
            if (!isNaN(ratingValue) && ratingValue >= 0 && ratingValue <= 10) {
                schema.aggregateRating = {
                    "@type": "AggregateRating",
                    "ratingValue": ratingValue.toFixed(1),
                    "bestRating": "10",
                    "ratingCount": "10000" // Placeholder, ideally this comes from data
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
        const selected = shuffled.slice(0, 24);

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

        moviesDataForPagination = moviesData.length > 0 ? [...moviesData].sort(() => 0.5 - Math.random()) : [];
        paginateMovies(moviesDataForPagination, 1);

        if (videoOverlay) {
            videoOverlay.style.pointerEvents = 'none';
            videoOverlay.classList.add('hidden');
            if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
        }

        if (videoJsPlayerInstance) {
            console.log('[Video.js] Disposing player on home page navigation.');
            videoJsPlayerInstance.dispose();
            videoJsPlayerInstance = null;
        }
        currentDetailedMovie = null;

        if (videoContainer) {
            videoContainer.innerHTML = '';
            console.log('[Video Player] Cleared movie-player-container on home page navigation.');
        }

        const newUrl = new URL(window.location.origin);
        history.pushState({ view: 'home' }, 'شاهد بلس - الصفحة الرئيسية', newUrl.toString());
        console.log(`🔗 [URL] URL updated to ${newUrl.toString()}`);

        // Reset meta tags to default home page values for SEO
        document.title = 'شاهد بلس - بوابتك الفاخرة للترفيه السينمائي | أفلام ومسلسلات 4K أونلاين';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'شاهد بلس: بوابتك الفاخرة للترفيه السينمائي. استمتع بأحدث الأفلام والمسلسلات العربية والأجنبية بجودة 4K فائقة الوضوح، مترجمة ومدبلجة، مع تجربة مشاهدة احترافية لا مثيل لها. اكتشف عالمًا من المحتوى الحصري والمتجدد.');
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'شاهد بلس - بوابتك الفاخرة للترفيه السينمائي | أفلام ومسلسلات 4K');
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', 'شاهد بلس: بوابتك الفاخرة للترفيه السينمائي. استمتع بأحدث الأفلام والمسلسلات العربية والأجنبية بجودة 4K فائقة الوضوح، مترجمة ومدبلجة، مع تجربة مشاهدة احترافية لا مثيل لها. اكتشف عالمًا من المحتوى الحصري والمتجدد.');
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.origin);
        document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'website');
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', 'https://images.unsplash.com/photo-1542204165-f938d2279b33?q=80&w=2670&auto=format&fit=crop'); // Default hero image URL
        document.querySelector('meta[property="og:image:alt"]')?.setAttribute('content', 'شاهد بلس | بوابتك للترفيه السينمائي الفاخر');
        document.querySelector('meta[property="og:site_name"]')?.setAttribute('content', 'شاهد بلس');

        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', 'شاهد بلس - بوابتك الفاخرة للترفيه السينمائي | أفلام ومسلسلات 4K');
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', 'شاهد بلس: بوابتك الفاخرة للترفيه السينمائي. استمتع بأحدث الأفلام والمسلسلات العربية والأجنبية بجودة 4K فائقة الوضوح، مترجمة ومدبلجة، مع تجربة مشاهدة احترافية لا مثيل لها. اكتشف عالمًا من المحتوى الحصري والمتجدد.');
        document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', 'https://images.unsplash.com/photo-1542204165-f938d2279b33?q=80&w=2670&auto=format&fit=crop');

        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (canonicalLink) {
            canonicalLink.setAttribute('href', window.location.origin);
        }

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
            console.log('☰ [Interaction] Menu toggled.');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav && mainNav.classList.contains('nav-open')) {
                mainNav.classList.remove('nav-open');
                console.log('📱 [Interaction] Nav link clicked, menu closed.');
            } else {
                console.log('📱 [Interaction] Nav link clicked.');
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

    if (movieDetailsPoster) {
        movieDetailsPoster.addEventListener('click', () => {
            console.log('🖼️ [Ad Click] Movie details poster clicked. Attempting to open Direct Link.');
            openAdLink(DIRECT_LINK_COOLDOWN_MOVIE_CARD, 'movieDetailsPoster');
        });
        console.log('[Event] Movie details poster click listener attached.');
    }

    if (videoOverlay) {
        videoOverlay.addEventListener('click', (e) => {
            console.log('⏯️ [Ad Click] Video overlay clicked. Attempting to open Direct Link.');
            const adOpened = openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION, 'videoOverlay');

            if (adOpened) {
                setTimeout(() => {
                    if (videoJsPlayerInstance && (videoJsPlayerInstance.paused() || videoJsPlayerInstance.ended())) {
                        videoJsPlayerInstance.play().then(() => {
                            console.log('[Video.js] Player started playing after overlay click and ad open.');
                            if (videoOverlay) {
                                videoOverlay.style.pointerEvents = 'none';
                                videoOverlay.classList.add('hidden');
                            }
                            if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                        }).catch(error => {
                            console.warn('⚠️ [Video.js] Play failed after ad open (user interaction still required):', error);
                            if (videoOverlay) {
                                videoOverlay.style.pointerEvents = 'auto';
                                videoOverlay.classList.remove('hidden');
                            }
                            if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                        });
                    } else if (videoJsPlayerInstance && videoJsPlayerInstance.isReady_ && !videoJsPlayerInstance.paused() && !videoJsPlayerInstance.ended()){
                        console.log('[Video.js] Player already playing, just opened ad.');
                        if (videoOverlay) {
                            videoOverlay.style.pointerEvents = 'none';
                            videoOverlay.classList.add('hidden');
                        }
                    } else {
                        console.warn('[Video.js] Player instance not ready or not found when trying to play via overlay click after ad.');
                        if (videoOverlay) {
                            videoOverlay.style.pointerEvents = 'auto';
                            videoOverlay.classList.remove('hidden');
                        }
                        if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                    }
                }, 500); // Small delay to allow ad tab to open/focus
            } else {
                console.log('[Video Overlay] Ad not opened due to cooldown. Overlay remains active.');
            }
            e.stopPropagation(); // Prevent click from bubbling up to player controls immediately
        });
        console.log('[Video Overlay] Click listener attached for ad interaction.');
    }

    // --- DevTools Protection & Right Click/Keyboard Shortcuts Disabler (Optimized for SEO) ---
    // Disable Right Click
    document.addEventListener('contextmenu', e => {
        e.preventDefault();
        console.warn('🚫 [Security] Right-click disabled.');
    });

    // Disable Keyboard Shortcuts for DevTools/Source
    document.addEventListener('keydown', e => {
        // F12 || Ctrl+Shift+I || Ctrl+Shift+J || Ctrl+U (View Page Source) || Cmd+Option+I (Mac)
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
            (e.ctrlKey && e.key === 'u') ||
            (e.metaKey && e.altKey && e.key === 'I') // Mac: Cmd+Option+I
        ) {
            e.preventDefault();
            console.warn(`🚫 [Security] Keyboard shortcut for DevTools/Source prevented: ${e.key}`);
            // You can optionally show a small, unobtrusive message to the user here
            // e.g., using a custom toast notification that appears and fades
        }
    });

    // DevTools Detection (No page emptying - SEO friendly)
    const devtoolsDetector = (() => {
        const threshold = 160; // Approximate height/width of DevTools panel in console

        let isOpen = false;
        const checkDevTools = () => {
            // Check for common DevTools window sizes or open state
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            const isConsoleOpen = console.firebug || (console.profiles && console.profiles.length) || (console.clear && !!console.log.toString().match(/\[native code\]/)) || false; // Basic console check

            if (widthThreshold || heightThreshold || isConsoleOpen) {
                if (!isOpen) {
                    isOpen = true;
                    console.warn('🚨 [Security] Developer tools detected! This action is not encouraged on this site.');
                    // Consider showing a very subtle, temporary message on screen (not an alert)
                }
            } else {
                if (isOpen) {
                    isOpen = false;
                    console.log('✅ [Security] Developer tools closed.');
                }
            }
        };

        // Run checks periodically and on resize
        window.addEventListener('resize', checkDevTools);
        setInterval(checkDevTools, 1000); // Check every 1 second
        checkDevTools(); // Initial check on load
    })();

    // --- Initial page load logic (handles direct URL access) ---
    function initialPageLoadLogic() {
        const urlParams = new URLSearchParams(window.location.search);
        const viewParam = urlParams.get('view');
        const idParam = urlParams.get('id');

        if (viewParam === 'details' && idParam) {
            const movieId = parseInt(idParam);
            if (!isNaN(movieId) && moviesData.find(m => m.id === movieId)) {
                console.log(`🚀 [Initial Load] Attempting to load movie details from URL: ID ${movieId}`);
                showMovieDetails(movieId);
            } else {
                console.warn('⚠️ [Initial Load] Invalid movie ID in URL or movie not found. Showing home page.');
                showHomePage();
            }
        } else {
            console.log('🚀 [Initial Load] No specific view in URL. Showing home page.');
            showHomePage();
        }
    }

    window.addEventListener('popstate', (event) => {
        console.log('↩️ [Popstate] Browser history navigation detected.', event.state);
        if (moviesData.length === 0) {
            console.warn('[Popstate] Movie data not loaded, attempting to show home page.');
            showHomePage();
            return;
        }

        if (event.state && event.state.view === 'details' && event.state.id) {
            showMovieDetails(event.state.id);
        } else {
            showHomePage();
        }
    });

    // Start the process by fetching movie data
    fetchMoviesData();

    // --- REMINDER FOR OBUSCATION (Crucial for strong client-side protection) ---
    // بعد الانتهاء من تطوير الكود واختباره بشكل كامل، و قبل الرفع على السيرفر:
    // 1. قم بتصغير (minify) الكود لتقليل حجمه وتحسين سرعة التحميل (يمكن لأدوات مثل UglifyJS القيام بذلك).
    // 2. قم بتشويش (Obfuscate) الكود لجعله غير مقروء تمامًا ويصعب على أي شخص معرفة كيفية عمله أو الوصول للروابط بسهولة.
    //    استخدم أدوات احترافية مثل: https://obfuscator.io/ (باستخدام إعدادات قوية).
    // هذا سيجعل مهمة فك الشفرة صعبة للغاية حتى على المتخصصين.
    console.log('%c[Obfuscation Reminder] Remember to MINIFY and OBUSCATE this script before deployment!', 'color: red; font-weight: bold; font-size: 16px;');
});
