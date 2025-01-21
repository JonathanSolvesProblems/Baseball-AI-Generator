import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#121212",
        primary: "#1e90ff",
        textPrimary: "#ffffff",
        textSecondary: "#aaaaaa",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["winter"]
  }
} satisfies Config;
