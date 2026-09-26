/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F6F8FB',
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F0F3F7',
        },
        text: {
          DEFAULT: '#17212F',
          muted: '#647184',
        },
        border: '#E2E8F0',
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          soft: '#EFF6FF',
        },
        success: {
          DEFAULT: '#15803D',
          soft: '#F0FDF4',
        },
        warning: {
          DEFAULT: '#B45309',
          soft: '#FFFBEB',
        },
        danger: {
          DEFAULT: '#B91C1C',
          soft: '#FEF2F2',
        },
        info: {
          DEFAULT: '#0369A1',
          soft: '#F0F9FF',
        },
        agent: {
          DEFAULT: '#6D5CE8',
          soft: '#F3F0FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
