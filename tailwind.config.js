/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./node_modules/primevue/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // PrimeVue integration colors
        'primary': {
          50: 'rgb(var(--primary-50))',
          100: 'rgb(var(--primary-100))',
          200: 'rgb(var(--primary-200))',
          300: 'rgb(var(--primary-300))',
          400: 'rgb(var(--primary-400))',
          500: 'rgb(var(--primary-500))',
          600: 'rgb(var(--primary-600))',
          700: 'rgb(var(--primary-700))',
          800: 'rgb(var(--primary-800))',
          900: 'rgb(var(--primary-900))',
          950: 'rgb(var(--primary-950))',
        },
        'surface': {
          0: 'rgb(var(--surface-0))',
          50: 'rgb(var(--surface-50))',
          100: 'rgb(var(--surface-100))',
          200: 'rgb(var(--surface-200))',
          300: 'rgb(var(--surface-300))',
          400: 'rgb(var(--surface-400))',
          500: 'rgb(var(--surface-500))',
          600: 'rgb(var(--surface-600))',
          700: 'rgb(var(--surface-700))',
          800: 'rgb(var(--surface-800))',
          900: 'rgb(var(--surface-900))',
          950: 'rgb(var(--surface-950))',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 12px 0 rgba(0, 0, 0, 0.09)',
        'medium': '0 4px 20px 0 rgba(0, 0, 0, 0.12)',
        'strong': '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [
    require('tailwindcss-primeui')
  ],
}