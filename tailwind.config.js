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
        darkBg: '#10131C',
        darkCard: '#191F2E',
        darkElevated: '#222A3D',
        primaryViolet: '#8B7CFF',
        accentTeal: '#54D6C7',
        warningAmber: '#F0B86E',
        textMain: '#F3F4F8',
        textSecondary: '#A4ADBE',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '1rem',
      },
      boxShadow: {
        'subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
        'glow-violet': '0 0 20px -3px rgba(139, 124, 255, 0.3)',
        'glow-teal': '0 0 20px -3px rgba(84, 214, 199, 0.3)',
      }
    },
  },
  plugins: [
    function({ addVariant }) {
      addVariant('light', '.light &');
    }
  ],
}
