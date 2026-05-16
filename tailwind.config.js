/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0A0E13',
          1: '#0E131A',
          2: '#11161C',
          3: '#161D26',
        },
        line: {
          DEFAULT: '#1E2530',
          strong: '#2A3340',
        },
        ink: {
          DEFAULT: '#E8EDF4',
          dim: '#8A95A5',
          mute: '#5A6573',
        },
        accent: '#00D09C',
        bull: '#00C896',
        bear: '#FF5C5C',
        info: '#5B9DFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
