import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BrokeragesContent from "@/components/BrokeragesContent";

export const metadata: Metadata = {
  title: "ClientPro for Brokerages | Roll Out Automated Follow-Up Across Your Team",
  description:
    "Give every agent in your brokerage the tools to stay connected with past clients. Team dashboard, manager oversight, and unlimited agents.",
  openGraph: {
    title: "ClientPro for Brokerages",
    description:
      "Roll out automated past-client follow-up across your entire brokerage. One dashboard, every agent.",
    url: "https://clientpro.io/brokerages",
    siteName: "ClientPro",
    type: "website",
  },
};

export default function BrokeragesPage() {
  return (
    <>
      <Navigation />
      <main>
        <BrokeragesContent />
      </main>
      <Footer />
    </>
  );
}
