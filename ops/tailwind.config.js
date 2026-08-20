/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1A2744',
          deep: '#111B31',
          light: '#24365C',
        },
        gold: {
          DEFAULT: '#F5A800',
          soft: '#FFF4DA',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI',
          'system-ui', 'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 3px rgba(17,27,49,0.06), 0 8px 24px rgba(17,27,49,0.06)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
