// src/assets/js/renderer.js

import { langEmoji, langNames, createTagsHtml } from "./utils.js";

function createListenHtml(listenEntries = []) {
  return listenEntries
    .map((entry) => {
      const key = Object.keys(entry)[0];
      const url = entry[key];
      let emoji = "",
        bg = "",
        color = "#000",
        hover = "";

      if (key === "ORG") {
        emoji = "🎧";
        bg = "#e0e0e0";
        hover = "Listen to the original song";
      } else if (key.startsWith("RX")) {
        emoji = "🔀";
        bg = "#e0f7fa";
        color = "#006064";
        hover = `Listen to the remix version${
          key.includes("(") ? " (" + key.match(/\((.*)\)/)[1] + ")" : ""
        }`;
      } else if (key === "NCR") {
        emoji = "⚡";
        bg = "#fff8e1";
        color = "#ff6f00";
        hover = "Listen to the nightcore version";
      }

      return `
          <span class="relative inline-block group">
            <a href="${url}" class="rounded px-2 py-1 font-bold text-sm transition-colors group-hover:bg-blue-300 cursor-pointer clickable" style="background:${bg}; color:${color};" target="_blank" rel="noopener noreferrer">
              ${key} ${emoji}
            </a>
            <div class="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 px-4 w-max max-w-sm whitespace-pre-line text-center z-10">${hover}</div>
          </span>`;
    })
    .join(" ");
}

function createLanguageBadge(lang = "") {
  if (!lang) return "";
  const emoji = langEmoji[lang] || "";
  const primaryName = (langNames[lang] && langNames[lang][0]) || "";
  const secondaryName = (langNames[lang] && langNames[lang][1]) || primaryName;
  const tooltipText = `${emoji} ${primaryName} ${
    lang !== "en" ? `(${secondaryName})` : ""
  } (${lang})`;

  return `
      <span class="relative inline-block group">
        <span class="clickable inline-block bg-blue-100 rounded px-2 py-1 font-bold hover:bg-blue-200 cursor-pointer transition-colors lang-badge" data-field="language" data-term="${lang}">
          ${lang}${emoji}
        </span>
        <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block px-2 py-1 text-sm text-white bg-gray-800 rounded whitespace-pre-line text-center z-10">${tooltipText}</div>
      </span>`;
}

export function renderTable(tableBody, data, tagCounts) {
  if (!data.length) {
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4">No matches found</td></tr>`;
    return;
  }

  const rowsHtml = data
    .map((item) => {
      const releaseDate = new Date(item.release);
      const now = new Date();
      const diffDays = Math.floor((now - releaseDate) / (1000 * 60 * 60 * 24));
      const diffYears = (diffDays / 365.25).toFixed(2);
      const releaseTooltip = `${diffDays} days ago\n(${diffYears} years ago)`;

      return `
            <tr>
              <td class="px-6 py-4 text-center">
                <span class="clickable inline-block bg-blue-100 rounded px-2 py-1 font-bold hover:bg-blue-200 cursor-pointer transition-colors" data-field="artist" data-term="${
                  item.artist
                }">${item.artist}</span>
              </td>
              <td class="px-6 py-4 text-center align-middle">
                <div class="text-xl font-semibold copy-title cursor-pointer transition-transform duration-150 hover:scale-110" title="Click to copy">${
                  item.title
                }</div>
                <div class="mt-2 flex flex-col items-center space-y-1">${createListenHtml(
                  item.listen
                )}</div>
              </td>
              <td class="px-6 py-4 text-center whitespace-nowrap">
                <span class="relative inline-block group cursor-default">
                  <span>${item.release}</span>
                  <div class="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 whitespace-pre-line text-center z-10 w-max px-2">${releaseTooltip}</div>
                </span>
              </td>
              <td class="px-6 py-4 text-left">${createTagsHtml(
                item.tags,
                tagCounts
              )}</td>
              <td class="px-6 py-4 text-left">${item.note || "N/A"}</td>
              <td class="px-6 py-4 text-center">${createLanguageBadge(
                item.language
              )}</td>
            </tr>`;
    })
    .join("");

  tableBody.innerHTML = rowsHtml;
}

export function updateCount(countEl, currentCount, totalCount) {
  countEl.textContent = `${currentCount} / ${totalCount} songs shown`;
}

export function showToast(toastEl) {
  toastEl.classList.remove("hidden");
  setTimeout(() => toastEl.classList.add("hidden"), 2000);
}
