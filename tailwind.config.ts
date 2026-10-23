import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        netflix: {
          black: '#000000',
          dark: '#141414',
          card: '#181818',
          cardHover: '#252525',
          red: '#E50914',
          redHover: '#F40612',
          redDim: '#B20710',
          gray: '#808080',
          lightGray: '#B3B3B3',
          white: '#FFFFFF',
          offWhite: '#E5E5E5',
        },
      },
      fontFamily: {
        sans: ['Netflix Sans', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        netflix: ['Netflix Sans', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'netflix': '0 8px 32px rgba(0, 0, 0, 0.6)',
        'netflix-lg': '0 16px 48px rgba(0, 0, 0, 0.7)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.6)',
      },
      backgroundImage: {
        'netflix-gradient': 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0) 100%)',
        'netflix-gradient-bottom': 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
        'hero-gradient': 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)',
      },
    },
  },
  plugins: [],
}
export default config