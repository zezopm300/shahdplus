document.addEventListener('DOMContentLoaded', () => {
    const movieGrid = document.querySelector('.movie-grid');
    const movieDetailsSection = document.getElementById('movie-details');
    const heroSection = document.getElementById('hero-section');
    const moviesListSection = document.getElementById('movies-list');
    const backBtn = document.getElementById('back-to-home');
    const heroBtn = document.getElementById('hero-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mainNav = document.querySelector('.main-nav');
    // الرابط المباشر بتاع Adsterra اللي انت بعته
    const adsterraDirectLink = 'https://www.profitableratecpm.com/spqbhmyax?key=2469b039d4e7c471764bd04c57824cf2';

    // *** تحسين SEO: البيانات هنا هي مصدر المحتوى. تأكد من أن 'description' مفصلة و 'title' دقيقة ***
    let moviesData = [
        {
            "id": "Stealing_Beauty_1996", // تم تغيير الـ ID ليكون URL-friendly
            "title": "Stealing Beauty 1996 - سرقة الجمال", // عنوان أكثر وصفًا للـ SEO
            "description": "تبدأ (لوسي) رحلة البحث عن الذات بعد رحيل والدتها، وتقرر السفر إلى إيطاليا، مهدَّدة بظلال الماضي، باحثة عن الحب والحقيقة واتصال أعمق مع نفسها لتكتشف عوالم جديدة، وتلتقي بأشخاص مُلهمين، وتخوض تجارب مليئة بالتحديات. فيلم دراما رومانسي مشوق من إنتاج 1996.",
            "poster": "https://i.ibb.co/HjkzTLp/images.jpg",
            "year": "1996",
            "category": "دراما، رومانسي، تشويق", // استخدام فواصل مناسبة للكلمات المفتاحية
            "director": "Bernardo Bertolucci",
            "stars": ["Lucy Harmon", "Jeremy Irons", "Liv Tyler"], // إضافة نجوم أكثر تفصيلاً
            "embed_url": "https://streamtape.com/e/RDmxvQlvZVcxOq/no",
            "ratingValue": "7.0", // مثال على تقييم
            "ratingCount": "30000" // مثال على عدد التقييمات
        },
        {
            "id": "A_Nice_Girl_Like_You_2020",
            "title": "A Nice Girl Like You 2020 - فتاة لطيفة مثلك",
            "description": "لوسي نيل عازفة كمان، تكتشف إدمان صديقها جيف لمشاهدة المواد الإباحية، فتتشاجر معه، وينفصلا، وتصاب بصدمة عصبية، وتقرر على هذا الأساس تعزيز نفسها واكتشاف ذاتها خاصة بعد علاقة الصداقة التي تنشأ بينها وبين جرانت، حيث يساعدها على التغلب على مشاكلها السابقة. فيلم رومانسي مثير للبالغين فقط.",
            "poster": "https://i.postimg.cc/y6fWTmmG/images.jpg",
            "year": "2020",
            "category": "رومانسي، إثارة جنسية، تشويق، للبالغين فقط",
            "director": "Chris Riedell",
            "stars": ["Lucy Hale", "Leonidas Gulaptis", "Mindy Cohn"],
            "embed_url": "https://streamtape.com/e/gopa76QkOpuqM8P/",
            "ratingValue": "5.3",
            "ratingCount": "15000"
        },
        {
            "id": "Sleeping_with_the_Enemy_1991",
            "title": "Sleeping with the Enemy 1991 - النوم مع العدو",
            "description": "تزوجت لورا منذ أربع سنوات بالرجل الوسيم مارتن. يبدو زواجهما مثاليًا، ولكن الحقيقة تختلف. يعامل مارتن المتسلط لورا بعنف ووحشية. تضع لورا خطة للنجاة بادعاء الوفاة، وتبدأ في العيش بسعادة بهويتها الجديدة، ولكن السعادة لا تدوم طويلًا بعدما تتطور الأحداث بغتة. فيلم تشويق رومانسي مثير من بطولة جوليا روبرتس.",
            "poster": "https://i.ibb.co/d4Jmp73r/photo-5852675531542218154-y.jpg",
            "year": "1991",
            "category": "رومانسي، إثارة، تشويق، للبالغين فقط",
            "director": "Joseph Ruben",
            "stars": ["Julia Roberts", "Patrick Bergin", "Kevin Anderson"],
            "embed_url": "https://streamtape.com/e/v9KrVBVJVAIYjA/",
            "ratingValue": "6.2",
            "ratingCount": "45000"
        },
        {
            "id": "Moms_Friends_2024",
            "title": "Moms Friends 2024 - أصدقاء الأم",
            "description": "فيلم رومانسي جديد حول الرغبات الجنسية والعلاقات الحميمة الساخنة بين الشباب والعلاقات الجنسية التي يمارسونها. فيلم كوري جنوبي للبالغين فقط.",
            "poster": "https://i.postimg.cc/dtHdLMNL/photo-5838945848241800438-y.jpg",
            "year": "2024",
            "category": "رومانسي، إثارة جنسية، للبالغين فقط",
            "director": "Yoo Je‑won",
            "stars": ["Choi Seung‑hyo", "Park Joo-bin"],
            "embed_url": "https://streamtape.com/e/7kbx78RR8VtAXD1/",
            "ratingValue": "N/A", // في حال عدم وجود تقييم
            "ratingCount": "0"
        },
        {
            "id": "Blood_Pay_2025",
            "title": "Blood Pay 2025 - دفع الدم",
            "description": "فيلم إثارة خيال علمي تدور أحداثه في الجنة، وهي مدينة خيالية يسيطر فيها الذكاء الاصطناعي على القوى العاملة ويقود العزلة الاجتماعية. فيلم رعب وخيال علمي مثير.",
            "poster": "https://i.ibb.co/v6d90zjN/photo-5789391950099630510-w.jpg",
            "year": "2025",
            "category": "رعب، خيال علمي",
            "director": "Brace Beltempo",
            "stars": ["Gianluca Busani", "Chiara Provenzano"],
            "embed_url": "https://streamtape.com/e/7b7rqXvk7DT8Ap/",
            "ratingValue": "N/A",
            "ratingCount": "0"
        },
        {
            "id": "Twisters_2024",
            "title": "Twisters 2024 - الأعاصير",
            "description": "مع اشتداد موسم العواصف، تتصادم مسارات مطارد العواصف السابق كيت كوبر ونجم وسائل التواصل الاجتماعي المتهور تايلر أوينز عندما يتم إطلاق العنان لظواهر مرعبة لم يسبق لها مثيل. يجد الزوجان وفرقهما المتنافسة أنفسهم مباشرة في مسارات أنظمة العواصف المتعددة المتقاربة فوق وسط أوكلاهوما في معركة حياتهم. فيلم إثارة وأكشن ملحمي.",
            "poster": "https://i.ibb.co/Zp7BnYS3/Untitled.jpg",
            "year": "2024",
            "category": "إثارة، أكشن",
            "director": "Lee Isaac Chung",
            "stars": ["Daisy Edgar-Jones", "Glen Powell", "Anthony Ramos"],
            "embed_url": "https://streamtape.com/e/KXbbjrOM6Lc080L/",
            "ratingValue": "N/A",
            "ratingCount": "0"
        }
        // أضف المزيد من الأفلام هنا مع بيانات كاملة للـ SEO
    ];

    // Toggle mobile menu
    if (mobileMenu && mainNav) {
        mobileMenu.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }

    // *** تحسين SEO: وظيفة لتحديث Meta Tags و Schema Markup ***
    function updatePageMetadata(movie = null) {
        const defaultTitle = "أفلام أونلاين - شاهد أحدث الأفلام مجانًا";
        const defaultDescription = "شاهد أحدث وأفضل الأفلام العربية والأجنبية أونلاين مجانًا وبجودة عالية. اكتشف مجموعتنا الواسعة من الأفلام من مختلف الفئات.";
        const defaultImage = "https://example.com/default-share-image.jpg"; // استبدل برابط صورة افتراضية لموقعك

        let pageTitle = defaultTitle;
        let pageDescription = defaultDescription;
        let pageImage = defaultImage;

        // إزالة أي Schema Markup قديم
        document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

        if (movie) {
            pageTitle = `${movie.title} - مشاهدة فيلم أونلاين مجانًا`;
            pageDescription = movie.description.substring(0, 150) + '...'; // قصر الوصف ليكون مناسبًا للميتا
            pageImage = movie.poster;

            // إضافة Movie Schema Markup
            const schemaScript = document.createElement('script');
            schemaScript.setAttribute('type', 'application/ld+json');
            const movieSchema = {
                "@context": "https://schema.org",
                "@type": "Movie",
                "name": movie.title,
                "description": movie.description,
                "image": movie.poster,
                "datePublished": movie.year,
                "director": {
                    "@type": "Person",
                    "name": movie.director
                },
                "actor": movie.stars.map(star => ({ "@type": "Person", "name": star })),
                "genre": movie.category.split(/[,،]/).map(g => g.trim()), // تقسيم الفئات
                "embedUrl": movie.embed_url,
                "url": window.location.href // تأكيد أن الـ URL هو URL الحالي للصفحة
            };

            // إضافة التقييم إذا كان متاحًا
            if (movie.ratingValue && movie.ratingCount && movie.ratingValue !== "N/A") {
                movieSchema.aggregateRating = {
                    "@type": "AggregateRating",
                    "ratingValue": movie.ratingValue,
                    "ratingCount": movie.ratingCount
                };
            }
            schemaScript.textContent = JSON.stringify(movieSchema, null, 2);
            document.head.appendChild(schemaScript);

        } else {
            // إذا كانت الصفحة الرئيسية، يمكن إضافة Website أو WebPage Schema
            const homeSchemaScript = document.createElement('script');
            homeSchemaScript.setAttribute('type', 'application/ld+json');
            homeSchemaScript.textContent = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "أفلام أونلاين",
                "url": window.location.origin,
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": `${window.location.origin}/?s={search_term_string}`,
                    "query-input": "required name=search_term_string"
                }
            }, null, 2);
            document.head.appendChild(homeSchemaScript);
        }

        // تحديث عنوان الصفحة و Meta Description
        document.title = pageTitle;
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', pageDescription);

        // تحديث Open Graph (للمشاركة على السوشيال ميديا)
        let ogTitle = document.querySelector('meta[property="og:title"]');
        let ogDescription = document.querySelector('meta[property="og:description"]');
        let ogImage = document.querySelector('meta[property="og:image"]');
        let ogUrl = document.querySelector('meta[property="og:url"]');

        if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
        if (!ogDescription) { ogDescription = document.createElement('meta'); ogDescription.setAttribute('property', 'og:description'); document.head.appendChild(ogDescription); }
        if (!ogImage) { ogImage = document.createElement('meta'); ogImage.setAttribute('property', 'og:image'); document.head.appendChild(ogImage); }
        if (!ogUrl) { ogUrl = document.createElement('meta'); ogUrl.setAttribute('property', 'og:url'); document.head.appendChild(ogUrl); }

        ogTitle.setAttribute('content', pageTitle);
        ogDescription.setAttribute('content', pageDescription);
        ogImage.setAttribute('content', pageImage);
        ogUrl.setAttribute('content', window.location.href);

        // تحديث Twitter Cards
        let twitterCard = document.querySelector('meta[name="twitter:card"]');
        let twitterTitle = document.querySelector('meta[name="twitter:title"]');
        let twitterDescription = document.querySelector('meta[name="twitter:description"]');
        let twitterImage = document.querySelector('meta[name="twitter:image"]');

        if (!twitterCard) { twitterCard = document.createElement('meta'); twitterCard.setAttribute('name', 'twitter:card'); document.head.appendChild(twitterCard); }
        if (!twitterTitle) { twitterTitle = document.createElement('meta'); twitterTitle.setAttribute('name', 'twitter:title'); document.head.appendChild(twitterTitle); }
        if (!twitterDescription) { twitterDescription = document.createElement('meta'); twitterDescription.setAttribute('name', 'twitter:description'); document.head.appendChild(twitterDescription); }
        if (!twitterImage) { twitterImage = document.createElement('meta'); twitterImage.setAttribute('name', 'twitter:image'); document.head.appendChild(twitterImage); }

        twitterCard.setAttribute('content', 'summary_large_image'); // أو 'summary'
        twitterTitle.setAttribute('content', pageTitle);
        twitterDescription.setAttribute('content', pageDescription);
        twitterImage.setAttribute('content', pageImage);
    }


    // تحديث رابط URL مع تغيير الحالة (pushState)
    function updateUrl(id = null) {
        if (id) {
            // *** تحسين SEO: تأكد أن الـ ID في الـ URL نظيف وواضح، واستخدم replaceState لتجنب تضخيم التاريخ ***
            history.pushState({ movieId: id }, null, `?id=${id}`);
        } else {
            history.pushState({}, null, window.location.pathname);
        }
    }

    // عرض قائمة الأفلام
    function displayMovies() {
        movieDetailsSection.style.display = 'none';
        moviesListSection.style.display = 'block';
        heroSection.style.display = 'block';

        // *** تحسين SEO: تحديث الميتا داتا للصفحة الرئيسية ***
        updatePageMetadata(null);

        // هنا يتم مسح المحتوى الحالي للـ movieGrid قبل إضافة الجديد
        movieGrid.innerHTML = '';

        moviesData.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            // *** تحسين SEO: إضافة دور "listitem" لأغراض سهولة الوصول (Accessibility) ***
            movieCard.setAttribute('role', 'listitem');

            const movieLink = document.createElement('a');
            movieLink.href = `?id=${movie.id}`; // الرابط الذي سيتم معالجته بواسطة JS
            movieLink.dataset.id = movie.id;
            // *** تحسين SEO: إضافة "aria-label" لتحسين سهولة الوصول ***
            movieLink.setAttribute('aria-label', `مشاهدة فيلم ${movie.title}`);

            movieLink.innerHTML = `
                <img loading="lazy" src="${movie.poster}" alt="بوستر فيلم ${movie.title}">
                <h3>${movie.title}</h3>
            `;

            movieCard.appendChild(movieLink);
            movieGrid.appendChild(movieCard);
        });

        // تحديث قسم الفيلم المميز (أول فيلم أو الذي id=1)
        const featuredMovie = moviesData.find(m => m.id === "Stealing_Beauty_1996") || moviesData[0]; // تأكد من الـ ID الجديد
        if (featuredMovie) {
            heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${featuredMovie.poster}')`;
            heroSection.querySelector('h2').textContent = featuredMovie.title;
            heroSection.querySelector('p').textContent = featuredMovie.description.substring(0, 150) + '...';
            heroBtn.href = `?id=${featuredMovie.id}`;
            heroBtn.dataset.id = featuredMovie.id;
            heroBtn.setAttribute('aria-label', `مشاهدة فيلم ${featuredMovie.title} الآن`); // تحسين سهولة الوصول
        }
    }

    // عرض تفاصيل فيلم
    function displayMovieDetails(movie) {
        if (!movie) return;

        moviesListSection.style.display = 'none';
        heroSection.style.display = 'none';
        movieDetailsSection.style.display = 'block';

        // *** تحسين SEO: تحديث الميتا داتا وصفحة العنوان لكل فيلم ***
        updatePageMetadata(movie);

        movieDetailsSection.querySelector('.movie-title').textContent = movie.title;
        movieDetailsSection.querySelector('.movie-description').textContent = movie.description;
        movieDetailsSection.querySelector('.director').textContent = movie.director;
        // *** تحسين SEO: استخدام "span" مع "property" لـ Microdata (إذا كنت تستخدمها) أو فقط نص عادي مع SEO جيد ***
        movieDetailsSection.querySelector('.stars').textContent = movie.stars.join(', ');
        movieDetailsSection.querySelector('.category').textContent = movie.category;
        movieDetailsSection.querySelector('.year').textContent = movie.year;

        const videoPlayerContainer = movieDetailsSection.querySelector('.movie-player-container');
        videoPlayerContainer.innerHTML = `
            <iframe src="${movie.embed_url}" frameborder="0" allowfullscreen
                title="مشغل فيديو لفيلم ${movie.title}"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-presentation"></iframe> <div class="video-overlay" role="button" aria-label="اضغط لتشغيل الفيلم ومشاهدة إعلان"></div>
        `;

        // إضافة حدث الضغط على الـ overlay لفتح إعلان
        const videoOverlay = videoPlayerContainer.querySelector('.video-overlay');
        if (videoOverlay) {
            videoOverlay.addEventListener('click', function() {
                window.open(adsterraDirectLink, '_blank');
                videoOverlay.style.display = 'none';

                // يمكن إعادة إظهار الـ overlay بعد فترة أو عند توقف الفيديو
                // مثال: بعد 15 ثانية، لكن هذا قد يزعج المستخدمين. الأفضل هو ربطه بحدث انتهاء الفيديو إذا أمكن.
                setTimeout(() => {
                    videoOverlay.style.display = 'block';
                }, 15000); // 15 ثانية - المدة يمكن تعديلها
            });
        }
    }

    // التنقل داخل الصفحة بدون إعادة تحميل
    function navigateToMovie(id) {
        const movie = moviesData.find(m => m.id === id); // استخدام === للمقارنة الدقيقة
        if (movie) {
            displayMovieDetails(movie);
            updateUrl(id);
            setActiveNav(false);
            window.scrollTo(0, 0); // الانتقال لأعلى الصفحة عند عرض التفاصيل
        } else {
            // إذا الفيلم غير موجود، العودة للرئيسية
            displayMovies();
            updateUrl(null);
            setActiveNav(true);
            window.scrollTo(0, 0);
        }
    }

    // تفعيل أو إلغاء تمييز القائمة
    function setActiveNav(isHome) {
        const navLinks = document.querySelectorAll('.nav-link'); // تأكد أن لديك هذه الكلاس على روابط القائمة
        navLinks.forEach(link => {
            if (isHome && link.dataset.action === 'home') {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // التعامل مع الروابط الداخلية بدون إعادة تحميل الصفحة
    document.body.addEventListener('click', (e) => {
        const target = e.target.closest('a');
        if (!target) return;

        if (target.dataset.id) {
            e.preventDefault();

            // يتم تشغيل إعلان الـ Direct Link هنا أيضاً مع كل كليكة على البوستر
            window.open(adsterraDirectLink, '_blank');

            const id = target.dataset.id;
            navigateToMovie(id);

            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        }
        else if (target.dataset.action === 'home') {
            e.preventDefault();
            displayMovies();
            updateUrl(null);
            setActiveNav(true);
            if (mainNav.classList.contains('active')) { // إغلاق قائمة الموبايل عند العودة للرئيسية
                mainNav.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        }
    });

    // زر العودة للرئيسية من صفحة تفاصيل الفيلم
    backBtn.addEventListener('click', () => {
        displayMovies();
        updateUrl(null);
        setActiveNav(true);
        window.scrollTo(0, 0); // العودة لأعلى الصفحة
    });

    // زر الفيلم المميز في الـ hero
    heroBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = e.currentTarget.dataset.id;

        // هنا يتم تشغيل إعلان الـ Direct Link للفيلم المميز
        window.open(adsterraDirectLink, '_blank');

        navigateToMovie(id);
    });

    // التعامل مع زر الرجوع في المتصفح
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.movieId) {
            navigateToMovie(event.state.movieId);
        } else {
            displayMovies();
            setActiveNav(true);
        }
    });

    // عند بداية تحميل الصفحة، عرض الفيلم إذا كان في الرابط
    function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        if (movieId) {
            navigateToMovie(movieId);
        } else {
            displayMovies();
            setActiveNav(true);
        }
    }

    init();
});
