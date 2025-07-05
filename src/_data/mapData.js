// src/_data/mapData.js

// This file aggregates song counts by country for the world map.
module.exports = function () {
  try {
    const allSongs = require("./search.js");

    if (!allSongs || allSongs.length === 0) {
      return [];
    }

    const countsByCountry = allSongs.reduce((acc, song) => {
      if (song.nationality) {
        const countryCode = song.nationality.toLowerCase();
        acc[countryCode] = (acc[countryCode] || 0) + 1;
      }
      return acc;
    }, {});

    // Highcharts map data format is an array of [key, value] pairs
    // e.g., [['ca', 2], ['us', 15]]
    return Object.entries(countsByCountry);
  } catch (e) {
    console.error("Could not generate mapData. Is search.js populated?", e);
    return [];
  }
};
