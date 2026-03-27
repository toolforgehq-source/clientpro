const { getResendClient, FROM_EMAIL } = require("../config/resend");
const logger = require("../utils/logger");

const sendEmail = async (to, subject, html) => {
  const resend = getResendClient();
  if (!resend) {
    logger.warn("Resend not configured, skipping email to:", to);
    return null;
  }
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
    return result;
  } catch (err) {
    logger.error("Failed to send email:", err.message);
    return null;
  }
};

const sendWelcomeEmail = (to, firstName) =>
  sendEmail(
    to,
    "Welcome to ClientPro!",
    `<h2>Welcome, ${firstName}!</h2>
    <p>You're all set to start staying in touch with your past clients.</p>
    <p>Here's how to get started:</p>
    <ol>
      <li>Add your past clients (or import via CSV)</li>
      <li>We'll schedule personalized messages automatically</li>
      <li>You can edit any message before it sends</li>
    </ol>
    <div style="margin:24px 0;padding:16px;background:#f0fafb;border-radius:12px;border:1px solid #d9f2f5;">
      <p style="margin:0 0 8px 0;font-weight:600;color:#1e8a9c;">Get the ClientPro App</p>
      <p style="margin:0 0 12px 0;font-size:14px;color:#555;">Add ClientPro to your phone's home screen for quick access — it works just like a downloaded app.</p>
      <p style="margin:0;font-size:14px;color:#555;"><strong>iPhone:</strong> Open your dashboard in Safari, tap the Share button, then tap "Add to Home Screen"</p>
      <p style="margin:4px 0 0 0;font-size:14px;color:#555;"><strong>Android:</strong> Open your dashboard in Chrome, tap the menu, then tap "Add to Home screen"</p>
    </div>
    <p>One deal from a past client pays for ClientPro forever. Let's make it happen.</p>
    <p>— The ClientPro Team</p>`
  );

const sendPasswordResetEmail = (to, resetUrl) =>
  sendEmail(
    to,
    "Reset Your ClientPro Password",
    `<h2>Password Reset</h2>
    <p>Click the link below to reset your password. This link expires in 1 hour.</p>
    <p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#1e8a9c;color:white;text-decoration:none;border-radius:8px;">Reset Password</a></p>
    <p>If you didn't request this, you can safely ignore this email.</p>`
  );

const sendTeamInviteEmail = (to, inviterName, teamCode, signupUrl) =>
  sendEmail(
    to,
    `${inviterName} invited you to join their team on ClientPro`,
    `<h2>You've been invited!</h2>
    <p>${inviterName} has invited you to join their team on ClientPro.</p>
    <p>Use the link below to create your account:</p>
    <p><a href="${signupUrl}" style="display:inline-block;padding:12px 24px;background:#1e8a9c;color:white;text-decoration:none;border-radius:8px;">Join Team</a></p>
    <p>Your team code: <strong>${teamCode}</strong></p>`
  );

const sendReplyNotificationEmail = (to, agentFirstName, clientName, replyText) =>
  sendEmail(
    to,
    `${clientName} replied to your message`,
    `<h2>You got a reply!</h2>
    <p>Hey ${agentFirstName}, ${clientName} just replied to your message:</p>
    <blockquote style="padding:12px;background:#f0f0f0;border-left:4px solid #1e8a9c;margin:16px 0;">${replyText}</blockquote>
    <p>Log in to your dashboard to respond.</p>`
  );

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendTeamInviteEmail,
  sendReplyNotificationEmail,
};
