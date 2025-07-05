// src/assets/js/suggestions.js

import { fuzzyMatch } from "./utils.js";

// --- Module-level state and variables ---
let searchInput;
let suggestionsBox;
let sources;
let countsMap;
let onSelectCallback; // This will be the doSearch function from main.js

let selectedIndex = -1;

/**
 * Renders the list of suggestion items into the suggestions box.
 * @param {Array<string>} matches - The array of suggestion strings.
 * @param {string} field - The field being searched (e.g., 'artist').
 * @param {string} term - The search term used to find matches.
 */
function render(matches, field, term) {
  if (!matches.length) {
    suggestionsBox.style.display = "none";
    return;
  }

  const counts = countsMap[field] || {};
  // Escape user input for use in regex
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedTerm})`, "ig");

  suggestionsBox.innerHTML = matches
    .map((value, i) => {
      // Wrap the matched substring in <strong> for highlighting
      const highlightedValue = value.replace(regex, "<strong>$1</strong>");

      return `
            <div
                data-val="${field}:${value}"
                data-index="${i}"
                tabindex="0"
                class="flex justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
                <span><strong>${field}:</strong> ${highlightedValue}</span>
                <span class="ml-2 text-gray-500">(${counts[value] || 0})</span>
            </div>
        `;
    })
    .join("");

  selectedIndex = -1; // Reset selection
  suggestionsBox.style.display = "block";
}

// Parses the input, finds matching suggestions, and calls the renderer.
function update() {
  const rawValue = searchInput.value;
  const lastSegment = rawValue.includes(",")
    ? rawValue.slice(rawValue.lastIndexOf(",") + 1).trim()
    : rawValue.trim();

  const match = lastSegment.match(/^(\w+):\s*([^,]*)$/);

  if (!match) {
    suggestionsBox.style.display = "none";
    return;
  }

  const field = match[1].toLowerCase();
  const term = match[2].toLowerCase();
  const suggestionsSource = sources[field] || [];
  const counts = countsMap[field] || {};

  if (!term) {
    suggestionsBox.style.display = "none";
    return;
  }

  const matches = suggestionsSource
    .filter((v) => fuzzyMatch(term, v))
    .sort((a, b) => (counts[b] || 0) - (counts[a] || 0) || a.localeCompare(b))
    .slice(0, 50); // Limit to 50 suggestions

  render(matches, field, term);
}

/**
 * Handles keyboard navigation (Up, Down, Enter) within the suggestions list.
 * @param {KeyboardEvent} e - The keydown event.
 */
function handleKeyDown(e) {
  const items = Array.from(suggestionsBox.children);
  if (!items.length || suggestionsBox.style.display !== "block") return;

  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    items[selectedIndex]?.classList.remove("bg-gray-200"); // Deselect previous

    if (e.key === "ArrowDown") {
      selectedIndex = (selectedIndex + 1) % items.length;
    } else if (e.key === "ArrowUp") {
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
    }

    const selectedItem = items[selectedIndex];
    selectedItem.classList.add("bg-gray-200");
    selectedItem.scrollIntoView({ block: "nearest" });
  } else if (e.key === "Enter" && selectedIndex > -1) {
    e.preventDefault();
    items[selectedIndex].click(); // Simulate click on the selected item
  } else if (e.key === "Escape") {
    suggestionsBox.style.display = "none";
  }
}

/**
 * Handles clicks on a suggestion item.
 * @param {MouseEvent} e - The click event.
 */
function handleClick(e) {
  const suggestionItem = e.target.closest("div[data-val]");
  if (!suggestionItem) return;

  const value = suggestionItem.dataset.val;
  const parts = searchInput.value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const [field] = value.split(":");

  // Remove any existing criterion for the same field
  const filteredParts = parts.filter(
    (p) => !p.toLowerCase().startsWith(field + ":")
  );

  // Add the new criterion
  searchInput.value =
    filteredParts.join(", ") +
    (filteredParts.length ? ", " : "") +
    value +
    ", ";

  onSelectCallback(); // Trigger the main search function
  searchInput.focus();
}

/**
 * Initializes the suggestions module and sets up event listeners.
 * @param {object} config - The configuration object.
 * @param {HTMLInputElement} config.inputEl - The search input element.
 * @param {HTMLDivElement} config.suggestionsEl - The suggestions container element.
 * @param {object} config.dataSources - Object mapping fields to arrays of possible values.
 * @param {object} config.dataCounts - Object mapping fields to their count maps.
 * @param {function} config.onSelect - The callback function to run after a selection.
 */
export function setup(config) {
  searchInput = config.inputEl;
  suggestionsBox = config.suggestionsEl;
  sources = config.dataSources;
  countsMap = config.dataCounts;
  onSelectCallback = config.onSelect;

  searchInput.addEventListener("input", update);
  searchInput.addEventListener("keydown", handleKeyDown);
  suggestionsBox.addEventListener("click", handleClick);

  // Hide suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = "none";
    }
  });
}
