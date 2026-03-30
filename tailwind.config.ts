import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"Source Sans 3"', '"Barlow"', 'sans-serif'],
        label:   ['"Barlow Condensed"', '"Source Sans 3"', 'sans-serif'],
      },
      colors: {
        coffee:  '#3B2314',
        pepper:  '#8B1A1A',
        field:   '#2C5F2E',
        gold:    '#D4A017',
        straw:   '#F5ECD7',
        canvas:  '#FAFAF6',
      },
      screens: {
        print: { raw: 'print' },
      },
    },
  },
  plugins: [],
}

export default config
