/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        /* ========== BRAND ========== */
        primary: {
          DEFAULT: "#F6F000", // FYTR Yellow
          soft: "#FFF85A",
          glow: "#E6E000",
        },

        /* ========== BACKGROUNDS ========== */
        background: {
          light: "#F8F9FB",
          dark: "#0B0B0B",
        },

        surface: {
          light: "#FFFFFF",
          dark: "#121212",
        },

        card: {
          light: "#F1F3F6",
          dark: "#181818",
        },

        border: {
          light: "#E5E7EB",
          dark: "#242424",
        },

        /* ========== TEXT ========== */
        textPrimary: {
          light: "#0F0F0F",
          dark: "#FFFFFF",
        },

        textSecondary: {
          light: "#6B7280",
          dark: "#C7C7CC",
        },

        textMuted: {
          light: "#9CA3AF",
          dark: "#8E8E93",
        },

        /* ========== STATES ========== */
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",

        /* ========== UTILITY ========== */
        overlay: "rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};
