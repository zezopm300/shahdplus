// استخراج معرف الفيلم من الرابط مثل: watch.html?id=12
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");

if (!movieId) {
  document.getElementById("movie-title").innerText = "لم يتم تحديد فيلم.";
  throw new Error("No movie ID provided in URL");
}

fetch("movies.json") // أو اسم ملف الـ JSON تبعك
  .then(response => response.json())
  .then(movies => {
    const movie = movies.find(m => m.id == movieId);

    if (!movie) {
      document.getElementById("movie-title").innerText = "الفيلم غير موجود.";
      return;
    }

    document.getElementById("movie-title").innerText = movie.title;
    document.getElementById("movie-description").innerText = movie.description;
    document.getElementById("video-source").src = movie.embed_url;

    // إعادة تحميل الفيديو بعد ضبط الرابط
    const player = videojs("player");
    player.src({ src: movie.embed_url, type: "video/mp4" });
    player.load();
    player.play();
  })
  .catch(error => {
    console.error("فشل في تحميل بيانات الفيلم:", error);
  });
