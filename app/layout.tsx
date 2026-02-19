import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClientPro - Automated Follow-Up for Past Clients | Real Estate SMS",
  description:
    "Turn past clients into repeat buyers and referrals with automated SMS follow-up. 41% of agent business comes from past clients. Stop leaving money on the table.",
  keywords:
    "real estate SMS, automated follow-up, past client marketing, real estate referrals, repeat business, agent CRM",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "ClientPro - Never Lose Touch With a Past Client Again",
    description:
      "Automated text messages that keep you top-of-mind. When they're ready to buy again—or their friend needs an agent—you get the call.",
    url: "https://clientpro.io",
    siteName: "ClientPro",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClientPro - Automated Follow-Up for Past Clients",
    description:
      "Turn past clients into repeat buyers and referrals. One deal pays for itself forever.",
  },
  robots: {
    index: true,
    follow: true,
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
