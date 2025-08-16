// Mobile menu
const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");
const closeBtn = document.getElementById("closeBtn");

burgerBtn.addEventListener("click", () => {
  mobileMenu.classList.add("open");
});

closeBtn.addEventListener("click", () => {
  mobileMenu.classList.remove("open");
});

// Sticky header
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  header.classList.toggle("sticky", window.scrollY > 0);
});

// Search
const searchButton = document.querySelector(".search");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

searchButton.addEventListener("click", (e) => {
  if (e.target === searchInput) return;

  e.preventDefault();

  searchInput.classList.toggle("active");
  searchButton.classList.toggle("active");

  if (searchInput.classList.contains("active")) {
    searchInput.focus();
  } else {
    searchInput.value = "";
    searchResults.classList.remove("active");
  }
});

// Fetch JSON books
async function fetchBooks() {
  try {
    const res = await fetch("../data/books.json");
    return await res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim().toLowerCase();
  searchResults.innerHTML = "";

  if (!query) {
    searchResults.classList.remove("active");
    return;
  }

  const books = await fetchBooks();

  const filteredBooks = books
    .filter(
      (book) =>
        book.title.toLowerCase().startsWith(query) ||
        book.author.toLowerCase().startsWith(query) ||
        (book.description && book.description.toLowerCase().includes(query))
    )
    .slice(0, 5);

  if (filteredBooks.length === 0) {
    searchResults.classList.remove("active");
    return;
  }

  filteredBooks.forEach((book) => {
    const item = document.createElement("div");
    item.className = "search-result-item";

    item.innerHTML = `
      <img src="${book.image}" alt="${book.title}" />
      <div class="search-result-info">
        <div class="search-result-title">${book.title}</div>
        <div class="search-result-author">${book.author}</div>
        ${
          book.description
            ? `<div class="search-result-desc">${book.description.slice(
                0,
                70
              )}...</div>`
            : ""
        }
      </div>
    `;

    item.addEventListener("click", () => {
      localStorage.setItem("selectedBook", JSON.stringify(book));
      window.location.href = "book.html";
    });

    searchResults.appendChild(item);
  });

  searchResults.classList.add("active");
});

// Close results if click outside
document.addEventListener("click", (e) => {
  if (!searchResults.contains(e.target) && e.target !== searchInput) {
    searchResults.classList.remove("active");
  }
});
