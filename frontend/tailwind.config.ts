import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0d1321",
        panel: "#101827",
        line: "#243047",
        accent: "#2dd4bf",
        warn: "#f59e0b",
        danger: "#fb7185"
      },
      boxShadow: {
        glow: "0 18px 60px rgba(45, 212, 191, 0.16)"
      }
    }
  },
  plugins: [],
} satisfies Config;
