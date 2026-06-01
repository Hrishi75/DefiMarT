import EclipseMark from "./EclipseMark";

const PARTNERS = ["BREAKPOINT", "HACKER HOUSE", "COLOSSEUM", "SOLANA SUMMIT", "ACCELERATE", "RADAR", "SUPERTEAM"];

export default function Ticker() {
  const run = [...PARTNERS, ...PARTNERS];
  return (
    <div
      style={{
        position: "relative",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
        padding: "26px 0",
        overflow: "hidden",
      }}
    >
      {/* fade masks */}
      <div className="dm-ticker-fade" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 160, zIndex: 2, background: "linear-gradient(90deg, var(--bg), transparent)" }} />
      <div className="dm-ticker-fade" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 160, zIndex: 2, background: "linear-gradient(270deg, var(--bg), transparent)" }} />

      <div style={{ display: "flex", gap: 64, width: "max-content", animation: "dm-marquee 32s linear infinite" }}>
        {run.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <EclipseMark size={20} />
            <span
              className="dm-display"
              style={{ fontSize: 22, fontWeight: 500, color: "var(--faint)", letterSpacing: "-0.02em" }}
            >
              {p}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
