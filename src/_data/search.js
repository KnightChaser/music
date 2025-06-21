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
    const songs = yaml.load(fs.readFileSync(path.join(musicDir, file), "utf8"));
    return songs.map((song) => ({ artist, ...song }));
});
