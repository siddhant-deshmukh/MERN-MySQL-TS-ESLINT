/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // This is crucial for Angular
    // Add any other paths if you have components/templates elsewhere
  ],
  theme: {
    extend: {},
  },
  darkMode: ['selector', '.my-app-dark'],
  plugins: [],
}