import Verified from "./Verified";
import { Icons } from "./Icons";
import { DmListing } from "./types";

interface ProductAuthenticityProps {
  item: DmListing;
}

export default function ProductAuthenticity({ item }: ProductAuthenticityProps) {
  const rows = [
    ["Mint authority", `${item.event.name} · verified`],
    ["Token standard", item.nft ? "Compressed NFT (Bubblegum)" : "Off-chain item"],
    ["Provenance",     "On-chain attendance proof"],
    ["Contract",       `Dm${item.id.toUpperCase()}x7…q4Z2`],
  ];

  return (
    <div className="dm-panel" style={{ padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ color: "var(--cyan)" }}><Icons.shield size={18} /></span>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Authenticity</span>
        <span
          className="dm-mono"
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--cyan)" }}
        >
          <Verified size={13} /> VERIFIED
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map(([k, v], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13.5 }}>
            <span style={{ color: "var(--faint)" }}>{k}</span>
            <span className="dm-mono" style={{ color: "var(--muted)", fontSize: 12.5 }}>{v}</span>
          </div>
        ))}
      </div>

      <button
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          width: "100%", height: 40, marginTop: 18, borderRadius: 999, fontSize: 14, fontWeight: 600,
          background: "var(--bg-2)", border: "1px solid var(--line-2)", color: "var(--text)", cursor: "pointer",
        }}
      >
        <Icons.globe size={15} /> View on explorer <Icons.arrowUpR size={14} />
      </button>
    </div>
  );
}
