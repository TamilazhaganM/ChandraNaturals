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
        forest: {
          ink: 'var(--color-forest-ink, #0F1D12)',
          deep: 'var(--color-deep-moss, #17291A)',
          moss: 'var(--color-moss-light, #1F3623)',
          text: 'var(--color-deep-forest-text, #22331D)',
        },
        gold: {
          antique: 'var(--color-antique-gold, #C9A24E)',
          champagne: 'var(--color-champagne-gold, #E8D9AE)',
          muted: 'var(--color-muted-gold, #B8863B)',
          soft: 'var(--color-soft-gold, #E4C685)',
        },
        cream: {
          warm: 'var(--color-warm-cream, #F3EFE0)',
          ivory: 'var(--color-warm-ivory, #FFFDF8)',
          linen: 'var(--color-warm-linen, #FBF8EF)',
        },
        bark: {
          spice: 'var(--color-spice-bark, #C1874F)',
          roasted: 'var(--color-roasted-umber, #4A3018)',
          coffee: 'var(--color-coffee-bark, #8A5A2E)',
          dark: 'var(--color-dark-umber, #5C3B1C)',
        },
        food: {
          veg: 'var(--color-veg, #4CAF50)',
          nonveg: 'var(--color-nonveg, #B5482A)',
        }
      },
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
        sans: ['"Work Sans"', 'sans-serif'],
        caveat: ['Caveat', 'cursive'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(201, 162, 78, 0.25)',
        'gold-glow-lg': '0 0 40px -5px rgba(201, 162, 78, 0.4)',
        'moon-ambient': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'tag': '0 8px 24px -6px rgba(0, 0, 0, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      }
    },
  },
  plugins: [],
}
