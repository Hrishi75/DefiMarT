"use client";

import { useState, useEffect, ReactNode } from "react";
import EclipseMark from "./EclipseMark";
import { Icons } from "./Icons";
import DmButton from "./DmButton";
import { DmListing } from "./types";

/* ── Overlay backdrop ── */
function Overlay({ children, onClose }: { children: ReactNode; onClose?: (() => void) | null }) {
  return (
    <div
      onClick={onClose ?? undefined}
      style={{
        position: "fixed", inset: 0, zIndex: 250,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(4,3,8,0.7)", backdropFilter: "blur(8px)",
        padding: 20, animation: "dm-rise .25s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="dm-glass"
        style={{
          width: "100%", maxWidth: 440, borderRadius: 24, padding: 26, position: "relative",
          background: "rgba(17,15,24,0.92)", boxShadow: "0 40px 100px -30px rgba(0,0,0,0.9)",
        }}
      >
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--muted)", background: "var(--bg-2)", border: "none", cursor: "pointer",
            }}
          >
            <Icons.close size={16} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

/* ── Wallet modal ── */
const WALLETS = [
  { name: "Phantom",  tag: "Most popular", c: "#ab9ff2" },
  { name: "Solflare", tag: "",             c: "#ffae3c" },
  { name: "Backpack", tag: "",             c: "#e33e3f" },
];

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  onPick: (name: string) => void;
}

export function WalletModal({ open, onClose, onPick }: WalletModalProps) {
  if (!open) return null;
  return (
    <Overlay onClose={onClose}>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <EclipseMark size={48} />
        <h3 className="dm-display" style={{ fontSize: 24, fontWeight: 500, marginTop: 14 }}>Connect a wallet</h3>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>Sign in with your Solana wallet to trade.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {WALLETS.map((w) => (
          <button
            key={w.name}
            onClick={() => onPick(w.name)}
            className="dm-grad-border"
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 18px", borderRadius: 16, background: "var(--bg-2)",
              border: "1px solid var(--line)", cursor: "pointer", fontFamily: "inherit", width: "100%",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: w.c, display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>{w.name}</span>
            </span>
            {w.tag
              ? <span className="dm-mono" style={{ fontSize: 10.5, color: "var(--cyan)" }}>{w.tag}</span>
              : <Icons.arrowR size={17} />}
          </button>
        ))}
      </div>
      <p style={{ color: "var(--faint)", fontSize: 12, textAlign: "center", marginTop: 18 }}>By connecting you agree to the Defimart terms.</p>
    </Overlay>
  );
}

/* ── Buy / escrow modal ── */
interface BuyModalProps {
  item: DmListing | null;
  onClose: () => void;
  onDone: () => void;
}

export function BuyModal({ item, onClose, onDone }: BuyModalProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    if (step === 1) {
      const t = setTimeout(() => setStep(2), 1900);
      return () => clearTimeout(t);
    }
  }, [step]);

  if (!item) return null;

  const total = (item.price + 0.02).toFixed(2);

  return (
    <Overlay onClose={step === 1 ? null : onClose}>
      {step === 0 && (
        <div>
          <div className="dm-eyebrow" style={{ marginBottom: 16 }}>Confirm purchase</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "var(--bg-2)" }}>
              {item.kind === "photo" && item.src
                ? <img src={item.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", background: `hsl(${item.hue ?? 270} 70% 20%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{item.glyph}</div>}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25 }}>{item.title}</div>
              <div className="dm-mono" style={{ fontSize: 12, color: "var(--cyan)", marginTop: 4 }}>{item.event.name}</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
            {([["Item price", item.price], ["Shipping", 0.02], ["Network fee", 0.000005]] as const).map(([k, v], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "var(--muted)" }}>{k}</span>
                <span className="dm-mono">{v} SOL</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0 20px" }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Total in escrow</span>
            <span className="dm-mono" style={{ fontSize: 24, fontWeight: 700, display: "flex", alignItems: "baseline", gap: 5 }}>
              {total} <span style={{ color: "var(--cyan)", fontSize: 14 }}>SOL</span>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: "var(--grad-soft)", borderRadius: 12, marginBottom: 18, fontSize: 12.5, color: "var(--muted)" }}>
            <span style={{ color: "var(--cyan)", marginTop: 1 }}><Icons.lock size={16} /></span>
            Funds are held by the escrow program and released to the seller only when you confirm delivery.
          </div>

          <DmButton variant="primary" size="lg" style={{ width: "100%" }} onClick={() => setStep(1)}>
            <Icons.bolt size={18} /> Approve in wallet
          </DmButton>
        </div>
      )}

      {step === 1 && (
        <div style={{ textAlign: "center", padding: "30px 10px" }}>
          <div style={{ width: 80, height: 80, margin: "0 auto", borderRadius: "50%", border: "3px solid var(--line)", borderTopColor: "var(--violet)", animation: "dm-spin-slow .9s linear infinite" }} />
          <h3 className="dm-display" style={{ fontSize: 22, marginTop: 26 }}>Locking funds in escrow…</h3>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>Confirm the transaction in your wallet.</p>
        </div>
      )}

      {step === 2 && (
        <div style={{ textAlign: "center", padding: "20px 10px" }}>
          <div style={{ width: 76, height: 76, margin: "0 auto", borderRadius: "50%", background: "var(--grad)", color: "#0a0710", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.check size={38} sw={3} />
          </div>
          <h3 className="dm-display" style={{ fontSize: 24, marginTop: 22 }}>Secured in escrow</h3>
          <p style={{ color: "var(--muted)", fontSize: 14.5, marginTop: 8, maxWidth: 320, marginInline: "auto" }}>
            {total} SOL is locked. {item.seller.name} has been notified to ship your item.
          </p>
          <div className="dm-mono" style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 16, padding: "8px 12px", background: "var(--bg-2)", borderRadius: 10 }}>
            tx 5xQ…{item.id}…released_on_delivery
          </div>
          <DmButton variant="primary" size="lg" style={{ width: "100%", marginTop: 22 }} onClick={onDone}>
            Track my order
          </DmButton>
        </div>
      )}
    </Overlay>
  );
}

/* ── Toast ── */
interface ToastProps {
  message: string | null;
}

export function DmToast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div
      className="dm-glass dm-rise"
      style={{
        position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 300,
        padding: "13px 20px", borderRadius: 999, display: "flex", alignItems: "center", gap: 10,
        boxShadow: "0 20px 50px -20px rgba(0,0,0,0.9)", fontSize: 14, fontWeight: 600,
      }}
    >
      <span style={{ color: "var(--cyan)" }}><Icons.check size={17} sw={2.5} /></span>
      {message}
    </div>
  );
}
