import type { Config } from "tailwindcss";

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui'],
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          "primary": "#ea247b",
          "secondary": "#afbd43",
          "accent": "#f1b357",
          "neutral": "#57534e",
          "base-100": "#F7F5DD",
          "info": "#0ea5e9",
          "success": "#4ade80",
          "warning": "#fdba74",
          "error": "#f87171",
        },
      }
    ]
  }
};
export default config;
