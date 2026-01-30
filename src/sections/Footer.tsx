// import Image from "next/image";
// import logoImage from "@/assets/images/logo.svg"
import DefimartLogo from "@/components/logo"

const footerLinks = [
    { href: "#", label: "Contact" },
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms & Conditions" },
];

export default function Footer() {
    return <section className="py-16">
        <div className="container">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-6">
                <div>
                     {/* <Image src={logoImage} alt="Defimart logo" /> */}
                     <DefimartLogo alt="defimart logo"/>
                </div>
                <div>
                    <nav className="flex gap-6">
                        {footerLinks.map((link) => (
                            <a key={link.label} href={link.href} className="text-white/50 text-sm">{link.label}</a>
                        ))}
                    </nav>

                </div>
            </div>
        </div>
    </section>;
}
