import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1e8a9c",
          50: "#f0fafb",
          100: "#d9f2f5",
          200: "#b7e5eb",
          300: "#85d1dc",
          400: "#4db4c4",
          500: "#1e8a9c",
          600: "#1b7d8e",
          700: "#1a6675",
          800: "#1c5361",
          900: "#1b4653",
        },
        accent: {
          DEFAULT: "#4ade80",
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
        },
        dark: "#0f172a",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
