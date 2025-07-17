/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./mk.js/**/*.{html,js}"
  ],
  theme: {
    extend: {
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          'from': { 
            textShadow: '0 0 20px #dc2626, 0 0 30px #dc2626, 0 0 40px #dc2626',
            filter: 'drop-shadow(0 0 10px #dc2626)'
          },
          'to': { 
            textShadow: '0 0 30px #dc2626, 0 0 40px #dc2626, 0 0 50px #dc2626',
            filter: 'drop-shadow(0 0 20px #dc2626)'
          }
        }
      }
    },
  },
  plugins: [],
} 