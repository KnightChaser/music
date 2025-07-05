// src/_data/search.js
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const musicDir = path.join(__dirname, "music");
const files = fs
  .readdirSync(musicDir)
  .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));

module.exports = files.flatMap((file) => {
  const artist = path.basename(file, path.extname(file));
  const contents = fs.readFileSync(path.join(musicDir, file), "utf8");
  const artistData = yaml.load(contents);

  // Get the songs array, default to empty array if not present
  const songs = artistData.songs || [];

  if (!Array.isArray(songs)) {
    throw new Error(
      `Expected an array of songs in ${file}, got ${typeof songs}`
    );
  }

  songs.forEach((song) => {
    console.log(`Processing music data: ${song.title} by ${artist}`);
    if (!Array.isArray(song.tags)) {
      // Skip songs without tags
      return;
    }

    // Song tags must not contain uppercase letters
    song.tags.forEach((tag) => {
      if (/[A-Z]/.test(tag)) {
        throw new Error(
          `Invalid tag "${tag}" in file "${file}" for song "${song.title}".\n` +
            `→ Tags must be all lowercase for consistency.`
        );
      }
    });
  });

  return songs.map((song) => ({
    artist,
    nationality: artistData.nationality, // Artist's nationality
    ...song,
  }));
});
