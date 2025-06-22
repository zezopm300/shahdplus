document.addEventListener('DOMContentLoaded', async () => {
    console.log('🏁 DOM Content Loaded. Script execution started.');

    // --- 1. DOM Element References ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.main-nav ul li a'); // كل روابط الـ nav
    const heroSection = document.getElementById('hero-section');
    const watchNowBtn = document.getElementById('watch-now-btn');
    const movieGridSection = document.getElementById('movie-grid-section');
    const movieDetailsSection = document.getElementById('movie-details-section');
    const movieGrid = document.getElementById('movie-grid');
    const suggestedMovieGrid = document.getElementById('suggested-movie-grid');
    const suggestedMoviesSection = document.getElementById('suggested-movies-section');
    const backToHomeBtn = document.getElementById('back-to-home-btn');
    const moviePlayer = document.getElementById('movie-player');
    const videoOverlay = document.getElementById('video-overlay');
    const homeLogoLink = document.getElementById('home-logo-link');
    const videoLoadingSpinner = document.getElementById('video-loading-spinner');
    const movieDetailsPoster = document.getElementById('movie-details-poster');

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
    // تم إضافة `search-input` و `search-button` للعناصر الضرورية
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
        '#search-input': searchInput,
        '#search-button': searchButton,
        '#menu-toggle': menuToggle,
        '#main-nav': mainNav,
        '#home-logo-link': homeLogoLink
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
            const newWindow = window.open(ADSTERRA_DIRECT_LINK_URL, '_blank', 'noopener,noreferrer'); // إضافة noopener, noreferrer
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
        // تحسين الـ alt attribute للصورة
        movieCard.innerHTML = `
            <img data-src="${movie.poster}" alt="${movie.title} poster" class="lazyload">
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
                        // إضافة حدث load لضمان إخفاء spinner (لو كان فيه)
                        image.onload = () => {
                            console.log(`🖼️ [Lazy Load] Image loaded: ${image.src}`);
                            // لو عندك spinner خاص بالصورة ممكن تخفيه هنا
                        };
                        image.onerror = () => {
                            console.error(`❌ [Lazy Load] Failed to load image: ${image.dataset.src}`);
                            image.src = 'placeholder-error.png'; // صورة بديلة عند الفشل
                            image.alt = 'Image failed to load'; // نص بديل
                        };
                        image.src = image.dataset.src;
                        image.classList.remove('lazyload');
                        observer.unobserve(image);
                    }
                });
            }, {
                rootMargin: '0px 0px 200px 0px' // تحميل الصور قبل الوصول إليها بـ 200px
            });

            lazyLoadImages.forEach(function(image) {
                imageObserver.observe(image);
            });
        } else {
            // Fallback for older browsers
            let lazyLoadImages = document.querySelectorAll('.lazyload');
            lazyLoadImages.forEach(function(image) {
                image.src = image.dataset.src;
                image.onload = () => console.log(`🖼️ [Lazy Load - Fallback] Image loaded: ${image.src}`);
                image.onerror = () => {
                    console.error(`❌ [Lazy Load - Fallback] Failed to load image: ${image.dataset.src}`);
                    image.src = 'placeholder-error.png';
                    image.alt = 'Image failed to load';
                };
            });
        }
        console.log('🖼️ [Lazy Load] Initialized IntersectionObserver for images.');
    }

    function displayMovies(moviesToDisplay, targetGridElement) {
        if (!targetGridElement) {
            console.error('❌ displayMovies: Target grid element is null or undefined.');
            return;
        }
        targetGridElement.innerHTML = ''; // تفريغ المحتوى القديم

        if (moviesToDisplay.length === 0) {
            targetGridElement.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">لا توجد أفلام مطابقة للبحث أو مقترحة حالياً.</p>';
            console.log(`🎬 [Display] No movies to display in ${targetGridElement.id}.`);
            return;
        }

        moviesToDisplay.forEach(movie => {
            targetGridElement.appendChild(createMovieCard(movie));
        });
        console.log(`🎬 [Display] Displayed ${moviesToDisplay.length} movies in ${targetGridElement.id}.`);

        // لازم نعمل initializeLazyLoad بعد ما نضيف عناصر جديدة للـ DOM
        initializeLazyLoad();
    }

    function paginateMovies(moviesArray, page) {
        const startIndex = (page - 1) * moviesPerPage;
        const endIndex = startIndex + moviesPerPage;
        const paginatedMovies = moviesArray.slice(startIndex, endIndex);

        displayMovies(paginatedMovies, movieGrid);
        updatePaginationButtons(moviesArray.length);
        console.log(`➡️ [Pagination] Displaying page ${page}. Movies from index ${startIndex} to ${Math.min(endIndex, moviesArray.length)-1}.`);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // الرجوع لأعلى الصفحة مع تغيير الصفحة
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
            // لو البحث فارغ، بنعرض الأفلام بشكل عشوائي كأنها الأحدث
            filteredMovies = [...moviesData].sort(() => 0.5 - Math.random());
            if (sectionTitleElement) {
                sectionTitleElement.textContent = 'أحدث الأفلام';
            }
            console('🔍 [Search] Search query empty, showing all movies (randomized).');
        }
        currentPage = 1;
        moviesDataForPagination = filteredMovies;
        paginateMovies(moviesDataForPagination, currentPage);
        // إخفاء الكيبورد الافتراضي على الموبايل
        if (searchInput && document.activeElement === searchInput) {
            searchInput.blur();
        }
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

            document.getElementById('movie-details-title').textContent = movie.title;
            document.getElementById('movie-details-description').textContent = movie.description;
            // استخدام Date object لتنسيق التاريخ بشكل أفضل للعرض
            const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير متوفر';
            document.getElementById('movie-details-release-date').textContent = releaseDate;

            document.getElementById('movie-details-genre').textContent = movie.genre || 'غير محدد';
            document.getElementById('movie-details-director').textContent = movie.director || 'غير متوفر';
            document.getElementById('movie-details-cast').textContent = Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || 'غير متوفر';
            document.getElementById('movie-details-duration').textContent = movie.duration || 'غير متوفر';
            document.getElementById('movie-details-rating').textContent = movie.rating || 'N/A';

            if (movieDetailsPoster) {
                movieDetailsPoster.src = movie.poster;
                movieDetailsPoster.alt = `${movie.title} poster`; // تحسين الـ alt
                console.log(`[Details] Poster set for ${movie.title}`);
            }

            if (moviePlayer) {
                // إظهار الـ spinner قبل تحميل الفيديو
                if (videoLoadingSpinner) {
                    videoLoadingSpinner.style.display = 'block';
                    console.log('[Video Player] Loading spinner shown.');
                }
                // تهيئة الـ iframe لإعادة التحميل وتفعيل خصائص التشغيل
                moviePlayer.src = movie.embed_url;
                // التأكد من أن الـ iframe يحتوي على خصائص السماح بالتشغيل التلقائي وملء الشاشة
                moviePlayer.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
                moviePlayer.setAttribute('loading', 'lazy'); // تحميل كسول للـ iframe

                console.log(`[Video Player] Setting iframe src to: ${movie.embed_url}`);

                // حدث عند تحميل الـ iframe بالكامل
                moviePlayer.onload = () => {
                    if (videoLoadingSpinner) {
                        videoLoadingSpinner.style.display = 'none';
                        console.log('[Video Player] Loading spinner hidden (iframe loaded).');
                    }
                    if (videoOverlay) {
                        // التأكد من أن الـ overlay نشط وقابل للضغط
                        videoOverlay.classList.remove('inactive'); // لو كنت بتستخدم كلاس لإخفائه
                        videoOverlay.style.pointerEvents = 'auto'; // مهم لإعادة تفعيل الكليك
                        console.log('[Video Overlay] Active and clickable after video loaded.');
                    }
                };
                // حدث عند فشل تحميل الـ iframe
                moviePlayer.onerror = () => {
                    if (videoLoadingSpinner) {
                        videoLoadingSpinner.style.display = 'none';
                        console.warn('[Video Player] Iframe failed to load. Spinner hidden.');
                    }
                    if (videoOverlay) {
                        videoOverlay.classList.remove('inactive');
                        videoOverlay.style.pointerEvents = 'auto';
                        console.warn('[Video Overlay] Active even after iframe load error.');
                    }
                    alert('تعذر تحميل مشغل الفيديو. يرجى المحاولة مرة أخرى أو التحقق من الرابط.');
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
        // تحسين الـ description ليكون أكثر تفصيلاً ودقة
        const metaDescriptionContent = `شاهد فيلم ${movie.title} أونلاين بجودة عالية. قصة الفيلم: ${movie.description}. بطولة: ${Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || 'غير متوفر'}. إخراج: ${movie.director || 'غير متوفر'}. النوع: ${movie.genre || 'غير محدد'}.`;

        document.querySelector('meta[name="description"]')?.setAttribute('content', metaDescriptionContent);
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', movie.title);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', metaDescriptionContent);
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', movie.poster);
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.href);
        document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'video.movie');
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', movie.title);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', metaDescriptionContent);
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
            "contentUrl": movie.embed_url,
            // إضافة properties إضافية لتعزيز الـ SEO
            "genre": Array.isArray(movie.genre) ? movie.genre : (movie.genre ? movie.genre.split(',').map(s => s.trim()) : undefined),
            "datePublished": movie.release_date // إضافة تاريخ النشر إذا كان متاحًا
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
        // إضافة تقييمات إذا كانت موجودة وبصيغة صحيحة
        if (movie.rating && typeof movie.rating === 'string' && movie.rating.includes('/')) {
            const [ratingValueStr, bestRatingStr] = movie.rating.split('/');
            const ratingValue = parseFloat(ratingValueStr);
            const bestRating = parseFloat(bestRatingStr) || 10; // افتراض 10 لو مش موجود
            if (!isNaN(ratingValue)) {
                schema.aggregateRating = {
                    "@type": "AggregateRating",
                    "ratingValue": ratingValue.toFixed(1),
                    "bestRating": bestRating.toString(), // يمكن أن يكون 5 أو 10 حسب نظام التقييم
                    "ratingCount": "1000" // رقم تقديري لعدد التقييمات
                };
            }
        }

        // إزالة أي سكربت JSON-LD قديم قبل إضافة الجديد
        let oldScript = document.querySelector('script[type="application/ld+json"]');
        if (oldScript) {
            oldScript.remove();
            console.log('📄 [SEO] Old JSON-LD schema removed.');
        }

        // إضافة السكربت الجديد
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
        const selected = shuffled.slice(0, 15); // عرض 15 فيلم مقترح

        if (selected.length === 0) {
            suggestedMovieGrid.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">لا توجد أفلام مقترحة حالياً.</p>';
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

        // إعادة ترتيب الأفلام بشكل عشوائي عند العودة للصفحة الرئيسية
        moviesDataForPagination = [...moviesData].sort(() => 0.5 - Math.random());
        paginateMovies(moviesDataForPagination, 1);

        // مهم: إخفاء الـ overlay تمامًا على الصفحة الرئيسية وتصفير مشغل الفيديو
        if (videoOverlay) {
            videoOverlay.classList.add('inactive'); // لو فيه كلاس inactive بيخفيه
            videoOverlay.style.pointerEvents = 'none'; // يمنع النقر
            console.log('[Video Overlay] Inactive on home page.');
        }
        if (videoLoadingSpinner) {
            videoLoadingSpinner.style.display = 'none';
        }
        if (moviePlayer) {
            moviePlayer.src = ''; // إيقاف تشغيل الفيديو
            moviePlayer.onload = null; // إزالة الـ event listeners عشان متتراكمش
            moviePlayer.onerror = null;
        }

        const newUrl = new URL(window.location.origin);
        history.pushState({ view: 'home' }, 'أفلام عربية - الصفحة الرئيسية', newUrl.toString());
        console.log(`🔗 [URL] URL updated to ${newUrl.toString()}`);

        // إعادة ضبط الـ meta tags والـ title للـ Home Page
        document.title = 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية ومباشرة.');
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين');
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية ومباشرة.');
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.href);
        document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'website');
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين');
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية ومباشرة.');

        // إزالة JSON-LD schema الخاص بالفيلم من الصفحة الرئيسية
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

    // تفعيل الروابط في الـ navbar
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // لو اللينك ده هو اللي بيرجع للصفحة الرئيسية (مثلاً لينك "الرئيسية" أو "أفلام")
            if (link.id === 'home-link' || link.id === 'movies-link') {
                e.preventDefault(); // منع السلوك الافتراضي
                showHomePage();
                if (mainNav.classList.contains('nav-open')) {
                    mainNav.classList.remove('nav-open');
                }
                // لو عاوز يروح لقسم الأفلام الرئيسي على طول في الصفحة الرئيسية
                setTimeout(() => { // تأخير بسيط لضمان تحميل الصفحة ثم الانتقال
                    if (movieGridSection) movieGridSection.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
            // لباقي الروابط، لو فيه، هتتصرف عادي أو تضيف ليها منطق خاص
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
                searchInput.blur(); // إخفاء الكيبورد بعد البحث
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
        videoOverlay.addEventListener('click', () => {
            console.log('⏯️ [Ad Click] Video overlay clicked. Attempting to open Direct Link.');
            const adOpened = openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY, 'videoOverlay');

            if (adOpened) {
                // لما الإعلان يفتح بنجاح، بنعمل Overlay غير قابل للضغط عليه لفترة الكول داون فقط
                videoOverlay.style.pointerEvents = 'none'; // يمنع النقر مؤقتًا
                // لو بتستخدم كلاس 'inactive' عشان تخفي الـ overlay مؤقتًا، أضفه
                // videoOverlay.classList.add('inactive'); // لو حبيت تخفيه تماما
                console.log(`[Video Overlay] Temporarily disabled clicks for ${DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY / 1000} seconds.`);

                setTimeout(() => {
                    videoOverlay.style.pointerEvents = 'auto'; // يعيد تفعيل النقر
                    // videoOverlay.classList.remove('inactive'); // يعيد إظهاره لو كان مختفي
                    console.log('[Video Overlay] Clicks re-enabled.');
                }, DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY);
            }
        });
        console.log('[Video Overlay] Click listener attached for ad interaction (with cooldown logic).');
    }

    // --- 6. Initial Page Load Logic (Routing) ---
    // يتم تنفيذ هذا الجزء الآن بعد التأكد من تحميل بيانات الأفلام.
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    const idParam = urlParams.get('id');

    // التعامل مع الرجوع بـ Back button في المتصفح
    window.addEventListener('popstate', (event) => {
        console.log('↩️ [Popstate] Browser history changed.', event.state);
        const state = event.state;
        if (state && state.view === 'details' && state.id) {
            showMovieDetails(state.id);
        } else {
            showHomePage();
        }
    });


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
});
