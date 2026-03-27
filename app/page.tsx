import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import Features from "@/components/Features";
import ProductShowcase from "@/components/ProductShowcase";
import ROICalculator from "@/components/ROICalculator";
import SocialProof from "@/components/SocialProof";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Referral from "@/components/Referral";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ClientPro",
  url: "https://clientpro.io",
  logo: "https://clientpro.io/logo-color.svg",
  description:
    "Automated text message follow-up for real estate agents. Stay top-of-mind with past clients to get more repeat business and referrals.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@clientpro.io",
    contactType: "customer support",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do messages come from my number?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We provision you a dedicated business phone number through our system. To your clients, it looks like texts from you. They can reply directly and you see it instantly in your dashboard.",
      },
    },
    {
      "@type": "Question",
      name: "Can I customize the messages?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every message is pre-written and personalized with your client's name, property details, and city. You can edit any message before it sends, or let them go out as-is.",
      },
    },
    {
      "@type": "Question",
      name: "What if a client wants to stop receiving messages?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They reply STOP and we automatically opt them out — 100% compliant with TCPA regulations. You can also manually opt them out anytime. Full audit trail for compliance.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a free trial?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. ClientPro starts at $29/month. One referral from a past client pays for the entire year. This is an investment that pays for itself.",
      },
    },
    {
      "@type": "Question",
      name: "How long until I see results?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most agents report their first repeat client or referral within 90 days. Past clients move every 7-13 years on average. You are planting seeds. When they are ready, you will be top-of-mind.",
      },
    },
    {
      "@type": "Question",
      name: "Do clients actually respond to these texts?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We see 15-25% reply rates because the messages are genuinely helpful and come from your number. It is relationship maintenance, not spam.",
      },
    },
    {
      "@type": "Question",
      name: "Can I switch tiers anytime?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Upgrade immediately. Downgrade at next billing cycle. No contracts, no penalties.",
      },
    },
    {
      "@type": "Question",
      name: "What is the real ROI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Average agent gets 3-5 deals per year from ClientPro (mix of repeat clients and referrals). At $9K average commission, that is $27K-$45K from a $470-$14,990 annual investment.",
      },
    },
    {
      "@type": "Question",
      name: "What industries does this work for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Primarily real estate agents, but also mortgage brokers, insurance agents, financial advisors, and any professional who relies on repeat business and referrals.",
      },
    },
    {
      "@type": "Question",
      name: "Do you integrate with my CRM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can import clients via CSV today. Native integrations with Follow Up Boss, KVCore, and LionDesk are launching soon. Once connected, new past clients sync automatically.",
      },
    },
  ],
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ClientPro",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android",
  url: "https://clientpro.io",
  description:
    "Automated past-client follow-up via SMS for real estate agents. Get more referrals and repeat business.",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "29",
    highPrice: "1499",
    priceCurrency: "USD",
    offerCount: "6",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareJsonLd),
        }}
      />
      <Navigation />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <ProductShowcase />
        <ROICalculator />
        <SocialProof />
        <Pricing />
        <FAQ />
        <Referral />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
