'use client';

import Button from "@/components/Button";
import Pointer from "@/components/Pointer";
import designExample1image from "@/assets/images/design-example-1.png";
import designExample2image from "@/assets/images/design-example-2.png";
import Image from "next/image";
import { motion, useAnimate } from "framer-motion";
import { useEffect, useState } from "react";
import cursorYouImage from "@/assets/images/cursor-you.svg"

export default function Hero() {
    const [leftDesignScope, leftDesignAnimate] = useAnimate();
    const [leftPointerScope, leftPointerAnimate] = useAnimate();
    const [rightDesignScope, rightDesignAnimate] = useAnimate();
    const [rightPointerScope, rightPointerAnimate] = useAnimate();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formError, setFormError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError('');
        setLoading(true);
        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setFormError(data.error ?? 'Something went wrong.');
            } else {
                setSubmitted(true);
                setEmail('');
            }
        } catch {
            setFormError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
           leftDesignAnimate([
              [leftDesignScope.current, {opacity:[0, 1] }, { duration: 0.5 }],
              [leftDesignScope.current, {y: 0, x: 0 }, { duration: 0.5 }],
           ]);
           leftPointerAnimate([
            [leftPointerScope.current, { opacity: 1}, { duration: 0.5 }],
            [leftPointerScope.current, { y: 0, x: -100 }, { duration: 0.5 }],
            [leftPointerScope.current, { x: 0, y: [0, 16, 0] }, { duration: 0.5, ease: "easeInOut" }],
           ]);
           rightDesignAnimate([
            [rightDesignScope.current, { opacity: 1}, { duration: 0.5, delay: 1.5}],
            [rightDesignScope.current, { x: 0 , y: 0 }, { duration: 0.5 }],
            
           ]);
           rightPointerAnimate([
            [rightPointerScope.current, { opacity: 1 }, { duration: 0.5, delay: 1.5 }],
            [rightPointerScope.current, { x: 175, y: 0 }, { duration: 0.5 }],
            [rightPointerScope.current, { x: 0, y: [0, 20, 0]}, { duration: 0.5 }],
           ]);
    }, []);
    return (<section className="py-24 overflow-x-clip" style={{ cursor: `url(${cursorYouImage.src }), auto`,}}>
        <div className="container relative">
            <motion.div ref={leftDesignScope} initial={{ opacity: 0, y: 100, x: -100 }} drag className="absolute -left-32 top-16 hidden lg:block">
                <Image src={designExample1image} alt="Design example 1 image" draggable="false" />
            </motion.div>
             <motion.div ref={leftPointerScope} initial= {{opacity: 0, y: 100, x: -200 }} className="absolute left-56 top-96 hidden lg:block">
                <Pointer name="Hrishi"/>
            </motion.div>
            <motion.div ref={rightDesignScope} initial={{ opacity: 0, x: 100, y: 100 }} drag className="absolute -right-64 -top-16 hidden lg:block">
            <Image src={designExample2image} alt="Design example 2 image" draggable="false" />
            </motion.div>
           
            <motion.div ref={rightPointerScope} initial={{ opacity: 0, x: 275, y: 100}} className="absolute right-80 -top-4 hidden lg:block">
              <Pointer name="Riya" color="red"/>
            </motion.div>
            <div className="flex justify-center">
            <div className="inline-flex py-1 px-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full text-neutral-950 font-semibold">✨ Designed for people who love events ✨</div>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-medium text-center mt-6">Event culture, <br/>redefined.</h1>
            <p className="text-center text-xl text-white/50 mt-8 max-w-2xl mx-auto">A social marketplace with a feed for sharing and trading merchandise from blockchain conferences and community events.</p>
            {submitted ? (
                <p className="text-center text-green-400 mt-8 font-medium">You&apos;re on the list! We&apos;ll be in touch.</p>
            ) : (
                <form onSubmit={handleSubmit} className="flex border border-white/15 rounded-full p-2 mt-8 max-w-lg mx-auto">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-transparent px-4 md:flex-1 w-full outline-none"
                    />
                    <Button type="submit" variant="primary" className="whitespace-nowrap" size="sm" disabled={loading}>
                        {loading ? 'Joining...' : 'Join the Waitlist'}
                    </Button>
                </form>
            )}
            {formError && (
                <p className="text-center text-red-400 mt-3 text-sm">{formError}</p>
            )}

        </div>
    </section>
    );
}
