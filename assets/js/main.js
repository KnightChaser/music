// src/assets/js/main.js

import * as dom from "./dom.js";
import * as search from "./search.js";
import * as renderer from "./renderer.js";
import * as suggestions from "./suggestions.js";
import * as worldMap from "./worldMap.js";
import { langNames } from "./utils.js";

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

  // Render the artist nationality(origin) map (highcharts)
  const mapToggleBtn = document.getElementById("map-toggle");
  const mapContainer = document.getElementById("map-container");
  const mapDataEl = document.getElementById("map-data");

  if (mapToggleBtn && mapContainer && mapDataEl) {
    let mapInitialized = false;

    mapToggleBtn.addEventListener("click", () => {
      mapContainer.classList.toggle("hidden");

      // Lazy-initialize the map only when it's first shown
      if (!mapContainer.classList.contains("hidden") && !mapInitialized) {
        try {
          const data = JSON.parse(mapDataEl.textContent);
          if (data && data.length > 0) {
            worldMap.createMap("map-container", data);
            mapInitialized = true;
          } else {
            mapContainer.innerHTML =
              '<p class="text-center text-gray-500">No geographic data available to display map.</p>';
          }
        } catch (e) {
          console.error("Failed to parse or render map data:", e);
          mapContainer.innerHTML =
            '<p class="text-center text-red-500">Error loading map data.</p>';
        }
      }
    });
  }

  // Render the language distribution chart (highcharts)
  const langToggleBtn = document.getElementById("lang-toggle");
  const langContainer = document.getElementById("lang-container");
  let langInitialized = false;

  if (langToggleBtn && langContainer) {
    langToggleBtn.addEventListener("click", () => {
      // Show/hide the chart
      langContainer.classList.toggle("hidden");

      // Lazy-init the donut on first show
      if (!langContainer.classList.contains("hidden") && !langInitialized) {
        // Transform your existing languageCounts -> Highcharts data format
        const chartData = Object.entries(languageCounts).map(
          ([code, count]) => ({
            name: langNames[code]?.[0] || code, // Use the full name(e.g. "English") instead of code(e.g. "en")
            y: count,
          })
        );

        Highcharts.chart("lang-container", {
          chart: {
            type: "pie",
            backgroundColor: "#f9fafb",
          },
          title: { text: "Language Distribution of Songs" },
          subtitle: { text: "Count of songs by its language" },
          plotOptions: {
            pie: {
              innerSize: "50%", // donut hole
              allowPointSelect: true,
              cursor: "pointer",
              dataLabels: {
                enabled: true,
                format: "{point.name}: {point.y}",
              },
            },
          },
          series: [
            {
              name: "Songs",
              colorByPoint: true,
              data: chartData,
            },
          ],
        });

        langInitialized = true;
      }
    });
  }

  const yearToggleBtn = document.getElementById("year-toggle");
  const yearContainer = document.getElementById("year-container");
  let yearInitialized = false;

  if (yearToggleBtn && yearContainer) {
    yearToggleBtn.addEventListener("click", () => {
      yearContainer.classList.toggle("hidden");

      if (!yearContainer.classList.contains("hidden") && !yearInitialized) {
        // 1) build counts per year
        const yearCounts = allSongs.reduce((acc, song) => {
          const yr = new Date(song.release).getFullYear();
          if (yr && !isNaN(yr)) acc[yr] = (acc[yr] || 0) + 1;
          return acc;
        }, {});

        // 2) to Highcharts data: [ [timestamp, count], … ]
        const chartData = Object.entries(yearCounts)
          .map(([yr, cnt]) => [Date.UTC(+yr, 0, 1), cnt])
          .sort((a, b) => a[0] - b[0]);

        // 3) draw column chart
        Highcharts.chart("year-container", {
          chart: { type: "column", backgroundColor: "#f9fafb" },
          title: { text: "Songs Released Per Year" },
          xAxis: {
            type: "datetime",
            title: { text: "Year" },
            tickInterval: 365 * 24 * 3600 * 1000, // one year
          },
          yAxis: {
            title: { text: "Number of Songs" },
            allowDecimals: false,
          },
          series: [
            {
              name: "Songs",
              data: chartData,
              tooltip: { xDateFormat: "%Y", valueSuffix: " songs" },
            },
          ],
        });

        yearInitialized = true;
      }
    });
  }

  const tagToggleBtn = document.getElementById("tag-toggle");
  const tagContainer = document.getElementById("tag-container");
  let tagInitialized = false;

  if (tagToggleBtn && tagContainer) {
    tagToggleBtn.addEventListener("click", () => {
      tagContainer.classList.toggle("hidden");
      if (!tagContainer.classList.contains("hidden") && !tagInitialized) {
        // build word-cloud data from your tagCounts
        const cloudData = Object.entries(tagCounts).map(([tag, count]) => ({
          name: tag,
          weight: count,
        }));

        Highcharts.chart("tag-container", {
          chart: {
            type: "wordcloud",
            backgroundColor: "#f9fafb",
            height: 600, // match your container
          },
          title: { text: "Tag Cloud of Playlist" },
          plotOptions: {
            wordcloud: {
              gridSize: 4, // smaller grid => tighter packing
              minFontSize: 12, // floor size
              maxFontSize: 64, // ceiling size
              spiral: "rectangular", // denser layout
            },
          },
          series: [
            {
              type: "wordcloud",
              data: Object.entries(tagCounts).map(([tag, count]) => ({
                name: tag,
                // logarithmic weight to exaggerate differences at the top end:
                weight: Math.log(count + 1),
              })),
              rotation: { from: 0, to: 0 },
              shuffle: true,
            },
          ],
        });

        tagInitialized = true;
      }
    });
  }

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
