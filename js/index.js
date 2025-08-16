// Global variables
const elements = {
  carousel: document.getElementById("carousel-track"),
  grid: document.getElementById("book-grid"),
  latest: document.getElementById("latest-container"),
  loadMoreBtn: document.getElementById("load-more"),
};

let visibleCards = window.innerWidth <= 480 ? 1 : 3;
let latestIndex = 0;
let slideIndex = 0;
let carouselBooks = []; // processed for carousel
let rawBooks = []; // all raw books
let rawForCarousel = []; // raw carousel books

// Event Listeners for the carousel
window.addEventListener("resize", () => {
  visibleCards = window.innerWidth <= 480 ? 1 : 3;
  updateCarousel();
});

document.querySelector(".next").onclick = () => {
  slideIndex = (slideIndex + 1) % carouselBooks.length;
  updateCarousel();
};

document.querySelector(".prev").onclick = () => {
  slideIndex = (slideIndex - 1 + carouselBooks.length) % carouselBooks.length;
  updateCarousel();
};

elements.loadMoreBtn.addEventListener("click", loadMoreBooks);

// Fetching from json
async function fetchBooks() {
  try {
    const res = await fetch("../data/books.json");
    return await res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

// Creating book cards for each section
function createBookCard(book, type, rawBook = null) {
  const card = document.createElement("div");
  card.className = `book-card ${type}`;

  const templates = {
    carousel: `
      <div class="carousel-rec"></div>
      <img src="${book.image}" alt="book cover" />
      <div class="carousel-text">
        <h3>${book.title}</h3>
        <p>${book.description}</p>
        <p class="genres">${book.genre}</p>
        <button class="now-read">Now Read!</button>
      </div>
    `,
    grid: `<img src="${book.image}" alt="book cover" />`,
    latest: `
      <div class="latest-rec"></div>
      <div class="latest-info">
        <img src="${book.image}" alt="book cover" class="latest-img"/>
        <div class="latest-text">
          <p class="title">${book.title}</p>
          <p class="author">${book.author}</p>
          <div class="stars"></div>
          <button class="more btn">MORE</button>
        </div>
      </div>
    `,
  };

  card.innerHTML = templates[type];

  // Rating stars logic
  if (type === "latest") {
    const starsContainer = card.querySelector(".stars");
    const rating = book.rating;

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
  }

  // Event listeners for book.html
  card
    .querySelector(
      type === "grid"
        ? "img"
        : `button.${type === "carousel" ? "now-read" : "more"}`
    )
    ?.addEventListener("click", (e) => {
      if (type !== "grid") e.stopPropagation();
      localStorage.setItem("selectedBook", JSON.stringify(rawBook));
      window.location.href = "book.html";
    });

  return card;
}

// Rendering books
function renderBooks(books, container, type, rawBooksForStorage = null) {
  container.innerHTML = "";
  books.forEach((book, i) => {
    const raw = rawBooksForStorage[i];
    container.appendChild(createBookCard(book, type, raw));
  });
}

// Update carousel function
function updateCarousel() {
  const cardsToShow = [];
  const rawToStore = [];

  for (let i = 0; i < visibleCards; i++) {
    const index = (slideIndex + i) % carouselBooks.length;
    cardsToShow.push(carouselBooks[index]);
    rawToStore.push(rawForCarousel[index]);
  }

  renderBooks(cardsToShow, elements.carousel, "carousel", rawToStore);
}

// Load more button logic
async function loadMoreBooks() {
  const newRaw = rawBooks.slice(latestIndex, latestIndex + 4);

  newRaw.forEach((book, i) => {
    const card = createBookCard(book, "latest", newRaw[i]);
    elements.latest.appendChild(card);
  });

  latestIndex += newRaw.length;

  if (latestIndex >= rawBooks.length) {
    elements.loadMoreBtn.classList.add("invisible");
  }
}

async function init() {
  rawBooks = await fetchBooks();

  // Carousel
  rawForCarousel = rawBooks.filter(
    (b) => b.title?.trim().split(/\s+/).length <= 3
  );
  carouselBooks = rawForCarousel.map((b) => ({
    ...b,
    description: b.description?.slice(0, 150) || "No description available",
  }));

  updateCarousel();

  // Grid
  const rawGrid = rawBooks.slice(3, window.innerWidth <= 480 ? 9 : 13);
  renderBooks(rawGrid, elements.grid, "grid", rawGrid);

  // Latest
  const rawLatest = rawBooks.slice(0, 4);
  renderBooks(rawLatest, elements.latest, "latest", rawLatest);
  latestIndex = 4;
}

const genreSearchInput = document.getElementById("categories-search");
const genreSearchResults = document.getElementById("categories-results");

genreSearchInput.addEventListener("input", () => {
  const query = genreSearchInput.value.trim().toLowerCase();
  genreSearchResults.innerHTML = "";

  if (!query) {
    genreSearchResults.classList.remove("active");
    return;
  }

  // Get unique genres from rawBooks
  const genres = [...new Set(rawBooks.map((b) => b.genre).filter(Boolean))];

  // Filter genres that match the query
  const filtered = genres.filter((g) => g.toLowerCase().includes(query));

  filtered.forEach((genre) => {
    const div = document.createElement("div");
    div.className = "search-result";
    div.textContent = genre;

    div.addEventListener("click", () => {
      window.location.href = `categories.html?genre=${encodeURIComponent(
        genre
      )}`;
    });

    genreSearchResults.appendChild(div);
  });

  if (filtered.length > 0) {
    genreSearchResults.classList.add("active");
  } else {
    genreSearchResults.classList.remove("active");
  }
});

// Optional: hide results when clicking outside
document.addEventListener("click", (e) => {
  if (!genreSearchResults.contains(e.target) && e.target !== genreSearchInput) {
    genreSearchResults.classList.remove("active");
  }
});

init();
