import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        blue: '#1e40af',
        accent: '#10b981',
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
