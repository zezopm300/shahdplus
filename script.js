document.addEventListener('DOMContentLoaded', async () => {
    console.log('🏁 DOM Content Loaded. Script execution started.');

    // --- 1. DOM Element References ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    // استخدمنا querySelectorAll عشان نحدد الروابط بالـ ID لو حبيت تميزها
    const homeLink = document.getElementById('home-link'); 
    const moviesLink = document.getElementById('movies-link');
    const navLinks = document.querySelectorAll('.main-nav ul li a'); // كل روابط الـ nav بشكل عام
    
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
    const moviesPerPage = 30; // عدد الأفلام في كل صفحة
    let currentPage = 1;

    // Search DOM Elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const sectionTitleElement = movieGridSection ? movieGridSection.querySelector('h2') : null;

    // --- 1.1. Critical DOM Element Verification (تأكيد وجود العناصر الضرورية) ---
    // تم التأكيد على وجود كل العناصر الأساسية لتجنب الأخطاء
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
        '#home-logo-link': homeLogoLink,
        '#prev-page-btn': prevPageBtn,
        '#next-page-btn': nextPageBtn,
        '#back-to-home-btn': backToHomeBtn
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

    // --- 2. Adsterra Configuration (تم الاحتفاظ بها لعمل إعلانات الفيديو والبوستر) ---
    const ADSTERRA_DIRECT_LINK_URL = 'https://www.profitableratecpm.com/spqbhmyax?key=2469b039d4e7c471764bd04c57824cf2';

    const DIRECT_LINK_COOLDOWN_MOVIE_CARD = 3 * 60 * 1000; // 3 دقائق لبطاقات الأفلام وبوستر التفاصيل
    const DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY = 4 * 1000; // 4 ثوانٍ لـ video overlay

    let lastDirectLinkClickTimeMovieCard = 0;
    let lastDirectLinkClickTimeVideoOverlay = 0;

    // --- 3. Movie Data (سيتم تحميلها من ملف JSON) ---
    let moviesData = []; // لتخزين البيانات الأصلية بعد الجلب
    let moviesDataForPagination = []; // لعمليات البحث والتقسيم

    // --- جلب بيانات الأفلام من ملف JSON في بداية التحميل ---
    try {
        console.log('📡 [Data Load] Attempting to fetch movie data from movies.json...');
        const response = await fetch('movies.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        moviesData = await response.json();
        console.log('✅ [Data Load] Movie data loaded successfully from movies.json', moviesData.length, 'movies found.');

        // ⚠️ مهم جداً: التأكد من أن البيانات تم تحميلها وأنها مصفوفة
        if (!Array.isArray(moviesData) || moviesData.length === 0) {
            console.warn('⚠️ Movie data is empty or not an array. Please check movies.json content.');
            // يمكن عرض رسالة للمستخدم هنا
            movieGrid.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 50px;">عذرًا، لا توجد أفلام لعرضها حاليًا. يرجى المحاولة لاحقًا.</p>';
            criticalError = true; // نعتبرها خطأ حرج لو مفيش بيانات
            return; 
        }

        // تهيئة moviesDataForPagination بالبيانات الأولية المرتبة عشوائياً
        moviesDataForPagination = [...moviesData].sort(() => 0.5 - Math.random());
        console.log('✅ [Data Init] moviesDataForPagination initialized with', moviesDataForPagination.length, 'movies.');

    } catch (error) {
        console.error('❌ [Data Load] Error loading movie data from movies.json:', error);
        alert('حدث خطأ فادح أثناء تحميل بيانات الأفلام. يرجى المحاولة لاحقًا.');
        criticalError = true; // نعتبرها خطأ حرج
        return; 
    }

    // --- 4. Functions ---

    /**
     * تفتح رابط إعلان Adsterra في نافذة جديدة مع إدارة فترة الكول داون.
     * @param {number} cooldownDuration - مدة الكول داون بالمللي ثانية.
     * @param {string} type - نوع الإعلان ('movieCard', 'videoOverlay', 'movieDetailsPoster').
     * @returns {boolean} - true إذا تم فتح الإعلان، false إذا كان الكول داون نشطًا أو تم حظر النافذة المنبثقة.
     */
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
            lastClickTime = lastDirectLinkClickTimeMovieCard; // يستخدم نفس كول داون بطاقة الفيلم
            setLastClickTime = (time) => lastDirectLinkClickTimeMovieCard = time;
        } else {
            console.error('Invalid ad type provided for openAdLink:', type);
            return false;
        }

        const currentTime = Date.now();
        if (currentTime - lastClickTime > cooldownDuration) {
            // إضافة 'noopener,noreferrer' لتحسين الأمان والأداء
            const newWindow = window.open(ADSTERRA_DIRECT_LINK_URL, '_blank', 'noopener,noreferrer');
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

    /**
     * تُنشئ عنصر بطاقة فيلم (div.movie-card) للفيلم المحدد.
     * @param {object} movie - كائن الفيلم الذي يحتوي على تفاصيله.
     * @returns {HTMLElement} - عنصر الـ div الذي يمثل بطاقة الفيلم.
     */
    function createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
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

    /**
     * تهيئة التحميل الكسول للصور باستخدام Intersection Observer.
     */
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
                        // إضافة معالجة للأخطاء لتحميل الصورة
                        image.onerror = () => {
                            console.error(`❌ [Lazy Load] Failed to load image: ${image.src}`);
                            image.src = 'assets/img/placeholder-error.png'; // صورة بديلة (تأكد من المسار)
                            image.alt = 'Image failed to load';
                        };
                    }
                });
            }, {
                rootMargin: '0px 0px 200px 0px' // تحميل الصور قبل 200px من الظهور
            });

            lazyLoadImages.forEach(function(image) {
                imageObserver.observe(image);
            });
        } else {
            // Fallback للمتصفحات القديمة: تحميل جميع الصور فورا
            document.querySelectorAll('.lazyload').forEach(function(image) {
                image.src = image.dataset.src;
                image.onerror = () => {
                    console.error(`❌ [Lazy Load - Fallback] Failed to load image: ${image.src}`);
                    image.src = 'assets/img/placeholder-error.png';
                    image.alt = 'Image failed to load';
                };
            });
            console.warn('⚠️ IntersectionObserver not supported, falling back to eager image loading.');
        }
        console.log('🖼️ [Lazy Load] Initialized.');
    }

    /**
     * تعرض قائمة الأفلام في العنصر الشبكي المحدد.
     * @param {Array<object>} moviesToDisplay - مصفوفة كائنات الأفلام للعرض.
     * @param {HTMLElement} targetGridElement - العنصر الشبكي (مثل movieGrid أو suggestedMovieGrid) الذي ستُعرض فيه الأفلام.
     */
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

        // يجب إعادة تهيئة Lazy Load بعد إضافة عناصر جديدة للـ DOM
        initializeLazyLoad();
    }

    /**
     * تُطبق تقسيم الصفحات على مصفوفة الأفلام وتعرض الصفحة الحالية.
     * @param {Array<object>} moviesArray - مصفوفة الأفلام الكاملة للتقسيم.
     * @param {number} page - رقم الصفحة المراد عرضها.
     */
    function paginateMovies(moviesArray, page) {
        const startIndex = (page - 1) * moviesPerPage;
        const endIndex = startIndex + moviesPerPage;
        const paginatedMovies = moviesArray.slice(startIndex, endIndex);

        displayMovies(paginatedMovies, movieGrid);
        updatePaginationButtons(moviesArray.length);
        console.log(`➡️ [Pagination] Displaying page ${page}. Movies from index ${startIndex} to ${Math.min(endIndex, moviesArray.length)-1}.`);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // الانتقال لأعلى الصفحة عند تغيير الصفحة
    }

    /**
     * تُحدّث حالة أزرار التنقل بين الصفحات (تفعيل/تعطيل).
     * @param {number} totalMovies - العدد الكلي للأفلام.
     */
    function updatePaginationButtons(totalMovies) {
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = currentPage * moviesPerPage >= totalMovies;
        console.log(`🔄 [Pagination] Buttons updated. Current page: ${currentPage}, Total Movies: ${totalMovies}`);
    }

    /**
     * تُنفذ عملية البحث عن الأفلام بناءً على مُدخل المستخدم.
     */
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
            // إذا كان حقل البحث فارغًا، اعرض جميع الأفلام بترتيب عشوائي
            filteredMovies = [...moviesData].sort(() => 0.5 - Math.random());
            if (sectionTitleElement) {
                sectionTitleElement.textContent = 'أحدث الأفلام';
            }
            console.log('🔍 [Search] Search query empty, showing all movies (randomized).');
        }
        currentPage = 1; // دائمًا ابدأ من الصفحة الأولى بعد البحث
        moviesDataForPagination = filteredMovies; // تحديث مصفوفة التقسيم بالنتائج
        paginateMovies(moviesDataForPagination, currentPage);

        // إخفاء لوحة المفاتيح الافتراضية على الأجهزة المحمولة
        if (searchInput && document.activeElement === searchInput) {
            searchInput.blur();
        }
    }

    /**
     * تعرض تفاصيل فيلم محدد بناءً على الـ ID الخاص به.
     * @param {number} movieId - مُعرّف الفيلم.
     */
    function showMovieDetails(movieId) {
        console.log(`🔍 [Routing] Showing movie details for ID: ${movieId}`);
        const movie = moviesData.find(m => m.id === movieId);

        if (movie) {
            // إخفاء أقسام الصفحة الرئيسية
            if (heroSection) heroSection.style.display = 'none';
            if (movieGridSection) movieGridSection.style.display = 'none';

            // إظهار أقسام تفاصيل الفيلم
            if (movieDetailsSection) movieDetailsSection.style.display = 'block';
            if (suggestedMoviesSection) suggestedMoviesSection.style.display = 'block';

            window.scrollTo({ top: 0, behavior: 'smooth' }); // التمرير لأعلى الصفحة
            console.log('[Routing] Scrolled to top.');

            // تحديث تفاصيل الفيلم في الـ DOM
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
                movieDetailsPoster.alt = `${movie.title} poster`; // تحسين الـ alt
                console.log(`[Details] Poster set for ${movie.title}`);
            }

            // --- إعداد مشغل الفيديو ---
            if (moviePlayer) {
                // إظهار الـ spinner قبل تحميل الفيديو
                if (videoLoadingSpinner) {
                    videoLoadingSpinner.style.display = 'block';
                    console.log('[Video Player] Loading spinner shown.');
                }
                
                // مهم: لا نغير src لـ "" قبل تعيين src الجديد مباشرةً
                // هذا يمنع الفيديو من التوقف مؤقتًا ثم إعادة التحميل بالكامل
                moviePlayer.src = movie.embed_url;
                
                // التأكد من أن الـ iframe يحتوي على خصائص السماح بالتشغيل التلقائي وملء الشاشة
                moviePlayer.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media'); // إضافة encrypted-media للتوافق
                moviePlayer.setAttribute('loading', 'lazy'); // تحميل كسول للـ iframe
                moviePlayer.setAttribute('webkitallowfullscreen', ''); // للتوافق مع سفاري
                moviePlayer.setAttribute('mozallowfullscreen', ''); // للتوافق مع فايرفوكس

                console.log(`[Video Player] Final iframe src set to: ${movie.embed_url}`);

                // حدث عند تحميل الـ iframe بالكامل
                moviePlayer.onload = () => {
                    if (videoLoadingSpinner) {
                        videoLoadingSpinner.style.display = 'none';
                        console.log('[Video Player] Loading spinner hidden (iframe loaded).');
                    }
                    if (videoOverlay) {
                        // التأكد من أن الـ overlay نشط وقابل للضغط
                        videoOverlay.classList.remove('inactive'); // لو بتستخدم كلاس لإخفائه
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

            // تحديث الـ URL في شريط المتصفح (بدون إعادة تحميل الصفحة)
            const newUrl = new URL(window.location.origin);
            newUrl.searchParams.set('view', 'details');
            newUrl.searchParams.set('id', movieId);
            history.pushState({ view: 'details', id: movieId }, movie.title, newUrl.toString());
            console.log(`🔗 [URL] URL updated to ${newUrl.toString()}`);

            // تحديث الـ Meta Tags و JSON-LD Schema للـ SEO
            updateMetaTags(movie);
            addJsonLdSchema(movie);
            displaySuggestedMovies(movieId);
            console.log(`✨ [Suggestions] Calling displaySuggestedMovies for ID: ${movieId}`);

        } else {
            console.error('❌ [Routing] Movie not found for ID:', movieId, 'Redirecting to home page.');
            showHomePage(); // العودة للصفحة الرئيسية إذا لم يتم العثور على الفيلم
        }
    }

    /**
     * تُحدّث علامات Meta Tags (مثل title, description, OG tags) لتحسين الـ SEO.
     * @param {object} movie - كائن الفيلم الذي يتم عرض تفاصيله.
     */
    function updateMetaTags(movie) {
        document.title = `${movie.title} - مشاهدة أونلاين بجودة عالية`;
        const metaDescriptionContent = `شاهد فيلم ${movie.title} أونلاين بجودة عالية ومباشرة. قصة الفيلم: ${movie.description}. بطولة: ${Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || 'غير متوفر'}. إخراج: ${movie.director || 'غير متوفر'}. النوع: ${movie.genre || 'غير محدد'}.`;

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

    /**
     * تُضيف أو تُحدّث JSON-LD Schema (VideoObject) لتعزيز الـ SEO في نتائج البحث الغنية (Rich Snippets).
     * @param {object} movie - كائن الفيلم.
     */
    function addJsonLdSchema(movie) {
        let formattedUploadDate;
        // محاولة تحليل تاريخ النشر بشكل آمن
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
                console.warn(`⚠️ Error parsing release_date: ${movie.release_date}. Using current date for uploadDate. Error: ${e}`);
                formattedUploadDate = new Date().toISOString();
            }
        } else {
            formattedUploadDate = new Date().toISOString(); // استخدام التاريخ الحالي إذا لم يتوفر
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
            "inLanguage": "ar" // تحديد لغة المحتوى (العربية)
        };

        if (movie.director && typeof movie.director === 'string' && movie.director.trim() !== '') {
            schema.director = {
                "@type": "Person",
                "name": movie.director.trim()
            };
        }
        if (movie.cast) {
            // تحويل الـ cast إلى مصفوفة Actors
            const castArray = Array.isArray(movie.cast) ? movie.cast : String(movie.cast).split(',').map(s => s.trim()).filter(s => s !== '');
            if (castArray.length > 0) {
                schema.actor = castArray.map(actor => ({
                    "@type": "Person",
                    "name": actor
                }));
            }
        }
        if (movie.genre) {
            // تحويل الـ genre إلى مصفوفة Genres
            const genreArray = Array.isArray(movie.genre) ? movie.genre : String(movie.genre).split(',').map(s => s.trim()).filter(s => s !== '');
            if (genreArray.length > 0) {
                schema.genre = genreArray;
            }
        }
        // إضافة تقييمات إذا كانت موجودة وبصيغة صحيحة (مثال: "8.5/10")
        if (movie.rating && typeof movie.rating === 'string' && movie.rating.includes('/')) {
            const [ratingValueStr, bestRatingStr] = movie.rating.split('/');
            const ratingValue = parseFloat(ratingValueStr);
            const bestRating = parseFloat(bestRatingStr) || 10; // الافتراضي 10 لو مش موجود
            if (!isNaN(ratingValue)) {
                schema.aggregateRating = {
                    "@type": "AggregateRating",
                    "ratingValue": ratingValue.toFixed(1),
                    "bestRating": bestRating.toString(),
                    "ratingCount": "1000" // عدد تقييمي للتقييمات
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

    /**
     * تعرض الأفلام المقترحة (أفلام عشوائية باستثناء الفيلم الحالي).
     * @param {number} currentMovieId - مُعرّف الفيلم الذي يتم عرضه حاليًا.
     */
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

    /**
     * تُظهر الصفحة الرئيسية وتُخفي أقسام التفاصيل، وتُعيد تهيئة عرض الأفلام الرئيسية.
     */
    function showHomePage() {
        console.log('🏠 [Routing] Showing home page.');
        // إخفاء أقسام التفاصيل
        if (movieDetailsSection) movieDetailsSection.style.display = 'none';
        if (suggestedMoviesSection) suggestedMoviesSection.style.display = 'none';

        // إظهار أقسام الصفحة الرئيسية
        if (heroSection) heroSection.style.display = 'flex';
        if (movieGridSection) movieGridSection.style.display = 'block';

        // تصفير حقل البحث وإعادة العنوان
        if (searchInput) searchInput.value = '';
        if (sectionTitleElement) sectionTitleElement.textContent = 'أحدث الأفلام';

        // إعادة ترتيب الأفلام بشكل عشوائي وعرض الصفحة الأولى
        moviesDataForPagination = [...moviesData].sort(() => 0.5 - Math.random());
        paginateMovies(moviesDataForPagination, 1);

        // مهم: إخفاء الـ overlay تمامًا على الصفحة الرئيسية وتصفير مشغل الفيديو
        if (videoOverlay) {
            videoOverlay.classList.add('inactive'); // تأكد إن ده بيخفيه بالـ CSS
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

        // تحديث الـ URL في شريط المتصفح والـ meta tags للـ Home Page
        const newUrl = new URL(window.location.origin);
        history.pushState({ view: 'home' }, 'أفلام عربية - الصفحة الرئيسية', newUrl.toString());
        console.log(`🔗 [URL] URL updated to ${newUrl.toString()}`);

        document.title = 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية ومباشرة. مكتبة ضخمة من الأفلام والمسلسلات العربية والتركية.');
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين');
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية ومباشرة. مكتبة ضخمة من الأفلام والمسلسلات العربية والتركية.');
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.href);
        document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'website');
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين');
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية ومباشرة. مكتبة ضخمة من الأفلام والمسلسلات العربية والتركية.');

        // إزالة JSON-LD schema الخاص بالفيلم من الصفحة الرئيسية
        let script = document.querySelector('script[type="application/ld+json"]');
        if (script) {
            script.remove();
            console.log('📄 [SEO] JSON-LD schema removed on home page.');
        }
    }

    // --- 5. Event Listeners ---
    // تفعيل قائمة التنقل على الموبايل
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('nav-open');
            console.log('📱 [Interaction] Menu toggle clicked.');
        });
    }

    // ربط روابط الـ Navbar (مثل الرئيسية وأفلام)
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔗 [Interaction] Home link in navbar clicked.');
            showHomePage();
            if (mainNav.classList.contains('nav-open')) {
                mainNav.classList.remove('nav-open'); // إغلاق القائمة بعد النقر
            }
            setTimeout(() => { // تأخير بسيط لضمان تحميل الصفحة ثم الانتقال
                if (heroSection) heroSection.scrollIntoView({ behavior: 'smooth' });
            }, 50);
        });
    }
    if (moviesLink) {
        moviesLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔗 [Interaction] Movies link in navbar clicked.');
            showHomePage(); // عرض الصفحة الرئيسية
            if (mainNav.classList.contains('nav-open')) {
                mainNav.classList.remove('nav-open'); // إغلاق القائمة بعد النقر
            }
            setTimeout(() => { // تأخير بسيط لضمان تحميل الصفحة ثم الانتقال لقسم الأفلام
                if (movieGridSection) movieGridSection.scrollIntoView({ behavior: 'smooth' });
            }, 50);
        });
    }
    // لباقي روابط الـ nav (إن وجدت) لإغلاق القائمة فقط
    navLinks.forEach(link => {
        // نتأكد إننا مكررناش الـ event listener لـ homeLink و moviesLink
        if (link !== homeLink && link !== moviesLink) {
            link.addEventListener('click', () => {
                if (mainNav && mainNav.classList.contains('nav-open')) {
                    mainNav.classList.remove('nav-open');
                    console.log('📱 [Interaction] Generic nav link clicked, menu closed.');
                }
            });
        }
    });

    // زر "شاهد الآن" في الهيرو سكشن
    if (watchNowBtn) {
        watchNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🎬 [Interaction] Watch Now button clicked.');
            if (movieGridSection) movieGridSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // زر "العودة للرئيسية" في صفحة التفاصيل
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', () => {
            console.log('🔙 [Interaction] Back to home button clicked.');
            showHomePage();
        });
    }

    // البحث عن الأفلام
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

    // أزرار التنقل بين الصفحات
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

    // شعار الموقع للعودة للرئيسية
    if (homeLogoLink) {
        homeLogoLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🏠 [Interaction] Home logo clicked.');
            showHomePage();
        });
    }

    // بوستر الفيلم في صفحة التفاصيل (لإعلانات Adsterra)
    if (movieDetailsPoster) {
        movieDetailsPoster.addEventListener('click', () => {
            console.log('🖼️ [Ad Click] Movie details poster clicked. Attempting to open Direct Link.');
            openAdLink(DIRECT_LINK_COOLDOWN_MOVIE_CARD, 'movieDetailsPoster');
        });
        console.log('[Event] Movie details poster click listener attached.');
    }

    // الـ overlay الخاص بمشغل الفيديو (لإعلانات Adsterra)
    if (videoOverlay) {
        videoOverlay.addEventListener('click', () => {
            console.log('⏯️ [Ad Click] Video overlay clicked. Attempting to open Direct Link.');
            const adOpened = openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY, 'videoOverlay');

            if (adOpened) {
                // لما الإعلان يفتح بنجاح، الـ Overlay بيبطل يستقبل clicks لفترة الكول داون
                // مش بنخفيه، بس بنخليه غير قابل للتفاعل عشان الفيديو يكون مرئي ويشتغل
                videoOverlay.style.pointerEvents = 'none';
                console.log(`[Video Overlay] Temporarily disabled clicks for ${DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY / 1000} seconds.`);

                setTimeout(() => {
                    videoOverlay.style.pointerEvents = 'auto'; // يعيد تفعيل النقر بعد الكول داون
                    console.log('[Video Overlay] Clicks re-enabled.');
                }, DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY);
            }
        });
        console.log('[Video Overlay] Click listener attached for ad interaction (with cooldown logic).');
    }

    // --- 6. Initial Page Load Logic (Routing) ---
    // يتم تنفيذ هذا الجزء بعد التأكد من تحميل بيانات الأفلام.
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

    // تحديد الصفحة التي ستعرض عند التحميل الأولي
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
        showHomePage(); // عرض الصفحة الرئيسية بشكل افتراضي
    }
});
