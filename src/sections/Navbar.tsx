"use client"
import DefimartLogo from "@/components/logo"
import WalletButton from "@/components/WalletButton";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
    { label: "Home", href: "/" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Feed", href: "/feed" },
    { label: "Messages", href: "/messages" },
    { label: "Orders", href: "/orders" },
    { label: "FAQs", href: "/#faqs" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    const pathname = usePathname();

    function isActive(href: string) {
        if (href === "/") return pathname === "/";
        if (href.startsWith("/#")) return false; // anchor links are never "active"
        return pathname.startsWith(href);
    }

    return (
        <>
    <section className="py-4 lg:py-8 fixed w-full top-0 z-50">
        <div className="container max-w-6xl">
            {/* Outer glow wrapper */}
            <div className="rounded-[27px] md:rounded-full shadow-[0_0_40px_-8px_rgba(163,230,53,0.2)] p-[1px]"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(163,230,53,0.12) 50%, rgba(255,255,255,0.05) 100%)" }}
            >
            <div className="rounded-[26px] md:rounded-full bg-neutral-950/85 backdrop-blur-xl">
            <div className="grid grid-cols-2 lg:grid-cols-[auto_1fr_auto] p-2 px-3 md:px-4 md:pr-2 items-center gap-2">
                {/* Logo */}
                <div className="flex items-center">
                     <Link href="/">
                        <DefimartLogo className="h-8 md:h-9 w-auto" alt="Defimart logo"/>
                     </Link>
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden lg:flex justify-center items-center">
                    <nav className="flex gap-1 font-medium text-sm">
                        {navLinks.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <Link
                                    href={link.href}
                                    key={link.label}
                                    className={twMerge(
                                        "relative px-3 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap",
                                        active
                                            ? "text-lime-400 bg-lime-400/10"
                                            : "text-white/60 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {link.label}
                                    {active && (
                                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-lime-400" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Right Side */}
                <div className="flex justify-end items-center gap-1 md:gap-1.5">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-2 hover:bg-white/5 rounded-full transition"
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

                    {/* Search Icon - Desktop */}
                    <Link
                        href="/search"
                        className={twMerge(
                            "hidden md:flex w-9 h-9 items-center justify-center rounded-full transition-all duration-200",
                            pathname === "/search"
                                ? "bg-lime-400/10 text-lime-400"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                        aria-label="Search"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </Link>

                    {/* Notification Bell */}
                    <div className="hidden md:block">
                        <NotificationBell />
                    </div>

                    {/* Divider */}
                    {isAuthenticated && (
                        <div className="hidden md:block w-px h-5 bg-white/10 mx-1" />
                    )}

                    {/* Sell Button */}
                    {isAuthenticated && (
                        <Link
                            href="/marketplace/create"
                            className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-lime-400 text-neutral-950 rounded-full font-semibold text-sm hover:bg-lime-300 transition-all hover:shadow-[0_0_16px_rgba(163,230,53,0.5)]"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Sell
                        </Link>
                    )}

                    {/* Wallet Button */}
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
                <div className="flex flex-col items-center gap-1 py-6 border-t border-white/10 mt-2 px-4">
                    {navLinks.map(link => {
                        const active = isActive(link.href);
                        return (
                            <Link
                                href={link.href}
                                key={link.label}
                                onClick={() => setIsOpen(false)}
                                className={twMerge(
                                    "w-full text-center py-2.5 px-4 rounded-full transition font-medium",
                                    active
                                        ? "text-lime-400 bg-lime-400/10"
                                        : "text-white/70 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                    {isAuthenticated && (
                        <Link
                            href="/notifications"
                            onClick={() => setIsOpen(false)}
                            className={twMerge(
                                "w-full text-center py-2.5 px-4 rounded-full transition font-medium",
                                pathname === "/notifications"
                                    ? "text-lime-400 bg-lime-400/10"
                                    : "text-white/70 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Notifications
                        </Link>
                    )}
                    <div className="pt-3 w-full flex justify-center">
                        <WalletButton variant="primary" showAddress={false} />
                    </div>
                </div>
            </motion.div>
            )}
            </AnimatePresence>
            </div>
            </div>
        </div>
    </section>

    {/* Spacer */}
    <div className="h-[70px] md:h-[86px] lg:h-[98px]"></div>
    </>
    );
}
