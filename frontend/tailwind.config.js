/** @type {import('tailwindcss').Config} */
import twColors from "tailwindcss/colors";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        // Primary theme colors
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        // Custom dark theme colors
        dark: {
          50: "#e6e7eb", // --color-dark-50
          100: "#d0d2db", // --color-dark-100
          200: "#b7bac4", // --color-dark-200
          300: "#838794", // --color-dark-300
          400: "#4c4f57", // --color-dark-400
          450: "#383a41", // --color-dark-450
          500: "#2a2c32", // --color-dark-500
          600: "#232429", // --color-dark-600
          700: "#1c1d21", // --color-dark-700
          750: "#1a1b1f", // --color-dark-750
          800: "#15161a", // --color-dark-800
          900: "#000000", // --color-dark-900
        },
        voice: {
          recording: '#ef4444',
          idle: '#64748b',
          processing: '#f59e0b',
        },
        // Custom colors matching the design
        blue: {
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
        green: {
          400: "#4ade80",
          500: "#22c55e",
        },
        purple: {
          400: "#a855f7",
          500: "#9333ea",
        },
        orange: {
          400: "#fb923c",
          500: "#f97316",
        },
        pink: {
          400: "#f472b6",
          500: "#ec4899",
        },
        indigo: twColors.indigo,
        amber: twColors.amber,
        rose: twColors.rose,
        info: twColors.sky["500"],
        "info-darker": twColors.sky["700"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(1.5)' }
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      }
    },
  },
  plugins: [],
}