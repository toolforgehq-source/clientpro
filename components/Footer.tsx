import Image from "next/image";
import Link from "next/link";

const productLinks = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "/brokerages", label: "Brokerages" },
  { href: "#faq", label: "FAQ" },
  { href: "https://app.clientpro.io/login", label: "Login" },
  { href: "https://app.clientpro.io/register", label: "Sign Up" },
];

const companyLinks = [
  { href: "/contact", label: "Contact" },
  { href: "/contact", label: "Support" },
];

const legalLinks = [
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/compliance", label: "TCPA Compliance" },
];

export default function Footer() {
  return (
    <footer className="bg-dark border-t border-slate-800">
      <div className="max-w-container mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/logo-white.svg"
              alt="ClientPro"
              width={130}
              height={30}
              className="mb-4"
            />
            <p className="text-slate-400 text-sm mb-4">
              Automated follow-up for past clients
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2">
              {productLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-slate-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-slate-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-slate-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            &copy; 2026 ClientPro. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs">
            Made for agents who never lose touch.
          </p>
        </div>
      </div>
    </footer>
  );
}
