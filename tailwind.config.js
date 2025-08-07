/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './main.js'],
  theme: {
    extend: {
      spacing: {
        '4.5': '1.125rem', // 18px
        '15': '3.75rem' // 60px
      },
      colors: {
        primary: {
          500: '#e74c3c',
          600: '#c0392b'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-in': 'slideIn 0.3s ease'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.8) translateY(-20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)'
          }
        }
      }
    }
  },
  plugins: []
};
