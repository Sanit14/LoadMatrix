/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          base: '#0a0a0a',     // Midnight Charcoal
          panel: '#141414',    // Off-Black
          rowEven: '#0c0c0c',  // Subtle row
          rowOdd: '#101010',   // Subtle row
          active: '#1e1e1e',   // Dark Frost
        },
        'midnight-charcoal': '#0a0a0a',
        'pitch-black': '#000000',
        'off-black': '#141414',
        'dark-frost': '#1e1e1e',
        'medium-gray': '#313131',
        'light-gray': '#454545',
        'dim-gray': '#7c7c7c',
        'silver-dust': '#a7a7a7',
        'polar-white': '#ffffff',
        'data-blue': '#6798ff',
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        success: '#22c55e',
        info: '#6798ff', // Map info to data-blue
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderColor: {
        terminal: {
          default: '#313131', // Medium Gray
          focus: '#6798ff',   // Data Blue
        }
      },
      borderRadius: {
        'button': '8px',
        'card': '8px',
      }
    },
  },
  plugins: [],
}
