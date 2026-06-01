"use client";

import Link from "next/link";
import ListingCard from "@/components/dm/ListingCard";
import DmButton from "@/components/dm/DmButton";
import { Icons } from "@/components/dm/Icons";
import { DmListing } from "@/components/dm/types";

interface DmListingSectionProps {
  eyebrow: string;
  title: string;
  items: DmListing[];
  columns?: 3 | 4;
  faves?: Set<string>;
  onToggleFave?: (id: string) => void;
  onNavigate?: (id: string) => void;
}

export default function DmListingSection({
  eyebrow, title, items, columns = 3, faves, onToggleFave, onNavigate,
}: DmListingSectionProps) {
  return (
    <section className="dm-container dm-section-mt" style={{ marginTop: 90 }}>
      <div className="dm-listing-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 30 }}>
        <div>
          <span className="dm-eyebrow">{eyebrow}</span>
          <h2 className="dm-display dm-section-title" style={{ fontSize: 40, fontWeight: 500, marginTop: 12 }}>{title}</h2>
        </div>
        <Link href="/marketplace">
          <DmButton variant="ghost" size="sm">View all <Icons.arrowR size={16} /></DmButton>
        </Link>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: `repeat(${columns},1fr)`, gap: columns === 4 ? 18 : 20 }}
        className={columns === 4 ? "dm-card-grid-4" : "dm-card-grid"}
      >
        {items.map((it, i) => (
          <ListingCard
            key={it.id}
            item={it}
            faves={faves}
            onToggleFave={onToggleFave}
            onNavigate={onNavigate}
            delay={i * 0.06}
          />
        ))}
      </div>
    </section>
  );
}
