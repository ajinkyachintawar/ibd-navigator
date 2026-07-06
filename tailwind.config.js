/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Teal is the new brand accent (from the Claude Design comp).
        brand: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          red:    '#e74c3c', // SOS / panic — unchanged
          purple: '#6c3fc5', // legacy, kept during transition
          green:  '#27ae60',
        },
        // Per-category pin hues (letters WC / Rx / H / R on the map)
        cat: {
          toilet:     '#15803d', // green
          pharmacy:   '#7c3aed', // purple
          hospital:   '#2563eb', // blue
          restaurant: '#c2410c', // amber-brown
        },
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}

