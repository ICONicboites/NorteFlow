/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        'navy-dark': '#0f1117',
        'navy-light': '#1a1d2e',
        'accent-blue': '#4f8ef7',
        'profit-green': '#2ecc71',
        'expense-rose': '#e74c3c',
      },
      boxShadow: {
        glass: '0 4px 32px 0 rgba(79,142,247,0.15)',
        'glass-glow': '0 0 0 2px #4f8ef7, 0 4px 32px 0 rgba(79,142,247,0.15)',
      },
      backdropBlur: {
        glass: 'blur(16px)',
      },
      borderColor: {
        'glass': 'rgba(255,255,255,0.08)',
        'accent': '#4f8ef7',
      },
      borderWidth: {
        1.5: '1.5px',
      },
      transitionProperty: {
        'transform-opacity': 'transform, opacity',
      },
    },
  },
  plugins: [],
}

