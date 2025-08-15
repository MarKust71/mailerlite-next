import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'], // albo: "class"
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [forms, animate],
};

export default config;
