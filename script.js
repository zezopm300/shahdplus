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

    let moviesData = [
     {
            "id": 1,
            "title": "فيلم  Purity Falls 2019",
            "description":" القصّة : بعد مرور عام على فقدان زوجها، تستقر نيكول مع أبنائها الصغار جاستين وجيسون في بيوريتي فولز. في البداية، يتم الترحيب بالعائلة بحفاوة. وخاصة جارتهم الغنية كورتني التي تبدو لطيفة للغاية، حيث توفر لجيسون بسرعة وظائف غريبة لدعم دخل الأسرة. ومع ذلك، سرعان ما تلاحظ نيكول أن هناك شيئًا ما ليس على ما يرام، حيث يغادر ابنها ويعود في ساعات متأخرة بشكل مريب. عندما تغرق جارتها الشابة في حمام السباحة، تبدأ الأمور في أن تصبح خطيرة. هناك شيء غير صحيح مع كورتني الودودة للغاية، والتي يبدو أنها تسيطر على ابنها.",
            "poster": "https://tinyurl.com/mrynn3au",
            "year": "2019",
            "category": "رومنسي , إثارة جنسية ساخنة/تشويق / للبالغين فقط +18",
            "director":"Trevor Stines",
            "stars": ["Kristanna Loken"],
            "embed_url":"https://vide0.net/d/smo8970rj5gh"
        },

         {
            "id": 4,
            "title": "اغنيه ابراهيم ",
            "description": "اغانيه رومانسيه ",
            "poster": "https://zaaednews.com/wp-content/uploads/2024/09/%D8%AD%D9%81%D9%84-%D8%A3%D9%86%D8%BA%D8%A7%D9%85-%D9%84%D9%8A%D8%A7%D9%84%D9%8A-%D9%85%D8%B5%D8%B1-%D9%81%D9%8A-%D8%A7%D9%84%D9%85%D8%AA%D8%AD%D9%81-%D8%A7%D9%84%D9%85%D8%B5%D8%B1%D9%8A-%D8%A7%D9%84%D9%83%D8%A8%D9%8A%D8%B1.jpg0_.jpg",
            "year": "2024",
            "category": "رومانسي",
            "director": "انغام",
            "stars": ["ممثل 1", "ممثل 2"],
            "embed_url": "https://player.vimeo.com/video/1092496325"
        },
        {
            id: 2,
            title: "فيلم الرومانسية الجميل",
            description: "قصة حب تجمع بين قلبين في عالم من الأحلام...",
            poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpWBUvlAsW3NU71x8E50XXYAVul3xuvPs9CQ&s",
            director: "ليلى يوسف",
            stars: ["نور عمرو", "مريم خالد"],
            category: "رومانسية",
            year: 2022,
            embed_url: "https://player.vimeo.com/video/1091294042"
        },
        // أضف المزيد من الأفلام هنا...
    ];

    // Toggle mobile menu
    if (mobileMenu && mainNav) {
        mobileMenu.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }

    // تحديث رابط URL مع تغيير الحالة (pushState)
    function updateUrl(id = null) {
        if (id) {
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

        // **هنا يتم مسح المحتوى الحالي للـ movieGrid قبل إضافة الجديد**
        movieGrid.innerHTML = ''; 

        moviesData.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.setAttribute('role', 'listitem');

            const movieLink = document.createElement('a');
            movieLink.href = `?id=${movie.id}`;
            movieLink.dataset.id = movie.id;

            movieLink.innerHTML = `
                <img loading="lazy" src="${movie.poster}" alt="بوستر فيلم ${movie.title}">
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
            heroBtn.href = `?id=${featuredMovie.id}`;
            heroBtn.dataset.id = featuredMovie.id;
        }
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
        movieDetailsSection.querySelector('.stars').textContent = movie.stars.join(', ');
        movieDetailsSection.querySelector('.category').textContent = movie.category;
        movieDetailsSection.querySelector('.year').textContent = movie.year;

        const videoPlayerContainer = movieDetailsSection.querySelector('.movie-player-container');
        videoPlayerContainer.innerHTML = `
            <iframe src="${movie.embed_url}" frameborder="0" allowfullscreen
                title="مشغل فيديو لفيلم ${movie.title}"
                loading="lazy"></iframe>
            <div class="video-overlay"></div> `;

        // **الإضافة الجديدة هنا: إضافة حدث الضغط على الـ overlay لفتح إعلان**
        const videoOverlay = videoPlayerContainer.querySelector('.video-overlay');
        if (videoOverlay) {
            videoOverlay.addEventListener('click', function() {
                // افتح رابط الإعلان المباشر في تاب جديدة
                window.open(adsterraDirectLink, '_blank');
                
                // اخفي الـ overlay مؤقتاً للسماح بتشغيل الفيديو
                videoOverlay.style.display = 'none';

                // يمكنك إعادة إظهار الـ overlay بعد فترة، مثلاً 10 ثواني، أو عند توقف الفيديو
                // للتجربة، ممكن نعيد إظهاره بعد فترة
                setTimeout(() => {
                    videoOverlay.style.display = 'block';
                }, 10000); // 10000 مللي ثانية = 10 ثواني. ممكن تغير المدة دي.
            });
        }
    }

    // التنقل داخل الصفحة بدون إعادة تحميل
    function navigateToMovie(id) {
        const movie = moviesData.find(m => m.id == id);
        if (movie) {
            displayMovieDetails(movie);
            updateUrl(id);
            setActiveNav(false);
        } else {
            // إذا الفيلم غير موجود، العودة للرئيسية
            displayMovies();
            updateUrl(null);
            setActiveNav(true);
        }
    }

    // تفعيل أو إلغاء تمييز القائمة
    function setActiveNav(isHome) {
        const navLinks = document.querySelectorAll('.nav-link');
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

        // روابط الأفلام والفيلم المميز فقط
        if (target.dataset.id) { // لو المستخدم ضغط على لينك بوستر فيلم أو اسمه
            e.preventDefault(); // منع التحويل المباشر للصفحة

            // ***** يتم تشغيل إعلان الـ Direct Link هنا أيضاً مع كل كليكة على البوستر *****
            // ده عشان تضمن أكبر عدد من مرات ظهور الإعلان
            window.open(adsterraDirectLink, '_blank'); 
            
            const id = target.dataset.id;
            navigateToMovie(id);

            // إغلاق قائمة الهاتف لو مفتوحة
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
        }
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
        const id = e.currentTarget.dataset.id;
        
        // ***** هنا يتم تشغيل إعلان الـ Direct Link للفيلم المميز *****
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
