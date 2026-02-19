const { Resend } = require("resend");

let resendClient = null;

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("Resend API key not configured");
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

const FROM_EMAIL = process.env.FROM_EMAIL || "notifications@clientpro.io";

module.exports = { getResendClient, FROM_EMAIL };
