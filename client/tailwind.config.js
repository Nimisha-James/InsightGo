/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // InsightGo's brand palette (warm bakery cream/orange/brown) — used
      // consistently across every page instead of one-off arbitrary hex
      // values. `brown-*` in particular replaces classes like `text-brown-800`
      // that were used around the site but never resolved to anything because
      // Tailwind has no built-in "brown" scale.
      colors: {
        brown: {
          50: '#fbf4eb',
          100: '#f4e3cf',
          200: '#e6c49b',
          300: '#d8b48b',
          400: '#c2925e',
          500: '#b66015',
          600: '#946015',
          700: '#7a5636',
          800: '#5b3d1d',
          900: '#3f2501',
          950: '#2d1b04',
        },
        cream: {
          50: '#fffaf3',
          100: '#fff0e1',
          200: '#fbe3c6',
          300: '#f4d6d7',
          400: '#ffe4c4',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
