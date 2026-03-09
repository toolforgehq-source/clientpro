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

export default function Home() {
  return (
    <>
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
