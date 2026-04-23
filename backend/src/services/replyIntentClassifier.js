const { getOpenAIClient } = require("../config/openai");
const logger = require("../utils/logger");

const DEFAULT_MODEL = process.env.OPENAI_INTENT_MODEL || "gpt-4o-mini";
const MAX_DRAFT_CHARS = 280;

/**
 * Canonical intent taxonomy. Keep this list narrow and actionable — each
 * bucket should map to a clear agent workflow.
 *
 *   hot       — client signals a transaction or referral (buy/sell/refer/meet)
 *   question  — client asks something specific that needs an answer
 *   warm      — friendly engagement, no action item (catching up, thanks)
 *   cold      — polite deflection (busy / not now / maybe later)
 *   negative  — frustration, complaint, unhappy sentiment
 *   unknown   — couldn't confidently classify
 */
const INTENTS = ["hot", "question", "warm", "cold", "negative", "unknown"];

const STOP_KEYWORDS = ["stop", "unsubscribe", "cancel", "quit", "end", "remove me"];

const HOT_PATTERNS = [
  /\b(buy|buying|sell|selling|list|listing|move|moving|relocat\w*)\b/i,
  /\b(refer|referral|friend who|coworker who|family member who)\b/i,
  /\b(when can (you|we)|let'?s (meet|talk|chat|grab|connect)|call me|give me a call)\b/i,
  /\b(interested in|thinking (of|about) (buy|sell|mov|list))/i,
  /\b(pre[- ]?approv|mortgage|lender|loan officer)\b/i,
  /\b(what('| i)?s my (home|house|property) worth|home value|equity)\b/i,
];

const QUESTION_PATTERNS = [
  /\?/,
  /\b(how (do|can|much|long|often)|what (is|are|does|would)|when (is|are|would|can)|where (is|are|can)|who (is|are|would)|why (is|are|does|would))\b/i,
  /\b(can you (tell|explain|share|send|help)|do you (know|have|recommend))\b/i,
];

const NEGATIVE_PATTERNS = [
  /\b(not interested|leave me alone|stop (text|msg|messag)|don'?t (text|message|contact) me)\b/i,
  /\b(spam|annoying|frustrat\w*|angry|upset|complain\w*|terrible|awful|worst)\b/i,
  /\b(unhappy|disappointed|waste|scam)\b/i,
];

const COLD_PATTERNS = [
  /\b(busy|swamped|later|not now|not (a )?good time|no thanks|no thank you|nope|pass)\b/i,
  /\b(maybe (later|next)|we'?re good|all set|not right now|some other time)\b/i,
];

const WARM_PATTERNS = [
  /\b(thanks|thank you|thx|appreciate|kind of you|nice of you|hope (you|all))/i,
  /\b(doing (good|well|great)|all good|great to hear|good to hear)/i,
  /\b(happy (new year|birthday|holidays)|merry (christmas|xmas))/i,
];

const normalize = (text) => String(text || "").trim();

const matchesAny = (text, patterns) => patterns.some((re) => re.test(text));

/**
 * Keyword-based fallback classifier. Deterministic, no network calls.
 *
 * Order matters:
 *   1. STOP/opt-out language → negative (even though webhook also hard-stops it)
 *   2. Hot signals beat everything else (transaction intent is rare & valuable)
 *   3. Questions win over warm/cold (we want to surface things needing answers)
 *   4. Negative language
 *   5. Cold deflection
 *   6. Warm / polite
 *   7. Default: unknown
 */
const classifyHeuristic = (replyText) => {
  const text = normalize(replyText);
  if (!text) {
    return { intent: "unknown", confidence: 0, reason: "Empty reply" };
  }

  const lower = text.toLowerCase();

  if (STOP_KEYWORDS.some((kw) => lower === kw || lower.startsWith(`${kw} `) || lower.endsWith(` ${kw}`))) {
    return { intent: "negative", confidence: 0.9, reason: "Opt-out keyword" };
  }

  if (matchesAny(text, HOT_PATTERNS)) {
    return { intent: "hot", confidence: 0.7, reason: "Transaction or referral signal" };
  }

  if (matchesAny(text, QUESTION_PATTERNS)) {
    return { intent: "question", confidence: 0.65, reason: "Contains a direct question" };
  }

  if (matchesAny(text, NEGATIVE_PATTERNS)) {
    return { intent: "negative", confidence: 0.7, reason: "Negative sentiment" };
  }

  if (matchesAny(text, COLD_PATTERNS)) {
    return { intent: "cold", confidence: 0.6, reason: "Polite deflection" };
  }

  if (matchesAny(text, WARM_PATTERNS)) {
    return { intent: "warm", confidence: 0.55, reason: "Friendly acknowledgment" };
  }

  return { intent: "unknown", confidence: 0.3, reason: "No strong signal" };
};

const SYSTEM_PROMPT = `You classify SMS replies from real estate past clients into one of 6 intents and optionally draft a short agent response.

INTENTS (pick exactly one):
- hot:      client signals a real-estate transaction or referral (buy, sell, refer someone, wants to meet, asks home value).
- question: client asks something specific that requires an answer.
- warm:     friendly engagement, no action item (thanks, small talk, "doing great").
- cold:     polite deflection ("busy", "not now", "maybe later", "we're good").
- negative: frustration, complaint, unhappy sentiment, or wants to stop being contacted.
- unknown:  cannot confidently classify.

DRAFT REPLY RULES:
- Only draft a reply for intents: hot, question, warm. For cold/negative/unknown, leave draft as null.
- Max 240 characters, no line breaks, conversational, first-person from the agent, no signature.
- Never fabricate appointments, market data, or numbers.
- For "hot": acknowledge + propose a next step (quick call, coffee, send info).
- For "question": give a generic safe answer OR ask a quick clarifier the agent can tweak.
- For "warm": short friendly acknowledgment.

OUTPUT:
Return ONLY compact JSON with keys: intent (string), confidence (number 0..1), reason (short string), draft_reply (string or null). No markdown, no code fences, no commentary.`;

const buildUserPrompt = ({ replyText, client, agent, lastAgentMessage }) => {
  const lines = [];
  if (agent) {
    lines.push(
      `AGENT: ${agent.first_name || ""} ${agent.last_name || ""}`.trim() +
        (agent.company_name ? ` at ${agent.company_name}` : "")
    );
  }
  if (client) {
    lines.push(
      `CLIENT: ${client.first_name || ""} ${client.last_name || ""}`.trim() +
        (client.city ? ` in ${client.city}${client.state ? `, ${client.state}` : ""}` : "")
    );
  }
  if (lastAgentMessage) {
    lines.push("");
    lines.push("MOST RECENT AGENT MESSAGE (for context):");
    lines.push(String(lastAgentMessage).slice(0, 400));
  }
  lines.push("");
  lines.push("CLIENT REPLY:");
  lines.push(replyText);
  lines.push("");
  lines.push("Classify and draft. Return JSON only.");
  return lines.join("\n");
};

const coerceIntent = (raw) => {
  const v = String(raw || "").trim().toLowerCase();
  return INTENTS.includes(v) ? v : null;
};

const coerceConfidence = (raw) => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
};

const sanitizeDraft = (raw) => {
  if (raw === null || raw === undefined) return null;
  let text = String(raw).trim();
  if (!text) return null;
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1).trim();
  }
  text = text.replace(/\s*\n+\s*/g, " ").trim();
  if (text.length > MAX_DRAFT_CHARS) {
    const cutoff = text.lastIndexOf(" ", MAX_DRAFT_CHARS - 1);
    text = text.slice(0, cutoff > MAX_DRAFT_CHARS * 0.6 ? cutoff : MAX_DRAFT_CHARS - 1).trimEnd() + "…";
  }
  return text;
};

const parseModelJson = (raw) => {
  if (!raw) return null;
  let text = String(raw).trim();
  // Strip code fences if the model ignored instructions.
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract a JSON object from a noisier response.
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

/**
 * Classify an incoming reply. Always returns a result — never throws.
 *
 * @returns {Promise<{
 *   intent: string,
 *   confidence: number,
 *   reason: string,
 *   draft_reply: string|null,
 *   ai_used: boolean,
 *   model: string|null,
 *   fallback_reason: string|null
 * }>}
 */
async function classifyReply({ replyText, client = null, agent = null, lastAgentMessage = null } = {}) {
  const text = normalize(replyText);
  const baseline = classifyHeuristic(text);
  const heuristicResult = {
    intent: baseline.intent,
    confidence: baseline.confidence,
    reason: baseline.reason,
    draft_reply: null,
    ai_used: false,
    model: null,
    fallback_reason: null,
  };

  if (!text) {
    return { ...heuristicResult, fallback_reason: "Empty reply" };
  }

  const openai = getOpenAIClient();
  if (!openai) {
    return { ...heuristicResult, fallback_reason: "OPENAI_API_KEY not set" };
  }

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.2,
      max_tokens: 220,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt({ replyText: text, client, agent, lastAgentMessage }) },
      ],
    });

    const content = response?.choices?.[0]?.message?.content;
    const parsed = parseModelJson(content);
    if (!parsed) {
      return { ...heuristicResult, fallback_reason: "Model returned unparseable JSON" };
    }

    const intent = coerceIntent(parsed.intent) || baseline.intent;
    const confidence = coerceConfidence(parsed.confidence);
    const reason = typeof parsed.reason === "string" && parsed.reason.trim() ? parsed.reason.trim().slice(0, 280) : baseline.reason;
    const draft = ["hot", "question", "warm"].includes(intent) ? sanitizeDraft(parsed.draft_reply) : null;

    return {
      intent,
      confidence: confidence == null ? baseline.confidence : confidence,
      reason,
      draft_reply: draft,
      ai_used: true,
      model: DEFAULT_MODEL,
      fallback_reason: null,
    };
  } catch (err) {
    logger.error("Reply intent classification failed, using heuristic:", err.message);
    return { ...heuristicResult, fallback_reason: `AI error: ${err.message}` };
  }
}

module.exports = {
  classifyReply,
  classifyHeuristic,
  INTENTS,
  _internal: { sanitizeDraft, parseModelJson, coerceIntent, coerceConfidence },
};
