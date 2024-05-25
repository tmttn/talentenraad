import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],

  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui'],
      },
      colors: {
        pink: {
          DEFAULT: '#ea247b',
        },
        white: {
          DEFAULT: '#fefefe',
        },
        black: {
          DEFAULT: '#020101',
        },
        green: {
          DEFAULT: '#afbd43',
        },
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
};
export default config;
