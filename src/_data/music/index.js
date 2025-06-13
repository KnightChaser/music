// src/_data/music/index.js
const fs   = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const dir      = __dirname;       // points to src/_data/music
const files    = fs.readdirSync(dir)
                   .filter(f => f.endsWith(".yml") || f.endsWith(".yaml"));

const music    = {};
for (let file of files) {
  const artist = path.basename(file, path.extname(file));
  const contents = fs.readFileSync(path.join(dir, file), "utf8");
  music[artist]  = yaml.load(contents);
}

module.exports = music;

