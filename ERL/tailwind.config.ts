import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ERL brand palette (locked in PRD §10)
        background: "#0D0D0D",
        foreground: "#F1FAEE",
        emergency: "#E63946",
        "emergency-hover": "#C12D3B",
        navy: "#1D3557",
        green: "#3DDC97",
        amber: "#F4A261",
        muted: "#8E8E93",
        border: "#1F1F1F",
        card: "#141414",
        "card-foreground": "#F1FAEE",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-sos": "pulseSOS 1.6s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        pulseSOS: {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(230, 57, 70, 0.7)",
          },
          "50%": {
            transform: "scale(1.04)",
            boxShadow: "0 0 0 24px rgba(230, 57, 70, 0)",
          },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
