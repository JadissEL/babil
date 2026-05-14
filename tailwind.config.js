/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#f7f3eb',
        surface: '#fffdf8',
        line: '#e6dccb',
        text: '#1f2937',
        muted: '#5f6b7a',
        primary: {
          DEFAULT: '#3157d5',
          hover: '#2749bb',
          soft: '#e7edff',
        },
        accent: {
          DEFAULT: '#f27a4c',
          hover: '#df6435',
          soft: '#fff0e8',
        },
        success: '#22a06b',
        warning: '#de8f1c',
        danger: '#dc4b4b',
        /** Nested panels / table stripes on cream UI (Doctorat sections, explorer chips, etc.) */
        inset: '#f8f2e8',
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.15rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20, 26, 36, 0.06), 0 8px 24px rgba(20, 26, 36, 0.08)',
        card: '0 2px 6px rgba(20, 26, 36, 0.05), 0 14px 28px rgba(20, 26, 36, 0.08)',
      },
      keyframes: {
        'flare-in': {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'flare-in': 'flare-in 220ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}
