/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your specific Firebase-inspired palette
        fbOrange: '#f57c00',
        fbAmber: '#ffca28',
        fbNavy: '#051e34',
        fbGray: '#f4f7f9',
      },
    },
  },
  plugins: [],
}
