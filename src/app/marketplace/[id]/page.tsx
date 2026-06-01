"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductGallery from "@/components/dm/ProductGallery";
import ProductPriceCard from "@/components/dm/ProductPriceCard";
import ProductTabs from "@/components/dm/ProductTabs";
import ProductAuthenticity from "@/components/dm/ProductAuthenticity";
import ListingCard from "@/components/dm/ListingCard";
import Chip from "@/components/dm/Chip";
import Verified from "@/components/dm/Verified";
import { Icons } from "@/components/dm/Icons";
import { DM_LISTINGS, DM_REVIEWS } from "@/components/dm/mockData";

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const item = DM_LISTINGS.find((l) => l.id === params.id) ?? DM_LISTINGS[0];
  const [faves, setFaves] = useState(new Set<string>(["l3"]));
  const [wallet] = useState<string | null>(null);
  const [buyItem, setBuyItem] = useState<typeof item | null>(null);

  const faved = faves.has(item.id);
  const toggleFave = (id: string) => setFaves((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const more = DM_LISTINGS.filter((l) => l.event.id === item.event.id && l.id !== item.id).slice(0, 3);
  const moreFill = more.length < 3 ? DM_LISTINGS.filter((l) => l.id !== item.id).slice(0, 3) : more;

  return (
    <div className="dm-container" style={{ paddingTop: 24, paddingBottom: 80, position: "relative" }}>
      {/* bg blob */}
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", filter: "blur(80px)", background: "rgba(79,134,255,0.10)", left: "-18%", top: "-5%", pointerEvents: "none" }} />

      {/* breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--faint)", marginBottom: 24 }}>
        <Link href="/" style={{ color: "var(--faint)" }}>Home</Link>
        <Icons.chevD size={13} style={{ transform: "rotate(-90deg)" }} />
        <Link href="/marketplace" style={{ color: "var(--faint)" }}>Marketplace</Link>
        <Icons.chevD size={13} style={{ transform: "rotate(-90deg)" }} />
        <span style={{ color: "var(--muted)" }}>{item.title}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 44, alignItems: "start" }} className="dm-product-grid">
        {/* gallery */}
        <ProductGallery item={item} faved={faved} onToggleFave={() => toggleFave(item.id)} />

        {/* info */}
        <div>
          {/* event chips */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Chip><Icons.pin size={13} /> {item.event.name}</Chip>
            {item.event.verified && <Chip pill><Verified size={13} /> Verified event</Chip>}
          </div>

          <h1 className="dm-display dm-section-title" style={{ fontSize: 40, fontWeight: 500, lineHeight: 1.05 }}>{item.title}</h1>

          {/* meta row */}
          <div className="dm-prod-meta" style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16, color: "var(--faint)", fontSize: 13.5 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Icons.eye size={15} /> {item.views.toLocaleString()} views</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Icons.heart size={15} /> {item.faves} saved</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Icons.tag size={15} /> {item.condition}</span>
          </div>

          <ProductPriceCard item={item} wallet={wallet} onConnect={() => {}} onBuy={setBuyItem} />
          <ProductTabs item={item} reviews={DM_REVIEWS} />
          <div style={{ marginTop: 20 }}><ProductAuthenticity item={item} /></div>
        </div>
      </div>

      {/* more from event */}
      <section style={{ marginTop: 90 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 26 }}>
          <h2 className="dm-display" style={{ fontSize: 32, fontWeight: 500 }}>
            More from <span className="dm-grad-text">{item.event.name}</span>
          </h2>
          <Link href="/marketplace">
            <button style={{ height: 40, padding: "0 18px", borderRadius: 999, fontSize: 14, fontWeight: 600, background: "rgba(255,255,255,0.04)", border: "1px solid var(--line-2)", color: "var(--text)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              View all <Icons.arrowR size={16} />
            </button>
          </Link>
        </div>
        <div className="dm-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {moreFill.map((it, i) => (
            <ListingCard key={it.id} item={it} faves={faves} onToggleFave={toggleFave} onNavigate={(id) => router.push(`/marketplace/${id}`)} delay={i * 0.05} />
          ))}
        </div>
      </section>
    </div>
  );
}
