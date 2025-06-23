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

    // New/Updated references for video player elements
    // moviePlayer سيتم استخدامه كمرجع لـ iframe الفيديو الموجود في الـ HTML
    let moviePlayer = document.getElementById('movie-player'); 
    // لم نعد نحتاج لـ moviePlayerThumbnail و customPlayButton و playButtonOverlay في هذا الإصدار للتشغيل التلقائي
    const videoLoadingSpinner = document.getElementById('video-loading-spinner');
    const videoOverlay = document.getElementById('video-overlay'); // Adsterra overlay

    const homeLogoLink = document.getElementById('home-logo-link');
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
        '#movie-player': moviePlayer, 
        '#video-loading-spinner': videoLoadingSpinner,
        '#video-overlay': videoOverlay,
        '#suggested-movie-grid': suggestedMovieGrid,
        '#suggested-movies-section': suggestedMoviesSection,
        '#movie-details-poster': movieDetailsPoster
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

    const DIRECT_LINK_COOLDOWN_MOVIE_CARD = 3 * 60 * 1000; // 3 دقائق
    const DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY = 8 * 1000; // 8 ثواني

    let lastDirectLinkClickTimeMovieCard = 0;
    let lastDirectLinkClickTimeVideoOverlay = 0;

    // --- 3. Movie Data ---
    let moviesData = [];
    let moviesDataForPagination = [];
    let currentDetailedMovie = null;

    // --- 3.1. Fetch Movie Data from JSON ---
    async function fetchMoviesData() {
        try {
            const response = await fetch('movies.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            moviesData = await response.json();
            console.log('✅ Movie data loaded successfully from movies.json', moviesData);
            initialPageLoadLogic(); // بدء منطق التحميل الأولي بعد جلب البيانات
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

    // --- 4. Functions ---

    // دالة لفتح رابط إعلان Adsterra مع نظام التهدئة
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
            lastClickTime = lastDirectLinkClickTimeMovieCard; // استخدام تهدئة بطاقة الفيلم للملصق أيضًا
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

    // إنشاء بطاقة الفيلم لعرضها في الشبكة
    function createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <img data-src="${movie.poster}" alt="${movie.title}" class="lazyload">
            <h3>${movie.title}</h3>
        `;
        movieCard.addEventListener('click', () => {
            console.log(`⚡ [Interaction] Movie card clicked for ID: ${movie.id}`);
            showMovieDetails(movie.id);
        });
        return movieCard;
    }

    // تهيئة خاصية Lazy Load للصور لتحسين أداء التحميل الأولي
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
        console.log('🖼️ [Lazy Load] Initialized IntersectionObserver for images.');
    }

    // عرض الأفلام في الشبكة المستهدفة
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

        initializeLazyLoad();
    }

    // تقسيم الأفلام إلى صفحات (Pagination)
    function paginateMovies(moviesArray, page) {
        const startIndex = (page - 1) * moviesPerPage;
        const endIndex = startIndex + moviesPerPage;
        const paginatedMovies = moviesArray.slice(startIndex, endIndex);

        displayMovies(paginatedMovies, movieGrid);
        updatePaginationButtons(moviesArray.length);
        console.log(`➡️ [Pagination] Displaying page ${page}. Movies from index ${startIndex} to ${Math.min(endIndex, moviesArray.length)-1}.`);
    }

    // تحديث حالة أزرار التنقل بين الصفحات
    function updatePaginationButtons(totalMovies) {
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = currentPage * moviesPerPage >= totalMovies;
        console.log(`🔄 [Pagination] Buttons updated. Current page: ${currentPage}, Total Movies: ${totalMovies}`);
    }

    // تنفيذ عملية البحث عن الأفلام
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

    // --- هذا هو الجزء المحسّن الخاص بمشغل الفيديو لحل مشكلة التقطيع مع التشغيل التلقائي ---
    function showMovieDetails(movieId) {
        console.log(`🔍 [Routing] Showing movie details for ID: ${movieId}`);
        const movie = moviesData.find(m => m.id === movieId);

        if (movie) {
            currentDetailedMovie = movie;

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

            // --- منطق مشغل الفيديو للتشغيل التلقائي ---
            if (moviePlayer && videoLoadingSpinner && videoOverlay) {
                const oldPlayerParent = moviePlayer.parentNode;
                if (oldPlayerParent) {
                    // 1. إزالة الـ iframe القديم بالكامل لضمان إعادة تعيين حالة المتصفح المتعلقة به
                    oldPlayerParent.removeChild(moviePlayer);
                    console.log('[Video Player] Old iframe removed for full reset.');
                }
                
                // 2. إعادة إنشاء iframe جديد تمامًا لضمان بيئة نظيفة وجديدة
                const newPlayer = document.createElement('iframe');
                newPlayer.id = 'movie-player'; // الحفاظ على الـ ID لـ CSS و JS references
                newPlayer.setAttribute('frameborder', '0');
                newPlayer.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
                newPlayer.setAttribute('allowfullscreen', '');
                newPlayer.style.width = '100%';
                newPlayer.style.height = '100%';
                // لن نضع display: none هنا، لأننا نريد الـ iframe أن يكون مرئياً فوراً مع السبينر
                newPlayer.style.opacity = '0'; // إخفاء مؤقتًا حتى يبدأ التحميل بشكل مرئي
                newPlayer.style.transition = 'opacity 0.5s ease-in-out'; // إضافة انتقال سلس

                // 3. إعادة إضافة الـ iframe الجديد إلى الـ DOM
                if (oldPlayerParent) {
                    oldPlayerParent.appendChild(newPlayer);
                    moviePlayer = newPlayer; // تحديث مرجع moviePlayer ليشير إلى الـ iframe الجديد
                    console.log('[Video Player] Fresh iframe created and added to DOM.');
                } else {
                    console.error('❌ [Video Player] Parent of moviePlayer not found after removal. Cannot re-add iframe.');
                    return;
                }

                // 4. إزالة أي روابط preconnect/prefetch مضافة مسبقًا بشكل قاطع
                document.querySelectorAll('link[rel="preconnect"][data-video-url], link[rel="prefetch"][data-video-url]').forEach(link => {
                    if (link.parentNode) {
                        link.parentNode.removeChild(link);
                    }
                });
                console.log('[Preload] Removed all previous preconnect/prefetch links.');

                // 5. إظهار السبينر وطبقة الإعلانات (Overlay) فوراً
                videoLoadingSpinner.style.display = 'block'; // أظهر السبينر
                videoOverlay.classList.remove('inactive'); // تأكد إن الـ overlay مش inactive
                videoOverlay.style.display = 'block'; // أظهر الـ overlay
                videoOverlay.style.pointerEvents = 'auto'; // خليه قابل للنقر (للإعلانات)
                console.log('[Video Player] Loading spinner and ad overlay shown.');

                // 6. إعداد تلميحات التحميل المسبق (Preconnect و Prefetch) للفيديو الجديد فقط
                let currentPreconnectLink = null;
                let currentPrefetchLink = null;
                try {
                    const videoHost = new URL(movie.embed_url).origin;
                    
                    currentPreconnectLink = document.createElement('link');
                    currentPreconnectLink.rel = 'preconnect';
                    currentPreconnectLink.href = videoHost;
                    currentPreconnectLink.setAttribute('data-video-url', movie.embed_url);
                    document.head.appendChild(currentPreconnectLink);
                    console.log(`[Preload] Added preconnect to ${videoHost} for current movie.`);

                    currentPrefetchLink = document.createElement('link');
                    currentPrefetchLink.rel = 'prefetch';
                    currentPrefetchLink.href = movie.embed_url;
                    currentPrefetchLink.as = 'document';
                    currentPrefetchLink.setAttribute('data-video-url', movie.embed_url);
                    document.head.appendChild(currentPrefetchLink);
                    console.log(`[Preload] Added prefetch for ${movie.embed_url} for current movie.`);
                } catch (e) {
                    console.warn('⚠️ [Preload] Could not add prefetch/preconnect links (invalid URL or other error):', e);
                }

                // 7. التأخير الأقصى قبل تعيين رابط الفيديو
                setTimeout(() => {
                    moviePlayer.src = movie.embed_url; // تعيين رابط الفيديو لـ iframe
                    moviePlayer.style.opacity = '1'; // إظهار الـ iframe بسلاسة
                    console.log(`[Video Player] Iframe src set to: ${movie.embed_url}`);

                    // 8. مستمعات الأحداث لـ iframe الجديد
                    moviePlayer.onload = () => {
                        videoLoadingSpinner.style.display = 'none'; // إخفاء السبينر بعد التحميل
                        // الـ videoOverlay هيظل مرئيًا للإعلانات فوق الفيديو
                        console.log('[Video Player] Iframe loaded successfully, spinner hidden.');

                        // إزالة روابط preconnect/prefetch بعد تحميل الـ iframe بالكامل
                        if (currentPreconnectLink && currentPreconnectLink.parentNode) currentPreconnectLink.parentNode.removeChild(currentPreconnectLink);
                        if (currentPrefetchLink && currentPrefetchLink.parentNode) currentPrefetchLink.parentNode.removeChild(currentPrefetchLink);
                        console.log('[Preload] Removed preconnect/prefetch links after iframe loaded.');
                    };

                    moviePlayer.onerror = () => {
                        // في حالة حدوث خطأ في التحميل
                        videoLoadingSpinner.style.display = 'none';
                        videoOverlay.style.display = 'block'; // الـ overlay يظل مرئيًا
                        videoOverlay.style.pointerEvents = 'auto'; // قابل للنقر
                        moviePlayer.style.display = 'none'; // إخفاء الـ iframe الفاشل
                        console.error('❌ [Video Player] Iframe failed to load. Ad overlay remains active.');

                        // إزالة روابط preconnect/prefetch حتى في حالة حدوث خطأ
                        if (currentPreconnectLink && currentPreconnectLink.parentNode) currentPreconnectLink.parentNode.removeChild(currentPreconnectLink);
                        if (currentPrefetchLink && currentPrefetchLink.parentNode) currentPrefetchLink.parentNode.removeChild(currentPrefetchLink);
                        console.log('[Preload] Removed preconnect/prefetch links after iframe error.');
                    };
                }, 3000); // **التأخير الجديد والأقصى: 3000 مللي ثانية (3 ثواني)**

            } else {
                console.error('❌ [Video Player] Critical player elements not found.');
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

        // --- تنظيف حالة مشغل الفيديو عند العودة للصفحة الرئيسية ---
        if (moviePlayer) {
            const playerContainer = moviePlayer.parentNode;
            if (playerContainer) {
                // Remove the current iframe
                playerContainer.removeChild(moviePlayer);
                console.log('[Video Player] Old iframe removed on home page.');

                // Re-create a fresh iframe to avoid potential issues on subsequent loads
                const newPlayer = document.createElement('iframe');
                newPlayer.id = 'movie-player';
                newPlayer.setAttribute('frameborder', '0');
                newPlayer.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
                newPlayer.setAttribute('allowfullscreen', '');
                newPlayer.style.width = '100%';
                newPlayer.style.height = '100%';
                // لن نضع display: none هنا لضمان وجوده في الـ DOM للعناصر التالية
                playerContainer.appendChild(newPlayer);
                moviePlayer = newPlayer; // Update reference
                console.log('[Video Player] Fresh iframe re-created for home page.');
            }
        }
        // لم نعد نحتاج لـ moviePlayerThumbnail و customPlayButton و playButtonOverlay في هذا الإصدار للتشغيل التلقائي
        if (videoLoadingSpinner) {
            videoLoadingSpinner.style.display = 'none'; // إخفاء السبينر
        }
        if (videoOverlay) {
            videoOverlay.style.display = 'none'; // إخفاء overlay الإعلانات
            videoOverlay.style.pointerEvents = 'none'; // جعله غير قابل للنقر
            videoOverlay.classList.remove('inactive'); // التأكد من إمكانية تنشيطه مرة أخرى
            console.log('[Video Overlay] Hidden and inactive on home page.');
        }
        currentDetailedMovie = null;

        // إزالة أي روابط preconnect/prefetch المضافة ديناميًا
        document.querySelectorAll('link[rel="preconnect"][data-video-url], link[rel="prefetch"][data-video-url]').forEach(link => {
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
        });
        console.log('[Preload] Removed all preconnect/prefetch links on home page.');

        const newUrl = new URL(window.location.origin);
        history.pushState({ view: 'home' }, 'أفلام عربية - الصفحة الرئيسية', newUrl.toString());
        console.log(`🔗 [URL] URL updated to ${newUrl.toString()}`);

        document.title = 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية.');
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين');
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية.');
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.href);
        document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'website');
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين');
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية.');

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

    // إعلان Adsterra المباشر من ملصق تفاصيل الفيلم
    if (movieDetailsPoster) {
        movieDetailsPoster.addEventListener('click', () => {
            console.log('🖼️ [Ad Click] Movie details poster clicked. Attempting to open Direct Link.');
            openAdLink(DIRECT_LINK_COOLDOWN_MOVIE_CARD, 'movieDetailsPoster');
        });
        console.log('[Event] Movie details poster click listener attached.');
    }

    // إعلان Adsterra المباشر من overlay الفيديو (يبقى فوق المشغل)
    if (videoOverlay) {
        videoOverlay.addEventListener('click', (e) => {
            console.log('⏯️ [Ad Click] Video overlay clicked. Attempting to open Direct Link.');
            const adOpened = openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY, 'videoOverlay');

            if (adOpened) {
                videoOverlay.style.display = 'none';
                console.log(`[Video Overlay] Hidden temporarily for ${DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY / 1000} seconds.`);

                e.stopPropagation(); // منع النقر من الانتشار إلى الـ iframe

                setTimeout(() => {
                    videoOverlay.style.display = 'block';
                    console.log('[Video Overlay] Displayed again after cooldown.');
                }, DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY);
            }
        });
        console.log('[Video Overlay] Click listener attached for ad interaction (with display toggle and cooldown).');
    }

    // لم نعد نحتاج لمستمع حدث على playButtonOverlay لأنه لم يعد موجودًا.
    // إذا كنت تريد فتح إعلان عند النقر على المنطقة اللي كان فيها زر التشغيل، يمكنك إضافة مستمع حدث هنا لـ video-player-container
    // مثال:
    // const videoPlayerContainer = document.querySelector('.video-player-container');
    // if (videoPlayerContainer) {
    //     videoPlayerContainer.addEventListener('click', (e) => {
    //         // تأكد أن النقر ليس على الـ iframe نفسه، بل على الطبقة الخلفية (لو فيه)
    //         if (e.target !== moviePlayer) {
    //             console.log('🖼️ [Ad Click] Video player container clicked. Attempting to open Direct Link.');
    //             openAdLink(DIRECT_LINK_COOLDOWN_MOVIE_CARD, 'moviePlayerContainer');
    //         }
    //     });
    // }


    // التعامل مع أزرار الرجوع/التقدم في المتصفح
    window.onpopstate = (event) => {
        console.log('⬅️➡️ [History] Popstate event triggered:', event.state);
        if (event.state && event.state.view === 'details' && event.state.id) {
            showMovieDetails(event.state.id);
        } else {
            showHomePage();
        }
    };

    // --- 6. Initial Page Load Logic ---
    function initialPageLoadLogic() {
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
    }

    fetchMoviesData();
});
