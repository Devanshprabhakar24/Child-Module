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
        primary: "#10b77f",
        "background-light": "#f6f8f7",
        "background-dark": "#10221c",
      },
      fontFamily: {
        display: ["var(--font-lexend)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;