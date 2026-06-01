"use client";

import { Icons } from "@/components/dm/Icons";

/* ------------------------------------------------------------------ *
 * Table of contents — anchors map to the section ids rendered below.
 * ------------------------------------------------------------------ */
const TOC = [
  { id: "overview",   label: "What is DefiMart" },
  { id: "programs",   label: "The four programs" },
  { id: "provenance", label: "Provenance & events" },
  { id: "merch",      label: "Verified merch NFTs" },
  { id: "listings",   label: "Listings" },
  { id: "escrow",     label: "Escrow & a real trade" },
  { id: "currencies", label: "Currencies & fees" },
  { id: "trust",      label: "Why it's safe" },
  { id: "faq",        label: "FAQ" },
];

/* the four on-chain programs, in plain language */
const PROGRAMS = [
  {
    icon: Icons.pin,
    name: "event-registry",
    one: "The source of truth for events.",
    body: "Organizers register an event on-chain; the platform then verifies it. Merch points back to this record, so a buyer can prove a drop came from a real, vetted event.",
  },
  {
    icon: Icons.spark,
    name: "merch-mint",
    one: "Mints official 1-of-1 merch.",
    body: "An organizer mints a unique NFT into their event's collection and marks it as a genuine member. That's the on-chain certificate of authenticity for a physical or digital item.",
  },
  {
    icon: Icons.tag,
    name: "marketplace",
    one: "The on-chain listing book.",
    body: "Holds each listing's seller, price, currency, and remaining stock — plus the platform fee. Nobody can quietly rewrite a price or pretend stock exists.",
  },
  {
    icon: Icons.lock,
    name: "escrow",
    one: "Holds the money during a trade.",
    body: "Funds sit in a program-owned vault from purchase until you confirm the item arrived. No person — not the seller, not DefiMart — can pull them early.",
  },
];

/* escrow lifecycle */
const ESCROW_STEPS = [
  { t: "Buyer pays into escrow",   d: "At checkout the buyer's stablecoins move into a vault the escrow program owns. The escrow record is marked Funded. The seller can see the money is locked but cannot touch it." },
  { t: "Seller ships the item",    d: "Knowing payment is secured, the seller sends the merch. The listing's remaining quantity is recorded on-chain so stock can't be oversold." },
  { t: "Buyer confirms receipt",   d: "When the item lands, the buyer signs a release. The vault pays the seller and the record flips to Released — instantly, with no middleman holding the cash." },
  { t: "Or it gets refunded",      d: "If the deal falls through, the seller (or a neutral arbiter in a dispute) signs a refund and the money returns to the buyer. The record flips to Refunded." },
];

const FAQ = [
  { q: "Who controls my money during a trade?", a: "No single person. The funds live in a program-derived vault — a Solana account whose only authority is the escrow program's own logic. The seller, the buyer, and DefiMart all lack the private key, because there isn't one." },
  { q: "What stops a seller from taking the money and never shipping?", a: "Release only happens when the buyer (or an arbiter) signs for it. Until then the seller's only options are to wait or to refund you. They can never move funds to themselves unilaterally." },
  { q: "What if the seller never ships and never refunds?", a: "An optional arbiter is recorded on every escrow. In a dispute the arbiter can sign the refund back to the buyer or the release to the seller — whichever the evidence supports." },
  { q: "How do I know merch is authentic?", a: "Genuine drops are minted into an event's verified on-chain collection. The marketplace shows that verified badge, and you can check the collection membership yourself on-chain." },
  { q: "Can a seller fake a price or fake stock?", a: "No. Price, currency, and remaining quantity live in the marketplace program. Each sale decrements stock on-chain, so a listing can't sell more than it has." },
];

