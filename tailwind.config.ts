import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ['"Instrument Serif"', "Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SF Mono", "Menlo", "Consolas", "monospace"],
      },
      letterSpacing: {
        eyebrow: "0.22em",
      },
      colors: {
        brand: {
          50: "#E6F5EC",
          100: "#C2E8D2",
          200: "#8ED6AC",
          300: "#5AC486",
          400: "#3CCB7F",
          500: "#009A49",
          600: "#008040",
          700: "#006B3C",
          800: "#00502C",
          900: "#00331D",
          wash: "rgba(0,154,73,0.08)",
        },
        grey: {
          50: "#FAFAF9",
          100: "#F5F5F3",
          200: "#E7E7E4",
          300: "#D4D4D1",
          400: "#A8A8A4",
          500: "#737370",
          600: "#525250",
          700: "#3A3A38",
          800: "#262624",
          900: "#171715",
          950: "#0A0A0A",
        },
        emerald: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#145231",
          950: "#052e16",
        },
        indigo: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
      },
      keyframes: {
        drift: {
          "0%": { transform: "translate3d(-20px, -10px, 0) scale(1)" },
          "100%": { transform: "translate3d(30px, 20px, 0) scale(1.05)" },
        },
        strike: {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        spin: {
          to: { transform: "rotate(1turn)" },
        },
        "scroll-x": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        drift: "drift 14s ease-in-out infinite alternate",
        strike: "strike 1.4s 0.7s forwards ease-out",
        "spin-slow": "spin 14s linear infinite",
        "scroll-x": "scroll-x 30s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
