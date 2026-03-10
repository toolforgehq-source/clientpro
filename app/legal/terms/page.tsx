import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-block mb-12">
          <Image src="/logo-color.svg" alt="ClientPro" width={130} height={30} />
        </Link>
        <h1 className="text-3xl font-bold text-dark mb-2">Terms of Service</h1>
        <p className="text-slate-400 mb-8">Last updated: March 10, 2026</p>
        <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement
            between you (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and ToolForgeHQ LLC
            (&ldquo;ClientPro,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), governing your access to and
            use of the ClientPro platform, website, and all related services
            (collectively, the &ldquo;Service&rdquo;). By creating an account or using any part
            of the Service, you acknowledge that you have read, understood, and agree
            to be bound by these Terms. If you do not agree, do not use the Service.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">1. Eligibility</h2>
          <p>
            You must be at least 18 years old and capable of forming a binding contract
            to use ClientPro. By registering, you represent that (a) all information you
            provide is accurate and complete, (b) you are authorized to use the payment
            method associated with your account, and (c) you will keep your account
            credentials secure. You are responsible for all activity under your account.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">2. Service Description</h2>
          <p>
            ClientPro provides an automated SMS follow-up platform designed for real
            estate professionals. The Service enables you to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Import and manage past client contact information</li>
            <li>Schedule and send personalized text messages from a dedicated local phone number matched to your area code</li>
            <li>Track client engagement, referrals, and repeat business opportunities</li>
            <li>Manage opt-outs and maintain TCPA compliance records</li>
          </ul>
          <p>
            Messages are sent from a dedicated phone number assigned to your account.
            This number is matched to your area code and forwards calls and texts
            directly to your personal phone. It is not your existing phone number, but
            it functions as a local presence tied to your account.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">3. Subscriptions and Billing</h2>
          <p>
            ClientPro is offered on a subscription basis. By selecting a plan, you agree
            to pay the applicable fees as described on our pricing page at the time of purchase.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Billing Cycle:</strong> Subscriptions are billed either monthly or
              annually, depending on your selection. Annual plans are billed upfront for
              the full year at a discounted rate.
            </li>
            <li>
              <strong>Automatic Renewal:</strong> Your subscription will automatically
              renew at the end of each billing period unless you cancel before the renewal
              date. You will be charged the then-current rate for your plan.
            </li>
            <li>
              <strong>Plan Changes:</strong> You may upgrade your plan at any time; the
              new rate will be prorated for the remainder of your billing cycle. Downgrades
              take effect at the start of your next billing period.
            </li>
            <li>
              <strong>Payment Processing:</strong> All payments are processed securely through
              Stripe. We do not store your full credit card number on our servers.
            </li>
            <li>
              <strong>Failed Payments:</strong> If a payment fails, we will notify you and
              attempt to charge the payment method on file. If payment remains unsuccessful,
              your account may be suspended or downgraded.
            </li>
            <li>
              <strong>Refunds:</strong> Monthly subscriptions are non-refundable. Annual
              subscriptions may be refunded on a prorated basis within the first 30 days
              of purchase if you have not sent any messages through the platform. After
              30 days, annual subscriptions are non-refundable.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-dark mt-10">4. Cancellation</h2>
          <p>
            You may cancel your subscription at any time from your account settings or
            by contacting support. Upon cancellation:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You retain access to the Service until the end of your current billing period.</li>
            <li>No further charges will be made after cancellation takes effect.</li>
            <li>Scheduled messages that have not yet been sent will be cancelled.</li>
            <li>Your dedicated phone number will be released after a 30-day grace period.</li>
            <li>You may export your client data at any time before or after cancellation.</li>
          </ul>

          <h2 className="text-xl font-semibold text-dark mt-10">5. User Responsibilities and Acceptable Use</h2>
          <p>You agree to use ClientPro only for lawful purposes. Specifically, you agree that:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Consent:</strong> You will only add contacts who have provided proper
              prior express consent to receive text messages from you, as required by the
              Telephone Consumer Protection Act (TCPA) and any other applicable laws.
            </li>
            <li>
              <strong>Accuracy:</strong> You will ensure that all contact information is
              accurate and up-to-date, and you will promptly remove contacts who withdraw consent.
            </li>
            <li>
              <strong>Prohibited Content:</strong> You will not use the Service to send
              messages that are harassing, threatening, discriminatory, obscene, fraudulent,
              or otherwise objectionable.
            </li>
            <li>
              <strong>No Spam:</strong> You will not use the Service for unsolicited bulk
              messaging, cold outreach, or any purpose that constitutes spam under applicable law.
            </li>
            <li>
              <strong>Compliance:</strong> You are solely responsible for complying with
              all federal, state, and local laws governing your use of the Service,
              including but not limited to the TCPA, CAN-SPAM Act, and state telemarketing laws.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-dark mt-10">6. Intellectual Property</h2>
          <p>
            All content, features, and functionality of the Service &mdash; including but
            not limited to text, graphics, logos, software, and the overall design &mdash;
            are owned by ToolForgeHQ LLC and are protected by copyright, trademark, and
            other intellectual property laws. You may not copy, modify, distribute, or
            create derivative works from any part of the Service without our prior
            written consent.
          </p>
          <p>
            You retain ownership of all data you upload to the Service, including client
            contact information. By using the Service, you grant us a limited, non-exclusive
            license to process your data solely for the purpose of providing and improving
            the Service.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, ClientPro and its officers, directors,
            employees, and agents shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages arising out of or related to your use of the
            Service, including but not limited to loss of revenue, lost profits, loss of
            business, or loss of data, whether based on warranty, contract, tort, negligence,
            or any other legal theory.
          </p>
          <p>
            Our total aggregate liability to you for any claims arising from or related to
            the Service shall not exceed the total amount you paid us in the twelve (12)
            months immediately preceding the event giving rise to the claim.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">8. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless ClientPro and its affiliates,
            officers, directors, employees, and agents from and against any and all claims,
            liabilities, damages, losses, costs, and expenses (including reasonable
            attorneys&apos; fees) arising out of or related to: (a) your use of the Service,
            (b) your violation of these Terms, (c) your violation of any applicable law or
            regulation, including the TCPA, or (d) any messages sent through your account.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">9. Disclaimer of Warranties</h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
            warranties of any kind, either express or implied, including but not limited to
            implied warranties of merchantability, fitness for a particular purpose, and
            non-infringement. We do not warrant that the Service will be uninterrupted,
            error-free, or secure, or that any defects will be corrected.
          </p>
          <p>
            While we strive for reliable message delivery, we cannot guarantee that every
            message will be delivered successfully due to factors outside our control,
            including carrier filtering, recipient device settings, and network conditions.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">10. Modifications to the Service and Terms</h2>
          <p>
            We reserve the right to modify, suspend, or discontinue any part of the Service
            at any time with or without notice. We may also update these Terms from time to
            time. If we make material changes, we will notify you by email or through the
            Service at least 30 days before the changes take effect. Your continued use of
            the Service after changes become effective constitutes acceptance of the
            revised Terms.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">11. Account Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account immediately, without
            prior notice, if we reasonably believe that: (a) you have violated these Terms,
            (b) your use of the Service poses a risk to other users or our systems, (c) you
            are engaging in spam or abusive messaging practices, or (d) your account is
            being used for fraudulent purposes. In such cases, no refund will be provided.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">12. Governing Law and Disputes</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of
            the State of Delaware, without regard to its conflict of law provisions. Any
            disputes arising from these Terms or your use of the Service shall be resolved
            through binding arbitration administered by the American Arbitration Association
            (AAA) under its Commercial Arbitration Rules. The arbitration shall take place
            in Delaware. You agree to waive any right to a jury trial or to participate in
            a class action.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">13. Severability</h2>
          <p>
            If any provision of these Terms is found to be invalid, illegal, or unenforceable,
            the remaining provisions shall continue in full force and effect.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">14. Entire Agreement</h2>
          <p>
            These Terms, together with our{" "}
            <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link> and{" "}
            <Link href="/legal/compliance" className="text-primary hover:underline">TCPA Compliance Policy</Link>,
            constitute the entire agreement between you and ClientPro regarding the Service
            and supersede all prior agreements and understandings.
          </p>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <h2 className="text-xl font-semibold text-dark">Contact Us</h2>
            <p>
              If you have questions about these Terms, please contact us at:
            </p>
            <p>
              <strong>ToolForgeHQ LLC</strong><br />
              Email:{" "}
              <a href="mailto:legal@clientpro.io" className="text-primary hover:underline">
                legal@clientpro.io
              </a><br />
              Support:{" "}
              <a href="mailto:support@clientpro.io" className="text-primary hover:underline">
                support@clientpro.io
              </a>
            </p>
          </div>

          <div className="mt-8 flex gap-6 text-sm">
            <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            <Link href="/legal/compliance" className="text-primary hover:underline">TCPA Compliance</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
