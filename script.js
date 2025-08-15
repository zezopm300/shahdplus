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

    // --- العناصر الجديدة للاقتراحات ---
    const searchContainer = searchInput ? searchInput.parentElement : null;
    let suggestionsList = null; // سيتم إنشاؤها ديناميكياً

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
        '#movie-details-poster': movieDetailsPoster
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
    const DIRECT_LINK_COOLDOWN_MOVIE_CARD = 3 * 60 * 1000;
    const DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION = 100 * 1000;

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

    // --- 3. Movie Data & Video URL Handling ---
    let moviesData = [];
    let moviesDataForPagination = [];
    let currentDetailedMovie = null;
    let videoJsPlayerInstance = null;
    let videoJsScriptsLoaded = false;

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
            await loadLink('https://vjs.zencdn.net/8.10.0/video-js.css');
            await Promise.all([
                loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest'),
                loadScript('https://vjs.zencdn.net/8.10.0/video.min.js')
            ]);
            await loadScript('https://cdn.jsdelivr.net/npm/videojs-contrib-hls@5.15.0/dist/videojs-contrib-hls.min.js');

            videoJsScriptsLoaded = true;
            console.log("All Video.js related scripts and stylesheets loaded successfully.");
        } catch (error) {
            console.error("Error loading video player assets:", error);
            if (videoContainer) {
                videoContainer.innerHTML = '<p style="text-align: center; color: var(--text-color); margin-top: 20px;">عذرًا، تعذر تحميل مشغل الفيديو. يرجى تحديث الصفحة والمحاولة مرة أخرى.</p>';
            }
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
        const webpSource = movie.poster.replace(/\.(png|jpe?g)$/i, '.webp'); 
        movieCard.innerHTML = `
            <picture>
                <source srcset="${webpSource}" type="image/webp">
                <img src="${movie.poster}" alt="${movie.title}" width="200" height="300">
            </picture>
            <h3>${movie.title}</h3>
        `;
        movieCard.querySelector('source').onerror = function() { this.remove(); };
        movieCard.addEventListener('click', () => {
            console.log(`⚡ [تفاعل] تم النقر على بطاقة الفيلم للمعّرف: ${movie.id}`);
            openAdLink(DIRECT_LINK_COOLDOWN_MOVIE_CARD, 'movieCard');
            showMovieDetails(movie.id);
        });
        return movieCard;
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

        console.log(`🎬 [عرض] جاري عرض ${moviesToDisplay.length} فيلم في ${targetGridElement.id}.`);
        moviesToDisplay.forEach(movie => {
            targetGridElement.appendChild(createMovieCard(movie));
        });
        console.log(`🎬 [عرض] تم عرض ${moviesToDisplay.length} فيلمًا في ${targetGridElement.id}.`);
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

    // --- دالة البحث الجديدة والمعدلة مع نظام النقاط (Scoring) ---
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        let filteredMovies = [];

        if (query) {
            hideSuggestions(); // إخفاء الاقتراحات عند إجراء البحث النهائي
            const searchWords = query.split(/\s+/).filter(word => word.length > 1);

            if (searchWords.length > 0) {
                // فلترة الأفلام بناءً على مدى تطابق الكلمات
                let scoredMovies = moviesData.map(movie => {
                    let score = 0;
                    const searchableText = `${movie.title.toLowerCase()} ${String(movie.director || '').toLowerCase()} ${Array.isArray(movie.cast) ? movie.cast.join(' ').toLowerCase() : String(movie.cast || '').toLowerCase()} ${Array.isArray(movie.genre) ? movie.genre.join(' ').toLowerCase() : String(movie.genre || '').toLowerCase()} ${String(movie.description || '').toLowerCase()}`;
                    
                    searchWords.forEach(word => {
                        if (searchableText.includes(word)) {
                            score++;
                        }
                    });

                    return { movie, score };
                }).filter(item => item.score > 0); // الاحتفاظ بالأفلام التي حصلت على نقطة واحدة على الأقل
                
                // ترتيب الأفلام بناءً على النقاط (الأعلى أولاً)
                scoredMovies.sort((a, b) => b.score - a.score);

                filteredMovies = scoredMovies.map(item => item.movie);

            } else {
                // إذا كانت كلمات البحث قصيرة جدًا، أظهر كل شيء أو لا شيء
                filteredMovies = moviesData;
            }

            if (sectionTitleElement) {
                sectionTitleElement.textContent = `نتائج البحث عن "${query}"`;
            }
            console.log(`🔍 [بحث احترافي] تم إجراء بحث عن "${query}". تم العثور على ${filteredMovies.length} نتيجة.`);

        } else {
            // عند البحث الفارغ، اعرض الأفلام بترتيب عشوائي
            filteredMovies = [...moviesData].sort(() => 0.5 - Math.random());
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

    // --- وظائف الاقتراحات (Autosuggest) الجديدة ---
    function showSuggestions(filteredMovies) {
        if (!searchInput || !searchContainer) return;

        if (!suggestionsList) {
            suggestionsList = document.createElement('ul');
            suggestionsList.classList.add('suggestions-list');
            searchContainer.appendChild(suggestionsList);

            // إضافة CSS بسيط للعنصر
            const style = document.createElement('style');
            style.textContent = `
                .suggestions-list {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: var(--bg-color-dark);
                    border: 1px solid var(--primary-color);
                    border-top: none;
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    max-height: 300px;
                    overflow-y: auto;
                    z-index: 100;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                    border-radius: 0 0 8px 8px;
                    transform: translateY(-2px);
                }
                .suggestions-list li {
                    padding: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    border-bottom: 1px solid #333;
                }
                .suggestions-list li:last-child {
                    border-bottom: none;
                }
                .suggestions-list li:hover {
                    background-color: var(--primary-color);
                    color: white;
                }
                .suggestions-list img {
                    width: 40px;
                    height: 60px;
                    margin-left: 10px;
                    border-radius: 4px;
                }
                .suggestions-list .movie-title {
                    font-weight: bold;
                    color: var(--text-color);
                }
                .suggestions-list li:hover .movie-title {
                    color: white;
                }
            `;
            document.head.appendChild(style);
        }

        suggestionsList.innerHTML = '';
        if (filteredMovies.length === 0) {
            suggestionsList.style.display = 'none';
            return;
        }

        suggestionsList.style.display = 'block';

        filteredMovies.slice(0, 5).forEach(movie => { // عرض أول 5 نتائج فقط
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
                <span class="movie-title">${movie.title}</span>
            `;
            li.addEventListener('click', () => {
                searchInput.value = movie.title;
                showMovieDetails(movie.id);
                hideSuggestions();
            });
            suggestionsList.appendChild(li);
        });
    }

    function hideSuggestions() {
        if (suggestionsList) {
            suggestionsList.style.display = 'none';
        }
    }

    async function showMovieDetails(movieId) {
        console.log(`🔍 [توجيه] عرض تفاصيل الفيلم للمعّرف: ${movieId}`);
        const movie = moviesData.find(m => m.id === movieId);

        if (movie) {
            currentDetailedMovie = movie;

            if (heroSection) heroSection.style.display = 'none';
            if (movieGridSection) movieGridSection.style.display = 'none';

            if (videoJsPlayerInstance) {
                console.log('[Video.js] التخلص من مثيل المشغل الحالي قبل عرض تفاصيل جديدة.');
                videoJsPlayerInstance.dispose();
                videoJsPlayerInstance = null;
            }

            await loadVideoJsAndHls();

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
                console.log('[مشغل الفيديو] تم إعادة إنشاء عنصر movie-player.');
            } else {
                console.error('❌ خطأ فادح: movie-player-container غير موجود. لا يمكن إنشاء مشغل الفيديو.');
                return;
            }

            if (movieDetailsSection) movieDetailsSection.style.display = 'block';
            if (suggestedMoviesSection) suggestedMoviesSection.style.display = 'block';

            window.scrollTo({ top: 0, behavior: 'smooth' });
            console.log('[توجيه] تم التمرير للأعلى.');

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

            const moviePlayerElement = document.getElementById('movie-player');
            const videoUrl = movie.embed_url;

            if (!videoUrl) {
                console.error(`❌ فشل الحصول على رابط الفيديو لمعّرف الفيلم: ${movieId}. لا يمكن تهيئة المشغل.`);
                if (videoContainer) {
                    videoContainer.innerHTML = '<p style="text-align: center; color: var(--text-color); margin-top: 20px;">عذرًا، لا يمكن تشغيل الفيديو حاليًا (الرابط غير صالح). يرجى المحاولة لاحقًا.</p>';
                }
                return;
            }

            if (window.videojs) {
                await new Promise(resolve => {
                    const checkVisibility = () => {
                        if (moviePlayerElement && moviePlayerElement.offsetParent !== null) {
                            console.log('[مشغل الفيديو] عنصر moviePlayer متصل ومرئي الآن. حل الوعد.');
                            resolve();
                        } else {
                            requestAnimationFrame(checkVisibility);
                        }
                    };
                    setTimeout(() => requestAnimationFrame(checkVisibility), 50);
                });

                console.log('[مشغل الفيديو] moviePlayer جاهز. المتابعة بتهيئة Video.js.');

                videoJsPlayerInstance = videojs(moviePlayerElement, {
                    autoplay: false,
                    controls: true,
                    responsive: true,
                    fluid: true,
                    techOrder: ['html5'],
                    html5: {
                        nativeControlsForTouch: true,
                        vhs: {
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
                        type: 'video/mp4'
                    }],
                    crossOrigin: 'anonymous'
                }, function() {
                    console.log(`[Video.js] تم تهيئة المشغل بنجاح للمصدر: ${videoUrl}`);
                    if (videoLoadingSpinner && !this.hasStarted() && !this.paused() && !this.ended()) {
                        videoLoadingSpinner.style.display = 'block';
                    }
                    if (videoOverlay) {
                        videoOverlay.style.pointerEvents = 'auto';
                        videoOverlay.classList.remove('hidden');
                    }

                    this.ready(function() {
                        const player = this;
                        const downloadButton = player.controlBar.getChild('DownloadButton') || player.controlBar.getChild('DownloadToggle');
                        if (downloadButton) {
                            player.controlBar.removeChild(downloadButton);
                            console.log('[Video.js] تمت إزالة زر التنزيل من شريط التحكم.');
                        } else {
                            console.log('[Video.js] لم يتم العثور على زر تنزيل افتراضي لإزالته.');
                        }
                        player.tech_.el_.addEventListener('contextmenu', function(e) {
                            e.preventDefault();
                            console.log('🚫 [مشغل الفيديو] تم تعطيل النقر بالزر الأيمن على عنصر الفيديو.');
                        });
                    });
                });

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
                    if (!videoJsPlayerInstance.ended()) {
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
                    videoJsPlayerInstance.currentTime(0);
                });

            } else {
                console.warn('⚠️ [مشغل الفيديو] Video.js لم يتم تحميله بعد أو حدث خطأ في تحميله. لا يمكن تهيئة المشغل.');
                if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
                if (videoOverlay) {
                    videoOverlay.style.display = 'flex';
                    videoOverlay.style.pointerEvents = 'auto';
                    videoOverlay.classList.remove('hidden');
                }
                if (videoContainer) {
                    videoContainer.innerHTML = '<p style="text-align: center; color: var(--text-color); margin-top: 20px;">عذرًا، تعذر تحميل مشغل الفيديو. يرجى تحديث الصفحة والمحاولة مرة أخرى.</p>';
                }
            }

            const movieSlug = movie.title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '').replace(/\s+/g, '-');
            const newUrl = new URL(window.location.origin);
            newUrl.searchParams.set('view', 'details');
            newUrl.searchParams.set('id', movieId);
            newUrl.searchParams.set('title', movieSlug);

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

    function updateMetaTags(movie = null) {
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
        }

        let pageTitle, pageDescription, pageKeywords, ogUrl, ogTitle, ogDescription, ogImage, ogType, ogVideoUrl, ogVideoType;
        let twitterTitle, twitterDescription, twitterImage;
        const defaultTitle = 'موقع أفلام';
        const defaultDescription = 'شاهد أحدث الأفلام والمسلسلات بجودة عالية وبشكل مجاني تمامًا.';
        const defaultImage = 'https://example.com/images/default-poster.webp'; // استبدل برابط الصورة الافتراضي

        if (movie) {
            pageTitle = `شاهد فيلم ${movie.title} - ${defaultTitle}`;
            pageDescription = movie.description || defaultDescription;
            pageKeywords = `${movie.title}, ${movie.director || ''}, ${movie.genre || ''}, ${Array.isArray(movie.cast) ? movie.cast.join(', ') : ''}, مشاهدة اون لاين, فيلم`;
            ogUrl = window.location.href;
            ogTitle = pageTitle;
            ogDescription = pageDescription;
            ogImage = movie.poster;
            ogType = 'video.movie';
            ogVideoUrl = movie.embed_url;
            ogVideoType = 'application/x-mpegURL'; // أو video/mp4 حسب نوع الفيديو

            twitterTitle = ogTitle;
            twitterDescription = ogDescription;
            twitterImage = ogImage;
        } else {
            pageTitle = defaultTitle;
            pageDescription = defaultDescription;
            pageKeywords = 'أفلام، مسلسلات، مشاهدة اون لاين، مجاني، جديد، عربي، أجنبي';
            ogUrl = window.location.origin;
            ogTitle = defaultTitle;
            ogDescription = defaultDescription;
            ogImage = defaultImage;
            ogType = 'website';

            twitterTitle = defaultTitle;
            twitterDescription = defaultDescription;
            twitterImage = defaultImage;
        }

        document.title = pageTitle;
        canonicalLink.href = ogUrl;
        
        // تحديث أو إنشاء الميتا تاج
        const updateMeta = (name, content, property = null) => {
            let meta = document.querySelector(`meta[${property ? 'property' : 'name'}="${name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                if (property) {
                    meta.setAttribute('property', name);
                } else {
                    meta.setAttribute('name', name);
                }
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };
        
        updateMeta('description', pageDescription);
        updateMeta('keywords', pageKeywords);
        updateMeta('og:url', ogUrl, true);
        updateMeta('og:title', ogTitle, true);
        updateMeta('og:description', ogDescription, true);
        updateMeta('og:image', ogImage, true);
        updateMeta('og:type', ogType, true);
        updateMeta('twitter:card', 'summary_large_image', true);
        updateMeta('twitter:title', twitterTitle, true);
        updateMeta('twitter:description', twitterDescription, true);
        updateMeta('twitter:image', twitterImage, true);
        
        if (movie && movie.embed_url) {
            updateMeta('og:video', ogVideoUrl, true);
            updateMeta('og:video:type', ogVideoType, true);
        } else {
            const ogVideoMeta = document.querySelector('meta[property="og:video"]');
            if (ogVideoMeta) ogVideoMeta.remove();
        }
        console.log('🔄 [SEO] تم تحديث الميتا تاج والـ URL');
    }

    function addJsonLdSchema(movie) {
        let schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (schemaScript) {
            schemaScript.remove();
        }

        if (movie) {
            const schema = {
                "@context": "http://schema.org",
                "@type": "Movie",
                "name": movie.title,
                "description": movie.description,
                "dateCreated": movie.release_date,
                "director": {
                    "@type": "Person",
                    "name": movie.director
                },
                "actor": (Array.isArray(movie.cast) ? movie.cast : String(movie.cast).split(', ')).map(actor => ({
                    "@type": "Person",
                    "name": actor.trim()
                })),
                "genre": Array.isArray(movie.genre) ? movie.genre : [movie.genre],
                "image": movie.poster,
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": movie.rating,
                    "ratingCount": "100"
                },
                "url": window.location.href,
                "duration": movie.duration
            };
            const newScript = document.createElement('script');
            newScript.type = 'application/ld+json';
            newScript.textContent = JSON.stringify(schema, null, 2);
            document.head.appendChild(newScript);
            console.log('📊 [SEO] تمت إضافة مخطط JSON-LD للفيلم.');
        } else {
            console.log('📊 [SEO] تم حذف مخطط JSON-LD (العودة للصفحة الرئيسية).');
        }
    }

    function getSuggestedMovies(currentMovieId) {
        const currentMovie = moviesData.find(m => m.id === currentMovieId);
        if (!currentMovie || !currentMovie.genre || !Array.isArray(currentMovie.genre) || currentMovie.genre.length === 0) {
            console.log('✨ [اقتراحات] لا يوجد نوع فيلم (genre) لتقديم الاقتراحات بناءً عليه. يتم عرض أفلام عشوائية.');
            return [...moviesData].filter(m => m.id !== currentMovieId).sort(() => 0.5 - Math.random()).slice(0, 10);
        }

        const currentGenres = currentMovie.genre;
        const suggested = moviesData.filter(movie => {
            if (movie.id === currentMovieId) {
                return false;
            }
            if (!movie.genre || !Array.isArray(movie.genre)) {
                return false;
            }
            // تحقق مما إذا كان هناك أي نوع مشترك
            return movie.genre.some(genre => currentGenres.includes(genre));
        });

        // إذا لم يتم العثور على اقتراحات بناءً على النوع، أظهر أفلام عشوائية
        if (suggested.length === 0) {
            console.log('✨ [اقتراحات] لم يتم العثور على أفلام بنفس النوع. يتم عرض أفلام عشوائية.');
            return [...moviesData].filter(m => m.id !== currentMovieId).sort(() => 0.5 - Math.random()).slice(0, 10);
        }

        console.log(`✨ [اقتراحات] تم العثور على ${suggested.length} فيلمًا مقترحًا بناءً على النوع.`);
        // قم بترتيب الاقتراحات عشوائيًا لتقديم تنوع
        return suggested.sort(() => 0.5 - Math.random()).slice(0, 10);
    }

    function displaySuggestedMovies(currentMovieId) {
        const suggested = getSuggestedMovies(currentMovieId);
        displayMovies(suggested, suggestedMovieGrid);
    }

    // --- 4. Navigation & State Management ---
    function showHomePage() {
        console.log('🏠 [توجيه] يتم عرض الصفحة الرئيسية.');
        if (heroSection) heroSection.style.display = 'block';
        if (movieGridSection) movieGridSection.style.display = 'block';
        if (movieDetailsSection) movieDetailsSection.style.display = 'none';
        if (suggestedMoviesSection) suggestedMoviesSection.style.display = 'none';
        if (videoJsPlayerInstance) {
            videoJsPlayerInstance.pause();
            videoJsPlayerInstance.dispose();
            videoJsPlayerInstance = null;
            console.log('[Video.js] تم إيقاف المشغل والتخلص منه.');
        }

        // عرض آخر حالة تمت تصفيتها (أو الرئيسية)
        if (moviesDataForPagination && moviesDataForPagination.length > 0) {
            paginateMovies(moviesDataForPagination, currentPage);
        } else {
            // إذا لم يكن هناك بيانات، أعد التحميل
            performSearch();
        }

        const newUrl = new URL(window.location.origin);
        history.pushState({ view: 'home' }, 'الصفحة الرئيسية', newUrl.toString());
        updateMetaTags(null);
        addJsonLdSchema(null);
    }

    function handleUrlChange() {
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view');
        const movieId = params.get('id');

        if (view === 'details' && movieId) {
            console.log(`🔗 [URL] تم اكتشاف رابط تفاصيل. المعّرف: ${movieId}`);
            showMovieDetails(Number(movieId));
        } else {
            console.log('🔗 [URL] تم اكتشاف رابط رئيسي.');
            if (window.location.pathname.endsWith('.html')) {
                // إذا كان المسار هو index.html، قم بتوجيه الصفحة الرئيسية
                showHomePage();
            } else if (!window.location.search && movieGridSection && movieDetailsSection) {
                 // إذا كان المسار الرئيسي بدون بارامترات، قم بتوجيه الصفحة الرئيسية
                showHomePage();
            } else {
                console.log('🔗 [URL] لا توجد بارامترات عرض صالحة. يتم عرض الصفحة الرئيسية.');
                showHomePage();
            }
        }
    }

    function initialPageLoadLogic() {
        if (moviesData.length > 0) {
            handleUrlChange();
        } else {
            showHomePage();
        }
    }

    // --- 5. Event Listeners ---
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    if (homeNavLink) {
        homeNavLink.addEventListener('click', (e) => {
            e.preventDefault();
            showHomePage();
        });
    }

    if (homeLogoLink) {
        homeLogoLink.addEventListener('click', (e) => {
            e.preventDefault();
            showHomePage();
        });
    }

    if (watchNowBtn) {
        watchNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (moviesData && moviesData.length > 0) {
                const randomMovie = moviesData[Math.floor(Math.random() * moviesData.length)];
                openAdLink(DIRECT_LINK_COOLDOWN_MOVIE_CARD, 'movieCard');
                showMovieDetails(randomMovie.id);
            } else {
                alert('لا توجد أفلام متاحة حاليًا.');
            }
        });
    }
    
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showHomePage();
        });
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                paginateMovies(moviesDataForPagination, currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
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
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            performSearch();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });

        // وظيفة البحث التلقائي (Autosuggest)
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            if (query.length > 2) {
                const searchWords = query.split(/\s+/).filter(word => word.length > 1);
                const relevantMovies = moviesData.filter(movie => {
                    const searchableText = `${movie.title.toLowerCase()} ${String(movie.director || '').toLowerCase()} ${Array.isArray(movie.cast) ? movie.cast.join(' ').toLowerCase() : String(movie.cast || '').toLowerCase()} ${Array.isArray(movie.genre) ? movie.genre.join(' ').toLowerCase() : String(movie.genre || '').toLowerCase()}`;
                    return searchWords.some(word => searchableText.includes(word));
                });
                showSuggestions(relevantMovies);
            } else {
                hideSuggestions();
            }
        });

        document.addEventListener('click', (e) => {
            if (searchContainer && !searchContainer.contains(e.target)) {
                hideSuggestions();
            }
        });
    }
    
    // منع السحب والإفلات على عنصر الفيديو
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'VIDEO') {
            e.preventDefault();
        }
    });

    if (videoOverlay) {
        videoOverlay.addEventListener('click', () => {
            if (videoJsPlayerInstance && videoJsPlayerInstance.paused()) {
                openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION, 'videoOverlay');
                videoJsPlayerInstance.play();
            }
        });
    }

    window.addEventListener('popstate', (e) => {
        console.log('➡️ [popstate] تم اكتشاف تغيير في سجل المتصفح.');
        handleUrlChange();
    });

    // --- 6. Initial Load ---
    fetchMoviesData();
});
