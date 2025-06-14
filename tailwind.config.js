// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{njk,js,html}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        // Replace the default sans with Archivo
        sans: ["Archivo", "sans-serif"],
      },
    },
  },
  plugins: [
    require("flowbite/plugin")
  ],
};
