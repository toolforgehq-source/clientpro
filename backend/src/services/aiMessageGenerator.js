const { getOpenAIClient } = require("../config/openai");
const { personalizeMessage } = require("./messagePersonalizer");
const { getMarketContext } = require("./marketContextProvider");
const logger = require("../utils/logger");

const DEFAULT_MODEL = process.env.OPENAI_MESSAGE_MODEL || "gpt-4o-mini";
const MAX_OUTPUT_TOKENS = 180;
const MAX_MESSAGE_CHARS = 320;

/**
 * Strip the agent signature that `personalizeMessage` appends so that
 * downstream code is free to append its own — the AI generator does not
 * include the signature, and we don't want it duplicated when we fall
 * back to mail-merge.
 */
const stripAgentSignature = (text, agent) => {
  if (!text) return text;
  const fullName = `${agent.first_name} ${agent.last_name}`;
  const idx = text.lastIndexOf(`\n\n— ${fullName}`);
  if (idx === -1) return text;
  return text.slice(0, idx).trim();
};

const appendAgentSignature = (text, agent) => {
  const fullName = `${agent.first_name} ${agent.last_name}`;
  if (text.includes(fullName)) return text;
  const signature = agent.company_name
    ? `\n\n— ${fullName}, ${agent.company_name}`
    : `\n\n— ${fullName}`;
  return `${text}${signature}`;
};

const SYSTEM_PROMPT = `You are drafting a single SMS from a real estate agent to a past client.

The SMS must read like the agent texting a friend — warm, specific, short. Not marketing copy.

RULES:
1. Use the client's first name only. No "Dear", no honorifics.
2. Max 280 characters. One message. No line breaks unless natural.
3. If the market context is relevant to the template's intent, weave in ONE specific fact — but paraphrase, don't quote stats like an analyst. Say "homes in your area are holding up well" not "homes are up 4.2% QoQ."
4. Match the template's INTENT (welcome, anniversary, market update, referral nudge, etc.) — rewrite, don't paraphrase.
5. End with a soft conversational prompt (a question, or "let me know…") — never a hard CTA like "book a call".
6. No emoji unless the template already uses one.
7. Do NOT include a signature, sign-off, or the agent's name. The system will append that.
8. Output ONLY the SMS body. No preamble, no quotes, no JSON.`;

const buildUserPrompt = ({ template, client, agent, marketContext }) => {
  const clientLines = [
    `- Name: ${client.first_name}`,
    `- City: ${marketContext.city}${marketContext.state ? `, ${marketContext.state}` : ""}`,
    `- Property type: ${marketContext.property_type_label}`,
    `- Years since closing: ${marketContext.years_since_closing}`,
  ];
  if (client.spouse_name) clientLines.push(`- Spouse: ${client.spouse_name}`);

  const marketLines = [
    `- Quarter-over-quarter price change in their area: ${marketContext.quarter_change_pct >= 0 ? "+" : ""}${marketContext.quarter_change_pct}% (${marketContext.direction})`,
    `- Median days on market: ${marketContext.median_days_on_market}`,
  ];
  if (marketContext.typical_equity_gain_pct > 0) {
    marketLines.push(
      `- Typical equity gain on a ${marketContext.property_type_label} owned ${marketContext.years_since_closing} years: ~${marketContext.typical_equity_gain_pct}%`
    );
  }

  return [
    `AGENT: ${agent.first_name} ${agent.last_name}${agent.company_name ? ` at ${agent.company_name}` : ""}.`,
    "",
    "CLIENT:",
    ...clientLines,
    "",
    "MARKET SNAPSHOT:",
    ...marketLines,
    `(Source: ${marketContext.source}. Treat as approximate — don't cite exact numbers.)`,
    "",
    `TEMPLATE (intent, NOT literal text):`,
    `Name: ${template.name}`,
    `Triggered: ${template.trigger_days_after_closing} days after closing`,
    `Template text: ${template.message_template}`,
    "",
    "Write the SMS now.",
  ].join("\n");
};

const truncateToLimit = (text) => {
  if (!text) return text;
  if (text.length <= MAX_MESSAGE_CHARS) return text;
  const cutoff = text.lastIndexOf(" ", MAX_MESSAGE_CHARS - 1);
  const end = cutoff > MAX_MESSAGE_CHARS * 0.6 ? cutoff : MAX_MESSAGE_CHARS - 1;
  return text.slice(0, end).trimEnd() + "…";
};

const cleanModelOutput = (raw) => {
  if (!raw) return "";
  let text = String(raw).trim();
  // Strip surrounding quotes if the model ignored rule 8.
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1).trim();
  }
  // Strip a trailing signature if the model added one anyway.
  text = text.replace(/\n+[-—–]\s*[A-Za-z].*$/s, "").trim();
  return text;
};

/**
 * Generate an AI-personalized message for (template, client, agent).
 *
 * Always returns a final, ready-to-send SMS — falls back to mail-merge if
 * AI is unavailable or errors. The caller does not need to handle
 * fallback themselves; they should trust the returned text.
 *
 * @returns {Promise<{ text: string, ai_generated: boolean, model: string|null, fallback_reason: string|null }>}
 */
const generateAIMessage = async ({ template, client, agent, marketContext }) => {
  const mailMerge = personalizeMessage(template.message_template, client, agent);
  const openai = getOpenAIClient();

  if (!openai) {
    return {
      text: mailMerge,
      ai_generated: false,
      model: null,
      fallback_reason: "openai_not_configured",
    };
  }

  const ctx = marketContext || getMarketContext(client);

  try {
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.7,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt({ template, client, agent, marketContext: ctx }) },
      ],
    });

    const raw = completion?.choices?.[0]?.message?.content;
    const cleaned = cleanModelOutput(raw);

    if (!cleaned) {
      logger.warn("AI generator returned empty content, falling back to mail-merge");
      return {
        text: mailMerge,
        ai_generated: false,
        model: DEFAULT_MODEL,
        fallback_reason: "empty_ai_output",
      };
    }

    const truncated = truncateToLimit(cleaned);
    const withSig = appendAgentSignature(stripAgentSignature(truncated, agent), agent);

    return {
      text: withSig,
      ai_generated: true,
      model: DEFAULT_MODEL,
      fallback_reason: null,
    };
  } catch (err) {
    logger.error("AI message generation failed, falling back to mail-merge:", err.message);
    return {
      text: mailMerge,
      ai_generated: false,
      model: DEFAULT_MODEL,
      fallback_reason: `ai_error:${err.message.slice(0, 120)}`,
    };
  }
};

module.exports = {
  generateAIMessage,
  // Exported for tests + reuse:
  buildUserPrompt,
  cleanModelOutput,
  truncateToLimit,
  appendAgentSignature,
  stripAgentSignature,
  SYSTEM_PROMPT,
  DEFAULT_MODEL,
};
