document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Element References - مراجع عناصر DOM
    const movieGrid = document.querySelector('.movie-grid');
    const movieDetailsSection = document.getElementById('movie-details');
    const heroSection = document.getElementById('hero-section');
    const moviesListSection = document.getElementById('movies-list');
    const backBtn = document.getElementById('back-to-home-btn');
    const heroBtn = document.getElementById('hero-btn');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.main-nav .nav-link');

    // Pagination related DOM elements - عناصر DOM الخاصة بالتقسيم لصفحات
    const paginationControls = document.getElementById('pagination-controls');
    // إنشاء أزرار Pagination مرة واحدة فقط
    const prevPageBtn = document.createElement('button');
    const nextPageBtn = document.createElement('button');
    const pageInfoSpan = document.createElement('span');

    // NEW: Suggested Movies DOM element - عنصر DOM للأفلام المقترحة
    const suggestedMovieGrid = document.getElementById('suggested-movie-grid');

    // Movie Details Specific elements - عناصر خاصة بتفاصيل الفيلم
    const movieTitleElem = movieDetailsSection.querySelector('.movie-title');
    const movieDirectorElem = movieDetailsSection.querySelector('.director');
    const movieStarsElem = movieDetailsSection.querySelector('.stars');
    const movieCategoryElem = movieDetailsSection.querySelector('.category');
    const movieYearElem = movieDetailsSection.querySelector('.year');
    const movieDescriptionElem = movieDetailsSection.querySelector('.movie-description');
    const moviePlayerContainer = movieDetailsSection.querySelector('.movie-player-container');

    // الرابط المباشر بتاع Adsterra اللي انت بعته
    const adsterraDirectLink = 'https://www.profitableratecpm.com/spqbhmyax?key=2469b039d4e7c471764bd04c57824cf2';

    // Store original meta and title for home page (SEO Improvement) - تخزين بيانات الميتا الأصلية للصفحة الرئيسية لتحسين SEO
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

    // Global flags/variables - علامات/متغيرات عامة
    let adsterraOpenedOnFirstClick = false; // علامة لتتبع ما إذا كان رابط Adsterra قد فُتح عند النقرة الأولى
    let scrollTimeoutId = null; // لتتبع تأخيرات التمرير ومنع تداخلها

    // بيانات الأفلام (هنا يمكنك إضافة المزيد من الأفلام يدويًا)
    // تم إزالة التكرار الكبير لتبسيط البيانات
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
            "embed_url": "https://streamtape.com/e/gopa76QkOpuqM8P/",
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
            "embed_url": "https://streamtape.com/e/v9KrVBVJVAIYjA/",
            "rating": "6.3"
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
            "embed_url": "https://streamtape.com/e/7kbx78RR8VtAXD1/",
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
            "embed_url": "https://streamtape.com/e/7b7rqXvk7DT8Ap/",
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
            "embed_url": "https://streamtape.com/e/KXbbjrOM6Lc080L/",
            "rating": "7.8"
        },
    ];

    // Pagination state variables - متغيرات حالة تقسيم الصفحات
    let currentPage = 1;
    // تم تخفيض عدد الأفلام في الصفحة ليناسب العدد الحالي من الأفلام للعرض التجريبي
    const moviesPerPage = 10;
    let totalPages; // سيتم حسابه ديناميكيًا في init

    // Helper Function: Update Meta Tags for SEO and Social Sharing - دالة مساعدة: تحديث علامات الميتا لتحسين محركات البحث والمشاركة الاجتماعية
    function updateMetaTags(title, description, imageUrl, pageUrl, ogType = 'website') {
        document.title = title;

        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = "description";
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description);

        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (!ogTitle) {
            ogTitle = document.createElement('meta');
            ogTitle.property = "og:title";
            document.head.appendChild(ogTitle);
        }
        ogTitle.setAttribute('content', title);

        let ogDescription = document.querySelector('meta[property="og:description"]');
        if (!ogDescription) {
            ogDescription = document.createElement('meta');
            ogDescription.property = "og:description";
            document.head.appendChild(ogDescription);
        }
        ogDescription.setAttribute('content', description);

        let ogImage = document.querySelector('meta[property="og:image"]');
        if (!ogImage) {
            ogImage = document.createElement('meta');
            ogImage.property = "og:image";
            document.head.appendChild(ogImage);
        }
        ogImage.setAttribute('content', imageUrl || originalOgImage); // Fallback to original image

        let ogUrl = document.querySelector('meta[property="og:url"]');
        if (!ogUrl) {
            ogUrl = document.createElement('meta');
            ogUrl.property = "og:url";
            document.head.appendChild(ogUrl);
        }
        ogUrl.setAttribute('content', pageUrl || originalOgUrl); // Fallback to original URL

        let ogTypeMeta = document.querySelector('meta[property="og:type"]');
        if (!ogTypeMeta) {
            ogTypeMeta = document.createElement('meta');
            ogTypeMeta.property = "og:type";
            document.head.appendChild(ogTypeMeta);
        }
        ogTypeMeta.setAttribute('content', ogType);

        // Canonical URL for SEO - مهم جداً
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.rel = 'canonical';
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.href = pageUrl || window.location.origin + window.location.pathname;
    }

    // Helper Function: Add or Remove JSON-LD Schema Markup - دالة مساعدة: إضافة أو إزالة ترميز مخطط JSON-LD
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
                "actor": Array.isArray(movieData.stars) ? movieData.stars.map(star => ({ "@type": "Person", "name": star })) : [{ "@type": "Person", "name": movieData.stars }], // Ensure stars is array
                "datePublished": movieData.year + "-01-01",
                "trailer": {
                    "@type": "VideoObject",
                    "name": movieData.title + " Trailer",
                    "description": movieData.description,
                    "thumbnailUrl": movieData.poster,
                    "embedUrl": movieData.embed_url,
                    "uploadDate": movieData.year + "-01-01" // Use a generic date for now
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": String(movieData.rating || "7.0"), // Ensure string, fallback to 7.0
                    "bestRating": "10",
                    "worstRating": "1",
                    "ratingCount": "100" // Placeholder count - ideally dynamic
                },
                "url": window.location.href
            };

            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = 'movie-schema-ld';
            script.textContent = JSON.stringify(schema);
            document.head.appendChild(script);
        }
    }

    // Toggle mobile menu - تبديل قائمة الجوال
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            // تحديث حالة ARIA للمساعدة في إمكانية الوصول
            const isExpanded = mainNav.classList.contains('active');
            mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
            mainNav.setAttribute('aria-hidden', !isExpanded);
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    mainNav.setAttribute('aria-hidden', 'true');
                }
                // يمكنك إضافة منطق التنقل هنا إذا كانت هذه الروابط تؤدي إلى أقسام أخرى
                // على سبيل المثال: if (link.dataset.section === 'series') { displaySeriesPage(); }
            });
        });
    }

    // تحديث رابط URL مع تغيير الحالة (pushState) - Update URL with pushState
    function updateUrl(id = null, page = null) {
        const currentPath = window.location.pathname;
        let newUrl = currentPath;
        const params = new URLSearchParams();

        if (id) {
            params.set('id', id);
        }
        // إضافة معلمة الصفحة فقط إذا كانت أكبر من 1 ولا يوجد معرف فيلم
        if (page && page > 1 && !id) {
            params.set('page', page);
        }

        const queryString = params.toString();
        if (queryString) {
            newUrl += `?${queryString}`;
        }

        // تجنب دفع حالات متطابقة لمنع إدخالات السجل غير الضرورية
        if (window.location.search !== `?${queryString}` || (!queryString && window.location.search !== '')) {
             history.pushState({ movieId: id, pageNumber: page }, null, newUrl);
        }
    }

    // Render Pagination Controls - عرض عناصر التحكم في التقسيم لصفحات
    function renderPaginationControls() {
        if (!paginationControls) return;

        paginationControls.innerHTML = ''; // مسح عناصر التحكم السابقة

        prevPageBtn.textContent = 'السابق';
        prevPageBtn.classList.add('pagination-btn', 'prev');
        prevPageBtn.disabled = currentPage === 1;
        paginationControls.appendChild(prevPageBtn);

        // عرض رقم الصفحة
        pageInfoSpan.classList.add('page-info');
        pageInfoSpan.textContent = `صفحة ${currentPage} من ${totalPages}`;
        paginationControls.appendChild(pageInfoSpan);

        nextPageBtn.textContent = 'التالي';
        nextPageBtn.classList.add('pagination-btn', 'next');
        nextPageBtn.disabled = currentPage === totalPages;
        paginationControls.appendChild(nextPageBtn);
        
        // إخفاءPagination إذا كان هناك صفحة واحدة فقط
        if (totalPages <= 1) {
            paginationControls.style.display = 'none';
        } else {
            paginationControls.style.display = 'flex';
        }
    }

    // Helper function to scroll to the top of a section - دالة مساعدة للتمرير إلى أعلى القسم
    function scrollToElement(element, delay = 300) {
        if (scrollTimeoutId) {
            clearTimeout(scrollTimeoutId); // إلغاء أي تمرير معلق
        }
        scrollTimeoutId = setTimeout(() => {
            if (element && element.offsetParent !== null) { // التحقق من أن العنصر مرئي في DOM
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                // إذا لم يكن العنصر مرئيًا، قم بالتمرير إلى أعلى المستند
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            scrollTimeoutId = null; // إعادة تعيين معرف المهلة
        }, delay);
    }

    // عرض قائمة الأفلام (Homepage) - Display movie list (Homepage)
    function displayMovies() {
        // إظهار وإخفاء الأقسام الصحيحة
        movieDetailsSection.style.display = 'none';
        moviesListSection.style.display = 'block';
        heroSection.style.display = 'block';
        
        movieGrid.innerHTML = ''; // مسح بطاقات الأفلام السابقة

        // حساب مؤشر البداية والنهاية للصفحة الحالية
        const startIndex = (currentPage - 1) * moviesPerPage;
        const endIndex = startIndex + moviesPerPage;
        const moviesToDisplay = moviesData.slice(startIndex, endIndex);

        moviesToDisplay.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.setAttribute('role', 'listitem');

            const movieLink = document.createElement('a');
            // لا نستخدم href مباشرة هنا لروابط الأفلام، بل نعتمد على data-id
            movieLink.dataset.id = movie.id;
            movieLink.title = `شاهد فيلم ${movie.title}`; // تحسين إمكانية الوصول و SEO

            movieLink.innerHTML = `
                <img loading="lazy" src="${movie.poster}" alt="بوستر فيلم ${movie.title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/260x380?text=Image+Not+Found';">
                <h3>${movie.title}</h3>
            `;

            movieCard.appendChild(movieLink);
            movieGrid.appendChild(movieCard);
        });

        // تحديث قسم الفيلم المميز: اختيار فيلم عشوائي
        if (moviesData.length > 0) {
            const randomIndex = Math.floor(Math.random() * moviesData.length);
            const featuredMovie = moviesData[randomIndex];

            heroSection.querySelector('h2').textContent = featuredMovie.title;
            // قص الوصف إذا كان طويلاً جداً للعرض في Hero Section
            heroSection.querySelector('p').textContent = featuredMovie.description.substring(0, 150) + '...';

            heroBtn.dataset.id = featuredMovie.id; // تخزين معرف الفيلم في dataset
            heroBtn.style.cursor = 'pointer'; // لجعل المؤشر يظهر كيد

            // تعيين معالج النقر مباشرةً لتجنب المستمعين المتعددين
            heroBtn.onclick = (event) => {
                event.preventDefault();
                // هنا لا نفتح Adsterra مباشرة عند النقر على HeroBtn، بل نعتمد على الـ overlay
                displayMovieDetails(heroBtn.dataset.id);
                updateUrl(heroBtn.dataset.id);
                scrollToElement(movieDetailsSection, 750); // تأخير أطول لتحميل iframe
            };
        }

        // تحسين SEO: إعادة علامات الميتا إلى قيم الصفحة الرئيسية الأصلية
        updateMetaTags(originalTitle, originalDescription, originalOgImage, originalOgUrl, 'website');
        // تحسين SEO: إزالة أي مخطط فيلم محدد
        addJsonLdSchema(null);

        // عرض عناصر التحكم في التقسيم بعد عرض الأفلام
        renderPaginationControls();
    }

    // NEW FUNCTION: Display Suggested Movies - دالة جديدة: عرض الأفلام المقترحة
    function displaySuggestedMovies(currentMovieId) {
        if (!suggestedMovieGrid) return;

        suggestedMovieGrid.innerHTML = ''; // مسح الأفلام المقترحة السابقة

        // تصفية الفيلم الحالي من قائمة الأفلام المقترحة
        const availableMovies = moviesData.filter(movie => movie.id !== currentMovieId);

        // خلط الأفلام المتاحة (Fisher-Yates shuffle)
        for (let i = availableMovies.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableMovies[i], availableMovies[j]] = [availableMovies[j], availableMovies[i]];
        }

        // عرض ما يصل إلى 6 أفلام مقترحة
        const moviesToSuggest = availableMovies.slice(0, 6);

        // إذا لم يكن هناك أفلام مقترحة، عرض رسالة
        if (moviesToSuggest.length === 0) {
            suggestedMovieGrid.innerHTML = '<p class="no-suggestions">لا توجد اقتراحات أفلام متاحة حالياً.</p>';
            return;
        }

        moviesToSuggest.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card'); // استخدام فئة movie-card للاتساق
            movieCard.setAttribute('role', 'listitem');

            const movieLink = document.createElement('a');
            movieLink.dataset.id = movie.id;
            movieLink.title = `شاهد فيلم ${movie.title}`;

            movieLink.innerHTML = `
                <img loading="lazy" src="${movie.poster}" alt="بوستر فيلم ${movie.title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/260x380?text=Image+Not+Found';">
                <h3>${movie.title}</h3>
            `;
            movieCard.appendChild(movieLink);
            suggestedMovieGrid.appendChild(movieCard);
        });
    }

    // عرض تفاصيل الفيلم - Display movie details
    function displayMovieDetails(id) {
        const movie = moviesData.find(m => m.id === parseInt(id));

        if (movie) {
            heroSection.style.display = 'none';
            moviesListSection.style.display = 'none';
            paginationControls.style.display = 'none'; // إخفاء عناصر التحكم في التقسيم
            movieDetailsSection.style.display = 'block';

            movieTitleElem.textContent = movie.title;
            movieDirectorElem.textContent = `المخرج: ${movie.director}`;
            movieStarsElem.textContent = `بطولة: ${Array.isArray(movie.stars) ? movie.stars.join(', ') : movie.stars}`;
            movieCategoryElem.textContent = `النوع: ${movie.category}`;
            movieYearElem.textContent = `السنة: ${movie.year}`;
            movieDescriptionElem.textContent = movie.description;

            // **تنظيف حاوية الفيديو أولاً**
            moviePlayerContainer.innerHTML = '';

            // **إنشاء رسالة التنبيه و إضافتها**
            const loadingMessage = document.createElement('p');
            loadingMessage.classList.add('video-loading-message');
            loadingMessage.innerHTML = 'جارٍ تحميل الفيديو... <br> <b>إذا لم يظهر الفيديو، قد تحتاج لتعطيل مانع الإعلانات أو تجربة متصفح آخر.</b>';
            moviePlayerContainer.appendChild(loadingMessage);

            // **إنشاء الغطاء الشفاف (Video Overlay) لفتح إعلانات Adsterra**
            const videoOverlay = document.createElement('div');
            videoOverlay.classList.add('video-overlay'); // إضافة الكلاس لتطبيق الأنماط
            moviePlayerContainer.appendChild(videoOverlay);

            // **إنشاء الـ iframe ولكن لا نضيف src الآن**
            const movieIframe = document.createElement('iframe');
            movieIframe.frameBorder = "0";
            movieIframe.allowFullscreen = true;
            movieIframe.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
            movieIframe.referrerPolicy = "origin";
            // سمات sandbox أكثر مرونة لتقليل مشاكل الحظر
            movieIframe.sandbox = "allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock allow-downloads";

            // **إضافة Event Listener للغطاء لفتح الرابط المباشر وتشغيل الفيديو**
            let overlayClicked = false;
            videoOverlay.addEventListener('click', (e) => {
                e.stopPropagation(); // منع الحدث من الانتقال إلى معالجات النقر الأصلية
                
                if (!overlayClicked) {
                    window.open(adsterraDirectLink, '_blank'); // فتح الرابط في علامة تبويب جديدة
                    overlayClicked = true;
                    videoOverlay.style.display = 'none'; // إخفاء الغطاء بعد النقرة الأولى
                    loadingMessage.style.display = 'none'; // إخفاء رسالة التحميل

                    // **تأخير بسيط قبل تعيين src للـ iframe للسماح بالإعلان بالتحميل**
                    setTimeout(() => {
                        movieIframe.src = movie.embed_url; // الآن قم بتحميل الـ iframe
                        moviePlayerContainer.appendChild(movieIframe); // إضافة الـ iframe بعد تعيين src
                    }, 300); // تأخير 300 مللي ثانية
                }
            });

            // جديد: عرض الأفلام المقترحة
            displaySuggestedMovies(movie.id);

            // تحسين SEO: تحديث علامات الميتا لصفحة فيلم محددة
            const moviePageUrl = `${window.location.origin}${window.location.pathname}?id=${movie.id}`;
            updateMetaTags(
                `${movie.title} - شاهد بلس`,
                movie.description,
                movie.poster,
                moviePageUrl,
                'video.movie'
            );

            // إضافة مخطط JSON-LD لهذا الفيلم
            addJsonLdSchema(movie);

        } else {
            // إذا لم يتم العثور على الفيلم، العودة للصفحة الرئيسية
            console.warn('Movie not found for ID:', id);
            displayMovies();
            updateUrl(); // تنظيف URL
            scrollToElement(document.body); // التمرير إلى أعلى الصفحة الرئيسية
        }
    }

    // Handle clicks on movie cards (event delegation for efficiency)
    document.addEventListener('click', (e) => {
        const movieLink = e.target.closest('.movie-card a'); // البحث عن أقرب عنصر 'a' داخل 'movie-card'

        if (movieLink && movieLink.dataset.id) {
            e.preventDefault(); // منع سلوك الرابط الافتراضي

            // هنا لا نفتح Adsterra مباشرة عند النقر على بطاقة الفيلم، بل نعتمد على الـ overlay في صفحة التفاصيل
            const movieId = movieLink.dataset.id;
            displayMovieDetails(movieId);
            updateUrl(movieId); // تحديث URL مع معرف الفيلم

            scrollToElement(movieDetailsSection, 750); // تأخير 750 مللي ثانية للتمرير لضمان تحميل الـ iframe
        }
    });

    // Handle pagination button clicks (previously rendered in renderPaginationControls)
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayMovies();
            updateUrl(null, currentPage);
            scrollToElement(moviesListSection);
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayMovies();
            updateUrl(null, currentPage);
            scrollToElement(moviesListSection);
        }
    });

    // Handle back button click
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            displayMovies();
            updateUrl(); // إعادة URL للصفحة الرئيسية
            adsterraOpenedOnFirstClick = false; // إعادة تعيين علامة Adsterra عند العودة للصفحة الرئيسية
            scrollToElement(document.body); // التمرير إلى أعلى الصفحة الرئيسية
        });
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const pageNumber = urlParams.get('page');

        if (movieId) {
            displayMovieDetails(movieId);
            scrollToElement(movieDetailsSection);
        } else if (pageNumber && parseInt(pageNumber) <= totalPages) {
            currentPage = parseInt(pageNumber);
            displayMovies();
            scrollToElement(moviesListSection);
        } else {
            // الافتراضي إلى الصفحة الرئيسية إذا لم يكن هناك معرف أو صفحة محددة في URL
            currentPage = 1; // التأكد من إعادة تعيين الصفحة الحالية إلى 1 للصفحة الرئيسية
            displayMovies();
            adsterraOpenedOnFirstClick = false; // إعادة تعيين علامة Adsterra في الصفحة الرئيسية
            scrollToElement(document.body);
        }
    });

    // Initial page load logic
    function init() {
        totalPages = Math.ceil(moviesData.length / moviesPerPage);
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const pageNumber = urlParams.get('page');

        if (movieId) {
            displayMovieDetails(movieId);
            scrollToElement(movieDetailsSection, 1000); // تأخير أطول (1 ثانية) للتمرير الأولي للروابط المباشرة
        } else if (pageNumber && parseInt(pageNumber) <= totalPages) {
            currentPage = parseInt(pageNumber);
            displayMovies();
            scrollToElement(moviesListSection);
        } else {
            displayMovies();
            scrollToElement(document.body);
        }
    }

    // Call init when DOM is fully loaded
    init();
});
