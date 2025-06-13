// src/search.json.js
module.exports = () => {
  // Eleventy makes the `search` data available as a parameter
  // If you used the YAML+index.js approach, Eleventy will inject it
  return JSON.stringify(search);
};

