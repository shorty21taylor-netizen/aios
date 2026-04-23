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
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: [
          "var(--font-space-grotesk)",
          "var(--font-inter)",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          50: "#E6F7EE",
          100: "#C2EBD2",
          200: "#9BDCB6",
          300: "#6FCC97",
          400: "#3CCB7F",
          500: "#009A49",
          600: "#007A38",
          700: "#006B3C",
          800: "#004F2A",
          900: "#003A1F",
          950: "#00120A",
        },
        ink: {
          50: "#F5F5F2",
          100: "#F0F0ED",
          200: "#E5E5E2",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#404040",
          700: "#262626",
          800: "#1A1A1A",
          900: "#111111",
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
