import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: "#eef0f7",
        knight: "#2a2f35",
        darkBg: "#0f1217",
        cardBlue: "#8cc9fe",
        cardGreen: "#63ccae",
        cardPink: "#ffbfd1",
        cardYellow: "#ffdf9a",
      },
      fontFamily: {
        oleo: "var(--font-oleo)",
      },
      keyframes: {
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        fade: "fade 1s ease-in-out",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui(), require("tailwind-scrollbar-hide")],
};
