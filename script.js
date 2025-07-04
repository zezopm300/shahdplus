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
        return;
    } else {
        console.log('✅ All critical DOM elements found.');
    }

    // --- 2. Adsterra Configuration ---
    const ADSTERRA_DIRECT_LINK_URL = 'https://www.profitableratecpm.com/spqbhmyax?key=2469b039d4e7c471764bd04c57824cf2';
    const DIRECT_LINK_COOLDOWN_MOVIE_CARD = 3 * 60 * 1000; // 3 minutes for movie cards
    const DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION = 10 * 1000; // 10 seconds for video overlay/player interactions

    let lastDirectLinkClickTimeMovieCard = 0;
    let lastDirectLinkClickTimeVideoInteraction = 0; // Cooldown for video interactions

    /**
     * Opens an Adsterra direct link if cooldown allows.
     * @param {number} cooldownDuration - The cooldown duration in milliseconds.
     * @param {string} type - A string identifier for the type of ad click (e.g., 'movieCard', 'videoOverlay', 'movieDetailsPoster', 'videoSeek', 'videoPause').
     * @returns {boolean} True if ad was opened, false otherwise.
     */
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

    // --- 2.1. URL Signing Configuration (New section for token-based video protection) ---
    // IMPORTANT: This secret key MUST match the one used in your Cloudflare Worker.
    // Replace 'YOUR_SUPER_SECRET_KEY_HERE' with a strong, secret key.
    // DO NOT expose this in client-side code in a real production environment.
    // For demonstration, it's here, but ideally, this should come from a secure backend or environment variable.
    const URL_SIGNING_SECRET_KEY = 'shahidplus-2025-superkey'; // *** غير هذا المفتاح السري! يجب أن يتطابق مع Cloudflare Worker ***
    const TOKEN_VALID_DURATION_SECONDS = 5 * 60; // Token valid for 5 minutes

    /**
     * Generates a signed URL with a temporary token for Cloudflare Worker.
     * This function uses HMAC SHA256 for signing.
     * @param {string} originalUrl The original video URL (e.g., https://yourdomain.com/videos/movie.mp4).
     * @returns {string} The signed URL with 'expires' and 'signature' query parameters.
     */
    function generateSignedUrl(originalUrl) {
        if (!originalUrl || typeof originalUrl !== 'string') {
            console.error('❌ generateSignedUrl: Invalid originalUrl provided.');
            return originalUrl; // Return original if invalid
        }

        // Prevent re-signing if URL already contains 'expires' or 'signature'
        if (originalUrl.includes('expires=') && originalUrl.includes('signature=')) {
            console.warn('⚠️ generateSignedUrl: URL already appears to be signed. Skipping signing.');
            return originalUrl;
        }

        // Get the current time in Unix timestamp (seconds) and add the duration
        const expirationTime = Math.floor(Date.now() / 1000) + TOKEN_VALID_DURATION_SECONDS;

        let path;
        try {
            path = new URL(originalUrl).pathname; // Get only the path part (e.g., /videos/movie.mp4)
        } catch (e) {
            console.error('❌ generateSignedUrl: Failed to parse originalUrl with URL constructor:', e);
            return originalUrl; // Fallback if URL is malformed
        }

        // Construct the string to be signed.
        // This format MUST exactly match what your Cloudflare Worker expects for signing.
        // Common format: /path/to/video.mp4?expires=1678886400
        const stringToSign = `${path}?expires=${expirationTime}`;
        console.log(`🔑 String to sign: "${stringToSign}"`);

        // Check if CryptoJS is loaded before trying to use it
        if (typeof CryptoJS === 'undefined' || !CryptoJS.HmacSHA256) {
            console.error('❌ CryptoJS library (HmacSHA256) is not loaded or available. Cannot sign URL. Make sure you included: <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js"></script>');
            return originalUrl; // Fallback to original URL if crypto library is missing
        }

        // Generate HMAC SHA256 hash
        const hash = CryptoJS.HmacSHA256(stringToSign, URL_SIGNING_SECRET_KEY).toString(CryptoJS.enc.Hex);
        console.log(`🔑 Generated hash: ${hash}`);

        // Append the expires and signature parameters to the original URL
        const separator = originalUrl.includes('?') ? '&' : '?';
        const signedUrl = `${originalUrl}${separator}expires=${expirationTime}&signature=${hash}`;

        console.log(`✅ Generated signed URL: ${signedUrl}`);
        return signedUrl;
    }


    // --- 3. Movie Data ---
    let moviesData = [];
    let moviesDataForPagination = [];
    let currentDetailedMovie = null;

    let videoJsPlayerInstance = null;

    async function fetchMoviesData() {
        try {
            const response = await fetch('movies.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            moviesData = await response.json();
            if (!Array.isArray(moviesData)) {
                console.error('❌ Fetched data is not an array. Please check movies.json format.');
                moviesData = [];
            }
            console.log('✅ Movie data loaded successfully from movies.json', moviesData);
            initialPageLoadLogic();
        } catch (error) {
            console.error('❌ Failed to load movie data:', error);
            if (movieGrid) {
                movieGrid.innerHTML = '<p style="text-align: center; color: var(--text-color); margin-top: 50px;">عذرًا، لم نتمكن من تحميل بيانات الأفلام. يرجى المحاولة مرة أخرى لاحقًا.</p>';
            }
            if (sectionTitleElement) {
                sectionTitleElement.textContent = 'خطأ في تحميل الأفلام';
            }
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
            let lazyLoadImages = document.querySelectorAll('.lazyload');
            lazyLoadImages.forEach(function(image) {
                image.src = image.dataset.src;
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
            // Revert to showing all movies (randomized) when search is cleared
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

    async function showMovieDetails(movieId) {
        console.log(`🔍 [Routing] Showing movie details for ID: ${movieId}`);
        // Ensure both IDs are treated as strings for robust comparison
        const movie = moviesData.find(m => String(m.id) === String(movieId));

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
                videoContainer.innerHTML = ''; // Clear any previous content
                const newVideoElement = document.createElement('video');
                newVideoElement.id = 'movie-player'; // Keep the same ID for Video.js lookup
                newVideoElement.classList.add('video-js', 'vjs-default-skin');
                newVideoElement.controls = true;
                newVideoElement.preload = 'auto';
                newVideoElement.setAttribute('playsinline', '');
                newVideoElement.setAttribute('crossorigin', 'anonymous'); // 💡 [تحسين التقطيع] تأكيد crossorigin للسماح لـ HLS.js بقراءة الفيديو

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
                console.log(`[Details] Poster set for ${movie.title}`);
            }

            // Get reference to the newly created player element
            const moviePlayerElement = document.getElementById('movie-player');

            if (moviePlayerElement) {
                // Wait until the element is connected to DOM and visible
                await new Promise(resolve => {
                    const checkVisibility = () => {
                        if (moviePlayerElement.offsetParent !== null) {
                            console.log('[Video Player] moviePlayer is now connected and visible. Resolving promise.');
                            resolve();
                        } else {
                            console.log('[Video Player] moviePlayer not yet visible, retrying...');
                            requestAnimationFrame(checkVisibility);
                        }
                    };
                    setTimeout(() => requestAnimationFrame(checkVisibility), 50);
                });

                console.log('[Video Player] moviePlayer is ready. Proceeding with Video.js initialization.');

                // --- Video Source Determination (Prioritizes embed_url, falls back to Pixeldrain embed_id) ---
                const originalUrl = movie.embed_url || `https://pixeldrain.com/api/file/${movie.embed_id}`;

                if (!originalUrl) { // Check if a valid URL was determined
                    console.error('❌ No video source (embed_url or embed_id) found for this movie. Cannot play video.');
                    if (videoContainer) {
                        videoContainer.innerHTML = '<p style="text-align: center; color: var(--text-color); padding: 20px;">عذرًا، لا يتوفر رابط الفيديو لهذا الفيلم حاليًا.</p>';
                    }
                    if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'auto';
                        videoOverlay.classList.remove('hidden');
                    }
                    return; // Stop execution if no video source
                }
                console.log(`🎥 [Video Source] Determined original URL: ${originalUrl}`);

                const signedVideoUrl = generateSignedUrl(originalUrl); // Now uses the determined originalUrl
                
                // 💡 [تحسين التقطيع] إعداد خيارات Video.js لاستخدام HLS.js
                const videoOptions = {
                    autoplay: false,
                    controls: true,
                    responsive: true,
                    fluid: true,
                    techOrder: ['html5'], // نعتمد على HTML5 video element
                    html5: {
                        nativeControlsForTouch: true
                    },
                    playbackRates: [0.5, 1, 1.5, 2],
                    sources: [{
                        src: signedVideoUrl,
                        // 💡 [تحسين التقطيع] تغيير النوع لـ 'application/x-mpegURL' أو 'application/vnd.apple.mpegurl'
                        // عشان HLS.js يعرف يتعامل معاه. بالرغم من إن الفيديو MP4، HLS.js بيتعامل معاه كـ HLS.
                        type: 'application/x-mpegURL' 
                    }],
                    crossOrigin: 'anonymous'
                };

                videoJsPlayerInstance = videojs(moviePlayerElement, videoOptions, function() {
                    console.log(`[Video.js] Player initialized callback for source: ${signedVideoUrl}`);
                    
                    // 💡 [تحسين التقطيع] تهيئة HLS.js إذا كان المتصفح لا يدعمه natively
                    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(signedVideoUrl);
                        hls.attachMedia(moviePlayerElement);
                        hls.on(Hls.Events.MANIFEST_PARSED, function() {
                            console.log('[HLS.js] Manifest parsed. HLS.js is managing playback.');
                            // this.play(); // ممكن تشغل الفيديو تلقائيًا بعد التحميل لو حابب، لكن الأفضل تركه على autoplay: false
                        });
                        hls.on(Hls.Events.ERROR, function (event, data) {
                            console.error('[HLS.js] Error event detected:', data);
                            if (data.fatal) {
                                switch(data.type) {
                                    case Hls.ErrorTypes.NETWORK_ERROR:
                                        console.error('fatal network error encountered, try to recover');
                                        hls.startLoad();
                                        break;
                                    case Hls.ErrorTypes.MEDIA_ERROR:
                                        console.error('fatal media error encountered, try to recover');
                                        hls.recoverMediaError();
                                        break;
                                    default:
                                        // cannot recover
                                        hls.destroy();
                                        console.error('HLS.js fatal error, cannot recover.');
                                        break;
                                }
                            }
                        });
                        // تخزين HLS instance لو حبيت تتعامل معاها بعدين (اختياري)
                        videoJsPlayerInstance.hls = hls; 
                    } else if (moviePlayerElement.canPlayType('application/vnd.apple.mpegurl')) {
                        // لو المتصفح بيدعم HLS natively (سفاري iOS مثلاً)
                        moviePlayerElement.src = signedVideoUrl;
                        console.log('[HLS.js] Browser natively supports HLS. Using native playback.');
                    } else {
                        // لو لا HLS.js ولا المتصفح بيدعموا، نرجع للطريقة التقليدية (MP4)
                        // في هذه الحالة، ممكن يحصل تقطيع لو سرعة النت ضعيفة.
                        moviePlayerElement.src = signedVideoUrl;
                        moviePlayerElement.type = 'video/mp4';
                        console.warn('⚠️ Neither HLS.js nor native HLS support. Falling back to direct MP4 playback. Tearing might occur.');
                    }


                    // Initially show spinner if video is not ready
                    if (videoLoadingSpinner && !this.hasStarted() && !this.paused() && !this.ended()) {
                        videoLoadingSpinner.style.display = 'block';
                    }
                    // Ensure overlay is active for clicks when player is ready but not playing
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'auto'; // Make it clickable
                        videoOverlay.classList.remove('hidden'); // Ensure visible (though transparent)
                    }

                    // --- Video.js Plugin to disable download button ---
                    this.ready(function() {
                        const player = this;
                        player.controlBar.addChild('Component', {}, player.controlBar.children_.length - 1); // Add a placeholder
                        // Find the existing 'Download' button (if it exists from a plugin) and remove it
                        const downloadButton = player.controlBar.getChild('DownloadButton'); // Adjust if component name is different
                        if (downloadButton) {
                            player.controlBar.removeChild(downloadButton);
                            console.log('[Video.js] Download button removed from control bar.');
                        }
                    });

                    // --- Disable right-click on the video element ---
                    moviePlayerElement.addEventListener('contextmenu', function(e) {
                        e.preventDefault();
                        console.log('🚫 [Video Player] Right-click disabled on video.');
                    });
                });

                // --- Video Player Event Listeners for Ads and Overlay ---

                // Hide spinner and make overlay non-clickable when player is playing
                videoJsPlayerInstance.on('playing', () => {
                    console.log('[Video.js] Video playing event fired.');
                    if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'none'; // Allow direct player interaction
                        videoOverlay.classList.add('hidden'); // Fully hide it when playing
                    }
                });

                // Show spinner and make overlay clickable when buffering
                videoJsPlayerInstance.on('waiting', () => {
                    console.log('[Video.js] Video waiting (buffering).');
                    if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'block';
                    if (videoOverlay) {
                        // 💡 [تحسين التقطيع] ممكن نخلي overlay clickable عشان لو المستخدم عايز يتفاعل مع الإعلان وقت الـ buffering
                        videoOverlay.style.pointerEvents = 'auto'; 
                        videoOverlay.classList.remove('hidden'); // Show (transparent) overlay during buffering
                    }
                });

                // Open ad on pause, and make overlay clickable
                videoJsPlayerInstance.on('pause', () => {
                    console.log('[Video.js] Video paused.');
                    if (!videoJsPlayerInstance.ended()) { // Do not trigger ad on natural end
                        openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION, 'videoPause');
                        if (videoOverlay) {
                            videoOverlay.style.pointerEvents = 'auto'; // Make overlay clickable again
                            videoOverlay.classList.remove('hidden'); // Show (transparent) overlay
                        }
                    }
                });

                // Open ad when user seeks
                videoJsPlayerInstance.on('seeked', () => {
                    console.log('[Video.js] Video seeked.');
                    openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION, 'videoSeek');
                    // No need to show overlay here, user just interacted with controls
                });

                // Show transparent overlay and hide spinner on error
                videoJsPlayerInstance.on('error', (e) => {
                    const error = videoJsPlayerInstance.error();
                    console.error('[Video.js] Player Error:', error ? error.message : 'Unknown error', error);
                    if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'auto';
                        videoOverlay.classList.remove('hidden');
                    }
                });

                // When video ends, open ad and make overlay clickable for restart
                videoJsPlayerInstance.on('ended', () => {
                    console.log('[Video.js] Video ended.');
                    openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION, 'videoEndedRestart'); // New type for ended event
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'auto';
                        videoOverlay.classList.remove('hidden');
                    }
                    // To make it easier to restart, setting current time to 0.
                    // This will allow a click on the overlay to restart from beginning.
                    videoJsPlayerInstance.currentTime(0);
                });


            } else {
                console.warn('⚠️ [Video Player] moviePlayer element not found or not ready after attempts. Skipping Video.js initialization.');
                if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                if (videoOverlay) {
                    videoOverlay.style.display = 'flex'; // Ensure it's visible (though transparent)
                    videoOverlay.style.pointerEvents = 'auto';
                    videoOverlay.classList.remove('hidden');
                }
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
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute('href', window.location.href);

        document.title = `${movie.title} - مشاهدة أونلاين على شاهد بلس`;
        document.querySelector('meta[name="description"]')?.setAttribute('content', movie.description);
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', movie.title);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', movie.description);
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', movie.poster);
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.href);
        document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'video.movie');
        document.querySelector('meta[property="og:locale"]')?.setAttribute('content', 'ar_AR');

        let ogSiteName = document.querySelector('meta[property="og:site_name"]');
        if (!ogSiteName) {
            ogSiteName = document.createElement('meta');
            ogSiteName.setAttribute('property', 'og:site_name');
            document.head.appendChild(ogSiteName);
        }
        ogSiteName.setAttribute('content', 'شاهد بلس');

        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', movie.title);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', movie.description);
        document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', movie.poster);

        let twitterCard = document.querySelector('meta[name="twitter:card"]');
        if (!twitterCard) {
            twitterCard = document.createElement('meta');
            twitterCard.setAttribute('name', 'twitter:card');
            document.head.appendChild(twitterCard);
        }
        twitterCard.setAttribute('content', 'summary_large_image');

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
            "embedUrl": movie.embed_url, // Keep original embed_url for schema, as the signed one changes
            "duration": movie.duration,
            "contentUrl": movie.embed_url, // Keep original contentUrl for schema
            "publisher": {
                "@type": "Organization",
                "name": "شاهد بلس",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://example.com/images/shahed-plus-logo.png", // **تأكد من تغيير هذا المسار لشعار موقعك الفعلي**
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

        moviesDataForPagination = [...moviesData].sort(() => 0.5 - Math.random());
        paginateMovies(moviesDataForPagination, 1);

        // Ensure video overlay is hidden on home page
        if (videoOverlay) {
            videoOverlay.style.pointerEvents = 'none';
            videoOverlay.classList.add('hidden'); // Fully hide it on home
            if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
        }

        // Dispose existing Video.js player instance
        if (videoJsPlayerInstance) {
            console.log('[Video.js] Disposing player on home page navigation.');
            // 💡 [تحسين التقطيع] تدمير HLS.js instance لو موجودة
            if (videoJsPlayerInstance.hls) {
                videoJsPlayerInstance.hls.destroy();
                videoJsPlayerInstance.hls = null;
            }
            videoJsPlayerInstance.dispose();
            videoJsPlayerInstance = null;
        }
        currentDetailedMovie = null;

        // Clear movie-player-container content on home page navigation
        if (videoContainer) {
            videoContainer.innerHTML = '';
            console.log('[Video Player] Cleared movie-player-container on home page navigation.');
        }

        const newUrl = new URL(window.location.origin);
        history.pushState({ view: 'home' }, 'شاهد بلس - الصفحة الرئيسية', newUrl.toString());
        console.log(`🔗 [URL] URL updated to ${newUrl.toString()}`);

        // Reset meta tags to default home page values
        document.title = 'شاهد بلس - بوابتك الفاخرة للترفيه السينمائي | أفلام ومسلسلات 4K أونلاين';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'شاهد بلس: بوابتك الفاخرة للترفيه السينمائي. استمتع بأحدث الأفلام والمسلسلات العربية والأجنبية بجودة 4K فائقة الوضوح، مترجمة ومدبلجة، مع تجربة مشاهدة احترافية لا مثيل لها. اكتشف عالمًا من المحتوى الحصري والمتجدد.');
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'شاهد بلس - بوابتك الفاخرة للترفيه السينمائي | أفلام ومسلسلات 4K');
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', 'شاهد بلس: بوابتك الفاخرة للترفيه السينمائي. استمتع بأحدث الأفلام والمسلسلات العربية والأجنبية بجودة 4K فائقة الوضوح، مترجمة ومدبلجة، مع تجربة مشاهدة احترافية لا مثيل لها. اكتشف عالمًا من المحتوى الحصري والمتجدد.');
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.origin);
        document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'website');
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', 'https://images.unsplash.com/photo-1542204165-f938d2279b33?q=80&w=2670&auto=format&fit=crop'); // Default hero image
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

    // New logic for video overlay and ad interaction
    if (videoOverlay) {
        videoOverlay.addEventListener('click', (e) => {
            console.log('⏯️ [Ad Click] Video overlay clicked. Attempting to open Direct Link.');
            const adOpened = openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION, 'videoOverlay');

            if (adOpened) {
                // If ad opened, attempt to play the video after a short delay
                // This delay helps mitigate browser pop-up/autoplay restrictions
                setTimeout(() => {
                    if (videoJsPlayerInstance && (videoJsPlayerInstance.paused() || videoJsPlayerInstance.ended())) {
                        videoJsPlayerInstance.play().then(() => {
                            console.log('[Video.js] Player started playing after overlay click and ad open.');
                            if (videoOverlay) {
                                videoOverlay.style.pointerEvents = 'none';
                                videoOverlay.classList.add('hidden'); // Hide overlay fully
                            }
                            if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                        }).catch(error => {
                            console.warn('⚠️ [Video.js] Play failed after ad open (user interaction still required):', error);
                            // If play fails, keep overlay clickable. No specific text.
                            if (videoOverlay) {
                                videoOverlay.style.pointerEvents = 'auto';
                                videoOverlay.classList.remove('hidden'); // Ensure visible (though transparent)
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
                }, 500); // 500ms delay before attempting to play
            } else {
                console.log('[Video Overlay] Ad not opened due to cooldown. Overlay remains active.');
            }
            e.stopPropagation(); // Prevent clicks from bubbling to player if we want overlay to handle them first
        });
        console.log('[Video Overlay] Click listener attached for ad interaction.');
    }

    // Initial page load logic (handles direct URL access)
    function initialPageLoadLogic() {
        const urlParams = new URLSearchParams(window.location.search);
        const viewParam = urlParams.get('view');
        const idParam = urlParams.get('id');

        if (viewParam === 'details' && idParam) {
            // No need to parse int here, as showMovieDetails now handles string comparison
            console.log(`🚀 [Initial Load] Attempting to load movie details from URL: ID ${idParam}`);
            showMovieDetails(idParam);
        } else {
            console.log('🚀 [Initial Load] No specific view in URL. Showing home page.');
            showHomePage();
        }
    }

    window.addEventListener('popstate', (event) => {
        console.log('↩️ [Popstate] Browser history navigation detected.', event.state);
        if (event.state && event.state.view === 'details' && event.state.id) {
            showMovieDetails(event.state.id);
        } else {
            showHomePage();
        }
    });

    fetchMoviesData();
});
