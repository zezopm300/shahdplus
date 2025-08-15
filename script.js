document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOM Content Loaded. Script execution started.');

    // --- 1. DOM Element References ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const homeNavLink = document.getElementById('home-nav-link-actual');
    const navLinks = document.querySelectorAll('.main-nav ul li a');
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

    // ** تم حذف مرجع `heroSection` و `watchNowBtn` لأن السكشن بالكامل سيتم حذفه من الـ HTML. **
    const heroSection = document.getElementById('hero-section');

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
                <img src="${movie.poster}" alt="${movie.title}" width="200" height="300" loading="lazy">
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

    // ** تم تعديل دالة البحث لتصبح أكثر قوة ودقة **
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        let filteredMovies = [];
    
        if (query) {
            const searchWords = query.split(/\s+/).filter(word => word.length > 1);
    
            if (searchWords.length > 0) {
                let scoredMovies = moviesData.map(movie => {
                    let score = 0;
                    const searchableText = `${movie.title.toLowerCase()} ${String(movie.director || '').toLowerCase()} ${Array.isArray(movie.cast) ? movie.cast.join(' ').toLowerCase() : String(movie.cast || '').toLowerCase()} ${Array.isArray(movie.genre) ? movie.genre.join(' ').toLowerCase() : String(movie.genre || '').toLowerCase()}`;
    
                    searchWords.forEach(word => {
                        if (searchableText.includes(word)) {
                            score++;
                        }
                    });
    
                    return { movie, score };
                }).filter(item => item.score > 0);
    
                scoredMovies.sort((a, b) => b.score - a.score);
                filteredMovies = scoredMovies.map(item => item.movie);
    
            } else {
                filteredMovies = [...moviesData].sort(() => 0.5 - Math.random());
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

    // ** تم حذف دوال الاقتراحات (Autosuggest) بالكامل **

    async function showMovieDetails(movieId) {
        console.log(`🔍 [توجيه] عرض تفاصيل الفيلم للمعّرف: ${movieId}`);
        const movie = moviesData.find(m => m.id === movieId);

        if (movie) {
            currentDetailedMovie = movie;

            // ** تم حذف إخفاء heroSection **
            if (movieGridSection) movieGridSection.style.display = 'none';

            if (videoJsPlayerInstance) {
                console.log('[Video.js] التخلص من مثيل المشغل الحالي قبل عرض تفاصيل جديدة.');
                videoJsPlayerInstance.dispose();
                videoJsPlayerInstance = null;
            }

            // ** تحميل Video.js فقط عند الحاجة **
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
        const siteName = 'اسم موقعك'; // استبدل بـ اسم موقعك
        const defaultTitle = `شاهد أحدث الأفلام والمسلسلات مجانًا | ${siteName}`;
        const defaultDescription = 'مكتبة ضخمة من الأفلام والمسلسلات المجانية. مشاهدة مباشرة بجودة عالية وبدون إعلانات مزعجة.';
        const defaultImage = 'رابط-الصورة-الافتراضية.png'; // استبدل بـ رابط صورة افتراضية

        if (movie) {
            pageTitle = `${movie.title} (${movie.release_date.slice(0, 4)}) - مشاهدة وتحميل مجانًا | ${siteName}`;
            pageDescription = movie.description || defaultDescription;
            pageKeywords = `${movie.title}, ${movie.title} مشاهدة, ${movie.title} تحميل, أفلام ${movie.genre}, ${movie.director}, ${movie.cast}`;
            ogUrl = window.location.href;
            ogTitle = pageTitle;
            ogDescription = pageDescription;
            ogImage = movie.poster;
            ogType = 'video.movie';
            ogVideoUrl = movie.embed_url;
            ogVideoType = 'text/html';
            twitterTitle = pageTitle;
            twitterDescription = pageDescription;
            twitterImage = movie.poster;
        } else {
            pageTitle = defaultTitle;
            pageDescription = defaultDescription;
            pageKeywords = 'أفلام, مسلسلات, مشاهدة مباشرة, أفلام مجانية, مسلسلات مجانية, أفلام عربية, أفلام أجنبية, أفلام أكشن, أفلام رومانسية';
            ogUrl = window.location.origin;
            ogTitle = defaultTitle;
            ogDescription = defaultDescription;
            ogImage = defaultImage;
            ogType = 'website';
            ogVideoUrl = '';
            ogVideoType = '';
            twitterTitle = defaultTitle;
            twitterDescription = defaultDescription;
            twitterImage = defaultImage;
        }

        document.title = pageTitle;
        canonicalLink.setAttribute('href', ogUrl);

        // وظيفة مساعدة لتحديث أو إنشاء Meta Tag
        const setMeta = (name, content) => {
            let meta = document.querySelector(`meta[name="${name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('name', name);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        // وظيفة مساعدة لتحديث أو إنشاء OG Tag
        const setOg = (property, content) => {
            let meta = document.querySelector(`meta[property="${property}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('property', property);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        setMeta('description', pageDescription);
        setMeta('keywords', pageKeywords);

        setOg('og:url', ogUrl);
        setOg('og:title', ogTitle);
        setOg('og:description', ogDescription);
        setOg('og:image', ogImage);
        setOg('og:type', ogType);

        if (ogVideoUrl) {
            setOg('og:video:url', ogVideoUrl);
            setOg('og:video:type', ogVideoType);
        } else {
            let metaVideoUrl = document.querySelector('meta[property="og:video:url"]');
            let metaVideoType = document.querySelector('meta[property="og:video:type"]');
            if (metaVideoUrl) metaVideoUrl.remove();
            if (metaVideoType) metaVideoType.remove();
        }

        // Twitter Meta Tags
        setMeta('twitter:card', 'summary_large_image');
        setMeta('twitter:title', twitterTitle);
        setMeta('twitter:description', twitterDescription);
        setMeta('twitter:image', twitterImage);

        console.log('✅ [SEO] تم تحديث علامات Meta و Open Graph بنجاح.');
    }

    function addJsonLdSchema(movie = null) {
        let oldSchema = document.getElementById('movie-ld-schema');
        if (oldSchema) {
            oldSchema.remove();
        }

        if (movie) {
            const schema = {
                "@context": "https://schema.org",
                "@type": "Movie",
                "name": movie.title,
                "url": window.location.href,
                "image": movie.poster,
                "description": movie.description,
                "dateCreated": movie.release_date,
                "director": {
                    "@type": "Person",
                    "name": movie.director
                },
                "actor": (Array.isArray(movie.cast) ? movie.cast : [movie.cast]).map(actorName => ({
                    "@type": "Person",
                    "name": actorName
                })),
                "genre": Array.isArray(movie.genre) ? movie.genre : [movie.genre],
                "aggregateRating": movie.rating ? {
                    "@type": "AggregateRating",
                    "ratingValue": movie.rating,
                    "bestRating": "10",
                    "worstRating": "1",
                    "ratingCount": "1"
                } : undefined,
                "trailer": movie.trailer_url ? {
                    "@type": "VideoObject",
                    "name": `${movie.title} Trailer`,
                    "description": `${movie.title} official trailer.`,
                    "thumbnailUrl": movie.poster,
                    "contentUrl": movie.trailer_url,
                    "uploadDate": movie.release_date
                } : undefined
            };

            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = 'movie-ld-schema';
            script.textContent = JSON.stringify(schema, null, 2);
            document.head.appendChild(script);
            console.log('✅ [SEO] تم إضافة مخطط JSON-LD للفيلم.');
        } else {
            console.log('✅ [SEO] تم إزالة مخطط JSON-LD.');
        }
    }


    function showHomePage() {
        console.log('🏠 [توجيه] العودة إلى الصفحة الرئيسية.');
        
        // ** تم حذف إظهار heroSection **
        if (movieGridSection) movieGridSection.style.display = 'block';
        if (movieDetailsSection) movieDetailsSection.style.display = 'none';
        if (suggestedMoviesSection) suggestedMoviesSection.style.display = 'none';

        if (videoJsPlayerInstance) {
            console.log('[Video.js] التخلص من مثيل المشغل عند العودة للصفحة الرئيسية.');
            videoJsPlayerInstance.pause();
            videoJsPlayerInstance.dispose();
            videoJsPlayerInstance = null;
        }

        if (videoContainer) {
            videoContainer.innerHTML = '';
        }
        
        history.pushState({ view: 'home' }, 'الصفحة الرئيسية', window.location.origin);
        updateMetaTags();
        addJsonLdSchema();
        performSearch(); // يعرض الأفلام بترتيب عشوائي
    }

    function displaySuggestedMovies(currentMovieId) {
        if (!suggestedMovieGrid) {
            console.error('❌ [اقتراحات] العنصر suggested-movie-grid غير موجود.');
            return;
        }

        const currentMovie = moviesData.find(m => m.id === currentMovieId);
        if (!currentMovie || !currentMovie.genre) {
            suggestedMovieGrid.innerHTML = '<p style="text-align: center; color: var(--text-muted);">لا توجد اقتراحات حاليًا.</p>';
            console.log('✨ [اقتراحات] لا يمكن إيجاد فيلم حالي أو لا يوجد له نوع.');
            return;
        }

        let genres = Array.isArray(currentMovie.genre) ? currentMovie.genre : [currentMovie.genre];
        
        const suggested = moviesData.filter(movie =>
            movie.id !== currentMovieId &&
            genres.some(g => (Array.isArray(movie.genre) ? movie.genre.includes(g) : movie.genre === g))
        ).sort(() => 0.5 - Math.random()).slice(0, 6);

        if (suggested.length > 0) {
            console.log(`✨ [اقتراحات] تم العثور على ${suggested.length} اقتراحًا بناءً على النوع.`);
            displayMovies(suggested, suggestedMovieGrid);
        } else {
            suggestedMovieGrid.innerHTML = '<p style="text-align: center; color: var(--text-muted);">لا توجد اقتراحات حاليًا.</p>';
            console.log('✨ [اقتراحات] لم يتم العثور على اقتراحات بناءً على النوع.');
        }
    }

    function handleNavigation(event) {
        event.preventDefault();
        const href = event.currentTarget.getAttribute('href');
        const url = new URL(href, window.location.origin);
        const view = url.searchParams.get('view');
        const id = url.searchParams.get('id');

        if (view === 'details' && id) {
            showMovieDetails(parseInt(id));
        } else {
            showHomePage();
        }

        // إخفاء قائمة التنقل للموبايل
        if (mainNav && mainNav.classList.contains('show')) {
            mainNav.classList.remove('show');
            if (menuToggle) menuToggle.checked = false;
        }
    }

    function handleInitialPageLoad() {
        const urlParams = new URLSearchParams(window.location.search);
        const view = urlParams.get('view');
        const id = urlParams.get('id');

        if (view === 'details' && id) {
            showMovieDetails(parseInt(id));
        } else {
            showHomePage();
        }
    }

    // --- 4. Event Listeners ---
    if (menuToggle) {
        menuToggle.addEventListener('change', () => {
            if (mainNav) mainNav.classList.toggle('show', menuToggle.checked);
        });
    }

    // ** تم حذف `watchNowBtn` بالكامل **

    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    if (homeNavLink) homeNavLink.addEventListener('click', handleNavigation);
    if (homeLogoLink) homeLogoLink.addEventListener('click', handleNavigation);
    if (backToHomeBtn) backToHomeBtn.addEventListener('click', showHomePage);

    if (prevPageBtn) prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            paginateMovies(moviesDataForPagination, currentPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    if (nextPageBtn) nextPageBtn.addEventListener('click', () => {
        if (currentPage * moviesPerPage < moviesDataForPagination.length) {
            currentPage++;
            paginateMovies(moviesDataForPagination, currentPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    if (searchButton) {
        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            performSearch();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }
    
    if (videoOverlay) {
        videoOverlay.addEventListener('click', () => {
            console.log('[Video Overlay] تم النقر على الغطاء.');
            if (videoJsPlayerInstance && videoJsPlayerInstance.paused()) {
                console.log('[Video Overlay] محاولة تشغيل الفيديو.');
                openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION, 'videoOverlay');
                videoJsPlayerInstance.play();
            } else if (!videoJsPlayerInstance || videoJsPlayerInstance.ended()) {
                console.log('[Video Overlay] المشغل غير جاهز أو انتهى، محاولة إعادة التحميل.');
                openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION, 'videoOverlay');
                showMovieDetails(currentDetailedMovie.id);
            }
        });
    }

    if (movieDetailsPoster) {
        movieDetailsPoster.addEventListener('click', () => {
            openAdLink(DIRECT_LINK_COOLDOWN_MOVIE_CARD, 'movieDetailsPoster');
            console.log('[Movie Details Poster] تم النقر على البوستر.');
        });
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.view === 'details') {
            showMovieDetails(e.state.id);
        } else {
            showHomePage();
        }
    });

    function initialPageLoadLogic() {
        console.log('✅ [تحميل أولي] منطق التحميل الأولي قيد التنفيذ.');
        handleInitialPageLoad();
    }

    // Start fetching movies data
    fetchMoviesData();

});
