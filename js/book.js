document.addEventListener("DOMContentLoaded", () => {
  const bookData = JSON.parse(localStorage.getItem("selectedBook"));

  if (!bookData) {
    document.querySelector("main").innerHTML = "<p>No book selected.</p>";
    return;
  }

  // Set basic fields
  document.getElementById("book-title").textContent = bookData.title;
  document.getElementById("book-author").textContent = bookData.author;
  document.getElementById("book-release").textContent = bookData.releaseDate;
  document.getElementById("book-genre").textContent = bookData.genre;
  document.getElementById("book-description").textContent =
    bookData.description;
  document.getElementById("book-cover").src = bookData.image;

  // Render star rating
  const starsContainer = document.querySelector(".stars");
  const rating = Math.round(bookData.rating || 0); // fallback to 0 if undefined

  for (let i = 0; i < 5; i++) {
    const starImg = document.createElement("img");
    starImg.src =
      i < rating
        ? "./assets/icons/star-yellow.png"
        : "./assets/icons/star-black.png";
    starImg.alt = i < rating ? "Filled star" : "Empty star";
    starImg.classList.add("star");
    starsContainer.appendChild(starImg);
  }

  // Back button functionality
  document.querySelector(".back-btn").addEventListener("click", () => {
    window.history.back();
  });
});
