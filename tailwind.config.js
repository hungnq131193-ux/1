/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14161A',
          surface: '#1E2126',
          line: '#2A2E35',
        },
        paper: {
          DEFAULT: '#F7F6F3',
          surface: '#FFFFFF',
          line: '#E4E2DC',
        },
        brass: {
          DEFAULT: '#C9A227',
          dark: '#B8911F',
        },
        channel: {
          claude: '#C9A227',
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
