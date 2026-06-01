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
  { href: "/docs",       label: "Docs" },
];

export default function DmNavbar({ wallet, onConnect, onWalletClick }: DmNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <>
      <div style={{ position: "sticky", top: 0, zIndex: 100, padding: "16px 0", transition: "padding .3s" }}>
        <div className="dm-container">
          <div
            className="dm-glass"
            style={{
              borderRadius: 999,
              padding: "9px 9px 9px 20px",
              display: "flex",
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

            {/* desktop nav links */}
            <nav
              className="dm-nav-desktop"
              style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center", flex: 1 }}
            >
              {links.map((l) => {
                const active = isActive(l.href);
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

            {/* desktop right actions */}
            <div
              className="dm-nav-actions-desktop"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
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

            {/* mobile hamburger — spacer pushes it right */}
            <div className="dm-nav-mobile-spacer" style={{ flex: 1 }} />
            <button
              className="dm-nav-mobile-btn"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              style={{
                width: 40, height: 40, borderRadius: 999,
                background: "rgba(255,255,255,0.04)", border: "1px solid var(--line-2)",
                color: "var(--text)", cursor: "pointer",
                alignItems: "center", justifyContent: "center",
                fontFamily: "inherit",
              }}
            >
              <Icons.menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="dm-mobile-drawer" role="dialog" aria-modal="true">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <Logo size={28} />
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              style={{
                width: 40, height: 40, borderRadius: 999,
                background: "rgba(255,255,255,0.04)", border: "1px solid var(--line-2)",
                color: "var(--text)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "inherit",
              }}
            >
              <Icons.close size={18} />
            </button>
          </div>

          <nav style={{ display: "flex", flexDirection: "column" }}>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={isActive(l.href) ? "active" : undefined}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/marketplace/create" onClick={() => setOpen(false)}>
              <DmButton variant="dark" size="lg">
                <Icons.plus size={16} /> Sell an item
              </DmButton>
            </Link>
            {wallet ? (
              <button
                onClick={() => { setOpen(false); onWalletClick?.(); }}
                className="dm-grad-border"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  height: 48, padding: "0 18px", borderRadius: 999,
                  background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)",
                  color: "var(--text)", cursor: "pointer", fontFamily: "inherit",
                  width: "100%",
                }}
              >
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--grad)", display: "inline-block", flexShrink: 0 }} />
                <span className="dm-mono" style={{ fontSize: 14 }}>{wallet}</span>
              </button>
            ) : (
              <DmButton variant="primary" size="lg" onClick={() => { setOpen(false); onConnect?.(); }}>
                <Icons.wallet size={18} /> Connect wallet
              </DmButton>
            )}
          </div>
        </div>
      )}
    </>
  );
}
