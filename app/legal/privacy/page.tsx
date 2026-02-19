import Link from "next/link";
import Image from "next/image";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-block mb-12">
          <Image src="/logo-color.svg" alt="ClientPro" width={130} height={30} />
        </Link>
        <h1 className="text-3xl font-bold text-dark mb-8">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
          <p>Last updated: January 1, 2025</p>
          <p>
            ClientPro is committed to protecting your privacy and the privacy of
            your clients. This policy explains how we collect, use, and safeguard
            your data.
          </p>
          <h2 className="text-xl font-semibold text-dark mt-8">1. Data We Collect</h2>
          <p>
            We collect information you provide including your name, email, phone
            number, and client contact information. We also collect usage data
            to improve our services.
          </p>
          <h2 className="text-xl font-semibold text-dark mt-8">2. How We Use Data</h2>
          <p>
            Your data is used solely to provide the ClientPro service—sending
            automated text messages to your past clients on your behalf and
            providing analytics on engagement.
          </p>
          <h2 className="text-xl font-semibold text-dark mt-8">3. Data Security</h2>
          <p>
            We use bank-level encryption (AES-256) to protect all data at rest
            and in transit. Our infrastructure is SOC 2 certified and undergoes
            regular security audits.
          </p>
          <h2 className="text-xl font-semibold text-dark mt-8">4. Data Sharing</h2>
          <p>
            We never sell your data or your clients&apos; data. We only share data
            with service providers necessary to deliver our service (e.g., SMS
            carriers).
          </p>
          <p className="mt-12">
            For privacy inquiries, contact us at{" "}
            <a href="mailto:privacy@clientpro.io" className="text-primary hover:underline">
              privacy@clientpro.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
