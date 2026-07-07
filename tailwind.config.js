/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Teal is the new brand accent (from the Claude Design comp).
        // 700 is the exact spec token (oklch(0.42 0.09 175) → #005c4a) — the
        // primary action colour; the rest of the scale is kept for hover/tint use.
        brand: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#005c4a',
          800: '#115e59',
          900: '#134e4a',
          red:    '#d24c49', // SOS / panic — exact spec token oklch(0.6 0.17 25)
          purple: '#6c3fc5', // legacy, kept during transition
          green:  '#27ae60',
        },
        // Per-category pin hues (letters WC / Rx / H / R on the map) — exact
        // conversion of the design handoff's oklch tokens
        cat: {
          toilet:     '#007560', // teal
          pharmacy:   '#6c5594', // muted purple
          hospital:   '#2266a4', // muted blue
          restaurant: '#aa6a00', // mustard/amber
        },
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}

