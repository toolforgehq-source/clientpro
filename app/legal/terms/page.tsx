import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-block mb-12">
          <Image src="/logo-color.svg" alt="ClientPro" width={130} height={30} />
        </Link>
        <h1 className="text-3xl font-bold text-dark mb-8">Terms of Service</h1>
        <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
          <p>Last updated: January 1, 2025</p>
          <p>
            These Terms of Service govern your use of the ClientPro platform and
            services. By accessing or using ClientPro, you agree to be bound by
            these terms.
          </p>
          <h2 className="text-xl font-semibold text-dark mt-8">1. Service Description</h2>
          <p>
            ClientPro provides automated SMS follow-up services for real estate
            professionals. Our platform sends text messages on your behalf to
            maintain relationships with past clients.
          </p>
          <h2 className="text-xl font-semibold text-dark mt-8">2. User Responsibilities</h2>
          <p>
            You are responsible for ensuring that all contacts added to ClientPro
            have provided proper consent to receive text messages. You must
            comply with all applicable laws including the TCPA.
          </p>
          <h2 className="text-xl font-semibold text-dark mt-8">3. Billing</h2>
          <p>
            Subscription fees are billed monthly or annually based on your
            selected plan. You may upgrade at any time and downgrade at the end
            of your billing cycle.
          </p>
          <h2 className="text-xl font-semibold text-dark mt-8">4. Termination</h2>
          <p>
            You may cancel your subscription at any time. We reserve the right to
            terminate accounts that violate these terms or engage in spam or
            abusive messaging practices.
          </p>
          <p className="mt-12">
            For questions about these terms, contact us at{" "}
            <a href="mailto:legal@clientpro.io" className="text-primary hover:underline">
              legal@clientpro.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
