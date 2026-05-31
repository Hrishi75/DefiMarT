"use client";

import { useState } from "react";
import ArtTile from "./ArtTile";
import { Icons } from "./Icons";
import { DmListing } from "./types";

interface MediaView {
  kind: "photo" | "art";
  src?: string;
  hue?: number;
  glyph?: string;
  big?: boolean;
}

function buildViews(item: DmListing): MediaView[] {
  if (item.kind === "photo") {
    return [
      { kind: "photo", src: item.src },
      { kind: "art",   hue: item.hue ?? 270, glyph: "◑" },
      { kind: "art",   hue: 200,              glyph: "✦" },
    ];
  }
  return [
    { kind: "art", hue: item.hue,                  glyph: item.glyph, big: true },
    { kind: "art", hue: ((item.hue ?? 270) + 40) % 360, glyph: "◑" },
    { kind: "art", hue: ((item.hue ?? 270) + 80) % 360, glyph: "✦" },
  ];
}

function RenderMedia({ m, big = false, fill = false }: { m: MediaView; big?: boolean; fill?: boolean }) {
  if (m.kind === "photo" && m.src) {
    return <img src={m.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  }
  return <ArtTile hue={m.hue} glyph={m.glyph} big={big || fill} />;
}

interface ProductGalleryProps {
  item: DmListing;
  faved: boolean;
  onToggleFave: () => void;
}

export default function ProductGallery({ item, faved, onToggleFave }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const views = buildViews(item);

  return (
    <div style={{ position: "sticky", top: 90 }}>
      {/* main image */}
      <div className="dm-grad-border" style={{ borderRadius: "var(--r-lg)" }}>
        <div
          style={{
            position: "relative", aspectRatio: "1/1", borderRadius: "var(--r-lg)",
            overflow: "hidden", border: "1px solid var(--line)", background: "var(--bg-2)",
          }}
        >
          <RenderMedia m={views[active]} big fill />

          {item.nft && (
            <span
              className="dm-mono"
              style={{
                position: "absolute", top: 16, left: 16,
                fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                padding: "6px 12px", borderRadius: 999,
                background: "var(--grad)", color: "#0a0710",
              }}
            >
              NFT
            </span>
          )}

          <button
            onClick={onToggleFave}
            className="dm-glass"
            style={{
              position: "absolute", top: 16, right: 16,
              width: 42, height: 42, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: faved ? "var(--magenta)" : "#fff",
              border: "none", cursor: "pointer",
            }}
          >
            <Icons.heart size={19} fill={faved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* thumbnails */}
      <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
        {views.map((m, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              width: 84, height: 84, borderRadius: 14, overflow: "hidden", flexShrink: 0,
              border: active === i ? "1px solid transparent" : "1px solid var(--line)",
              boxShadow: active === i ? "0 0 0 2px var(--violet)" : "none",
              padding: 0, cursor: "pointer", background: "var(--bg-2)",
            }}
          >
            <RenderMedia m={m} />
          </button>
        ))}
      </div>
    </div>
  );
}
