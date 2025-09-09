/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // Fix: Corrected glob pattern to scan all relevant files for Tailwind classes.
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lime: {
          300: '#a3e635',
          400: '#84cc16',
          500: '#65a30d',
          600: '#4d7c0f',
        }
      }
    },
  },
  plugins: [],
}
