import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#000000",
        obsidian: "#0a0a0a",
        charcoal: "#121212",
        graphite: "#1c1c1e",
        steel: "#2a2a2c",
        line: "rgba(255,255,255,0.14)",
        "line-soft": "rgba(255,255,255,0.07)",
        bone: "#f4f3ef",
        smoke: "rgba(244,243,239,0.6)",
        ash: "rgba(244,243,239,0.38)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Narrow", "sans-serif"],
        body: ["var(--font-body)", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        widest2: "0.32em",
      },
      transitionTimingFunction: {
        cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
