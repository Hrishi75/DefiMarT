"use client";
import Tag from "@/components/Tag";
import { useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

const text = `A place where event merchandise doesn’t fade after the event ends. Discover, showcase, and trade items from conferences and community events through social profiles and a shared feed. Whether you attended or not, event culture lives on here.`;
const words = text.split(' ');

export default function Introduction() {
    const scrollTarget = useRef<HTMLDivElement>(null);
    const  { scrollYProgress } = useScroll({ target: scrollTarget, offset: ['start end', 'end end']});
    const [currentWord, setCurrentWord] = useState(0);

    const wordIndex = useTransform(scrollYProgress, [0, 1], [0, words.length]);

    useEffect(() => {
        wordIndex.on('change', (latest) => {
            setCurrentWord(latest);
        })

    }, [wordIndex]);

    
    return ( <section className="py-28 lg:py-40">
        <div className="container">
            <div className="sticky top-20 md:top-28 lg:top-30">
            <div className="flex justify-center">
            <Tag> Introducing DefiMarT</Tag>
            </div>
            <div className="text-4xl md:text-6xl lg:text-7xl text-center font-medium mt-10">
                <span>Turn event moments into collectibles.</span>{" "}
                <span className="">
                {words.map((word, wordIndex) => (
                    <span key={wordIndex} className={twMerge("transition duration-500 text-white/15", wordIndex < currentWord && 'text-white')}>{`${word}`} </span>
                ))}
                </span>
                <span className="text-lime-400 block">That why we built DefiMarT</span>
            </div>
            </div>
            <div className="h-[150vh]" ref={scrollTarget}>

            </div>
        </div>
    </section> 
    );
}
