"use client";

import { Icons } from "./Icons";

interface MarketControlsProps {
  q: string;
  onQ: (v: string) => void;
  sort: string;
  onSort: (v: string) => void;
  view: "grid" | "list";
  onView: (v: "grid" | "list") => void;
}

export default function MarketControls({ q, onQ, sort, onSort, view, onView }: MarketControlsProps) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
      {/* search */}
      <div
        className="dm-glass"
        style={{ flex: 1, minWidth: 260, height: 50, padding: "0 18px", borderRadius: 999, display: "flex", alignItems: "center", gap: 10, color: "var(--muted)" }}
      >
        <Icons.search size={19} />
        <input
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder="Search items, events, sellers…"
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "var(--text)", fontSize: 15, fontFamily: "inherit",
          }}
        />
      </div>

      {/* sort */}
      <div
        className="dm-glass"
        style={{ height: 50, borderRadius: 999, padding: "0 6px 0 18px", display: "flex", alignItems: "center", gap: 10 }}
      >
        <span style={{ fontSize: 13, color: "var(--faint)" }}>Sort</span>
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          style={{
            height: 50, background: "transparent", border: "none", outline: "none",
            color: "var(--text)", fontSize: 14, fontWeight: 600, cursor: "pointer",
            paddingRight: 10, fontFamily: "inherit",
          }}
        >
          <option value="popular"    style={{ background: "#15131d" }}>Most popular</option>
          <option value="price-asc"  style={{ background: "#15131d" }}>Price: low → high</option>
          <option value="price-desc" style={{ background: "#15131d" }}>Price: high → low</option>
          <option value="newest"     style={{ background: "#15131d" }}>Newest</option>
        </select>
      </div>

      {/* view toggle */}
      <div
        className="dm-glass"
        style={{ height: 50, borderRadius: 999, padding: 5, display: "flex", gap: 3 }}
      >
        {([["grid", Icons.grid], ["list", Icons.list]] as const).map(([k, Icon]) => (
          <button
            key={k}
            onClick={() => onView(k)}
            style={{
              width: 40, height: 40, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
              background: view === k ? "var(--grad)" : "transparent",
              color: view === k ? "#0a0710" : "var(--muted)",
              border: "none", cursor: "pointer",
            }}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}
