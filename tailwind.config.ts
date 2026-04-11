import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        panelStrong: "var(--panel-strong)",
        line: "var(--line)",
        text: "var(--text)",
        muted: "var(--muted)",
        brand: {
          1: "var(--brand-1)",
          2: "var(--brand-2)",
          3: "var(--brand-3)",
          4: "var(--brand-4)"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 20px 80px rgba(99, 102, 241, 0.25)",
        soft: "0 20px 60px rgba(7, 12, 30, 0.35)"
      },
      backgroundImage: {
        "hero-grid":
          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)"
      },
      fontFamily: {
        sans: ["var(--font-body)", "Outfit", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "Space Grotesk", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};

export default config;
