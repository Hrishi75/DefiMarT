"use client";

import Tag from "@/components/Tag";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";

const faqs = [
    {
        question: "What is this platform about?",
        answer: "It’s a social e-commerce platform where users can showcase, discover, and trade merchandise from conferences and community events, all in one place.",
    },
    {
        question: "Do I need to attend an event to use the platform?",
        answer: "No. While attendees can showcase what they received, anyone can explore event collections and buy merchandise, even if they didn’t attend the event.",
    },
    {
        question: "How can I sell event merchandise?",
        answer: "You can list items directly from your profile or from a social post, making it easy to turn your event merch into a listing.",
    },
    {
        question: "Can event hosts sell official merchandise here?",
        answer: "Yes. Event hosts can showcase and sell official merchandise, run limited drops, and extend engagement beyond the event itself.",
    },
    {
        question: "How is ownership and payment handled?",
        answer: "Ownership and transactions are handled securely through wallet integration, ensuring transparent and reliable buying and selling.",
    },
];

export default function Faqs() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    return <section className="py-24">
        <div className="container">
            <div className="flex justify-center">
            <Tag>Faqs</Tag>
            </div>
            <h2 className="text-6xl font-medium mt-6 text-center max-w-xl mx-auto">
                Questipons? we have got {" "} <span className="text-lime-400">answers</span>
            </h2>
            <div className="mt-12 flex flex-col gap-6 max-w-xl mx-auto">
                {faqs.map((faq, faqIndex) => (
                    <div key={faq.question} className="bg-neutral-900 rounded-2xl border border-white/10 p-6">
                        <div className="flex justify-between items-center" onClick={() => setSelectedIndex(faqIndex)} >
                            <h3 className="font-medium">{faq.question}</h3>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={twMerge("feather feather-plus text-lime-400 flex-shrink-0 transition duration-300", selectedIndex === faqIndex && "rotate-45")}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </div>
                        <AnimatePresence>
                        {selectedIndex === faqIndex && (
                        <motion.div initial={{
                            height: 0, marginTop: 0,
                        }} animate={{
                            height:"auto", marginTop: 24,
                        }} exit={{
                            height: 0, marginTop: 0,
                        }} className={twMerge("overflow-hidden")}>
                        <p className="text-white/50">{faq.answer}</p>
                        </motion.div>
                        )}
                        </AnimatePresence>
                        
                    </div>
                ))}
            </div>
        </div>
    </section>;

}
