"use client"
import DefimartLogo from "@/components/logo"
import WalletButton from "@/components/WalletButton";
import Link from "next/link";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
    { label: "Home", href: "/" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Feed", href: "/feed" },
    { label: "Features", href: "/#features" },
    { label: "FAQs", href: "/#faqs" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
    <section className="py-4 lg:py-8 fixed w-full top-0 z-50">
        <div className="container max-w-6xl">
            <div className="border border-white/15 rounded-[27px] md:rounded-full bg-neutral-950/90 backdrop-blur">
            <div className="grid grid-cols-2 lg:grid-cols-3 p-2 px-3 md:px-4 md:pr-2 items-center gap-2">
                {/* Logo */}
                <div className="flex items-center">
                     <Link href="/">
                        <DefimartLogo className="h-8 md:h-9 w-auto" alt="Defimart logo"/>
                     </Link>
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden lg:flex justify-center items-center">
                    <nav className="flex gap-4 xl:gap-6 font-medium text-sm">
                        {navLinks.map((link) => (
                            <Link 
                                href={link.href} 
                                key={link.label} 
                                className="hover:text-lime-400 transition whitespace-nowrap"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Right Side - Wallet Button & Mobile Menu */}
                <div className="flex justify-end items-center gap-2 md:gap-3">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition"
                        aria-label="Toggle menu"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <line x1="3" y1="6" x2="21" y2="6" className={twMerge("origin-left transition", isOpen && 'rotate-45 -translate-y-1')}></line>
                            <line x1="3" y1="12" x2="21" y2="12" className={twMerge("transition", isOpen && "opacity-0")}></line>
                            <line x1="3" y1="18" x2="21" y2="18" className={twMerge("origin-left transition", isOpen && '-rotate-45 translate-y-1')}></line>
                        </svg>
                    </button>

                    {/* Wallet Button - Desktop */}
                    <div className="hidden md:block">
                        <WalletButton variant="primary" showAddress={true} />
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
            {isOpen && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden lg:hidden"
            >
                <div className="flex flex-col items-center gap-4 py-6 border-t border-white/10 mt-2">
                    {/* Mobile Nav Links */}
                    {navLinks.map(link => (
                        <Link 
                            href={link.href} 
                            key={link.label} 
                            className="hover:text-lime-400 transition text-base" 
                            onClick={() => setIsOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    
                    {/* Mobile Wallet Button */}
                    <div className="pt-2">
                        <WalletButton variant="primary" showAddress={false} />
                    </div>
                </div>
            </motion.div>
            )}
            </AnimatePresence>
            </div>
        </div>
    </section>
    
    {/* Spacer to prevent content from going under fixed navbar */}
    <div className="h-[70px] md:h-[86px] lg:h-[98px]"></div>
    </>
    );
}