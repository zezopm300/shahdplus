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

    // مرجع لمشغل الفيديو Video.js
    let videoJsPlayerInstance = null; // هنستخدم ده عشان نخزن مشغل Video.js

    // العناصر اللي ما زالت موجودة في HTML ومحتاجينها
    const videoElement = document.getElementById('my-video'); // عنصر الـ <video> الجديد
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
    // تم تحديث هذا القسم لإزالة المراجع القديمة وإضافة مرجع Video.js
    const requiredElements = {
        '#movie-grid': movieGrid,
        '#movie-grid-section': movieGridSection,
        '#movie-details-section': movieDetailsSection,
        '#hero-section': heroSection,
        '#my-video': videoElement, // تأكدنا من وجود عنصر Video.js
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

    // دالة لفتح رابط إعلان Adsterra مع نظام التهدئة (لم تتغير)
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
            lastClickTime = lastDirectLinkClickTimeMovieCard;
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

    // --- 3. Movie Data (لم تتغير) ---
    let moviesData = [];
    let moviesDataForPagination = [];
    let currentDetailedMovie = null;

    // --- 3.1. Fetch Movie Data from JSON (لم تتغير) ---
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

    // إنشاء بطاقة الفيلم لعرضها في الشبكة (لم تتغير)
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

    // تهيئة خاصية Lazy Load للصور لتحسين أداء التحميل الأولي (لم تتغير)
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

    // عرض الأفلام في الشبكة المستهدفة (لم تتغير)
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

    // تقسيم الأفلام إلى صفحات (Pagination) (لم تتغير)
    function paginateMovies(moviesArray, page) {
        const startIndex = (page - 1) * moviesPerPage;
        const endIndex = startIndex + moviesPerPage;
        const paginatedMovies = moviesArray.slice(startIndex, endIndex);

        displayMovies(paginatedMovies, movieGrid);
        updatePaginationButtons(moviesArray.length);
        console.log(`➡️ [Pagination] Displaying page ${page}. Movies from index ${startIndex} to ${Math.min(endIndex, moviesArray.length)-1}.`);
    }

    // تحديث حالة أزرار التنقل بين الصفحات (لم تتغير)
    function updatePaginationButtons(totalMovies) {
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = currentPage * moviesPerPage >= totalMovies;
        console.log(`🔄 [Pagination] Buttons updated. Current page: ${currentPage}, Total Movies: ${totalMovies}`);
    }

    // تنفيذ عملية البحث عن الأفلام (لم تتغير)
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

    // --- هذا هو الجزء الأساسي: تهيئة مشغل Video.js ---
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

            // --- منطق تهيئة مشغل Video.js ---
            if (videoElement) {
                // تدمير أي مشغل Video.js سابق موجود لضمان بداية نظيفة
                if (videoJsPlayerInstance) {
                    videoJsPlayerInstance.dispose();
                    console.log('[Video.js] Previous player instance disposed.');
                }
                
                // إخفاء الـ video element مبدئيًا وعرض السبينر والـ overlay
                videoElement.style.opacity = '0'; // إخفاء المشغل مؤقتاً
                videoLoadingSpinner.style.display = 'block'; // إظهار السبينر
                videoOverlay.classList.remove('inactive'); // تفعيل الـ overlay للإعلانات
                videoOverlay.style.display = 'block';
                videoOverlay.style.pointerEvents = 'auto'; // تفعيل النقر على الـ overlay للإعلان

                // إعداد خيارات مشغل الفيديو
                const playerOptions = {
                    autoplay: true, // التشغيل التلقائي
                    preload: 'auto', // التحميل المسبق
                    controls: true, // إظهار عناصر التحكم
                    responsive: true, // استجابة لحجم الشاشة
                    fluid: true, // حجم مرن
                    sources: [{
                        src: movie.embed_url, // رابط الفيديو من movies.json
                        // هذا النوع يجب أن يتطابق مع نوع الفيديو الذي يوفره مزودك (مثلاً HLS أو MP4)
                        type: 'application/x-mpegURL' // مثال: لو مزودك بيوفر HLS
                        // أو 'video/mp4' لو بيوفر MP4 مباشر
                    }],
                    poster: movie.poster // بوستر الفيديو
                };

                // تهيئة مشغل Video.js
                videoJsPlayerInstance = videojs(videoElement, playerOptions, function() {
                    console.log('[Video.js] Player initialized.');
                    
                    // عند انتهاء تهيئة المشغل وبدء تحميل البيانات
                    this.on('loadeddata', function() {
                        console.log('[Video.js] Video data loaded.');
                        videoLoadingSpinner.style.display = 'none';
                        videoElement.style.opacity = '1'; // إظهار المشغل بسلاسة
                        // الـ videoOverlay سيظل مرئيًا للإعلانات فوق المشغل
                    });

                    // التعامل مع أخطاء التشغيل
                    this.on('error', function(e) {
                        console.error('❌ [Video.js] Player error:', this.error());
                        videoLoadingSpinner.style.display = 'none';
                        videoElement.style.opacity = '0'; // إخفاء المشغل في حالة الخطأ
                        videoOverlay.style.display = 'block'; // إبقاء الـ overlay مرئيًا للإعلانات
                        videoOverlay.style.pointerEvents = 'auto';
                        alert('عذرًا، حدث خطأ أثناء تشغيل الفيديو. يرجى المحاولة لاحقًا.');
                    });

                    // عشان نضمن التشغيل التلقائي في بعض المتصفحات اللي بتحظرها
                    this.play().catch(error => {
                        console.warn('[Video.js] Autoplay was prevented:', error);
                        // هنا ممكن تعمل أي حاجة لو المتصفح حظر التشغيل التلقائي (زي إظهار زر تشغيل يدوي)
                        // لكن في حالتك دي، بما إننا عايزين تشغيل تلقائي، ممكن تتجاهل الرسالة دي
                        // أو تحاول تشغل المشغل يدويا بعد فترة قصيرة
                        // مثلاً: setTimeout(() => this.play(), 500);
                    });
                });

                // إزالة أي روابط preconnect/prefetch قديمة
                document.querySelectorAll('link[rel="preconnect"][data-video-url], link[rel="prefetch"][data-video-url]').forEach(link => {
                    if (link.parentNode) {
                        link.parentNode.removeChild(link);
                    }
                });
                console.log('[Preload] Removed all previous preconnect/prefetch links.');

                // إعداد تلميحات التحميل المسبق (Preconnect و Prefetch)
                // يجب أن تتطابق هذه الروابط مع مزود الفيديو الجديد
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
                    currentPrefetchLink.as = 'video'; // أو 'document'
                    currentPrefetchLink.setAttribute('data-video-url', movie.embed_url);
                    document.head.appendChild(currentPrefetchLink);
                    console.log(`[Preload] Added prefetch for ${movie.embed_url} for current movie.`);
                } catch (e) {
                    console.warn('⚠️ [Preload] Could not add prefetch/preconnect links (invalid URL or other error):', e);
                }

            } else {
                console.error('❌ [Video.js] Video element #my-video not found in DOM.');
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

    // دالة لتحديث الـ Meta Tags (لم تتغير)
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

    // دالة لإضافة الـ JSON-LD Schema (لم تتغير)
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

    // دالة لعرض الأفلام المقترحة (لم تتغير)
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

    // دالة للعودة للصفحة الرئيسية (تم تعديلها لإدارة Video.js)
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

        // --- تنظيف مشغل Video.js عند العودة للصفحة الرئيسية ---
        if (videoJsPlayerInstance) {
            videoJsPlayerInstance.dispose(); // تدمير مشغل Video.js
            videoJsPlayerInstance = null;
            console.log('[Video.js] Player disposed on home page.');
        }
        
        // إخفاء السبينر والـ Overlay (لو كانوا ظاهرين)
        if (videoElement) { // تأكد من وجود عنصر الـ <video>
            videoElement.style.opacity = '0'; // إخفاء عنصر الـ <video>
            // إعادة تعيين الـ src عشان ميكنش فيه فيديو شغال في الخلفية لو المشغل ما تدمرش صح
            videoElement.src = ''; 
            videoElement.load(); // إعادة تحميل المشغل بـ src فاضي عشان يوقف أي بث
        }
        if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
        if (videoOverlay) {
            videoOverlay.style.display = 'none';
            videoOverlay.style.pointerEvents = 'none';
            videoOverlay.classList.remove('inactive');
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

    // --- 5. Event Listeners (لم تتغير، باستثناء ملاحظة الـ overlay) ---
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

                e.stopPropagation(); // منع النقر من الانتشار إلى المشغل

                setTimeout(() => {
                    videoOverlay.style.display = 'block';
                    console.log('[Video Overlay] Displayed again after cooldown.');
                }, DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY);
            }
        });
        console.log('[Video Overlay] Click listener attached for ad interaction (with display toggle and cooldown).');
    }

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
