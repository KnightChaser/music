// .eleventy.js
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addNunjucksFilter("jsonify", (data) => {
    return JSON.stringify(data, null, 2);
  });

  return {
    pathPrefix: "/music/",
    dir: { input: "src", output: "dist" }
  };
};

