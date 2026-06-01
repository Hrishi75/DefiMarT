const STATS = [
  { v: "48,200", l: "Items traded" },
  { v: "12,800", l: "SOL volume" },
  { v: "31",     l: "Verified events" },
  { v: "9,400",  l: "Collectors" },
];

export default function DmStatBand() {
  return (
    <div className="dm-container" style={{ marginTop: 18 }}>
      <div
        className="dm-panel dm-stat-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "30px 20px", borderRadius: "var(--r-lg)" }}
      >
        {STATS.map((s, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              borderRight: i < 3 ? "1px solid var(--line)" : "none",
            }}
          >
            <div className="dm-display dm-grad-text dm-stat-value" style={{ fontSize: 38, fontWeight: 700 }}>{s.v}</div>
            <div className="dm-eyebrow" style={{ marginTop: 6 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
