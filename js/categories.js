// Global variables
const latestContainer = document.getElementById("latest-container");
const loadMoreBtn = document.getElementById("load-more");
const dropdownText = document.getElementById("dropdown-text");
const categoryDropdown = document.querySelector(".category-dropdown");

let rawBooks = [];
let filteredBooks = [];
let latestIndex = 0;
let allGenres = [];

// Fetch all books
async function fetchBooks() {
  try {
    const res = await fetch("../data/books.json");
    return await res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

// Create latest-style book card
function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card latest";

  card.innerHTML = `
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
  `;

  const starsContainer = card.querySelector(".stars");
  const rating = book.rating || 0;
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

  card.querySelector(".more")?.addEventListener("click", () => {
    localStorage.setItem("selectedBook", JSON.stringify(book));
    window.location.href = "book.html";
  });

  return card;
}

// Render books (8 initially, then 4 per load)
function renderBooks(initial = false) {
  const count = initial ? 8 : 4;
  const newBooks = filteredBooks.slice(latestIndex, latestIndex + count);
  newBooks.forEach((book) => latestContainer.appendChild(createBookCard(book)));
  latestIndex += newBooks.length;

  loadMoreBtn.style.display =
    latestIndex >= filteredBooks.length ? "none" : "block";
}

// Load more button
loadMoreBtn.addEventListener("click", () => renderBooks(false));

// Filter books by genre
function filterByGenre(genre) {
  filteredBooks =
    genre === "All"
      ? rawBooks
      : rawBooks.filter((book) =>
          book.genre?.toLowerCase().includes(genre.toLowerCase())
        );
  latestIndex = 0;
  latestContainer.innerHTML = "";
  renderBooks(true);
}

// Create the dropdown list (JS only toggles active class)
function createDropdownList() {
  const list = document.createElement("div");
  list.className = "dropdown-list";

  allGenres.forEach((genre) => {
    const item = document.createElement("div");
    item.className = "dropdown-item";
    item.textContent = genre;
    item.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent parent toggle
      dropdownText.textContent = genre;
      filterByGenre(genre);
      list.classList.remove("active");
    });
    list.appendChild(item);
  });

  categoryDropdown.appendChild(list);

  // Toggle dropdown when clicking parent
  categoryDropdown.addEventListener("click", () => {
    list.classList.toggle("active");
  });

  // Close dropdown if clicked outside
  document.addEventListener("click", (e) => {
    if (!categoryDropdown.contains(e.target)) {
      list.classList.remove("active");
    }
  });
}

// Initialize
async function init() {
  rawBooks = await fetchBooks();

  // Get all unique genres
  const genreSet = new Set();
  rawBooks.forEach((b) => {
    if (b.genre) genreSet.add(b.genre);
  });
  allGenres = ["All", ...Array.from(genreSet)];

  // Create dropdown list
  createDropdownList();

  // Get genre from URL (optional)
  const params = new URLSearchParams(window.location.search);
  const urlGenre = params.get("genre") || "All";
  dropdownText.textContent = urlGenre;
  filterByGenre(urlGenre);
}

init();
