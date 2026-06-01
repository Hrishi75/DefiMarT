"use client";

import Verified from "./Verified";
import { Icons } from "./Icons";
import { DmEvent } from "./types";

interface Filters {
  cats: Set<string>;
  conds: Set<string>;
  evs: Set<string>;
  nftOnly: boolean;
  verifiedOnly: boolean;
  maxPrice: number;
}

interface DmFilterSidebarProps {
  filters: Filters;
  events: DmEvent[];
  onToggleCat: (v: string) => void;
  onToggleCond: (v: string) => void;
  onToggleEv: (v: string) => void;
  onToggleNft: () => void;
  onToggleVerified: () => void;
  onMaxPrice: (v: number) => void;
  onClearAll: () => void;
  activeCount: number;
  allListings: { category: string }[];
}

const CATEGORIES = ["Apparel", "Collectible", "Accessory", "NFT"];
const CONDITIONS  = ["New", "Mint", "Like New", "Good"];

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: 22, marginBottom: 22, borderBottom: "1px solid var(--line)" }}>
      <div className="dm-eyebrow" style={{ marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}

function Check({ label, count, on, onClick }: { label: string; count?: number; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        width: "100%", padding: "7px 0",
        color: on ? "var(--text)" : "var(--muted)",
        background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 19, height: 19, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            background: on ? "var(--grad)" : "transparent",
            border: on ? "none" : "1px solid var(--line-3)",
            color: "#0a0710",
          }}
        >
          {on && <Icons.check size={13} sw={3} />}
        </span>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
      </span>
      {count != null && <span className="dm-mono" style={{ fontSize: 12, color: "var(--faint)" }}>{count}</span>}
    </button>
  );
}

export default function DmFilterSidebar({
  filters, events, onToggleCat, onToggleCond, onToggleEv,
  onToggleNft, onToggleVerified, onMaxPrice, onClearAll, activeCount, allListings,
}: DmFilterSidebarProps) {
  return (
    <aside
      className="dm-panel dm-filter-sidebar"
      style={{ padding: 22, position: "sticky", top: 90 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 15 }}>
          <Icons.sliders size={17} /> Filters
        </span>
        {activeCount > 0 && (
          <button
            onClick={onClearAll}
            className="dm-mono"
            style={{ fontSize: 11, color: "var(--cyan)", background: "none", border: "none", cursor: "pointer" }}
          >
            CLEAR ({activeCount})
          </button>
        )}
      </div>

      <FilterSection title="Category">
        {CATEGORIES.map((c) => (
          <Check
            key={c} label={c}
            count={allListings.filter((l) => l.category === c).length}
            on={filters.cats.has(c)}
            onClick={() => onToggleCat(c)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Max price (SOL)">
        <input
          type="range" min="0.3" max="10" step="0.1"
          value={filters.maxPrice}
          onChange={(e) => onMaxPrice(parseFloat(e.target.value))}
          style={{ width: "100%", accentColor: "#9b5cff" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span className="dm-mono" style={{ fontSize: 12, color: "var(--muted)" }}>0.3</span>
          <span className="dm-mono" style={{ fontSize: 12, color: "var(--cyan)" }}>≤ {filters.maxPrice.toFixed(1)} SOL</span>
        </div>
      </FilterSection>

      <FilterSection title="Condition">
        {CONDITIONS.map((c) => (
          <Check key={c} label={c} on={filters.conds.has(c)} onClick={() => onToggleCond(c)} />
        ))}
      </FilterSection>

      <FilterSection title="Event">
        {events.map((ev) => (
          <button
            key={ev.id}
            onClick={() => onToggleEv(ev.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "7px 0",
              color: filters.evs.has(ev.id) ? "var(--text)" : "var(--muted)",
              background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: ev.color, flexShrink: 0, boxShadow: filters.evs.has(ev.id) ? `0 0 8px ${ev.color}` : "none" }} />
            <span style={{ fontSize: 14, fontWeight: 500, textAlign: "left", flex: 1 }}>{ev.name}</span>
            {ev.verified && <Verified size={13} />}
          </button>
        ))}
      </FilterSection>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 2 }}>
        <Check label="NFT / cNFT only"         on={filters.nftOnly}      onClick={onToggleNft} />
        <Check label="Verified events only"     on={filters.verifiedOnly} onClick={onToggleVerified} />
      </div>
    </aside>
  );
}
