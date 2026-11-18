/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#17151C',
        surface: '#1E1B24',
        card: '#24212B',
        'card-hover': '#2C2836',
        'card-border': '#363042',
        main: '#F5F0FA',
        muted: '#A39AAA',
        primary: {
          DEFAULT: '#B58AFF',
          light: '#C7A3FF',
          dark: '#935CE6',
        },
        secondary: {
          DEFAULT: '#D6B8E8',
          light: '#EAD8F7',
          dark: '#B994D1',
        },
        plum: {
          900: '#1D1326',
          800: '#2A1B38',
          700: '#3D2452',
          600: '#522F6E',
          500: '#6C3E91',
        },
        status: {
          safe: '#2ED573',
          'safe-bg': 'rgba(46, 213, 115, 0.12)',
          danger: '#FF5370',
          'danger-bg': 'rgba(255, 83, 112, 0.12)',
          warning: '#FFA502',
          'warning-bg': 'rgba(255, 165, 2, 0.12)',
          info: '#B58AFF',
          'info-bg': 'rgba(181, 138, 255, 0.12)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 24px -4px rgba(181, 138, 255, 0.35)',
        'glow-danger': '0 0 24px -4px rgba(255, 83, 112, 0.35)',
        'glow-safe': '0 0 24px -4px rgba(46, 213, 115, 0.35)',
        'card-elevated': '0 10px 30px -10px rgba(10, 8, 15, 0.7)',
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
      animation: {
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        'scan': 'scanline 4s linear infinite',
      },
    },
  },
  plugins: [],
}
