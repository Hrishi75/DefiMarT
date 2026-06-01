import Link from "next/link";
import EclipseMark from "@/components/dm/EclipseMark";
import DmButton from "@/components/dm/DmButton";
import { Icons } from "@/components/dm/Icons";

export default function DmCTA() {
  return (
    <section className="dm-container dm-section-mt" style={{ marginTop: 130 }}>
      <div
        className="dm-panel dm-cta-wrap"
        style={{ position: "relative", overflow: "hidden", borderRadius: "var(--r-xl)", padding: "84px 40px", textAlign: "center" }}
      >
        {/* blobs */}
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", filter: "blur(80px)", background: "rgba(79,134,255,0.22)", left: "-10%", top: "-40%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", filter: "blur(80px)", background: "rgba(210,75,255,0.18)", right: "-10%", bottom: "-50%", pointerEvents: "none" }} />

        <div style={{ position: "relative" }}>
          <EclipseMark size={64} animate />
          <h2 className="dm-display dm-cta-title" style={{ fontSize: 56, fontWeight: 500, marginTop: 24, lineHeight: 1.02 }}>
            You showed up.<br /><span className="dm-grad-text">Own the proof.</span>
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 18, maxWidth: 520, margin: "20px auto 0" }}>
            Connect your wallet and start trading the merch and moments from the events that built this ecosystem.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
            <Link href="/marketplace">
              <DmButton variant="primary" size="lg">Explore marketplace <Icons.arrowR size={18} /></DmButton>
            </Link>
            <Link href="/marketplace/create">
              <DmButton variant="ghost" size="lg">List an item</DmButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
