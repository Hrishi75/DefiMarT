"use client";
import raydiumlogo from "@/assets/images/raydium.svg";
import jupiterlogo from "@/assets/images/jupiter.svg";
import solanafoundationlogo from "@/assets/images/svgviewer-output.svg";
import magicedenlogo from "@/assets/images/ME_Wallet_Hor_Neg.svg";
import phantomlogo from "@/assets/images/Phantom-Logo-White.svg";
import metaplexlogo from "@/assets/images/metaplex.svg";
import solflarelogo from "@/assets/images/solflare.svg";
import meteoralogo from "@/assets/images/meteora.svg";
import Image from "next/image";
import  { Fragment } from "react";
import { motion } from "framer-motion";
 
const logos = [
    { name: "Raydium", image: raydiumlogo},
    { name: "Jupiter", image: jupiterlogo }, //done
    { name: "Solana Foundation", image: solanafoundationlogo },
    { name: "Magic Eden", image: magicedenlogo }, //done
    { name: "Phantom", image: phantomlogo }, //done
    { name: "Metaplex", image: metaplexlogo }, //done
    { name: "Solflare", image: solflarelogo },
    { name: "Meteora", image: meteoralogo }, //done
];

export default function LogoTicker() {
    return <section className="py-24 overflow-x-clip">
        <div className="container">
            <h3 className="text-center text-white/50 text-xl">Built for ecosystems like</h3>
            <div className="flex overflow-hidden mt-12 [mask-image:linear-gradient(to_right,transparent, black_10%, black_90%, transparent)]">
                <motion.div animate={{ x: "-50%"}} transition={{duration: 30, ease: "linear", repeat: Infinity,}}
                 className="flex flex-none gap-24 pr-24">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Fragment key={i}>
                         {logos.map(logo => (
                        <Image
                        src={logo.image}
                        key={logo.name}
                        alt={logo.name}
                        className="h-8 w-auto" />
                    ))}
                        </Fragment>

                    ))}
                   
                </motion.div>
            </div>

        </div>
    </section>;
}