export default function DocsPage() {
  return (
    <div className="dm-container" style={{ paddingTop: 28, paddingBottom: 40, position: "relative" }}>
      {/* bg blob */}
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", filter: "blur(80px)", background: "rgba(155,92,255,0.10)", right: "-15%", top: "-8%", pointerEvents: "none" }} />

      {/* header */}
      <div style={{ position: "relative", marginBottom: 40, maxWidth: 760 }}>
        <span className="dm-eyebrow">Documentation</span>
        <h1 className="dm-display" style={{ fontSize: 52, fontWeight: 500, marginTop: 12 }}>
          How DefiMart <span className="dm-grad-text">works</span>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 17, marginTop: 14, lineHeight: 1.6 }}>
          DefiMart is an on-chain marketplace for event culture — verified merch and collectibles from
          the Solana events you actually showed up to. This page explains the whole protocol in plain
          language: where authenticity comes from, how your money is protected, and what each piece does.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "232px 1fr", gap: 40, alignItems: "start" }} className="dm-market-grid">
        {/* sticky TOC */}
        <nav style={{ position: "sticky", top: 96 }} className="dm-docs-toc">
          <div className="dm-eyebrow" style={{ marginBottom: 16 }}>On this page</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {TOC.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                style={{ color: "var(--muted)", fontSize: 14, padding: "7px 12px", borderRadius: 10, transition: "color .2s, background .2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "transparent"; }}
              >
                {t.label}
              </a>
            ))}
          </div>
        </nav>

        {/* content */}
        <div style={{ minWidth: 0, maxWidth: 760, display: "flex", flexDirection: "column", gap: 64 }}>
          {/* --- overview --- */}
          <Section id="overview" eyebrow="Overview" title="A marketplace where trust is built in">
            <P>
              Buying merch from a stranger online is a leap of faith. You send money first and hope the
              item shows up, hope it's real, hope it's not a knockoff. DefiMart removes the hoping. Three
              things are guaranteed by code running on Solana rather than by a company's promise:
            </P>
            <ul style={ulStyle}>
              <Li><b>Provenance</b> — every official item ties back to a verified, on-chain event record.</Li>
              <Li><b>Escrow</b> — your payment is locked in a program-owned vault until you confirm the item arrived.</Li>
              <Li><b>Reputation</b> — settled trades are recorded on-chain, so a seller's track record can't be faked.</Li>
            </ul>
            <P>
              There's no central account holding everyone's funds and no chargebacks. The rest of this page
              walks through how that actually works, program by program.
            </P>
          </Section>

          {/* --- programs --- */}
          <Section id="programs" eyebrow="Architecture" title="The four programs">
            <P>
              DefiMart is four small Solana programs, each with one job. They reference each other but stay
              independent, so each is simple to audit and reason about.
            </P>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }} className="dm-docs-cards">
              {PROGRAMS.map((p) => (
                <div key={p.name} className="dm-panel dm-grad-border" style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 13, background: "var(--grad-soft)", color: "var(--cyan)", marginBottom: 16 }}>
                    <p.icon size={21} />
                  </div>
                  <code className="dm-mono" style={{ fontSize: 13, color: "var(--violet)" }}>{p.name}</code>
                  <h3 className="dm-display" style={{ fontSize: 18, fontWeight: 500, margin: "8px 0 8px" }}>{p.one}</h3>
                  <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>{p.body}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* --- provenance --- */}
          <Section id="provenance" eyebrow="event-registry" title="Provenance starts with the event">
            <P>
              Authenticity has to start somewhere real. On DefiMart it starts with the event itself.
              Anyone can <b>register</b> an event on-chain as its organizer — that creates an event record
              holding the organizer's wallet, a slug, and a name. It starts <i>unverified</i>.
            </P>
            <P>
              A platform authority then <b>verifies</b> the event, flipping a single trusted flag. If fraud
              surfaces later, that same authority can <b>revoke</b> verification. The organizer also attaches
              a <em>collection mint</em> to the event — the on-chain collection that all of its official merch
              will belong to.
            </P>
            <Callout icon={Icons.shield}>
              Verification is the one deliberately centralized step: a human vouches that an event is genuine.
              Everything downstream — minting, listing, escrow — is then trustless and tied back to this record.
            </Callout>
          </Section>

          {/* --- merch --- */}
          <Section id="merch" eyebrow="merch-mint" title="Verified merch is a 1-of-1 NFT">
            <P>
              When an organizer creates an official item, the merch-mint program mints a unique
              NFT (a true 1/1 — supply of one, zero further editions) and writes its name, symbol, and
              metadata link on-chain. The NFT points at the event's collection.
            </P>
            <P>
              Pointing at a collection isn't enough on its own — anyone could claim to belong to it. So the
              collection's authority signs a second step that <b>verifies the item</b> as a genuine member.
              Only after that does the marketplace show the green verified badge. A buyer can confirm the
              membership themselves; they don't have to trust the listing's word.
            </P>
          </Section>

          {/* --- listings --- */}
          <Section id="listings" eyebrow="marketplace" title="Listings live on-chain">
            <P>
              A listing's important facts — seller, price, currency, total quantity, and how many have sold —
              are stored in the marketplace program, not just in a database. That means they can be trusted
              without trusting DefiMart's backend.
            </P>
            <ul style={ulStyle}>
              <Li>The seller can update the price or cancel — but only while the listing is <b>Active</b>.</Li>
              <Li>Each sale decrements remaining stock on-chain, so a listing can never sell more than it has.</Li>
              <Li>When the last unit sells, the listing automatically flips to <b>Sold</b>.</Li>
            </ul>
            <P>
              A single marketplace config holds the platform fee and the fee recipient, set by an admin and
              capped in code at 10% so it can never be cranked to something absurd.
            </P>
          </Section>

          {/* --- escrow --- */}
          <Section id="escrow" eyebrow="escrow" title="A real trade, step by step">
            <P>
              This is the heart of it. Instead of a company holding a wallet full of everyone's money, each
              trade gets its own <b>vault</b> — a token account whose only controller is the escrow program's
              logic. There is no private key for anyone to steal or abuse.
            </P>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
              {ESCROW_STEPS.map((s, i) => (
                <div key={i} className="dm-panel" style={{ padding: 22, display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, alignItems: "start" }}>
                  <div className="dm-mono" style={{ fontSize: 15, fontWeight: 600, color: "var(--cyan)", width: 30 }}>0{i + 1}</div>
                  <div>
                    <h3 className="dm-display" style={{ fontSize: 17, fontWeight: 500, marginBottom: 6 }}>{s.t}</h3>
                    <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="dm-display" style={{ fontSize: 19, fontWeight: 500, marginTop: 28, marginBottom: 12 }}>The three states</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <StatePill label="Funded" color="var(--blue)" />
              <Icons.arrowR size={18} style={{ color: "var(--faint)" }} />
              <StatePill label="Released" color="var(--cyan)" sub="→ seller" />
              <span style={{ color: "var(--faint)", fontSize: 13, margin: "0 4px" }}>or</span>
              <StatePill label="Refunded" color="var(--magenta)" sub="→ buyer" />
            </div>
            <P>
              An escrow only ever moves from Funded to one of the two final states, and only the right
              party can trigger each move: the buyer or arbiter can release to the seller; the seller or
              arbiter can refund the buyer. The program also refuses obvious nonsense — a zero amount, or a
              buyer trying to trade with themselves.
            </P>
          </Section>

          {/* --- currencies & fees --- */}
          <Section id="currencies" eyebrow="Payments" title="Currencies & fees">
            <P>Listings can be priced in SOL or in one of three stablecoins. Escrow handles the stablecoin (SPL token) side:</P>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
              {["SOL", "USDC", "PYUSD", "EURC"].map((c) => (
                <span key={c} className="dm-mono dm-grad-border" style={{ fontSize: 14, padding: "8px 16px", borderRadius: 999, border: "1px solid var(--line-2)", color: "var(--text)" }}>{c}</span>
              ))}
            </div>
            <P>
              The platform charges a percentage fee, set by an admin and recorded on-chain as basis points.
              It is hard-capped at 10% in the program itself — the cap isn't a policy promise, it's enforced
              by code, so no admin can exceed it.
            </P>
          </Section>

          {/* --- trust --- */}
          <Section id="trust" eyebrow="Guarantees" title="Why it's safe">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="dm-docs-cards">
              <Guarantee icon={Icons.lock} t="No custodial key">Funds sit in a program-owned vault. There's no admin keypair that controls the money, so there's nothing to leak or rug.</Guarantee>
              <Guarantee icon={Icons.check} t="Buyer holds release">Money only reaches the seller when the buyer (or arbiter) signs for it. Shipping first is safe.</Guarantee>
              <Guarantee icon={Icons.shield} t="Verifiable authenticity">Official merch is a verified member of an event's on-chain collection — checkable by anyone.</Guarantee>
              <Guarantee icon={Icons.refresh} t="No chargebacks">Settlement is final and on-chain. No surprise reversals weeks later, for buyer or seller.</Guarantee>
            </div>
          </Section>

          {/* --- faq --- */}
          <Section id="faq" eyebrow="FAQ" title="Common questions">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {FAQ.map((f, i) => (
                <details key={i} className="dm-panel" style={{ padding: "18px 22px" }}>
                  <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 15.5, listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    {f.q}
                    <Icons.chevD size={18} style={{ color: "var(--faint)", flexShrink: 0 }} />
                  </summary>
                  <p style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.65, marginTop: 12 }}>{f.a}</p>
                </details>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Small presentational helpers
 * ------------------------------------------------------------------ */
const ulStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 10, margin: "4px 0", paddingLeft: 0, listStyle: "none" };

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ scrollMarginTop: 96 }}>
      <span className="dm-eyebrow">{eyebrow}</span>
      <h2 className="dm-display" style={{ fontSize: 32, fontWeight: 500, margin: "10px 0 18px" }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ color: "var(--muted)", fontSize: 15.5, lineHeight: 1.7 }}>{children}</p>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "start", color: "var(--muted)", fontSize: 15, lineHeight: 1.6 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--grad)", marginTop: 9 }} />
      <span>{children}</span>
    </li>
  );
}

