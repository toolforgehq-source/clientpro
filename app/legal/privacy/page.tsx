import Link from "next/link";
import Image from "next/image";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-block mb-12">
          <Image src="/logo-color.svg" alt="ClientPro" width={130} height={30} />
        </Link>
        <h1 className="text-3xl font-bold text-dark mb-2">Privacy Policy</h1>
        <p className="text-slate-400 mb-8">Last updated: March 10, 2026</p>
        <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
          <p>
            ToolForgeHQ LLC (&ldquo;ClientPro,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is
            committed to protecting the privacy of our users and the clients they
            serve. This Privacy Policy explains what information we collect, how we
            use it, who we share it with, and the choices you have regarding your
            data. By using the ClientPro platform (&ldquo;Service&rdquo;), you consent to the
            practices described in this policy.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">1. Information We Collect</h2>
          <h3 className="text-lg font-medium text-dark mt-6">1.1 Information You Provide</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account Information:</strong> When you register, we collect your
              first name, last name, email address, phone number, company name (optional),
              and password.
            </li>
            <li>
              <strong>Client Data:</strong> You upload information about your past clients,
              including their names, phone numbers, email addresses, property addresses,
              property types, closing dates, and any notes you add.
            </li>
            <li>
              <strong>Payment Information:</strong> When you subscribe, payment details
              (credit card number, billing address) are collected and processed by our
              payment processor, Stripe. We do not store your full credit card number
              on our servers. We receive and store only a tokenized reference, your card
              type, last four digits, and expiration date for display purposes.
            </li>
            <li>
              <strong>Communications:</strong> If you contact us for support or provide
              feedback, we may retain the content of those communications.
            </li>
          </ul>

          <h3 className="text-lg font-medium text-dark mt-6">1.2 Information Collected Automatically</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Usage Data:</strong> We collect information about how you interact
              with the Service, including pages visited, features used, actions taken,
              and timestamps.
            </li>
            <li>
              <strong>Device and Browser Information:</strong> We collect your IP address,
              browser type and version, operating system, device type, and screen resolution.
            </li>
            <li>
              <strong>Cookies and Similar Technologies:</strong> We use essential cookies
              to maintain your session and preferences. We do not use third-party advertising
              cookies or tracking pixels. See Section 7 for more details.
            </li>
          </ul>

          <h3 className="text-lg font-medium text-dark mt-6">1.3 Information from Third Parties</h3>
          <p>
            If you import client data from a CSV file or integration, we collect the data
            contained in those imports. We do not purchase or acquire personal data from
            third-party data brokers.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">2. How We Use Your Information</h2>
          <p>We use your information for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Providing the Service:</strong> Sending automated text messages to
              your past clients on your behalf, scheduling messages, tracking engagement,
              and managing referrals.
            </li>
            <li>
              <strong>Account Management:</strong> Creating and maintaining your account,
              authenticating your identity, processing subscription payments, and providing
              customer support.
            </li>
            <li>
              <strong>Service Improvement:</strong> Analyzing usage patterns to improve
              features, fix bugs, and optimize the user experience. This analysis uses
              aggregated, anonymized data whenever possible.
            </li>
            <li>
              <strong>Communications:</strong> Sending you transactional emails (account
              confirmations, billing receipts, security alerts) and, with your consent,
              product updates or tips. You may opt out of non-transactional communications
              at any time.
            </li>
            <li>
              <strong>Legal Compliance:</strong> Complying with applicable laws, regulations,
              and legal processes, and protecting our rights and the rights of our users.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-dark mt-10">3. How We Share Your Information</h2>
          <p>
            <strong>We never sell your data or your clients&apos; data.</strong> We share
            information only in the following limited circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Twilio (SMS Provider):</strong> Client phone numbers and message
              content are transmitted to Twilio to deliver text messages on your behalf.
              Twilio processes this data under their own privacy policy and our data
              processing agreement with them.
            </li>
            <li>
              <strong>Stripe (Payment Processor):</strong> Your payment information is
              processed by Stripe. We share your email address and subscription details
              with Stripe to manage billing.
            </li>
            <li>
              <strong>Hosting Providers:</strong> Our Service is hosted on Render (backend)
              and Vercel (frontend). These providers store and process data on our behalf
              under strict data processing agreements.
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose your information if
              required to do so by law, court order, or government request, or if we
              believe disclosure is necessary to protect the rights, property, or safety
              of ClientPro, our users, or the public.
            </li>
            <li>
              <strong>Business Transfers:</strong> If ClientPro is involved in a merger,
              acquisition, or sale of assets, your information may be transferred as part
              of that transaction. We will notify you before your data is subject to a
              different privacy policy.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-dark mt-10">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Encryption in Transit:</strong> All data transmitted between your
              browser and our servers is encrypted using TLS 1.2 or higher (HTTPS).
            </li>
            <li>
              <strong>Encryption at Rest:</strong> Sensitive data stored in our database
              is encrypted using AES-256 encryption.
            </li>
            <li>
              <strong>Password Security:</strong> User passwords are hashed using bcrypt
              with industry-standard salt rounds. We never store plaintext passwords.
            </li>
            <li>
              <strong>Access Controls:</strong> Access to production systems and databases
              is restricted to authorized personnel only, using role-based access controls
              and audit logging.
            </li>
            <li>
              <strong>Regular Monitoring:</strong> We monitor our systems for security
              threats and unauthorized access attempts.
            </li>
          </ul>
          <p>
            While we take reasonable precautions to protect your data, no method of
            transmission over the internet or electronic storage is 100% secure. We
            cannot guarantee absolute security but are committed to promptly addressing
            any security incidents.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">5. Data Retention</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Active Accounts:</strong> We retain your data for as long as your
              account is active and you maintain an active subscription.
            </li>
            <li>
              <strong>After Cancellation:</strong> When you cancel your subscription, we
              retain your account and client data for 90 days to allow for reactivation.
              After 90 days, your data is permanently deleted from our active systems.
            </li>
            <li>
              <strong>Message Logs:</strong> Records of messages sent through the Service
              (including delivery status and opt-out records) are retained for 3 years to
              support TCPA compliance documentation.
            </li>
            <li>
              <strong>Backups:</strong> Encrypted backups may retain deleted data for up
              to 30 additional days before being purged.
            </li>
            <li>
              <strong>Data Export:</strong> You may request an export of all your data at
              any time through your account settings or by contacting support.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-dark mt-10">6. Your Rights and Choices</h2>
          <p>Depending on your jurisdiction, you may have the following rights:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Access:</strong> Request a copy of the personal data we hold about you.
            </li>
            <li>
              <strong>Correction:</strong> Request that we update or correct inaccurate
              personal data.
            </li>
            <li>
              <strong>Deletion:</strong> Request that we delete your personal data, subject
              to legal retention requirements.
            </li>
            <li>
              <strong>Data Portability:</strong> Request your data in a structured,
              machine-readable format (CSV export).
            </li>
            <li>
              <strong>Opt-Out of Communications:</strong> Unsubscribe from non-essential
              emails at any time using the link in any email we send.
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:privacy@clientpro.io" className="text-primary hover:underline">
              privacy@clientpro.io
            </a>. We will respond to your request within 30 days.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">7. Cookies</h2>
          <p>
            We use only essential cookies that are strictly necessary for the Service
            to function. These include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Authentication Cookies:</strong> To keep you logged in and maintain
              your session.
            </li>
            <li>
              <strong>Preference Cookies:</strong> To remember your settings and preferences
              within the application.
            </li>
          </ul>
          <p>
            We do not use advertising cookies, third-party tracking pixels, or analytics
            cookies that track you across other websites. We do not participate in
            cross-site tracking or ad retargeting.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">8. California Privacy Rights (CCPA)</h2>
          <p>
            If you are a California resident, you have additional rights under the
            California Consumer Privacy Act (CCPA):
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The right to know what personal information we collect, use, and disclose.</li>
            <li>The right to request deletion of your personal information.</li>
            <li>The right to opt out of the sale of personal information. <strong>We do not
              sell personal information.</strong></li>
            <li>The right to non-discrimination for exercising your CCPA rights.</li>
          </ul>
          <p>
            To submit a CCPA request, contact us at{" "}
            <a href="mailto:privacy@clientpro.io" className="text-primary hover:underline">
              privacy@clientpro.io
            </a>{" "}with the subject line &ldquo;CCPA Request.&rdquo;
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">9. Children&apos;s Privacy</h2>
          <p>
            ClientPro is not intended for use by individuals under the age of 18. We
            do not knowingly collect personal information from children. If we become
            aware that we have collected data from a child under 18, we will promptly
            delete that information.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">10. International Users</h2>
          <p>
            ClientPro is operated from the United States. If you access the Service
            from outside the United States, please be aware that your data will be
            transferred to, stored, and processed in the United States, where data
            protection laws may differ from those in your jurisdiction. By using the
            Service, you consent to this transfer.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. If we make material
            changes, we will notify you by email or through the Service at least 30 days
            before the changes take effect. Your continued use of the Service after the
            effective date constitutes acceptance of the updated policy.
          </p>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <h2 className="text-xl font-semibold text-dark">Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our data
              practices, please contact us at:
            </p>
            <p>
              <strong>ToolForgeHQ LLC</strong><br />
              Privacy Inquiries:{" "}
              <a href="mailto:privacy@clientpro.io" className="text-primary hover:underline">
                privacy@clientpro.io
              </a><br />
              General Support:{" "}
              <a href="mailto:support@clientpro.io" className="text-primary hover:underline">
                support@clientpro.io
              </a>
            </p>
          </div>

          <div className="mt-8 flex gap-6 text-sm">
            <Link href="/legal/terms" className="text-primary hover:underline">Terms of Service</Link>
            <Link href="/legal/compliance" className="text-primary hover:underline">TCPA Compliance</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
