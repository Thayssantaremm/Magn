import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        magn: {
          green: "#9ec188",
          green2: "#809c7b",
          hover: "#eef5ea",
          black: "#111111",
          border: "#e5e7eb",
          yellow: "#f4b942"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
