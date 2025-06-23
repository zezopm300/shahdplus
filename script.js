document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOM Content Loaded. Script execution started.');

    // --- 1. DOM Element References ---
    // هنا يتم الحصول على المراجع لجميع عناصر DOM (HTML) التي سيتفاعل معها السكريبت.
    // التأكد من أن هذه الـ IDs موجودة في ملف HTML الخاص بك أمر حيوي لعمل السكريبت.
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
    const moviePlayer = document.getElementById('movie-player');
    const videoOverlay = document.getElementById('video-overlay');
    const homeLogoLink = document.getElementById('home-logo-link');
    const videoLoadingSpinner = document.getElementById('video-loading-spinner');
    const movieDetailsPoster = document.getElementById('movie-details-poster');

    // عناصر التحكم في ترقيم الصفحات
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const moviesPerPage = 30; // عدد الأفلام التي تعرض في كل صفحة
    let currentPage = 1; // رقم الصفحة الحالي

    // عناصر البحث في DOM
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    // عنصر عنوان القسم (مثل "أحدث الأفلام" أو "نتائج البحث")
    const sectionTitleElement = movieGridSection ? movieGridSection.querySelector('h2') : null;

    // --- 1.1. Critical DOM Element Verification (تأكيد وجود العناصر الضرورية) ---
    // هذه الخطوة تتحقق من وجود العناصر الأساسية في HTML قبل بدء تشغيل السكريبت.
    // إذا كان أي عنصر غير موجود، سيتم تسجيل خطأ حرج وسيتم إيقاف تنفيذ السكريبت لتجنب الأخطاء.
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
        return; // يتوقف تنفيذ السكريبت هنا إذا كانت هناك أخطاء حرجة
    } else {
        console.log('✅ All critical DOM elements found.');
    }

    // --- 2. Adsterra Configuration (إعدادات إعلانات Adsterra) ---
    // رابط الإعلان المباشر من Adsterra
    const ADSTERRA_DIRECT_LINK_URL = 'https://www.profitableratecpm.com/spqbhmyax?key=2469b039d4e7c471764bd04c57824cf2';

    // فترات الـ Cooldown (التهدئة) لفتح روابط الإعلانات لمنع الإفراط في الفتح
    const DIRECT_LINK_COOLDOWN_MOVIE_CARD = 3 * 60 * 1000; // 3 دقائق لبطاقات الأفلام وملصق تفاصيل الفيلم
    const DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY = 4 * 1000; // 4 ثوانٍ لطبقة الفيديو (الأوفرلاي)

    // لتتبع آخر وقت تم فيه النقر على رابط إعلان مباشر لكل نوع
    let lastDirectLinkClickTimeMovieCard = 0;
    let lastDirectLinkClickTimeVideoOverlay = 0;

    // --- 3. Movie Data (بيانات الأفلام - سيتم جلبها من ملف JSON خارجي) ---
    // هذا المتغير سيحتوي على مصفوفة كائنات الأفلام بعد جلبها بنجاح من ملف JSON.
    let moviesData = [];
    // هذه المصفوفة تستخدم لترقيم وعرض الأفلام، ويتم تحديثها بالبحث أو عند العودة للصفحة الرئيسية.
    let moviesDataForPagination = [];

    // هذا المتغير سيخزن كائن الفيلم الذي يتم عرضه حاليًا في صفحة التفاصيل،
    // ليكون متاحًا للوظائف الأخرى (مثل `videoOverlay` بدون الحاجة للبحث عنه مرة أخرى).
    let currentDetailedMovie = null;

    // --- 3.1. Fetch Movie Data from JSON (جلب بيانات الأفلام من ملف JSON) ---
    // دالة غير متزامنة (async) لجلب بيانات الأفلام من ملف `movies.json`.
    async function fetchMoviesData() {
        try {
            const response = await fetch('movies.json'); // تأكد من أن المسار صحيح لملف JSON الخاص بك
            if (!response.ok) { // إذا لم تكن الاستجابة ناجحة (مثل 404 Not Found)
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            moviesData = await response.json(); // تحويل الاستجابة إلى كائن JSON
            console.log('✅ Movie data loaded successfully from movies.json', moviesData);
            // بمجرد تحميل البيانات بنجاح، نبدأ منطق تحميل الصفحة الأولية.
            initialPageLoadLogic();
        } catch (error) {
            console.error('❌ Failed to load movie data:', error);
            // عرض رسالة خطأ للمستخدم إذا فشل تحميل البيانات
            if (movieGrid) {
                movieGrid.innerHTML = '<p style="text-align: center; color: var(--text-color); margin-top: 50px;">عذرًا، لم نتمكن من تحميل بيانات الأفلام. يرجى المحاولة مرة أخرى لاحقًا.</p>';
            }
            if (sectionTitleElement) {
                sectionTitleElement.textContent = 'خطأ في تحميل الأفلام';
            }
        }
    }

    // --- 4. Functions (الوظائف الأساسية) ---

    // دالة لفتح رابط إعلان Adsterra مع إدارة فترة التهدئة.
    function openAdLink(cooldownDuration, type) {
        let lastClickTime;
        let setLastClickTime;

        // تحديد متغيرات التتبع بناءً على نوع الإعلان (بطاقة فيلم، طبقة فيديو، إلخ)
        if (type === 'movieCard') {
            lastClickTime = lastDirectLinkClickTimeMovieCard;
            setLastClickTime = (time) => lastDirectLinkClickTimeMovieCard = time;
        } else if (type === 'videoOverlay') {
            lastClickTime = lastDirectLinkClickTimeVideoOverlay;
            setLastClickTime = (time) => lastDirectLinkClickTimeVideoOverlay = time;
        } else if (type === 'movieDetailsPoster') {
            lastClickTime = lastDirectLinkClickTimeMovieCard; // يستخدم نفس الـcooldown الخاص ببطاقات الأفلام
            setLastClickTime = (time) => lastDirectLinkClickTimeMovieCard = time;
        } else {
            console.error('Invalid ad type provided for openAdLink:', type);
            return false;
        }

        const currentTime = Date.now();
        // التحقق مما إذا كانت فترة التهدئة قد انتهت
        if (currentTime - lastClickTime > cooldownDuration) {
            const newWindow = window.open(ADSTERRA_DIRECT_LINK_URL, '_blank'); // فتح الرابط في نافذة جديدة
            if (newWindow) {
                newWindow.focus(); // نقل التركيز إلى النافذة الجديدة
                setLastClickTime(currentTime); // تحديث وقت آخر نقرة
                console.log(`💰 [Ad Click - ${type}] Direct Link opened successfully.`);
                return true;
            } else {
                console.warn(`⚠️ [Ad Click - ${type}] Pop-up blocked or failed to open direct link. Ensure pop-ups are allowed.`);
                return false; // فشل فتح النافذة (غالبًا بسبب مانع الإعلانات)
            }
        } else {
            const timeLeft = (cooldownDuration - (currentTime - lastClickTime)) / 1000;
            console.log(`⏳ [Ad Click - ${type}] Direct Link cooldown active. Not opening new tab. Time remaining: ${timeLeft.toFixed(1)}s`);
            return false; // فترة التهدئة ما زالت نشطة
        }
    }

    // دالة لإنشاء بطاقة فيلم (العنصر المرئي للفيلم في القائمة).
    function createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card'); // إضافة كلاس للستايل
        movieCard.innerHTML = `
            <img data-src="${movie.poster}" alt="${movie.title}" class="lazyload">
            <h3>${movie.title}</h3>
        `;
        // إضافة مستمع حدث عند النقر على بطاقة الفيلم
        movieCard.addEventListener('click', () => {
            console.log(`⚡ [Interaction] Movie card clicked for ID: ${movie.id}`);
            openAdLink(DIRECT_LINK_COOLDOWN_MOVIE_CARD, 'movieCard'); // فتح الإعلان
            showMovieDetails(movie.id); // عرض تفاصيل الفيلم
        });
        return movieCard;
    }

    // دالة لتفعيل التحميل الكسول (Lazy Load) للصور لتحسين الأداء.
    function initializeLazyLoad() {
        if ('IntersectionObserver' in window) { // التحقق مما إذا كان المتصفح يدعم IntersectionObserver
            let lazyLoadImages = document.querySelectorAll('.lazyload');
            let imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) { // إذا كانت الصورة مرئية في إطار العرض
                        let image = entry.target;
                        image.src = image.dataset.src; // تعيين src من data-src لتحميل الصورة
                        image.classList.remove('lazyload'); // إزالة الكلاس بعد التحميل
                        observer.unobserve(image); // إيقاف مراقبة الصورة
                    }
                });
            });

            lazyLoadImages.forEach(function(image) {
                imageObserver.observe(image); // بدء مراقبة كل صورة
            });
        } else {
            // حل بديل للمتصفحات التي لا تدعم IntersectionObserver (يتم تحميل كل الصور فورًا)
            let lazyLoadImages = document.querySelectorAll('.lazyload');
            lazyLoadImages.forEach(function(image) {
                image.src = image.dataset.src;
            });
        }
        console.log('🖼️ [Lazy Load] Initialized IntersectionObserver for images.');
    }

    // دالة لعرض الأفلام في الشبكة المستهدفة (شبكة الأفلام الرئيسية أو الأفلام المقترحة).
    function displayMovies(moviesToDisplay, targetGridElement) {
        if (!targetGridElement) {
            console.error('❌ displayMovies: Target grid element is null or undefined.');
            return;
        }
        targetGridElement.innerHTML = ''; // مسح المحتوى الحالي للشبكة

        if (moviesToDisplay.length === 0) {
            targetGridElement.innerHTML = '<p style="text-align: center; color: var(--text-muted);">لا توجد أفلام مطابقة للبحث أو مقترحة.</p>';
            console.log(`🎬 [Display] No movies to display in ${targetGridElement.id}.`);
            return;
        }

        moviesToDisplay.forEach(movie => {
            targetGridElement.appendChild(createMovieCard(movie)); // إضافة بطاقة لكل فيلم
        });
        console.log(`🎬 [Display] Displayed ${moviesToDisplay.length} movies in ${targetGridElement.id}.`);

        initializeLazyLoad(); // تفعيل التحميل الكسول بعد عرض الأفلام
    }

    // دالة لترقيم الصفحات وعرض الأفلام حسب الصفحة الحالية.
    function paginateMovies(moviesArray, page) {
        const startIndex = (page - 1) * moviesPerPage;
        const endIndex = startIndex + moviesPerPage;
        const paginatedMovies = moviesArray.slice(startIndex, endIndex); // استخلاص الأفلام للصفحة الحالية

        displayMovies(paginatedMovies, movieGrid); // عرض الأفلام المقطعة
        updatePaginationButtons(moviesArray.length); // تحديث حالة أزرار الترقيم
        console.log(`➡️ [Pagination] Displaying page ${page}. Movies from index ${startIndex} to ${Math.min(endIndex, moviesArray.length)-1}.`);
    }

    // دالة لتحديث حالة أزرار "الصفحة السابقة" و "الصفحة التالية".
    function updatePaginationButtons(totalMovies) {
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1; // تعطيل زر السابق في الصفحة الأولى
        if (nextPageBtn) nextPageBtn.disabled = currentPage * moviesPerPage >= totalMovies; // تعطيل زر التالي في الصفحة الأخيرة
        console.log(`🔄 [Pagination] Buttons updated. Current page: ${currentPage}, Total Movies: ${totalMovies}`);
    }

    // دالة لإجراء عملية البحث بناءً على مدخل المستخدم.
    function performSearch() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        let filteredMovies = [];
        if (query) {
            // فلترة الأفلام بناءً على العنوان، المخرج، الممثلين، أو النوع
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
            // إذا كان حقل البحث فارغًا، يتم عرض جميع الأفلام بترتيب عشوائي
            filteredMovies = [...moviesData].sort(() => 0.5 - Math.random());
            if (sectionTitleElement) {
                sectionTitleElement.textContent = 'أحدث الأفلام';
            }
            console.log('🔍 [Search] Search query empty, showing all movies (randomized).');
        }
        currentPage = 1; // إعادة تعيين الصفحة الحالية إلى 1 بعد البحث
        moviesDataForPagination = filteredMovies; // تحديث مصفوفة الأفلام للترقيم
        paginateMovies(moviesDataForPagination, currentPage); // عرض الأفلام المفلترة/المرتبة
    }

    // دالة لعرض صفحة تفاصيل الفيلم المحدد.
    function showMovieDetails(movieId) {
        console.log(`🔍 [Routing] Showing movie details for ID: ${movieId}`);
        const movie = moviesData.find(m => m.id === movieId); // البحث عن الفيلم بواسطة الـ ID

        if (movie) {
            currentDetailedMovie = movie; // تخزين الفيلم الحالي في المتغير العام

            // إخفاء الأقسام الرئيسية
            if (heroSection) heroSection.style.display = 'none';
            if (movieGridSection) movieGridSection.style.display = 'none';

            // إظهار أقسام التفاصيل والأفلام المقترحة
            if (movieDetailsSection) movieDetailsSection.style.display = 'block';
            if (suggestedMoviesSection) suggestedMoviesSection.style.display = 'block';

            window.scrollTo({ top: 0, behavior: 'smooth' }); // التمرير لأعلى الصفحة
            console.log('[Routing] Scrolled to top.');

            // تحديث عناصر تفاصيل الفيلم بالبيانات من كائن الفيلم
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

            // إعداد مشغل الفيديو
            if (moviePlayer) {
                moviePlayer.src = ''; // مسح الـ src الحالي
                if (videoLoadingSpinner) {
                    videoLoadingSpinner.style.display = 'block'; // إظهار مؤشر التحميل
                    console.log('[Video Player] Loading spinner shown.');
                }

                // تعيين الـ src لمشغل الفيديو بعد تأخير بسيط
                setTimeout(() => {
                    moviePlayer.src = movie.embed_url;
                    console.log(`[Video Player] Final iframe src set to: ${movie.embed_url}`);
                }, 50);

                // إخفاء مؤشر التحميل وتفعيل طبقة الإعلان عند تحميل الفيديو
                moviePlayer.onload = () => {
                    if (videoLoadingSpinner) {
                        videoLoadingSpinner.style.display = 'none';
                        console.log('[Video Player] Loading spinner hidden (iframe loaded).');
                    }
                    if (videoOverlay) {
                        videoOverlay.classList.remove('inactive');
                        videoOverlay.style.display = 'block'; // التأكد من أن الأوفرلاي مرئي
                        videoOverlay.style.pointerEvents = 'auto'; // التأكد من أنه قابل للنقر
                        console.log('[Video Overlay] Active and clickable after video loaded.');
                    }
                };
                // التعامل مع أخطاء تحميل الفيديو
                moviePlayer.onerror = () => {
                    if (videoLoadingSpinner) {
                        videoLoadingSpinner.style.display = 'none';
                        console.warn('[Video Player] Iframe failed to load. Spinner hidden.');
                    }
                    if (videoOverlay) {
                        videoOverlay.classList.remove('inactive');
                        videoOverlay.style.display = 'block'; // التأكد من أن الأوفرلاي مرئي حتى لو حدث خطأ
                        videoOverlay.style.pointerEvents = 'auto';
                        console.warn('[Video Overlay] Active even after iframe load error.');
                    }
                };
            }

            // تحديث رابط URL في المتصفح ليتناسب مع الفيلم المعروض (لتسهيل المشاركة والعودة عبر التاريخ)
            const newUrl = new URL(window.location.origin);
            newUrl.searchParams.set('view', 'details');
            newUrl.searchParams.set('id', movieId);
            history.pushState({ view: 'details', id: movieId }, movie.title, newUrl.toString());
            console.log(`🔗 [URL] URL updated to ${newUrl.toString()}`);

            updateMetaTags(movie); // تحديث بيانات الـ Meta Tags لأغراض SEO
            addJsonLdSchema(movie); // إضافة/تحديث Schema.org JSON-LD للـ SEO
            displaySuggestedMovies(movieId); // عرض الأفلام المقترحة
            console.log(`✨ [Suggestions] Calling displaySuggestedMovies for ID: ${movieId}`);

        } else {
            console.error('❌ [Routing] Movie not found for ID:', movieId, 'Redirecting to home page.');
            showHomePage(); // العودة للصفحة الرئيسية إذا لم يتم العثور على الفيلم
        }
    }

    // دالة لتحديث Meta Tags في رأس مستند HTML لأغراض SEO ومشاركة وسائل التواصل الاجتماعي.
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

    // دالة لإضافة/تحديث بيانات Schema.org بتنسيق JSON-LD لتحسين ظهور المحتوى في نتائج البحث.
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

        // إضافة بيانات المخرج، الممثلين، النوع، والتقييم إذا كانت متوفرة
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
                    "ratingCount": "10000" // يمكن تعديل هذا الرقم ليعكس عدد التقييمات الحقيقي إذا كان متوفرًا
                };
            }
        }
        
        // إزالة أي سكربت JSON-LD قديم قبل إضافة الجديد لتجنب التكرار
        let oldScript = document.querySelector('script[type="application/ld+json"]');
        if (oldScript) {
            oldScript.remove();
            console.log('📄 [SEO] Old JSON-LD schema removed.');
        }

        // إضافة السكربت الجديد إلى رأس المستند
        let script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
        console.log('📄 [SEO] New JSON-LD schema added/updated.');
    }

    // دالة لعرض الأفلام المقترحة (أفلام عشوائية باستثناء الفيلم المعروض حاليًا).
    function displaySuggestedMovies(currentMovieId) {
        if (!suggestedMovieGrid) {
            console.error('❌ displaySuggestedMovies: suggestedMovieGrid element not found. Cannot display suggested movies.');
            return;
        }

        const otherMovies = moviesData.filter(movie => movie.id !== currentMovieId); // استبعاد الفيلم الحالي
        const shuffled = otherMovies.sort(() => 0.5 - Math.random()); // خلط الأفلام عشوائيًا
        const selected = shuffled.slice(0, 15); // اختيار أول 15 فيلم

        if (selected.length === 0) {
            suggestedMovieGrid.innerHTML = '<p style="text-align: center; color: var(--text-muted);">لا توجد أفلام مقترحة حالياً.</p>';
            console.log('✨ [Suggestions] No suggested movies available after filtering.');
            return;
        }

        displayMovies(selected, suggestedMovieGrid); // عرض الأفلام المختارة في شبكة المقترحات
        console.log(`✨ [Suggestions] Displayed ${selected.length} suggested movies in ${suggestedMovieGrid.id}.`);
    }

    // دالة لإظهار الصفحة الرئيسية وإعادة ضبط الحالة.
    function showHomePage() {
        console.log('🏠 [Routing] Showing home page.');
        // إخفاء أقسام تفاصيل الفيلم والمقترحات
        if (movieDetailsSection) movieDetailsSection.style.display = 'none';
        if (suggestedMoviesSection) suggestedMoviesSection.style.display = 'none';

        // إظهار قسم البطل وشبكة الأفلام الرئيسية
        if (heroSection) heroSection.style.display = 'flex';
        if (movieGridSection) movieGridSection.style.display = 'block';

        // إعادة ضبط حقل البحث وعنوان القسم
        if (searchInput) searchInput.value = '';
        if (sectionTitleElement) sectionTitleElement.textContent = 'أحدث الأفلام';

        // إعادة ترتيب جميع الأفلام عشوائيًا وعرض الصفحة الأولى
        moviesDataForPagination = [...moviesData].sort(() => 0.5 - Math.random());
        paginateMovies(moviesDataForPagination, 1);

        // إعادة ضبط حالة طبقة الفيديو ومشغل الفيديو
        if (videoOverlay) {
            videoOverlay.classList.add('inactive'); // إضافة كلاس inactive
            videoOverlay.style.display = 'none'; // إخفاء الأوفرلاي تمامًا
            videoOverlay.style.pointerEvents = 'none'; // تعطيل النقرات
            console.log('[Video Overlay] Inactive and hidden on home page.');
        }
        if (videoLoadingSpinner) {
            videoLoadingSpinner.style.display = 'none';
        }
        if (moviePlayer) {
            moviePlayer.src = ''; // مسح مصدر الفيديو لإيقافه تمامًا
            moviePlayer.onload = null;
            moviePlayer.onerror = null;
        }
        currentDetailedMovie = null; // مسح الفيلم المعروض حاليًا

        // تحديث رابط URL إلى الصفحة الرئيسية
        const newUrl = new URL(window.location.origin);
        history.pushState({ view: 'home' }, 'أفلام عربية - الصفحة الرئيسية', newUrl.toString());
        console.log(`🔗 [URL] URL updated to ${newUrl.toString()}`);

        // تحديث Meta Tags الخاصة بالصفحة الرئيسية
        document.title = 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية.');
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين');
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية.');
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.href);
        document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'website');
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين');
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية.');

        // إزالة أي JSON-LD schema موجود من رأس المستند عند العودة للصفحة الرئيسية
        let script = document.querySelector('script[type="application/ld+json"]');
        if (script) {
            script.remove();
            console.log('📄 [SEO] JSON-LD schema removed on home page.');
        }
    }

    // --- 5. Event Listeners (مستمعو الأحداث) ---
    // تفعيل/تعطيل قائمة التنقل الجانبية
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('nav-open');
            console.log('📱 [Interaction] Menu toggle clicked.');
        });
    }

    // إغلاق قائمة التنقل عند النقر على أي رابط داخلها
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav && mainNav.classList.contains('nav-open')) {
                mainNav.classList.remove('nav-open');
                console.log('📱 [Interaction] Nav link clicked, menu closed.');
            }
        });
    });

    // التمرير إلى قسم الأفلام عند النقر على زر "شاهد الآن"
    if (watchNowBtn && movieGridSection) {
        watchNowBtn.addEventListener('click', (e) => {
            e.preventDefault(); // منع السلوك الافتراضي للرابط
            console.log('🎬 [Interaction] Watch Now button clicked.');
            movieGridSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // العودة إلى الصفحة الرئيسية عند النقر على زر "العودة للرئيسية"
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', () => {
            console.log('🔙 [Interaction] Back to home button clicked.');
            showHomePage();
        });
    }

    // تفعيل البحث عند النقر على زر البحث
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
        console.log('🔍 [Event] Search button listener attached.');
    }
    // تفعيل البحث عند الضغط على Enter في حقل البحث
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
                searchInput.blur(); // إخفاء لوحة المفاتيح الافتراضية على الأجهزة المحمولة
            }
        });
        console.log('🔍 [Event] Search input keypress listener attached.');
    }

    // التحكم في الترقيم: الصفحة السابقة
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                paginateMovies(moviesDataForPagination, currentPage);
            }
            console.log(`⬅️ [Pagination] Previous page clicked. Current page: ${currentPage}`);
        });
    }
    // التحكم في الترقيم: الصفحة التالية
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

    // العودة إلى الصفحة الرئيسية عند النقر على شعار الموقع/الرابط الرئيسي
    if (homeLogoLink) {
        homeLogoLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🏠 [Interaction] Home logo clicked.');
            showHomePage();
        });
    }

    // فتح رابط إعلان عند النقر على ملصق تفاصيل الفيلم
    if (movieDetailsPoster) {
        movieDetailsPoster.addEventListener('click', () => {
            console.log('🖼️ [Ad Click] Movie details poster clicked. Attempting to open Direct Link.');
            openAdLink(DIRECT_LINK_COOLDOWN_MOVIE_CARD, 'movieDetailsPoster');
        });
        console.log('[Event] Movie details poster click listener attached.');
    }

    // **الأهم: التحكم في طبقة إعلان الفيديو (Video Overlay)**
    if (videoOverlay) {
        videoOverlay.addEventListener('click', (e) => {
            console.log('⏯️ [Ad Click] Video overlay clicked. Attempting to open Direct Link.');
            const adOpened = openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY, 'videoOverlay');

            if (adOpened) {
                // **هنا الحل لضمان عدم توقف الفيديو:**
                // 1. إخفاء الأوفرلاي تمامًا فور فتح الإعلان
                // هذا يسمح لأي نقرات لاحقة بالوصول إلى الـ iframe مباشرةً
                videoOverlay.style.display = 'none'; 
                console.log(`[Video Overlay] Hidden temporarily for ${DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY / 1000} seconds.`);

                // 2. منع حدث النقر من الوصول إلى الـ iframe الأساسي
                // هذا يضمن أن نقرة الأوفرلاي لا تشغل/توقف الفيديو عن طريق الخطأ.
                e.stopPropagation(); 

                // 3. إعادة إظهار الأوفرلاي بعد انتهاء فترة التهدئة الخاصة بالإعلان
                setTimeout(() => {
                    videoOverlay.style.display = 'block'; // إعادة إظهار الأوفرلاي
                    console.log('[Video Overlay] Displayed again after cooldown.');
                }, DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY);
            }
        });
        console.log('[Video Overlay] Click listener attached for ad interaction (with display toggle and cooldown).');
    }

    // --- 6. Initial Page Load Logic (منطق تحميل الصفحة الأولية والتوجيه) ---
    // هذه الدالة تحدد ما يجب عرضه عند تحميل الصفحة لأول مرة (صفحة رئيسية أو تفاصيل فيلم)
    // يتم استدعاؤها بعد نجاح جلب بيانات الأفلام.
    function initialPageLoadLogic() {
        const urlParams = new URLSearchParams(window.location.search);
        const viewParam = urlParams.get('view'); // الحصول على 'view' من رابط URL
        const idParam = urlParams.get('id');     // الحصول على 'id' من رابط URL

        if (viewParam === 'details' && idParam) {
            const movieId = parseInt(idParam);
            if (!isNaN(movieId)) { // إذا كان الـ ID رقمًا صحيحًا
                console.log(`🚀 [Initial Load] Attempting to load movie details from URL: ID ${movieId}`);
                showMovieDetails(movieId); // عرض تفاصيل الفيلم المحدد
            } else {
                console.warn('⚠️ [Initial Load] Invalid movie ID in URL. Showing home page.');
                showHomePage(); // العودة للصفحة الرئيسية إذا كان الـ ID غير صالح
            }
        } else {
            console.log('🚀 [Initial Load] No specific view in URL. Showing home page.');
            showHomePage(); // عرض الصفحة الرئيسية إذا لم يكن هناك view محدد في URL
        }
    }

    // **نقطة البدء:** يتم استدعاء دالة `fetchMoviesData()` فور تحميل DOM.
    // هذا يضمن أن يتم تحميل بيانات الأفلام أولاً قبل أن يحاول السكريبت عرض أي شيء.
    fetchMoviesData();
});

