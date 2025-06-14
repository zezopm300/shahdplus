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
            "title":"Stealing Beauty 1996",
            "description":"القصة:تبدأ (لوسي) رحلة البحث عن الذات بعد رحيل والدتها، وتقرر السفر إلى إيطاليا، مهدَّدة بظلال الماضي، باحثة عن الحب والحقيقة واتصال أعمق مع نفسها لتكتشف عوالم جديدة، وتلتقي بأشخاص مُلهمين، وتخوض تجارب مليئة بالتحديات",
            "poster":"https://i.ibb.co/HjkzTLp/images.jpg", 
            "year": "1996",
            "category": " دراما/ رومنسي/ تشويق",
            "director":"Bernardo Bertolucci",
            "stars": ["Lucy Harmon"],
            "embed_url":"https://streamtape.com/e/RDmxvQlvZVcxOq/no"

        },
          {
            "id": 2,
            "title":"A Nice Girl Like You 2020",
            "description":"القصّة : لوسي نيل عازفة كمان، تكتشف إدمان صديقها جيف لمشاهدة المواد الإباحية، فتتشاجر معه، وينفصلا، وتصاب بصدمة عصبية، وتقرر على هذا الاساس تعزيز نفسيها، واكتشاف ذاتها خاصة بعد علاقة الصداقة التي تنشأ بينها وبين جرانت، حيث يساعدها على التغلب على مشاكلها السابقة مع صديقها جيف",
            "poster":"https://i.postimg.cc/y6fWTmmG/images.jpg",
            "year": "2020",
            "category": "النوع: رومنسي , إثارة جنسية ساخنة/تشويق / للبالغين فقط ", 
            "director":"Chris Riedell",
            "stars": ["Lucy Hale"],
            "embed_url":"https://streamtape.com/e/gopa76QkOpuqM8P/"
        },
   {
            "id": 3,
            "title":"Sleeping with the Enemy 1991",
            "description":" تزوجت (لورا) منذ أربع سنوات بالرجل الوسيم (مارتن). يبدو زواجهما مثاليًا في أعين الجميع، ولكن الحقيقة تختلف تمامًا عن هذه الصورة. يعامل مارتن المتسلط لورا بعنف ووحشية ويعتدي عليها، لتصل الزوجة لنقطة تستعد فيها لفعل أي شيء مقابل التخلص من حياتها البائسة. تضع لورا خطة النجاة، والتي تتلخص في قيامها بادعاء الوفاة، وتلفيق كل شيء؛ بحيث تنطلي الخدعة على مارتن. يسير كل شيء حسب الخطة، وتبدأ لورا في العيش بسعادة بهويتها الجديدة، ولكن السعادة لا تدوم طويلًا بعدما تتطور الأحداث بغتة.",
            "poster":"https://i.ibb.co/d4Jmp73r/photo-5852675531542218154-y.jpg",
            "year": "1991",
            "category": "النوع: رومنسي , إثارة جنسية ساخنة/تشويق / للبالغين فقط ", 
            "director":"Joseph Ruben",
            "stars": ["Julia Roberts "],
            "embed_url":"https://streamtape.com/e/v9KrVBVJVAIYjA/"
        },

   {
            "id": 4,
            "title":"Moms Friends  2024",
            "description":" القصّة : فيلم رومانسي جديد حول الرغبات الجنسية والعلاقات الحميمة الساخنة بين الشباب والعلاقات الجنسية التي يمارسونها",
            "poster":"https://i.postimg.cc/dtHdLMNL/photo-5838945848241800438-y.jpg",
            "year": "2024",
            "category": "النوع: رومنسي , إثارة جنسية ساخنة/تشويق / للبالغين فقط ", 
            "director":"Yoo Je‑won.",
            "stars": ["Choi Seung‑hyo "],
            "embed_url":"https://streamtape.com/e/7kbx78RR8VtAXD1/"
        },

 {
            "id": 5,
            "title":"Blood Pay 2025",
            "description":"فيلم إثارة خيال علمي  تدور أحداثه في الجنة، وهي مدينة خيالية يسيطر فيها الذكاء الاصطناعي على القوى العاملة ويقود العزلة الاجتماعية.",
            "poster":"https://i.ibb.co/v6d90zjN/photo-5789391950099630510-w.jpg",
            "year": "2025",
            "category": "رعب / خيال علمي☯️ .. ", 
            "director":"Brace Beltempo.",
            "stars": ["Gianluca Busani "],
            "embed_url":"https://streamtape.com/e/7b7rqXvk7DT8Ap/"
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
});;
