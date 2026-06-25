/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          red:    '#e74c3c',
          purple: '#6c3fc5',
          green:  '#27ae60',
        },
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}

