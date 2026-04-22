/**
 * Smoke tests for aiMessageGenerator — run with: `node src/services/__tests__/aiMessageGenerator.smoke.js`
 *
 * The backend has no test runner configured (see package.json: `"lint": "echo 'No linter configured'"`),
 * so these are lightweight asserts using `node:assert`. They cover the cases that must always work:
 *   1. No OpenAI key → deterministic mail-merge fallback.
 *   2. OpenAI error → deterministic mail-merge fallback (does not throw).
 *   3. Happy path with a stubbed OpenAI client → AI text is trimmed, truncated, signed.
 *   4. Market context is deterministic for a given (zip, state) pair.
 */
const assert = require("node:assert/strict");

// Silence logger.info output during the run.
process.env.LOG_LEVEL = "error";

const {
  generateAIMessage,
  cleanModelOutput,
  truncateToLimit,
  appendAgentSignature,
  stripAgentSignature,
} = require("../aiMessageGenerator");
const { getMarketContext } = require("../marketContextProvider");
const { _setOpenAIClientForTesting, _resetForTesting } = require("../../config/openai");

const template = {
  name: "Year 1 Anniversary",
  trigger_days_after_closing: 365,
  message_template:
    "Happy house-iversary {{first_name}}! Can you believe it's been a year? Hope you're loving {{city}}!",
};

const client = {
  id: "c-1",
  first_name: "Sarah",
  last_name: "Chen",
  city: "Austin",
  state: "TX",
  zip: "78704",
  property_type: "single_family",
  closing_date: "2024-04-21",
};

const agent = {
  id: "a-1",
  first_name: "Mark",
  last_name: "Reynolds",
  company_name: "Reynolds & Co",
  use_ai_personalization: true,
};

const run = async () => {
  // ---- 1. Fallback when OPENAI_API_KEY is not set -------------------------
  delete process.env.OPENAI_API_KEY;
  _resetForTesting();
  {
    const result = await generateAIMessage({ template, client, agent });
    assert.equal(result.ai_generated, false, "no key → not AI-generated");
    assert.equal(result.fallback_reason, "openai_not_configured");
    assert.ok(result.text.includes("Sarah"), "fallback text has first name");
    assert.ok(result.text.includes("Austin"), "fallback text has city");
    assert.ok(result.text.includes("Mark Reynolds"), "fallback text is signed");
  }
  console.log("ok 1 — fallback when no OPENAI_API_KEY");

  // ---- 2. Happy path with stub client -------------------------------------
  process.env.OPENAI_API_KEY = "sk-test-stub";
  _resetForTesting();
  _setOpenAIClientForTesting({
    chat: {
      completions: {
        create: async () => ({
          choices: [
            {
              message: {
                content:
                  "Happy one year in Austin, Sarah! Homes in your area are holding up well — your investment is looking solid. Hope year two in the house is even better. Let me know if anything's coming up you want to talk through.",
              },
            },
          ],
        }),
      },
    },
  });
  {
    const result = await generateAIMessage({ template, client, agent });
    assert.equal(result.ai_generated, true, "happy path → AI-generated");
    assert.equal(result.fallback_reason, null);
    assert.ok(result.text.includes("Sarah"));
    assert.ok(result.text.includes("Mark Reynolds, Reynolds & Co"), "AI text is signed");
    assert.ok(!/^["'].*["']$/.test(result.text.split("\n")[0]), "quotes stripped");
  }
  console.log("ok 2 — AI happy path with stubbed client");

  // ---- 3. OpenAI throws → fall back silently ------------------------------
  _resetForTesting();
  _setOpenAIClientForTesting({
    chat: {
      completions: {
        create: async () => {
          throw new Error("rate limit exceeded");
        },
      },
    },
  });
  {
    const result = await generateAIMessage({ template, client, agent });
    assert.equal(result.ai_generated, false, "error → not AI-generated");
    assert.ok(result.fallback_reason?.startsWith("ai_error:"), "fallback_reason labels the error");
    assert.ok(result.text.includes("Sarah"), "fallback still personalized via mail-merge");
  }
  console.log("ok 3 — AI error falls back to mail-merge");

  // ---- 4. Empty model output → fall back ----------------------------------
  _resetForTesting();
  _setOpenAIClientForTesting({
    chat: {
      completions: {
        create: async () => ({ choices: [{ message: { content: "   " } }] }),
      },
    },
  });
  {
    const result = await generateAIMessage({ template, client, agent });
    assert.equal(result.ai_generated, false);
    assert.equal(result.fallback_reason, "empty_ai_output");
  }
  console.log("ok 4 — empty AI output falls back");

  // ---- 5. Helpers ---------------------------------------------------------
  assert.equal(cleanModelOutput('"hello"'), "hello", "cleanModelOutput strips quotes");
  assert.equal(
    cleanModelOutput("hello\n\n— Mark Reynolds, Reynolds & Co"),
    "hello",
    "cleanModelOutput strips signatures"
  );
  assert.equal(truncateToLimit("a".repeat(500)).length <= 320, true, "truncateToLimit clamps");
  assert.ok(appendAgentSignature("hi", agent).endsWith("Mark Reynolds, Reynolds & Co"));
  assert.equal(
    stripAgentSignature("hi\n\n— Mark Reynolds, Reynolds & Co", agent),
    "hi",
    "stripAgentSignature removes signature"
  );
  console.log("ok 5 — helper functions behave");

  // ---- 6. Market context is deterministic per (zip, state) ----------------
  const ctx1 = getMarketContext(client);
  const ctx2 = getMarketContext(client);
  assert.deepEqual(ctx1, ctx2, "market context is stable across calls");
  assert.equal(ctx1.source, "mock");
  assert.equal(ctx1.city, "Austin");
  assert.ok(ctx1.quarter_change_pct >= -3 && ctx1.quarter_change_pct <= 6, "qoq in plausible band");
  console.log("ok 6 — market context deterministic");

  console.log("\nall ai generator smoke tests passed");
};

run().catch((err) => {
  console.error("FAIL", err);
  process.exit(1);
});
