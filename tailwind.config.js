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
        rhapsody: {
          dark: '#0e1117',
          surface: '#161b22',
          surfaceLight: '#21262d',
          border: '#30363d',
          accent: '#e63946',
          accentLight: '#ff4d6d',
          neonCyan: '#00f5d4',
          neonPurple: '#9d4edd',
          neonOrange: '#ff9e00',
          neonGreen: '#52b788',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
