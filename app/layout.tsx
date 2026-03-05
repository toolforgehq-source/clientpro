import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClientPro - Automated Past-Client Follow-Up for Real Estate Agents",
  description:
    "Automated text messages that keep you top-of-mind with past clients. Get more repeat business and referrals. Messages from your number, TCPA compliant, setup in 2 minutes.",
  keywords:
    "real estate SMS, automated follow-up, past client marketing, real estate referrals, repeat business, agent CRM, real estate text messaging, client retention",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "ClientPro - Never Lose Touch With a Past Client Again",
    description:
      "Your past clients will buy again or refer someone who will. Automated texts from your number keep you top-of-mind so you get the call, not your competition.",
    url: "https://clientpro.io",
    siteName: "ClientPro",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClientPro - Automated Past-Client Follow-Up for Real Estate Agents",
    description:
      "Your past clients will buy again or refer someone who will. Automated texts keep you top-of-mind. Setup in 2 minutes.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://clientpro.io",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <script
          defer
          data-domain="clientpro.io"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
