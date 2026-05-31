import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/sections/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: "1rem",
                md: "2rem",
                lg: "4rem",
            },
        },
        screens: {
            sm: "375px",
            md: "768px",
            lg: "1200px",
        },
        extend: {
            fontFamily: {
                sans:    ["var(--font-manrope)", "system-ui", "sans-serif"],
                display: ["var(--font-space-grotesk)", "var(--font-manrope)", "sans-serif"],
                mono:    ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
            },
            colors: {
                dm: {
                    bg:      "#060509",
                    "bg-1":  "#0b0a11",
                    "bg-2":  "#110f18",
                    "bg-3":  "#181522",
                    cyan:    "#34e6cf",
                    blue:    "#4f86ff",
                    violet:  "#9b5cff",
                    magenta: "#d24bff",
                    text:    "#f3f1f7",
                },
            },
            backgroundImage: {
                "dm-grad": "linear-gradient(110deg, #34e6cf 0%, #4f86ff 38%, #9b5cff 66%, #d24bff 100%)",
                "dm-grad-soft": "linear-gradient(110deg, rgba(52,230,207,.18), rgba(79,134,255,.18) 40%, rgba(155,92,255,.18) 70%, rgba(210,75,255,.18))",
            },
            borderRadius: {
                "dm-sm": "12px",
                "dm":    "18px",
                "dm-lg": "26px",
                "dm-xl": "34px",
            },
            boxShadow: {
                "dm":         "0 30px 80px -30px rgba(0,0,0,0.8)",
                "dm-primary": "0 8px 30px -8px rgba(155,92,255,0.55)",
                "dm-primary-hover": "0 12px 40px -8px rgba(155,92,255,0.7)",
            },
            keyframes: {
                "dm-rise": {
                    from: { transform: "translateY(22px)", opacity: "0" },
                    to:   { transform: "translateY(0)",    opacity: "1" },
                },
                "dm-floaty": {
                    "0%,100%": { transform: "translateY(0) rotate(0deg)" },
                    "50%":     { transform: "translateY(-18px) rotate(4deg)" },
                },
                "dm-spin-slow": {
                    to: { transform: "rotate(360deg)" },
                },
                "dm-pulse-glow": {
                    "0%,100%": { opacity: "0.5" },
                    "50%":     { opacity: "0.85" },
                },
                "dm-marquee": {
                    from: { transform: "translateX(0)" },
                    to:   { transform: "translateX(-50%)" },
                },
            },
            animation: {
                "dm-rise":       "dm-rise .7s cubic-bezier(.2,.7,.2,1) both",
                "dm-floaty":     "dm-floaty 9s ease-in-out infinite",
                "dm-spin-slow":  "dm-spin-slow 28s linear infinite",
                "dm-pulse-glow": "dm-pulse-glow 6s ease-in-out infinite",
                "dm-marquee":    "dm-marquee 32s linear infinite",
            },
            maxWidth: {
                "dm": "1240px",
            },
        },
    },
    plugins: [],
};
export default config;
