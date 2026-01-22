/** @type {import('tailwindcss').Config} */
export default {
  // Files Tailwind should scan for class names
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  // Extend the default theme here if you need custom colors,
  // spacing, fonts, etc. (currently left empty)
  theme: {
    extend: {},
  },

  // Register any Tailwind plugins you want to use
  plugins: [],
};
