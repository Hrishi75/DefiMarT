"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/dm/Icons";
import MarketControls from "@/components/dm/MarketControls";
import DmFilterSidebar from "@/components/dm/DmFilterSidebar";
import ListingCard from "@/components/dm/ListingCard";
import ListRow from "@/components/dm/ListRow";
import { DM_LISTINGS, DM_EVENTS } from "@/components/dm/mockData";

export default function MarketplacePage() {
  const router = useRouter();

  const [cats, setCats]               = useState(new Set<string>());
  const [conds, setConds]             = useState(new Set<string>());
  const [evs, setEvs]                 = useState(new Set<string>());
  const [nftOnly, setNftOnly]         = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxPrice, setMaxPrice]       = useState(10);
  const [sort, setSort]               = useState("popular");
  const [view, setView]               = useState<"grid" | "list">("grid");
  const [q, setQ]                     = useState("");
  const [faves, setFaves]             = useState(new Set<string>(["l3"]));

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void) => (v: string) => {
    const n = new Set(set);
    n.has(v) ? n.delete(v) : n.add(v);
    setter(n);
  };

  const clearAll = () => { setCats(new Set()); setConds(new Set()); setEvs(new Set()); setNftOnly(false); setVerifiedOnly(false); setMaxPrice(10); };

  const activeCount = cats.size + conds.size + evs.size + (nftOnly ? 1 : 0) + (verifiedOnly ? 1 : 0) + (maxPrice < 10 ? 1 : 0);

  const filtered = useMemo(() => {
    let list = DM_LISTINGS.filter((l) => {
      if (cats.size && !cats.has(l.category)) return false;
      if (conds.size && !conds.has(l.condition)) return false;
      if (evs.size && !evs.has(l.event.id)) return false;
      if (nftOnly && !l.nft) return false;
      if (verifiedOnly && !l.event.verified) return false;
      if (l.price > maxPrice) return false;
      if (q && !(l.title + l.event.name + l.category).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === "price-asc")  return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "popular")    return b.views - a.views;
      return 0;
    });
  }, [cats, conds, evs, nftOnly, verifiedOnly, maxPrice, q, sort]);

  const toggleFave = (id: string) => setFaves((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="dm-container" style={{ paddingTop: 28, paddingBottom: 80, position: "relative" }}>
      {/* bg blob */}
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", filter: "blur(80px)", background: "rgba(155,92,255,0.10)", right: "-15%", top: "-10%", pointerEvents: "none" }} />

      {/* header */}
      <div style={{ position: "relative", marginBottom: 30 }}>
        <span className="dm-eyebrow">Marketplace</span>
        <h1 className="dm-display" style={{ fontSize: 52, fontWeight: 500, marginTop: 12 }}>
          Discover event <span className="dm-grad-text">collectibles</span>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 17, marginTop: 12 }}>Verified merch and passes from Solana events worldwide.</p>
      </div>

      <MarketControls q={q} onQ={setQ} sort={sort} onSort={setSort} view={view} onView={setView} />

      <div style={{ display: "grid", gridTemplateColumns: "248px 1fr", gap: 28, alignItems: "start" }} className="dm-market-grid">
        <DmFilterSidebar
          filters={{ cats, conds, evs, nftOnly, verifiedOnly, maxPrice }}
          events={DM_EVENTS}
          onToggleCat={toggle(cats, setCats)}
          onToggleCond={toggle(conds, setConds)}
          onToggleEv={toggle(evs, setEvs)}
          onToggleNft={() => setNftOnly(!nftOnly)}
          onToggleVerified={() => setVerifiedOnly(!verifiedOnly)}
          onMaxPrice={setMaxPrice}
          onClearAll={clearAll}
          activeCount={activeCount}
          allListings={DM_LISTINGS}
        />

        {/* results */}
        <div>
          <div style={{ marginBottom: 18 }}>
            <span style={{ color: "var(--muted)", fontSize: 14 }}>
              <span style={{ color: "var(--text)", fontWeight: 700 }}>{filtered.length}</span> items
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="dm-panel" style={{ padding: 70, textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center" }}><Icons.search size={40} /></div>
              <h3 className="dm-display" style={{ fontSize: 22, marginTop: 16 }}>Nothing matches</h3>
              <p style={{ color: "var(--muted)", marginTop: 6 }}>Try loosening your filters.</p>
              <button
                onClick={clearAll}
                style={{
                  marginTop: 18, height: 40, padding: "0 18px", borderRadius: 999, fontSize: 14, fontWeight: 600,
                  background: "rgba(255,255,255,0.04)", border: "1px solid var(--line-2)", color: "var(--text)", cursor: "pointer",
                }}
              >
                Clear filters
              </button>
            </div>
          ) : view === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="dm-results-grid">
              {filtered.map((it, i) => (
                <ListingCard key={it.id} item={it} faves={faves} onToggleFave={toggleFave} onNavigate={(id) => router.push(`/marketplace/${id}`)} delay={i * 0.04} />
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((it) => (
                <ListRow key={it.id} item={it} faves={faves} onToggleFave={toggleFave} onNavigate={(id) => router.push(`/marketplace/${id}`)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
