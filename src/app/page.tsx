"use client";

import { useState } from "react";
import DmHero from "@/sections/dm/DmHero";
import DmStatBand from "@/sections/dm/DmStatBand";
import Ticker from "@/components/dm/Ticker";
import DmHowItWorks from "@/sections/dm/DmHowItWorks";
import DmListingSection from "@/sections/dm/DmListingSection";
import DmCTA from "@/sections/dm/DmCTA";
import { DM_LISTINGS } from "@/components/dm/mockData";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [faves, setFaves] = useState<Set<string>>(new Set(["l3"]));

  const toggleFave = (id: string) => setFaves((prev) => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const featured = DM_LISTINGS.filter((l) => l.featured);
  const fresh = DM_LISTINGS.slice(3, 7);

  return (
    <>
      <DmHero onConnect={() => {}} />
      <DmStatBand />
      <div style={{ marginTop: 70 }}><Ticker /></div>

      <DmListingSection
        eyebrow="Featured drops"
        title="Hot on the floor"
        items={featured}
        columns={3}
        faves={faves}
        onToggleFave={toggleFave}
        onNavigate={(id) => router.push(`/marketplace/${id}`)}
      />

      <DmHowItWorks />

      <DmListingSection
        eyebrow="Just listed"
        title="Fresh from the floor"
        items={fresh}
        columns={4}
        faves={faves}
        onToggleFave={toggleFave}
        onNavigate={(id) => router.push(`/marketplace/${id}`)}
      />

      <DmCTA />
    </>
  );
}
