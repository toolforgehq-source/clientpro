import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | ClientPro",
  description:
    "Have a question about ClientPro? Get in touch with our team. We respond within 24 hours.",
  openGraph: {
    title: "Contact Us | ClientPro",
    description:
      "Have a question about ClientPro? Get in touch with our team. We respond within 24 hours.",
    url: "https://clientpro.io/contact",
    siteName: "ClientPro",
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactForm />;
}