function Callout({ icon: Icon, children }: { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; children: React.ReactNode }) {
  return (
    <div className="dm-glass" style={{ borderRadius: 16, padding: "18px 22px", display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "start" }}>
      <div style={{ color: "var(--cyan)", marginTop: 2 }}><Icon size={20} /></div>
      <p style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.65 }}>{children}</p>
    </div>
  );
}

function StatePill({ label, color, sub }: { label: string; color: string; sub?: string }) {
  return (
    <span className="dm-mono" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, padding: "9px 16px", borderRadius: 999, background: "var(--bg-2)", border: `1px solid ${color}`, color: "var(--text)" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
      {label}
      {sub && <span style={{ color: "var(--faint)", fontSize: 12 }}>{sub}</span>}
    </span>
  );
}

function Guarantee({ icon: Icon, t, children }: { icon: React.ComponentType<{ size?: number }>; t: string; children: React.ReactNode }) {
  return (
    <div className="dm-panel" style={{ padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 12, background: "var(--grad-soft)", color: "var(--cyan)", marginBottom: 14 }}>
        <Icon size={19} />
      </div>
      <h3 className="dm-display" style={{ fontSize: 16, fontWeight: 500, marginBottom: 7 }}>{t}</h3>
      <p style={{ color: "var(--muted)", fontSize: 13.5, lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}
