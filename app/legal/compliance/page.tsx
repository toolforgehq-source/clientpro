import Link from "next/link";
import Image from "next/image";

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-block mb-12">
          <Image src="/logo-color.svg" alt="ClientPro" width={130} height={30} />
        </Link>
        <h1 className="text-3xl font-bold text-dark mb-2">TCPA Compliance</h1>
        <p className="text-slate-400 mb-8">Last updated: March 10, 2026</p>
        <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
          <p>
            ClientPro is committed to full compliance with the Telephone Consumer
            Protection Act (TCPA), 47 U.S.C. &sect; 227, and all related FCC
            regulations. As a platform that sends automated text messages on behalf
            of real estate professionals, we take our regulatory responsibilities
            seriously and build compliance into every layer of our Service.
          </p>
          <p>
            This page outlines how ClientPro helps you stay compliant, what your
            responsibilities are as a user, and the safeguards we have in place to
            protect both you and your clients.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">1. What Is the TCPA?</h2>
          <p>
            The Telephone Consumer Protection Act (TCPA) is a federal law that regulates
            telemarketing calls, auto-dialed calls, pre-recorded calls, and text messages
            to consumers. The TCPA requires businesses to obtain proper consent before
            sending automated text messages, honor opt-out requests, and follow specific
            rules about when and how messages can be sent.
          </p>
          <p>
            Violations of the TCPA can result in statutory damages of $500 to $1,500 per
            unsolicited message. ClientPro is designed to help you avoid these violations
            by building compliance into the messaging workflow.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">2. Consent Requirements</h2>
          <p>
            The TCPA requires <strong>prior express written consent</strong> before sending
            automated text messages. As a ClientPro user, you are responsible for obtaining
            and documenting this consent before adding any contact to the platform.
          </p>
          <h3 className="text-lg font-medium text-dark mt-6">What Qualifies as Proper Consent</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Written Agreement:</strong> The contact must have signed a written
              agreement (physical or electronic) that clearly authorizes you to send them
              automated text messages. This can be part of a closing document, client intake
              form, or standalone consent form.
            </li>
            <li>
              <strong>Clear Disclosure:</strong> The consent form must clearly state that the
              consumer agrees to receive automated text messages at the phone number provided,
              and must identify you (or your brokerage) as the sender.
            </li>
            <li>
              <strong>Voluntary:</strong> Consent cannot be a condition of purchasing property
              or receiving services. It must be freely given.
            </li>
            <li>
              <strong>Revocable:</strong> The consumer must be informed that they can revoke
              consent at any time.
            </li>
          </ul>

          <h3 className="text-lg font-medium text-dark mt-6">Existing Client Relationships</h3>
          <p>
            Having a prior business relationship with a client (such as a completed
            transaction) does not by itself constitute consent to receive automated text
            messages under the TCPA. You must still obtain explicit written consent. However,
            the nature of your existing relationship may make it easier and more natural to
            obtain this consent &mdash; for example, including a consent clause in your
            closing documents or client onboarding process.
          </p>

          <h3 className="text-lg font-medium text-dark mt-6">Your Responsibility</h3>
          <p>
            ClientPro provides the technology to send messages, but <strong>you are solely
            responsible</strong> for ensuring that every contact you add to the platform has
            provided valid prior express written consent. We strongly recommend maintaining
            copies of all consent records. ClientPro provides a notes field on each client
            record where you can document how and when consent was obtained.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">3. Opt-Out Management</h2>
          <p>
            The TCPA requires that consumers be able to easily opt out of receiving messages.
            ClientPro provides comprehensive, fully automated opt-out handling:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>STOP Keyword:</strong> When any recipient replies &ldquo;STOP&rdquo; (or
              &ldquo;UNSUBSCRIBE,&rdquo; &ldquo;CANCEL,&rdquo; &ldquo;END,&rdquo; or &ldquo;QUIT&rdquo;) to any
              message sent through ClientPro, they are immediately and automatically removed
              from all future messaging. No further messages will be sent to that number.
            </li>
            <li>
              <strong>Instant Processing:</strong> Opt-out requests are processed in real time.
              There is no delay between a STOP reply and the removal of the contact from your
              active messaging list.
            </li>
            <li>
              <strong>Confirmation Message:</strong> When a contact opts out, they receive a
              single confirmation message acknowledging their request (e.g., &ldquo;You have been
              unsubscribed and will not receive further messages.&rdquo;).
            </li>
            <li>
              <strong>Permanent and Irreversible:</strong> Once a contact opts out, they cannot
              be re-added to messaging without providing new, explicit written consent. The
              opt-out is logged permanently in our system.
            </li>
            <li>
              <strong>Cross-Account Protection:</strong> If a phone number opts out of messages
              from one agent, that opt-out is respected across the platform to prevent the same
              number from being contacted by other agents using ClientPro.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-dark mt-10">4. Message Content Requirements</h2>
          <p>
            All messages sent through ClientPro comply with the following content standards:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Sender Identification:</strong> Every message identifies the sender
              (your name) so the recipient knows who is contacting them.
            </li>
            <li>
              <strong>Opt-Out Instructions:</strong> Every message includes clear instructions
              on how to opt out (reply STOP to unsubscribe).
            </li>
            <li>
              <strong>No Deceptive Content:</strong> Messages are personalized, conversational
              follow-ups &mdash; not sales pitches or promotional spam. The content is designed
              to maintain genuine professional relationships.
            </li>
            <li>
              <strong>Message Review:</strong> You have the ability to review and edit every
              message before it is sent, ensuring the content is appropriate and accurate.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-dark mt-10">5. Message Timing Restrictions</h2>
          <p>
            The TCPA and FCC regulations restrict when automated messages can be sent.
            ClientPro enforces the following timing rules:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Allowed Hours:</strong> Messages are only sent between 8:00 AM and
              9:00 PM in the recipient&apos;s local time zone.
            </li>
            <li>
              <strong>Time Zone Detection:</strong> We determine the recipient&apos;s time
              zone based on their area code to ensure messages arrive during appropriate hours.
            </li>
            <li>
              <strong>Holiday Consideration:</strong> Messages are not sent on major federal
              holidays (New Year&apos;s Day, Thanksgiving, Christmas Day) to respect recipients&apos;
              time and maintain professionalism.
            </li>
            <li>
              <strong>Rescheduling:</strong> If a message is scheduled to send outside
              allowed hours, it is automatically held and rescheduled for the next eligible
              delivery window.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-dark mt-10">6. Message Frequency</h2>
          <p>
            ClientPro is designed for low-frequency, high-value follow-up &mdash; not mass
            blasts. Our standard messaging cadence includes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>4 personalized messages per client per year (approximately once per quarter)</li>
            <li>Messages are spaced to feel natural and non-intrusive</li>
            <li>No bulk messaging or blast capabilities</li>
            <li>Each message is individually personalized to the client relationship</li>
          </ul>
          <p>
            This low-frequency approach is intentional. It maintains compliance, respects
            your clients&apos; time, and produces higher engagement rates than aggressive
            messaging strategies.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">7. Dedicated Phone Numbers</h2>
          <p>
            Messages are sent from a dedicated phone number assigned to your account:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Area Code Matching:</strong> Your dedicated number is matched to your
              local area code so recipients see a familiar, local number.
            </li>
            <li>
              <strong>Call and Text Forwarding:</strong> If a client calls or texts the
              dedicated number, it forwards directly to your personal phone so you can
              respond naturally.
            </li>
            <li>
              <strong>One Number Per Agent:</strong> Each agent has their own dedicated number.
              Numbers are not shared across agents or accounts.
            </li>
            <li>
              <strong>Number Registration:</strong> All phone numbers used by ClientPro are
              properly registered with carriers and comply with A2P (Application-to-Person)
              10DLC messaging requirements.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-dark mt-10">8. Record Keeping and Audit Trail</h2>
          <p>
            ClientPro maintains comprehensive records to support your compliance needs:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Message Logs:</strong> A complete record of every message sent,
              including content, timestamp, delivery status, and recipient phone number.
              Logs are retained for a minimum of 5 years.
            </li>
            <li>
              <strong>Opt-Out Records:</strong> A permanent log of all opt-out requests,
              including the phone number, timestamp, and the keyword used. These records
              are never deleted.
            </li>
            <li>
              <strong>Consent Documentation:</strong> We provide fields for you to record
              how and when consent was obtained for each client. We strongly recommend
              keeping this documentation current.
            </li>
            <li>
              <strong>Delivery Reports:</strong> Status of each message (delivered, failed,
              undeliverable) is logged and available in your dashboard.
            </li>
            <li>
              <strong>Data Export:</strong> You can export your complete audit trail at any
              time from your account settings for your own compliance records.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-dark mt-10">9. Do-Not-Call (DNC) List Compliance</h2>
          <p>
            While the National Do-Not-Call Registry primarily applies to telemarketing
            voice calls, ClientPro takes additional precautions:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Our platform is designed for existing client relationships, not cold outreach.
              Users may only add contacts they have a prior relationship with and valid consent from.
            </li>
            <li>
              Contacts who opt out via STOP are added to an internal suppression list that
              is respected across all future interactions.
            </li>
            <li>
              Users are prohibited from importing purchased contact lists or using the
              Service for cold outreach of any kind.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-dark mt-10">10. State-Specific Regulations</h2>
          <p>
            In addition to the federal TCPA, many states have their own telemarketing and
            text messaging laws that may impose additional requirements. Some notable
            examples include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Florida (FTSA):</strong> The Florida Telephone Solicitation Act
              requires prior express written consent for all commercial text messages and
              restricts sending hours to 8 AM &ndash; 8 PM local time.
            </li>
            <li>
              <strong>Oklahoma:</strong> Requires prior consent for automated text messages
              and has specific do-not-call provisions.
            </li>
            <li>
              <strong>Maryland:</strong> Has additional restrictions on automated calls and
              messages, including stricter time-of-day limitations.
            </li>
          </ul>
          <p>
            ClientPro&apos;s messaging rules (8 AM &ndash; 9 PM with consent required) are
            designed to comply with the strictest state standards. However, it is your
            responsibility to be aware of and comply with the specific laws in the states
            where your clients are located.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">11. What Happens If There Is a Violation</h2>
          <p>
            If we become aware of a potential TCPA violation by a user, we may take
            the following actions:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Immediately suspend the account&apos;s messaging capabilities pending investigation.</li>
            <li>Contact the account holder to understand the circumstances and gather information.</li>
            <li>Require evidence of valid consent for flagged contacts before restoring messaging.</li>
            <li>Permanently terminate accounts that engage in willful or repeated violations.</li>
          </ul>
          <p>
            We also reserve the right to report suspected violations to the appropriate
            regulatory authorities.
          </p>

          <h2 className="text-xl font-semibold text-dark mt-10">12. Shared Responsibility</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-slate-200 text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-dark border-b border-slate-200">ClientPro Is Responsible For</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark border-b border-slate-200">You (The Agent) Are Responsible For</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3">Automated opt-out processing (STOP keyword)</td>
                  <td className="px-4 py-3">Obtaining prior express written consent from each contact</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3">Enforcing message timing restrictions (8 AM &ndash; 9 PM)</td>
                  <td className="px-4 py-3">Maintaining records of consent for each contact</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3">Including opt-out instructions in every message</td>
                  <td className="px-4 py-3">Ensuring contact information is accurate and up to date</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3">Maintaining message logs and audit trails</td>
                  <td className="px-4 py-3">Reviewing and approving messages before they are sent</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3">Proper phone number registration (10DLC)</td>
                  <td className="px-4 py-3">Not using the Service for cold outreach or spam</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Providing compliance tools and documentation</td>
                  <td className="px-4 py-3">Complying with all applicable federal and state laws</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold text-dark mt-10">13. Resources</h2>
          <p>
            For more information about TCPA compliance, we recommend the following resources:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <a href="https://www.fcc.gov/consumers/guides/stop-unwanted-robocalls-and-texts"
                className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                FCC Consumer Guide: Stop Unwanted Robocalls and Texts
              </a>
            </li>
            <li>
              <a href="https://www.ftc.gov/legal-library/browse/rules/telemarketing-sales-rule"
                className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                FTC Telemarketing Sales Rule
              </a>
            </li>
            <li>
              <a href="https://www.law.cornell.edu/uscode/text/47/227"
                className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                47 U.S.C. &sect; 227 &mdash; Full Text of the TCPA
              </a>
            </li>
          </ul>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <h2 className="text-xl font-semibold text-dark">Contact Us</h2>
            <p>
              If you have questions about TCPA compliance or need guidance on obtaining
              proper consent, please contact us at:
            </p>
            <p>
              <strong>ToolForgeHQ LLC</strong><br />
              Compliance:{" "}
              <a href="mailto:compliance@clientpro.io" className="text-primary hover:underline">
                compliance@clientpro.io
              </a><br />
              General Support:{" "}
              <a href="mailto:support@clientpro.io" className="text-primary hover:underline">
                support@clientpro.io
              </a>
            </p>
          </div>

          <div className="mt-8 flex gap-6 text-sm">
            <Link href="/legal/terms" className="text-primary hover:underline">Terms of Service</Link>
            <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
