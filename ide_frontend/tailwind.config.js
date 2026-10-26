/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#0A0D14',
          surface: '#111520',
          panel: '#161B26',
          border: '#232A3B',
          hover: '#1E2536',
          accent: '#6366F1',
          accentHover: '#4F46E5',
          text: '#F3F4F6',
          muted: '#9CA3AF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
