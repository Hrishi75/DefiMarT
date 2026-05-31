"use client";

import DmButton from "./DmButton";
import { Icons } from "./Icons";
import { DmListing } from "./types";

interface ProductPriceCardProps {
  item: DmListing;
  wallet: string | null;
  onConnect: () => void;
  onBuy: (item: DmListing) => void;
}

export default function ProductPriceCard({ item, wallet, onConnect, onBuy }: ProductPriceCardProps) {
  return (
    <div className="dm-panel" style={{ padding: 24, marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="dm-eyebrow" style={{ marginBottom: 8 }}>Buy now price</div>
          <div className="dm-mono" style={{ fontSize: 44, fontWeight: 700, lineHeight: 1, display: "flex", alignItems: "baseline", gap: 8 }}>
            {item.price}
            <span style={{ color: "var(--cyan)", fontSize: 22 }}>SOL</span>
          </div>
          <div style={{ color: "var(--faint)", fontSize: 14, marginTop: 6 }}>≈ ${item.usd.toLocaleString()} USD</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span className="dm-mono" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--cyan)" }}>
            <Icons.lock size={13} /> ESCROW
          </span>
          <span style={{ fontSize: 12, color: "var(--faint)" }}>+ 0.02 SOL shipping</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
        {wallet ? (
          <DmButton variant="primary" size="lg" style={{ flex: 1 }} onClick={() => onBuy(item)}>
            <Icons.bolt size={18} /> Buy in escrow
          </DmButton>
        ) : (
          <DmButton variant="primary" size="lg" style={{ flex: 1 }} onClick={onConnect}>
            <Icons.wallet size={18} /> Connect to buy
          </DmButton>
        )}
        <DmButton variant="ghost" size="lg">
          <Icons.msg size={18} /> Make offer
        </DmButton>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 16, color: "var(--faint)", fontSize: 12.5 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icons.shield size={14} /> Buyer protected</span>
        <span style={{ color: "var(--ghost)" }}>·</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icons.refresh size={14} /> Funds returned if undelivered</span>
      </div>
    </div>
  );
}
