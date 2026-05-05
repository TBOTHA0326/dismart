import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#FFD100",
          navy: "#1B2B5B",
          red: "#E8212A",
          "yellow-dark": "#E6BC00",
        },
      },
      keyframes: {
        "progress-bar": {
          "0%": { transform: "translateX(-100%)" },
          "60%": { transform: "translateX(-10%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
      animation: {
        "progress-bar": "progress-bar 1.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
