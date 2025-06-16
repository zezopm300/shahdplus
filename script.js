document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOM Content Loaded. Script execution started.');

    // --- 1. DOM Element References ---
    // Make sure these IDs match your HTML exactly.
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.main-nav ul li a');
    const heroSection = document.getElementById('hero-section');
    const watchNowBtn = document.getElementById('watch-now-btn');
    const movieGridSection = document.getElementById('movie-grid-section');
    const movieDetailsSection = document.getElementById('movie-details-section');
    const movieGrid = document.getElementById('movie-grid');
    const suggestedMovieGrid = document.getElementById('suggested-movie-grid'); // ✨ هذا هو العنصر المهم للأفلام المقترحة
    const suggestedMoviesSection = document.getElementById('suggested-movies-section'); // القسم الأب للأفلام المقترحة
    const backToHomeBtn = document.getElementById('back-to-home-btn');
    const moviePlayer = document.getElementById('movie-player');
    const videoOverlay = document.getElementById('video-overlay');
    const homeLogoLink = document.getElementById('home-logo-link');
    const videoOverlayText = document.getElementById('video-overlay-text');

    // --- 1.1. Critical DOM Element Verification ---
    const requiredElements = {
        '#movie-grid': movieGrid,
        '#movie-grid-section': movieGridSection,
        '#movie-details-section': movieDetailsSection,
        '#hero-section': heroSection,
        '#movie-player': moviePlayer,
        '#video-overlay': videoOverlay,
        '#suggested-movie-grid': suggestedMovieGrid,
        '#suggested-movies-section': suggestedMoviesSection, // تأكيد وجود القسم الأب
        '#video-overlay-text': videoOverlayText
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
        // We'll still try to proceed, but expect issues.
    } else {
        console.log('✅ All critical DOM elements found.');
    }

    // Pagination elements
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const moviesPerPage = 8;
    let currentPage = 1;

    // --- 2. Adsterra Configuration ---
    // هذا هو رابط الـ Direct Link الرئيسي الذي سيتم استخدامه لفتح النوافذ المنبثقة
    const ADSTERRA_DIRECT_LINK_URL = 'https://www.profitableratecpm.com/spqbhmyax?key=2469b039d4e7c471764bd04c57824cf2';
    
    // زمن آخر ضغطة على Direct Link لأي عنصر (بوستر أو فيديو)
    let lastDirectLinkClickTime = 0;
    // فترة التهدئة للضغط على بوستر الفيلم (3 دقائق)
    const DIRECT_LINK_COOLDOWN_MOVIE_CARD = 3 * 60 * 1000; 
    // فترة التهدئة للضغط على غطاء الفيديو (4 دقائق)
    const DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY = 4 * 60 * 1000; 

    // متغير لتخزين مؤقت إخفاء الفيديو أوفرلاي
    let videoOverlayHideTimer = null;

    // --- 3. Movie Data (IMPORTANT: Replace with your actual movie data!) ---
    // تأكد من أن الـ embed_url هي روابط صالحة للفيديوهات المضمنة (YouTube embed links are good examples).
    const moviesData = [
         {
            "id": 1,
            "title": "فيلم Purity Falls 2019",
            "description": " القصّة : بعد مرور عام على فقدان زوجها، تستقر نيكول مع أبنائها الصغار جاستين وجيسون في بيوريتي فولز. في البداية، يتم الترحيب بالعائلة بحفاوة. وخاصة جارتهم الغنية كورتني التي تبدو لطيفة للغاية، حيث توفر لجيسون بسرعة وظائف غريبة لدعم دخل الأسرة. ومع ذلك، سرعان ما تلاحظ نيكول أن هناك شيئًا ما ليس على ما يرام، حيث يغادر ابنها ويعود في ساعات متأخرة بشكل مريب. عندما تغرق جارتها الشابة في حمام السباحة، تبدأ الأمور في أن تصبح خطيرة. هناك شيء غير صحيح مع كورتني الودودة للغاية، والتي يبدو أنها تسيطر على ابنها.",
            "poster": "https://tinyurl.com/mrynn3au",
            "year": "2019",
            "category": "رومنسي , إثارة جنسية ساخنة/تشويق / للبالغين فقط +18",
            "director": "Trevor Stines",
            "stars": ["Kristanna Loken"],
            "embed_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", // مثال لرابط YouTube صالح
            "rating": "6.2"
        },
        {
            "id": 2,
            "title": "A Nice Girl Like You 2020",
            "description": "القصّة : لوسي نيل عازفة كمان، تكتشف إدمان صديقها جيف لمشاهدة المواد الإباحية، فتتشاجر معه، وينفصلا، وتصاب بصدمة عصبية، وتقرر على هذا الاساس تعزيز نفسيها، واكتشاف ذاتها خاصة بعد علاقة الصداقة التي تنشأ بينها وبين جرانت، حيث يساعدها على التغلب على مشاكلها السابقة مع صديقها جيف",
            "poster": "https://i.ibb.co/k2jg6TSd/photo-5852675531542218174-y.jpg",
            "year": "2020",
            "category": "رومنسي , إثارة جنسية ساخنة/تشويق / للبالغين فقط ",
            "director": "Chris Riedell",
            "stars": ["Lucy Hale"],
            "embed_url": "https://player.vimeo.com/video/1091276533", // هذا رابط Vimeo جيد ويعمل عادة
            "rating": "5.5"
        },
        {
            "id": 3,
            "title": "Sleeping with the Enemy 1991",
            "description": " تزوجت (لورا) منذ أربع سنوات بالرجل الوسيم (مارتن). يبدو زواجهما مثاليًا في أعين الجميع، ولكن الحقيقة تختلف تمامًا عن هذه الصورة. يعامل مارتن المتسلط لورا بعنف ووحشية ويعتدي عليها، لتصل الزوجة لنقطة تستعد فيها لفعل أي شيء مقابل التخلص من حياتها البائسة. تضع لورا خطة النجاة، والتي تتلخص في قيامها بادعاء الوفاة، وتلفيق كل شيء؛ بحيث تنطلي الخدعة على مارتن. يسير كل شيء حسب الخطة، وتبدأ لورا في العيش بسعادة بهويتها الجديدة، ولكن السعادة لا تدوم طويلًا بعدما تتطور الأحداث بغتة.",
            "poster": "https://i.ibb.co/d4Jmp73r/photo-5852675531542218154-y.jpg",
            "year": "1991",
            "category": "رومنسي , إثارة جنسية ساخنة/تشويق / للبالغين فقط ",
            "director": "Joseph Ruben",
            "stars": ["Julia Roberts"],
            "embed_url": "https://vide0.net/e/smo8970rj5gh", // هذا الرابط سيسبب مشاكل - يجب استبداله!
            "rating": "6.3"
        },
        {
            "id": 7,
            "title": "اغنيه العيد ",
            "description": "اغانيه رومانسيه ",
            "poster": "https://zaaednews.com/wp-content/uploads/2024/09/%D8%AD%D9%81%D9%84-%D8%A3%D9%86%D8%BA%D8%A7%D9%85-%D9%84%D9%8A%D8%A7%D9%84%D9%8A-%D9%85%D8%B5%D8%B1-%D9%81%D9%8A-%D8%A7%D9%84%D9%85%D8%AA%D8%AD%D9%81-%D8%A7%D9%84%D9%85%D8%B5%D8%B1%D9%8A-%D8%A7%D9%84%D9%83%D8%A8%D9%8A%D8%B1.jpg0_.jpg",
            "year": "2024",
            "category": "رومانسي",
            "director": "انغام",
            "stars": ["ممثل 1", "ممثل 2"],
            "embed_url": "https://www.youtube.com/embed/YOUR_YOUTUBE_VIDEO_ID_HERE" // مثال على رابط YouTube
        },
        {
            "id": 4,
            "title": "Moms Friends 2024",
            "description": " القصّة : فيلم رومانسي جديد حول الرغبات الجنسية والعلاقات الحميمة الساخنة بين الشباب والعلاقات الجنسية التي يمارسونها",
            "poster": "https://i.postimg.cc/dtHdLMNL/photo-5838945848241800438-y.jpg",
            "year": "2024",
            "category": "رومنسي , إثارة جنسية ساخنة/تشويق / للبالغين فقط ",
            "director": "Yoo Je‑won.",
            "stars": ["Choi Seung‑hyo"],
            "embed_url": "https://streamtape.com/e/7kbx78RR8VtAXD1/", // هذا الرابط سيسبب مشاكل - يجب استبداله!
            "rating": "7.0"
        },
        {
            "id": 5,
            "title": "Blood Pay 2025",
            "description": "فيلم إثارة خيال علمي تدور أحداثه في الجنة، وهي مدينة خيالية يسيطر فيها الذكاء الاصطناعي على القوى العاملة ويقود العزلة الاجتماعية.",
            "poster": "https://i.ibb.co/v6d90zjN/photo-5789391950099630510-w.jpg",
            "year": "2025",
            "category": "رعب / خيال علمي☯️ .. ",
            "director": "Brace Beltempo.",
            "stars": ["Gianluca Busani"],
            "embed_url": "https://streamtape.com/e/7b7rqXvk7DT8Ap/", // هذا الرابط سيسبب مشاكل - يجب استبداله!
            "rating": "7.5"
        },
        {
            "id": 6,
            "title": "Twisters",
            "description": "القصة: مع اشتداد موسم العواصف، تتصادم مسارات مطارد العواصف السابق كيت كوبر ونجم وسائل التواصل الاجتماعي المتهور تايلر أوينز عندما يتم إطلاق العنان لظواهر مرعبة لم يسبق لها مثيل. يجد الزوجان وفرقهما المتنافسة أنفسهم مباشرة في مسارات أنظمة العواصف المتعددة المتقاربة فوق وسط أوكلاهوما في معركة حياتهم.",
            "poster": "https://i.ibb.co/Zp7BnYS3/Untitled.jpg",
            "year": "2024",
            "category": "اثارة/ اكشن ☯️ .. ",
            "director": "Lee Isaac Chung",
            "stars": ["Daisy Edgar-Jones"],
            "embed_url": "https://streamtape.com/e/KXbbjrOM6Lc080L/", // هذا الرابط سيسبب مشاكل - يجب استبداله!
            "rating": "7.8"
        },
    ];


    // --- 4. Functions ---

    function openAdLink(cooldownDuration) {
        const currentTime = Date.now();
        if (currentTime - lastDirectLinkClickTime > cooldownDuration) {
            const newWindow = window.open(ADSTERRA_DIRECT_LINK_URL, '_blank');
            if (newWindow) {
                newWindow.focus();
                lastDirectLinkClickTime = currentTime;
                console.log('💰 [Ad Click] Direct Link opened successfully.');
            } else {
                console.warn('⚠️ [Ad Click] Pop-up blocked or failed to open direct link. Ensure pop-ups are allowed.');
            }
        } else {
            console.log('⏳ [Ad Click] Direct Link cooldown active. Not opening new tab.');
        }
    }

    function updateMetaTags(title, description, imageUrl, url) {
        document.title = title;
        document.querySelector('meta[name="description"]').setAttribute('content', description);
        document.querySelector('meta[property="og:title"]').setAttribute('content', title);
        document.querySelector('meta[property="og:description"]').setAttribute('content', description);
        document.querySelector('meta[property="og:image"]').setAttribute('content', imageUrl);
        document.querySelector('meta[property="og:url"]').setAttribute('content', url);

        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute('href', url);
        console.log(`[SEO] Meta tags updated for: ${title}`);
    }

    function addJsonLdSchema(movie) {
        const existingSchema = document.getElementById('movie-schema');
        if (existingSchema) {
            existingSchema.remove();
        }

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'movie-schema';
        script.innerHTML = JSON.stringify({
            "@context": "http://schema.org",
            "@type": "Movie",
            "name": movie.title,
            "description": movie.description,
            "image": movie.poster,
            "director": {
                "@type": "Person",
                "name": movie.director
            },
            "actor": movie.stars.split(', ').map(star => ({
                "@type": "Person",
                "name": star
            })),
            "datePublished": movie.year + "-01-01",
            "genre": movie.category.split(', ').map(g => g.trim()),
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": movie.rating,
                "ratingCount": "1000"
            },
            "video": {
                "@type": "VideoObject",
                "name": movie.title + " Trailer", // Or actual video title
                "description": "Official trailer for " + movie.title,
                "thumbnailUrl": movie.poster,
                "embedUrl": movie.embed_url,
                "uploadDate": movie.year + "-01-01"
            }
        });
        document.head.appendChild(script);
        console.log(`[SEO] JSON-LD schema added for: ${movie.title}`);
    }

    function displayMovies(moviesToDisplay, containerElement) {
        console.log(`🎬 [Display] Attempting to display ${moviesToDisplay.length} movies in #${containerElement ? containerElement.id : 'N/A'}`);

        if (!containerElement) {
            console.error(`❌ [Display] Container element is null or undefined. Cannot display movies.`);
            return;
        }

        containerElement.style.display = 'grid'; 
        console.log(`[Display] Container #${containerElement.id} display set to 'grid'.`);

        containerElement.innerHTML = ''; // Clear existing content

        if (!moviesToDisplay || moviesToDisplay.length === 0) {
            containerElement.innerHTML = '<p style="text-align: center; font-size: 1.2rem; color: var(--text-muted);">لا توجد أفلام لعرضها في هذا القسم.</p>';
            console.warn(`[Display] No movies to display or moviesToDisplay is empty for #${containerElement.id}.`);
            return;
        }

        moviesToDisplay.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.setAttribute('role', 'listitem');
            movieCard.tabIndex = 0; // Make it focusable
            movieCard.setAttribute('aria-label', `فيلم ${movie.title}`);

            movieCard.innerHTML = `
                <img src="${movie.poster}" alt="بوستر فيلم ${movie.title}" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/260x380?text=Image+Not+Found';">
                <h3>${movie.title}</h3>
            `;
            movieCard.addEventListener('click', () => {
                console.log(`👆 [Click] Movie card clicked for ID: ${movie.id}`);
                openAdLink(DIRECT_LINK_COOLDOWN_MOVIE_CARD); // Open ad when movie card is clicked
                showMovieDetails(movie.id); // Always show movie details after potential ad click
            });
            containerElement.appendChild(movieCard);
        });
        console.log(`✅ [Display] Successfully displayed ${moviesToDisplay.length} movies in #${containerElement.id}.`);
    }

    function paginateMovies() {
        console.log(`➡️ [Pagination] Paginating movies. Current page: ${currentPage}`);
        const startIndex = (currentPage - 1) * moviesPerPage;
        const endIndex = startIndex + moviesPerPage;
        const moviesOnPage = moviesData.slice(startIndex, endIndex);

        displayMovies(moviesOnPage, movieGrid); // Display movies on the main grid

        // Update pagination button states
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = endIndex >= moviesData.length;
        console.log(`[Pagination] Prev disabled: ${prevPageBtn ? prevPageBtn.disabled : 'N/A'}, Next disabled: ${nextPageBtn ? nextPageBtn.disabled : 'N/A'}`);
    }

    function showMovieDetails(movieId) {
        console.log(`🔍 [Routing] Showing movie details for ID: ${movieId}`);
        const movie = moviesData.find(m => m.id === movieId);

        if (movie) {
            // Hide main sections
            heroSection.style.display = 'none';
            movieGridSection.style.display = 'none';
            // Show movie details section
            movieDetailsSection.style.display = 'block';

            // Scroll to the top of the page for better UX
            window.scrollTo({ top: 0, behavior: 'smooth' });
            console.log('[Routing] Page scrolled to top.');

            // Populate movie details
            document.getElementById('details-movie-title').textContent = movie.title;
            document.getElementById('details-movie-description').textContent = movie.description;
            document.getElementById('details-movie-director').textContent = movie.director;
            document.getElementById('details-movie-stars').textContent = movie.stars;
            document.getElementById('details-movie-genre').textContent = movie.category;
            document.getElementById('details-movie-year').textContent = movie.year;
            document.getElementById('details-movie-rating').textContent = movie.rating;

            // Set the video player source
            moviePlayer.src = ''; // Reset the iframe src to clear any previous "Video unavailable" message before setting new src
            setTimeout(() => { // Small delay to ensure the reset takes effect
                moviePlayer.src = movie.embed_url;
                console.log(`[Video Player] Final iframe src set to: ${movie.embed_url}`);
            }, 50);

            // Handle video overlay for ads
            if (videoOverlay) {
                videoOverlay.classList.remove('hidden'); // Show overlay initially
                // Clear any existing timer
                if (videoOverlayHideTimer) {
                    clearTimeout(videoOverlayHideTimer);
                }
                // Set timer to re-show overlay after 4 minutes if not clicked
                videoOverlayHideTimer = setTimeout(() => {
                    if (videoOverlay.classList.contains('hidden')) { // Only re-show if it was hidden
                        videoOverlay.classList.remove('hidden');
                        if (videoOverlayText) videoOverlayText.style.display = 'block';
                        console.log('[Video Overlay] Re-shown automatically after 4 minutes.');
                    }
                }, DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY);
                
                // Ensure text is visible when overlay is present
                if (videoOverlayText) {
                    videoOverlayText.style.display = 'block'; 
                    console.log('[Video Overlay Text] Shown.');
                }
                console.log('[Video Overlay] Overlay shown and timer set.');
            }

            // Update URL and SEO meta tags
            const currentUrl = window.location.origin + window.location.pathname + `?movie=${movie.id}`;
            updateMetaTags(
                `${movie.title} - شاهد بلس`,
                movie.description.substring(0, 150) + '...', // Truncate description for meta tag
                movie.poster,
                currentUrl
            );
            addJsonLdSchema(movie); // Add structured data

            // --- Suggested Movies Logic ---
            console.log(`💡 [Suggested Movies Logic] Starting for current movie ID: ${movieId}`);
            let filteredSuggested = moviesData.filter(m => m.id !== movieId);
            console.log(`[Suggested Movies Logic] Total movies in data: ${moviesData.length}`);
            console.log(`[Suggested Movies Logic] Filtered movies (excluding current ID ${movieId}): ${filteredSuggested.length} movies available.`);

            let suggestedMoviesToDisplay = [];

            if (filteredSuggested.length >= 4) {
                // Shuffle and slice to get 4 random suggested movies from filtered list
                suggestedMoviesToDisplay = filteredSuggested.sort(() => 0.5 - Math.random()).slice(0, 4);
                console.log(`[Suggested Movies Logic] Sufficient unique movies (${suggestedMoviesToDisplay.length}), shuffled and sliced.`);
            } else if (moviesData.length > 0) {
                // Fallback: If not enough unique movies after filtering
                console.warn(`[Suggested Movies Logic] Not enough unique suggested movies (${filteredSuggested.length}). Attempting fallback.`);

                // Try to get unique movies from the beginning of moviesData, excluding current one
                let tempSuggested = [];
                for (let i = 0; i < moviesData.length && tempSuggested.length < 4; i++) {
                    if (moviesData[i].id !== movieId) {
                        tempSuggested.push(moviesData[i]);
                    }
                }
                suggestedMoviesToDisplay = tempSuggested;

                // If still less than 4, and we have more total movies, just fill up with any other movies
                if (suggestedMoviesToDisplay.length < 4 && moviesData.length > suggestedMoviesToDisplay.length) {
                    const remainingNeeded = 4 - suggestedMoviesToDisplay.length;
                    const existingSuggestedIds = new Set(suggestedMoviesToDisplay.map(m => m.id));
                    const additionalMovies = moviesData.filter(m => !existingSuggestedIds.has(m.id)).slice(0, remainingNeeded);
                    suggestedMoviesToDisplay = suggestedMoviesToDisplay.concat(additionalMovies);
                    console.log(`[Suggested Movies Logic] Filled up with ${additionalMovies.length} additional movies.`);
                }
                console.log(`[Suggested Movies Logic] Fallback suggested movies to display: ${suggestedMoviesToDisplay.length}`);

            } else {
                console.error('❌ [Suggested Movies Logic] No movies available in moviesData for suggestions at all.');
            }

            if (suggestedMovieGrid) {
                if (suggestedMoviesToDisplay.length > 0) {
                    // Make sure the parent section for suggested movies is visible
                    if (suggestedMoviesSection) {
                        suggestedMoviesSection.style.display = 'block'; 
                        console.log('[Suggested Movies Section] Parent section displayed.');
                    }
                    displayMovies(suggestedMoviesToDisplay, suggestedMovieGrid);
                    console.log('✅ [Display] Suggested movies display function called with movies.');
                } else {
                    suggestedMovieGrid.innerHTML = '<p style="text-align: center; font-size: 1rem; color: var(--text-muted);">لا توجد اقتراحات حاليًا.</p>';
                    console.warn('[Display] No suggested movies to display after all attempts. Showing message.');
                    // Hide the suggested section entirely if there are no suggestions
                    if (suggestedMoviesSection) {
                        suggestedMoviesSection.style.display = 'none';
                        console.log('[Suggested Movies Section] Hidden as no suggestions.');
                    }
                }
            } else {
                console.error('❌ CRITICAL ERROR: suggestedMovieGrid element not found. Cannot display suggested movies.');
            }
            // --- End of Suggested Movies Logic ---

            // Update URL in browser history (without full reload)
            window.history.pushState({ movieId: movieId }, movie.title, currentUrl);

        } else {
            console.error('❌ [Routing] Movie not found for ID:', movieId, 'Redirecting to home page.');
            showHomePage(); // Fallback to home if movie ID is invalid
        }
    }

    function showHomePage() {
        console.log('🏠 [Routing] Showing home page.');
        // Hide movie details section
        movieDetailsSection.style.display = 'none';
        // Show main sections
        heroSection.style.display = 'flex'; // Assuming hero is flex
        movieGridSection.style.display = 'block';

        paginateMovies(); // Re-display paginated movies on home

        // Clear any active video overlay timer and ensure text is visible
        if (videoOverlayHideTimer) {
            clearTimeout(videoOverlayHideTimer);
            videoOverlayHideTimer = null;
            console.log('[Video Overlay] Video overlay timer cleared.');
        }
        if (videoOverlay) {
             videoOverlay.classList.remove('hidden'); // Ensure overlay is visible when returning home
        }
        if (videoOverlayText) {
            videoOverlayText.style.display = 'block'; // Ensure text is visible
            console.log('[Video Overlay Text] Display reset to home (block).');
        }

        // Hide suggested movies section when going back to home
        if (suggestedMoviesSection) {
            suggestedMoviesSection.style.display = 'none';
            console.log('[Suggested Movies Section] Hidden on home page.');
        }

        // Reset SEO meta tags to home page defaults
        updateMetaTags(
            "شاهد بلس - أفلام ومسلسلات عربية وعالمية",
            "شاهد أحدث الأفلام والمسلسلات العربية والعالمية بجودة عالية. استمتع بتجربة مشاهدة فريدة مع شاهد بلس.",
            "https://images.unsplash.com/photo-1542204165-f938d2279b33?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGufDB8fHx8fA%3D%3D",
            window.location.origin + window.location.pathname
        );
        // Remove movie-specific schema
        const existingSchema = document.getElementById('movie-schema');
        if (existingSchema) { existingSchema.remove(); }

        // Update URL in browser history (without full reload)
        window.history.pushState({}, document.title, window.location.origin + window.location.pathname);
    }

    // New event listener for video overlay to trigger ad and hide itself
    function handleVideoOverlayClick() {
        console.log('⏯️ [Ad Click] Video overlay clicked. Attempting to open Direct Link.');
        openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY); // Use video specific cooldown
        videoOverlay.classList.add('hidden'); // Hide overlay
        if (videoOverlayText) videoOverlayText.style.display = 'none'; // Hide text
        console.log('[Video Overlay] Hidden after click.');

        // Re-set timer to show overlay again after cooldown
        if (videoOverlayHideTimer) {
            clearTimeout(videoOverlayHideTimer);
        }
        videoOverlayHideTimer = setTimeout(() => {
            videoOverlay.classList.remove('hidden');
            if (videoOverlayText) videoOverlayText.style.display = 'block';
            console.log('[Video Overlay] Re-shown automatically after 4 minutes due to timer.');
        }, DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY);
    }
    
    // Initial attachment of the event listener for video overlay
    if (videoOverlay) {
        videoOverlay.addEventListener('click', handleVideoOverlayClick);
        console.log('[Video Overlay] Initial click listener attached.');
    }


    // --- 5. Event Listeners ---

    // Toggle mobile navigation
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('nav-open');
            console.log(`☰ [Nav] Mobile menu toggled. State: ${mainNav.classList.contains('nav-open') ? 'Open' : 'Closed'}`);
        });
    } else {
        console.warn('⚠️ [Init] menuToggle or mainNav not found. Mobile navigation may not function.');
    }

    // Hide mobile nav when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav && mainNav.classList.contains('nav-open')) {
                mainNav.classList.remove('nav-open');
                console.log('🔗 [Nav] Nav link clicked, mobile menu closed.');
            }
        });
    });

    // Hero section "Watch Now" button
    if (watchNowBtn) {
        watchNowBtn.addEventListener('click', (event) => {
            event.preventDefault();
            console.log('▶️ [Click] Watch Now button clicked.');
            document.getElementById('movie-grid-section').scrollIntoView({ behavior: 'smooth' });
        });
    } else {
        console.warn('⚠️ [Init] watchNowBtn not found.');
    }

    // Back to Home button on movie details page
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', showHomePage);
        console.log('↩️ [Init] Back to Home button listener attached.');
    } else {
        console.warn('⚠️ [Init] backToHomeBtn not found.');
    }

    // Pagination buttons
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                paginateMovies();
                window.scrollTo({ top: movieGridSection.offsetTop, behavior: 'smooth' }); // Scroll to movie grid
                console.log(`◀️ [Pagination] Moved to page: ${currentPage}`);
            }
        });
    }
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(moviesData.length / moviesPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                paginateMovies();
                window.scrollTo({ top: movieGridSection.offsetTop, behavior: 'smooth' }); // Scroll to movie grid
                console.log(`▶️ [Pagination] Moved to page: ${currentPage}`);
            }
        });
    }

    // Home logo click
    if (homeLogoLink) {
        homeLogoLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            showHomePage(); // Go to home page function
            console.log('🏠 [Click] Home logo clicked.');
        });
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
        console.log('🔄 [History] Popstate event triggered.', event.state);
        if (event.state && event.state.movieId) {
            showMovieDetails(event.state.movieId);
        } else {
            showHomePage();
        }
    });

    // --- 6. Initial Page Load ---
    // Check URL for specific movie ID on initial load
    const urlParams = new URLSearchParams(window.location.search);
    const movieIdFromUrl = urlParams.get('movie');

    if (movieIdFromUrl) {
        console.log(`🚀 [Init] Found movie ID in URL: ${movieIdFromUrl}. Loading details...`);
        showMovieDetails(parseInt(movieIdFromUrl));
    } else {
        console.log('🚀 [Init] No movie ID in URL. Loading home page...');
        showHomePage(); // Display initial set of movies
    }

    console.log('✅ Script execution finished.');
});
