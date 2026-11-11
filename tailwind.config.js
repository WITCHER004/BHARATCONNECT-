/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F1EEE8',
          50: '#FCFBF9',
          100: '#FAF8F5',
          200: '#F1EEE8',
          300: '#E6E1D7',
          400: '#D5CDBF',
          500: '#BAAF9B',
        },
        teal: {
          DEFAULT: '#0E4F4A',
          deep: '#082C29',
          dark: '#0A3B37',
          brand: '#0E4F4A',
          light: '#1B746D',
          vibrant: '#27968D',
          soft: '#E5EFEE',
          muted: '#8FB5B1',
        },
        coral: {
          DEFAULT: '#FF6F5E',
          50: '#FFF5F4',
          100: '#FFEBE8',
          200: '#FFD4CF',
          brand: '#FF6F5E',
          hover: '#E85B4B',
          dark: '#CF4333',
        },
        diplomatic: {
          gold: '#C89D52',
          goldLight: '#E8C789',
          charcoal: '#141E1D',
          slate: '#2C3E3D',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Merriweather', 'serif'],
        sans: ['Plus Jakarta Sans', 'Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(14, 79, 74, 0.06), 0 2px 6px -1px rgba(14, 79, 74, 0.04)',
        'card': '0 10px 30px -4px rgba(14, 79, 74, 0.08), 0 4px 12px -2px rgba(14, 79, 74, 0.04)',
        'premium': '0 20px 45px -10px rgba(8, 44, 41, 0.15), 0 8px 20px -4px rgba(14, 79, 74, 0.08)',
        'coral': '0 10px 25px -3px rgba(255, 111, 94, 0.35)',
      },
      backgroundImage: {
        'diplomatic-pattern': 'radial-gradient(circle at 1px 1px, rgba(14, 79, 74, 0.07) 1px, transparent 0)',
        'gold-gradient': 'linear-gradient(135deg, #C89D52 0%, #E8C789 50%, #C89D52 100%)',
      }
    },
  },
  plugins: [],
}

