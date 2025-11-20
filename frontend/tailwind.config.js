/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-red': '#E30613',
        'brand-red-hover': '#B30510',
        'brand-yellow': '#FFD700',
        'brand-green': '#0F7C3E',
        'brand-green-hover': '#0C6331',
        'text-primary': '#2A2A2A',
        'text-secondary': '#5A5A5A',
        'text-tertiary': '#6A6A6A',
        'text-footer': '#7A7A7A',
        'error': '#C62828',
      },
      backgroundColor: {
        'brand': '#EBEBEB',
      },
    },
  },
  plugins: [],
}
