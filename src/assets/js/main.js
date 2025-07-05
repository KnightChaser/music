// src/assets/js/main.js

import * as dom from "./dom.js";
import * as search from "./search.js";
import * as renderer from "./renderer.js";
import * as suggestions from "./suggestions.js";

// --- STATE ---
let allSongs = [];
let filteredSongs = [];
let sortState = { key: "release", dir: -1 }; // These will be passed to the suggestions module
let tagCounts = {};
let artistCounts = {};
let languageCounts = {};
let sources = {};
let countsMap = {};

// --- APPLICATION LOGIC ---
function applySort() {
  filteredSongs.sort((a, b) => {
    let valA = a[sortState.key];
    let valB = b[sortState.key];

    if (sortState.key === "release") {
      valA = new Date(valA);
      valB = new Date(valB);
    } else {
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
    }
    return (valA < valB ? -1 : valA > valB ? 1 : 0) * sortState.dir;
  });
}

function doSearch() {
  const criteria = search.parseCriteria(dom.searchInput.value);
  filteredSongs = search.filterData(allSongs, criteria);
  applySort();
  renderer.renderTable(dom.tableBody, filteredSongs, tagCounts);
  renderer.updateCount(
    dom.countContainer,
    filteredSongs.length,
    allSongs.length
  );
  dom.suggestionsBox.style.display = "none"; // Hide suggestions after a search
}

// --- EVENT HANDLERS ---
function handleSortClick(e) {
  const th = e.currentTarget;
  const key = th.dataset.key;

  if (sortState.key === key) {
    sortState.dir *= -1;
  } else {
    sortState.key = key;
    sortState.dir = 1;
  }

  document
    .querySelectorAll("th.sortable")
    .forEach((h) => (h.style.fontWeight = "normal"));
  th.style.fontWeight = "bold";

  doSearch();
}

function handleTableClick(e) {
  const target = e.target;
  if (target.classList.contains("clickable") && target.dataset.field) {
    const { field, term } = target.dataset;
    const parts = dom.searchInput.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const filtered = parts.filter(
      (p) => !p.toLowerCase().startsWith(field + ":")
    );
    filtered.push(`${field}:${term}`);
    dom.searchInput.value = filtered.join(", ");
    doSearch();
  }
  if (target.classList.contains("copy-title")) {
    const text = target.textContent.trim();
    navigator.clipboard.writeText(text).then(() => {
      renderer.showToast(dom.toast);
    });
  }
}

// --- INITIALIZATION ---
async function init() {
  const response = await fetch("search.json");
  allSongs = await response.json();

  // Prepare data for the suggestions module
  tagCounts = allSongs
    .flatMap((d) => d.tags)
    .reduce((acc, t) => ((acc[t] = (acc[t] || 0) + 1), acc), {});
  artistCounts = allSongs.reduce(
    (acc, d) => ((acc[d.artist] = (acc[d.artist] || 0) + 1), acc),
    {}
  );
  languageCounts = allSongs.reduce(
    (acc, d) => (
      d.language && (acc[d.language] = (acc[d.language] || 0) + 1), acc
    ),
    {}
  );

  sources = {
    artist: [...new Set(allSongs.map((d) => d.artist))].sort(),
    title: [...new Set(allSongs.map((d) => d.title))].sort(),
    tags: [...new Set(allSongs.flatMap((d) => d.tags || []))].sort(),
    language: [
      ...new Set(allSongs.map((d) => d.language).filter(Boolean)),
    ].sort(),
    note: [...new Set(allSongs.map((d) => d.note).filter(Boolean))].sort(),
  };
  countsMap = {
    artist: artistCounts,
    tags: tagCounts,
    language: languageCounts,
  };

  // Initial render
  doSearch();

  // Setup event listeners and modules
  dom.searchInput.addEventListener("input", doSearch);
  dom.clearButton.addEventListener("click", () => {
    dom.searchInput.value = "";
    doSearch();
    dom.searchInput.focus();
  });
  dom.resultsTable.querySelector("thead").addEventListener("click", (e) => {
    const sorter = e.target.closest("th.sortable");
    if (sorter) handleSortClick({ currentTarget: sorter });
  });
  dom.tableBody.addEventListener("click", handleTableClick);

  // Setup suggestions
  suggestions.setup({
    inputEl: dom.searchInput,
    suggestionsEl: dom.suggestionsBox,
    dataSources: sources,
    dataCounts: countsMap,
    onSelect: doSearch,
  });

  // Back to top button logic
  window.addEventListener("scroll", () => {
    dom.backToTopButton.classList.toggle("opacity-0", window.scrollY <= 300);
    dom.backToTopButton.classList.toggle(
      "pointer-events-none",
      window.scrollY <= 300
    );
  });
  dom.backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

document.addEventListener("DOMContentLoaded", init);
