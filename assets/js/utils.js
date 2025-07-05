// src/assets/js/utils.js

export const langEmoji = {
  en: "🇺🇸",
  pt: "🇵🇹",
  ja: "🇯🇵",
  es: "🇪🇸",
  fr: "🇫🇷",
  ko: "🇰🇷",
  ru: "🇷🇺",
  zh: "🇨🇳",
  de: "🇩🇪",
  sv: "🇸🇪",
  th: "🇹🇭",
  cn: "🇨🇳",
  vn: "🇻🇳",
  none: "💭",
};

export const langNames = {
  en: ["English"],
  pt: ["Português", "Portuguese"],
  ja: ["日本語", "Japanese"],
  es: ["Español", "Spanish"],
  fr: ["Français", "French"],
  ko: ["한국어", "Korean"],
  ru: ["Русский", "Russian"],
  zh: ["中文", "Chinese"],
  de: ["Deutsch", "German"],
  sv: ["Svenska", "Swedish"],
  th: ["ไทย", "Thai"],
  cn: ["中文", "Chinese"],
  vn: ["Tiếng Việt", "Vietnamese"],
  none: ["None", "No specific language"],
};

// Fuzzy matching function (very cheap)
export function fuzzyMatch(pattern, text) {
  pattern = pattern.toLowerCase();
  text = String(text).toLowerCase(); // Ensure text is a string
  let i = 0,
    j = 0;
  while (i < pattern.length && j < text.length) {
    if (pattern[i] === text[j]) i++;
    j++;
  }
  return i === pattern.length;
}

// A helper for the renderer to avoid duplicating this logic
export function createTagsHtml(tags, tagCounts) {
  if (!tags || tags.length === 0) return "";
  return tags
    .slice()
    .sort()
    .map(
      (t) =>
        `<span class="clickable inline-block bg-blue-100 rounded px-2 py-1 font-bold hover:bg-blue-200 cursor-pointer transition-colors" data-field="tags" data-term="${t}" style="margin-right:0.25rem; margin-bottom:0.15rem;">#${t} (${
          tagCounts[t] || 0
        })</span>`
    )
    .join(" ");
}
