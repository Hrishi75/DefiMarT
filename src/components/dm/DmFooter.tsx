import Link from "next/link";
import Logo from "./Logo";
import { Icons } from "./Icons";

const cols = [
  { h: "Marketplace", items: [["Browse all", "/marketplace"], ["Apparel", "/marketplace"], ["Collectibles", "/marketplace"], ["NFT passes", "/marketplace"], ["New drops", "/drops"]] },
  { h: "Events",      items: [["Breakpoint", "/marketplace"], ["Hacker House", "/marketplace"], ["Colosseum", "/marketplace"], ["Summit", "/marketplace"], ["Submit event", "/marketplace"]] },
  { h: "Protocol",    items: [["How escrow works", "/marketplace"], ["On-chain provenance", "/marketplace"], ["Fees", "/marketplace"], ["Docs", "/marketplace"], ["Status", "/marketplace"]] },
];

export default function DmFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 100, position: "relative", overflow: "hidden" }}>
      {/* bg blob */}
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", filter: "blur(80px)", background: "rgba(155,92,255,0.16)", left: "30%", bottom: -460, pointerEvents: "none" }} />

      <div className="dm-container" style={{ padding: "72px 28px 40px", position: "relative" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: 40 }}
          className="dm-foot-grid"
        >
          {/* brand column */}
          <div>
            <Logo size={32} />
            <p style={{ color: "var(--muted)", marginTop: 18, maxWidth: 280, fontSize: 14.5 }}>
              The on-chain marketplace for event culture. Trade verified merch and collectibles from the events you showed up to.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
              {[Icons.globe, Icons.msg, Icons.share].map((Icon, i) => (
                <button
                  key={i}
                  style={{
                    width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 999, background: "var(--bg-2)", border: "1px solid var(--line-2)",
                    color: "var(--muted)", cursor: "pointer",
                  }}
                >
                  <Icon size={17} />
                </button>
              ))}
            </div>
          </div>

          {/* link columns */}
          {cols.map((c) => (
            <div key={c.h}>
              <div className="dm-eyebrow" style={{ marginBottom: 18 }}>{c.h}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {c.items.map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    style={{ color: "var(--muted)", fontSize: 14.5, width: "fit-content", transition: "color .2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* bottom bar */}
        <div
          style={{
            marginTop: 56, paddingTop: 24, borderTop: "1px solid var(--line)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            color: "var(--faint)", fontSize: 13,
          }}
        >
          <span>© 2026 Defimart Labs. Built on Solana.</span>
          <span className="dm-mono" style={{ fontSize: 12 }}>mainnet-beta · all systems operational</span>
        </div>
      </div>
    </footer>
  );
}
