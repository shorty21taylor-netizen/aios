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
        sans: ["var(--font-inter)"],
        display: ["var(--font-space-grotesk)"],
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
    },
  },
  plugins: [],
};
export default config;
