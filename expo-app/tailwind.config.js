/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0D0D0D",
        foreground: "#F1FAEE",
        emergency: "#E63946",
        "emergency-hover": "#C92E3B",
        green: "#3DDC97",
        amber: "#F4A261",
        navy: "#1D3557",
        muted: "#8E8E93",
        border: "#1F1F1F",
        card: "#161616",
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        pill: "9999px",
      },
      keyframes: {
        "pulse-sos": {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(230,57,70,0.6)" },
          "50%": { transform: "scale(1.03)", boxShadow: "0 0 0 12px rgba(230,57,70,0)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-sos": "pulse-sos 1.6s ease-in-out infinite",
        "fade-in": "fade-in 0.25s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
