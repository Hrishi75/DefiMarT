"use client";

import { useState } from "react";
import Image from "next/image";
import ArtTile from "./ArtTile";
import Verified from "./Verified";
import { Icons } from "./Icons";
import { DmListing } from "./types";

interface ListingCardProps {
  item: DmListing;
  onNavigate?: (id: string) => void;
  faves?: Set<string>;
  onToggleFave?: (id: string) => void;
  delay?: number;
}

export default function ListingCard({ item, onNavigate, faves, onToggleFave, delay = 0 }: ListingCardProps) {
  const fav = faves?.has(item.id) ?? false;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="dm-grad-border dm-rise"
      style={{ borderRadius: "var(--r-lg)", animationDelay: `${delay}s` }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onNavigate?.(item.id)}
        onKeyDown={(e) => { if (e.key === "Enter") onNavigate?.(item.id); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "block",
          width: "100%",
          textAlign: "left",
          borderRadius: "var(--r-lg)",
          overflow: "hidden",
          cursor: "pointer",
          background: "var(--bg-1)",
          border: "1px solid var(--line)",
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
          transition: "transform .35s cubic-bezier(.2,.7,.2,1)",
        }}
      >
        {/* media */}
        <div style={{ position: "relative", aspectRatio: "1 / 1", overflow: "hidden", background: "var(--bg-2)" }}>
          {item.kind === "photo" && item.src ? (
            <img
              src={item.src}
              alt={item.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: hovered ? "scale(1.07)" : "scale(1)",
                transition: "transform .6s ease",
              }}
            />
          ) : (
            <ArtTile hue={item.hue} glyph={item.glyph} label={item.category} />
          )}

          {/* top badges */}
          <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between" }}>
            {item.nft ? (
              <span
                className="dm-mono"
                style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                  padding: "5px 10px", borderRadius: 999,
                  background: "var(--grad)", color: "#0a0710",
                }}
              >
                NFT
              </span>
            ) : <span />}
            {item.event.verified && (
              <span
                className="dm-glass"
                style={{ padding: "5px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}
              >
                <Verified size={13} /> Verified
              </span>
            )}
          </div>

          {/* fave button */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFave?.(item.id); }}
            className="dm-glass"
            style={{
              position: "absolute", bottom: 12, right: 12,
              width: 36, height: 36, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: fav ? "var(--magenta)" : "#fff",
              border: "none", cursor: "pointer",
            }}
          >
            <Icons.heart size={17} fill={fav ? "currentColor" : "none"} />
          </button>

          {/* condition badge */}
          <span
            className="dm-glass"
            style={{ position: "absolute", bottom: 12, left: 12, padding: "5px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600 }}
          >
            {item.condition}
          </span>
        </div>

        {/* body */}
        <div style={{ padding: 16 }}>
          <div style={{ marginBottom: 9 }}>
            <span className="dm-mono" style={{ fontSize: 11, color: "var(--cyan)", letterSpacing: "0.04em" }}>{item.event.name}</span>
          </div>
          <h3
            className="dm-display"
            style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.2, marginBottom: 14, minHeight: 41 }}
          >
            {item.title}
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div className="dm-mono" style={{ fontSize: 21, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 5 }}>
                {item.price} <span style={{ color: "var(--cyan)", fontSize: 14, fontWeight: 600 }}>SOL</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--faint)" }}>≈ ${item.usd}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--faint)", fontSize: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icons.eye size={14} />{item.views > 999 ? `${(item.views / 1000).toFixed(1)}k` : item.views}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icons.heart size={14} />{item.faves}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
