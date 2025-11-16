/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        kamana: {
          primary: '#C27C5B',
          secondary: '#F5E9E2',
          text: '#1F2937',
        }
      },
      borderRadius: {
        'card': '16px',
        'image': '12px',
      }
    },
  },
  plugins: [],
}
