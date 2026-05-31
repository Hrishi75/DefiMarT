export interface DmEvent {
  id: string;
  name: string;
  location: string;
  verified: boolean;
  color: string;
}

export interface DmSeller {
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  rep: number;
  sales: number;
  since: string;
}

export interface DmListing {
  id: string;
  title: string;
  kind: "photo" | "art";
  src?: string;
  hue?: number;
  glyph?: string;
  price: number;
  usd: number;
  category: string;
  condition: string;
  event: DmEvent;
  seller: DmSeller;
  nft: boolean;
  views: number;
  faves: number;
  featured: boolean;
  desc: string;
}

export interface DmReview {
  name: string;
  handle: string;
  avatar: string;
  rating: number;
  text: string;
}
