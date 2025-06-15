document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Element References
    const movieGrid = document.querySelector('.movie-grid');
    const movieDetailsSection = document.getElementById('movie-details');
    const heroSection = document.getElementById('hero-section');
    const moviesListSection = document.getElementById('movies-list');
    const backBtn = document.getElementById('back-to-home');
    const heroBtn = document.getElementById('hero-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.main-nav .nav-link'); // Added to manage active state

    // الرابط المباشر بتاع Adsterra اللي انت بعته
    const adsterraDirectLink = 'https://www.profitableratecpm.com/spqbhmyax?key=2469b039d4e7c471764bd04c57824cf2';

    // Store original meta and title for home page (SEO Improvement)
    const originalTitle = document.title;
    const originalDescriptionMeta = document.querySelector('meta[name="description"]');
    const originalDescription = originalDescriptionMeta ? originalDescriptionMeta.content : '';
    const originalOgTitleMeta = document.querySelector('meta[property="og:title"]');
    const originalOgTitle = originalOgTitleMeta ? originalOgTitleMeta.content : '';
    const originalOgDescriptionMeta = document.querySelector('meta[property="og:description"]');
    const originalOgDescription = originalOgDescriptionMeta ? originalOgDescriptionMeta.content : '';
    const originalOgImageMeta = document.querySelector('meta[property="og:image"]');
    const originalOgImage = originalOgImageMeta ? originalOgImageMeta.content : '';
    const originalOgUrlMeta = document.querySelector('meta[property="og:url"]');
    const originalOgUrl = originalOgUrlMeta ? originalOgUrlMeta.content : window.location.href;


    let moviesData = [
        {
            "id": 1,
            "title": "فيلم Purity Falls 2019",
            "description": " القصّة : بعد مرور عام على فقدان زوجها، تستقر نيكول مع أبنائها الصغار جاستين وجيسون في بيوريتي فولز. في البداية، يتم الترحيب بالعائلة بحفاوة. وخاصة جارتهم الغنية كورتني التي تبدو لطيفة للغاية، حيث توفر لجيسون بسرعة وظائف غريبة لدعم دخل الأسرة. ومع ذلك، سرعان ما تلاحظ نيكول أن هناك شيئًا ما ليس على ما يرام، حيث يغادر ابنها ويعود في ساعات متأخرة بشكل مريب. عندما تغرق جارتها الشابة في حمام السباحة، تبدأ الأمور في أن تصبح خطيرة. هناك شيء غير صحيح مع كورتني الودودة للغاية، والتي يبدو أنها تسيطر على ابنها.",
            "poster": "https://tinyurl.com/mrynn3au",
            "year": "2019",
            "category": "رومنسي , إثارة جنسية ساخنة/تشويق / للبالغين فقط +18",
            "director": "Trevor Stines",
            "stars": ["Kristanna Loken"],
            "embed_url": "https://vide0.net/e/smo8970rj5gh",
            "rating": "6.2" // Added a placeholder rating for JSON-LD schema
        },
        {
            "id": 2,
            "title": "A Nice Girl Like You 2020",
            "description": "القصّة : لوسي نيل عازفة كمان، تكتشف إدمان صديقها جيف لمشاهدة المواد الإباحية، فتتشاجر معه، وينفصلا، وتصاب بصدمة عصبية، وتقرر على هذا الاساس تعزيز نفسيها، واكتشاف ذاتها خاصة بعد علاقة الصداقة التي تنشأ بينها وبين جرانت، حيث يساعدها على التغلب على مشاكلها السابقة مع صديقها جيف",
            "poster": "https://i.ibb.co/k2jg6TSd/photo-5852675531542218174-y.jpg",
            "year": "2020",
            "category": "النوع: رومنسي , إثارة جنسية ساخنة/تشويق / للبالغين فقط ",
            "director": "Chris Riedell",
            "stars": ["Lucy Hale"],
            "embed_url": "https://streamtape.com/e/gopa76QkOpuqM8P/",
            "rating": "5.5" // Added a placeholder rating
        },
        {
            "id": 3,
            "title": "Sleeping with the Enemy 1991",
            "description": " تزوجت (لورا) منذ أربع سنوات بالرجل الوسيم (مارتن). يبدو زواجهما مثاليًا في أعين الجميع، ولكن الحقيقة تختلف تمامًا عن هذه الصورة. يعامل مارتن المتسلط لورا بعنف ووحشية ويعتدي عليها، لتصل الزوجة لنقطة تستعد فيها لفعل أي شيء مقابل التخلص من حياتها البائسة. تضع لورا خطة النجاة، والتي تتلخص في قيامها بادعاء الوفاة، وتلفيق كل شيء؛ بحيث تنطلي الخدعة على مارتن. يسير كل شيء حسب الخطة، وتبدأ لورا في العيش بسعادة بهويتها الجديدة، ولكن السعادة لا تدوم طويلًا بعدما تتطور الأحداث بغتة.",
            "poster": "https://i.ibb.co/d4Jmp73r/photo-5852675531542218154-y.jpg",
            "year": "1991",
            "category": "النوع: رومنسي , إثارة جنسية ساخنة/تشويق / للبالغين فقط ",
            "director": "Joseph Ruben",
            "stars": ["Julia Roberts"],
            "embed_url": "https://streamtape.com/e/v9KrVBVJVAIYjA/",
            "rating": "6.3" // Added a placeholder rating
        },
        {
            "id": 4,
            "title": "Moms Friends 2024",
            "description": " القصّة : فيلم رومانسي جديد حول الرغبات الجنسية والعلاقات الحميمة الساخنة بين الشباب والعلاقات الجنسية التي يمارسونها",
            "poster": "https://i.postimg.cc/dtHdLMNL/photo-5838945848241800438-y.jpg",
            "year": "2024",
            "category": "النوع: رومنسي , إثارة جنسية ساخنة/تشويق / للبالغين فقط ",
            "director": "Yoo Je‑won.",
            "stars": ["Choi Seung‑hyo"],
            "embed_url": "https://streamtape.com/e/7kbx78RR8VtAXD1/",
            "rating": "7.0" // Added a placeholder rating
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
            "embed_url": "https://streamtape.com/e/7b7rqXvk7DT8Ap/",
            "rating": "7.5" // Added a placeholder rating
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
            "embed_url": "https://streamtape.com/e/KXbbjrOM6Lc080L/",
            "rating": "7.8" // Added a placeholder rating
        },
        // أضف المزيد من الأفلام هنا...
    ];

    // Helper Function: Update Meta Tags for SEO and Social Sharing
    function updateMetaTags(title, description, imageUrl, pageUrl, ogType = 'website') {
        document.title = title;
        document.querySelector('meta[name="description"]').setAttribute('content', description);

        document.querySelector('meta[property="og:title"]').setAttribute('content', title);
        document.querySelector('meta[property="og:description"]').setAttribute('content', description);
        if (imageUrl) {
            document.querySelector('meta[property="og:image"]').setAttribute('content', imageUrl);
        }
        if (pageUrl) {
            document.querySelector('meta[property="og:url"]').setAttribute('content', pageUrl);
        }
        document.querySelector('meta[property="og:type"]').setAttribute('content', ogType);
    }

    // Helper Function: Add or Remove JSON-LD Schema Markup
    function addJsonLdSchema(movieData = null) {
        let existingSchema = document.getElementById('movie-schema-ld');
        if (existingSchema) {
            existingSchema.remove();
        }

        if (movieData) {
            const schema = {
                "@context": "http://schema.org",
                "@type": "Movie",
                "name": movieData.title,
                "description": movieData.description,
                "image": movieData.poster,
                "director": {
                    "@type": "Person",
                    "name": movieData.director
                },
                // Ensure stars array is mapped correctly for schema
                "actor": movieData.stars.map(star => ({ "@type": "Person", "name": star })),
                "datePublished": movieData.year + "-01-01", // Assuming Jan 1st if exact date not available
                "trailer": { // Using embed_url for trailer object
                    "@type": "VideoObject",
                    "name": movieData.title + " Trailer",
                    "description": movieData.description,
                    "thumbnailUrl": movieData.poster,
                    "embedUrl": movieData.embed_url,
                    "uploadDate": movieData.year + "-01-01" // Assuming Jan 1st
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": movieData.rating || "7.0", // Use existing rating or default
                    "bestRating": "10",
                    "worstRating": "1",
                    "ratingCount": "100" // Placeholder, ideally dynamic
                },
                "url": window.location.href // Current URL
            };

            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = 'movie-schema-ld';
            script.textContent = JSON.stringify(schema);
            document.head.appendChild(script);
        }
    }

    // Toggle mobile menu
    if (mobileMenu && mainNav) {
        mobileMenu.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }

    // تحديث رابط URL مع تغيير الحالة (pushState)
    function updateUrl(id = null) {
        const currentPath = window.location.pathname;
        if (id) {
            history.pushState({ movieId: id }, null, `${currentPath}?id=${id}`);
        } else {
            history.pushState({}, null, currentPath); // Remove query params for home
        }
    }

    // عرض قائمة الأفلام (Homepage)
    function displayMovies() {
        movieDetailsSection.style.display = 'none';
        moviesListSection.style.display = 'block';
        heroSection.style.display = 'block';

        movieGrid.innerHTML = '';

        moviesData.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.setAttribute('role', 'listitem');

            const movieLink = document.createElement('a');
            movieLink.href = `?id=${movie.id}`; // Use query param for link
            movieLink.dataset.id = movie.id; // Store ID in dataset

            movieLink.innerHTML = `
                <img loading="lazy" src="${movie.poster}" alt="بوستر فيلم ${movie.title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/260x380?text=Image+Not+Found';">
                <h3>${movie.title}</h3>
            `;

            movieCard.appendChild(movieLink);
            movieGrid.appendChild(movieCard);
        });

        // تحديث قسم الفيلم المميز (أول فيلم أو الذي id=1)
        const featuredMovie = moviesData.find(m => m.id === 1) || moviesData[0];
        if (featuredMovie) {
            heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${featuredMovie.poster}')`;
            heroSection.querySelector('h2').textContent = featuredMovie.title;
            heroSection.querySelector('p').textContent = featuredMovie.description.substring(0, 150) + '...';
            heroBtn.href = `?id=${featuredMovie.id}`; // Link for hero button
            heroBtn.dataset.id = featuredMovie.id; // Data-id for click handling
        }

        // SEO IMPROVEMENT: Revert meta tags to original home page values
        updateMetaTags(originalTitle, originalDescription, originalOgImage, originalOgUrl, 'website');
        // SEO IMPROVEMENT: Remove any specific movie schema
        addJsonLdSchema(null);
    }

    // عرض تفاصيل فيلم
    function displayMovieDetails(movie) {
        if (!movie) return;

        moviesListSection.style.display = 'none';
        heroSection.style.display = 'none';
        movieDetailsSection.style.display = 'block';

        movieDetailsSection.querySelector('.movie-title').textContent = movie.title;
        movieDetailsSection.querySelector('.movie-description').textContent = movie.description;
        movieDetailsSection.querySelector('.director').textContent = movie.director;
        // Check if stars is an array before joining
        movieDetailsSection.querySelector('.stars').textContent = Array.isArray(movie.stars) ? movie.stars.join(', ') : movie.stars;
        movieDetailsSection.querySelector('.category').textContent = movie.category;
        movieDetailsSection.querySelector('.year').textContent = movie.year;
        // If you want to display rating, ensure it's in moviesData
        // movieDetailsSection.querySelector('.rating').innerHTML = `<i class="fas fa-star"></i> ${movie.rating}/10`; 


        const videoPlayerContainer = movieDetailsSection.querySelector('.movie-player-container');
        videoPlayerContainer.innerHTML = `
            <iframe src="${movie.embed_url}" frameborder="0" allowfullscreen
                title="مشغل فيديو لفيلم ${movie.title}"
                loading="lazy"></iframe>
            <div class="video-overlay"></div> `;

        const videoOverlay = videoPlayerContainer.querySelector('.video-overlay');
        if (videoOverlay) {
            videoOverlay.addEventListener('click', function() {
                window.open(adsterraDirectLink, '_blank');

                videoOverlay.style.display = 'none'; // Hide overlay to allow video interaction
                // You can uncomment this if you want the overlay to reappear
                /*
                setTimeout(() => {
                    videoOverlay.style.display = 'block';
                }, 10000); // Reappear after 10 seconds
                */
            });
        }

        // SEO IMPROVEMENT: Update meta tags dynamically for the movie page
        const moviePageUrl = window.location.origin + window.location.pathname + `?id=${movie.id}`;
        updateMetaTags(
            `${movie.title} - شاهد بلس`,
            movie.description,
            movie.poster,
            moviePageUrl,
            'video.movie' // Specific Open Graph type for movie
        );

        // SEO IMPROVEMENT: Add JSON-LD schema markup for the movie
        addJsonLdSchema(movie);

        // Scroll to top of the movie details section for better UX
        movieDetailsSection.scrollIntoView({ behavior: 'smooth' });
    }

    // التنقل داخل الصفحة بدون إعادة تحميل
    function navigateToMovie(id) {
        // Convert id to number as some data has it as number, URLSearchParams returns string
        const movie = moviesData.find(m => m.id == id); // Using == for type coercion
        if (movie) {
            displayMovieDetails(movie);
            updateUrl(id);
            setActiveNav(false); // Deactivate home link
        } else {
            // إذا الفيلم غير موجود، العودة للرئيسية
            displayMovies();
            updateUrl(null);
            setActiveNav(true); // Activate home link
        }
    }

    // تفعيل أو إلغاء تمييز القائمة
    function setActiveNav(isHome) {
        navLinks.forEach(link => {
            if (isHome && link.dataset.action === 'home') {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // التعامل مع الروابط الداخلية بدون إعادة تحميل الصفحة (Event Delegation on body)
    document.body.addEventListener('click', (e) => {
        const target = e.target.closest('a');
        if (!target) return;

        // روابط الأفلام والفيلم المميز (باستخدام dataset.id)
        if (target.dataset.id) {
            e.preventDefault();

            // يتم تشغيل إعلان الـ Direct Link هنا أيضاً مع كل كليكة على البوستر/الفيلم المميز
            window.open(adsterraDirectLink, '_blank');

            const id = target.dataset.id;
            navigateToMovie(id);

            // إغلاق قائمة الهاتف لو مفتوحة
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        }
        // روابط قائمة التنقل (home, movies, etc.)
        else if (target.dataset.action === 'home') {
            e.preventDefault();
            displayMovies();
            updateUrl(null);
            setActiveNav(true);
            // Close mobile menu if open
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        }
        // Handle other navigation links if needed (e.g., #movies-list if it's not handled by dataset.id)
        else if (target.getAttribute('href') === '#movies-list') {
            e.preventDefault();
            // This case handles direct clicks on the "الأفلام" nav link
            // It will scroll to the movies list, but won't trigger a full movie detail view
            displayMovies(); // Ensure main sections are visible
            updateUrl(null); // Keep home URL if just scrolling to section
            setActiveNav(true); // Keep home active or add a specific 'movies' active state
            document.getElementById('movies-list').scrollIntoView({ behavior: 'smooth' });
             // Close mobile menu if open
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        }
        // You can add more conditions for other navigation links if they have different behaviors
    });

    // زر العودة للرئيسية من صفحة تفاصيل الفيلم
    backBtn.addEventListener('click', () => {
        displayMovies();
        updateUrl(null);
        setActiveNav(true);
    });

    // زر الفيلم المميز في الـ hero
    heroBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = e.currentTarget.dataset.id; // Use currentTarget for button's dataset

        // ***** هنا يتم تشغيل إعلان الـ Direct Link للفيلم المميز *****
        window.open(adsterraDirectLink, '_blank');

        navigateToMovie(id);
    });

    // التعامل مع زر الرجوع في المتصفح (History API popstate event)
    window.addEventListener('popstate', (event) => {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');

        if (movieId) {
            navigateToMovie(movieId);
        } else {
            displayMovies();
            setActiveNav(true);
        }
    });

    // عند بداية تحميل الصفحة، عرض الفيلم إذا كان في الرابط (Initialization)
    function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        if (movieId) {
            navigateToMovie(movieId);
        } else {
            displayMovies(); // Initial display of movies list and hero section
            setActiveNav(true);
        }
    }

    init(); // Call init function on page load
});
