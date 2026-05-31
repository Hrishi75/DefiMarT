import { DmEvent, DmSeller, DmListing, DmReview } from "./types";

const events: Record<string, DmEvent> = {
  breakpoint:  { id: "breakpoint",  name: "Breakpoint 2024",       location: "Singapore",     verified: true,  color: "#9b5cff" },
  hackerhouse: { id: "hackerhouse", name: "Hacker House SF",        location: "San Francisco", verified: true,  color: "#4f86ff" },
  summit:      { id: "summit",      name: "Solana Summit",          location: "Da Nang, VN",   verified: true,  color: "#34e6cf" },
  colosseum:   { id: "colosseum",   name: "Colosseum Renaissance",  location: "Online",        verified: true,  color: "#d24bff" },
  accelerate:  { id: "accelerate",  name: "Accelerate NYC",         location: "New York",      verified: false, color: "#4f86ff" },
};

const sellers: Record<string, DmSeller> = {
  ashwin:   { name: "Ashwin Santiago", handle: "ashwin.sol", avatar: "/dm-assets/avatar-1.jpg", verified: true,  rep: 99, sales: 142, since: "2022" },
  florence: { name: "Florence Shaw",   handle: "flo.sol",    avatar: "/dm-assets/avatar-2.jpg", verified: true,  rep: 97, sales: 88,  since: "2023" },
  lula:     { name: "Lula Meyers",     handle: "lula",       avatar: "/dm-assets/avatar-3.jpg", verified: false, rep: 92, sales: 31,  since: "2024" },
  owen:     { name: "Owen Garcia",     handle: "owen.sol",   avatar: "/dm-assets/avatar-4.jpg", verified: true,  rep: 95, sales: 64,  since: "2023" },
};

export const DM_LISTINGS: DmListing[] = [
  { id: "l1", title: "Solana Mobile Crewneck — Saga Edition", kind: "photo", src: "/dm-assets/tshirt.jpg",        price: 2.4, usd: 408,  category: "Apparel",    condition: "Like New", event: events.breakpoint,  seller: sellers.ashwin,   nft: false, views: 1284, faves: 213, featured: true,  desc: "Worn once at Breakpoint. Heavyweight 400gsm cotton crewneck from the official Solana Mobile drop. Embroidered Saga mark on the chest. Size L." },
  { id: "l2", title: "Solana Hacker House Hoodie",             kind: "photo", src: "/dm-assets/hackerhouse.webp", price: 3.1, usd: 527,  category: "Apparel",    condition: "New",      event: events.hackerhouse, seller: sellers.florence, nft: false, views: 2031, faves: 388, featured: true,  desc: "Deadstock Hacker House SF hoodie, never worn, tags on. Iridescent foil print of the SOLANA wordmark. Limited builder run of 200." },
  { id: "l3", title: "Genesis Attendee Pass — Breakpoint",     kind: "art",   glyph: "◵", hue: 280,               price: 8.8, usd: 1496, category: "NFT",        condition: "Mint",     event: events.breakpoint,  seller: sellers.owen,     nft: true,  views: 5402, faves: 921, featured: true,  desc: "On-chain proof of attendance + holographic access pass. cNFT minted at the door. Grants future allowlist on all Foundation drops." },
  { id: "l4", title: "Validator Cap — Embroidered",            kind: "art",   glyph: "▲", hue: 200,               price: 1.2, usd: 204,  category: "Apparel",    condition: "Good",     event: events.summit,      seller: sellers.lula,     nft: false, views: 642,  faves: 77,  featured: false, desc: "Six-panel cap with embroidered validator emblem from Solana Summit. Adjustable strap. A little sun-faded but clean." },
  { id: "l5", title: "Renaissance Sticker Pack (×24)",         kind: "art",   glyph: "✦", hue: 312,               price: 0.35,usd: 60,   category: "Collectible",condition: "New",      event: events.colosseum,   seller: sellers.florence, nft: false, views: 410,  faves: 54,  featured: false, desc: "Full die-cut sticker sheet from the Colosseum Renaissance hackathon. 24 unique designs, holo finish on 6 of them." },
  { id: "l6", title: "Builder Tote — Canvas",                  kind: "art",   glyph: "⬡", hue: 168,               price: 0.9, usd: 153,  category: "Accessory",  condition: "Like New", event: events.hackerhouse, seller: sellers.ashwin,   nft: false, views: 521,  faves: 63,  featured: false, desc: "Heavy 16oz canvas tote handed out to Hacker House builders. Screenprinted compute glyph. Barely used." },
  { id: "l7", title: "Accelerate NYC Pin Set",                 kind: "art",   glyph: "❖", hue: 220,               price: 0.6, usd: 102,  category: "Collectible",condition: "New",      event: events.accelerate,  seller: sellers.owen,     nft: false, views: 288,  faves: 41,  featured: false, desc: "Enamel pin trio from Accelerate NYC — skyline, ticker, and the validator owl. Backing cards intact." },
  { id: "l8", title: "Summit Poster — Signed Print",           kind: "art",   glyph: "▦", hue: 188,               price: 1.8, usd: 306,  category: "Collectible",condition: "Mint",     event: events.summit,      seller: sellers.lula,     nft: false, views: 733,  faves: 110, featured: false, desc: "A2 risograph poster from Solana Summit Da Nang, signed by the design team. Numbered 14/100." },
  { id: "l9", title: "Proof-of-Build Trophy — cNFT",           kind: "art",   glyph: "◈", hue: 270,               price: 5.4, usd: 918,  category: "NFT",        condition: "Mint",     event: events.colosseum,   seller: sellers.owen,     nft: true,  views: 3110, faves: 604, featured: false, desc: "Winner-tier compressed NFT trophy from Colosseum. Dynamic metadata reflects final leaderboard rank. 1 of 12." },
];

export const DM_REVIEWS: DmReview[] = [
  { name: "Maya R.",  handle: "maya.sol", avatar: "/dm-assets/avatar-3.jpg", rating: 5, text: "Exactly as described, shipped in 2 days. Escrow released instantly on delivery. Smoothest trade I've done." },
  { name: "Dev K.",   handle: "devkit",   avatar: "/dm-assets/avatar-4.jpg", rating: 5, text: "Verified the on-chain provenance before buying — legit Breakpoint drop. Seller was super responsive." },
  { name: "Priya N.", handle: "priya",    avatar: "/dm-assets/avatar-2.jpg", rating: 4, text: "Great item, packaging could've been better but the piece itself is mint. Would buy again." },
];

export const DM_EVENTS = Object.values(events);
export const DM_PARTNERS = ["BREAKPOINT", "HACKER HOUSE", "COLOSSEUM", "SOLANA SUMMIT", "ACCELERATE", "RADAR", "SUPERTEAM"];
