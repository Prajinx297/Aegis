import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "aegis-black": "#0A0A0F",
        "aegis-surface": "#111118",
        "aegis-card": "#16161E",
        "aegis-border": "#2A2A3A",
        "aegis-primary": "#6366F1",
        "aegis-accent": "#22D3EE",
        "aegis-success": "#10B981",
        "aegis-warn": "#F59E0B",
        "aegis-danger": "#EF4444",
        "aegis-text": "#E2E8F0",
        "aegis-muted": "#64748B"
      },
      boxShadow: {
        glow: "0 0 30px rgba(99,102,241,0.15)"
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(99,102,241,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.12) 1px, transparent 1px)"
      },
      animation: {
        pulseSlow: "pulse 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        float: "float 4s ease-in-out infinite",
        scan: "scan 2s ease-in-out infinite"
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        scan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(220%)" }
        }
      }
    }
  },
  plugins: []
} satisfies Config;
