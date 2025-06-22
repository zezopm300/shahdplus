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
    const moviePlayer = document.getElementById('movie-player');
    const videoOverlay = document.getElementById('video-overlay');
    const homeLogoLink = document.getElementById('home-logo-link');
    const videoLoadingSpinner = document.getElementById('video-loading-spinner');
    const movieDetailsPoster = document.getElementById('movie-details-poster');

    // Pagination elements
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const moviesPerPage = 30;
    let currentPage = 1;

    // Search DOM Elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const sectionTitleElement = movieGridSection ? movieGridSection.querySelector('h2') : null;

    // --- 1.1. Critical DOM Element Verification (تأكيد وجود العناصر الضرورية) ---
    const requiredElements = {
        '#movie-grid': movieGrid,
        '#movie-grid-section': movieGridSection,
        '#movie-details-section': movieDetailsSection,
        '#hero-section': heroSection,
        '#movie-player': moviePlayer,
        '#video-overlay': videoOverlay,
        '#suggested-movie-grid': suggestedMovieGrid,
        '#suggested-movies-section': suggestedMoviesSection,
        '#video-loading-spinner': videoLoadingSpinner,
        '#movie-details-poster': movieDetailsPoster
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
    } else {
        console.log('✅ All critical DOM elements found.');
    }

    // --- 2. Adsterra Configuration (تم الاحتفاظ بها كما هي لعمل إعلانات الفيديو والبوستر) ---
    const ADSTERRA_DIRECT_LINK_URL = 'https://www.profitableratecpm.com/spqbhmyax?key=2469b039d4e7c471764bd04c57824cf2';

    const DIRECT_LINK_COOLDOWN_MOVIE_CARD = 3 * 60 * 1000; // 3 minutes for movie cards and details poster
    const DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY = 4 * 1000; // 4 seconds for video overlay

    let lastDirectLinkClickTimeMovieCard = 0;
    let lastDirectLinkClickTimeVideoOverlay = 0;

    // --- 3. Movie Data (تأكد من أن هذه البيانات هي نفسها الموجودة في ملفك الفعلي) ---
    const moviesData = [
         {
            "id": 1,
            "title": "A Nice Girl Like You 2020",
            "description": "القصّة : لوسي نيل عازفة كمان، تكتشف إدمان صديقها جيف لمشاهدة المواد الإباحية، فتتشاجر معه، وينفصلا، وتصاب بصدمة عصبية، وتقرر على هذا الاساس تعزيز نفسيها، واكتشاف ذاتها خاصة بعد علاقة الصداقة التي تنشأ بينها وبين جرانت، حيث يساعدها على التغلب على مشاكلها السابقة مع صديقها جيف",
            "poster": "https://i.ibb.co/k2jg6TSd/photo-5852675531542218174-y.jpg",
            "thumbnailUrl": "https://i.ibb.co/k2jg6TSd/photo-5852675531542218174-y.jpg",
            "release_date": "2020-07-17",
            "genre": "رومنسي, إثارة جنسية ساخنة/تشويق, للبالغين فقط",
            "director": "Chris Riedell",
            "cast": "Lucy Hale",
            "embed_url": "https://streamtape.com/e/gopa76QkOpuqM8P",
            "rating": "5.5/10",
            "duration": "PT1H34M"
        },
        {
            "id": 2,
            "title": "Sleeping with the Enemy 1991",
            "description": " تزوجت (لورا) منذ أربع سنوات بالرجل الوسيم (مارتن). يبدو زواجهما مثاليًا في أعين الجميع، ولكن الحقيقة تختلف تمامًا عن هذه الصورة. يعامل مارتن المتسلط لورا بعنف ووحشية ويعتدي عليها، لتصل الزوجة لنقطة تستعد فيها لفعل أي شيء مقابل التخلص من حياتها البائسة. تضع لورا خطة النجاة، والتي تتلخص في قيامها بادعاء الوفاة، وتلفيق كل شيء؛ بحيث تنطلي الخدعة على مارتن. يسير كل شيء حسب الخطة، وتبدأ لورا في العيش بسعادة بهويتها الجديدة، ولكن السعادة لا تدوم طويلًا بعدما تتطور الأحداث بغتة.",
            "poster": "https://i.ibb.co/d4Jmp73r/photo-5852675531542218154-y.jpg",
            "thumbnailUrl": "https://i.ibb.co/d4Jmp73r/photo-5852675531542218154-y.jpg",
            "release_date": "1991-02-08",
            "genre": "رومنسي, إثارة جنسية ساخنة/تشويق, للبالغين فقط",
            "director": "Joseph Ruben",
            "cast": "Julia Roberts",
            "embed_url": "https://streamtape.com/e/v9KrVBVJVAIYjA/",
            "rating": "6.3/10",
            "duration": "PT1H39M"
        },
        {
            "id": 3,
            "title": "Moms Friends 2024",
            "description": "القصّة : فيلم رومانسي جديد حول الرغبات الجنسية والعلاقات الحميمة الساخنة بين الشباب والعلاقات الجنسية التي يمارسونها",
            "poster": "https://i.postimg.cc/dtHdLMNL/photo-5838945848241800438-y.jpg",
            "thumbnailUrl": "https://i.postimg.cc/dtHdLMNL/photo-5838945848241800438-y.jpg",
            "release_date": "2024-01-10",
            "genre": "رومنسي, إثارة جنسية ساخنة/تشويق, للبالغين فقط",
            "director": "Yoo Je‑won.",
            "cast": "Choi Seung‑hyo",
            "embed_url": "https://streamtape.com/e/7kbx78RR8VtAXD1/",
            "rating": "7.0/10",
            "duration": "PT1H45M"
        },
        {
            "id": 4,
            "title": "Blood Pay 2025",
            "description": "فيلم إثارة خيال علمي تدور أحداثه في الجنة، وهي مدينة خيالية يسيطر فيها الذكاء الاصطناعي على القوى العاملة ويقود العزلة الاجتماعية.",
            "poster": "https://i.ibb.co/v6d90zjN/photo-5789391950099630510-w.jpg",
            "thumbnailUrl": "https://i.ibb.co/v6d90zjN/photo-5789391950099630510-w.jpg",
            "release_date": "2025-03-20",
            "genre": "رعب, خيال علمي",
            "director": "Brace Beltempo.",
            "cast": "Gianluca Busani",
            "embed_url": "https://streamtape.com/e/7b7rqXvk7DT8Ap/",
            "rating": "7.5/10",
            "duration": "PT2H10M"
        },
        {
            "id": 5,
            "title": "Twisters",
            "description": "القصة: مع اشتداد موسم العواصف، تتصادم مسارات مطارد العواصف السابق كيت كوبر ونجم وسائل التواصل الاجتماعي المتهور تايلر أوينز عندما يتم إطلاق العنان لظواهر مرعبة لم يسبق لها مثيل. يجد الزوجان وفرقهما المتنافسة أنفسهم مباشرة في مسارات أنظمة العواصف المتعددة المتقاربة فوق وسط أوكلاهوما في معركة حياتهم.",
            "poster": "https://i.ibb.co/Zp7BnYS3/Untitled.jpg",
            "thumbnailUrl": "https://i.ibb.co/Zp7BnYS3/Untitled.jpg",
            "release_date": "2024-07-19",
            "genre": "اثارة, اكشن",
            "director": "Lee Isaac Chung",
            "cast": "Daisy Edgar-Jones",
            "embed_url": "https://streamtape.com/e/KXbbjrOM6Lc080L/",
            "rating": "7.8/10",
            "duration": "PT1H50M"
        },
        {
            "id": 6,
            "title": "Katas 2024",
            "description": "رومنسي, إثارة جنسية ساخنة/تشويق / للبالغين فقط +18",
            "poster": "https://i.ibb.co/nNCN6nf6/photo-5879999323205387355-y.jpg",
            "thumbnailUrl": "https://i.ibb.co/nNCN6nf6/photo-5879999323205387355-y.jpg",
            "release_date": "2025-06-17",
            "genre": "Drama, Thriller",
            "director": "Rodante Pajemna Jr",
            "cast": "Gianluca Busani",
            "embed_url": "https://player.vimeo.com/video/1094130228?badge",
            "rating": "7.5/10",
            "duration": "PT47M"
        },
        {
            "id": 7,
            "title": "INIT",
            "description": "رومنسي, إثارة جنسية ساخنة/تشويق / للبالغين فقط +18",
            "poster": "https://i.ibb.co/Q7qs5BHK/photo-5854927331355902321-y.jpg",
            "thumbnailUrl": "https://i.ibb.co/Q7qs5BHK/photo-5854927331355902321-y.jpg",
            "release_date": "2025-06-17",
            "genre": "Drama, Erotic",
            "director": "Paul Michael Acero",
            "cast": "Dyessa Garcia as Louisa",
            "embed_url": "https://player.vimeo.com/video/1094242186?badge",
            "rating": "7.5/10",
            "duration": "PT49M"
        },
        {
            "id": 8,
            "title": "Sexy Neighbor Sisters 2024",
            "description": "رومنسي, إثارة جنسية ساخنة/تشويق / للبالغين فقط +18",
            "poster": "https://i.ibb.co/JWvpp3dz/photo-5820968502415182530-w-1.jpg",
            "thumbnailUrl": "https://i.ibb.co/JWvpp3dz/photo-5820968502415182530-w-1.jpg",
            "release_date": "2025-06-18",
            "genre": "Erotic Drama",
            "director": "Lee Dong-joon",
            "cast": "Jin Si-ah",
            "embed_url": "https://player.vimeo.com/video/1094343142?badge",
            "rating": "7.5/10",
            "duration": "PT1H17M"
        },
        {
            "id": 9,
            "title": "The Naughty List of Mr. Scrooge",
            "description": "رعب☯️ ..",
            "poster": "https://i.ibb.co/WmSvjjv/photo-5773858406304697363-w.jpg",
            "thumbnailUrl": "https://i.ibb.co/WmSvjjv/photo-5773858406304697363-w.jpg",
            "release_date": "2025-06-18",
            "genre": "Comedy, Holiday, Fantasy",
            "director": "Tim Burton for a darker twist, or Rob Marshall for a musical tone",
            "cast": "Ebenezer Scrooge",
            "embed_url": "https://player.vimeo.com/video/1094365176?badge",
            "rating": "7.5/10",
            "duration": "PT27M"
        },
        {
            "id": 10,
            "title": "No Time to Die (2021)",
            "description": "اكشن/ اثارة / حركة",
            "poster": "https://i.ibb.co/zHLQWLJg/photo-5783048395072589689-w.jpg",
            "thumbnailUrl": "https://i.ibb.co/zHLQWLJg/photo-5783048395072589689-w.jpg",
            "release_date": "2025-06-18",
            "genre": "Action, Adventure, Thriller, Spy",
            "director": "Cary Joji Fukunaga",
            "cast": "Daniel Craig",
            "embed_url": "https://player.vimeo.com/video/1094454739?badge",
            "rating": "7.5/10",
            "duration": "PT27M"
        },
        {
            "id": 11,
            "title": "(Wolfman) 2025",
            "description": "When Blake Lovell (Christopher Abbott), a family man from San Francisco, inherits his childhood farmhouse in rural Oregon after his father’s disappearance, he convinces his wife Charlotte (Julia Garner) and young daughter Ginger (Matilda Firth) to join him. Soon after arrival, the family is attacked by a mysterious beast and barricades themselves inside the home. As night falls, Blake begins a slow, harrowing transformation into a monstrous creature—forcing Charlotte to decide whether the threat within is more dangerous than the one outside.",
            "poster": "https://i.ibb.co/Pz6k0QF6/photo-5803123626264872294-w.jpg",
            "thumbnailUrl": "https://i.ibb.co/Pz6k0QF6/photo-5803123626264872294-w.jpg",
            "release_date": "2025-06-19",
            "genre": "Horror, Mystery & Thriller",
            "director": "Leigh Whannell",
            "cast": "Christopher Abbott",
            "embed_url": "https://vkvideo.ru/video_ext.php?oid=-231089883&id=456239017&hd=2&",
            "rating": "7.5/10",
            "duration": "PT1H30M"
        },
        {
            "id": 12,
            "title": "Old (2021) BluRay Full Movie HD | Cimawbas.Tv",
            "description": "Old (2021) is a psychological thriller directed by M. Night Shyamalan, centered on a family who visits a mysterious, secluded beach while on vacation—only to discover that something about the place is causing them to age rapidly. As hours pass, their lives compress into a single day, forcing them to confront mortality, buried secrets, and emotional truths in a race against time",
            "poster": "https://i.ibb.co/nNwsBbcQ/5397ae84.jpg",
             "thumbnailUrl": "https://i.ibb.co/nNwsBbcQ/5397ae84.jpg",
            "release_date": "2025-06-20",
            "genre": "Mystery, Thriller, Drama, Psychological Horror",
            "director": "M. Night Shyamalan",
            "cast": "Gael García Bernal as Guy",
            "embed_url": "https://vkvideo.ru/video_ext.php?oid=-231089883&id=456239018&hd=2&",
            "rating": "7.9/10",
            "duration": "PT1H48M"
        },
        {
            "id": 13,
            "title": "Thaghut",
            "description": "يحكي فيلم الرعب الأخير هذا قصة رحلة امرأة تدعى عينون تريد إنقاذ نفسها من الضلال والسحر واللعنة كما وجدت عينون نفسها متورطة في تعاليم ضالة. فكيف سيتمكن باغاس وريني من إنقاذها وإعادتها إلى الطريق الصحيح؟",
            "poster": "https://i.ibb.co/8nWbnkyf/photo-5825733540996827420-y.jpg",
             "thumbnailUrl": "https://i.ibb.co/8nWbnkyf/photo-5825733540996827420-y.jpg",
            "release_date": "2025-06-20",
            "genre": "Mystery, Thriller, Drama, Psychological Horror",
            "director": "M. Night Shyamalan",
            "cast": "Yasmin Napier as Ainun",
            "embed_url": "https://vkvideo.ru/video_ext.php?oid=-231089883&id=456239019&hd=2&",
            "rating": "7.9/10",
            "duration": "PT1H42M"
        },
        {
            "id": 14,
            "title": "Snowpiercer (2013)",
            "description": "بعد تجربة فاشلة للتصدي للاحتباس الحراري، يحدث عصر جليدي يقضي على الحياة في الأرض، ولا ينجو سوى من يعيشون في قطار ضخم. يتزعم كيرتس ثورة من سكان ذيل القطار ضد الصفوة في المقدمة.",
            "poster": "https://i.ibb.co/wFWWWYTD/photo-5834902488719935587-w.jpg",
             "thumbnailUrl": "https://i.ibb.co/wFWWWYTD/photo-5834902488719935587-w.jpg",
            "release_date": "2013-08-01",
            "genre": "Science Fiction",
            "director": "Bong Joon-ho",
            "cast": "Chris Evans as Curtis Everett",
            "embed_url": "https://vkvideo.ru/video_ext.php?oid=-231089883&id=456239022&hd=2",
            "rating": "7.9/10",
            "duration": "PT2H2M"
        },
        {
            "id": 15,
            "title": "Flight Risk",
            "description": "طيار غامض يُكلف بنقل شاهد فيدرالي من ألاسكا، لكن الرحلة تتحول إلى صراع مميت حين يُكشف أن الطيار قاتل مأجور.",
            "poster": "https://i.ibb.co/zVN8s7qX/images.jpg",
             "thumbnailUrl": "https://i.ibb.co/zVN8s7qX/images.jpg",
            "release_date": "2025-01-24",
            "genre": "Action, Thriller",
            "director": "Mel Gibson",
            "cast": "Mark Wahlberg, Michelle Dockery, Topher Grace, Leah Remini, Paul Ben-Victor",
            "embed_url": "https://vkvideo.ru/video_ext.php?oid=-231089883&id=456239023&hd=2&",
            "rating": "7.9/10",
            "duration": "PT1H42M"
        },
        {
            "id": 16,
            "title": "The Informers",
            "description": "Set in 1983 Los Angeles, a group of morally lost individuals — wealthy youth, movie producers, rock stars, and criminals — navigate a world of excess, drugs, and emotional emptiness.",
            "poster": "https://i.ibb.co/N2WhgF4F/unnamed.jpg",
             "thumbnailUrl": "https://i.ibb.co/N2WhgF4F/unnamed.jpg",
            "release_date": "2008-04-18",
            "genre": "Drama, Crime",
            "director": "Gregor Jordan",
            "cast": "Billy Bob Thornton, Kim Basinger, Winona Ryder, Mickey Rourke, Amber Heard",
            "embed_url": "https://vkvideo.ru/video_ext.php?oid=-231089883&id=456239024&hd=2&",
            "rating": "5.0/10",
            "duration": "PT1H38M"
        },
        {
  "id": 17,
  "title": "Cruel Intentions (1999)",
  "description": "In an upscale New York prep school, wealthy step-siblings Sebastian and Kathryn make a bet: Sebastian must seduce the headmaster's daughter, Annette, who has vowed to remain chaste until marriage. As the game unfolds, true feelings, betrayal, and manipulation blur the lines between love and cruelty.",
  "poster": "https://i.ibb.co/Hpnf3NcL/images.jpg",
   "thumbnailUrl": "https://i.ibb.co/Hpnf3NcL/images.jpg",
  "release_date": "1999-03-05",
  "genre": "Drama, Romance",
  "director": "Roger Kumble",
  "cast": "Sarah Michelle Gellar as Kathryn, Ryan Phillippe as Sebastian, Reese Witherspoon as Annette, Selma Blair as Cecile",
  "embed_url": "https://vkvideo.ru/video_ext.php?oid=-231089883&id=456239029&hd=2&",
  "rating": "6.8/10",
  "duration": "PT1H37M"
},
{
  "id": 18,
  "title": "Female Workers: Romance at Work 3 (2023)",
  "description": "Yoo-ra, who is burdened by her family's financial problems, finally lands a job. However, the assistant manager takes advantage of her situation and offers money for a sexual relationship. Meanwhile, the female manager Hye-seon seduces the new employee Min-soo. Intense romantic entanglements unfold in this office drama.",
  "poster": "https://i.ibb.co/VpLcjPTQ/c4-HACOcv-Ks-WAa-NTsy-Ys1-Jzfw-XWi.webp",
  "release_date": "2023-11-25",
  "genre": "Romance, Drama, Softcore",
  "director": "Choi Jong-gyoo",
  "cast": "Yoo-ra, Hye-seon, Min-soo, Soo Hee, Lee Chae-dam, Hae Il, Woo Yeol, Yoon Taek-seung",
  "embed_url": "https://player.vimeo.com/video/1095323276?autoplay=0&title=0&byline=0&portrait=0",
  "rating": "N/A",
  "duration": "PT1H2M"
},
{
  "id": 19,
  "title": "Den of Thieves 2: Pantera (2025)",
  "description": "Big Nick, recently divorced and off-duty, follows master thief Donnie to Europe, where he infiltrates the Panther mafia. As a massive diamond exchange heist unfolds in France, loyalties are tested in a game of deception and violence.",
  "poster": "https://i.ibb.co/YFSQHdd9/MV5-BZGIy-YTI5-N2-Qt-Zm-Q5-ZC00-NDE4-LThh-YWMt-NGE5-Nj-I1-OGU2-M2-Nj-Xk-Ey-Xk-Fqc-Gc-V1.jpg",
   "thumbnailUrl": "https://i.ibb.co/YFSQHdd9/MV5-BZGIy-YTI5-N2-Qt-Zm-Q5-ZC00-NDE4-LThh-YWMt-NGE5-Nj-I1-OGU2-M2-Nj-Xk-Ey-Xk-Fqc-Gc-V1.jpg",
  "release_date": "2025-01-10",
  "genre": "Action, Crime, Thriller",
  "director": "Christian Gudegast",
  "cast": "Gerard Butler, O'Shea Jackson Jr., Evin Ahmad, Salvatore Esposito, Meadow Williams, Swen Temmel",
  "embed_url": "https://player.vimeo.com/video/1095363603?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479", 
  "rating": "6.3/10",
  "duration": "PT2H24M"
},
{
  "id": 20,
  "title": "Back in Action (2025)",
  "description": "Former CIA operatives Emily and Matt, now living undercover with their two children, are pulled back into espionage when their secret is blown. They must return to their spy lives to protect their family.",
  "poster": "https://i.ibb.co/k277HWcz/g-J4-KMv9dwk-Xg2-Iy-X5y-QVOu-BQh-Rno-W6-Iw-Jl-Yd8yrm-400x400.jpg",
  "thumbnailUrl": "https://i.ibb.co/k277HWcz/g-J4-KMv9dwk-Xg2-Iy-X5y-QVOu-BQh-Rno-W6-Iw-Jl-Yd8yrm-400x400.jpg",
  "release_date": "2025-01-17",
  "genre": "Action, Comedy",
  "director": "Seth Gordon",
  "cast": "Jamie Foxx, Cameron Diaz, Kyle Chandler, Glenn Close, Andrew Scott, McKenna Roberts, Rylan Jackson",
  "embed_url": "https://vkvideo.ru/video_ext.php?oid=-231089883&id=456239030&hd=2&",
  "rating": "6.3/10",
  "duration": "PT1H54M"
},
        {
  "id": 21,
  "title": "The Brutalist (2024)",
  "description": "A poignant exploration of displacement, art, and survival, The Brutalist follows a visionary Hungarian architect who flees Europe with his wife in the aftermath of World War II. Upon arriving in America, he struggles to rebuild his identity while grappling with the constraints of his past and the demands of a new world.",
  "poster": "https://i.ibb.co/CKg1rq93/fff.jpg",
  "thumbnailUrl": "https://i.ibb.co/CKg1rq93/fff.jpg",
  "release_date": "2024-12-15",
  "genre": "Drama, Historical",
  "director": "Brady Corbet",
  "cast": "Adrien Brody, Felicity Jones, Guy Pearce, Joe Alwyn, Alessandro Nivola",
  "embed_url": "https://vkvideo.ru/video_ext.php?oid=-231089883&id=456239032&hd=2&",
  "rating": "N/A",
  "duration": "PT2H5M"
},


    ];

    // سيتم ترتيب هذه المصفوفة عشوائيًا عند تحميل الصفحة وفي كل مرة نعود فيها للصفحة الرئيسية
    let moviesDataForPagination = [];

    // --- 4. Functions ---

    function openAdLink(cooldownDuration, type) {
        let lastClickTime;
        let setLastClickTime;

        if (type === 'movieCard') {
            lastClickTime = lastDirectLinkClickTimeMovieCard;
            setLastClickTime = (time) => lastDirectLinkClickTimeMovieCard = time;
        } else if (type === 'videoOverlay') {
            lastClickTime = lastDirectLinkClickTimeVideoOverlay;
            setLastClickTime = (time) => lastDirectLinkClickTimeVideoOverlay = time;
        } else if (type === 'movieDetailsPoster') {
            lastClickTime = lastDirectLinkClickTimeMovieCard; // Use same cooldown as movieCard
            setLastClickTime = (time) => lastDirectLinkClickTimeMovieCard = time;
        } else {
            console.error('Invalid ad type provided for openAdLink:', type);
            return false;
        }

        const currentTime = Date.now();
        if (currentTime - lastClickTime > cooldownDuration) {
            const newWindow = window.open(ADSTERRA_DIRECT_LINK_URL, '_blank');
            if (newWindow) {
                newWindow.focus();
                setLastClickTime(currentTime);
                console.log(`💰 [Ad Click - ${type}] Direct Link opened successfully.`);
                return true;
            } else {
                console.warn(`⚠️ [Ad Click - ${type}] Pop-up blocked or failed to open direct link. Ensure pop-ups are allowed.`);
                return false;
            }
        } else {
            const timeLeft = (cooldownDuration - (currentTime - lastClickTime)) / 1000;
            console.log(`⏳ [Ad Click - ${type}] Direct Link cooldown active. Not opening new tab. Time remaining: ${timeLeft.toFixed(1)}s`);
            return false;
        }
    }

    function createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <img data-src="${movie.poster}" alt="${movie.title}" class="lazyload">
            <h3>${movie.title}</h3>
        `;
        movieCard.addEventListener('click', () => {
            console.log(`⚡ [Interaction] Movie card clicked for ID: ${movie.id}`);
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
                        image.src = image.dataset.src;
                        image.classList.remove('lazyload');
                        observer.unobserve(image);
                    }
                });
            });

            lazyLoadImages.forEach(function(image) {
                imageObserver.observe(image);
            });
        } else {
            let lazyLoadImages = document.querySelectorAll('.lazyload');
            lazyLoadImages.forEach(function(image) {
                image.src = image.dataset.src;
            });
        }
        console.log('🖼️ [Lazy Load] Initialized IntersectionObserver for images.');
    }

    function displayMovies(moviesToDisplay, targetGridElement) {
        if (!targetGridElement) {
            console.error('❌ displayMovies: Target grid element is null or undefined.');
            return;
        }
        targetGridElement.innerHTML = '';

        if (moviesToDisplay.length === 0) {
            targetGridElement.innerHTML = '<p style="text-align: center; color: var(--text-muted);">لا توجد أفلام مطابقة للبحث أو مقترحة.</p>';
            console.log(`🎬 [Display] No movies to display in ${targetGridElement.id}.`);
            return;
        }

        moviesToDisplay.forEach(movie => {
            targetGridElement.appendChild(createMovieCard(movie));
        });
        console.log(`🎬 [Display] Displayed ${moviesToDisplay.length} movies in ${targetGridElement.id}.`);

        initializeLazyLoad();
    }

    function paginateMovies(moviesArray, page) {
        const startIndex = (page - 1) * moviesPerPage;
        const endIndex = startIndex + moviesPerPage;
        const paginatedMovies = moviesArray.slice(startIndex, endIndex);

        displayMovies(paginatedMovies, movieGrid);
        updatePaginationButtons(moviesArray.length);
        console.log(`➡️ [Pagination] Displaying page ${page}. Movies from index ${startIndex} to ${Math.min(endIndex, moviesArray.length)-1}.`);
    }

    function updatePaginationButtons(totalMovies) {
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = currentPage * moviesPerPage >= totalMovies;
        console.log(`🔄 [Pagination] Buttons updated. Current page: ${currentPage}, Total Movies: ${totalMovies}`);
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
            console.log(`🔍 [Search] Performed search for "${query}". Found ${filteredMovies.length} results.`);
        } else {
            filteredMovies = [...moviesData].sort(() => 0.5 - Math.random());
            if (sectionTitleElement) {
                sectionTitleElement.textContent = 'أحدث الأفلام';
            }
            console.log('🔍 [Search] Search query empty, showing all movies (randomized).');
        }
        currentPage = 1;
        moviesDataForPagination = filteredMovies;
        paginateMovies(moviesDataForPagination, currentPage);
    }

    function showMovieDetails(movieId) {
        console.log(`🔍 [Routing] Showing movie details for ID: ${movieId}`);
        const movie = moviesData.find(m => m.id === movieId);

        if (movie) {
            if (heroSection) heroSection.style.display = 'none';
            if (movieGridSection) movieGridSection.style.display = 'none';

            if (movieDetailsSection) movieDetailsSection.style.display = 'block';
            if (suggestedMoviesSection) suggestedMoviesSection.style.display = 'block';

            window.scrollTo({ top: 0, behavior: 'smooth' });
            console.log('[Routing] Scrolled to top.');

            document.getElementById('movie-details-title').textContent = movie.title;
            document.getElementById('movie-details-description').textContent = movie.description;
            // استخدام Date object لتنسيق التاريخ بشكل أفضل للعرض
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
                console.log(`[Details] Poster set for ${movie.title}`);
            }

            if (moviePlayer) {
                moviePlayer.src = '';
                if (videoLoadingSpinner) {
                    videoLoadingSpinner.style.display = 'block';
                    console.log('[Video Player] Loading spinner shown.');
                }

                setTimeout(() => {
                    moviePlayer.src = movie.embed_url;
                    console.log(`[Video Player] Final iframe src set to: ${movie.embed_url}`);
                }, 50);

                moviePlayer.onload = () => {
                    if (videoLoadingSpinner) {
                        videoLoadingSpinner.style.display = 'none';
                        console.log('[Video Player] Loading spinner hidden (iframe loaded).');
                    }
                    if (videoOverlay) {
                        videoOverlay.classList.remove('inactive');
                        videoOverlay.style.pointerEvents = 'auto';
                        console.log('[Video Overlay] Active and clickable after video loaded.');
                    }
                };
                moviePlayer.onerror = () => {
                    if (videoLoadingSpinner) {
                        videoLoadingSpinner.style.display = 'none';
                        console.warn('[Video Player] Iframe failed to load. Spinner hidden.');
                    }
                    if (videoOverlay) {
                        videoOverlay.classList.remove('inactive');
                        videoOverlay.style.pointerEvents = 'auto';
                        console.warn('[Video Overlay] Active even after iframe load error.');
                    }
                };
            }

            const newUrl = new URL(window.location.origin);
            newUrl.searchParams.set('view', 'details');
            newUrl.searchParams.set('id', movieId);
            history.pushState({ view: 'details', id: movieId }, movie.title, newUrl.toString());
            console.log(`🔗 [URL] URL updated to ${newUrl.toString()}`);

            updateMetaTags(movie);
            addJsonLdSchema(movie); // تم استدعاء الدالة هنا لتحديث الـ Schema
            displaySuggestedMovies(movieId);
            console.log(`✨ [Suggestions] Calling displaySuggestedMovies for ID: ${movieId}`);

        } else {
            console.error('❌ [Routing] Movie not found for ID:', movieId, 'Redirecting to home page.');
            showHomePage();
        }
    }

    function updateMetaTags(movie) {
        document.title = `${movie.title} - مشاهدة أونلاين`;
        document.querySelector('meta[name="description"]')?.setAttribute('content', movie.description);
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', movie.title);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', movie.description);
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', movie.poster);
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.href);
        document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'video.movie');
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', movie.title);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', movie.description);
        document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', movie.poster);
        console.log('📄 [SEO] Meta tags updated.');
    }

    function addJsonLdSchema(movie) {
        let formattedUploadDate;
        if (movie.release_date) {
            try {
                const date = new Date(movie.release_date);
                if (!isNaN(date.getTime())) {
                    formattedUploadDate = date.toISOString();
                } else {
                    console.warn(`⚠️ Invalid date format for release_date: ${movie.release_date}. Using current date for uploadDate.`);
                    formattedUploadDate = new Date().toISOString();
                }
            } catch (e) {
                console.warn(`⚠️ Error parsing release_date: ${movie.release_date}. Using current date for uploadDate.`);
                formattedUploadDate = new Date().toISOString();
            }
        } else {
            formattedUploadDate = new Date().toISOString();
        }

        const schema = {
            "@context": "http://schema.org",
            "@type": "VideoObject",
            "name": movie.title,
            "description": movie.description,
            "thumbnailUrl": movie.poster,
            "uploadDate": formattedUploadDate,
            "embedUrl": movie.embed_url,
            "duration": movie.duration,
            "contentUrl": movie.embed_url
        };

        if (movie.director && typeof movie.director === 'string' && movie.director.trim() !== '') {
            schema.director = {
                "@type": "Person",
                "name": movie.director.trim()
            };
        }
        if (movie.cast) {
            const castArray = Array.isArray(movie.cast) ? movie.cast : String(movie.cast).split(',').map(s => s.trim()).filter(s => s !== '');
            if (castArray.length > 0) {
                schema.actor = castArray.map(actor => ({
                    "@type": "Person",
                    "name": actor
                }));
            }
        }
        if (movie.genre) {
            const genreArray = Array.isArray(movie.genre) ? movie.genre : String(movie.genre).split(',').map(s => s.trim()).filter(s => s !== '');
            if (genreArray.length > 0) {
                schema.genre = genreArray;
            }
        }
        if (movie.rating && typeof movie.rating === 'string' && movie.rating.includes('/')) {
            const ratingValue = parseFloat(movie.rating.split('/')[0]);
            if (!isNaN(ratingValue)) {
                schema.aggregateRating = {
                    "@type": "AggregateRating",
                    "ratingValue": ratingValue.toFixed(1),
                    "bestRating": "10",
                    "ratingCount": "10000"
                };
            }
        }
        
        // إزالة أي سكربت JSON-LD قديم قبل إضافة الجديد
        let oldScript = document.querySelector('script[type="application/ld+json"]');
        if (oldScript) {
            oldScript.remove();
            console.log('📄 [SEO] Old JSON-LD schema removed.');
        }

        // إضافة السكربت الجديد
        let script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
        console.log('📄 [SEO] New JSON-LD schema added/updated.');
    }


    function displaySuggestedMovies(currentMovieId) {
        if (!suggestedMovieGrid) {
            console.error('❌ displaySuggestedMovies: suggestedMovieGrid element not found. Cannot display suggested movies.');
            return;
        }

        const otherMovies = moviesData.filter(movie => movie.id !== currentMovieId);
        const shuffled = otherMovies.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 15);

        if (selected.length === 0) {
            suggestedMovieGrid.innerHTML = '<p style="text-align: center; color: var(--text-muted);">لا توجد أفلام مقترحة حالياً.</p>';
            console.log('✨ [Suggestions] No suggested movies available after filtering.');
            return;
        }

        displayMovies(selected, suggestedMovieGrid);
        console.log(`✨ [Suggestions] Displayed ${selected.length} suggested movies in ${suggestedMovieGrid.id}.`);
    }

    function showHomePage() {
        console.log('🏠 [Routing] Showing home page.');
        if (movieDetailsSection) movieDetailsSection.style.display = 'none';
        if (suggestedMoviesSection) suggestedMoviesSection.style.display = 'none';

        if (heroSection) heroSection.style.display = 'flex';
        if (movieGridSection) movieGridSection.style.display = 'block';

        if (searchInput) searchInput.value = '';
        if (sectionTitleElement) sectionTitleElement.textContent = 'أحدث الأفلام';

        moviesDataForPagination = [...moviesData].sort(() => 0.5 - Math.random());
        paginateMovies(moviesDataForPagination, 1);

        if (videoOverlay) {
            videoOverlay.classList.add('inactive');
            videoOverlay.style.pointerEvents = 'none';
            console.log('[Video Overlay] Inactive on home page.');
        }
        if (videoLoadingSpinner) {
            videoLoadingSpinner.style.display = 'none';
        }
        if (moviePlayer) {
            moviePlayer.src = '';
            moviePlayer.onload = null;
            moviePlayer.onerror = null;
        }

        const newUrl = new URL(window.location.origin);
        history.pushState({ view: 'home' }, 'أفلام عربية - الصفحة الرئيسية', newUrl.toString());
        console.log(`🔗 [URL] URL updated to ${newUrl.toString()}`);

        document.title = 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية.');
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين');
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية.');
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.href);
        document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'website');
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', 'أفلام عربية - مشاهدة أفلام ومسلسلات أونلاين');
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية مترجمة أونلاين بجودة عالية.');

        let script = document.querySelector('script[type="application/ld+json"]');
        if (script) {
            script.remove();
            console.log('📄 [SEO] JSON-LD schema removed on home page.');
        }
    }

    // --- 5. Event Listeners ---
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('nav-open');
            console.log('📱 [Interaction] Menu toggle clicked.');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav && mainNav.classList.contains('nav-open')) {
                mainNav.classList.remove('nav-open');
                console.log('📱 [Interaction] Nav link clicked, menu closed.');
            }
        });
    });

    if (watchNowBtn && movieGridSection) {
        watchNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🎬 [Interaction] Watch Now button clicked.');
            movieGridSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', () => {
            console.log('🔙 [Interaction] Back to home button clicked.');
            showHomePage();
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
        console.log('🔍 [Event] Search button listener attached.');
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
                searchInput.blur();
            }
        });
        console.log('🔍 [Event] Search input keypress listener attached.');
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                paginateMovies(moviesDataForPagination, currentPage);
            }
            console.log(`⬅️ [Pagination] Previous page clicked. Current page: ${currentPage}`);
        });
    }
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(moviesDataForPagination.length / moviesPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                paginateMovies(moviesDataForPagination, currentPage);
            }
            console.log(`➡️ [Pagination] Next page clicked. Current page: ${currentPage}`);
        });
    }

    if (homeLogoLink) {
        homeLogoLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🏠 [Interaction] Home logo clicked.');
            showHomePage();
        });
    }

    if (movieDetailsPoster) {
        movieDetailsPoster.addEventListener('click', () => {
            console.log('🖼️ [Ad Click] Movie details poster clicked. Attempting to open Direct Link.');
            openAdLink(DIRECT_LINK_COOLDOWN_MOVIE_CARD, 'movieDetailsPoster');
        });
        console.log('[Event] Movie details poster click listener attached.');
    }

    if (videoOverlay) {
        videoOverlay.addEventListener('click', () => {
            console.log('⏯️ [Ad Click] Video overlay clicked. Attempting to open Direct Link.');
            const adOpened = openAdLink(DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY, 'videoOverlay');

            if (adOpened) {
                videoOverlay.style.pointerEvents = 'none';
                console.log(`[Video Overlay] Temporarily disabled clicks for ${DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY / 1000} seconds.`);
                setTimeout(() => {
                    videoOverlay.style.pointerEvents = 'auto';
                    console.log('[Video Overlay] Clicks re-enabled.');
                }, DIRECT_LINK_COOLDOWN_VIDEO_OVERLAY);
            }
        });
        console.log('[Video Overlay] Click listener attached for ad interaction (with cooldown logic).');
    }

    // --- 6. Initial Page Load Logic (Routing) ---
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    const idParam = urlParams.get('id');

    if (viewParam === 'details' && idParam) {
        const movieId = parseInt(idParam);
        if (!isNaN(movieId)) {
            console.log(`🚀 [Initial Load] Attempting to load movie details from URL: ID ${movieId}`);
            showMovieDetails(movieId);
        } else {
            console.warn('⚠️ [Initial Load] Invalid movie ID in URL. Showing home page.');
            showHomePage();
        }
    } else {
        console.log('🚀 [Initial Load] No specific view in URL. Showing home page.');
        showHomePage();
    }
});
