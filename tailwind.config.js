/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // RAG palette — chosen to also be distinguishable for common color-blindness;
        // the UI never relies on color alone (icon + label always accompany).
        rag: {
          green: "#1a7f4b",
          amber: "#b46a00",
          red: "#c0392b",
          na: "#6b7280",
        },
        brand: {
          // Fidelity-ish green
          DEFAULT: "#368727",
          dark: "#1f5a16",
        },
        ink: "#1a1a1a",
        muted: "#5b5b5b",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
