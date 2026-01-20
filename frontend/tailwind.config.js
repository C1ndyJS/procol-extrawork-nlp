/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f4f8',
          100: '#a2d5e7',
          200: '#1e90ff',
          300: '#2e6fa8',
          400: '#1a4d7a',
        },
      },
    },
  },
  plugins: [],
};
