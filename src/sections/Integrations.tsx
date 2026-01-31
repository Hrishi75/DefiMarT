import Tag from "@/components/Tag";
import phantomIcon from "@/assets/images/phantomicon.svg";
import backpackIcon from "@/assets/images/backpack.png";
import anchorIcon from "@/assets/images/anchor.png";
import solanaIcon from "@/assets/images/svgviewer-output.svg";
import quciknodeIcon from "@/assets/images/QuickNode_idWYees96N_1.svg";
import metaplexIcon from "@/assets/images/metaplex.svg";
import IntegrationColumn from "@/components/IntegrationsColumn";


const integrations = [
    { name: "Phantom", icon: phantomIcon, description: "Wallet for login and payments" },
    { name: "Backpack", icon: backpackIcon, description: "Secure Solana wallet support" },
    { name: "Anchor", icon: anchorIcon, description: "Smart contract framework" },
    { name: "Solana", icon: solanaIcon, description: "Fast, low-cost blockchain" },
    { name: "QuickNode", icon:quciknodeIcon, description: "Solana RPC & infrastructure" },
    { name: "Metaplex", icon: metaplexIcon, description: "NFTs and metadata standard" },
];

export type IntegrationsType = typeof integrations;

export default function Integrations() {
    return <section className="py-24 overflow-hidden">
        <div className="container">
        <div className="grid lg:grid-cols-2 items-center lg:gap-16">
            <div>
          <Tag>Integrations</Tag>
          <h2 className="text-6xl font-medium mt-6">On-chain ownership, listings, and <span className="text-lime-400">trades </span>
          </h2>
          <p className="text-white/50 mt-4 text-lg">Real-time data for profiles, posts, events, and marketplace activity</p>
          </div>
          <div>
          <div className="h-[400px] lg:h-[800px] mt-8 lg:mt-0 overflow-hidden grid md:grid-cols-2 gap-4[mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
          <IntegrationColumn integrations={integrations} />
          <IntegrationColumn integrations={integrations.slice().reverse()} reverse className="hidden md:flex" />
          
          </div>
          </div>
          </div>
        </div>
    </section>;
}
