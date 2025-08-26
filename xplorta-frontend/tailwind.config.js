/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screen: {
        "3xl": "2000px",
      },
      colors: {
        primary: "#7c3aed",
        "primary-content": "#ffffff",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#7c3aed",
          "primary-content": "#ffffff",
          "base-100": "#1a1625",
          "base-200": "#2a2438",
          "base-300": "#3a3352",
          "base-content": "#e5e7eb",
        },
      },
    ],
    darkTheme: "dark",
  },
};
