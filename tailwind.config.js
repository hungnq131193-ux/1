/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#262624',
          surface: '#30302E',
          line: '#3E3B36',
        },
        paper: {
          DEFAULT: '#F5F4EE',
          surface: '#FFFFFF',
          line: '#E7E4DA',
        },
        clay: {
          DEFAULT: '#D97757',
          dark: '#C2643F',
        },
        channel: {
          claude: '#D97757',
          auto: '#6C8EEF',
          grok: '#8B7FD9',
          codex: '#4FB8A6',
          other: '#8B909A',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Be Vietnam Pro"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};
