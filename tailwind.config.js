/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        card: ['"Courier Prime"', 'monospace'],
      },
    },
  },
  plugins: [],
}
