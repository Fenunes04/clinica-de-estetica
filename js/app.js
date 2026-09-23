document.addEventListener("DOMContentLoaded", () => {
  renderFilterChips();
  renderMenu();

  const searchInput = document.getElementById("menu-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => setMenuSearch(e.target.value));
  }
});
