import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Semantic color tokens (DESIGN_GUIDE §2, Theme A "Fresh Cool").
      // Values are wired to CSS variables in globals.css — never use raw hex
      // in components.
      colors: {
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          hover: "var(--color-primary-hover)",
          fg: "var(--color-primary-fg)",
        },
        surface: "var(--color-surface)",
        hairline: "var(--color-border)",
        foreground: {
          DEFAULT: "rgb(var(--color-text) / <alpha-value>)",
          muted: "var(--color-text-muted)",
        },
        accent: "var(--color-accent)",
        success: "var(--color-success)",
        danger: "var(--color-danger)",
        strike: "var(--color-strike)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "var(--font-inter)", "sans-serif"],
      },
      // Radius tokens (DESIGN_GUIDE §6).
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
      // Shadow tokens (DESIGN_GUIDE §6) — subtle, reserved for hover/floating.
      boxShadow: {
        sm: "0 1px 2px rgba(15,23,32,0.06)",
        md: "0 8px 24px rgba(15,23,32,0.10)",
      },
      // Type scale (DESIGN_GUIDE §3), mobile → desktop via responsive classes.
      fontSize: {
        display: ["2rem", { lineHeight: "2.5rem", fontWeight: "800" }],
        h1: ["1.625rem", { lineHeight: "2rem", fontWeight: "700" }],
        h2: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "700" }],
        h3: ["1.0625rem", { lineHeight: "1.5rem", fontWeight: "600" }],
        price: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "700" }],
      },
      maxWidth: {
        content: "80rem", // 1280px — max-w-7xl per §5
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
