const params = new URLSearchParams(window.location.search);
const id = params.get("id");

fetch("movies.json")
  .then((res) => res.json())
  .then((data) => {
    const movie = data.find((m) => m.id == id);
    if (!movie) {
      document.body.innerHTML = "<h2>الفيلم غير موجود</h2>";
      return;
    }

    document.title = `مشاهدة ${movie.title} مترجم`;
    document.getElementById("title").textContent = movie.title;
    document.getElementById("description").textContent = movie.description;
    document.getElementById("thumbnail").src = movie.thumbnail;
    document.getElementById("metaDesc").content = movie.description;

    document.getElementById("player").innerHTML = `
      <video controls poster="${movie.thumbnail}" width="100%" height="500">
        <source src="${movie.video_url}" type="video/mp4">
      </video>
    `;

    const ld = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": movie.title,
      "description": movie.description,
      "thumbnailUrl": movie.thumbnail,
      "uploadDate": "2025-07-16",
      "contentUrl": movie.video_url,
      "embedUrl": `https://shahidplus.online/watch.html?id=${movie.id}`,
      "publisher": {
        "@type": "Organization",
        "name": "Shahid Plus",
        "logo": {
          "@type": "ImageObject",
          "url": "https://shahidplus.online/logo.png"
        }
      }
    };

    document.getElementById("structured-data").textContent = JSON.stringify(ld);
  });
