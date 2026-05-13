import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        coffee: {
          50:  '#fdf6f0',
          100: '#fae8d8',
          200: '#f3c9a8',
          300: '#e9a272',
          400: '#de7a40',
          500: '#c85d24',
          600: '#a8481b',
          700: '#873819',
          800: '#6e2e18',
          900: '#5a2717',
        },
      },
    },
  },
  plugins: [],
};

export default config;
