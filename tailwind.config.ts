import { type Config } from "tailwindcss";
import  defaultTheme from "tailwindcss/defaultTheme"

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'main': '#474747',
      }
    },
  },
  plugins: [],
} satisfies Config;
