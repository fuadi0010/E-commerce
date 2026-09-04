/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'ambient': '0 10px 30px -10px rgba(0,0,0,0.06), 0 4px 6px -4px rgba(0,0,0,0.02)',
        'ambient-lg': '0 20px 40px -15px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.03)',
        'inner-light': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)',
      },
    },
  },
  plugins: [],
}

