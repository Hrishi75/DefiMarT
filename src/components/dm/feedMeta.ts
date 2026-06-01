import { Post } from "@/types/marketplace";

/* The design exposes five post "types"; the backend has no such column, so we
   derive one deterministically from the real post shape. Used for the badge,
   the action verb, and the Drops/Trades/Showcases tab filters. */
export type PostType = "listing" | "score" | "showcase" | "mint" | "milestone";

export interface TypeMeta {
  label: string;
  verb: string;
  tint?: string; // outlined badge
  grad?: boolean; // gradient-filled badge
}

export const TYPE_META: Record<PostType, TypeMeta> = {
  listing:   { label: "LISTED",    tint: "var(--cyan)",    verb: "listed an item" },
  score:     { label: "SECURED",   grad: true,             verb: "closed a trade" },
  showcase:  { label: "SHOWCASE",  tint: "var(--violet)",  verb: "showed off" },
  mint:      { label: "MINTED",    tint: "var(--magenta)", verb: "minted on-chain" },
  milestone: { label: "MILESTONE", tint: "var(--blue)",    verb: "hit a milestone" },
};

const TRADE_HINT = /\b(sold|bought|escrow|released|delivered|trade|shipped)\b/i;

/** Derive a display type from a real post. */
export function derivePostType(post: Post): PostType {
  if (post.linkedItem) {
    if (post.linkedItem.category === "nft" || /\bcnft\b|minted|on-chain/i.test(post.content)) return "mint";
    if (TRADE_HINT.test(post.content)) return "score";
    return "listing";
  }
  return "showcase";
}

/** Tabs map to derived types (For you / Following are handled by the backend). */
export function typeMatchesTab(type: PostType, tab: string): boolean {
  if (tab === "drops") return type === "listing" || type === "mint";
  if (tab === "trades") return type === "score";
  if (tab === "showcases") return type === "showcase" || type === "milestone";
  return true; // foryou / following
}

/* Reposts aren't tracked by the backend. Seed a stable pseudo-count from the
   post id so cards look populated and don't jump between renders. */
export function seedReposts(post: Post): number {
  let h = 0;
  for (let i = 0; i < post.id.length; i++) h = (h * 31 + post.id.charCodeAt(i)) >>> 0;
  return Math.round(post.likes * 0.12) + (h % 7);
}
