import { Icons } from "@/components/dm/Icons";

const STEPS = [
  { icon: Icons.shield, t: "Verify provenance",   d: "Every listing is tied to an on-chain attendance proof. Check the event signature before you ever send a lamport." },
  { icon: Icons.lock,   t: "Trade in escrow",     d: "Funds lock in a program-owned escrow at purchase. The seller can't touch them until you confirm the item landed." },
  { icon: Icons.truck,  t: "Confirm & release",   d: "Mark it received and escrow releases instantly. Reputation updates on-chain — no chargebacks, no middlemen." },
];

export default function DmHowItWorks() {
  return (
    <section className="dm-container dm-section-mt" style={{ marginTop: 130 }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <span className="dm-eyebrow">How it works</span>
        <h2 className="dm-display dm-how-title" style={{ fontSize: 48, fontWeight: 500, marginTop: 14 }}>
          Trust, minus the <span className="dm-grad-text">trust fall</span>
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="dm-how-grid">
        {STEPS.map((s, i) => (
          <div key={i} className="dm-panel" style={{ padding: 30, position: "relative", overflow: "hidden" }}>
            <div className="dm-mono" style={{ position: "absolute", top: 20, right: 24, fontSize: 13, color: "var(--ghost)" }}>
              0{i + 1}
            </div>
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "flex-start",
                width: 52, height: 52, borderRadius: 16,
                background: "var(--grad-soft)", color: "var(--cyan)",
                marginBottom: 22, paddingLeft: 14,
              }}
            >
              <s.icon size={24} />
            </div>
            <h3 className="dm-display" style={{ fontSize: 21, fontWeight: 500, marginBottom: 10 }}>{s.t}</h3>
            <p style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.6 }}>{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
