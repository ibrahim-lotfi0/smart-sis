import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6C5CE7",
          50: "#F0EEFF",
          100: "#E0DCFF",
          200: "#C2BAFF",
          300: "#A397FF",
          400: "#8575FF",
          500: "#6C5CE7",
          600: "#5647C8",
          700: "#4035A9",
          800: "#2B248A",
          900: "#16136B",
        },
        secondary: {
          DEFAULT: "#0984E3",
          50: "#E6F4FD",
          100: "#CCEAFB",
          200: "#99D4F7",
          300: "#66BFF3",
          400: "#33AAEF",
          500: "#0984E3",
          600: "#076DB8",
          700: "#05568E",
          800: "#033F64",
          900: "#01283A",
        },
        risk: {
          low: "#00B894",
          medium: "#FDCB6E",
          high: "#D63031",
        },
        surface: {
          DEFAULT: "#F5F9FF",
          card: "#FFFFFF",
          dark: "#1A1A2E",
          darkCard: "#16213E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(108, 92, 231, 0.08)",
        "card-hover": "0 8px 32px rgba(108, 92, 231, 0.18)",
        glass: "0 8px 32px rgba(31, 38, 135, 0.1)",
        glow: "0 0 20px rgba(108, 92, 231, 0.4)",
        "glow-blue": "0 0 20px rgba(9, 132, 227, 0.4)",
      },
      backgroundImage: {
        "sidebar-gradient":
          "linear-gradient(180deg, #2D1B69 0%, #1A0E3D 50%, #0D0723 100%)",
        "hero-gradient":
          "linear-gradient(135deg, #6C5CE7 0%, #0984E3 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(108,92,231,0.1) 0%, rgba(9,132,227,0.05) 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(108,92,231,0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(108,92,231,0.5)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
