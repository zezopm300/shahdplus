document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOM Content Loaded. Script execution started.');

    // --- 1. DOM Element References ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const homeNavLink = document.getElementById('home-nav-link-actual');
    const navLinks = document.querySelectorAll('.main-nav ul li a');
    const heroSection = document.getElementById('hero-section');
    const watchNowBtn = document.getElementById('watch-now-btn');
    const movieGridSection = document.getElementById('movie-grid-section');
    const movieDetailsSection = document.getElementById('movie-details-section');
    const movieGrid = document.getElementById('movie-grid');
    const suggestedMovieGrid = document.getElementById('suggested-movie-grid');
    const suggestedMoviesSection = document.getElementById('suggested-movies-section');
    const backToHomeBtn = document.getElementById('back-to-home-btn');
    const videoContainer = document.getElementById('movie-player-container'); // This is the div
    const videoOverlay = document.getElementById('video-overlay');
    const homeLogoLink = document.getElementById('home-logo-link');
    const videoLoadingSpinner = document.getElementById('video-loading-spinner');
    const movieDetailsPoster = document.getElementById('movie-details-poster');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');

    const moviesPerPage = 30; // القيمة الموصى بها لأداء أفضل على الموبايل

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
        '#movie-details-rating': document.getElementById('movie-details-rating'),
        '#home-nav-link-actual': homeNavLink,
        '#movie-details-poster': movieDetailsPoster // التأكد من وجود هذا العنصر
    };

    let criticalError = false;
    for (const [id, element] of Object.entries(requiredElements)) {
        if (!element) {
            console.error(`❌ خطأ فادح: العنصر بالمعرّف "${id}" غير موجود. يرجى التحقق من ملف HTML الخاص بك.`);
            criticalError = true;
        }
    }
    if (criticalError) {
        console.error('🛑 لن يتم تنفيذ السكريبت بالكامل بسبب عناصر DOM الأساسية المفقودة. قم بإصلاح HTML الخاص بك!');
        document.body.innerHTML = '<div style="text-align: center; margin-top: 100px; color: #f44336; font-size: 20px;">' +
                                    'عذرًا، حدث خطأ فني. يرجى تحديث الصفحة أو المحاولة لاحقًا.' +
                                    '<p style="font-size: 14px; color: #ccc;">(عناصر الصفحة الرئيسية مفقودة)</p></div>';
        return;
    } else {
        console.log('✅ تم العثور على جميع عناصر DOM الأساسية.');
    }

    // --- 2. Adsterra Configuration ---
    const ADSTERRA_DIRECT_LINK_URL = 'https://www.profitableratecpm.com/spqbhmyax?key=2469b039d4e7c471764bd04c57824cf2';
    // Cooldown for general movie card/poster clicks
    const DIRECT_LINK_COOLDOWN_MOVIE_CARD = 3 * 60 * 1000; // 3 minutes
    // Cooldown for video player interactions (play, pause, seek, end)
    const DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION = 10 * 1000; // 10 seconds

    let lastDirectLinkClickTimeMovieCard = 0;
    let lastDirectLinkClickTimeVideoInteraction = 0;

    /**
     * Opens an Adsterra direct link if the cooldown has passed.
     * @param {number} cooldownDuration - The cooldown period in milliseconds.
     * @param {string} type - The type of interaction ('movieCard', 'movieDetailsPoster', 'videoOverlay', etc.) for logging.
     * @returns {boolean} - True if the ad link was opened, false otherwise.
     */
    function openAdLink(cooldownDuration, type) {
        let lastClickTime;
        let setLastClickTime;

        // Determine which cooldown tracker to use based on the interaction type
        if (type === 'movieCard' || type === 'movieDetailsPoster') {
            lastClickTime = lastDirectLinkClickTimeMovieCard;
            setLastClickTime = (time) => lastDirectLinkClickTimeMovieCard = time;
        } else if (type === 'videoOverlay' || type === 'videoSeek' || type === 'videoPause' || type === 'videoEndedRestart') {
            lastClickTime = lastDirectLinkClickTimeVideoInteraction;
            setLastClickTime = (time) => lastDirectLinkClickTimeVideoInteraction = time;
        } else {
            console.error('نوع إعلان غير صالح لـ openAdLink:', type);
            return false;
        }

        const currentTime = Date.now();
        if (currentTime - lastClickTime > cooldownDuration) {
            const newWindow = window.open(ADSTERRA_DIRECT_LINK_URL, '_blank');
            if (newWindow) {
                newWindow.focus(); // Bring the new tab/window to focus
                setLastClickTime(currentTime); // Update the last click time
                console.log(`💰 [نقر إعلان - ${type}] تم فتح الرابط المباشر بنجاح.`);
                return true;
            } else {
                console.warn(`⚠️ [نقر إعلان - ${type}] تم حظر النافذة المنبثقة أو فشل فتح الرابط المباشر. تأكد من السماح بالنوافذ المنبثقة.`);
                return false;
            }
        } else {
            const timeLeft = (cooldownDuration - (currentTime - lastClickTime)) / 1000;
            console.log(`⏳ [نقر إعلان - ${type}] التهدئة للرابط المباشر نشطة. لن يتم فتح علامة تبويب جديدة. الوقت المتبقي: ${timeLeft.toFixed(1)} ثانية.`);
            return false;
        }
    }

    // --- 3. Movie Data & Video URL Handling ---
    let moviesData = []; // Stores all fetched movie data
    let moviesDataForPagination = []; // Stores movies filtered for current pagination/search view
    let currentDetailedMovie = null; // Stores the movie object currently displayed in details section
    let videoJsPlayerInstance = null; // Video.js player instance
    let videoJsScriptsLoaded = false; // Flag to prevent redundant script loading

    /**
     * Dynamically loads Video.js and HLS.js (if not already loaded).
     * This improves initial page load performance by deferring large script loads.
     */
    async function loadVideoJsAndHls() {
        if (videoJsScriptsLoaded) {
            console.log("Video.js and HLS.js already loaded, skipping dynamic load.");
            return;
        }

        console.log("Loading Video.js and HLS.js dynamically...");
        const head = document.getElementsByTagName('head')[0];

        const loadScript = (src, async = true) => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = async;
                script.onload = () => {
                    console.log(`Script loaded: ${src}`);
                    resolve();
                };
                script.onerror = () => {
                    console.error(`Failed to load script: ${src}`);
                    reject(new Error(`Failed to load script: ${src}`));
                };
                head.appendChild(script);
            });
        };

        const loadLink = (href) => {
            return new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                link.onload = () => {
                    console.log(`Stylesheet loaded: ${href}`);
                    resolve();
                };
                link.onerror = () => {
                    console.error(`Failed to load stylesheet: ${href}`);
                    reject(new Error(`Failed to load stylesheet: ${href}`));
                };
                head.appendChild(link);
            });
        };

        try {
            // Load CSS first to ensure styles are applied before scripts initialize components
            await loadLink('https://vjs.zencdn.net/8.10.0/video-js.css');
            // Then load scripts in parallel
            await Promise.all([
                loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest'),
                loadScript('https://vjs.zencdn.net/8.10.0/video.min.js')
            ]);
            // Load videojs-contrib-hls after video.min.js and hls.js
            await loadScript('https://cdn.jsdelivr.net/npm/videojs-contrib-hls@5.15.0/dist/videojs-contrib-hls.min.js');

            videoJsScriptsLoaded = true;
            console.log("All Video.js related scripts and stylesheets loaded successfully.");
        } catch (error) {
            console.error("Error loading video player assets:", error);
            // Show user-friendly error message if player assets fail to load
            if (videoContainer) {
                videoContainer.innerHTML = '<p style="text-align: center; color: var(--text-color); margin-top: 20px;">عذرًا، تعذر تحميل مشغل الفيديو. يرجى تحديث الصفحة والمحاولة مرة أخرى.</p>';
            }
        }
    }

    /**
     * Fetches movie data from movies.json.
     */
    async function fetchMoviesData() {
        try {
            console.log('📡 جلب بيانات الأفلام من movies.json...');
            const response = await fetch('movies.json');
            if (!response.ok) {
                throw new Error(`خطأ HTTP! الحالة: ${response.status} - تعذر تحميل movies.json. تحقق من مسار الملف وتكوين الخادم.`);
            }
            moviesData = await response.json();
            if (!Array.isArray(moviesData)) {
                console.error('❌ البيانات التي تم جلبها ليست مصفوفة. يرجى التحقق من تنسيق movies.json. المتوقع مصفوفة من كائنات الأفلام.');
                moviesData = []; // Reset to empty array if format is incorrect
            } else if (moviesData.length === 0) {
                console.warn('⚠️ تم تحميل movies.json، ولكنه فارغ.');
            }
            console.log('✅ تم تحميل بيانات الأفلام بنجاح من movies.json', moviesData.length, 'فيلمًا تم العثور عليهم.');
            initialPageLoadLogic(); // Call initial logic after data is fetched
        } catch (error) {
            console.error('❌ فشل تحميل بيانات الأفلام:', error.message);
            // Display a clear error message to the user
            if (movieGrid) {
                movieGrid.innerHTML = '<p style="text-align: center; color: var(--text-color); margin-top: 50px;">عذرًا، لم نتمكن من تحميل بيانات الأفلام. يرجى المحاولة مرة أخرى لاحقًا أو التحقق من ملف movies.json.</p>';
            }
            if (sectionTitleElement) {
                sectionTitleElement.textContent = 'خطأ في تحميل الأفلام';
            }
        }
    }

    /**
     * Creates a movie card DOM element.
     * @param {object} movie - The movie data object.
     * @returns {HTMLElement} The created movie card element.
     */
    function createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        // Use <picture> for WebP support with fallback to original image format
        const webpSource = movie.poster.replace(/\.(png|jpe?g)$/i, '.webp'); // Use $ to ensure end of string for replacement
        movieCard.innerHTML = `
            <picture>
                <source srcset="${webpSource}" type="image/webp">
                <img src="${movie.poster}" alt="${movie.title}" width="200" height="300" loading="lazy">
            </picture>
            <h3>${movie.title}</h3>
        `;
        // Add onerror for the source if WebP fails to load, remove the source so the browser falls back to <img>
        movieCard.querySelector('source').onerror = function() { this.remove(); };
        movieCard.addEventListener('click', () => {
            console.log(`⚡ [تفاعل] تم النقر على بطاقة الفيلم للمعّرف: ${movie.id}`);
            openAdLink(DIRECT_LINK_COOLDOWN_MOVIE_CARD, 'movieCard');
            showMovieDetails(movie.id);
        });
        return movieCard;
    }

    /**
     * Displays a given array of movies in a target grid element.
     * @param {Array<object>} moviesToDisplay - Array of movie objects.
     * @param {HTMLElement} targetGridElement - The DOM element to display movies in (e.g., movieGrid, suggestedMovieGrid).
     */
    function displayMovies(moviesToDisplay, targetGridElement) {
        if (!targetGridElement) {
            console.error('❌ displayMovies: العنصر المستهدف للشبكة فارغ أو غير معرّف.');
            return;
        }
        targetGridElement.innerHTML = ''; // Clear old content

        if (!moviesToDisplay || moviesToDisplay.length === 0) {
            targetGridElement.innerHTML = '<p style="text-align: center; color: var(--text-muted);">لا توجد أفلام مطابقة للبحث أو مقترحة.</p>';
            console.log(`🎬 [عرض] لا توجد أفلام للعرض في ${targetGridElement.id}.`);
            return;
        }

        console.log(`🎬 [عرض] جاري عرض ${moviesToDisplay.length} فيلم في ${targetGridElement.id}.`);
        moviesToDisplay.forEach(movie => {
            targetGridElement.appendChild(createMovieCard(movie));
        });
        console.log(`🎬 [عرض] تم عرض ${moviesToDisplay.length} فيلمًا في ${targetGridElement.id}.`);
    }

    /**
     * Paginates the given movies array and displays the current page.
     * @param {Array<object>} moviesArray - The full array of movies to paginate.
     * @param {number} page - The current page number.
     */
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
        console.log(`➡️ [ترقيم الصفحات] يتم عرض الصفحة ${page}. الأفلام من الفهرس ${startIndex} إلى ${Math.min(endIndex, moviesArray.length)-1}.`);
    }

    /**
     * Updates the disabled state of pagination buttons.
     * @param {number} totalMovies - The total number of movies in the current filtered/search result.
     */
    function updatePaginationButtons(totalMovies) {
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = currentPage * moviesPerPage >= totalMovies;
        console.log(`🔄 [ترقيم الصفحات] تم تحديث الأزرار. الصفحة الحالية: ${currentPage}, إجمالي الأفلام: ${totalMovies}`);
    }

    /**
     * Performs a search on the movies data based on user input.
     */
    function performSearch() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        let filteredMovies = [];
        if (query) {
            filteredMovies = moviesData.filter(movie =>
                movie.title.toLowerCase().includes(query) ||
                (movie.director && String(movie.director).toLowerCase().includes(query)) ||
                (Array.isArray(movie.cast) ? movie.cast.some(actor => String(actor).toLowerCase().includes(query)) : (movie.cast && String(movie.cast).toLowerCase().includes(query))) ||
                (Array.isArray(movie.genre) ? movie.genre.some(g => String(g).toLowerCase().includes(query)) : (movie.genre && String(movie.genre).toLowerCase().includes(query)))
            );
            if (sectionTitleElement) {
                sectionTitleElement.textContent = `نتائج البحث عن "${query}"`;
            }
            console.log(`🔍 [بحث] تم إجراء بحث عن "${query}". تم العثور على ${filteredMovies.length} نتيجة.`);
        } else {
            // If search query is empty, display all movies in random order
            filteredMovies = [...moviesData].sort(() => 0.5 - Math.random());
            if (sectionTitleElement) {
                sectionTitleElement.textContent = 'أحدث الأفلام';
            }
            console.log('🔍 [بحث] استعلام البحث فارغ، يتم عرض جميع الأفلام (عشوائياً).');
        }
        currentPage = 1;
        moviesDataForPagination = filteredMovies; // Update the data used for pagination
        paginateMovies(moviesDataForPagination, currentPage);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top after search
    }

    /**
     * Displays the details of a specific movie, including its video player.
     * @param {number|string} movieId - The ID of the movie to display.
     */
    async function showMovieDetails(movieId) {
        console.log(`🔍 [توجيه] عرض تفاصيل الفيلم للمعّرف: ${movieId}`);
        const movie = moviesData.find(m => m.id == movieId); // Use == for loose comparison if IDs might be mixed types

        if (movie) {
            currentDetailedMovie = movie;

            // Hide main sections
            if (heroSection) heroSection.style.display = 'none';
            if (movieGridSection) movieGridSection.style.display = 'none';

            // Destroy current Video.js instance before creating a new player
            if (videoJsPlayerInstance) {
                console.log('[Video.js] التخلص من مثيل المشغل الحالي قبل عرض تفاصيل جديدة.');
                videoJsPlayerInstance.dispose();
                videoJsPlayerInstance = null;
            }

            // Load Video.js and HLS.js libraries dynamically
            await loadVideoJsAndHls();

            // Recreate the video element within its container
            if (videoContainer) {
                videoContainer.innerHTML = ''; // Clear any old content
                const newVideoElement = document.createElement('video');
                newVideoElement.id = 'movie-player';
                newVideoElement.classList.add('video-js', 'vjs-default-skin');
                newVideoElement.controls = true;
                newVideoElement.preload = 'auto'; // Important for SEO (tells browser to load some data)
                newVideoElement.setAttribute('playsinline', ''); // For inline playback on mobile
                newVideoElement.setAttribute('poster', movie.poster); // Set the poster image
                videoContainer.appendChild(newVideoElement);
                console.log('[مشغل الفيديو] تم إعادة إنشاء عنصر movie-player.');
            } else {
                console.error('❌ خطأ فادح: movie-player-container غير موجود. لا يمكن إنشاء مشغل الفيديو.');
                return;
            }

            // Show movie details and suggested movies sections
            if (movieDetailsSection) movieDetailsSection.style.display = 'block';
            if (suggestedMoviesSection) suggestedMoviesSection.style.display = 'block';

            // Scroll to the top of the page
            window.scrollTo({ top: 0, behavior: 'smooth' });
            console.log('[توجيه] تم التمرير للأعلى.');

            // Update movie details information
            document.getElementById('movie-details-title').textContent = movie.title || 'غير متوفر';
            document.getElementById('movie-details-description').textContent = movie.description || 'لا يوجد وصف متاح.';
            const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير متوفر';
            document.getElementById('movie-details-release-date').textContent = releaseDate;
            document.getElementById('movie-details-genre').textContent = Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || 'غير محدد';
            document.getElementById('movie-details-director').textContent = movie.director || 'غير متوفر';
            document.getElementById('movie-details-cast').textContent = Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || 'غير متوفر';
            document.getElementById('movie-details-duration').textContent = movie.duration || 'غير متوفر';
            document.getElementById('movie-details-rating').textContent = movie.rating || 'N/A';

            // Update movie details poster
            if (movieDetailsPoster) {
                movieDetailsPoster.src = movie.poster;
                movieDetailsPoster.alt = movie.title;
                movieDetailsPoster.setAttribute('width', '300'); // Explicitly set dimensions
                movieDetailsPoster.setAttribute('height', '450'); // Explicitly set dimensions
                console.log(`[تفاصيل] تم تعيين البوستر لـ ${movie.title}`);
            }

            const moviePlayerElement = document.getElementById('movie-player');
            const videoUrl = movie.embed_url; // Direct video link

            if (!videoUrl) {
                console.error(`❌ فشل الحصول على رابط الفيديو لمعّرف الفيلم: ${movieId}. لا يمكن تهيئة المشغل.`);
                if (videoContainer) {
                    videoContainer.innerHTML = '<p style="text-align: center; color: var(--text-color); margin-top: 20px;">عذرًا، لا يمكن تشغيل الفيديو حاليًا (الرابط غير صالح). يرجى المحاولة لاحقًا.</p>';
                }
                // Ensure overlay is hidden if video cannot be played
                if (videoOverlay) {
                    videoOverlay.style.pointerEvents = 'none';
                    videoOverlay.classList.add('hidden');
                }
                if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                return;
            }

            // Ensure Video.js is loaded before initialization
            if (window.videojs) {
                // Wait for the video element to be visible in the DOM
                await new Promise(resolve => {
                    const checkVisibility = () => {
                        if (moviePlayerElement && moviePlayerElement.offsetParent !== null) {
                            console.log('[مشغل الفيديو] عنصر moviePlayer متصل ومرئي الآن. حل الوعد.');
                            resolve();
                        } else {
                            requestAnimationFrame(checkVisibility);
                        }
                    };
                    setTimeout(() => requestAnimationFrame(checkVisibility), 50); // Give DOM a short time to update
                });

                console.log('[مشغل الفيديو] moviePlayer جاهز. المتابعة بتهيئة Video.js.');

                // Determine video type for Video.js source
                let videoSourceType = 'video/mp4'; // Default to mp4
                if (videoUrl.includes('.m3u8')) {
                    videoSourceType = 'application/x-mpegURL'; // HLS
                } else if (videoUrl.includes('.webm')) {
                    videoSourceType = 'video/webm';
                }

                videoJsPlayerInstance = videojs(moviePlayerElement, {
                    autoplay: false,
                    controls: true,
                    responsive: true,
                    fluid: true,
                    techOrder: ['html5'], // Ensure HTML5 tech is used
                    html5: {
                        nativeControlsForTouch: true, // Use native controls on touch devices
                        vhs: { // HLS settings (if you use HLS - m3u8)
                            limitRenditionByPlayerDimensions: false,
                            enableLowInitialPlaylist: true,
                            fastQualityChange: true,
                            maxBufferLength: 10,
                            maxMaxBufferLength: 30,
                        },
                    },
                    playbackRates: [0.5, 1, 1.5, 2],
                    sources: [{
                        src: videoUrl,
                        type: videoSourceType // Correct type based on URL
                    }],
                    crossOrigin: 'anonymous' // Necessary for videos from different origins
                }, function() {
                    console.log(`[Video.js] تم تهيئة المشغل بنجاح للمصدر: ${videoUrl}`);
                    // Show spinner if video is still loading
                    if (videoLoadingSpinner && !this.hasStarted() && !this.paused() && !this.ended()) {
                        videoLoadingSpinner.style.display = 'block';
                    }
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'auto'; // Allow clicks on overlay initially
                        videoOverlay.classList.remove('hidden');
                    }

                    this.ready(function() {
                        const player = this;
                        // Remove download button if it exists (Video.js plugins might add it)
                        const downloadButton = player.controlBar.getChild('DownloadButton') || player.controlBar.getChild('DownloadToggle');
                        if (downloadButton) {
                            player.controlBar.removeChild(downloadButton);
                            console.log('[Video.js] تمت إزالة زر التنزيل من شريط التحكم.');
                        } else {
                            console.log('[Video.js] لم يتم العثور على زر تنزيل افتراضي لإزالته.');
                        }
                        // Prevent right-click on the video element itself
                        player.tech_.el_.addEventListener('contextmenu', function(e) {
                            e.preventDefault();
                            console.log('🚫 [مشغل الفيديو] تم تعطيل النقر بالزر الأيمن على عنصر الفيديو.');
                        });
                    });
                });

                // Handle player events to show/hide spinner and overlay
                videoJsPlayerInstance.on('loadstart', () => {
                    console.log('[Video.js] حدث بدء تحميل الفيديو.');
                    if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'block';
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'auto';
                        videoOverlay.classList.remove('hidden');
                    }
                });

                videoJsPlayerInstance.on('playing', () => {
                    console.log('[Video.js] حدث تشغيل الفيديو.');
                    if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'none';
                        videoOverlay.classList.add('hidden');
                    }
                });

                videoJsPlayerInstance.on('waiting', () => {
                    console.log('[Video.js] الفيديو في وضع الانتظار (تخزين مؤقت).');
                    if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'block';
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'auto';
                        videoOverlay.classList.remove('hidden');
                    }
                });

                videoJsPlayerInstance.on('pause', () => {
                    console.log('[Video.js] تم إيقاف الفيديو مؤقتًا.');
                    if (!videoJsPlayerInstance.ended()) { // Only open ad if not ended
                        openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION, 'videoPause');
                        if (videoOverlay) {
                            videoOverlay.style.pointerEvents = 'auto';
                            videoOverlay.classList.remove('hidden');
                        }
                    }
                });

                videoJsPlayerInstance.on('seeked', () => {
                    console.log('[Video.js] تم البحث في الفيديو.');
                    openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION, 'videoSeek');
                });

                videoJsPlayerInstance.on('error', (e) => {
                    const error = videoJsPlayerInstance.error();
                    console.error('[Video.js] خطأ المشغل:', error ? error.message : 'خطأ غير معروف', error);
                    if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'auto';
                        videoOverlay.classList.remove('hidden'); // Ensure overlay is visible if an error occurs
                    }
                    // Display a clear error message in the video player area itself
                    const errorDisplay = document.createElement('div');
                    errorDisplay.className = 'vjs-error-display';
                    errorDisplay.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.8); color: white; text-align: center; font-size: 1.2em; z-index: 10; padding: 20px;';
                    errorDisplay.innerHTML = `<p>عذرًا، لا يمكن تشغيل الفيديو حاليًا.<br>السبب: ${error ? error.message : 'خطأ غير معروف'}.</p><button onclick="window.location.reload()" style="background-color: var(--primary-color); color: white; border: none; padding: 10px 20px; margin-top: 15px; cursor: pointer; border-radius: 5px;">إعادة تحميل الصفحة</button>`;
                    if (videoContainer && !videoContainer.querySelector('.vjs-error-display')) {
                        videoContainer.appendChild(errorDisplay);
                    }
                });

                videoJsPlayerInstance.on('ended', () => {
                    console.log('[Video.js] انتهى الفيديو.');
                    openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION, 'videoEndedRestart');
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'auto';
                        videoOverlay.classList.remove('hidden');
                    }
                    videoJsPlayerInstance.currentTime(0); // Return video to start after ending
                });

            } else {
                console.warn('⚠️ [مشغل الفيديو] Video.js لم يتم تحميله بعد أو حدث خطأ في تحميله. لا يمكن تهيئة المشغل.');
                if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                if (videoOverlay) {
                    videoOverlay.style.display = 'flex';
                    videoOverlay.style.pointerEvents = 'auto';
                    videoOverlay.classList.remove('hidden');
                }
                // Message to user if player couldn't load
                if (videoContainer) {
                    videoContainer.innerHTML = '<p style="text-align: center; color: var(--text-color); margin-top: 20px;">عذرًا، تعذر تحميل مشغل الفيديو. يرجى تحديث الصفحة والمحاولة مرة أخرى.</p>';
                }
            }

            // Update browser URL (pushState) for deep linking and history
            const movieSlug = movie.title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '').replace(/\s+/g, '-');
            const newUrl = new URL(window.location.origin);
            newUrl.searchParams.set('view', 'details');
            newUrl.searchParams.set('id', movieId);
            newUrl.searchParams.set('title', movieSlug); // Add title for SEO-friendly URL

            history.pushState({ view: 'details', id: movieId }, movie.title, newUrl.toString());
            console.log(`🔗 [URL] تم تحديث URL إلى ${newUrl.toString()}`);

            // Update Meta Tags and JSON-LD for SEO
            updateMetaTags(movie);
            addJsonLdSchema(movie);

            // Display suggested movies
            displaySuggestedMovies(movieId);
            console.log(`✨ [اقتراحات] استدعاء displaySuggestedMovies للمعّرف: ${movieId}`);

        } else {
            console.error('❌ [توجيه] الفيلم غير موجود للمعّرف:', movieId, 'يتم إعادة التوجيه إلى الصفحة الرئيسية.');
            showHomePage(); // Go back to home page if movie not found
        }
    }

    /**
     * Updates HTML meta tags for SEO and social media sharing.
     * @param {object} [movie=null] - The movie object if displaying details, otherwise null for home page.
     */
    function updateMetaTags(movie = null) {
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
        }

        let pageTitle, pageDescription, pageKeywords, ogUrl, ogTitle, ogDescription, ogImage, ogType, ogVideoUrl, ogVideoType, ogVideoWidth, ogVideoHeight;
        let twitterTitle, twitterDescription, twitterImage;

        if (movie) {
            const currentUrl = window.location.href;
            canonicalLink.setAttribute('href', currentUrl);

            pageTitle = `${movie.title} - مشاهدة أونلاين على شاهد بلس بجودة عالية`;
            const shortDescription = (movie.description || `شاهد فيلم ${movie.title} أونلاين بجودة عالية. استمتع بأحدث الأفلام والمسلسلات العربية والأجنبية بجودة 4K فائقة الوضوح.`).substring(0, 155);
            pageDescription = shortDescription + (movie.description && movie.description.length > 155 ? '...' : '');

            const movieGenres = Array.isArray(movie.genre) ? movie.genre.join(', ') : String(movie.genre || '').trim();
            const movieCast = Array.isArray(movie.cast) ? movie.cast.join(', ') : String(movie.cast || '').trim();
            pageKeywords = [
                movie.title,
                movieGenres,
                movie.director,
                movieCast,
                'شاهد بلس', 'مشاهدة أونلاين', 'فيلم', 'بجودة عالية',
                'أفلام عربية', 'أفلام أجنبية', 'مسلسلات حصرية', 'أفلام 4K',
                'مشاهدة مجانية', 'مترجم', 'مدبلج'
            ].filter(Boolean).join(', ');

            ogUrl = currentUrl;
            ogTitle = `${movie.title} - مشاهدة أونلاين على شاهد بلس`;
            ogDescription = pageDescription;
            ogImage = movie.poster;
            ogType = "video.movie"; // Appropriate OG type for a movie page
            ogVideoUrl = movie.embed_url; // Direct video link for OG
            ogVideoType = movie.embed_url.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'; // Dynamic video type
            ogVideoWidth = '1280'; // Common video width (adjust if you have specific values)
            ogVideoHeight = '720'; // Common video height (adjust if you have specific values)

            twitterTitle = ogTitle;
            twitterDescription = ogDescription;
            twitterImage = ogImage;

        } else {
            // Meta data for the home page
            pageTitle = 'شاهد بلس - بوابتك الفاخرة للترفيه السينمائي | أفلام ومسلسلات 4K أونلاين';
            pageDescription = 'شاهد بلس: بوابتك الفاخرة للترفيه السينمائي. استمتع بأحدث الأفلام والمسلسلات العربية والأجنبية بجودة 4K فائقة الوضوح، مترجمة ومدبلجة، مع تجربة مشاهدة احترافية لا مثيل لها. اكتشف عالمًا من المحتوى الحصري والمتجدد.';
            pageKeywords = 'شاهد بلس، أفلام، مسلسلات، مشاهدة أونلاين، 4K، أفلام عربية، أفلام أجنبية، مسلسلات حصرية، سينما، ترفيه فاخر، مترجم، دبلجة، أفلام 2025، مسلسلات جديدة، أكشن، دراما، خيال علمي، كوميديا';

            ogUrl = window.location.origin + '/';
            canonicalLink.setAttribute('href', ogUrl);
            ogTitle = 'شاهد بلس - بوابتك الفاخرة للترفيه السينمائي | أفلام ومسلسلات 4K';
            ogDescription = pageDescription; // Use main page description
            ogImage = 'https://shahidplus.online/images/your-site-logo-for-og.png'; // Site logo
            ogType = 'website';
            ogVideoUrl = ''; // No specific video for the homepage
            ogVideoType = '';
            ogVideoWidth = '';
            ogVideoHeight = '';

            twitterTitle = ogTitle;
            twitterDescription = ogDescription;
            twitterImage = ogImage;
        }

        // Update all Meta tags in the <head>
        document.title = pageTitle;
        document.querySelector('meta[name="description"]')?.setAttribute('content', pageDescription);
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', pageKeywords);

        document.querySelector('meta[property="og:title"]')?.setAttribute('content', ogTitle);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', ogDescription);
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', ogImage);
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', ogUrl);
        document.querySelector('meta[property="og:type"]')?.setAttribute('content', ogType);
        document.querySelector('meta[property="og:locale"]')?.setAttribute('content', 'ar_AR');
        document.querySelector('meta[property="og:site_name"]')?.setAttribute('content', 'شاهد بلس');
        document.querySelector('meta[property="og:image:alt"]')?.setAttribute('content', ogTitle);
        
        // Update OG video tags
        let ogVideoMeta = document.querySelector('meta[property="og:video"]');
        if (!ogVideoMeta) { ogVideoMeta = document.createElement('meta'); ogVideoMeta.setAttribute('property', 'og:video'); document.head.appendChild(ogVideoMeta); }
        ogVideoMeta.setAttribute('content', ogVideoUrl);

        let ogVideoTypeMeta = document.querySelector('meta[property="og:video:type"]');
        if (!ogVideoTypeMeta) { ogVideoTypeMeta = document.createElement('meta'); ogVideoTypeMeta.setAttribute('property', 'og:video:type'); document.head.appendChild(ogVideoTypeMeta); }
        ogVideoTypeMeta.setAttribute('content', ogVideoType);
        
        // Add or update og:video:width and og:video:height
        let ogVideoWidthMeta = document.querySelector('meta[property="og:video:width"]');
        if (!ogVideoWidthMeta) { ogVideoWidthMeta = document.createElement('meta'); ogVideoWidthMeta.setAttribute('property', 'og:video:width'); document.head.appendChild(ogVideoWidthMeta); }
        ogVideoWidthMeta.setAttribute('content', ogVideoWidth);

        let ogVideoHeightMeta = document.querySelector('meta[property="og:video:height"]');
        if (!ogVideoHeightMeta) { ogVideoHeightMeta = document.createElement('meta'); ogVideoHeightMeta.setAttribute('property', 'og:video:height'); document.head.appendChild(ogVideoHeightMeta); }
        ogVideoHeightMeta.setAttribute('content', ogVideoHeight);


        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', twitterTitle);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', twitterDescription);
        document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', twitterImage);
        document.querySelector('meta[name="twitter:card"]')?.setAttribute('content', 'summary_large_image');
        let twitterCreator = document.querySelector('meta[name="twitter:creator"]');
        if (!twitterCreator) {
            twitterCreator = document.createElement('meta');
            twitterCreator.name = 'twitter:creator';
            document.head.appendChild(twitterCreator);
        }
        twitterCreator.setAttribute('content', '@YourTwitterHandle');

        console.log('📄 [SEO] تم تحديث الميتا تاجز.');
    }

    /**
     * Adds or updates JSON-LD Schema.org data for the current page.
     * @param {object} [movie=null] - The movie object if displaying details, otherwise null for home page.
     */
    function addJsonLdSchema(movie = null) {
        let oldScript = document.querySelector('script[type="application/ld+json"]');
        if (oldScript) {
            oldScript.remove();
            console.log('📄 [SEO] تم إزالة مخطط JSON-LD القديم.');
        }

        let schema;

        if (movie) {
            // Schema for a Movie with an embedded VideoObject
            let formattedUploadDate;
            if (movie.release_date) {
                try {
                    const date = new Date(movie.release_date);
                    // Ensure valid date, otherwise fallback to current date
                    formattedUploadDate = !isNaN(date.getTime()) ? date.toISOString() : new Date().toISOString();
                } catch (e) {
                    console.warn(`⚠️ [SEO] فشل تحليل تاريخ الإصدار "${movie.release_date}". استخدام التاريخ الحالي لـ JSON-LD.`);
                    formattedUploadDate = new Date().toISOString();
                }
            } else {
                formattedUploadDate = new Date().toISOString();
            }

            const castArray = Array.isArray(movie.cast) ? movie.cast : String(movie.cast || '').split(',').map(s => s.trim()).filter(s => s !== '');
            const genreArray = Array.isArray(movie.genre) ? movie.genre : String(movie.genre || '').split(',').map(s => s.trim()).filter(s => s !== '');

            schema = {
                "@context": "http://schema.org",
                "@type": "Movie",
                "name": movie.title,
                "description": movie.description || `مشاهدة وتحميل فيلم ${movie.title} بجودة عالية على شاهد بلس. استمتع بمشاهدة أحدث الأفلام والمسلسلات الحصرية.`,
                "image": movie.poster,
                "url": window.location.href, // Actual URL of the movie page
                "uploadDate": formattedUploadDate, // Represents the date the content was published/uploaded to this platform
                "potentialAction": {
                    "@type": "WatchAction",
                    "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": window.location.href, // URL where the movie can be watched
                        "inLanguage": "ar",
                        "actionPlatform": [
                            "http://schema.org/DesktopWebPlatform",
                            "http://schema.org/MobileWebPlatform"
                        ]
                    },
                    "expectsAcceptanceOf": {
                        "@type": "Offer",
                        "name": "مشاهدة الفيلم",
                        "price": "0",
                        "priceCurrency": "USD",
                        "availability": "http://schema.org/InStock",
                        "url": window.location.href
                    }
                },
                "video": { // The video as part of the movie details
                    "@type": "VideoObject",
                    "name": movie.title,
                    "description": movie.description || `مشاهدة وتحميل فيلم ${movie.title} بجودة عالية على شاهد بلس.`,
                    "uploadDate": formattedUploadDate,
                    "thumbnailUrl": movie.poster,
                    "contentUrl": movie.embed_url, // Direct link to the video file
                    "embedUrl": window.location.href, // URL of the page embedding the video (most important for search engines)
                    "duration": movie.duration || "PT1H30M", // Example: "PT1H30M" for 1 hour 30 minutes
                    "interactionCount": "100000" // Estimated views
                }
            };

            if (movie.director && typeof movie.director === 'string' && movie.director.trim() !== '') {
                schema.director = { "@type": "Person", "name": movie.director.trim() };
            }
            if (castArray.length > 0) {
                schema.actor = castArray.map(actor => ({ "@type": "Person", "name": actor }));
            }
            if (genreArray.length > 0) {
                schema.genre = genreArray;
            }
            if (movie.rating) {
                let ratingValue;
                if (typeof movie.rating === 'string' && movie.rating.includes('/')) {
                    ratingValue = parseFloat(movie.rating.split('/')[0]);
                } else {
                    ratingValue = parseFloat(movie.rating);
                }
                if (!isNaN(ratingValue) && ratingValue >= 0 && ratingValue <= 10) { // Assuming 0-10 scale
                    schema.aggregateRating = {
                        "@type": "AggregateRating",
                        "ratingValue": ratingValue.toFixed(1),
                        "bestRating": "10",
                        "ratingCount": "10000" // Estimated number of ratings
                    };
                }
            }

        } else {
            // Schema for a WebSite (Homepage)
            console.log('📄 [SEO] لا يوجد مخطط JSON-LD للفيلم. يتم إنشاء مخطط WebSite.');
            schema = {
                "@context": "http://schema.org",
                "@type": "WebSite",
                "name": "شاهد بلس",
                "url": "https://shahidplus.online/",
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://shahidplus.online/?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                },
                "about": "منصة ترفيه سينمائي تقدم أحدث الأفلام والمسلسلات العربية والأجنبية بجودة 4K."
            };
        }

        let script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema, null, 2); // null, 2 for pretty printing in DOM
        document.head.appendChild(script);
        console.log('📄 [SEO] تم إضافة/تحديث مخطط JSON-LD الجديد.');
    }

    /**
     * Shows the home page view and hides movie details.
     */
    function showHomePage() {
        console.log('🏠 [توجيه] عرض الصفحة الرئيسية.');
        // Hide movie details sections
        if (movieDetailsSection) movieDetailsSection.style.display = 'none';
        if (suggestedMoviesSection) suggestedMoviesSection.style.display = 'none';

        // Show main sections
        if (heroSection) heroSection.style.display = 'flex';
        if (movieGridSection) movieGridSection.style.display = 'block';

        // Reset search field and section title
        if (searchInput) searchInput.value = '';
        if (sectionTitleElement) sectionTitleElement.textContent = 'أحدث الأفلام';

        // Initialize movies for home page (random order)
        if (moviesData.length > 0) {
            moviesDataForPagination = [...moviesData].sort(() => 0.5 - Math.random());
        } else {
            console.warn('⚠️ [الصفحة الرئيسية] بيانات الأفلام ليست محملة، سيتم الانتظار لتحميلها.');
        }

        currentPage = 1;
        paginateMovies(moviesDataForPagination, currentPage); // Display the first page of movies

        // Hide and stop video overlay interactions and player
        if (videoOverlay) {
            videoOverlay.style.pointerEvents = 'none';
            videoOverlay.classList.add('hidden');
            if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
        }

        // Dispose of the current Video.js player instance
        if (videoJsPlayerInstance) {
            console.log('[Video.js] التخلص من المشغل عند الانتقال للصفحة الرئيسية.');
            videoJsPlayerInstance.dispose();
            videoJsPlayerInstance = null;
        }
        currentDetailedMovie = null; // Clear current detailed movie

        // Clear video container content
        if (videoContainer) {
            videoContainer.innerHTML = '';
            console.log('[مشغل الفيديو] تم مسح movie-player-container عند الانتقال للصفحة الرئيسية.');
        }

        // Update browser URL to home page
        const newUrl = new URL(window.location.origin);
        history.pushState({ view: 'home' }, 'شاهد بلس - الصفحة الرئيسية', newUrl.toString());
        console.log(`🔗 [URL] تم تحديث URL إلى ${newUrl.toString()}`);

        // Update Meta Tags and JSON-LD for the home page
        updateMetaTags();
        addJsonLdSchema(); // This will create the WebSite schema

        // Ensure Twitter creator tag is present and correct
        let twitterCreator = document.querySelector('meta[name="twitter:creator"]');
        if (twitterCreator) twitterCreator.setAttribute('content', '@YourTwitterHandle');
    }

    /**
     * Displays a grid of suggested movies based on the current detailed movie's genre.
     * @param {number|string} currentMovieId - The ID of the currently viewed movie.
     */
    function displaySuggestedMovies(currentMovieId) {
        if (!suggestedMovieGrid || !currentDetailedMovie) {
            console.error('❌ displaySuggestedMovies: suggestedMovieGrid أو currentDetailedMovie غير موجودين. لا يمكن عرض الأفلام المقترحة.');
            return;
        }

        const currentMovieGenre = currentDetailedMovie.genre;
        let suggested = [];

        if (currentMovieGenre) {
            const currentMovieGenresArray = Array.isArray(currentMovieGenre)
                ? currentMovieGenre.map(g => String(g).toLowerCase().trim())
                : [String(currentMovieGenre).toLowerCase().trim()];

            suggested = moviesData.filter(movie =>
                movie.id !== currentMovieId &&
                (Array.isArray(movie.genre)
                    ? movie.genre.some(g => currentMovieGenresArray.includes(String(g).toLowerCase().trim()))
                    : currentMovieGenresArray.includes(String(movie.genre || '').toLowerCase().trim())
                )
            );
            suggested = suggested.sort(() => 0.5 - Math.random()); // Shuffle genre-matched suggestions
        }

        // If genre-based suggestions are not enough, add random movies to fill up to 24
        if (suggested.length < 24) {
            const otherMovies = moviesData.filter(movie => movie.id !== currentMovieId && !suggested.includes(movie));
            const shuffledOthers = otherMovies.sort(() => 0.5 - Math.random());
            const needed = 24 - suggested.length;
            suggested = [...suggested, ...shuffledOthers.slice(0, needed)];
        }

        const finalSuggested = suggested.slice(0, 24); // Display max 24 suggested movies

        if (finalSuggested.length === 0) {
            suggestedMovieGrid.innerHTML = '<p style="text-align: center; color: var(--text-muted);">لا توجد أفلام مقترحة حالياً.</p>';
            console.log('✨ [اقتراحات] لا توجد أفلام مقترحة متاحة بعد التصفية.');
            return;
        }

        displayMovies(finalSuggested, suggestedMovieGrid);
        console.log(`✨ [اقتراحات] تم عرض ${finalSuggested.length} فيلمًا مقترحًا في ${suggestedMovieGrid.id}.`);
    }

    // --- 5. Event Listeners ---
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('nav-open');
            console.log('☰ [تفاعل] تم تبديل القائمة.');
        });
    }

    if (homeNavLink) {
        homeNavLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🏠 [تفاعل] تم النقر على رابط الرئيسية في قائمة التنقل.');
            showHomePage();
            if (mainNav && mainNav.classList.contains('nav-open')) {
                mainNav.classList.remove('nav-open');
            }
        });
    }

    navLinks.forEach(link => {
        if (link.id !== 'home-nav-link-actual') { // Exclude the home page link as it has its own handler
            link.addEventListener('click', () => {
                // Close mobile navigation after clicking a sub-link
                if (mainNav && mainNav.classList.contains('nav-open')) {
                    mainNav.classList.remove('nav-open');
                    console.log('📱 [تفاعل] تم النقر على رابط تنقل فرعي، تم إغلاق القائمة.');
                } else {
                    console.log('📱 [تفاعل] تم النقر على رابط تنقل فرعي.');
                }
            });
        }
    });

    if (watchNowBtn && movieGridSection) {
        watchNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🎬 [تفاعل] تم النقر على زر "شاهد الآن".');
            movieGridSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', () => {
            console.log('🔙 [تفاعل] تم النقر على زر العودة للصفحة الرئيسية.');
            showHomePage();
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
        console.log('🔍 [حدث] تم إرفاق مستمع زر البحث.');
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
                searchInput.blur(); // Hide virtual keyboard on mobile
            }
        });
        console.log('🔍 [حدث] تم إرفاق مستمع ضغط مفتاح البحث.');
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                paginateMovies(moviesDataForPagination, currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top of new page
            }
            console.log(`⬅️ [ترقيم الصفحات] تم النقر على الصفحة السابقة. الصفحة الحالية: ${currentPage}`);
        });
    }
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(moviesDataForPagination.length / moviesPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                paginateMovies(moviesDataForPagination, currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top of new page
            }
            console.log(`➡️ [ترقيم الصفحات] تم النقر على الصفحة التالية. الصفحة الحالية: ${currentPage}`);
        });
    }

    if (homeLogoLink) {
        homeLogoLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🏠 [تفاعل] تم النقر على شعار الصفحة الرئيسية.');
            showHomePage();
        });
    }

    if (movieDetailsPoster) {
        movieDetailsPoster.addEventListener('click', () => {
            console.log('🖼️ [نقر إعلان] تم النقر على بوستر تفاصيل الفيلم. محاولة فتح الرابط المباشر.');
            openAdLink(DIRECT_LINK_COOLDOWN_MOVIE_CARD, 'movieDetailsPoster');
        });
        console.log('[حدث] تم إرفاق مستمع النقر على بوستر تفاصيل الفيلم.');
    }

    if (videoOverlay) {
        videoOverlay.addEventListener('click', async (e) => {
            console.log('⏯️ [نقر إعلان] تم النقر على غطاء الفيديو. محاولة فتح الرابط المباشر.');
            const adOpened = openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION, 'videoOverlay');

            if (adOpened) {
                // Wait briefly to give the browser a chance to open the new tab before attempting playback
                await new Promise(resolve => setTimeout(resolve, 500));

                if (videoJsPlayerInstance && videoJsPlayerInstance.isReady_) {
                    try {
                        await videoJsPlayerInstance.play();
                        console.log('[Video.js] بدأ المشغل في التشغيل بعد النقر على الغطاء وفتح الإعلان.');
                        if (videoOverlay) {
                            videoOverlay.style.pointerEvents = 'none';
                            videoOverlay.classList.add('hidden');
                        }
                        if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                    } catch (error) {
                        console.warn('⚠️ [Video.js] فشل التشغيل التلقائي بعد فتح الإعلان (قد لا تزال تتطلب تفاعل المستخدم):', error);
                        // If playback fails, keep the overlay active
                        if (videoOverlay) {
                            videoOverlay.style.pointerEvents = 'auto';
                            videoOverlay.classList.remove('hidden');
                        }
                        if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                    }
                } else {
                    console.warn('[Video.js] مثيل المشغل غير جاهز أو غير موجود عند محاولة التشغيل عبر النقر على الغطاء بعد الإعلان. سيظل الغطاء نشطًا.');
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'auto';
                        videoOverlay.classList.remove('hidden');
                    }
                    if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                }
            } else {
                console.log('[غطاء الفيديو] الإعلان لم يفتح بسبب التهدئة. سيظل الغطاء نشطًا.');
            }
            e.stopPropagation(); // Prevent event bubbling to the video element itself under the overlay
        });
        console.log('[غطاء الفيديو] تم إرفاق مستمع النقر لتفاعل الإعلان.');
    }

    // Security Features (Prevent right-click, dev tools shortcuts)
    document.addEventListener('contextmenu', e => {
        e.preventDefault();
        console.warn('🚫 [أمان] تم تعطيل النقر بالزر الأيمن.');
    });

    document.addEventListener('keydown', e => {
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
            (e.ctrlKey && e.key === 'u') ||
            (e.metaKey && e.altKey && e.key === 'I') // Mac dev tools
        ) {
            e.preventDefault();
            console.warn(`🚫 [أمان] تم منع اختصار لوحة المفاتيح لأدوات المطور/المصدر: ${e.key}`);
        }
    });

    // DevTools Detector (can be annoying but kept based on your request)
    const devtoolsDetector = (() => {
        const threshold = 160; // Pixel size for detection
        let isOpen = false;
        const checkDevTools = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            if (widthThreshold || heightThreshold) {
                if (!isOpen) {
                    isOpen = true;
                    console.warn('🚨 [أمان] تم اكتشاف أدوات المطور! هذا الإجراء غير مشجع.');
                }
            } else {
                if (isOpen) {
                    isOpen = false;
                    console.log('✅ [أمان] تم إغلاق أدوات المطور.');
                }
            }
        };

        window.addEventListener('resize', checkDevTools);
        // Check periodically in case of resizing without page reload
        setInterval(checkDevTools, 1000); // Check every second
        checkDevTools(); // Initial check on load
    })();

    // --- Initial Page Load Logic (Application Start) ---
    /**
     * Determines which view to show on initial page load based on URL parameters.
     */
    function initialPageLoadLogic() {
        const urlParams = new URLSearchParams(window.location.search);
        const viewParam = urlParams.get('view');
        const idParam = urlParams.get('id');

        if (viewParam === 'details' && idParam) {
            const movieId = parseInt(idParam);
            const movie = moviesData.find(m => m.id === movieId); // Find movie in the loaded data

            if (!isNaN(movieId) && movie) {
                console.log(`🚀 [تحميل أولي] محاولة تحميل تفاصيل الفيلم من URL: المعّرف ${movieId}`);
                updateMetaTags(movie);
                addJsonLdSchema(movie);
                showMovieDetails(movieId); // Display details for the specific movie
            } else {
                console.warn('⚠️ [تحميل أولي] معّرف الفيلم غير صالح في URL أو الفيلم غير موجود. يتم عرض الصفحة الرئيسية.');
                showHomePage(); // Fallback to home if ID is invalid or movie not found
            }
        } else {
            console.log('🚀 [تحميل أولي] لا يوجد عرض محدد في URL. يتم عرض الصفحة الرئيسية.');
            showHomePage(); // Default to home page
        }
    }

    // Handle browser history navigation (back/forward buttons)
    window.addEventListener('popstate', (event) => {
        console.log('↩️ [Popstate] تم اكتشاف تصفح سجل المتصفح.', event.state);
        // If movie data isn't loaded yet, try fetching it first
        if (moviesData.length === 0) {
            console.warn('[Popstate] لم يتم تحميل بيانات الفيلم، محاولة جلب البيانات وعرض الصفحة بناءً على الحالة.');
            fetchMoviesData().then(() => {
                // After data is fetched, re-evaluate popstate state
                if (event.state && event.state.view === 'details' && event.state.id) {
                    const movie = moviesData.find(m => m.id === event.state.id);
                    if (movie) {
                        updateMetaTags(movie);
                        addJsonLdSchema(movie);
                        showMovieDetails(event.state.id);
                    } else {
                        console.warn('[Popstate] الفيلم غير موجود عند popstate بعد جلب البيانات. يتم عرض الصفحة الرئيسية.');
                        showHomePage();
                    }
                } else {
                    showHomePage();
                }
            }).catch(err => {
                console.error('[Popstate] فشل جلب بيانات الأفلام عند popstate:', err);
                showHomePage(); // Fallback to home on complete failure
            });
            return; // Stop here and wait for data fetch
        }

        // If data is already loaded, proceed with popstate logic directly
        if (event.state && event.state.view === 'details' && event.state.id) {
            const movie = moviesData.find(m => m.id === event.state.id);
            if (movie) {
                updateMetaTags(movie);
                addJsonLdSchema(movie);
                showMovieDetails(event.state.id);
            } else {
                console.warn('[Popstate] الفيلم غير موجود عند popstate. يتم عرض الصفحة الرئيسية.');
                showHomePage();
            }
        } else {
            showHomePage();
        }
    });

    // Start the process by fetching movie data when DOM is ready
    fetchMoviesData();
});
