// src/assets/js/search.js

import { fuzzyMatch } from "./utils.js";

export function parseCriteria(str) {
  return str
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.includes(":"))
    .reduce((acc, part) => {
      const [key, ...rest] = part.split(":");
      const val = rest.join(":").trim().toLowerCase();
      if (key && val) acc[key.trim().toLowerCase()] = val;
      return acc;
    }, {});
}

export function filterData(data, criteria) {
  return data.filter((item) => {
    return Object.entries(criteria).every(([key, value]) => {
      const needle = value.trim();
      if (!needle) return true;

      switch (key) {
        case "artist":
          return fuzzyMatch(needle, item.artist);
        case "title":
          return fuzzyMatch(needle, item.title);
        case "release":
          return fuzzyMatch(needle, item.release);
        case "tags":
          return item.tags && item.tags.some((t) => fuzzyMatch(needle, t));
        case "note":
          return fuzzyMatch(needle, item.note || "");
        case "language":
          return item.language && item.language.toLowerCase() === needle;
        default:
          return false;
      }
    });
  });
}
