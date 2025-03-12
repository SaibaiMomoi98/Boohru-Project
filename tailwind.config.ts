import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'soft-peach': "#F5D7CD",
        "Vermilion": "#FE3904",
        "Apricot": "#ED886C",
        "cedar-wood": "#801800",
        "dawn-pink": "#F3EAE3",
        "cherry-rush": "#E74F5E",
        "peach-cream": "#FDDFC5"
      },
    },
  },
  plugins: [],
} satisfies Config;
