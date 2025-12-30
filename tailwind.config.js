/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",  // ini penting buat src/ directory
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",  // tambah kalau punya folder components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};