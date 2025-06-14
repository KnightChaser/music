// .eleventy.js
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addNunjucksFilter("jsonify", (data) => {
    return JSON.stringify(data, null, 2);
  });

   // Copy generated CSS & any Flowbite assets
   eleventyConfig.addPassthroughCopy({ "src/assets/css": "assets/css" });
   eleventyConfig.addPassthroughCopy({ "node_modules/flowbite/dist/flowbite.min.js": "assets/flowbite/flowbite.min.js" });

  const isProd = process.env.NODE_ENV === "production";

  return {
    dir: { 
      input: "src", 
      output: "_site" 
    },
    pathPrefix: isProd ? "/music/" : "/",
  };
};