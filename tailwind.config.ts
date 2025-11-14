// tailwind.config.ts
import type { Config } from "tailwindcss"

const config = {
    darkMode: "class", // <-- ADD THIS LINE
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: "",
    theme: {
        // ... your theme
    },
    plugins: [require("tailwindcss-animate")], // This line is now fixed
} satisfies Config

export default config