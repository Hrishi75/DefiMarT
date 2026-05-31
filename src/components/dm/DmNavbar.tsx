"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { Icons } from "./Icons";
import DmButton from "./DmButton";

interface DmNavbarProps {
  wallet?: string | null;
  onConnect?: () => void;
  onWalletClick?: () => void;
}

const links = [
  { href: "/",           label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/drops",      label: "Drops" },
  { href: "/feed",       label: "Feed" },
];

export default function DmNavbar({ wallet, onConnect, onWalletClick }: DmNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100, padding: "16px 0", transition: "padding .3s" }}>
      <div className="dm-container">
        <div
          className="dm-glass"
          style={{
            borderRadius: 999,
            padding: "9px 9px 9px 20px",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: 16,
            boxShadow: scrolled ? "0 16px 50px -20px rgba(0,0,0,0.9)" : "none",
            background: scrolled ? "rgba(8,7,12,0.82)" : undefined,
            transition: "box-shadow .3s, background .3s",
          }}
        >
          {/* logo */}
          <Link href="/" style={{ display: "flex" }}>
            <Logo size={30} />
          </Link>

          {/* nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
            {links.map((l) => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 600,
                    color: active ? "var(--text)" : "var(--muted)",
                    background: active ? "rgba(255,255,255,0.06)" : "transparent",
                    position: "relative",
                    transition: "color .2s, background .2s",
                    textDecoration: "none",
                  }}
                >
                  {l.label}
                  {active && (
                    <span
                      style={{
                        position: "absolute",
                        left: "50%",
                        bottom: 3,
                        transform: "translateX(-50%)",
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "var(--grad)",
                        display: "block",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifySelf: "end" }}>
            <Link
              href="/marketplace"
              style={{
                width: 40, height: 40, borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center", color: "var(--muted)",
              }}
            >
              <Icons.search size={19} />
            </Link>

            <Link href="/marketplace/create">
              <DmButton variant="dark" size="sm">
                <Icons.plus size={16} /> Sell
              </DmButton>
            </Link>

            {wallet ? (
              <button
                onClick={onWalletClick}
                className="dm-grad-border"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  height: 40, padding: "0 14px 0 8px", borderRadius: 999,
                  background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)",
                  color: "var(--text)", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--grad)", display: "inline-block", flexShrink: 0 }} />
                <span className="dm-mono" style={{ fontSize: 13 }}>{wallet}</span>
              </button>
            ) : (
              <DmButton variant="primary" size="sm" onClick={onConnect}>
                <Icons.wallet size={16} /> Connect
              </DmButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
