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
    // تأكد ان كل العناصر الأساسية دي موجودة في HTML بتاعك عشان السكريبت يشتغل صح
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
            console.error(`❌ خطأ فادح: العنصر بالمعرّف "${id}" غير موجود. يرجى التحقق من ملف HTML الخاص بك.`);
            criticalError = true;
        }
    }
    if (criticalError) {
        console.error('🛑 لن يتم تنفيذ السكريبت بالكامل بسبب عناصر DOM الأساسية المفقودة. قم بإصلاح HTML الخاص بك!');
        document.body.innerHTML = '<div style="text-align: center; margin-top: 100px; color: #f44336; font-size: 20px;">' +
                                    'عذرًا، حدث خطأ فني. يرجى تحديث الصفحة أو المحاولة لاحقًا.' +
                                    '<p style="font-size: 14px; color: #ccc;">(عناصر الصفحة الرئيسية مفقودة)</p></div>';
        return; // توقف السكريبت لو فيه عناصر أساسية ناقصة
    } else {
        console.log('✅ تم العثور على جميع عناصر DOM الأساسية.');
    }

    // --- 2. Adsterra Configuration (كما هي بناءً على طلبك بعدم المساس بالإعلانات) ---
    const ADSTERRA_DIRECT_LINK_URL = 'https://www.profitableratecpm.com/spqbhmyax?key=2469b039d4e7c471764bd04c57824cf2';
    const DIRECT_LINK_COOLDOWN_MOVIE_CARD = 3 * 60 * 1000; // 3 دقائق لبطاقات الأفلام
    const DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION = 10 * 1000; // 10 ثوانٍ لتفاعلات الفيديو

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
            console.error('نوع إعلان غير صالح لـ openAdLink:', type);
            return false;
        }

        const currentTime = Date.now();
        if (currentTime - lastClickTime > cooldownDuration) {
            const newWindow = window.open(ADSTERRA_DIRECT_LINK_URL, '_blank');
            if (newWindow) {
                newWindow.focus();
                setLastClickTime(currentTime);
                console.log(`💰 [نقر إعلان - ${type}] تم فتح الرابط المباشر بنجاح.`);
                return true;
            } else {
                console.warn(`⚠️ [نقر إعلان - ${type}] تم حظر النافذة المنبثقة أو فشل فتح الرابط المباشر. تأكد من السماح بالنوافذ المنبثقة.`);
                return false;
            }
        } else {
            const timeLeft = (cooldownDuration - (currentTime - lastClickTime)) / 1000;
            console.log(`⏳ [نقر إعلان - ${type}] التهدئة للرابط المباشر نشطة. لن يتم فتح علامة تبويب جديدة. الوقت المتبقي: ${timeLeft.toFixed(1)}ثانية`);
            return false;
        }
    }

    // --- 3. Movie Data & Video URL Decoding ---
    let moviesData = [];
    let moviesDataForPagination = [];
    let currentDetailedMovie = null;
    let videoJsPlayerInstance = null;

    // دالة لفك تشفير سلاسل Base64 (لروابط الفيديو)
    function decodeBase64(encodedString) {
        try {
            if (!encodedString || typeof encodedString !== 'string') {
                console.warn('تمت محاولة فك تشفير سلسلة Base64 غير صالحة:', encodedString);
                return '';
            }
            return atob(encodedString);
        } catch (e) {
            console.error('خطأ في فك تشفير سلسلة Base64:', e);
            return '';
        }
    }

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
                moviesData = [];
            } else if (moviesData.length === 0) {
                console.warn('⚠️ تم تحميل movies.json، ولكنه فارغ.');
            }
            console.log('✅ تم تحميل بيانات الأفلام بنجاح من movies.json', moviesData.length, 'فيلمًا تم العثور عليهم.');
            initialPageLoadLogic();
        } catch (error) {
            console.error('❌ فشل تحميل بيانات الأفلام:', error.message);
            if (movieGrid) {
                movieGrid.innerHTML = '<p style="text-align: center; color: var(--text-color); margin-top: 50px;">عذرًا، لم نتمكن من تحميل بيانات الأفلام. يرجى المحاولة مرة أخرى لاحقًا أو التحقق من ملف movies.json.</p>';
            }
            if (sectionTitleElement) {
                sectionTitleElement.textContent = 'خطأ في تحميل الأفلام';
            }
        }
    }

    function createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        // تحسين: استخدام <picture> لدعم WebP لتحسين سرعة تحميل الصور على الموبايل
        movieCard.innerHTML = `
            <picture>
                <source srcset="${movie.poster.replace(/\.(png|jpe?g)/i, '.webp')}" type="image/webp">
                <img data-src="${movie.poster}" alt="${movie.title}" class="lazyload" width="200" height="300">
            </picture>
            <h3>${movie.title}</h3>
        `;
        movieCard.addEventListener('click', () => {
            console.log(`⚡ [تفاعل] تم النقر على بطاقة الفيلم للمعّرف: ${movie.id}`);
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
                            const pictureParent = image.closest('picture');
                            if (pictureParent) {
                                const sourceElement = pictureParent.querySelector('source');
                                if (sourceElement && sourceElement.dataset.srcset) {
                                    sourceElement.srcset = sourceElement.dataset.srcset;
                                }
                            }
                        }
                        image.classList.remove('lazyload');
                        observer.unobserve(image);
                    }
                });
            }, {
                rootMargin: '0px 0px 100px 0px' // تحميل الصور قبل دخولها الشاشة بـ 100 بكسل لتحسين تجربة المستخدم
            });

            lazyLoadImages.forEach(function(image) {
                imageObserver.observe(image);
            });
        } else {
            // Fallback للمتصفحات التي لا تدعم IntersectionObserver
            let lazyLoadImages = document.querySelectorAll('.lazyload');
            lazyLoadImages.forEach(function(image) {
                if (image.dataset.src) {
                    image.src = image.dataset.src;
                    const pictureParent = image.closest('picture');
                    if (pictureParent) {
                        const sourceElement = pictureParent.querySelector('source');
                        if (sourceElement && sourceElement.dataset.srcset) {
                            sourceElement.srcset = sourceElement.dataset.srcset;
                        }
                    }
                }
            });
        }
        console.log('🖼️ [تحميل كسول] تم تهيئة IntersectionObserver للصور (أو العودة للخيار البديل).');
    }

    function displayMovies(moviesToDisplay, targetGridElement) {
        if (!targetGridElement) {
            console.error('❌ displayMovies: العنصر المستهدف للشبكة فارغ أو غير معرّف.');
            return;
        }
        targetGridElement.innerHTML = '';

        if (!moviesToDisplay || moviesToDisplay.length === 0) {
            targetGridElement.innerHTML = '<p style="text-align: center; color: var(--text-muted);">لا توجد أفلام مطابقة للبحث أو مقترحة.</p>';
            console.log(`🎬 [عرض] لا توجد أفلام للعرض في ${targetGridElement.id}.`);
            return;
        }

        moviesToDisplay.forEach(movie => {
            targetGridElement.appendChild(createMovieCard(movie));
        });
        console.log(`🎬 [عرض] تم عرض ${moviesToDisplay.length} فيلمًا في ${targetGridElement.id}.`);
        initializeLazyLoad(); // إعادة تهيئة Lazy Load بعد إضافة عناصر جديدة
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
        console.log(`➡️ [ترقيم الصفحات] يتم عرض الصفحة ${page}. الأفلام من الفهرس ${startIndex} إلى ${Math.min(endIndex, moviesArray.length)-1}.`);
    }

    function updatePaginationButtons(totalMovies) {
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = currentPage * moviesPerPage >= totalMovies;
        console.log(`🔄 [ترقيم الصفحات] تم تحديث الأزرار. الصفحة الحالية: ${currentPage}, إجمالي الأفلام: ${totalMovies}`);
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
            console.log(`🔍 [بحث] تم إجراء بحث عن "${query}". تم العثور على ${filteredMovies.length} نتيجة.`);
        } else {
            filteredMovies = [...moviesData].sort(() => 0.5 - Math.random()); // عشوائي إذا كان البحث فارغا
            if (sectionTitleElement) {
                sectionTitleElement.textContent = 'أحدث الأفلام';
            }
            console.log('🔍 [بحث] استعلام البحث فارغ، يتم عرض جميع الأفلام (عشوائياً).');
        }
        currentPage = 1;
        moviesDataForPagination = filteredMovies;
        paginateMovies(moviesDataForPagination, currentPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- Video Player Enhancements & URL Decoding ---
    async function showMovieDetails(movieId) {
        console.log(`🔍 [توجيه] عرض تفاصيل الفيلم للمعّرف: ${movieId}`);
        const movie = moviesData.find(m => m.id === movieId);

        if (movie) {
            currentDetailedMovie = movie;

            if (heroSection) heroSection.style.display = 'none';
            if (movieGridSection) movieGridSection.style.display = 'none';

            // التخلص من أي مشغل Video.js موجود
            if (videoJsPlayerInstance) {
                console.log('[Video.js] التخلص من مثيل المشغل الحالي قبل عرض تفاصيل جديدة.');
                videoJsPlayerInstance.dispose();
                videoJsPlayerInstance = null;
            }

            // إعادة بناء عنصر الفيديو لحالة نظيفة
            if (videoContainer) {
                videoContainer.innerHTML = ''; // مسح أي محتوى سابق
                const newVideoElement = document.createElement('video');
                newVideoElement.id = 'movie-player';
                newVideoElement.classList.add('video-js', 'vjs-default-skin');
                newVideoElement.controls = true;
                newVideoElement.preload = 'auto';
                newVideoElement.setAttribute('playsinline', ''); // **مهم جداً للموبايل**: يسمح بالتشغيل داخل الصفحة بدل الوضع بملء الشاشة على iOS
                newVideoElement.setAttribute('poster', movie.poster);
                videoContainer.appendChild(newVideoElement);
                console.log('[مشغل الفيديو] تم إعادة إنشاء عنصر movie-player.');
            } else {
                console.error('❌ خطأ فادح: movie-player-container غير موجود. لا يمكن إنشاء مشغل الفيديو.');
                return;
            }

            // إظهار أقسام تفاصيل الفيلم
            if (movieDetailsSection) movieDetailsSection.style.display = 'block';
            if (suggestedMoviesSection) suggestedMoviesSection.style.display = 'block';

            window.scrollTo({ top: 0, behavior: 'smooth' });
            console.log('[توجيه] تم التمرير للأعلى.');

            // تحديث تفاصيل الفيلم
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
                console.log(`[تفاصيل] تم تعيين البوستر لـ ${movie.title}`);
            }

            // الحصول على مرجع لعنصر المشغل الذي تم إنشاؤه حديثًا
            const moviePlayerElement = document.getElementById('movie-player');

            // فك تشفير رابط الفيديو من Base64
            const decodedVideoUrl = decodeBase64(movie.embed_url_encoded); // افتراض وجود 'embed_url_encoded' في movies.json

            if (!decodedVideoUrl) {
                console.error(`❌ فشل الحصول على رابط الفيديو مفكوك الشفرة لمعّرف الفيلم: ${movieId}. لا يمكن تهيئة المشغل.`);
                if (videoContainer) {
                    videoContainer.innerHTML = '<p style="text-align: center; color: var(--text-color); margin-top: 20px;">عذرًا، لا يمكن تشغيل الفيديو حاليًا (خطأ في فك التشفير أو الرابط غير صالح).</p>';
                }
                return;
            }

            if (moviePlayerElement) {
                await new Promise(resolve => {
                    const checkVisibility = () => {
                        // التأكد أن عنصر الفيديو موجود ومرئي في DOM قبل تهيئة Video.js
                        if (moviePlayerElement.offsetParent !== null) {
                            console.log('[مشغل الفيديو] عنصر moviePlayer متصل ومرئي الآن. حل الوعد.');
                            resolve();
                        } else {
                            requestAnimationFrame(checkVisibility); // حاول مرة أخرى في الإطار التالي للرسوم المتحركة
                        }
                    };
                    setTimeout(() => requestAnimationFrame(checkVisibility), 50); // تأخير بسيط لضمان تحديث DOM
                });

                console.log('[مشغل الفيديو] moviePlayer جاهز. المتابعة بتهيئة Video.js.');

                videoJsPlayerInstance = videojs(moviePlayerElement, {
                    autoplay: false, // تركه false هو الأفضل لتجربة المستخدم ولتجنب مشاكل المتصفحات
                    controls: true,
                    responsive: true,
                    fluid: true, // مهم للموبايل: المشغل سيتمدد ليناسب حجم العنصر الأب
                    techOrder: ['html5'], // التأكد من استخدام HTML5
                    html5: {
                        nativeControlsForTouch: true, // **مهم جداً للموبايل**: يستخدم ضوابط التشغيل الأصلية للجوال لتجربة أفضل
                        vhs: { // إعدادات Video.js HLS (VHS) لتحسين الأداء
                            limitRenditionByPlayerDimensions: false,
                            enableLowInitialPlaylist: true, // يبدأ بأقل جودة لأسرع بدء تشغيل
                            fastQualityChange: true,
                            // **تحسين تقطيع الفيديو على الموبايل**: قيم الـ Buffer أقل لتحسين سرعة البدء وتقليل استهلاك البيانات
                            maxBufferLength: 10,  // أقصى تحميل مسبق عند التوقف (بالثواني)
                            maxMaxBufferLength: 30, // أقصى buffer أثناء التشغيل المستمر (بالثواني)
                        },
                    },
                    playbackRates: [0.5, 1, 1.5, 2], // سرعات التشغيل
                    sources: [{
                        src: decodedVideoUrl,
                        // **الخطوة الحاسمة للقضاء على التقطيع**: غير هذا النوع!
                        // لو حولت فيديوهاتك لـ HLS (موصى به جدًا):
                        //    type: 'application/x-mpegURL'
                        // لو حولت فيديوهاتك لـ DASH:
                        //    type: 'application/dash+xml'
                        // لو ما زلت تستخدم MP4 مباشر (لن يحل التقطيع تماماً):
                        //    type: 'video/mp4'
                        type: 'video/mp4' // <-- **غيّر هذا السطر بعد تحويل فيديوهاتك لـ HLS/DASH ورفعها على CDN**
                    }],
                    crossOrigin: 'anonymous' // مهم إذا كانت الفيديوهات على نطاق مختلف عن موقعك (خاصة مع CDN)
                }, function() {
                    console.log(`[Video.js] تم تهيئة المشغل بنجاح للمصدر: ${decodedVideoUrl}`);
                    if (videoLoadingSpinner && !this.hasStarted() && !this.paused() && !this.ended()) {
                        videoLoadingSpinner.style.display = 'block';
                    }
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'auto';
                        videoOverlay.classList.remove('hidden');
                    }

                    this.ready(function() {
                        const player = this;
                        // منع زر التنزيل إذا كان موجودًا (Video.js غالبًا ما يضيفه لـ native controls)
                        const downloadButton = player.controlBar.getChild('DownloadButton') || player.controlBar.getChild('DownloadToggle');
                        if (downloadButton) {
                            player.controlBar.removeChild(downloadButton);
                            console.log('[Video.js] تمت إزالة زر التنزيل من شريط التحكم.');
                        } else {
                            console.log('[Video.js] لم يتم العثور على زر تنزيل افتراضي لإزالته.');
                        }
                        // منع النقر بالزر الأيمن على عنصر الفيديو لمنع التنزيل
                        player.tech_.el_.addEventListener('contextmenu', function(e) {
                            e.preventDefault();
                            console.log('🚫 [مشغل الفيديو] تم تعطيل النقر بالزر الأيمن على عنصر الفيديو.');
                        });
                    });
                });

                // --- مستمعو أحداث مشغل الفيديو للإعلانات والغطاء ---
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
                    if (videoOverlay) { // إبقاء الغطاء نشطًا أثناء التخزين المؤقت
                        videoOverlay.style.pointerEvents = 'auto';
                        videoOverlay.classList.remove('hidden');
                    }
                });

                videoJsPlayerInstance.on('pause', () => {
                    console.log('[Video.js] تم إيقاف الفيديو مؤقتًا.');
                    if (!videoJsPlayerInstance.ended()) { // لا تفتح إعلان إذا انتهى الفيديو
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
                    console.log('[Video.js] انتهى الفيديو.');
                    openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION, 'videoEndedRestart');
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'auto';
                        videoOverlay.classList.remove('hidden');
                    }
                    videoJsPlayerInstance.currentTime(0); // إعادة الفيديو للبداية بعد الانتهاء
                });

            } else {
                console.warn('⚠️ [مشغل الفيديو] عنصر moviePlayer غير موجود أو غير جاهز بعد المحاولات. سيتم تخطي تهيئة Video.js.');
                if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                if (videoOverlay) {
                    videoOverlay.style.display = 'flex';
                    videoOverlay.style.pointerEvents = 'auto';
                    videoOverlay.classList.remove('hidden');
                }
            }

            // --- تحديث URL والـ SEO ---
            const newUrl = new URL(window.location.origin);
            newUrl.searchParams.set('view', 'details');
            newUrl.searchParams.set('id', movieId);
            history.pushState({ view: 'details', id: movieId }, movie.title, newUrl.toString());
            console.log(`🔗 [URL] تم تحديث URL إلى ${newUrl.toString()}`);

            updateMetaTags(movie);
            addJsonLdSchema(movie);
            displaySuggestedMovies(movieId);
            console.log(`✨ [اقتراحات] استدعاء displaySuggestedMovies للمعّرف: ${movieId}`);

        } else {
            console.error('❌ [توجيه] الفيلم غير موجود للمعّرف:', movieId, 'يتم إعادة التوجيه إلى الصفحة الرئيسية.');
            showHomePage();
        }
    }

    // --- دالات الـ SEO (محسنة) ---
    function updateMetaTags(movie) {
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute('href', window.location.href);

        document.title = `${movie.title} - مشاهدة أونلاين على شاهد بلس بجودة عالية`;
        document.querySelector('meta[name="description"]')?.setAttribute('content', `شاهد فيلم ${movie.title} أونلاين بجودة عالية. ${movie.description || 'استمتع بأحدث الأفلام والمسلسلات العربية والأجنبية بجودة 4K فائقة الوضوح.'}`);

        document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${movie.title} - مشاهدة أونلاين على شاهد بلس`);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', `شاهد فيلم ${movie.title} أونلاين بجودة عالية. ${movie.description || 'استمتع بأحدث الأفلام والمسلسلات العربية والأجنبية بجودة 4K فائقة الوضوح.'}`);
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', movie.poster);
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.href);
        document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'video.movie');
        document.querySelector('meta[property="og:locale"]')?.setAttribute('content', 'ar_AR');
        document.querySelector('meta[property="og:site_name"]')?.setAttribute('content', 'شاهد بلس');

        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', `${movie.title} - مشاهدة أونلاين على شاهد بلس`);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', `شاهد فيلم ${movie.title} أونلاين بجودة عالية. ${movie.description || 'استمتع بأحدث الأفلام والمسلسلات العربية والأجنبية بجودة 4K فائقة الوضوح.'}`);
        document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', movie.poster);
        document.querySelector('meta[name="twitter:card"]')?.setAttribute('content', 'summary_large_image');

        console.log('📄 [SEO] تم تحديث الميتا تاجز لتفاصيل الفيلم.');
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

        const castArray = Array.isArray(movie.cast) ? movie.cast : String(movie.cast || '').split(',').map(s => s.trim()).filter(s => s !== '');
        const genreArray = Array.isArray(movie.genre) ? movie.genre : String(movie.genre || '').split(',').map(s => s.trim()).filter(s => s !== '');

        const schema = {
            "@context": "http://schema.org",
            "@type": "Movie", // تغيير من VideoObject إلى Movie (أكثر تحديداً)
            "name": movie.title,
            "description": movie.description || `مشاهدة وتحميل فيلم ${movie.title} بجودة عالية على شاهد بلس. استمتع بمشاهدة أحدث الأفلام والمسلسلات الحصرية.`,
            "image": movie.poster,
            "thumbnailUrl": movie.poster,
            "uploadDate": formattedUploadDate,
            "embedUrl": decodeBase64(movie.embed_url_encoded),
            "duration": movie.duration || "PT1H30M",
            "contentUrl": decodeBase64(movie.embed_url_encoded),
            "inLanguage": "ar",
            "publisher": {
                "@type": "Organization",
                "name": "شاهد بلس",
                "logo": {
                    "@type": "ImageObject",
                    // **هام جداً لـ SEO**: غيّر هذا الرابط إلى رابط شعار موقعك الفعلي على CDN
                    "url": "https://shahidplus.online//images/shahed-plus-logo.png", // غيّر هذا الرابط
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
                    "name": "مشاهدة الفيلم",
                    "price": "0",
                    "priceCurrency": "USD",
                    "availability": "http://schema.org/InStock",
                    "url": window.location.href
                }
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
        if (movie.rating && typeof movie.rating === 'string' && movie.rating.includes('/')) {
            const ratingValue = parseFloat(movie.rating.split('/')[0]);
            if (!isNaN(ratingValue) && ratingValue >= 0 && ratingValue <= 10) {
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
            console.log('📄 [SEO] تم إزالة مخطط JSON-LD القديم.');
        }

        let script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
        console.log('📄 [SEO] تم إضافة/تحديث مخطط JSON-LD الجديد.');
    }

    // تحسين: التوصيات تعتمد على النوع أولاً، ثم العشوائية
    function displaySuggestedMovies(currentMovieId) {
        if (!suggestedMovieGrid || !currentDetailedMovie) {
            console.error('❌ displaySuggestedMovies: suggestedMovieGrid أو currentDetailedMovie غير موجودين. لا يمكن عرض الأفلام المقترحة.');
            return;
        }

        const currentMovieGenre = currentDetailedMovie.genre;
        let suggested = [];

        // محاولة العثور على أفلام من نفس النوع أولاً
        if (currentMovieGenre) {
            const currentMovieGenresArray = Array.isArray(currentMovieGenre) ? currentMovieGenre.map(g => g.toLowerCase().trim()) : [currentMovieGenre.toLowerCase().trim()];

            suggested = moviesData.filter(movie =>
                movie.id !== currentMovieId &&
                (Array.isArray(movie.genre)
                    ? movie.genre.some(g => currentMovieGenresArray.includes(g.toLowerCase().trim()))
                    : currentMovieGenresArray.includes(String(movie.genre || '').toLowerCase().trim())
                )
            );
            suggested = suggested.sort(() => 0.5 - Math.random()); // خلط الأفلام المقترحة من نفس النوع
        }

        // إذا لم يتم العثور على ما يكفي من الأفلام المقترحة، أضف أفلامًا عشوائية
        if (suggested.length < 24) {
            const otherMovies = moviesData.filter(movie => movie.id !== currentMovieId && !suggested.includes(movie));
            const shuffledOthers = otherMovies.sort(() => 0.5 - Math.random());
            const needed = 24 - suggested.length;
            suggested = [...suggested, ...shuffledOthers.slice(0, needed)];
        }

        const finalSuggested = suggested.slice(0, 24);

        if (finalSuggested.length === 0) {
            suggestedMovieGrid.innerHTML = '<p style="text-align: center; color: var(--text-muted);">لا توجد أفلام مقترحة حالياً.</p>';
            console.log('✨ [اقتراحات] لا توجد أفلام مقترحة متاحة بعد التصفية.');
            return;
        }

        displayMovies(finalSuggested, suggestedMovieGrid);
        console.log(`✨ [اقتراحات] تم عرض ${finalSuggested.length} فيلمًا مقترحًا في ${suggestedMovieGrid.id}.`);
    }


    function showHomePage() {
        console.log('🏠 [توجيه] عرض الصفحة الرئيسية.');
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
            console.log('[Video.js] التخلص من المشغل عند الانتقال للصفحة الرئيسية.');
            videoJsPlayerInstance.dispose();
            videoJsPlayerInstance = null;
        }
        currentDetailedMovie = null;

        if (videoContainer) {
            videoContainer.innerHTML = '';
            console.log('[مشغل الفيديو] تم مسح movie-player-container عند الانتقال للصفحة الرئيسية.');
        }

        const newUrl = new URL(window.location.origin);
        history.pushState({ view: 'home' }, 'شاهد بلس - الصفحة الرئيسية', newUrl.toString());
        console.log(`🔗 [URL] تم تحديث URL إلى ${newUrl.toString()}`);

        // إعادة تعيين الميتا تاجز لقيم الصفحة الرئيسية الافتراضية
        document.title = 'شاهد بلس - بوابتك الفاخرة للترفيه السينمائي | أفلام ومسلسلات 4K أونلاين';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'شاهد بلس: بوابتك الفاخرة للترفيه السينمائي. استمتع بأحدث الأفلام والمسلسلات العربية والأجنبية بجودة 4K فائقة الوضوح، مترجمة ومدبلجة، مع تجربة مشاهدة احترافية لا مثيل لها. اكتشف عالمًا من المحتوى الحصري والمتجدد.');
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'شاهد بلس - بوابتك الفاخرة للترفيه السينمائي | أفلام ومسلسلات 4K');
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', 'شاهد بلس: بوابتك الفاخرة للترفيه السينمائي. استمتع بأحدث الأفلام والمسلسلات العربية والأجنبية بجودة 4K فائقة الوضوح، مترجمة ومدبلجة، مع تجربة مشاهدة احترافية لا مثيل لها. اكتشف عالمًا من المحتوى الحصري والمتجدد.');
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.origin);
        document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'website');
        // **هام لـ SEO/الانتشار**: استخدم شعار موقعك هنا وليس صورة عشوائية
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', 'https://shahidplus.online//images/your-logo-for-og.png'); // **غيّر هذا الرابط**
        document.querySelector('meta[property="og:image:alt"]')?.setAttribute('content', 'شاهد بلس | بوابتك للترفيه السينمائي الفاخر');
        document.querySelector('meta[property="og:site_name"]')?.setAttribute('content', 'شاهد بلس');

        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', 'شاهد بلس - بوابتك الفاخرة للترفيه السينمائي | أفلام ومسلسلات 4K');
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', 'شاهد بلس: بوابتك الفاخرة للترفيه السينمائي. استمتع بأحدث الأفلام والمسلسلات العربية والأجنبية بجودة 4K فائقة الوضوح، مترجمة ومدبلجة، مع تجربة مشاهدة احترافية لا مثيل لها. اكتشف عالمًا من المحتوى الحصري والمتجدد.');
        document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', 'https://shahidplus.online//images/your-logo-for-twitter.png'); // **غيّر هذا الرابط**
        document.querySelector('meta[name="twitter:card"]')?.setAttribute('content', 'summary_large_image');

        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (canonicalLink) {
            canonicalLink.setAttribute('href', window.location.origin);
        }

        let script = document.querySelector('script[type="application/ld+json"]');
        if (script) {
            script.remove();
            console.log('📄 [SEO] تم إزالة مخطط JSON-LD عند الصفحة الرئيسية.');
        }
    }

    // --- 5. Event Listeners ---
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('nav-open');
            console.log('☰ [تفاعل] تم تبديل القائمة.');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav && mainNav.classList.contains('nav-open')) {
                mainNav.classList.remove('nav-open');
                console.log('📱 [تفاعل] تم النقر على رابط التنقل، تم إغلاق القائمة.');
            } else {
                console.log('📱 [تفاعل] تم النقر على رابط التنقل.');
            }
        });
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
                searchInput.blur(); // إخفاء لوحة المفاتيح في الجوال بعد البحث
            }
        });
        console.log('🔍 [حدث] تم إرفاق مستمع ضغط مفتاح البحث.');
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                paginateMovies(moviesDataForPagination, currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
        videoOverlay.addEventListener('click', (e) => {
            console.log('⏯️ [نقر إعلان] تم النقر على غطاء الفيديو. محاولة فتح الرابط المباشر.');
            const adOpened = openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION, 'videoOverlay');

            if (adOpened) {
                setTimeout(() => {
                    if (videoJsPlayerInstance && (videoJsPlayerInstance.paused() || videoJsPlayerInstance.ended())) {
                        videoJsPlayerInstance.play().then(() => {
                            console.log('[Video.js] بدأ المشغل في التشغيل بعد النقر على الغطاء وفتح الإعلان.');
                            if (videoOverlay) {
                                videoOverlay.style.pointerEvents = 'none';
                                videoOverlay.classList.add('hidden');
                            }
                            if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                        }).catch(error => {
                            console.warn('⚠️ [Video.js] فشل التشغيل بعد فتح الإعلان (لا يزال يتطلب تفاعل المستخدم):', error);
                            if (videoOverlay) {
                                videoOverlay.style.pointerEvents = 'auto';
                                videoOverlay.classList.remove('hidden');
                            }
                            if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                        });
                    } else if (videoJsPlayerInstance && videoJsPlayerInstance.isReady_ && !videoJsPlayerInstance.paused() && !videoJsPlayerInstance.ended()){
                        console.log('[Video.js] المشغل يعمل بالفعل، تم فتح الإعلان فقط.');
                        if (videoOverlay) {
                            videoOverlay.style.pointerEvents = 'none';
                            videoOverlay.classList.add('hidden');
                        }
                    } else {
                        console.warn('[Video.js] مثيل المشغل غير جاهز أو غير موجود عند محاولة التشغيل عبر النقر على الغطاء بعد الإعلان. سيظل الغطاء نشطًا.');
                        if (videoOverlay) {
                            videoOverlay.style.pointerEvents = 'auto';
                            videoOverlay.classList.remove('hidden');
                        }
                        if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                    }
                }, 500); // تأخير بسيط للسماح بفتح/تركيز علامة تبويب الإعلان
            } else {
                console.log('[غطاء الفيديو] الإعلان لم يفتح بسبب التهدئة. سيظل الغطاء نشطًا.');
            }
            e.stopPropagation(); // منع النقر من الانتشار إلى عناصر تحكم المشغل على الفور
        });
        console.log('[غطاء الفيديو] تم إرفاق مستمع النقر لتفاعل الإعلان.');
    }

    // --- حماية أدوات المطور وتعطيل اختصارات لوحة المفاتيح والنقر الأيمن ---
    // تعطيل النقر الأيمن
    document.addEventListener('contextmenu', e => {
        e.preventDefault();
        console.warn('🚫 [أمان] تم تعطيل النقر بالزر الأيمن.');
    });

    // تعطيل اختصارات لوحة المفاتيح لأدوات المطور/المصدر
    document.addEventListener('keydown', e => {
        // F12 || Ctrl+Shift+I || Ctrl+Shift+J || Ctrl+U (عرض مصدر الصفحة) || Cmd+Option+I (Mac)
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
            (e.ctrlKey && e.key === 'u') ||
            (e.metaKey && e.altKey && e.key === 'I') // Mac: Cmd+Option+I
        ) {
            e.preventDefault();
            console.warn(`🚫 [أمان] تم منع اختصار لوحة المفاتيح لأدوات المطور/المصدر: ${e.key}`);
        }
    });

    // كشف أدوات المطور (لا يتم مسح الصفحة)
    const devtoolsDetector = (() => {
        const threshold = 160;

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
        setInterval(checkDevTools, 1000);
        checkDevTools(); // فحص مبدئي عند التحميل
    })();

    // --- منطق التحميل الأولي للصفحة (يتعامل مع الوصول المباشر لـ URL) ---
    function initialPageLoadLogic() {
        const urlParams = new URLSearchParams(window.location.search);
        const viewParam = urlParams.get('view');
        const idParam = urlParams.get('id');

        if (viewParam === 'details' && idParam) {
            const movieId = parseInt(idParam);
            if (!isNaN(movieId) && moviesData.find(m => m.id === movieId)) {
                console.log(`🚀 [تحميل أولي] محاولة تحميل تفاصيل الفيلم من URL: المعّرف ${movieId}`);
                showMovieDetails(movieId);
            } else {
                console.warn('⚠️ [تحميل أولي] معّرف الفيلم غير صالح في URL أو الفيلم غير موجود. يتم عرض الصفحة الرئيسية.');
                showHomePage();
            }
        } else {
            console.log('🚀 [تحميل أولي] لا يوجد عرض محدد في URL. يتم عرض الصفحة الرئيسية.');
            showHomePage();
        }
    }

    window.addEventListener('popstate', (event) => {
        console.log('↩️ [Popstate] تم اكتشاف تصفح سجل المتصفح.', event.state);
        if (moviesData.length === 0) {
            console.warn('[Popstate] لم يتم تحميل بيانات الفيلم، محاولة عرض الصفحة الرئيسية.');
            showHomePage();
            return;
        }

        if (event.state && event.state.view === 'details' && event.state.id) {
            showMovieDetails(event.state.id);
        } else {
            showHomePage();
        }
    });

    // ابدأ العملية بجلب بيانات الفيلم
    fetchMoviesData();

    // --- تذكير بالتشويش (Obfuscation) ---
    console.log('%c[تذكير بالتشويش] تذكر تشويش هذا السكريبت قبل النشر!', 'color: orange; font-weight: bold;');
});
