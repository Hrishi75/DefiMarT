"use client";

import Link from "next/link";
import Verified from "@/components/dm/Verified";
import Chip from "@/components/dm/Chip";
import DmButton from "@/components/dm/DmButton";
import { Icons } from "@/components/dm/Icons";

interface DmHeroProps {
  onConnect?: () => void;
}

function HeroEclipse() {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", maxWidth: 520, margin: "0 auto" }}>
      {/* bg glow blob */}
      <div
        style={{
          position: "absolute", width: "90%", height: "90%", left: "5%", top: "5%",
          borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none",
          background: "rgba(155,92,255,0.28)", animation: "dm-pulse-glow 6s ease-in-out infinite",
        }}
      />
      {/* eclipse logo with baked alpha (black bg made transparent) — blends on any bg */}
      <img
        src="/dm-assets/eclipse-glow.png"
        alt="Eclipse"
        style={{
          position: "relative", width: "100%", height: "100%", objectFit: "contain",
          animation: "dm-floaty 9s ease-in-out infinite",
        }}
      />
      {/* floating verified chip */}
      <div
        className="dm-glass"
        style={{
          position: "absolute", top: "12%", right: "-4%",
          padding: "9px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 6,
          animation: "dm-floaty 7s ease-in-out infinite",
        }}
      >
        <Verified size={15} /> On-chain verified
      </div>
      {/* floating escrow chip */}
      <div
        className="dm-glass"
        style={{
          position: "absolute", bottom: "14%", left: "-8%",
          padding: "9px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 6,
          animation: "dm-floaty 8s ease-in-out infinite",
          animationDelay: ".5s",
        }}
      >
        <Icons.lock size={15} /> Escrow protected
      </div>
    </div>
  );
}

const AVATARS = ["/dm-assets/avatar-1.jpg", "/dm-assets/avatar-2.jpg", "/dm-assets/avatar-4.jpg", "/dm-assets/avatar-3.jpg"];

export default function DmHero({ onConnect }: DmHeroProps) {
  return (
    <section className="dm-hero" style={{ position: "relative", overflow: "hidden", paddingTop: 40 }}>
      {/* bg blobs */}
      <div style={{ position: "absolute", width: 720, height: 720, borderRadius: "50%", filter: "blur(80px)", background: "rgba(79,134,255,0.14)", left: "-15%", top: "-20%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 620, height: 620, borderRadius: "50%", filter: "blur(80px)", background: "rgba(210,75,255,0.12)", right: "-12%", top: "10%", pointerEvents: "none" }} />

      <div className="dm-container" style={{ position: "relative" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 40, alignItems: "center" }}
          className="dm-hero-grid"
        >
          {/* left: copy */}
          <div className="dm-rise">
            <Chip pill>
              <Icons.spark size={14} /> <span style={{ fontWeight: 600 }}>Now live on mainnet-beta</span>
            </Chip>

            <h1
              className="dm-display"
              style={{ fontSize: "clamp(46px, 6vw, 82px)", fontWeight: 500, marginTop: 26, lineHeight: 0.96 }}
            >
              Event culture,<br />traded <span className="dm-grad-text">on-chain.</span>
            </h1>

            <p style={{ color: "var(--muted)", fontSize: 19, lineHeight: 1.55, marginTop: 24, maxWidth: 480 }}>
              A social marketplace for the merch, passes, and collectibles from blockchain conferences — every listing verified, every trade escrowed.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 34 }}>
              <Link href="/marketplace">
                <DmButton variant="primary" size="lg">Browse the market <Icons.arrowR size={18} /></DmButton>
              </Link>
              <DmButton variant="ghost" size="lg" onClick={onConnect}>
                <Icons.wallet size={18} /> Connect wallet
              </DmButton>
            </div>

            {/* social proof */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 34 }}>
              <div style={{ display: "flex", marginLeft: 4 }}>
                {AVATARS.map((a, i) => (
                  <img
                    key={i}
                    src={a}
                    alt=""
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      border: "2px solid var(--bg)", marginLeft: i ? -10 : 0, objectFit: "cover",
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--muted)" }}>
                <span style={{ color: "var(--text)", fontWeight: 700 }}>4</span> collectors trading on-chain
              </div>
            </div>
          </div>

          {/* right: eclipse visual */}
          <div className="dm-rise" style={{ animationDelay: ".15s" }}>
            <HeroEclipse />
          </div>
        </div>
      </div>
    </section>
  );
}
