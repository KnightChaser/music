// .eleventy.js
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addNunjucksFilter("jsonify", (data) => {
    return JSON.stringify(data, null, 2);
  });

  // --- PASSTHROUGH FILE COPY ---

  // 1. A single, simple rule for all assets.
  // This copies the entire contents of `src/assets` to `_site/assets`.
  eleventyConfig.addPassthroughCopy("src/assets");

  // 2. A single, consolidated rule for all vendor files from node_modules.
  eleventyConfig.addPassthroughCopy({
    "node_modules/flowbite/dist/flowbite.min.js":
      "assets/flowbite/flowbite.min.js",
    "node_modules/highcharts/highcharts.js": "assets/highcharts/highcharts.js",
    "node_modules/highcharts/modules/map.js": "assets/highcharts/map.js",
    "node_modules/highcharts/mapdata/custom/world.js":
      "assets/highcharts/world.js",
  });

  // --- WATCH TARGETS ---
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/js/");
  eleventyConfig.addWatchTarget("src/_data/music/");

  // --- ELEVENTY CONFIGURATION ---
  const isProd =
    process.env.NODE_ENV === "production" ||
    process.env.ELEVENTY_ENV === "production";

  return {
    dir: {
      input: "src",
      output: "_site",
    },
    pathPrefix: isProd ? "/music/" : "/",
  };
};
