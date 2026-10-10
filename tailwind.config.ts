import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        surface: "var(--surface)",
        stone: "var(--stone)",
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
        },
        forest: {
          DEFAULT: "var(--forest)",
          dark: "var(--forest-dark)",
        },
        sage: "var(--sage)",
        clay: "var(--clay)",
        available: "var(--available)",
        unavailable: "var(--unavailable)",
        pending: "var(--pending)",
      },
      borderRadius: {
        card: "10px",
        btn: "8px",
        input: "8px",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Source Serif 4", "Noto Serif Devanagari", "serif"],
        sans: ["var(--font-sans)", "Figtree", "Noto Sans Devanagari", "sans-serif"],
        mono: ["var(--font-mono)", "Red Hat Mono", "monospace"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(28, 36, 32, 0.06)",
        dropdown: "0 8px 30px -4px rgba(28, 36, 32, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
