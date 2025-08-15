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
    const nextPageBtn = document = document.getElementById('next-page-btn');

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

    function openAdLink(cooldownDuration, type) {
        console.log(`🚫 [نقر إعلان - ${type}] تم تعطيل وظيفة فتح الإعلانات.`);
        return false;
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

    // --- تحسينات أداء تحميل الصور
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
        movieCard.querySelector('img').onerror = function() { this.src = movie.poster; };
        movieCard.addEventListener('click', () => {
            console.log(`⚡ [تفاعل] تم النقر على بطاقة الفيلم للمعّرف: ${movie.id}`);
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

        const fragment = document.createDocumentFragment();
        console.log(`🎬 [عرض] جاري عرض ${moviesToDisplay.length} فيلم في ${targetGridElement.id}.`);
        moviesToDisplay.forEach(movie => {
            fragment.appendChild(createMovieCard(movie));
        });
        targetGridElement.appendChild(fragment);
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
            hideSuggestions();
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
                filteredMovies = moviesData;
            }

            if (sectionTitleElement) {
                sectionTitleElement.textContent = `نتائج البحث عن "${query}"`;
            }
            console.log(`🔍 [بحث احترافي] تم إجراء بحث عن "${query}". تم العثور على ${filteredMovies.length} نتيجة.`);

        } else {
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

        filteredMovies.slice(0, 5).forEach(movie => {
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

            if (movieDetailsPoster) {
                movieDetailsPoster.addEventListener('click', () => {
                    // تمت إزالة openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_INTERACTION, 'movieDetailsPoster');
                });
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
                        if (videoOverlay) {
                            videoOverlay.style.pointerEvents = 'auto';
                            videoOverlay.classList.remove('hidden');
                        }
                    }
                });

                videoJsPlayerInstance.on('seeked', () => {
                    console.log('[Video.js] تم البحث في الفيديو.');
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

        if (movie) {
            pageTitle = movie.title;
            pageDescription = movie.description;
            pageKeywords = (movie.genre || []).concat(movie.cast || []).concat(movie.director || []).join(', ');
            ogUrl = window.location.href;
            ogTitle = movie.title;
            ogDescription = movie.description;
            ogImage = movie.poster;
            ogType = 'video.movie';
            ogVideoUrl = movie.embed_url;
            ogVideoType = 'video/mp4';
            twitterTitle = movie.title;
            twitterDescription = movie.description;
            twitterImage = movie.poster;
        } else {
            pageTitle = 'شاهد بلس';
            pageDescription = 'شاهد بلس: بوابتك الفاخرة للترفيه السينمائي.';
            pageKeywords = 'أفلام، مسلسلات، مشاهدة أونلاين';
            ogUrl = 'https://shahidplus.online/';
            ogTitle = 'شاهد بلس';
            ogDescription = 'شاهد بوابتك الفاخرة للترفيه السينمائي.';
            ogImage = 'https://shahidplus.online/images/your-site-logo-for-og.png';
            ogType = 'website';
            ogVideoUrl = '';
            ogVideoType = '';
            twitterTitle = 'شاهد بلس';
            twitterDescription = 'شاهد بلس: بوابتك الفاخرة للترفيه السينمائي.';
            twitterImage = 'https://shahidplus.online/images/your-site-logo-for-twitter.png';
        }

        document.title = pageTitle;
        document.querySelector('meta[name="description"]').content = pageDescription;
        document.querySelector('meta[name="keywords"]').content = pageKeywords;
        canonicalLink.href = ogUrl;
        document.querySelector('meta[property="og:url"]').content = ogUrl;
        document.querySelector('meta[property="og:title"]').content = ogTitle;
        document.querySelector('meta[property="og:description"]').content = ogDescription;
        document.querySelector('meta[property="og:image"]').content = ogImage;
        document.querySelector('meta[property="og:type"]').content = ogType;
        if (ogVideoUrl) {
            let ogVideo = document.querySelector('meta[property="og:video"]');
            if (!ogVideo) {
                ogVideo = document.createElement('meta');
                ogVideo.setAttribute('property', 'og:video');
                document.head.appendChild(ogVideo);
            }
            ogVideo.content = ogVideoUrl;
            let ogVideoTypeMeta = document.querySelector('meta[property="og:video:type"]');
            if (!ogVideoTypeMeta) {
                ogVideoTypeMeta = document.createElement('meta');
                ogVideoTypeMeta.setAttribute('property', 'og:video:type');
                document.head.appendChild(ogVideoTypeMeta);
            }
            ogVideoTypeMeta.content = ogVideoType;
        } else {
            const ogVideo = document.querySelector('meta[property="og:video"]');
            if (ogVideo) ogVideo.remove();
            const ogVideoTypeMeta = document.querySelector('meta[property="og:video:type"]');
            if (ogVideoTypeMeta) ogVideoTypeMeta.remove();
        }
        document.querySelector('meta[property="twitter:title"]').content = twitterTitle;
        document.querySelector('meta[property="twitter:description"]').content = twitterDescription;
        document.querySelector('meta[property="twitter:image"]').content = twitterImage;
        console.log('✅ [SEO] تم تحديث العلامات الوصفية بنجاح.');
    }

    function addJsonLdSchema(movie = null) {
        let oldScript = document.querySelector('script[type="application/ld+json"]');
        if (oldScript) oldScript.remove();

        let schema;
        if (movie) {
            schema = {
                "@context": "https://schema.org",
                "@type": "Movie",
                "name": movie.title,
                "description": movie.description,
                "dateCreated": movie.release_date,
                "director": {
                    "@type": "Person",
                    "name": movie.director
                },
                "actor": (movie.cast || []).map(actor => ({
                    "@type": "Person",
                    "name": actor
                })),
                "genre": movie.genre,
                "image": movie.poster,
                "url": window.location.href,
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": movie.rating,
                    "bestRating": "10",
                    "ratingCount": "1"
                }
            };
        } else {
            schema = {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "شاهد بلس",
                "url": "https://shahidplus.online/"
            };
        }

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema, null, 2);
        document.head.appendChild(script);
        console.log('✅ [SEO] تم إضافة/تحديث مخطط JSON-LD بنجاح.');
    }

    // --- 4. Suggested Movies Logic ---
    function displaySuggestedMovies(currentMovieId) {
        if (!suggestedMovieGrid) return;
        suggestedMovieGrid.innerHTML = '';
        const suggested = moviesData
            .filter(m => m.id !== currentMovieId)
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);
        displayMovies(suggested, suggestedMovieGrid);
        console.log(`✨ [اقتراحات] تم عرض ${suggested.length} فيلمًا مقترحًا.`);
    }

    // --- 5. Navigation & State Management ---
    function showHomePage() {
        if (heroSection) heroSection.style.display = 'block';
        if (movieGridSection) movieGridSection.style.display = 'block';
        if (movieDetailsSection) movieDetailsSection.style.display = 'none';
        if (suggestedMoviesSection) suggestedMoviesSection.style.display = 'none';
        if (sectionTitleElement) sectionTitleElement.textContent = 'أحدث الأفلام';

        if (videoJsPlayerInstance) {
            videoJsPlayerInstance.dispose();
            videoJsPlayerInstance = null;
            if (videoContainer) {
                videoContainer.innerHTML = '';
            }
            console.log('[Video.js] تم التخلص من المشغل عند العودة للصفحة الرئيسية.');
        }

        currentPage = 1;
        moviesDataForPagination = [...moviesData].sort(() => 0.5 - Math.random());
        paginateMovies(moviesDataForPagination, currentPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const newUrl = new URL(window.location.origin);
        history.pushState({ view: 'home' }, 'شاهد بلس', newUrl.toString());

        updateMetaTags(null);
        addJsonLdSchema(null);

        console.log('🏠 [توجيه] تم عرض الصفحة الرئيسية.');
    }

    function handleNavigation(state) {
        if (!state) {
            showHomePage();
            return;
        }
        if (state.view === 'details' && state.id) {
            showMovieDetails(state.id);
        } else {
            showHomePage();
        }
    }

    // --- 6. Event Listeners ---
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    if (watchNowBtn) {
        watchNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = document.getElementById('movie-grid-section');
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
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

    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', showHomePage);
    }

    if (videoOverlay) {
        videoOverlay.addEventListener('click', (e) => {
            console.log('🎬 [مشغل الفيديو] تم النقر على الطبقة الشفافة.');
            if (videoJsPlayerInstance) {
                videoJsPlayerInstance.play();
                videoOverlay.classList.add('hidden');
                videoOverlay.style.pointerEvents = 'none';
            }
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        // استخدام Debounce لتحسين الأداء
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const query = searchInput.value.toLowerCase().trim();
                if (query.length > 1) {
                    const suggestions = moviesData.filter(movie => movie.title.toLowerCase().includes(query) || (Array.isArray(movie.cast) && movie.cast.some(actor => actor.toLowerCase().includes(query))));
                    showSuggestions(suggestions);
                } else {
                    hideSuggestions();
                }
            }, 300); // تأخير 300 مللي ثانية
        });
        document.addEventListener('click', (e) => {
            if (searchContainer && !searchContainer.contains(e.target)) {
                hideSuggestions();
            }
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
            if (currentPage * moviesPerPage < moviesDataForPagination.length) {
                currentPage++;
                paginateMovies(moviesDataForPagination, currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    window.addEventListener('popstate', (event) => {
        handleNavigation(event.state);
    });

    // --- 7. Initial Load ---
    function initialPageLoadLogic() {
        const urlParams = new URLSearchParams(window.location.search);
        const view = urlParams.get('view');
        const id = urlParams.get('id');
        if (view === 'details' && id) {
            handleNavigation({ view: 'details', id: parseInt(id) });
        } else {
            showHomePage();
        }
    }

    // --- 8. Lazy Loading of Images ---
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.1
    };

    const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                    img.classList.remove('lazy-img');
                    observer.unobserve(img);
                }
            }
        });
    }, observerOptions);

    function observeLazyImages() {
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            const src = img.src;
            if (src) {
                img.setAttribute('data-src', src);
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"%3E%3C/svg%3E';
                img.classList.add('lazy-img');
                lazyLoadObserver.observe(img);
            }
        });
    }
    
    // --- Initial fetch and load ---
    fetchMoviesData().then(() => {
        // Run after movies data is loaded and displayed for the first time
        observeLazyImages();
    });
});
