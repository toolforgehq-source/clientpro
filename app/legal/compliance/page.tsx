import Link from "next/link";
import Image from "next/image";

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-block mb-12">
          <Image src="/logo-color.svg" alt="ClientPro" width={130} height={30} />
        </Link>
        <h1 className="text-3xl font-bold text-dark mb-8">TCPA Compliance</h1>
        <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
          <p>Last updated: January 1, 2025</p>
          <p>
            ClientPro takes TCPA (Telephone Consumer Protection Act) compliance
            seriously. Our platform is designed to help you stay compliant while
            maintaining relationships with past clients.
          </p>
          <h2 className="text-xl font-semibold text-dark mt-8">Opt-Out Management</h2>
          <p>
            Every message includes automatic opt-out capability. When a client
            replies &ldquo;STOP,&rdquo; they are immediately removed from all
            future messages. This process is fully automated and irreversible
            without explicit re-consent.
          </p>
          <h2 className="text-xl font-semibold text-dark mt-8">Consent Requirements</h2>
          <p>
            You are responsible for obtaining proper consent before adding
            contacts to ClientPro. We provide tools and guidance to help you
            maintain consent records.
          </p>
          <h2 className="text-xl font-semibold text-dark mt-8">Message Timing</h2>
          <p>
            All messages are sent during appropriate hours (8 AM &ndash; 9 PM in
            the recipient&apos;s local time zone) in compliance with TCPA
            regulations.
          </p>
          <h2 className="text-xl font-semibold text-dark mt-8">Audit Trail</h2>
          <p>
            ClientPro maintains a complete audit trail of all messages sent,
            opt-outs processed, and consent records. This documentation is
            available for your compliance needs.
          </p>
          <p className="mt-12">
            For compliance questions, contact us at{" "}
            <a href="mailto:compliance@clientpro.io" className="text-primary hover:underline">
              compliance@clientpro.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
