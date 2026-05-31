"use client";

import { useState } from "react";
import Stars from "./Stars";
import { Icons } from "./Icons";
import { DmListing, DmReview } from "./types";

interface ProductTabsProps {
  item: DmListing;
  reviews: DmReview[];
}

export default function ProductTabs({ item, reviews }: ProductTabsProps) {
  const [tab, setTab] = useState<"details" | "shipping" | "reviews">("details");

  return (
    <div>
      {/* seller card */}
      <div
        className="dm-panel dm-grad-border"
        style={{ padding: 18, marginTop: 16, display: "flex", alignItems: "center", gap: 14 }}
      >
        <img src={item.seller.avatar} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{item.seller.name}</span>
            {item.seller.verified && (
              <span title="Verified seller" style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 14, height: 14, borderRadius: "50%", background: "var(--grad)", color: "#0a0710", flexShrink: 0,
              }}>
                <Icons.check size={8} sw={3.2} />
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>
            <span className="dm-mono" style={{ color: "var(--cyan)" }}>@{item.seller.handle}</span>
            <span>·</span><span>{item.seller.rep}% rep</span>
            <span>·</span><span>{item.seller.sales} sales</span>
          </div>
        </div>
        <button style={{
          height: 40, padding: "0 18px", borderRadius: 999, fontSize: 14, fontWeight: 600,
          background: "var(--bg-2)", border: "1px solid var(--line-2)", color: "var(--text)", cursor: "pointer",
        }}>
          View shop
        </button>
      </div>

      {/* tab bar */}
      <div style={{ display: "flex", gap: 0, marginTop: 28, borderBottom: "1px solid var(--line)" }}>
        {([
          ["details",  "Details"],
          ["shipping", "Shipping"],
          ["reviews",  `Reviews · ${reviews.length}`],
        ] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{
              padding: "12px 4px", marginRight: 22, fontSize: 14.5, fontWeight: 600,
              color: tab === k ? "var(--text)" : "var(--muted)",
              borderBottom: tab === k ? "2px solid var(--violet)" : "2px solid transparent",
              marginBottom: -1, background: "none", border: "none",
              borderBottomStyle: "solid",
              borderBottomWidth: 2,
              borderBottomColor: tab === k ? "var(--violet)" : "transparent",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* tab content */}
      <div style={{ paddingTop: 20 }}>
        {tab === "details" && (
          <div>
            <p style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: 15 }}>{item.desc}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
              {([["Category", item.category], ["Condition", item.condition], ["Event", item.event.name], ["Location", item.event.location]] as const).map(([k, v], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--bg-2)", borderRadius: 12, fontSize: 13.5 }}>
                  <span style={{ color: "var(--faint)" }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "shipping" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {([
              [Icons.truck,   "Ships in 1–2 business days", "Tracked, insured shipping worldwide."],
              [Icons.lock,    "Escrow holds your funds",    "Released only when you confirm delivery."],
              [Icons.refresh, "7-day return window",        "Full refund if the item isn't as described."],
            ] as const).map(([Icon, t, d], i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: "var(--bg-2)", borderRadius: 14 }}>
                <span style={{ color: "var(--cyan)", marginTop: 2 }}><Icon size={20} /></span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14.5 }}>{t}</div>
                  <div style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 2 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "reviews" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
              <div className="dm-display" style={{ fontSize: 40, fontWeight: 700 }}>4.9</div>
              <div>
                <Stars value={5} size={16} />
                <div style={{ fontSize: 13, color: "var(--faint)", marginTop: 4 }}>{reviews.length} verified reviews</div>
              </div>
            </div>
            {reviews.map((r, i) => (
              <div key={i} className="dm-panel" style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <img src={r.avatar} alt="" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                    <div className="dm-mono" style={{ fontSize: 11.5, color: "var(--cyan)" }}>@{r.handle}</div>
                  </div>
                  <Stars value={r.rating} size={13} />
                </div>
                <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
