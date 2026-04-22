const OpenAI = require("openai");
const logger = require("../utils/logger");

let cachedClient = null;
let hasLogged = false;

/**
 * Returns a singleton OpenAI client, or null if no API key is configured.
 *
 * The rest of the app must tolerate a null client (e.g. by falling back to
 * deterministic mail-merge) so the system keeps working in environments
 * without OpenAI access (local dev, preview deploys, agents who have not
 * opted into AI personalization, etc.).
 */
const getOpenAIClient = () => {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    if (!hasLogged) {
      logger.info(
        "OPENAI_API_KEY not set — AI personalization is disabled, " +
          "agents with use_ai_personalization=true will fall back to mail-merge."
      );
      hasLogged = true;
    }
    return null;
  }

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
};

/**
 * Override the cached client. Intended for tests only.
 */
const _setOpenAIClientForTesting = (client) => {
  cachedClient = client;
};

const _resetForTesting = () => {
  cachedClient = null;
  hasLogged = false;
};

module.exports = {
  getOpenAIClient,
  _setOpenAIClientForTesting,
  _resetForTesting,
};
