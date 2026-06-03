/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {

      colors: {

        primary: '#f97316', // orange-500
        secondary: '#1c1917', // stone-900
        background: '#f1f5f9', // slate-100

        success: '#10b981',
        danger: '#ef4444',
        info: '#3b82f6',
      },

      borderRadius: {
        xl2: '1.5rem'
      },

      boxShadow: {
        card:
          '0 8px 30px rgba(0,0,0,0.08)'
      }

    },
  },

  plugins: [],
}
