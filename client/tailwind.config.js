/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F9F4',
          100: '#DCF1E5',
          200: '#BAE2CC',
          300: '#8BCDB0',
          400: '#52B08C',
          500: '#176B45', // Primary Forest Green
          600: '#135839',
          700: '#0F4C30',
          800: '#0C3C26',
          900: '#092F1E',
        },
        surface: {
          warm: '#F8F8F3', // Warm background
          pure: '#FFFFFF',
          card: '#FFFFFF',
          muted: '#F0F2EB',
          border: '#E2E4DE',
        },
        ink: {
          dark: '#202820', // Dark readable typography
          secondary: '#525B53',
          muted: '#6B7280',
          light: '#9CA3AF',
        },
        accent: {
          saffron: '#F1B84B', // Restrained saffron / warm yellow
          gold: '#D97706',
          light: '#FEF6E9',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 2px 8px -2px rgba(23, 107, 69, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'float': '0 10px 25px -5px rgba(23, 107, 69, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
