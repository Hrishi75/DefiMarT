"use client";

import ArtTile from "./ArtTile";
import Verified from "./Verified";
import { Icons } from "./Icons";
import { DmListing } from "./types";

interface ListRowProps {
  item: DmListing;
  onNavigate?: (id: string) => void;
  faves?: Set<string>;
  onToggleFave?: (id: string) => void;
}

export default function ListRow({ item, onNavigate, faves, onToggleFave }: ListRowProps) {
  const fav = faves?.has(item.id) ?? false;
  return (
    <button
      onClick={() => onNavigate?.(item.id)}
      className="dm-grad-border dm-rise"
      style={{
        display: "grid",
        gridTemplateColumns: "150px 1fr auto",
        gap: 20,
        textAlign: "left",
        background: "var(--bg-1)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r)",
        overflow: "hidden",
        alignItems: "stretch",
        width: "100%",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {/* thumbnail */}
      <div style={{ position: "relative", height: 150, background: "var(--bg-2)" }}>
        {item.kind === "photo" && item.src ? (
          <img src={item.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <ArtTile hue={item.hue} glyph={item.glyph} />
        )}
        {item.nft && (
          <span
            className="dm-mono"
            style={{
              position: "absolute", top: 8, left: 8,
              fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 999,
              background: "var(--grad)", color: "#0a0710",
            }}
          >
            NFT
          </span>
        )}
      </div>

      {/* info */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span className="dm-mono" style={{ fontSize: 11, color: "var(--cyan)" }}>{item.event.name}</span>
          {item.event.verified && <Verified size={12} />}
          <span style={{ color: "var(--ghost)" }}>·</span>
          <span style={{ fontSize: 12, color: "var(--faint)" }}>{item.category}</span>
        </div>
        <h3 className="dm-display" style={{ fontSize: 19, fontWeight: 500, marginBottom: 6 }}>{item.title}</h3>
        <p style={{ color: "var(--muted)", fontSize: 13.5, maxWidth: 560, lineHeight: 1.5 }}>{item.desc}</p>
      </div>

      {/* price + fave */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", padding: "16px 22px", gap: 10 }}>
        <div style={{ textAlign: "right" }}>
          <div className="dm-mono" style={{ fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5 }}>
            {item.price} <span style={{ color: "var(--cyan)", fontSize: 13 }}>SOL</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--faint)" }}>≈ ${item.usd}</div>
        </div>
        <span
          onClick={(e) => { e.stopPropagation(); onToggleFave?.(item.id); }}
          style={{ display: "flex", alignItems: "center", gap: 5, color: fav ? "var(--magenta)" : "var(--muted)", fontSize: 13, cursor: "pointer" }}
        >
          <Icons.heart size={16} fill={fav ? "currentColor" : "none"} /> {item.faves}
        </span>
      </div>
    </button>
  );
}
