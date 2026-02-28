import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import logoPng from "@/assets/images/Defimart logo.png";
import Navbar from "@/sections/Navbar";
import Footer from "@/sections/Footer";
import { WalletProvider } from "@/components/WalletProvider";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
    axes: ["opsz"],
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
                className={`${inter.variable} font-sans antialiased bg-neutral-950 text-white`}
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