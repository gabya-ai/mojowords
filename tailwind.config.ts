import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Updated Palette based on 'MojoWords' reference images
        'mojo-green-light': '#C1E1C1',   // Soft garden green
        'mojo-green': '#A2D8A2',         // Main brand green
        'mojo-green-dark': '#4A6D51',    // Text/Accent green
        'mojo-yellow': '#FDF4C4',        // Sunlight yellow
        'mojo-cream': '#FDFBF7',         // Background cream
        'mojo-peach': '#F4B9B2',         // Accent peach
        'mojo-white': '#FFFFFF',
        'mojo-gray': '#8A8A8A',
      },
      fontFamily: {
        sans: ['"Nunito"', 'var(--font-geist-sans)', 'Arial', 'sans-serif'], // Rounder, friendlier font if available
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(162, 216, 162, 0.2)',
        'card': '0 10px 40px -10px rgba(74, 109, 81, 0.1)',
      }
    },
  },
  plugins: [],
};
export default config;
