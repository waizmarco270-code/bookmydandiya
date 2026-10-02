/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#3A0611',
          maroon: '#5A0B1A',
          burgundy: '#800020',
          red: '#A40000',
          gold: '#D4AF37',
          'gold-light': '#F3E5AB',
          'gold-dark': '#AA8811',
          ivory: '#FFFFF0',
          cream: '#FFFDD0',
          orange: '#FF7F50',
          sand: '#F5E6D3'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'url("/textures/pattern.png")',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(200%)' },
        }
      }
    },
  },
  plugins: [],
}
