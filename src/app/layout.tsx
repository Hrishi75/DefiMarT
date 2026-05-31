import type { Metadata } from "next";
import { Space_Grotesk, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import logoPng from "@/assets/images/Defimart logo.png";
import Navbar from "@/sections/Navbar";
import Footer from "@/sections/Footer";
import { WalletProvider } from "@/components/WalletProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import cursorYouImage from "@/assets/images/cursor-you.svg";

const spaceGrotesk = Space_Grotesk({
    variable: "--font-space-grotesk",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
});

const manrope = Manrope({
    variable: "--font-manrope",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains-mono",
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "DefiMart",
    description: "Web3 Ecommerce Platform",
    icons: {
        icon: logoPng.src,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${spaceGrotesk.variable} ${manrope.variable} ${jetbrainsMono.variable} font-sans antialiased`}
                style={{
                    background: "var(--bg)",
                    color: "var(--text)",
                    cursor: `url(${cursorYouImage.src}), auto`,
                }}
            >
                <WalletProvider>
                    <AuthProvider>
                        <Navbar />
                        {children}
                        <Footer />
                    </AuthProvider>
                </WalletProvider>
            </body>
        </html>
    );
}