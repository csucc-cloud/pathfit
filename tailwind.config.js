/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // These match the design system from your target image
        'fb-blue': '#039be5', // The vibrant blue
        'fb-navy': '#051e34', // The deep background blue
      },
    },
  },
  plugins: [],
}
